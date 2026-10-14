// Validate V4 metadata, chapter seeking, and actual muted browser playback.
// Usage: node scripts/check-playback-v4.cjs [video.mp4] [--timeline file.json] [--output-dir directory]
// The player viewport is 960x540; the actual encoded video must remain 1920x1080.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {openBrowser} = require('@remotion/renderer');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
let videoPath;
let timelinePath = path.join(root, 'public/v4/timeline.json');
let reportRoot = path.join(root, 'out/v4');
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--timeline') timelinePath = args[++i];
  else if (args[i] === '--output-dir') reportRoot = args[++i];
  else if (!args[i].startsWith('--') && !videoPath) videoPath = args[i];
  else throw new Error(`Unknown argument: ${args[i]}`);
}
const file = path.resolve(videoPath || path.join(root, 'out/v4/dingfengbo-v4-full.mp4'));
const output = path.resolve(reportRoot, 'playback-check');
const reportFile = path.resolve(reportRoot, 'browser-check.json');
const timeline = JSON.parse(fs.readFileSync(path.resolve(timelinePath), 'utf8'));
const fps = timeline.fps || 30;
const expectedDuration = timeline.durationInFrames / fps;
const targets = [
  {label: 'opening', seconds: Math.min(.6, expectedDuration / 4)},
  ...(timeline.chapters || []).map(chapter => ({
    label: `chapter-${chapter.id}`, title: chapter.title,
    seconds: (chapter.from + chapter.duration / 2) / fps,
  })),
  {label: 'closing', seconds: Math.max(0, expectedDuration - 2 / fps)},
];

async function sha256(filename) {
  const digest = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filename)) digest.update(chunk);
  return digest.digest('hex');
}

async function main() {
  if (!fs.existsSync(file)) throw new Error(`Video does not exist: ${file}`);
  const bytes = fs.statSync(file).size;
  if (!bytes) throw new Error('Video file is empty');
  fs.mkdirSync(output, {recursive: true});
  const server = http.createServer((req, res) => {
    if (req.url !== '/video.mp4') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end('<!doctype html><meta charset="utf-8"><title>V4 full video playback validation</title><style>html,body{margin:0;background:#090d10;overflow:hidden}video{display:block;width:960px;height:540px}</style><video id="video" src="/video.mp4" preload="auto" muted playsinline></video>');
      return;
    }
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), bytes-1) : bytes-1;
    if (start >= bytes || start > end) {
      res.writeHead(416, {'Content-Range': `bytes */${bytes}`});
      res.end();
      return;
    }
    res.writeHead(range ? 206 : 200, {
      'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes',
      'Content-Length': end-start+1,
      ...(range ? {'Content-Range': `bytes ${start}-${end}/${bytes}`} : {}),
    });
    const stream = fs.createReadStream(file, {start, end});
    stream.on('error', (error) => res.destroy(error));
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    browser = await openBrowser('chrome', {
      browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || '/usr/bin/chromium',
      logLevel: 'error',
    });
    const page = await browser.newPage({context: () => null, logLevel: 'error', indent: false,
      pageIndex: 0, onBrowserLog: null, onLog: () => {}});
    await page.setViewport({width: 960, height: 540, deviceScaleFactor: 1});
    await page.goto({url: `http://127.0.0.1:${server.address().port}/`, timeout: 60000});
    const metadata = await page.evaluate(async () => {
      const video = document.querySelector('video');
      if (video.readyState < 2) await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Video load timeout')), 30000);
        video.addEventListener('loadeddata', () => {clearTimeout(timer); resolve();}, {once: true});
        video.addEventListener('error', () => {
          clearTimeout(timer);
          reject(new Error(`Media error ${video.error?.code}: ${video.error?.message}`));
        }, {once: true});
      });
      return {duration: video.duration, width: video.videoWidth, height: video.videoHeight,
        readyState: video.readyState};
    });
    if (Math.abs(metadata.duration-expectedDuration) > 2/fps || metadata.width !== 1920 || metadata.height !== 1080) {
      throw new Error(`Incorrect browser video metadata: ${JSON.stringify(metadata)}`);
    }
    const seeks = [];
    for (const target of targets) {
      const seconds = target.seconds;
      const state = await page.evaluate(async (target) => {
        const video = document.querySelector('video');
        video.pause();
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`Seek timeout at ${target}`)), 30000);
          video.addEventListener('seeked', () => {clearTimeout(timer); resolve();}, {once: true});
          video.currentTime = target;
        });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const quality = video.getVideoPlaybackQuality();
        return {time: video.currentTime, readyState: video.readyState,
          error: video.error ? {code: video.error.code, message: video.error.message} : null,
          decoded_frames: quality.totalVideoFrames, dropped_frames: quality.droppedVideoFrames};
      }, seconds);
      if (Math.abs(state.time-seconds) > .05 || state.readyState < 2 || state.error) {
        throw new Error(`Seek failed: ${JSON.stringify(state)}`);
      }
      const shot = await page._client().send('Page.captureScreenshot', {format: 'jpeg', quality: 92});
      const screenshot = `${target.label}-${seconds.toFixed(3)}.jpg`;
      fs.writeFileSync(path.join(output, screenshot), Buffer.from(shot.value.data, 'base64'));
      seeks.push({label: target.label, title: target.title, target_seconds: seconds, ...state, screenshot: `playback-check/${screenshot}`, status: 'passed'});
    }
    const playback = [];
    const playbackTargets = [Math.min(2, expectedDuration / 8), expectedDuration / 2,
      Math.max(0, expectedDuration - 3)];
    for (const target of playbackTargets) {
      const sample = await page.evaluate(async (seconds) => {
        const video = document.querySelector('video');
        video.pause();
        if (Math.abs(video.currentTime-seconds) > .001) await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Playback seek timeout')), 30000);
          video.addEventListener('seeked', () => {clearTimeout(timer); resolve();}, {once: true});
          video.currentTime = seconds;
        });
        const before = video.getVideoPlaybackQuality().totalVideoFrames;
        await video.play();
        const start = video.currentTime;
        await new Promise(resolve => setTimeout(resolve, 1100));
        video.pause();
        const quality = video.getVideoPlaybackQuality();
        return {start, end: video.currentTime, decoded_frames_during_playback: quality.totalVideoFrames-before,
          dropped_frames_total: quality.droppedVideoFrames, muted: video.muted,
          error: video.error ? {code: video.error.code, message: video.error.message} : null};
      }, target);
      if (sample.end-sample.start < .3 || sample.decoded_frames_during_playback < 5 || sample.error) {
        throw new Error(`Playback failed: ${JSON.stringify(sample)}`);
      }
      playback.push({target_seconds: target, ...sample, status: 'passed'});
    }
    const report = {
      status: 'passed', deliverable: 'V4 full video (1080p)',
      browser: 'Chromium', file: path.basename(file), sha256: await sha256(file),
      viewport: {width: 960, height: 540, deviceScaleFactor: 1},
      expected: {duration: expectedDuration, frames: timeline.durationInFrames, fps, width: 1920, height: 1080},
      timeline_sha256: await sha256(path.resolve(timelinePath)), metadata, seeks, playback,
      subjective_listening_checked: false,
      note: 'Muted browser playback verifies decoding/seeking, not subjective sound balance or audiovisual synchronization.',
    };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2)+'\n');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (browser) await browser.close({silent: true});
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  fs.mkdirSync(path.dirname(reportFile), {recursive: true});
  fs.writeFileSync(reportFile, JSON.stringify({status: 'failed', file: path.basename(file),
    error: error.message}, null, 2)+'\n');
  console.error(error);
  process.exitCode = 1;
});
