// Usage: node scripts/v3r/check-playback.cjs [video.mp4] [--output-dir directory]
// Browser checks cover metadata, seeking, and muted decoding; they are not a subjective review.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {openBrowser} = require('@remotion/renderer');

const root = path.resolve(__dirname, '../..');
const expected = {width: 1920, height: 1080, fps: 30, frames: 3600, duration: 120};
const seekTargets = [2, 9, 20.6, 31, 40, 51, 60, 69.6, 82, 91, 100, 115];
const playbackTargets = [2, 60, 117];
let file = path.join(root, 'out/v3r/dingfengbo-v3-remake.mp4');
let reportRoot = path.join(root, 'out/v3r');
const report = {
  status: 'running', deliverable: 'V3 remake (1080p)', browser: 'Chromium',
  browser_executable: '/usr/bin/chromium', started_at: new Date().toISOString(),
  sha256: null, expected,
  viewport: {width: 960, height: 540, deviceScaleFactor: 1},
  metadata: null, seeks: [], playback: [], cleanup_errors: [],
  subjective_listening_checked: false, subjective_visual_review_checked: false,
  note: 'Muted browser playback checks seeking and decoding. Screenshots are captured, not subjectively reviewed. Encoded fps and frame count are checked by the separate media verifier.',
};

function saveReport() {
  fs.mkdirSync(reportRoot, {recursive: true});
  fs.writeFileSync(path.join(reportRoot, 'browser-check.json'), JSON.stringify(report, null, 2) + '\n');
}

async function sha256(filename) {
  const digest = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filename)) digest.update(chunk);
  return digest.digest('hex');
}

async function withTimeout(promise, milliseconds, label) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timeout`)), milliseconds);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

function createServer(bytes) {
  return http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
      res.end('<!doctype html><meta charset="utf-8"><title>V3 remake playback validation</title><style>html,body{margin:0;background:#090d10;overflow:hidden}video{display:block;width:960px;height:540px}</style><video id="video" src="/video.mp4" preload="auto" muted playsinline></video>');
      return;
    }
    if (req.url !== '/video.mp4') {
      res.writeHead(404);
      res.end();
      return;
    }
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), bytes - 1) : bytes - 1;
    if ((req.headers.range && !range) || !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) || start >= bytes || start > end) {
      res.writeHead(416, {'Content-Range': `bytes */${bytes}`});
      res.end();
      return;
    }
    res.writeHead(range ? 206 : 200, {
      'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store',
      'Content-Length': end - start + 1,
      ...(range ? {'Content-Range': `bytes ${start}-${end}/${bytes}`} : {}),
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = fs.createReadStream(file, {start, end});
    stream.on('error', error => res.destroy(error));
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}

async function main() {
  let server;
  let browser;
  const sockets = new Set();
  try {
    const args = process.argv.slice(2);
    let positionalSeen = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--output-dir') {
        if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--output-dir requires a directory');
        reportRoot = path.resolve(args[++i]);
      } else if (!args[i].startsWith('--') && !positionalSeen) {
        file = path.resolve(args[i]);
        positionalSeen = true;
      } else {
        throw new Error(`Unknown argument: ${args[i]}`);
      }
    }
    report.file = path.basename(file);
    report.file_path = file;
    report.stage = 'input';
    const stat = fs.statSync(file);
    if (!stat.isFile() || !stat.size) throw new Error(`Video must be a nonempty file: ${file}`);
    report.bytes = stat.size;
    report.sha256 = await sha256(file);
    const output = path.join(reportRoot, 'playback-check');
    fs.mkdirSync(output, {recursive: true});
    saveReport();
    server = createServer(stat.size);
    server.on('connection', socket => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    report.stage = 'browser-launch';
    browser = await openBrowser('chrome', {browserExecutable: '/usr/bin/chromium', logLevel: 'error'});
    const page = await browser.newPage({
      context: () => null, logLevel: 'error', indent: false,
      pageIndex: 0, onBrowserLog: null, onLog: () => {},
    });
    await page.setViewport(report.viewport);
    await page.goto({url: `http://127.0.0.1:${server.address().port}/`, timeout: 60000});
    report.stage = 'metadata';
    report.metadata = await page.evaluate(async () => {
      const video = document.querySelector('video');
      video.muted = true;
      window.mediaError = () => video.error ? {code: video.error.code, message: video.error.message} : null;
      window.frameQuality = () => {
        const quality = video.getVideoPlaybackQuality();
        const hasDecodedCounter = typeof video.webkitDecodedFrameCount === 'number';
        return {
          decoded_frames: hasDecodedCounter ? video.webkitDecodedFrameCount : quality.totalVideoFrames - quality.droppedVideoFrames,
          decoded_frame_counter: hasDecodedCounter ? 'webkitDecodedFrameCount' : 'totalVideoFrames-minus-droppedVideoFrames',
          total_frames: quality.totalVideoFrames, dropped_frames: quality.droppedVideoFrames,
        };
      };
      window.seekToSeconds = async seconds => {
        video.pause();
        if (video.error) throw new Error(`Media error: ${JSON.stringify(window.mediaError())}`);
        if (Math.abs(video.currentTime - seconds) < .001 && video.readyState >= 2) return;
        await new Promise((resolve, reject) => {
          const cleanup = () => {
            clearTimeout(timer);
            video.removeEventListener('seeked', onSeeked);
            video.removeEventListener('error', onError);
          };
          const onSeeked = () => {cleanup(); resolve();};
          const onError = () => {cleanup(); reject(new Error(`Media error: ${JSON.stringify(window.mediaError())}`));};
          const timer = setTimeout(() => {cleanup(); reject(new Error(`Seek timeout at ${seconds}s`));}, 30000);
          video.addEventListener('seeked', onSeeked);
          video.addEventListener('error', onError);
          video.currentTime = seconds;
        });
      };
      if (video.error) throw new Error(`Media error: ${JSON.stringify(window.mediaError())}`);
      if (video.readyState < 2) await new Promise((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timer);
          video.removeEventListener('loadeddata', onLoaded);
          video.removeEventListener('error', onError);
        };
        const onLoaded = () => {cleanup(); resolve();};
        const onError = () => {cleanup(); reject(new Error(`Media error: ${JSON.stringify(window.mediaError())}`));};
        const timer = setTimeout(() => {cleanup(); reject(new Error('Video load timeout'));}, 30000);
        video.addEventListener('loadeddata', onLoaded);
        video.addEventListener('error', onError);
      });
      return {duration: video.duration, width: video.videoWidth, height: video.videoHeight,
        readyState: video.readyState, muted: video.muted, error: window.mediaError()};
    });
    const metadata = report.metadata;
    metadata.duration_error_seconds = Math.abs(metadata.duration - expected.duration);
    saveReport();
    if (!Number.isFinite(metadata.duration) || metadata.duration_error_seconds >= .05 ||
        metadata.width !== expected.width || metadata.height !== expected.height || metadata.error) {
      throw new Error(`Incorrect browser video metadata: ${JSON.stringify(metadata)}`);
    }
    report.stage = 'seeking';
    for (let i = 0; i < seekTargets.length; i++) {
      const seconds = seekTargets[i];
      const entry = {target_seconds: seconds, status: 'running'};
      report.seeks.push(entry);
      const state = await page.evaluate(async target => {
        const video = document.querySelector('video');
        await window.seekToSeconds(target);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return {time: video.currentTime, readyState: video.readyState,
          error: window.mediaError(), ...window.frameQuality()};
      }, seconds);
      Object.assign(entry, state);
      if (!Number.isFinite(state.time) || Math.abs(state.time - seconds) >= .05 || state.readyState < 2 || state.error) {
        entry.status = 'failed';
        throw new Error(`Seek failed: ${JSON.stringify(entry)}`);
      }
      const shot = await page._client().send('Page.captureScreenshot', {format: 'jpeg', quality: 92});
      const filename = `seek-${String(i + 1).padStart(2, '0')}-${seconds.toFixed(3)}.jpg`;
      fs.writeFileSync(path.join(output, filename), Buffer.from(shot.value.data, 'base64'));
      entry.screenshot = `playback-check/${filename}`;
      entry.status = 'passed';
      saveReport();
    }
    report.stage = 'playback';
    for (const target of playbackTargets) {
      const entry = {target_seconds: target, requested_sample_ms: 1100, status: 'running'};
      report.playback.push(entry);
      const sample = await page.evaluate(async seconds => {
        const video = document.querySelector('video');
        await window.seekToSeconds(seconds);
        video.muted = true;
        await Promise.race([
          video.play(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Playback start timeout')), 15000)),
        ]);
        const before = window.frameQuality();
        const start = video.currentTime;
        const wallStart = performance.now();
        await new Promise(resolve => setTimeout(resolve, 1100));
        video.pause();
        const after = window.frameQuality();
        return {start, end: video.currentTime, advanced_seconds: video.currentTime - start,
          measured_wall_seconds: (performance.now() - wallStart) / 1000,
          decoded_frames_before: before.decoded_frames, decoded_frames_after: after.decoded_frames,
          decoded_frames_during_playback: after.decoded_frames - before.decoded_frames,
          decoded_frame_counter: after.decoded_frame_counter, dropped_frames_total: after.dropped_frames,
          muted: video.muted, readyState: video.readyState, error: window.mediaError()};
      }, target);
      Object.assign(entry, sample);
      if (!Number.isFinite(sample.advanced_seconds) || sample.advanced_seconds < .5 ||
          sample.decoded_frames_during_playback < 5 || !sample.muted || sample.error) {
        entry.status = 'failed';
        throw new Error(`Playback failed: ${JSON.stringify(entry)}`);
      }
      entry.status = 'passed';
      saveReport();
    }
    report.status = 'passed';
    report.stage = 'complete';
  } catch (error) {
    report.status = 'failed';
    report.error = error.message;
    for (const entry of [...report.seeks, ...report.playback]) {
      if (entry.status === 'running') {
        entry.status = 'failed';
        entry.error = error.message;
      }
    }
  } finally {
    if (browser) {
      try {
        await withTimeout(browser.close({silent: true}), 10000, 'Browser close');
      } catch (error) {
        report.cleanup_errors.push(error.message);
        try {
          await withTimeout(browser.runner.closeProcess(), 5000, 'Browser process cleanup');
        } catch (cleanupError) {
          report.cleanup_errors.push(cleanupError.message);
        }
        try {browser.disconnect();} catch (cleanupError) {report.cleanup_errors.push(cleanupError.message);}
      }
    }
    if (server) {
      for (const socket of sockets) socket.destroy();
      if (server.listening) {
        try {
          await withTimeout(new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())), 5000, 'HTTP server close');
        } catch (error) {
          report.cleanup_errors.push(error.message);
        }
      }
    }
    if (report.cleanup_errors.length) report.status = 'failed';
    report.file = path.basename(file);
    report.file_path = file;
    report.finished_at = new Date().toISOString();
    saveReport();
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== 'passed') process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(`Could not complete browser check/report: ${error.stack || error.message}`);
  process.exitCode = 1;
});
