# pro-202611

> 2026 年 11 月开的坑，方向还没定。先放一个零依赖、能跑能测的最小骨架，
> 之后想到要做什么，直接把 `src/index.js` 换成真正的业务逻辑即可。

## 环境

- Node.js >= 18（项目用 ESM，`"type": "module"`）
- 不需要 `npm install`，没有任何第三方依赖

## 快速开始

```bash
npm test          # 跑测试，等价于 node --test
npm start         # 从 stdin 读文本
node src/cli.js README.md   # 统计某个文件
```

也可以当库用：

```js
import { textStats, formatStats, topWord } from './src/index.js';

console.log(formatStats(textStats('Hello 世界 hello')));
// chars=17 words=3 lines=1 uniqueWords=2
```

## 现在有什么

| 文件 | 作用 |
|---|---|
| `src/index.js` | 纯函数核心：`textStats` / `formatStats` / `topWord` |
| `src/cli.js` | 命令行入口，读文件或 stdin |
| `test/index.test.js` | `node:test` 单元测试，覆盖空文本、Unicode、CRLF、高频词 |
| `.gitignore` | Node / 编辑器 / 本地环境忽略规则 |

## 目录约定

- `src/` — 源码
- `test/` — 测试，文件名 `*.test.js`
- 新增功能请顺手在 `test/` 里加一条断言

## 关于「还没想好」

骨架故意保持很小：不引入框架、不接数据库、不写构建流程。
等目标明确后，再决定是长成 CLI 工具、库、服务还是别的东西。
