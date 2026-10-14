# 《定风波》V3 重做版：谁怕

依照用户确认的详细制作提示词重做：120 秒，1920×1080，30 fps；字幕、人物与环境动画、配乐和音效，无旁白。

## 这次的具体变化

- 将写作处境与遇雨事件接起来：7–18 秒贬居黄州，18–28 秒躬耕与写作，28 秒进入沙湖遇雨。
- 统一苏轼造型，为走路、避雨、耕作、吟啸、拢袖、回首和书写设置不同动作。行走按支撑与摆腿阶段计算，身体前进速度与接地阶段匹配；同伴有不同衣色、帽形与短须。
- 文字按词意分别使用落定、分组、舒展、冷意收敛和安静停留。重点文字与解释字幕错开，去掉旧版额外眉题与装饰底线。
- 九种环境包含前后景、不同地形、窗光、湿路与雨纹。竹杖芒鞋近景仅 1.6 秒，其他镜头以人物行动为主。
- 原曲前 120 秒保持原速原调。用户上传曲长约 192 秒，当前成片无需循环；26 个精选音效覆盖纸、门、土、水、脚步、竹杖、衣袖与风。“谁怕”音效锚点为第 2057 帧，与原曲的实际起音候选对齐，文字从下一帧开始进入。
- 保留用户要求：无角落署名、无制作／配乐说明小字。片尾“苏轼《定风波》”是作品题名。

## 安装与编辑

在 `dingfengbo-v2/` 执行：

```bash
npm ci
npm run typecheck
npm run studio
```

选择 **DingFengBoV3Remake**。12 个独立章节位于 **V3-Remake-Chapters**，封面为 **CoverV3Remake**。旧版 V3 和 V4 保留，便于对照。

主时间轴为 `src/v3r/Film.tsx`，文字时间记录为 `src/v3r/timeline.ts`。`Frame.tsx` 是逐帧 SVG 场景，`Character.tsx`、`Environment.tsx`、`Typography.tsx` 分别负责人物、环境和文字。浏览器预览与原生导出使用同一个场景函数和本地中文字体。

## 素材与导出

```bash
node scripts/v3r/prepare.cjs
python3 scripts/v3r/audio.py
node scripts/v3r/render.cjs --stills 1.4,9,20.6,25.5,40,51.5,60,69.6,82,91,100,115
node scripts/v3r/render.cjs --sample --jobs 2
node scripts/v3r/render.cjs --full --jobs 2
python3 scripts/v3r/verify.py
node scripts/v3r/check-playback.cjs
```

已附最终混音，正常编辑与导出不必重新生成音频。音频重建需要 Python NumPy、SciPy、FFmpeg；原生画面导出需要 esbuild、React、sharp、FFmpeg、Fontconfig 和 Python FontTools。具体说明见 [渲染流程](RENDER.md) 和 [声音说明](AUDIO.md)。

25 秒样段依次选取原片 38–43、49–54、68–73、82–92 秒，包含“莫听”、行走、“谁怕”以及微冷到转晴。样段是制作检查文件，完整交付为 `out/v3r/dingfengbo-v3-remake.mp4`。

`public/v3r/captions.srt` 是外置中文字幕，MP4 已内嵌画面字幕。`public/v3r/timeline.json` 保存章节与字幕记录。

## 验证范围

以最终 `validation.json` 和 `browser-check.json` 为本次检查结果。原生渲染记录 `full-record.json` 另保存分块像素序列摘要、重复帧统计和输入来源；这能够检查逐帧输出与确定性，不能独立证明人物表演自然。关键帧与动效样段用于检查文字构图和动作变化。

音频的响度、真峰值、原曲时间映射以及声音事件帧号有独立记录；这些技术检查不等同于主观试听。

[逐段分镜与文案](STORYBOARD.md) · [动作与文字执行约定](DIRECTION.md)
