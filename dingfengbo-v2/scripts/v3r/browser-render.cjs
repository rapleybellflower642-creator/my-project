#!/usr/bin/env node
'use strict';

// Alternative renderer for the identical FrameSvg scene graph. The native renderer
// can continue running while this benchmark writes to its own output directory.
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {bundle} = require('@remotion/bundler');
const {openBrowser, selectComposition, renderMedia} = require('@remotion/renderer');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'out/v3r/browser');
const SAMPLE = [[38, 43], [49, 54], [68, 73], [82, 92]];

const run = (cmd, args) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, {cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe']});
  let stdout = '', stderr = '';
  child.stdout.on('data', d => { stdout += d; });
  child.stderr.on('data', d => { stderr = (stderr + d).slice(-20000); });
  child.on('error', reject);
  child.on('close', code => code === 0 ? resolve(stdout) : reject(new Error(`${cmd} ${code}: ${stderr}`)));
});

(async () => {
  process.chdir(ROOT);
  fs.mkdirSync(OUT, {recursive: true});
  const argv = process.argv.slice(2);
  let mode = 'benchmark', jobs = 2, crf = 20, start = 1470, end = 1529;
  for (let i = 0; i < argv.length; i++) {
    if (['--benchmark', '--sample', '--full'].includes(argv[i])) mode = argv[i].slice(2);
    else if (argv[i] === '--jobs') jobs = Number(argv[++i]);
    else if (argv[i] === '--crf') crf = Number(argv[++i]);
    else if (argv[i] === '--frames') [start, end] = argv[++i].split(':').map(Number);
    else throw new Error(`Unknown option ${argv[i]}`);
  }
  if (![1, 2, 3].includes(jobs)) throw new Error('--jobs must be 1, 2 or 3');
  if (![start, end].every(Number.isInteger) || start < 0 || end < start || end >= 3600) throw new Error('--frames must be inclusive start:end within 0:3599');
  if (!Number.isInteger(crf) || crf < 0 || crf > 35) throw new Error('Invalid CRF');
  if (mode === 'full' && !argv.includes('--crf')) crf = 18;
  const began = Date.now();
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), outDir: path.join(OUT, 'bundle')});
  const bundleSeconds = (Date.now() - began) / 1000;
  const chromiumOptions = {gl: 'swangle'};
  const browser = await openBrowser('chrome', {browserExecutable: path.join(ROOT, 'scripts/chromium-cpu-raster.sh'), chromiumOptions, logLevel: 'error'});
  const inputProps = {renderAudio: false};
  const segments = mode === 'benchmark' ? [[start, end]] : mode === 'full' ? [[0, 3599]] : SAMPLE.map(([a, b]) => [a * 30, b * 30 - 1]);
  const records = [];
  try {
    const composition = await selectComposition({serveUrl, id: 'DingFengBoV3Remake', inputProps, puppeteerInstance: browser, chromiumOptions});
    console.log(`BROWSER ${mode} · 1920×1080 · 30 fps · concurrency ${jobs} · bundle ${bundleSeconds.toFixed(1)} s`);
    for (const [from, to] of segments) {
      const file = path.join(OUT, `${mode}-${from}-${to}.mp4`);
      const temporary = file.replace(/\.mp4$/, '.tmp.mp4');
      const renderStart = Date.now();
      let last = 0;
      await renderMedia({serveUrl, composition, inputProps, puppeteerInstance: browser, chromiumOptions,
        frameRange: [from, to], outputLocation: temporary, codec: 'h264', crf, x264Preset: 'fast',
        pixelFormat: 'yuv420p', jpegQuality: 95, concurrency: jobs, timeoutInMilliseconds: 90000,
        ffmpegOverride: ({args}) => [...args.slice(0, -1), '-threads', '1', args.at(-1)],
        onProgress: ({renderedFrames, encodedFrames}) => {
          if (Date.now() - last >= 10000) {
            console.log(`BROWSER ${from}-${to} rendered ${renderedFrames}/${to - from + 1}, encoded ${encodedFrames}, elapsed ${((Date.now() - renderStart) / 1000).toFixed(1)} s`);
            last = Date.now();
          }
        },
      });
      fs.renameSync(temporary, file);
      const seconds = (Date.now() - renderStart) / 1000;
      records.push({start: from, end: to, frames: to - from + 1, seconds, fps: (to - from + 1) / seconds, file});
      console.log(`BROWSER DONE ${from}-${to} · ${seconds.toFixed(2)} s · ${((to - from + 1) / seconds).toFixed(2)} fps`);
    }
  } finally { await browser.close({silent: true}); }

  let finalOutput = null;
  if (mode !== 'benchmark') {
    const concat = path.join(OUT, `${mode}-concat.txt`);
    fs.writeFileSync(concat, records.map(r => `file '${r.file.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
    finalOutput = path.join(OUT, mode === 'full' ? 'dingfengbo-v3-remake-browser.mp4' : 'dingfengbo-v3-remake-browser-sample.mp4');
    const temporary = finalOutput.replace(/\.mp4$/, '.tmp.mp4');
    const duration = records.reduce((sum, record) => sum + record.frames, 0) / 30;
    const filters = [`[1:a]aresample=48000,asplit=${records.length}${records.map((_, i) => `[s${i}]`).join('')}`,
      ...records.map((r, i) => `[s${i}]atrim=start_sample=${r.start * 1600}:end_sample=${(r.end + 1) * 1600},asetpts=PTS-STARTPTS[a${i}]`),
      `${records.map((_, i) => `[a${i}]`).join('')}concat=n=${records.length}:v=0:a=1[aout]`];
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', concat,
      '-i', path.join(ROOT, 'public/audio/soundtrack-v3r.m4a'), '-filter_complex_threads', '1', '-filter_complex', filters.join(';'),
      '-map', '0:v:0', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-t', String(duration), '-movflags', '+faststart', temporary]);
    const probe = JSON.parse(await run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', temporary]));
    const video = probe.streams.find(s => s.codec_type === 'video');
    const audio = probe.streams.find(s => s.codec_type === 'audio');
    if (video?.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== '30/1' || Number(video.nb_frames) !== duration * 30 || !audio || Number(audio.sample_rate) !== 48000 || audio.channels !== 2 || Math.abs(Number(audio.duration) - duration) > .05) throw new Error('Final media validation failed');
    fs.renameSync(temporary, finalOutput);
  }
  fs.writeFileSync(path.join(OUT, `${mode}-record.json`), JSON.stringify({mode, jobs, crf, bundleSeconds, totalSeconds: (Date.now() - began) / 1000, records, finalOutput}, null, 2) + '\n');
})().catch(error => { console.error(error.stack || String(error)); process.exitCode = 1; });
