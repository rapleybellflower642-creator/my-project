// Check the exported file in a browser, including seeking and actual playback.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {openBrowser} = require('@remotion/renderer');

(async () => {
  const file = path.resolve(process.argv[2] || 'out/dingfengbo-v2.mp4');
  const output = path.resolve('out/playback-check');
  fs.mkdirSync(output, {recursive: true});
  const bytes = fs.statSync(file).size;
  const server = http.createServer((req, res) => {
    if (req.url !== '/video.mp4') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end('<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#090d10}video{display:block;width:1920px;height:1080px}</style><video id="video" src="/video.mp4" preload="auto" muted playsinline></video>');
      return;
    }
    const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), bytes - 1) : bytes - 1;
    if (start >= bytes || start > end) {
      res.writeHead(416, {'Content-Range': `bytes */${bytes}`}); res.end(); return;
    }
    res.writeHead(range ? 206 : 200, {
      'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      ...(range ? {'Content-Range': `bytes ${start}-${end}/${bytes}`} : {}),
    });
    fs.createReadStream(file, {start, end}).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await openBrowser('chrome', {
    browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || '/usr/bin/chromium',
    logLevel: 'error',
  });
  try {
    const page = await browser.newPage({context: null, logLevel: 'error', indent: false, pageIndex: 0, onBrowserLog: null, onLog: () => {}});
    await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});
    await page.goto({url: `http://127.0.0.1:${server.address().port}/`, timeout: 60000});
    const metadata = await page.evaluate(async () => {
      const v = document.querySelector('video');
      if (v.readyState < 2) await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video load timeout')), 30000);
        v.addEventListener('loadeddata', () => {clearTimeout(timeout); resolve();}, {once: true});
        v.addEventListener('error', () => reject(new Error('Media error')), {once: true});
      });
      return {duration: v.duration, width: v.videoWidth, height: v.videoHeight};
    });
    if (metadata.duration !== 120 || metadata.width !== 1920 || metadata.height !== 1080) throw new Error(JSON.stringify(metadata));
    const seeks = [];
    for (const seconds of [.6, 24.6, 50.8, 55, 66.4, 105.94, 112.3, 119.5]) {
      const state = await page.evaluate(async (target) => {
        const v = document.querySelector('video');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Seek timeout')), 30000);
          v.addEventListener('seeked', () => {clearTimeout(timeout); resolve();}, {once: true});
          v.currentTime = target;
        });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return {time: v.currentTime, readyState: v.readyState, error: v.error};
      }, seconds);
      if (Math.abs(state.time - seconds) > .05 || state.readyState < 2 || state.error) throw new Error(JSON.stringify(state));
      const shot = await page._client().send('Page.captureScreenshot', {format: 'jpeg', quality: 92});
      fs.writeFileSync(path.join(output, `seek-${seconds}.jpg`), Buffer.from(shot.value.data, 'base64'));
      seeks.push({target_seconds: seconds, ...state, status: 'passed'});
    }
    const playback = await page.evaluate(async () => {
      const v = document.querySelector('video'); v.currentTime = 15;
      await v.play();
      const start = v.currentTime;
      await new Promise(resolve => setTimeout(resolve, 700));
      v.pause();
      return {start, end: v.currentTime, error: v.error};
    });
    if (playback.end - playback.start < .2 || playback.error) throw new Error(JSON.stringify(playback));
    const report = {status: 'passed', browser: 'Chromium', file: path.basename(file), sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), metadata, seeks, playback};
    fs.writeFileSync('out/browser-check-v2.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close({silent: true});
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error); process.exit(1);});
