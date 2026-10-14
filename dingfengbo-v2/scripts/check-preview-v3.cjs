// Check metadata, frame seeking and actual browser playback of the V3 review preview.
// Usage: node scripts/check-preview-v3.cjs [preview.mp4]
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {openBrowser} = require('@remotion/renderer');

const root = path.resolve(__dirname, '..');
const file = path.resolve(process.argv[2] || path.join(root, 'out/v3/dingfengbo-v3-preview.mp4'));
const output = path.join(root, 'out/v3/playback-check');
const reportFile = path.join(root, 'out/v3/browser-check.json');
const targets = [1, 5, 11, 19, 27, 36, 44, 53, 58.5, 63, 70, 79, 85, 93, 102, 110, 118, 119.9];

async function sha256(filename) {
  const digest = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filename)) digest.update(chunk);
  return digest.digest('hex');
}

async function main() {
  if (!fs.existsSync(file)) throw new Error(`Preview does not exist: ${file}`);
  const bytes = fs.statSync(file).size;
  if (!bytes) throw new Error('Preview file is empty');
  fs.mkdirSync(output, {recursive: true});
  const server = http.createServer((req, res) => {
    if (req.url !== '/video.mp4') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end('<!doctype html><meta charset="utf-8"><title>V3 review preview validation</title><style>html,body{margin:0;background:#090d10;overflow:hidden}video{display:block;width:960px;height:540px}</style><video id="video" src="/video.mp4" preload="auto" muted playsinline></video>');
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
    const page = await browser.newPage({context: null, logLevel: 'error', indent: false,
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
    if (Math.abs(metadata.duration-120) > .001 || metadata.width !== 960 || metadata.height !== 540) {
      throw new Error(`Incorrect browser video metadata: ${JSON.stringify(metadata)}`);
    }
    const seeks = [];
    for (const seconds of targets) {
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
      const screenshot = `seek-${seconds}.jpg`;
      fs.writeFileSync(path.join(output, screenshot), Buffer.from(shot.value.data, 'base64'));
      seeks.push({target_seconds: seconds, ...state, screenshot: `playback-check/${screenshot}`, status: 'passed'});
    }
    const playback = await page.evaluate(async () => {
      const video = document.querySelector('video');
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Playback seek timeout')), 30000);
        video.addEventListener('seeked', () => {clearTimeout(timer); resolve();}, {once: true});
        video.currentTime = 15;
      });
      const before = video.getVideoPlaybackQuality().totalVideoFrames;
      await video.play();
      const start = video.currentTime;
      await new Promise(resolve => setTimeout(resolve, 900));
      video.pause();
      const quality = video.getVideoPlaybackQuality();
      return {start, end: video.currentTime, decoded_frames_during_playback: quality.totalVideoFrames-before,
        dropped_frames_total: quality.droppedVideoFrames, muted: video.muted,
        error: video.error ? {code: video.error.code, message: video.error.message} : null};
    });
    if (playback.end-playback.start < .2 || playback.decoded_frames_during_playback < 2 || playback.error) {
      throw new Error(`Playback failed: ${JSON.stringify(playback)}`);
    }
    const report = {
      status: 'passed', deliverable: 'V3 review preview (not final master)',
      browser: 'Chromium', file: path.basename(file), sha256: await sha256(file),
      viewport: {width: 960, height: 540, deviceScaleFactor: 1}, metadata, seeks, playback,
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
