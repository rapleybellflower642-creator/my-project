# 《定风波》V4：雨里，也能慢慢走

本版完整展开用户提供的长文案，结合苏轼的黄州处境、逐句解词与现代生活例子，制作成长篇字幕动画。**无旁白；字幕＋分层视差动画＋本次上传的《算力小曲》循环配乐及少量音效。**

| 项目 | 当前规格 |
|---|---|
| 片长 | 594.266667 秒，约 9 分 54 秒 |
| 画面 | 1920×1080、30 fps、17,828 帧，16:9 |
| 内容 | 119 个字幕镜头、14 章 |
| 主合成 | `DingFengBoV4`；章节位于 `V4-Chapters`，封面为 `CoverV4` |
| 完整成片 | `out/v4/dingfengbo-v4-full.mp4`，H.264／AAC 48 kHz 双声道 |
| 字幕文件 | `public/v4/captions.srt` 与 `public/v4/captions.json` |

交付目标是完整的全高清长片。镜头长度依据字幕阅读量生成；改动文案后，片长与帧数以 `public/v4/timeline.json` 为准。历史人物、环境、前景和天气分层运动，字幕保持稳定可读；人物与生活场景为主体，竹杖保留一个短镜头。

## 安装与观看

以下命令在 `dingfengbo-v2/` 目录执行。需要 Node.js 22 或 24、npm、Python 3、FFmpeg 和 FFprobe。素材重建需要 Python FontTools，音频重建需要 NumPy 和 SciPy；完整 MP4 通过 FFmpeg 导出。Remotion Studio 用于编辑与浏览器预览。

浏览器播放检查需要 Chromium，默认路径 `/usr/bin/chromium`，可通过 `REMOTION_BROWSER_EXECUTABLE` 指定。分镜总览脚本需要 Pillow 和 `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf` 字体。

```bash
npm ci
npm run studio
```

在终端显示的地址中选择 **DingFengBoV4**；默认端口为 `3002`。若分层图片、字幕图与完整音轨已经生成，可以直接进入 Studio，或执行 `python3 scripts/render-v4.py` 导出。

## 从文案重建并导出

```bash
node scripts/prepare-v4.cjs
node scripts/assets-v4.cjs
python3 scripts/audio_design_v4.py
python3 scripts/render-v4.py
python3 scripts/verify-v4.py
node scripts/check-playback-v4.cjs
python3 scripts/storyboard-v4.py
```

1. `prepare-v4.cjs` 将 `docs/V4_SCRIPT.json` 编译成逐帧时间轴、字幕文件、分章合成与分镜表。
2. `assets-v4.cjs` 生成背景、人物、前景、天气及字幕图片，供 Studio 和视频导出共同使用。
3. `audio_design_v4.py` 使用 `public/audio/bgm-v4-original.mp3`，按照时间轴长度循环本次上传的完整 BGM；保留原速原调，用交叉淡化衔接循环，输出 `public/audio/soundtrack-v4.m4a`。
4. `render-v4.py` 按同一时间轴渲染分层动画，并与完整音轨合并。默认同时运行两个镜头任务；再次执行会复用输入一致的镜头缓存。
5. `verify-v4.py` 验证完整 MP4，并输出 `out/v4/validation.json`。
6. `check-playback-v4.cjs` 检查章节跳转与短段播放；`storyboard-v4.py` 从完整成片提取 28 张画面，生成 `out/v4/storyboard.jpg`。

如果本地尚无本次上传的 BGM，可在音频步骤使用 `python3 scripts/audio_design_v4.py --source /path/to/算力小曲.mp3`。已经提供 `soundtrack-v4.m4a` 时，正常观看和导出无需重复混音，也不要再叠加原曲或独立音效轨。

只改字幕排版时，可在更新时间轴后运行 `node scripts/assets-v4.cjs --text-only`；若镜头、场景或时长有变化，应按上述完整流程重建。短样片可用 `python3 scripts/render-v4.py --limit 2`，输出 `dingfengbo-v4-sample.mp4`；完整成片验证命令用于 `dingfengbo-v4-full.mp4`。

## 技术检查与文件

验证脚本从时间轴读取长度，核对完整解码帧数、1080p／30 fps、视频和音频时长偏差均小于 0.05 秒、AAC 48 kHz 双声道、MP4 快速起播布局、综合响度 −16 至 −14 LUFS、真峰值不高于 −1 dBTP，以及文件 SHA-256。音视频彼此的时长差也须小于 0.05 秒。

这些是技术检查；报告保留 `subjective_listening_checked: false`，不据此宣称主观试听或视听同步审查已经完成。最终验收结果以该次导出生成的 `validation.json` 为准。

- [完整字幕文案](V4_SCRIPT.json)、[用户原文](V4_USER_TEXT.md)、[编辑与史实说明](V4_EDITORIAL.md)、[逐镜分镜表](V4_STORYBOARD.md)。
- `public/v4/timeline.json`：唯一导出时间轴；修改文案后重新生成。
- `public/v4/art/`、`text/`、`fx/`：分层场景、字幕和天气素材。
- `scripts/art-v4/`：历史、自然及现代场景的可编辑插画生成代码。
- `src/v4/`：Remotion 主片、章节、镜头与合成注册。
- `out/v4/clips/`：中间镜头缓存；`out/v4/export-v4.json` 为导出记录，`out/v4/validation.json` 为最终文件校验记录。

`npm run render` 仍对应旧 V2。V4 的 npm 快捷命令为 `prepare:v4`、`assets:v4`、`audio:v4`、`render:v4` 和 `verify:v4`。
