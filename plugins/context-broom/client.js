window.__ModuleLoader__.load({
  id: 'dsh-context-broom',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;

    const NS = 'context-broom';
    const PKG = 'dsh-context-broom';

    //#region styles
    const STYLE_ID = PKG + '/context-broom.css';
    const css = [
      '.cb-root{flex:none;display:inline-flex;align-items:center}',
      '.cb-btn{border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);',
      'font-family:inherit;font-size:var(--dsh-content-font-size-secondary,13px);',
      'line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));white-space:nowrap;',
      'cursor:pointer;background:0 0;border:none;flex:none;align-items:center;',
      'padding:1px 5px;display:inline-flex;position:relative;',
      'transition:background .16s ease,color .16s ease}',
      '@media (hover:hover){.cb-btn:hover{background:var(--dsw-alias-interactive-bg-hover);',
      'color:var(--dsw-alias-label-secondary)}}',
      '.cb-btn:focus-visible{outline:2px solid var(--dsw-alias-border-l1);outline-offset:1px}',
      '.cb-btn[aria-busy=true]{cursor:progress}',
      '.cb-svg{display:block;overflow:visible}',
      '.cb-track{fill:none;stroke:var(--dsw-alias-border-l3);stroke-width:1.5}',
      '.cb-level{fill:none;stroke-width:1.9;stroke-linecap:round;',
      'transition:stroke .3s ease,opacity .3s ease}',
      '.cb-aura{fill:none;stroke-width:1.9;opacity:0;transition:opacity .3s ease}',
      '.cb-broom{transform-box:fill-box;transform-origin:50% 50%}',
      '.cb-cap{stroke-width:1.5;stroke-linecap:round;fill:none}',
      '.cb-bristle{stroke-width:1.15;stroke-linecap:round;fill:none}',
      '.cb-wedge{stroke:none}',
      '@keyframes cb-breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)}}',
      '@keyframes cb-nudge{0%,100%{transform:rotate(0)}35%{transform:rotate(-10deg)}68%{transform:rotate(6deg)}}',
      '@keyframes cb-sweep{0%{transform:rotate(0)}35%{transform:rotate(-26deg)}72%{transform:rotate(20deg)}100%{transform:rotate(0)}}',
      '@keyframes cb-halo{0%,100%{opacity:0}50%{opacity:.5}}',
      '.cb-t-notice .cb-broom{animation:cb-breathe var(--cb-period) ease-in-out infinite}',
      '.cb-t-warn .cb-broom{animation:cb-nudge var(--cb-period) ease-in-out infinite}',
      '.cb-t-danger .cb-broom,.cb-t-critical .cb-broom{animation:cb-nudge var(--cb-period) ease-in-out infinite}',
      '.cb-t-warn .cb-aura,.cb-t-danger .cb-aura,.cb-t-critical .cb-aura{',
      'animation:cb-halo var(--cb-period) ease-in-out infinite}',
      '.cb-t-critical .cb-aura{opacity:.35}',
      '.cb-busy .cb-broom{animation:cb-sweep .7s ease-in-out infinite}',
      '.cb-busy .cb-aura{animation:cb-halo .7s ease-in-out infinite;opacity:.4}',
      '.cb-bubble{position:fixed;z-index:1200;box-sizing:border-box;',
      'max-width:min(280px,100vw - 24px);border-radius:var(--dsw-radius-lg);',
      'background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-l1);',
      'box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);',
      'padding:7px 11px;font-size:12px;line-height:18px;pointer-events:none;',
      'font-variant-numeric:tabular-nums;animation:cb-pop .16s ease-out}',
      '.cb-bubble[data-tone=error]{color:var(--dsw-alias-label-secondary)}',
      '@keyframes cb-pop{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}',
    ].join('');
    if (typeof document !== 'undefined' &&
        document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') === null) {
      const tag = document.createElement('style');
      tag.dataset.plugin = PKG;
      tag.dataset.pluginCss = STYLE_ID;
      tag.textContent = css;
      document.head.appendChild(tag);
    }
    //#endregion

    //#region dictionaries
    const zh = {
      'button.label': '清理上下文，当前占用 {percent}%',
      'button.labelUnknown': '清理上下文',
      'hint.unknown': '清理当前会话的上下文',
      'hint.calm': '上下文占用 {percent}%，空间充裕',
      'hint.notice': '上下文已占用 {percent}%，可以清理一下',
      'hint.warn': '上下文已占用 {percent}%，建议尽快清理',
      'hint.danger': '上下文已占用 {percent}%，快要触顶了，请清理',
      'hint.critical': '上下文已占用 {percent}%，请立即清理！',
      'busy': '正在清理上下文…',
      'done': '已清理上下文 · {from}% → {to}%',
      'doneSame': '已清理上下文，当前占用 {to}%',
      'doneUnknown': '已清理上下文',
      'doneHost': '已清理 {n} 段历史（约 {size} tokens）',
      'nothing': '当前没有可清理的历史区间',
      'noSession': '这个会话还没有请求过模型，暂时没有可清理的内容',
      'noCapability': '本机未启用压缩能力：{reason}',
      'unavailable': '暂时无法清理：{reason}',
    };
    const en = {
      'button.label': 'Compact context, {percent}% used',
      'button.labelUnknown': 'Compact context',
      'hint.unknown': 'Compact this session context',
      'hint.calm': 'Context at {percent}% — plenty of room',
      'hint.notice': 'Context at {percent}% — worth cleaning up',
      'hint.warn': 'Context at {percent}% — clean up soon',
      'hint.danger': 'Context at {percent}% — nearly full, clean up now',
      'hint.critical': 'Context at {percent}% — clean up immediately!',
      'busy': 'Compacting context…',
      'done': 'Context compacted · {from}% → {to}%',
      'doneSame': 'Context compacted, now at {to}%',
      'doneUnknown': 'Context compacted',
      'doneHost': 'Compacted {n} history ranges (~{size} tokens)',
      'nothing': 'Nothing left to compact here',
      'noSession': 'This session has no model request yet, so there is nothing to compact',
      'noCapability': 'Context compaction is not available here: {reason}',
      'unavailable': 'Cannot compact right now: {reason}',
    };
    //#endregion

    //#region occupancy
    /**
     * Resolve display occupancy exactly like the core ContextMeter so the two
     * readouts can never disagree.
     */
    function occupancy(pressure) {
      const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
      if (usedTokens === undefined || pressure?.contextWindow === undefined) return null;
      return Math.min(100, Math.round(usedTokens / pressure.contextWindow * 100));
    }

    /** Green → yellow → red ramp; literal colors are artwork, not chrome. */
    const STOPS = [
      [0, [46, 191, 112]],
      [60, [240, 196, 64]],
      [100, [238, 68, 68]],
    ];
    function accentAt(percent) {
      const p = Math.max(0, Math.min(100, percent));
      for (let i = 0; i < STOPS.length - 1; i += 1) {
        const [p0, c0] = STOPS[i];
        const [p1, c1] = STOPS[i + 1];
        if (p > p1) continue;
        const k = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
        const mixed = c0.map((c, idx) => Math.round(c + (c1[idx] - c) * k));
        return 'rgb(' + mixed.join(',') + ')';
      }
      const last = STOPS[STOPS.length - 1][1];
      return 'rgb(' + last.join(',') + ')';
    }

    /** Escalation ladder: tone class, pulse period (seconds), hint key. */
    function severity(percent) {
      if (percent === null) return { tone: 'unknown', period: null, hint: 'hint.unknown' };
      if (percent >= 95) return { tone: 'critical', period: '0.95s', hint: 'hint.critical' };
      if (percent >= 85) return { tone: 'danger', period: '1.4s', hint: 'hint.danger' };
      if (percent >= 70) return { tone: 'warn', period: '2.1s', hint: 'hint.warn' };
      if (percent >= 50) return { tone: 'notice', period: '3.4s', hint: 'hint.notice' };
      return { tone: 'calm', period: null, hint: 'hint.calm' };
    }
    //#endregion

    //#region icon
    /**
     * Frame + broom glyph. The frame outline doubles as the occupancy gauge:
     * `pathLength` normalizes the rounded rect to 100 units so the dash array is
     * the percentage itself.
     */
    function BroomGlyph({ percent, accent, tone, busy }) {
      const level = percent === null ? 0 : percent;
      const className = [
        'cb-svg',
        tone === 'unknown' ? '' : 'cb-t-' + tone,
        busy ? 'cb-busy' : '',
      ].filter(Boolean).join(' ');
      const style = tone === 'unknown' ? undefined : { '--cb-period': severity(percent).period ?? '3.6s' };
      const stroke = accent;
      return h('svg', {
        className,
        style,
        width: 16,
        height: 16,
        viewBox: '0 0 16 16',
        'aria-hidden': true,
        focusable: false,
      },
        h('rect', { className: 'cb-track', x: 1.5, y: 1.5, width: 13, height: 13, rx: 3.6 }),
        percent === null ? null : h('rect', {
          className: 'cb-level',
          x: 1.5,
          y: 1.5,
          width: 13,
          height: 13,
          rx: 3.6,
          pathLength: 100,
          stroke: stroke,
          strokeDasharray: level + ' 100',
          transform: 'rotate(-90 8 8)',
        }),
        tone === 'warn' || tone === 'danger' || tone === 'critical'
          ? h('rect', {
            className: 'cb-aura',
            x: 0.6,
            y: 0.6,
            width: 14.8,
            height: 14.8,
            rx: 4.4,
            stroke: stroke,
          })
          : null,
        h('g', { className: 'cb-broom' },
          // faint wedge under the bristles
          h('path', {
            className: 'cb-wedge',
            fill: stroke,
            opacity: 0.16,
            d: 'M5.4 9.3 L8.6 10.4 L7.4 13.1 L4.2 12.2 Z',
          }),
          // handle
          h('path', { className: 'cb-cap', stroke: stroke, d: 'M10.7 3.1 L7.5 8.4' }),
          // ferrule (the binding between handle and bristles)
          h('path', { className: 'cb-cap', stroke: stroke, d: 'M5.5 8.9 L8.7 9.9' }),
          // bristles
          h('path', { className: 'cb-bristle', stroke: stroke, d: 'M5.6 9.7 L4.1 12.5' }),
          h('path', { className: 'cb-bristle', stroke: stroke, d: 'M6.6 10.1 L5.8 12.9' }),
          h('path', { className: 'cb-bristle', stroke: stroke, d: 'M7.6 10.5 L7.4 13.1' }),
        ),
      );
    }
    //#endregion

    //#region component
    /** Same-origin Host route that drives bili's proxy (see index.js). */
    const HOST_ROUTE = '/context-broom/fold';

    /** Shorten a Host reason so a bubble stays one or two lines. */
    function brief(reason) {
      if (typeof reason !== 'string' || reason === '') return 'unknown';
      const line = reason.split('\n').find((part) => part.trim() !== '') ?? reason;
      return line.length > 120 ? line.slice(0, 117) + '…' : line.trim();
    }

    /** Pull the token figure out of a Host compaction sentence. */
    function savedTokens(text) {
      const match = /~(\d+)\s*tokens?/i.exec(typeof text === 'string' ? text : '');
      return match === null ? null : Number(match[1]);
    }

    /**
     * Composer dock broom: click compacts the session. The native `/compact`
     * command is used when the Host actually registers it; in a profile where
     * billion-context has gated that command off, the click falls through to
     * the Host route that asks bili's proxy to fold the oldest ranges.
     */
    function ContextBroom({ useProjection, t, sessionId, execute, listCommands }) {
      const pressure = useProjection('contextPressure');
      const percent = occupancy(pressure);
      const percentRef = React.useRef(percent);
      percentRef.current = percent;
      const severityNow = severity(percent);
      const accent = percent === null ? 'var(--dsw-alias-label-tertiary)' : accentAt(percent);

      const [busy, setBusy] = React.useState(false);
      const [bubble, setBubble] = React.useState(null);
      const buttonRef = React.useRef(null);
      const timerRef = React.useRef(null);
      const busyRef = React.useRef(false);
      busyRef.current = busy;
      // `undefined` = not probed yet, `null` = probed and no native command.
      const commandRef = React.useRef(undefined);

      React.useEffect(() => () => {
        if (timerRef.current !== null) clearTimeout(timerRef.current);
      }, []);

      const flash = React.useCallback((text, tone) => {
        const node = buttonRef.current;
        let left = 16;
        let top = 16;
        if (node !== null) {
          const box = node.getBoundingClientRect();
          left = box.left + box.width / 2;
          top = box.top - 8;
        }
        setBubble({ text, tone: tone ?? 'info', left, top });
        if (timerRef.current !== null) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setBubble(null);
        }, 3200);
      }, []);

      const settle = React.useCallback((before) => {
        const after = percentRef.current;
        if (before !== null && after !== null && after < before) {
          flash(t('done', { from: before, to: after }), 'info');
        } else if (after !== null) {
          flash(t('doneSame', { to: after }), 'info');
        } else {
          flash(t('doneUnknown'), 'info');
        }
      }, [flash, t]);

      /**
       * Resolve the native compaction command line, if this session has one.
       * A positive answer is cached for the mount; a negative one is not, so a
       * command enabled later in the session is picked up on the next click.
       */
      const pickCommand = React.useCallback(async () => {
        if (commandRef.current !== undefined) return commandRef.current;
        let list = null;
        try {
          const reply = await listCommands(sessionId);
          if (reply !== null && reply.ok === true && Array.isArray(reply.value)) list = reply.value;
        } catch {
          list = null;
        }
        let line = null;
        if (Array.isArray(list)) {
          const names = new Set();
          for (const entry of list) {
            if (entry !== null && typeof entry === 'object' && typeof entry.name === 'string') {
              names.add(entry.name);
            }
          }
          if (names.has('compact')) line = '/compact';
          else if (names.has('compress')) line = '/compress';
        }
        if (line !== null) commandRef.current = line;
        return line;
      }, [listCommands, sessionId]);

      /**
       * Preferred path: a native compaction command, when this Host actually
       * registers one. Returns false when the command surface cannot serve it,
       * which is exactly the billion-context case (its gate disables
       * `@deepseek-ai/dsh-command-compact`, so `/compact` never resolves).
       */
      const compactNative = React.useCallback(async (before) => {
        const line = await pickCommand();
        if (line === null) return false;
        const outcome = await execute(sessionId, line);
        if (outcome === null) return false;
        if (!outcome.ok) {
          flash(t('unavailable', { reason: brief(outcome.error?.message) }), 'error');
          return true;
        }
        const payload = outcome.value;
        if (payload === undefined) return false;
        const result = payload.result;
        if (result?.kind === 'error') {
          flash(brief(result.text), 'error');
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 260));
        settle(before);
        return true;
      }, [execute, flash, sessionId, settle, t]);

      /** Fallback path: ask the Host to fold through bili's proxy channel. */
      const compactViaHost = React.useCallback(async (before) => {
        let response;
        try {
          response = await fetch(HOST_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
        } catch (error) {
          flash(t('unavailable', { reason: brief(error instanceof Error ? error.message : String(error)) }), 'error');
          return;
        }
        if (!response.ok && response.status !== 200) {
          flash(t('unavailable', { reason: 'HTTP ' + response.status }), 'error');
          return;
        }
        const body = await response.json().catch(() => null);
        if (body === null) {
          flash(t('unavailable', { reason: 'bad response' }), 'error');
          return;
        }
        if (body.ok === true) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          const tokens = savedTokens(body.text);
          if (tokens !== null) {
            flash(t('doneHost', { n: body.ranges ?? 1, size: tokens }), 'info');
          } else {
            settle(before);
          }
          return;
        }
        if (body.kind === 'nothing') {
          flash(t('nothing'), 'info');
          return;
        }
        if (body.kind === 'no-session') {
          flash(t('noSession'), 'info');
          return;
        }
        if (body.kind === 'no-bili') {
          flash(t('noCapability', { reason: brief(body.reason) }), 'error');
          return;
        }
        flash(t('unavailable', { reason: brief(body.reason ?? body.text) }), 'error');
      }, [flash, sessionId, settle, t]);

      const onClick = React.useCallback(async () => {
        if (busyRef.current) return;
        const before = percentRef.current;
        setBusy(true);
        setBubble(null);
        try {
          if (await compactNative(before)) return;
          await compactViaHost(before);
        } catch (error) {
          flash(t('unavailable', { reason: error instanceof Error ? error.message : String(error) }), 'error');
        } finally {
          setBusy(false);
        }
      }, [compactNative, compactViaHost, flash, t]);

      const label = percent === null
        ? t('button.labelUnknown')
        : t('button.label', { percent });
      const hint = percent === null ? t('hint.unknown') : t(severityNow.hint, { percent });
      const title = busy ? t('busy') + '\n' + hint : hint;

      return h('div', { className: 'cb-root', style: { order: 1 } },
        h('button', {
          ref: buttonRef,
          type: 'button',
          className: 'cb-btn',
          'aria-label': label,
          'aria-busy': busy ? 'true' : 'false',
          title,
          onClick,
        }, h(BroomGlyph, { percent, accent, tone: severityNow.tone, busy })),
        bubble === null ? null : ReactDOM.createPortal(
          h('div', {
            className: 'cb-bubble',
            'data-tone': bubble.tone,
            role: 'status',
            'aria-live': 'polite',
            style: {
              left: bubble.left,
              top: bubble.top,
              transform: 'translate(-50%,-100%)',
            },
          }, bubble.text),
          document.body,
        ),
      );
    }
    //#endregion

    return {
      // Same service set the core command UI runs on: the Host command channel
      // is reached through `ctx.remote.commands`, never by re-implementing it.
      inject: ['slots', 'locale', 'remote', 'remote.commands'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'context-broom: dictionaries');

        const execute = (sessionId, line) => {
          const remote = ctx.remote;
          if (remote === undefined || remote.commands === undefined) {
            return Promise.resolve(null);
          }
          return remote.commands.execute(sessionId, line, []);
        };

        const listCommands = (sessionId) => {
          const remote = ctx.remote;
          if (remote === undefined || remote.commands === undefined) {
            return Promise.resolve(null);
          }
          return remote.commands.list(sessionId);
        };

        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'context-broom',
          order: 2,
          locale: NS,
          inject: () => ({ execute, listCommands }),
        }, ContextBroom));
      },
    };
  },
});
