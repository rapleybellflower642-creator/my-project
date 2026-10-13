# 定风波：风雨有时，脚步由你

两分钟中文诗意动画。以苏轼《定风波·莫听穿林打叶声》为主线，呈现雨中徐行、微冷、斜照与回望，配乐为用户提供的《算力小曲》。纯音乐、原创拟音与文字叙事，无人声旁白。

[仓库成片](../dingfengbo.mp4) · [封面](../dingfengbo-cover.png) · [仓库成片校验记录](../dingfengbo-validation.json)

仓库成片为适配 GitHub 文件大小限制的 1080p 优化编码版本。`docs/VALIDATION.json` 与 `docs/BROWSER_CHECK.json` 记录原始渲染母版；通过下方渲染命令可从完整工程重新导出母版。

## 成片规格

- 1920×1080，16:9，30fps，3600帧，精确120秒。
- H.264 / AAC 320 kb/s；前120秒原曲保持原速，最后1.4秒淡出。
- 五张原创生成场景，程序绘制的分层风雨、薄雾、体积光、微尘、涟漪、枝叶与行路人。
- 每一段有独立源码文件、时间轴节点与Studio composition，方便修改。

## 启动与导出

需要 Node.js 22或24；导出视频还需要系统安装 FFmpeg（含 `ffprobe`）。在本目录执行：

```bash
npm ci
npm run studio
```

打开Remotion Studio后选择 `DingFengBo`。`Scenes` 目录包含14个分镜，`Cover` 为封面。

当前云环境已验证 `/usr/bin/chromium`。导出命令：

```bash
npm run typecheck
npm run render
npm run cover
```

渲染脚本会使用本机 `/usr/bin/chromium`；也可通过 `REMOTION_BROWSER_EXECUTABLE` 指定浏览器路径。其他机器未指定时由Remotion使用其下载的浏览器。封面命令中的 `--browser-executable` 也需按实际路径调整。脚本最后从无损WAV重新封装48kHz AAC，使音频、视频及容器均精确120秒，并启用快速起播；视频流直接复制，不重复压缩。无需创建额外Git worktree；当前云任务已有独立工作区。

## 修改入口

| 文件 | 内容 |
|---|---|
| `src/scenes/*.tsx` | 每段原词、现代解读、时间与场景模式 |
| `src/Film.tsx` | 14段顺序、时长、12帧转场与声音 |
| `src/SceneEngine.tsx` | 镜头、景别、人物位置、雨势、光色 |
| `src/design.tsx` | 中文字体、字号、文字动画、画面边框 |
| `src/visuals/Traveler.tsx` | 斗笠、蓑衣、草鞋、竹杖与行走动画 |
| `src/visuals/Atmosphere.tsx` | 530粒三景深风雨、雾、体积光、微尘 |
| `src/visuals/Scenery.tsx` | 场景镜头、枝叶、水波与近景水滴 |
| `src/Cover.tsx` | 可编辑封面 |
| `public/audio/` | 原BGM、独立音效层、最终混音与声音检测报告 |

父时间轴有13次12帧重叠转场。序列时长之和3756帧，扣除156帧重叠后，成片3600帧。修改时间时需同步维护场景的 `start`、`duration` 与Root中独立场景的帧数。

## 声音与素材

`soundtrack.wav` 已经包含BGM与音效，勿再次叠加 `bgm-original.mp3`。

音效由 `scripts/audio_design.py` 使用确定性噪声、阻尼振荡与包络原创合成。重建音效需Python 3、NumPy、SciPy与FFmpeg；具体参数见脚本 `--help` 与 `public/audio/README.md`。现成WAV已包含在工程中，常规视频渲染无需重新合成声音。

`public/art/` 的五张背景为本次原创生成图像；行路人和特效为程序绘制。音乐来自用户上传。中文字体来自Noto CJK，许可文本保存在 `public/fonts/LICENSE.txt`。详见 `ASSET_SOURCES.md`。

## 检查

```bash
npm run typecheck
node scripts/render-review.cjs
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,duration,nb_frames -of json out/dingfengbo.mp4
ffmpeg -v error -xerror -i out/dingfengbo.mp4 -map 0:v:0 -map 0:a:0 -f null -
```

`render-review.cjs` 默认抽取24个关键帧，也可指定帧号，例如 `node scripts/render-review.cjs 795 1581 2733`。

配乐及任何外部使用范围以素材权利人的授权为准。
