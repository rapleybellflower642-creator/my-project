#!/usr/bin/env node
'use strict';

// Explicit, silent 24-frame diagnostic. Never renders a full film or a review sample.
const fs = require('node:fs');
const path = require('node:path');
const {fork} = require('node:child_process');
const {bundle} = require('@remotion/bundler');
const {openBrowser, selectComposition, renderMedia, renderStill} = require('@remotion/renderer');
const esbuild = require('esbuild');
const {renderer, hash, atomicJson} = require('./native.cjs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'out/v3p/browser-benchmark');
const START = 450, END = 473, COUNT = END - START + 1;
const clock = () => performance.now();

function sourceHash() {
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else files.push([path.relative(ROOT, file), hash(fs.readFileSync(file))]);
    }
  }
  visit(path.join(ROOT, 'src'));
  return hash(JSON.stringify(files.sort(([a], [b]) => a.localeCompare(b))));
}

async function nativeBenchmark() {
  const nativeBundle = path.join(OUT, 'Frame.bundle.cjs');
  const began = clock();
  await esbuild.build({entryPoints: [path.join(ROOT, 'src/v3p/Frame.tsx')], outfile: nativeBundle, bundle: true,
    platform: 'node', format: 'cjs', target: 'node20', jsx: 'automatic', packages: 'external', logLevel: 'warning', define: {'process.env.NODE_ENV': '"production"'}});
  const compileSeconds = (clock() - began) / 1000;
  const svgAt = renderer(nativeBundle, ROOT);
  const fontConfig = [path.join(ROOT, 'out/v3p/fonts.conf'), path.join(ROOT, 'out/v3p/fixture/fonts.conf')].find(fs.existsSync);
  if (!fontConfig) throw new Error('Run the native fixture or still preparation first to initialize local fonts');
  process.env.FONTCONFIG_FILE = fontConfig;
  process.env.FONTCONFIG_PATH = path.dirname(fontConfig);
  const jobs = [[450, 462], [462, 474]].map(([start, end], index) => {
    const {createHash} = require('node:crypto');
    const digest = createHash('sha256');
    for (let frame = start; frame < end; frame++) digest.update(svgAt(frame)).update('\0');
    return {id: `native-${index}`, start, end, svgHash: digest.digest('hex'), cacheKey: 'diagnostic',
      file: path.join(OUT, `native-${start}-${end - 1}.mp4`), record: path.join(OUT, `native-${start}-${end - 1}.json`),
      crf: 18, root: ROOT, bundle: nativeBundle, strictMotion: true};
  });
  const workers = [];
  const renderStart = clock();
  try {
    const chunks = await Promise.all(jobs.map(job => new Promise((resolve, reject) => {
      const worker = fork(path.join(__dirname, 'worker.cjs'), [], {env: {...process.env, NODE_ENV: 'production',
        FONTCONFIG_FILE: fontConfig, FONTCONFIG_PATH: path.dirname(fontConfig), UV_THREADPOOL_SIZE: '2'},
        stdio: ['ignore', 'inherit', 'inherit', 'ipc']});
      workers.push(worker);
      let completed = false;
      worker.on('error', reject);
      worker.on('exit', code => {if (!completed) reject(new Error(`Native benchmark worker exited: ${code}`));});
      worker.on('message', message => {
        if (message.type === 'ready') worker.send(job);
        if (message.type === 'error') reject(new Error(message.error));
        if (message.type === 'done') {completed = true; resolve(message.record);}
      });
    })));
    const seconds = (clock() - renderStart) / 1000;
    const sharp = require('sharp');
    sharp.concurrency(1);
    const still = path.join(OUT, 'native-450.png');
    await sharp(Buffer.from(svgAt(START))).png().toFile(still);
    return {compileSeconds, frames: COUNT, workers: 2, renderSeconds: seconds, fps: COUNT / seconds, chunks, still};
  } finally {workers.forEach(worker => worker.kill('SIGTERM'));}
}

(async () => {
  process.chdir(ROOT);
  fs.mkdirSync(OUT, {recursive: true});
  const mode = process.argv[2];
  if (!['--bundle-only', '--run'].includes(mode) || process.argv.length !== 3) throw new Error('Use --bundle-only, then --run when the machine is available');
  const bundleRecord = path.join(OUT, 'bundle-record.json');
  if (mode === '--bundle-only') {
    const source = sourceHash(), start = clock();
    const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), outDir: path.join(OUT, 'bundle')});
    if (sourceHash() !== source) throw new Error('Source changed while bundling; rebuild after edits settle');
    const result = {serveUrl, sourceHash: source, bundleSeconds: (clock() - start) / 1000, createdAt: new Date().toISOString()};
    atomicJson(bundleRecord, result);
    console.log(JSON.stringify(result));
    return;
  }
  const prepared = JSON.parse(fs.readFileSync(bundleRecord, 'utf8'));
  if (sourceHash() !== prepared.sourceHash) throw new Error('Source changed since bundle; repeat --bundle-only');
  const report = {status: 'running', composition: 'DingFengBoV3Pulse', frames: COUNT, frameRange: [START, END],
    width: 1920, height: 1080, fps: 30, concurrency: 2, inputProps: {renderAudio: false},
    browserExecutable: '/usr/bin/chromium', imageFormat: 'png', bundleSeconds: prepared.bundleSeconds, sourceHash: prepared.sourceHash};
  let browser;
  try {
    let start = clock();
    browser = await openBrowser('chrome', {browserExecutable: '/usr/bin/chromium', logLevel: 'error'});
    report.openBrowserSeconds = (clock() - start) / 1000;
    start = clock();
    const composition = await selectComposition({serveUrl: prepared.serveUrl, id: report.composition,
      inputProps: report.inputProps, puppeteerInstance: browser, logLevel: 'error'});
    report.selectCompositionSeconds = (clock() - start) / 1000;
    const progress = [];
    start = clock();
    await renderMedia({serveUrl: prepared.serveUrl, composition, inputProps: report.inputProps, puppeteerInstance: browser,
      frameRange: [START, END], outputLocation: path.join(OUT, 'browser-450-473.mp4'), codec: 'h264', crf: 18,
      x264Preset: 'fast', pixelFormat: 'yuv420p', imageFormat: 'png', concurrency: 2, muted: true,
      timeoutInMilliseconds: 90000, logLevel: 'error',
      ffmpegOverride: ({args}) => [...args.slice(0, -1), '-threads', '1', args.at(-1)],
      onProgress: ({renderedFrames, encodedFrames}) => {
        if (renderedFrames > 0 && (!progress.length || renderedFrames > progress.at(-1).frames)) {
          const value = {frames: renderedFrames, encodedFrames, seconds: (clock() - start) / 1000};
          progress.push(value);
          console.log(`BROWSER ${renderedFrames}/${COUNT} frames · ${value.seconds.toFixed(2)} s`);
        }
      },
    });
    report.renderSeconds = (clock() - start) / 1000;
    report.overallRenderFps = COUNT / report.renderSeconds;
    report.progress = progress;
    report.firstFrameSeconds = progress[0]?.seconds;
    const steadyStart = progress.find(p => p.frames >= 4), steadyEnd = progress.at(-1);
    report.steady = steadyStart && steadyEnd.frames > steadyStart.frames ? {
      fromCompletedFrame: steadyStart.frames, toCompletedFrame: steadyEnd.frames,
      frames: steadyEnd.frames - steadyStart.frames, seconds: steadyEnd.seconds - steadyStart.seconds,
      fps: (steadyEnd.frames - steadyStart.frames) / (steadyEnd.seconds - steadyStart.seconds),
    } : null;
    // A lossless source-frame screenshot supports visual comparison with native output.
    report.browserStill = path.join(OUT, 'browser-450.png');
    await renderStill({serveUrl: prepared.serveUrl, composition, inputProps: report.inputProps, puppeteerInstance: browser,
      frame: START, output: report.browserStill, imageFormat: 'png', logLevel: 'error', timeoutInMilliseconds: 90000});
    await browser.close({silent: true}); browser = undefined;
    if (sourceHash() !== prepared.sourceHash) throw new Error('Source changed during browser benchmark; comparison would be invalid');
    report.native = await nativeBenchmark();
    if (sourceHash() !== prepared.sourceHash) throw new Error('Source changed during native benchmark; comparison would be invalid');
    report.status = 'passed';
    console.log(JSON.stringify({bundleSeconds: report.bundleSeconds, openBrowserSeconds: report.openBrowserSeconds,
      selectCompositionSeconds: report.selectCompositionSeconds, browserRenderSeconds: report.renderSeconds,
      browserFps: report.overallRenderFps, browserSteadyFps: report.steady?.fps, nativeFps: report.native.fps}));
  } catch (error) {report.status = 'failed'; report.error = error.stack || String(error); throw error;}
  finally {if (browser) await browser.close({silent: true}); atomicJson(path.join(OUT, 'benchmark-record.json'), report);}
})().catch(error => {console.error(error.stack || String(error)); process.exitCode = 1;});
