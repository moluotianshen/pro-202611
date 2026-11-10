/**
 * 极小的文本统计工具：还没想好项目具体做什么，先放一个能跑的核心。
 * 纯函数，无第三方依赖，方便后续替换成真正的业务逻辑。
 */

/**
 * 统计一段文本的基本信息。
 * @param {string} text 输入文本
 * @returns {{ chars: number, words: number, lines: number, uniqueWords: number }}
 */
export function textStats(text) {
  const value = text ?? '';
  const chars = [...value].length; // 按 Unicode 码点计，避免拆散 emoji
  const words = value.match(/[\p{L}\p{N}]+/gu) ?? [];
  const lines = value.length === 0 ? 0 : value.split(/\r\n|\r|\n/).length;
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  return { chars, words: words.length, lines, uniqueWords };
}

/**
 * 把统计结果格式化成人类可读的一行。
 * @param {ReturnType<typeof textStats>} stats
 * @returns {string}
 */
export function formatStats(stats) {
  return `chars=${stats.chars} words=${stats.words} lines=${stats.lines} uniqueWords=${stats.uniqueWords}`;
}

/**
 * 找出文本里出现频率最高的词（并列时按首次出现顺序）。
 * @param {string} text
 * @returns {{ word: string, count: number } | null}
 */
export function topWord(text) {
  const words = (text ?? '').match(/[\p{L}\p{N}]+/gu) ?? [];
  if (words.length === 0) return null;
  const counts = new Map();
  for (const raw of words) {
    const word = raw.toLowerCase();
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  let best = null;
  for (const [word, count] of counts) {
    if (best === null || count > best.count) best = { word, count };
  }
  return best;
}
