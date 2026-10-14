# 原生 SVG 逐帧渲染

在项目根目录执行，入口为 `src/v3r/Frame.tsx` 导出的 `FrameSvg({frame, fps})`。此组件必须是帧编号的确定性纯函数，返回完整的 1920×1080 SVG。脚本会用 esbuild 编译服务器入口，逐帧调用 ReactDOMServer，再由 sharp/librsvg 栅格化为 RGBA，通过管道送入 FFmpeg。每个输出帧均独立计算和栅格化，没有静态镜头替代或整幅推拉回退。

```bash
# 关键帧，时间以原片秒数计算
node scripts/v3r/render.cjs --stills 1.4,5.5,9,15,20.6,25.5,30,35,40,45.5,51.5,60,63,69.6,74,82,91,100,103.5,108,115

# 25 秒、750 帧样段：38–43、49–54、68–73、82–92 秒，端点采用左闭右开
node scripts/v3r/render.cjs --sample --jobs 2

# 完整 120 秒、3600 帧；本环境可用三个工作进程
node scripts/v3r/render.cjs --full --jobs 3

# 要求所有相邻帧像素均不相同，包含分块拼接边界
node scripts/v3r/render.cjs --sample --jobs 2 --strict-motion
```

输出位于 `out/v3r/`：

- `dingfengbo-v3-remake.mp4`：完整影片，H.264 CRF 18、fast preset、1920×1080、30 fps、yuv420p、BT.709 标记。
- `dingfengbo-v3-remake-sample.mp4`：25 秒样段，默认 CRF 20；可用 `--crf 18` 调整。
- `stills/` 与 `stills-contact-sheet.png`：指定秒数的原始 PNG 和审查联系表。
- `sample-review/` 与 `sample-review-contact-sheet.png`：样段四个区间的首帧、中点、末帧，共 12 个审查画面；标签注明原片秒数和帧编号。
- `full-record.json` / `sample-record.json`：源码摘要、字体摘要、音频摘要、分段记录、相邻重复帧统计、最终 ffprobe 检查和输出 SHA-256。

音频取自 `public/audio/soundtrack-v3r.m4a`。样段严格从同一组原片区间裁切音频，先重采样到 48 kHz，再以每视频帧 1600 个音频采样点裁切，重新拼接和编码为 AAC 256 kb/s、48 kHz、双声道。视频编码段在最终封装时直接复制，输出写入 faststart。结束前检查尺寸、帧率、视频总帧数、音视频时长、编码、声道和采样率。

默认并发为两个独立 Node 工作进程，各自 `sharp.concurrency(1)`、FFmpeg 单编码线程。`--jobs` 接受 1、2 或 3。本次四 CPU／32 GiB 环境实测，每个工作进程的 SVG 栅格化约使用一个 CPU，编码只增加少量占用，因此完整导出可用 `--jobs 3`。全片按 10 秒切成 12 块，样段按四个源区间切块。中断后可重跑同一命令：完成的缓存段会复用，未完成段重新渲染。

每块缓存摘要包含**全部帧的实际 SVG 内容**、内联图像内容、本地字体、原生栅格化/编码实现、Node/React/sharp/FFmpeg 版本及编码参数。源码摘要另外记录用于追溯；修改某个场景文字时，SVG 内容未变化的其他块仍可复用。缓存复用前还校验编码段的完整文件 SHA-256。修改字体文件、共享渲染器或编码参数会使涉及这些全局输入的缓存失效。缓存不会仅凭文件名或修改时间判断。

渲染时计算每帧 RGBA 摘要，记录实际像素序列的摘要和相邻重复帧数。整块所有帧完全相同时直接报错；`--strict-motion` 进一步拒绝任何相邻重复帧。SVG 字符串在规划和实际渲染时的摘要必须相同，可检测随机数、当前时间或渲染期间输入变更造成的不确定性。报错或中断时清理未完成的编码段，不会将其标记为有效缓存。

## 字体与依赖

已使用项目现有依赖，无需改动 `package.json`：Node.js（建议 20+）、`esbuild`、`react`、`react-dom`、`sharp`；系统需 FFmpeg/ffprobe（含 libx264/AAC）、Fontconfig（`fc-cache`、`fc-match`）、Python 3 与 `fontTools`。

`public/fonts/Serif.woff`、`Sans.woff` 通过 fontTools 转成 `out/v4/fonts/Serif.ttf`、`Sans.ttf`。脚本生成独立的 `out/v3r/fonts.conf` 和可写字体缓存，实际验证字体命中本地文件。组件应使用字体真实 family：`Noto Serif CJK SC`、`Noto Sans CJK SC`。原字体变更会触发重新转换。`--fixture` 的字体配置和输出单独置于 `out/v3r/fixture/`。

原生 SVG 不支持 Remotion hooks、HTML `foreignObject` 或浏览器脚本。所有动画通过传入的 `frame` 和 `fps` 求值。`<image>` 可用 data URI，或相对于 `public/` 的本地路径，渲染器会读取并内联；不允许远程图像。CSS/SVG 效果以 librsvg 的实际支持为准，交付前应检查联系表。

## 纸纹理缓存与性能

`Environment.tsx` 原有的纸纹理是覆盖整屏的固定 SVG pattern。它保持完全相同的纹理图案，但预先栅格化为 `public/v3r/paper.png`（1920×1080、透明、14,103 字节），并生成 `src/v3r/paper-data.ts` 内联到共享 SVG。环境最后的纹理层继续使用原有 `.45` 透明度和 Stage 变换。只有这层固定纸纹理缓存为 PNG；场景几何、角色关节、天气、文字和镜头仍逐帧计算。

运行 `node scripts/v3r/paper.cjs` 可从 `Environment.tsx` 中保留的原始 pattern 重建；`prepare.cjs` 也会自动调用。纹理数据参与实际 SVG 摘要，因此纹理变更会使相关视频缓存失效。

本机对 51 秒和 88 秒帧做原生栅格化测试：纸纹理优化前分别约 1.07–1.39 秒和 0.82–0.85 秒，优化后约 0.32–0.44 秒和 0.27 秒。原图和缓存版本约 1.07% 像素有细微纸纹边缘插值差异，平均绝对通道差为 0.0086–0.0113／255，最大差 9–10／255；动画内容与布局完全相同。

`scripts/v3r/browser-render.cjs` 是保留的浏览器备选，支持 `--benchmark --frames 1470:1529`、`--sample`、`--full`，写入独立的 `out/v3r/browser/`。原版纸纹理的 60 帧浏览器实测耗时 66.3 秒（双页并发，另有 33.3 秒打包），因此本次完整导出选择优化后的原生渲染器。

## 独立夹具与诊断

```bash
# 简短通路验证，不覆盖正式影片
node scripts/v3r/render.cjs --fixture --sample --ranges 0:1,3:4 --jobs 2 --strict-motion

# 用移动矢量夹具测试完整 25 秒样段区间与音频裁切
node scripts/v3r/render.cjs --fixture --sample --jobs 2 --strict-motion

# 自定义组件入口或音频仅用于诊断
node scripts/v3r/render.cjs --fixture --stills 0,1 --entry scripts/v3r/fixture.tsx
```

夹具含逐帧改变的矢量图形、中文文字和原片帧编号，并自动合成 120 秒连续变频音频。输出只在 `out/v3r/fixture/`，不会被正式影片使用。`--ranges` 仅限夹具样段模式，正式 `--sample` 始终使用要求的四个时间区间。

2026-10-14 通路验证：1080p 夹具完成 750 帧／25 秒渲染，四块合计零相邻重复帧，耗时 64.3 秒；按区间逐段解码比较音频，48 kHz 共 1,200,000 个采样，相关系数均超过 0.99999。该次夹具测试使用调整前的 38–45、49–55、68–73、80–87 秒，随后正式样段按审查需要更新为上面的区间。另完成正式组件 21 张关键帧审查，中文字体和图层正常。缓存变更测试中，仅修改夹具首区间的图形颜色，首块重新渲染、另一块成功复用。缺失 FFmpeg、FFmpeg 立即失败及渲染中 SIGTERM 三项故障测试均能退出并清理临时视频。
