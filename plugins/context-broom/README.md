# Context Broom · 上下文清理扫帚

一个 DSH Web GUI 小插件：在会话输入框下方的状态行里、上下文占用读数右侧，增加一枚 **扫帚按钮**。
按钮外框本身就是占用比例的可视化，点击即可压缩当前会话上下文。

## 功能

- **位置**：注册到 `conversation.composer.dock`（list, session scope），`order: 2`，外层 `order: 1` 让它排在核心 ContextMeter 右侧。
- **占用可视化**：外框圆角矩形用 `pathLength=100` + `strokeDasharray` 直接画出占用百分比，与核心读数完全同源（`contextPressure.projectedTokens ?? pressureTokens / contextWindow`），两者不会打架。
- **颜色随占用变化**：绿 `rgb(46,191,112)` → 黄 `rgb(240,196,64)` → 红 `rgb(238,68,68)`，线性插值。
- **语气与频率分级**：
  | 占用 | 语气 | 动效周期 |
  | --- | --- | --- |
  | < 50% | 空间充裕 | 不动画 |
  | ≥ 50% | 可以清理一下 | 3.4s 呼吸 |
  | ≥ 70% | 建议尽快清理 | 2.1s 摆动 |
  | ≥ 85% | 快要触顶 | 1.4s 摆动 + 光晕 |
  | ≥ 95% | 请立即清理！ | 0.95s 摆动 + 光晕 |
- **点击交互**：扫帚扫动动画 + `aria-busy`，随后按下面的顺序尝试真正可用的压缩通道，结果以小气泡（portal 到 `document.body`，`role="status"`）显示，3.2 秒后自动消失。

## 点击后的通道顺序

1. **原生命令优先**：先 `ctx.remote.commands.list(sessionId)` 查目录；只有 `compact`（或 `compress`）真的被注册时，才 `ctx.remote.commands.execute(sessionId, '/compact')`。
2. **bili 代理兜底**：本 profile 里 billion-context 的 `bili-compaction-gate` 会强制禁用
   `@deepseek-ai/dsh-command-compact` 与 `@deepseek-ai/dsh-compaction-basic`（`__BILI_DSH_COMPACTION_VERDICT__ = "active"`），
   所以 `/compact` 永远解析不到。此时 Client 不再发注定失败的斜杠命令，而是调用本插件 Host 半边的同源路由
   `POST /context-broom/fold`；Host 侧解析 `/bili/origin` 得到代理地址，读 `/__bili/plugin/status` 拿到
   `compressibleRanges`，再对最老旧、且不含用户消息的区间（最多 4 段）发 `/__bili/plugin/tool` 的
   `tool:"compress"`。
3. **诚实降级**：连 bili 都不在（`kind:"no-bili"`）、会话还没走过一次模型请求（`kind:"no-session"`）
   或没有可折叠区间（`kind:"nothing"`）时，气泡直接说明原因，不再出现含糊的 `unknown or malformed command`。

> 该 profile 没有配置 `externalSummary`，bili 的 `compress` 需要每段自带 `summary`。
> Host 半边的 `summaryFor(range)` 用 status 返回的真实元数据（ref 区间、条数、token、工具/文本占比）
> 生成摘要文本，并注明"原文可用 decompress 按 ref 恢复"——可读、可回查，而不是编造的正文。

## 安装

从应用市场安装，或直接指向仓库子目录：

```
moluotianshen/pro-202611#context-broom
```

本地开发时用目录安装（链接方式，改 Client 文件后刷新页面即可；改 Host 文件后需要 `dsh_hot_reload` 或重启）：

```js
plugin_manager({ action: 'install_bundle', target: 'E:\\dshSpace\\plugins\\context-broom' })
```

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 半边：注册同源路由 `/context-broom/fold`，服务端完成 bili 代理压缩 |
| `client.js` | 全部渲染、动效、命令探测与派发 |
| `cordis.patch.yml` | 插入 `context-broom` 条目 |
| `locale/zh.json` / `locale/en.json` | 插件行的标题与描述 |
| `icon.svg` | 插件列表图标（64×64，外框即占用仪表） |

## 说明

- 只使用 `react` / `react-dom` 两个浏览器模块表内的包，不引用任何 Harness Client 内部包。
- 颜色只用于图标「画作」部分；按钮底色、文字、气泡均使用 `--dsw-*` 设计令牌。
- Host 路由拒绝非 POST（405）、拒绝跨站请求（`sec-fetch-site` 不是 `same-origin`/`none` 时 403）、缺少 `sessionId` 时 400。
- 压缩命令失败（例如已有压缩在进行、或 agent 不空闲）会原样显示原因，不静默吞掉。
