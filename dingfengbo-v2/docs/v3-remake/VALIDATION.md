# V3 重做版交付校验

在项目根目录执行。默认输入为 `out/v3r/dingfengbo-v3-remake.mp4`，规格固定为 **1920×1080、30 fps、3600 帧、120 秒**。这两个脚本不参与渲染，也不允许把短样段当作完整版通过验收。

```bash
python3 scripts/v3r/verify.py
node scripts/v3r/check-playback.cjs
```

依赖为已有的 Python 3、FFmpeg、FFprobe、Node.js、`@remotion/renderer` 和 `/usr/bin/chromium`。不需要新增 Python 包或 Node 包。浏览器通过临时本机 HTTP 端口读取 MP4，支持范围请求；执行结束后关闭浏览器与服务器。Remotion 的内部 `newPage` 接口使用 `context: () => null`。

## 技术文件检查

`verify.py` 写入 `out/v3r/validation.json`，逐项验证：

- 一个 H.264/yuv420p 视频流，1080p、平均和标称帧率均为 30 fps，元数据共 3600 帧。
- 一个 AAC 音频流，48 kHz、双声道。
- 视频、音频、容器各自时长与 120 秒的误差，以及音视频之间的时长差，均严格小于 0.05 秒。
- MP4 的 `moov` 索引位于首个 `mdat` 媒体数据之前，即 faststart。
- FFmpeg 完整解码全部视频与音频，开启严格错误处理，视频恰好解出 3600 帧并正常完成。
- 交付文件内 AAC 音轨的综合响度介于 −16 至 −14 LUFS，真峰值不高于 −1 dBTP；静音或非有限测量值不通过。
- 文件在校验期间未发生替换或修改。报告包含文件大小、SHA-256、流信息、时长误差、MP4 原子位置、解码帧数与音频测量值。

脚本遇到首个失败即停止，报告会保留已取得的证据，把未执行的后续步骤标为 `not_run`，并以状态码 1 退出。成功状态码为 0。输入缺失时也会生成失败报告。

## 浏览器播放检查

`check-playback.cjs` 写入 `out/v3r/browser-check.json`。使用 Chromium 实际加载交付 MP4，验证原始宽高和时长；播放器视口为 960×540，编码尺寸仍须为 1920×1080。

脚本按下列秒数定位十二个章节并保存 JPEG 截图：

```text
2, 9, 20.6, 31, 40, 51, 60, 69.6, 82, 91, 100, 115
```

截图位于 `out/v3r/playback-check/`。另外从开头 2 秒、中段 60 秒、结尾 117 秒各连续播放约 1.1 秒，以播放时间前进、解码帧数增加和没有媒体错误作为播放证据。报告记录目标时间、实际时间、已解码及丢弃帧数、文件 SHA-256 和各次检查结果。播放失败以状态码 1 退出。

浏览器保持静音。三个播放窗口用于验证实际浏览器播放能力，并不等于按实时速度看完 120 秒；全片解码完整性由 Python 脚本检查。浏览器 API 不直接证明编码总帧数与固定帧率，这两项也由 Python 脚本验证。

## 自定义输入与输出

```bash
python3 scripts/v3r/verify.py /path/to/video.mp4 --report /tmp/v3r-check/validation.json
node scripts/v3r/check-playback.cjs /path/to/video.mp4 --output-dir /tmp/v3r-check
```

自定义输入仍执行相同完整版规格，不会降低时长、尺寸、响度或帧数门槛。用临时夹具自检时应指定临时输出目录，避免覆盖正式报告。

## 人工检查范围

两个报告中的 `subjective_listening_checked` 与 `subjective_visual_review_checked` 始终为 `false`。自动检查不会宣称完成主观试听、声画同步判断、字幕实际可读性或角色动画质量审查；这些需要针对最终影片和定位截图另行记录。

分块像素序列摘要及相邻重复帧统计由渲染器写入 `full-record.json`，见 [RENDER.md](RENDER.md)。检查字幕与动画时应结合该记录和最终交付 MP4，不能仅凭技术检查通过来推断画面质量。
