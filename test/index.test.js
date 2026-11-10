import test from 'node:test';
import assert from 'node:assert/strict';
import { textStats, formatStats, topWord } from '../src/index.js';

test('textStats: 空文本', () => {
  assert.deepEqual(textStats(''), {
    chars: 0, words: 0, lines: 0, uniqueWords: 0,
  });
});

test('textStats: 按 Unicode 码点计算字符，emoji 不被拆成两半', () => {
  const s = textStats('a😀b');
  assert.equal(s.chars, 3);
});

test('textStats: 中英文混排与换行', () => {
  const s = textStats('Hello 世界\nhello 世界 2026');
  assert.equal(s.lines, 2);
  assert.equal(s.words, 5);
  assert.equal(s.uniqueWords, 3); // hello / 世界 / 2026
});

test('textStats: CRLF 与 CR 都算一个换行', () => {
  assert.equal(textStats('a\r\nb').lines, 2);
  assert.equal(textStats('a\rb').lines, 2);
});

test('textStats: null/undefined 视为空文本', () => {
  assert.equal(textStats(null).chars, 0);
  assert.equal(textStats(undefined).words, 0);
});

test('formatStats: 完整一行', () => {
  assert.equal(
    formatStats({ chars: 3, words: 2, lines: 1, uniqueWords: 2 }),
    'chars=3 words=2 lines=1 uniqueWords=2',
  );
});

test('topWord: 大小写不敏感，返回最高频', () => {
  assert.deepEqual(topWord('Apple apple banana APPLE'), { word: 'apple', count: 3 });
});

test('topWord: 空文本返回 null', () => {
  assert.equal(topWord('   '), null);
});
