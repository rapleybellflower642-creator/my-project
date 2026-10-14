# 《定风波》V3 黑金节奏版

120秒、1920×1080、30fps、52个明确镜头、26条字幕、48处动作与切换音效，无旁白。Studio主构图为`DingFengBoV3Pulse`。

本版针对上一版的慢、空与明显竖向分区重新剪辑和绘制。13个叙事章节拆成52个独立构图，平均每镜2.31秒，范围1.5–3.57秒。字幕跨镜头保留阅读时间，音乐保持原速原调。51个非开场切点均来自原曲检测到的谱起音，量化到30fps后偏差不超过15毫秒；这说明时间对齐，不代表每个起音都是乐理强拍。

场景增加近景、全景、斜向路径、偏心布局、物件细节和大字冲击。先以官印、案卷、贬谪路线和耕作呈现苏轼的处境，再用竹叶雨击、噪声流、心与声波、足迹、束线松开、蓑衣、酒盏、斜照和回首路径展开词意。

方形颗粒图原先使用SVG默认的等比居中适配，在16:9画面中产生两条明显竖边。现以`preserveAspectRatio="none"`覆盖整个画布，保持连续背景。主线、文字和物件提高尺寸与对比，取消长时间空白淡入。

- [完整成片与下载文件](../../../film-v3-pulse/README.md)
- [52镜头与字幕时间表](./STORYBOARD.md)
- [音乐起音与混音依据](./AUDIO.md)
- [渲染、检查及重建](./RENDER.md)

所有命令在`dingfengbo-v2/`运行：

```bash
npm ci
npm run studio
npm run prepare:v3p
npm run sample:v3p
npm run render:v3p
npm run verify:v3p
```

需要Node.js、Python3、FFmpeg/ffprobe、Fontconfig、fontTools、Pillow及Chromium。完整工程保留已有版本，三维物件复用`public/v3g/assets/`的原创Blender资产，帧号与动作重新设计。BGM使用用户上传的`public/audio/bgm-v4-original.mp3`前120秒，原曲长约192秒，因此本版无需再次循环。
