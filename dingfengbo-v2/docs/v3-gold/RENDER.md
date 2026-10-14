# V3 黑金版渲染与验证

所有命令在 `dingfengbo-v2/` 执行。入口为 `src/v3g/Frame.tsx` 的 `FrameSvg({frame, fps})`，完整影片为 120 秒、1920×1080、30 fps、3600 帧。源组件和新资产就绪后再运行正式渲染。

```bash
# 从共享时间轴生成 13 章、26 条字幕及说明
node scripts/v3g/prepare.cjs

# 默认 13 个关键帧，或 --stills 3,9,16 自选原片秒数
node scripts/v3g/render.cjs --stills

# 检查样段：0–7、11–16、42–47、74–79 秒，共 22 秒／660 帧
node scripts/v3g/render.cjs --sample --jobs 3

# 全片：12 个 10 秒缓存块
node scripts/v3g/render.cjs --full --jobs 3

# 对成片做全量解码、格式、帧数、时长、faststart、响度和峰值验证
python3 scripts/v3g/verify.py
python3 scripts/v3g/verify.py --sample

# Chromium 播放、跳转和解码验证，以及成片分镜
node scripts/v3g/check-playback.cjs
node scripts/v3g/check-playback.cjs --sample
python3 scripts/v3g/storyboard.py

# 用 headless Chromium 检查正在运行的 Studio，保存页面截图和 DOM 摘要
node scripts/v3g/check-studio.cjs --composition DingFengBoV3Gold --frame 294
```

默认关键帧为 3、9、16、27、36、47、56、66、77、85、94、106、115 秒。样段区间集中在 `render.cjs` 的 `SAMPLE` 常量；调整后也须同步 `verify.py`、`check-playback.cjs` 的样段范围和总帧数。

正式输出为 `out/v3g/dingfengbo-v3-gold.mp4`，样段为 `dingfengbo-v3-gold-sample.mp4`。完整影片默认 H.264 CRF 18／fast，样段默认 CRF 20；均为 yuv420p、30 fps、faststart。`--crf` 可显式覆盖。配乐来自 `public/audio/soundtrack-v3g.m4a`，输出 AAC 256 kb/s、48 kHz、双声道。样段从对应原片时间区间裁切音频，按每帧 1600 个音频采样点拼接。

`full-record.json`／`sample-record.json` 保存源码、字体、音频、输出文件摘要及每块像素变化记录。关键帧 PNG 位于 `stills/`，联系表为 `stills-contact-sheet.png`；样段四段各保存首帧、中点和末帧，联系表为 `sample-review-contact-sheet.png`。成片分镜脚本提取实际编码视频的 26 个画面：1.8、5.7、8.2、9.8、13.5、21.5、25.5、30、34、39、44、50、54、59、62.7、68、75、79、84、88、93、97、102、107、114、117.5 秒；使用 9.8 秒「定风波」标题制作 `cover.jpg`。

`prepare.cjs` 从 `src/v3g/timeline.ts` 生成 `public/v3g/timeline.json`、`captions.json`、`captions.srt` 和 `docs/v3-gold/STORYBOARD.md`。Studio 的正式构图 ID 为 `DingFengBoV3Gold`。官印30帧、卷轴／酒杯／芒鞋各8帧，另有蓑衣1帧，共55张透明PNG和对应manifest。三维材质使用Blender Cycles原创建模渲染，重建命令为 `blender -b -t 2 --python scripts/v3g/build_assets_batch.py`。

渲染器用 esbuild 编译纯 SVG 组件，逐帧调用 ReactDOMServer → sharp/librsvg → FFmpeg。`/v3g/assets/...` 的图片引用映射到项目 `public/v3g/assets/...`，读取后内联为 data URI。组件通过 Remotion 的 `staticFile()` 生成 SVG 图片 href：Node 环境仍得到 `/v3g/...` 路径，Studio 中则带正确的静态资源前缀。`check-studio.cjs` 会逐一解码当前 SVG 引用的图片，避免页面已加载但 3D 素材缺失时误报通过。

缓存摘要使用每一帧完整的实际 SVG 内容，因此包含图片的实际字节；图像内容变更不会误用旧段。图像不允许远程 URL，缺失资产会直接报错。动画必须是 `frame` 的确定性函数，规划与实际渲染的 SVG 摘要不一致会报错。

默认两个工作进程，`--jobs` 支持 1、2、3。每个进程 sharp 和 FFmpeg 编码各限一个线程。每帧都会独立求值和栅格化，记录相邻重复像素帧数；整块完全静止时报错，`--strict-motion` 会进一步拒绝任何相邻重复帧，包括分块边界。中断后的已完成段可复用，未完成临时文件不会进入有效缓存。

字体由 `public/fonts/Serif.woff`、`Sans.woff` 转成当前输出目录的 `fonts/*.ttf`；正式字体缓存位于 `out/v3g/fonts`，夹具位于 `out/v3g/fixture/fonts`。使用真实 family `Noto Serif CJK SC` 与 `Noto Sans CJK SC`。这一流程不会更新旧版影片目录。

为控制原生 SVG 的 CPU 开销，复杂柔光、细密纸纹或重复颗粒可预制为 PNG 资产，再通过 SVG 控制透明度、位置和层次；避免整屏细小矢量 pattern 或大量模糊滤镜每帧重复计算。人物、文字和场景动画仍由当前帧决定。

## 独立夹具和依赖

```bash
node scripts/v3g/render.cjs --fixture --sample --ranges 0:0.5,3:3.5 --jobs 3 --strict-motion
```

夹具输出只进入 `out/v3g/fixture/`，不读取尚未完成的新场景或 Blender 资产。已实测 30 帧／1 秒输出，1080p30、H.264、AAC 48 kHz 双声道均通过，两个区间均无相邻重复帧。测试包含字体首次转换和自动合成夹具音频；不以首次总耗时估算正式渲染速度。

需要 Node.js 20+ 与项目现有的 esbuild、React、ReactDOM、sharp、Remotion renderer；系统需 FFmpeg/ffprobe、Fontconfig、Python 3／fontTools。分镜脚本另需 Pillow，浏览器检查使用 `/usr/bin/chromium`。验证器要求完整音轨为 −16 至 −14 LUFS、真实峰值不超过 −1 dBTP；样段验证沿用同一响度窗口。自动检查不代替实际画面审查和听音。
