## 最新：V3 重做版

120 秒完整 1080p 成片，按确认提示词重新设计文字和人物动作。Studio 选择 **DingFengBoV3Remake**。

[制作与导出](./docs/v3-remake/README.md) · [分镜与文案](./docs/v3-remake/STORYBOARD.md) · [成片交付](../film-v3-remake/README.md)

# 定风波：风雨有时，脚步由你

> 历史 V4 长片为 **DingFengBoV4**：根据完整长文案制作，9 分 54 秒、1080p，无旁白，循环配乐。见 [V4 操作与导出说明](docs/V4_README.md) 和 [完整分镜](docs/V4_STORYBOARD.md)。`npm run render:v4` 导出该版本；下文保留 V3／V2 的历史说明。

> 本工程已新增 **DingFengBoV3** 审阅合成。新版以苏轼生平和遇雨处境组织故事，保留两分钟和原配乐，增加人物及环境变化，去除指定署名小字。见 [V3 分镜与运行说明](docs/V3_STORYBOARD.md) 和 [V3 音效说明](docs/AUDIO_V3.md)。

## 旧版 V3 审阅入口

在本目录执行 `npm ci`、`npm run studio`，选择 **DingFengBoV3** 或 **V3-Scenes** 中的单独章节。完整工程合成为 1920×1080、30 fps、120 秒，包含音乐与音效，无旁白。

- `npm run preview:v3`：生成带声音的 `out/v3/dingfengbo-v3-preview.mp4`（960×540、30 fps、120 秒），同时生成关键帧和封面。
- `npm run storyboard:v3`：只生成 `out/v3/frame-*.jpg` 及 `out/v3/cover.png`。
- 完整预览生成后，运行 `python3 scripts/verify-preview-v3.py` 和 `node scripts/check-preview-v3.cjs`，分别执行文件校验与浏览器播放检查。

浏览器、FFmpeg 等运行前提见 [V3 分镜与运行说明](docs/V3_STORYBOARD.md#审阅入口)。`npm run render`、`npm run cover` 和 `npm run review` 仍对应 V2；本轮 V3 交付为审阅副本，下面的 V2 参数与检查记录属于原版存档。

## V2 原版说明

以苏轼《定风波》作现代人生释意的两分钟物件图解动画。墨黑展台、香槟金线条与玉青落点贯穿全片，雨滴、竹杖、芒鞋、蓑衣和天气空间逐步演示“选择回应—走稳一步—承认感受—安放阴晴”。

这是可编辑的 Remotion V2 工程，包含完整分镜、程序化三维模型、中文字幕、本地字体、用户提供的 BGM 和原创物件拟音。形式为音乐与文字，无旁白。

| 项目 | 规格 |
|---|---|
| 成片 | 120 秒，1920 × 1080，30 fps，共 3,600 帧 |
| 视频格式 | MP4，H.264 视频与 AAC 双声道音频 |
| 主合成 | `DingFengBoV2` |
| 封面 | `CoverV2`，1920 × 1080 |
| 分镜 | 14 个独立章节，均可在 Studio 单独预览 |
| 配乐 | 用户提供的《算力小曲》，取前 120 秒，原速、原音高 |
| 混音源 | 48 kHz、双声道、24-bit PCM；最后 1.4 秒淡出 |

## 安装与预览

运行环境需要 Node.js 22 或 24、npm、Python 3、FFmpeg、FFprobe，以及可启动的 Chromium。依赖版本由 `package-lock.json` 锁定；Remotion 相关包统一使用 4.0.535。

在工程根目录执行：

```bash
npm ci
npm run typecheck
npm run studio
```

Studio 使用端口 `3002`。打开终端显示的地址，在 `DingFengBoV2` 中查看全片，或在 `Scenes` 文件夹选择单独章节。`Objects` 文件夹用于检查雨滴、竹杖与草鞋组合、蓑衣的材质及几何结构。

所有视觉运动按视频帧计算，粒子和程序素材使用固定种子。三维物件通过 Three.js、React Three Fiber 和 `@remotion/three` 渲染；画面中的 SVG 关系图、Canvas 微尘与字幕同样按帧驱动。

## 导出

```bash
npm run render
npm run cover
```

输出文件：

- `out/dingfengbo-v2.mp4`：完整成片。
- `out/cover-v2.png`：封面。

成片脚本为 `scripts/render-final-v2.sh`，会生成封面、导出 3,600 帧视频、按 120 秒重新封装完整混音，并运行文件检查，报告写入 `out/validation-v2.json`。脚本需要 Python 3 用于验证。默认 Linux 浏览器路径为 `/usr/bin/chromium`，可通过环境变量覆盖：

```bash
REMOTION_BROWSER_EXECUTABLE=/path/to/chromium npm run render
```

三维导出使用 `swangle` WebGL 后端。导出脚本通过 `scripts/chromium-cpu-raster.sh` 启动浏览器，将二维背景交给 CPU 栅格化；三维几何、材质和抗锯齿保持不变，避免云端软件 GPU 重复计算全屏背景。本工程的云端渲染环境需要此设置；直接调用 Remotion CLI 时请保留 `--gl=swangle`。例如，使用自选浏览器导出封面：

```bash
REMOTION_BROWSER_EXECUTABLE=/path/to/chromium \
  npx remotion still src/index.ts CoverV2 out/cover-v2.png \
  --browser-executable=./scripts/chromium-cpu-raster.sh --gl=swangle
```

## 编辑位置

| 文件或目录 | 用途 |
|---|---|
| `src/v2/Film.tsx` | 完整音乐轨与 14 段精确时间轴 |
| `src/v2/Root.tsx` | 全片、各章节、封面和物件测试合成注册 |
| `src/v2/chapters/` | 每段诗句、现代释意、字幕时段与场景组合 |
| `src/v2/scenes/` | 各场景视觉主体、关系图、粒子及接触效果 |
| `src/v2/Hero3D.tsx` | 三维物件、材质、灯光、相机和接触动作 |
| `src/v2/models/geometry.ts` | 雨滴、竹杖、草鞋、蓑衣等程序几何与环境光源 |
| `src/v2/SceneShell.tsx` | 统一配色、展台、字体加载、章节标题与底部字幕 |
| `src/v2/Cover.tsx` | 封面构图 |
| `public/audio/` | 原 BGM、独立拟音、最终混音及测量报告 |
| `public/fonts/` | 本地中文字体和字体许可 |
| `docs/CREATIVE_BRIEF.md` | 创作方向、完整文案与分镜说明 |
| `docs/TIMELINE.json` | 各段边界和帧数 |
| `docs/BGM_ANALYSIS.json` | BGM 节奏分析 |

各段帧数依次为 `210、198、264、264、264、264、263、264、264、396、264、263、264、158`，总计 3,600 帧。改变分镜长度时，需要同时调整 `Film.tsx`、章节中的绝对起点、字幕时段和音效事件，保持接触动作与音乐对齐。

《定风波》原词与现代释意在画面中分层呈现。天气波带和人生路径属于思想示意，不表示心理评分或统计结论。小序引用与“1082 年、黄州、沙湖道中遇雨”的历史背景用于交代词作的来由。

## 卡点与声音

BGM 的自动分析节奏约为 **109.17 BPM**，参考网格起点约 **0.421 秒**。它用于安排接触、路径选择、纤维收束和空间展开；该数值是瞬态拟合结果，不等同于对每个小节强拍的人工确认。音乐保持原有速度与音高，字幕保留稳定阅读时间。

`soundtrack-v2.wav` 已包含 BGM 与拟音，`Film.tsx` 只播放这一条完整混音。不要再同时叠加 `bgm-original.mp3` 或 `sfx-v2.wav`，否则声音会重复。

28 个主要声音事件按 30 fps 的绝对帧号定位。每帧对应 1,600 个 48 kHz 音频采样，接触点包括开场雨滴、竹杖、草鞋、纤维编织及末段天气空间展开。详细事件表与测量结果见 [音频说明](public/audio/README-V2.md) 和 [音频报告](public/audio/audio-v2-report.json)。PCM 混音报告与最终 AAC 编码的测量应分别查看。

若需要重新生成声音层，另安装 Python 3、NumPy、SciPy，并确保 FFmpeg 可用：

```bash
python3 scripts/audio_design_v2.py
```

脚本读取工程内的原 BGM，生成独立拟音、完整混音和音频报告。一般视觉编辑可直接使用已附带的 WAV，无需重新合成声音。

## 导出后的检查

```bash
python3 scripts/verify-video.py out/dingfengbo-v2.mp4 \
  --report out/validation-v2.json
```

检查脚本核对时长、尺寸、帧率、总帧数、编码、声道与采样率，并执行完整音视频解码、响度和真峰值测量、MP4 快速起播布局检查及 SHA-256 计算。修改作品并重新导出后，应重新运行检查；报告只对应其记录的文件。

进一步检查导出文件的浏览器播放、跳转和结尾画面：

```bash
node scripts/check-playback-v2.cjs out/dingfengbo-v2.mp4
```

报告写入 `out/browser-check-v2.json`，检查截图位于 `out/playback-check/`。可选安装 Python Pillow 后，执行 `python3 scripts/make-storyboard-v2.py`，从实际 MP4 提取 24 帧并生成分镜总览；它不会重新渲染动画。

素材来源、原创程序素材与字体许可说明见 [ASSET_SOURCES.md](ASSET_SOURCES.md)。

## V2 原交付检查（历史记录）

V2 原交付成片为 60,558,907 字节；完整音视频解码和浏览器播放、8 处跳转检查通过。视频与音频均为 120.000 秒，3600 帧，1920 × 1080，30 fps。最终 AAC 测得 −15.03 LUFS、−1.76 dBTP。对应文件的 SHA-256、技术信息及播放结果见 [VALIDATION.json](docs/VALIDATION.json) 和 [BROWSER_CHECK.json](docs/BROWSER_CHECK.json)。这些记录不用于验证 V3 预览文件。
