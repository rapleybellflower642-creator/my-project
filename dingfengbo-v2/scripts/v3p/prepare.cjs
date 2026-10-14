#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {buildSync} = require('esbuild');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'out/v3p');
const destination = path.join(root, 'public/v3p');
const documentation = path.join(root, 'docs/v3-pulse');
for (const directory of [out, destination, documentation]) fs.mkdirSync(directory, {recursive: true});

const editGrid = JSON.parse(fs.readFileSync(path.join(destination, 'edit-grid.json'), 'utf8'));
writeEditGrid();
function writeEditGrid() {fs.writeFileSync(path.join(root, 'src/v3p/edit-grid.ts'), '// Generated from public/v3p/edit-grid.json. Frame-accurate source-music edit points.\nexport const EDIT_GRID = ' + JSON.stringify(editGrid, null, 2) + ' as const;\n');}

buildSync({entryPoints: [path.join(root, 'src/v3p/timeline.ts')], outfile: path.join(out, 'timeline.cjs'), bundle: true, platform: 'node', format: 'cjs'});
const {CHAPTERS, TEXT_CUES, SHOTS, FPS, DURATION} = require(path.join(out, 'timeline.cjs'));
if (FPS !== 30 || DURATION !== 120) throw new Error('Expected a 120-second timeline at 30 fps');
let boundary = 0;
for (const chapter of CHAPTERS) {
  if (chapter.from !== boundary || chapter.to <= chapter.from || chapter.to > DURATION) throw new Error(`Invalid chapter boundary: ${chapter.id}`);
  boundary = chapter.to;
}
if (boundary !== DURATION) throw new Error('Chapters must cover the complete timeline');
let expectedFrame=0;
if (SHOTS.length !== 52) throw new Error('Expected 52 distinct shots');
for (const shot of SHOTS) {
 if (shot.frame!==expectedFrame || shot.durationFrames<1) throw new Error('Non-contiguous edit: '+shot.id);
 expectedFrame+=shot.durationFrames;
}
if (expectedFrame!==3600) throw new Error('Shots must cover all 3600 frames');
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
write(path.join(destination, 'timeline.json'), JSON.stringify({fps: FPS, width: 1920, height: 1080, durationInFrames: DURATION * FPS, totalSeconds: DURATION, shotCount: SHOTS.length, shots: SHOTS,
  chapters: CHAPTERS.map(chapter => ({...chapter, fromFrame: Math.round(chapter.from * FPS), durationInFrames: Math.round((chapter.to - chapter.from) * FPS)})), captions}, null, 2) + '\n');
write(path.join(documentation, 'STORYBOARD.md'),
  '# V3 黑金节奏版：定风波\n\n120 秒／1920×1080／30 fps。字幕与动画，无旁白。构图：`DingFengBoV3Pulse`。\n\n' +
  '本文件由 `node scripts/v3p/prepare.cjs` 从 `src/v3p/timeline.ts` 生成。\n\n' +
  '| 时间 | 章节 |\n|---|---|\n' + CHAPTERS.map(chapter => `| ${chapter.from}–${chapter.to} 秒 | ${chapter.title} |`).join('\n') +
  '\n\n## 52个音乐镜头\n\n| 镜头 | 时间 | 时长 | 转场 |\n|---|---|---|---|\n' + SHOTS.map(shot => `| ${shot.id} | ${(shot.frame/FPS).toFixed(3)} s | ${(shot.durationFrames/FPS).toFixed(3)} s | ${shot.transition} |`).join('\n') + '\n\n## 屏幕文案\n\n' + TEXT_CUES.map(cue => `- ${cue.from.toFixed(2)}–${cue.to.toFixed(2)} 秒：${cue.text}`).join('\n') +
  '\n\n## 成片审查\n\n`python3 scripts/v3p/storyboard.py` 从完整编码影片提取 52 个镜头中点画面。封面使用第二个「定风波」标题镜头的中点。\n');
console.log(`Prepared ${DURATION}-second V3 pulse timeline: ${CHAPTERS.length} chapters, ${SHOTS.length} shots, ${captions.length} caption cues.`);
