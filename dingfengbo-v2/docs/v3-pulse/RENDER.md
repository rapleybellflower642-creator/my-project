# V3 Pulse 渲染与验证

在 `dingfengbo-v2/` 执行以下命令。正式入口为 `src/v3p/Frame.tsx` 的 `FrameSvg({frame, fps})`，构图 ID 为 `DingFengBoV3Pulse`。完整影片固定 120 秒、1920×1080、30 fps、3600 帧。

```bash
node scripts/v3p/prepare.cjs
node scripts/v3p/render.cjs --stills
node scripts/v3p/render.cjs --stills 3,9,16,45,75
node scripts/v3p/render.cjs --sample --jobs 3
node scripts/v3p/render.cjs --full --jobs 3
python3 scripts/v3p/verify.py --sample
python3 scripts/v3p/verify.py
node scripts/v3p/check-playback.cjs --sample
node scripts/v3p/check-playback.cjs
python3 scripts/v3p/verify-motion.py --sample
python3 scripts/v3p/verify-motion.py
python3 scripts/v3p/storyboard.py
node scripts/v3p/check-studio.cjs --frame 294
```

样段拼接原片 **0–10、40–50、70–80 秒**，共 30 秒／900 帧；配乐按相同源时间裁切，每个视频帧对应 1600 个 48 kHz 音频采样点。完整影片分为 12 个 10 秒缓存块。先运行样段审查，再运行全片；只要源码、资产、字体与工具未变，全片会直接复用样段对应的第 1、5、8 块，不重复栅格化。两次使用相同 CRF（默认均为 18），且全片始终按 0–120 秒原始顺序拼接。样段范围位于 `render.cjs`、`verify.py` 与 `check-playback.cjs`，调整时须同步。

输出为 `out/v3p/dingfengbo-v3-pulse.mp4`，样段为 `dingfengbo-v3-pulse-sample.mp4`。音轨读取 `public/audio/soundtrack-v3p.m4a`。全片与样段默认 H.264 CRF 18／fast；均为 yuv420p、faststart，AAC 256 kb/s、48 kHz、双声道。`--crf` 可显式覆盖，保持 1080p 输出。

`full-record.json`／`sample-record.json` 记录源文件、字体、音频及成片摘要、每块的缓存情况与像素变化。关键帧和联系表在 `stills/` 与 `stills-contact-sheet.png`；样段每段首帧、中点、末帧组成 `sample-review-contact-sheet.png`。`storyboard.py` 读取 `public/v3p/edit-grid.json`，从实际成片提取每个镜头的中间帧（当前 52 张），封面使用最后一个标题镜头的中间帧。

`verify-motion.py` 从实际 MP4 测量每个预定切点前后帧的 RGB 差值，并检查镜头中点的亮度；全片检查 51 个切点。完全相同的切点帧会失败，近重复与近全黑帧单列提醒。这些测量不代表主观节奏、镜头语义或声画卡点已经通过；样段源时间范围有变动时，也须同步该脚本。

路径揭示与移动亮线使用 `@remotion/paths` 测量真实路径长度，再将虚线段长和偏移换算成像素。最终 MP4 复查发现原生 SVG 导出对 `pathLength="1"` 的归一化虚线表现不一致，因此相关镜头已改为明确像素值；不能用其他元素造成的非零帧差来替代对路径动画本身的检查。

## 原生 SVG 与缓存

esbuild 编译入口后，每帧通过 ReactDOMServer → sharp/librsvg → FFmpeg。图片必须来自项目 `public/`，渲染器将其内联为 data URI；外部 URL 或缺失图片会直接失败。组件中的 `staticFile()` 在 Node 保留本地路径，在 Studio 生成静态资源前缀。`check-studio.cjs` 会解码当前 SVG 的实际图片引用，同时保存浏览器页面截图与字体状态。

缓存键包含每一帧的完整 SVG、图片实际字节、字体、渲染脚本、媒体工具版本和编码参数。画面有变化的区间会重渲染；已完成、摘要匹配的块可复用。动画必须由 `frame` 确定，规划与工作进程的 SVG 摘要不同会报错。每帧均独立求值与栅格化，不冻结人物、文字、天气或镜头动画。

默认 `--jobs 2`，支持 1、2、3；sharp 与 FFmpeg 编码分别限制单线程。整块像素完全不变时失败；`--strict-motion` 还会拒绝任何相邻重复帧及分块边界重复。中断时的临时文件不会进入有效缓存。

字体从 `public/fonts/Serif.woff`、`Sans.woff` 转成 `out/v3p/fonts/*.ttf`，使用 `Noto Serif CJK SC`、`Noto Sans CJK SC` 的真实 family。V3 Pulse 的脚本、缓存和输出独立于旧版本。

静态层缓存必须保持图层顺序、透明度和完整分辨率，移动渐变及遮罩不能擅自冻结。新源的 3、45、77 秒小样比较了完整 SVG 与缓存静态 RGBA 后合成动态前景：平均 CPU 1083→976 ms，仅省约 10%，且存在最多 2/255 的合成舍入差，因此未采用。40 MB 字体缩成约 138 KB 的子集后，三个样本逐像素一致，但没有栅格提速，也未采用。原生 Skia SVG 试验存在可见渲染差异，未纳入正式管线。正式输出继续使用完整字体与原来的 sharp/librsvg 栅格器。

标准 Remotion 浏览器基准也未发现优势：对冻结源码的历史段 450–473 帧（24 帧），`/usr/bin/chromium`、双并发、无音频、PNG 中间帧、CRF 18 的渲染耗时 39.84 秒；跳过最初 4 帧后的稳态速度为 1.05 fps。相同 24 帧的原生双进程渲染耗时 9.58 秒，即 2.50 fps，未出现相邻重复。单独统计的打包、浏览器启动、选择构图分别为 27.35、2.01、4.21 秒，未计入以上逐帧渲染时间。第 450 帧目视的文字、几何与构图一致，细纹理存在栅格器差异，因此维持原生管线。

此基准可用 `node scripts/v3p/browser-benchmark.cjs --bundle-only` 和 `--run` 两阶段重现，结果只进入 `out/v3p/browser-benchmark/`；脚本固定 24 帧，并在源文件变化时拒绝比较。它不会生成正式样段或全片。

上述性能基准在路径动画兼容性修复之前执行，仅记录历史诊断，不代表修复后源码的速度或逐帧视觉一致性。正式交付以最新 `full-record.json`、实际 MP4 和验证报告为准。

## 夹具与依赖

```bash
node scripts/v3p/render.cjs --fixture --sample --ranges 0:0.2,3:3.2 --jobs 2 --strict-motion
```

该夹具输出只进入 `out/v3p/fixture/`，不读取新场景或正式素材。已验证 12 帧／0.4 秒输出，1080p30、H.264、AAC 48 kHz 双声道及相邻帧运动检查通过；重复执行时两块均命中缓存。另用同一夹具逐帧规划默认 900 帧样段与 3600 帧全片，确认样段三块的缓存键和文件路径分别等于全片第 1、5、8 块，全片拼接仍按时间排序。首次运行包含字体转换及夹具音频合成，不能据此推算正式渲染速度。

依赖现有 Node.js 20+、esbuild、React、ReactDOM、sharp、Remotion renderer，系统 FFmpeg／ffprobe、Fontconfig、Python 3／fontTools。分镜还需 Pillow，浏览器检查使用系统 Chromium。媒体验证器完整解码成片并检查帧数、时长、格式、faststart、−16 至 −14 LUFS 和不高于 −1 dBTP 的真实峰值；样段采用同一响度窗口。卡点与字幕位置仍需实际观看和听音确认。
