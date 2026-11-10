#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { textStats, formatStats, topWord } from './index.js';

const args = process.argv.slice(2);
const file = args[0];

async function main() {
  let text;
  if (file) {
    text = await readFile(file, 'utf8');
  } else if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    text = Buffer.concat(chunks).toString('utf8');
  } else {
    text = '';
  }

  const stats = textStats(text);
  console.log(formatStats(stats));
  const top = topWord(text);
  if (top) console.log(`topWord=${top.word} (${top.count})`);
}

main().catch((err) => {
  console.error(`pro-202611: ${err.message}`);
  process.exitCode = 1;
});
