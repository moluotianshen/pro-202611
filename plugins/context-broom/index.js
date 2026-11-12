/**
 * Host half of the context-broom bundle.
 *
 * The Client half cannot compact on its own: in a profile where the native
 * `/compact` command is unavailable (billion-context force-disables
 * `@deepseek-ai/dsh-command-compact`), the only remaining channel is bili's
 * proxy, and the browser cannot read that cross-origin response. So this half
 * exposes one same-origin route that performs the whole exchange server-side.
 */

/**
 * Route served on the DSH web server; the Client half calls it same-origin.
 * The web server keys routes by exact path and throws on a duplicate, so an
 * orphan left behind by an earlier build of this plugin would block a new
 * registration. The name is therefore versioned per protocol revision.
 */
const ROUTE = '/context-broom/fold';

/** Where bili's proxy lives when the host relay cannot answer. */
const BILI_FALLBACK_ORIGIN = 'http://127.0.0.1:18787';

/** Never fold more than a handful of ranges per click. */
const MAX_RANGES = 4;

/** bili rejects a range summary shorter than this. */
const MIN_SUMMARY_CHARS = 50;

const STATUS_TIMEOUT_MS = 5000;
const COMPACT_TIMEOUT_MS = 20000;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchJson(url, init, timeoutMs) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  const text = await response.text();
  try {
    return { status: response.status, body: JSON.parse(text) };
  } catch {
    return { status: response.status, body: undefined, text };
  }
}

/**
 * Resolve bili's proxy base. The host web server already relays `/bili/origin`
 * for the bili Client half, so ask it first instead of hard-coding a port.
 * The request's own Host header is used rather than the captured service, so a
 * hot reload that disposes this fiber cannot leave a dead closure behind.
 */
async function resolveProxyBase(req) {
  const host = typeof req.headers.host === 'string' && req.headers.host !== ''
    ? req.headers.host
    : '127.0.0.1';
  try {
    const relay = new URL('/bili/origin', 'http://' + host);
    const probe = await fetchJson(relay.href, { headers: { accept: 'application/json' } }, 2500);
    const origin = probe.body?.origin;
    if (typeof origin === 'string' && origin !== '') return origin.replace(/\/+$/, '');
  } catch {
    // no bili host half registered, or the relay refused: fall through
  }
  return BILI_FALLBACK_ORIGIN;
}

function kilobytes(tokens) {
  const value = typeof tokens === 'number' && Number.isFinite(tokens) ? tokens : 0;
  return value >= 1000 ? (value / 1000).toFixed(1) + 'K' : String(Math.round(value));
}

/**
 * bili's `compress` tool needs a summary per range, and this profile configures
 * no external summarizer. Build one from what the status endpoint actually
 * reports — the shape of the range plus how to get the original text back —
 * which is honest rather than fabricated prose.
 */
function summaryFor(range) {
  const top = [
    typeof range.toolPct === 'number' ? '工具输出 ' + range.toolPct + '%' : '',
    typeof range.textPct === 'number' ? '文本 ' + range.textPct + '%' : '',
  ].filter(Boolean).join('、');
  const head = range.startRef + '–' + range.endRef + '（' + (range.count ?? 0) + ' 条消息，约 '
    + kilobytes(range.tokens) + ' tokens' + (top === '' ? '' : '，' + top) + '）';
  const tail = '：已由「上下文清理」按钮归档，原文可用 decompress 按 ref 恢复。';
  let text = head + tail;
  if (text.length < MIN_SUMMARY_CHARS) {
    text += '该区间不含用户消息，折叠以压缩历史工具输出为主。';
  }
  if (text.length < MIN_SUMMARY_CHARS) {
    text += '如需细节请恢复对应 block。';
  }
  return text;
}

/**
 * Ask bili to fold the oldest compressible ranges of one session.
 * @returns {Promise<object>} a JSON-able outcome for the Client half.
 */
async function compactViaBili(req, sessionId) {
  const base = await resolveProxyBase(req);
  const statusUrl = base + '/__bili/plugin/status?conversationId=' + encodeURIComponent(sessionId);
  let status;
  try {
    status = await fetchJson(statusUrl, { headers: { accept: 'application/json' } }, STATUS_TIMEOUT_MS);
  } catch (error) {
    return {
      ok: false,
      kind: 'no-bili',
      reason: 'bili proxy unreachable at ' + base + ' (' + (error instanceof Error ? error.message : String(error)) + ')',
    };
  }
  if (status.status === 404) {
    // bili is up but has never seen this session id; folding is impossible
    // until one model request has gone through it.
    return {
      ok: false,
      kind: 'no-session',
      reason: typeof status.body?.error === 'string' ? status.body.error : 'session unknown to bili',
    };
  }
  if (status.status !== 200 || status.body?.ok !== true) {
    const reason = typeof status.body?.error === 'string' ? status.body.error : 'bili status HTTP ' + status.status;
    return { ok: false, kind: 'no-bili', reason };
  }

  const ranges = Array.isArray(status.body.compressibleRanges)
    ? status.body.compressibleRanges
      .filter((range) => range !== null && typeof range === 'object'
        && range.userMsgs === 0
        && typeof range.startRef === 'string'
        && typeof range.endRef === 'string')
      .slice(0, MAX_RANGES)
    : [];
  if (ranges.length === 0) {
    return { ok: false, kind: 'nothing', reason: 'no compressible range' };
  }

  const beforeTokens = typeof status.body.contextTokens === 'number' ? status.body.contextTokens : null;
  const payload = {
    conversationId: typeof status.body.conversationId === 'string' ? status.body.conversationId : sessionId,
    tool: 'compress',
    args: {
      content: ranges.map((range) => ({
        startRef: range.startRef,
        endRef: range.endRef,
        summary: summaryFor(range),
      })),
    },
  };
  const result = await fetchJson(base + '/__bili/plugin/tool', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }, COMPACT_TIMEOUT_MS);
  const body = result.body ?? {};
  const text = typeof body.result === 'string' ? body.result : '';
  if (body.outcome === 'applied') {
    return {
      ok: true,
      kind: 'applied',
      blocks: body.blocksCreated ?? 0,
      ranges: ranges.length,
      beforeTokens,
      text,
    };
  }
  return {
    ok: false,
    kind: body.outcome === 'refused' ? 'refused' : 'failed',
    reason: typeof body.error === 'string' ? body.error : text,
    text,
  };
}

/**
 * A page from another origin must not be able to fold a session just by
 * pointing a form or fetch at this route. Chromium sets `sec-fetch-site`;
 * when it says anything but same-origin, refuse.
 */
function crossSite(req) {
  const site = req.headers['sec-fetch-site'];
  if (typeof site === 'string' && site !== 'same-origin' && site !== 'none') return true;
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin === 'string' && origin !== '' && typeof host === 'string' && host !== '') {
    try {
      return new URL(origin).host !== host;
    } catch {
      return true;
    }
  }
  return false;
}

/** @param ctx - Host plugin context. */
export function apply(ctx) {
  ctx.inject(['webServer'], (scope) => {
    // Disposing the fiber must also release the route, otherwise a hot reload
    // leaves an orphan handler on the shared web server.
    scope.effect(() => scope.webServer.register({
      kind: 'exact',
      path: ROUTE,
      handler: async (req, res) => {
        try {
          if (crossSite(req)) {
            sendJson(res, 403, { ok: false, kind: 'forbidden', reason: 'cross-site request' });
            return;
          }
          if (req.method !== 'POST') {
            sendJson(res, 405, { ok: false, kind: 'method', reason: 'POST required' });
            return;
          }
          let sessionId = '';
          const target = new URL(req.url ?? ROUTE, 'http://localhost');
          sessionId = target.searchParams.get('sessionId') ?? '';
          try {
            const parsed = JSON.parse((await readBody(req)) || '{}');
            if (typeof parsed.sessionId === 'string') sessionId = parsed.sessionId;
          } catch {
            // a malformed body just leaves sessionId from the query string
          }
          if (sessionId === '') {
            sendJson(res, 400, { ok: false, kind: 'bad-request', reason: 'sessionId is required' });
            return;
          }
          sendJson(res, 200, await compactViaBili(req, sessionId));
        } catch (error) {
          sendJson(res, 500, {
            ok: false,
            kind: 'failed',
            reason: error instanceof Error ? error.message : String(error),
          });
        }
      },
    }), 'context-broom: compact route');
  });
}
