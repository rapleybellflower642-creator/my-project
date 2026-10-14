#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {buildSync} = require('esbuild');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'out/v3g');
const destination = path.join(root, 'public/v3g');
const documentation = path.join(root, 'docs/v3-gold');
for (const directory of [out, destination, documentation]) fs.mkdirSync(directory, {recursive: true});

buildSync({entryPoints: [path.join(root, 'src/v3g/timeline.ts')], outfile: path.join(out, 'timeline.cjs'), bundle: true, platform: 'node', format: 'cjs'});
const {CHAPTERS, TEXT_CUES, FPS, DURATION} = require(path.join(out, 'timeline.cjs'));
if (FPS !== 30 || DURATION !== 120) throw new Error('Expected a 120-second timeline at 30 fps');
let boundary = 0;
for (const chapter of CHAPTERS) {
  if (chapter.from !== boundary || chapter.to <= chapter.from || chapter.to > DURATION) throw new Error(`Invalid chapter boundary: ${chapter.id}`);
  boundary = chapter.to;
}
if (boundary !== DURATION) throw new Error('Chapters must cover the complete timeline');
let previousEnd = 0;
for (const cue of TEXT_CUES) {
  if (cue.from < previousEnd || cue.to <= cue.from || cue.to > DURATION || !cue.text) throw new Error(`Invalid caption cue: ${cue.text}`);
  previousEnd = cue.to;
}

const captions = TEXT_CUES.map(cue => ({text: cue.text, startMs: Math.round(cue.from * 1000), endMs: Math.round(cue.to * 1000), timestampMs: Math.round(cue.from * 1000), confidence: null}));
const time = milliseconds => {
  const value = Math.round(milliseconds);
  return `${String(Math.floor(value / 3600000)).padStart(2, '0')}:${String(Math.floor(value / 60000) % 60).padStart(2, '0')}:${String(Math.floor(value / 1000) % 60).padStart(2, '0')},${String(value % 1000).padStart(3, '0')}`;
};
const write = (file, content) => {
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, content);
  fs.renameSync(temporary, file);
};
write(path.join(destination, 'captions.json'), JSON.stringify(captions, null, 2) + '\n');
write(path.join(destination, 'captions.srt'), captions.map((cue, index) => `${index + 1}\n${time(cue.startMs)} --> ${time(cue.endMs)}\n${cue.text}\n`).join('\n'));
write(path.join(destination, 'timeline.json'), JSON.stringify({fps: FPS, width: 1920, height: 1080, durationInFrames: DURATION * FPS, totalSeconds: DURATION,
  chapters: CHAPTERS.map(chapter => ({...chapter, fromFrame: Math.round(chapter.from * FPS), durationInFrames: Math.round((chapter.to - chapter.from) * FPS)})), captions}, null, 2) + '\n');
write(path.join(documentation, 'STORYBOARD.md'),
  '# V3 黑金版：定风波\n\n120 秒／1920×1080／30 fps。字幕与动画，无旁白。构图：`DingFengBoV3Gold`。\n\n' +
  '本文件由 `node scripts/v3g/prepare.cjs` 从 `src/v3g/timeline.ts` 生成。\n\n' +
  '| 时间 | 章节 |\n|---|---|\n' + CHAPTERS.map(chapter => `| ${chapter.from}–${chapter.to} 秒 | ${chapter.title} |`).join('\n') +
  '\n\n## 屏幕文案\n\n' + TEXT_CUES.map(cue => `- ${cue.from.toFixed(2)}–${cue.to.toFixed(2)} 秒：${cue.text}`).join('\n') +
  '\n\n## 成片审查\n\n`python3 scripts/v3g/storyboard.py` 从完整编码影片提取 26 个审查画面。封面使用 9.8 秒的「定风波」标题。\n');
console.log(`Prepared ${DURATION}-second V3 gold timeline: ${CHAPTERS.length} chapters, ${captions.length} caption cues.`);
