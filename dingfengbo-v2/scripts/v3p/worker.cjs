'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
const {WIDTH, HEIGHT, FPS, hash, atomicJson, renderer} = require('./native.cjs');

// FONTCONFIG_FILE is set by the coordinator before this process starts.
const sharp = require('sharp');
sharp.concurrency(1);
sharp.cache({memory: 48, files: 0, items: 32});
let child;
let childCompleted;
let activeTemporary;
let stopping = false;
const send = (message) => { if (process.connected) process.send(message, () => {}); };

async function renderChunk(job) {
  const svgAt = renderer(job.bundle, job.root);
  const temporary = `${job.file}.${process.pid}.tmp.mp4`;
  activeTemporary = temporary;
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pixel_format', 'rgba',
    '-video_size', `${WIDTH}x${HEIGHT}`, '-framerate', String(FPS), '-i', 'pipe:0', '-an',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', String(job.crf), '-pix_fmt', 'yuv420p',
    '-threads', '1', '-filter_threads', '1', '-r', String(FPS), '-fps_mode', 'cfr',
    '-g', String(FPS * 2), '-keyint_min', String(FPS * 2), '-sc_threshold', '0',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', temporary];
  child = spawn('ffmpeg', args, {stdio: ['pipe', 'ignore', 'pipe']});
  let stderr = '';
  let pipeError;
  child.stderr.on('data', (data) => { stderr = (stderr + data).slice(-16000); });
  child.stdin.on('error', (error) => { pipeError = error; });
  let processResult;
  const completed = new Promise((resolve) => {
    child.on('error', (error) => resolve({error}));
    child.on('close', (code, signal) => resolve({code, signal}));
  }).then((result) => { processResult = result; return result; });
  childCompleted = completed;
  const prematureExit = () => new Error(`FFmpeg closed before receiving all frames: ${processResult?.error?.message || processResult?.signal || processResult?.code || 'closed stdin'}\n${stderr}`);
  const started = Date.now();
  const svgDigest = crypto.createHash('sha256');
  const pixelDigest = crypto.createHash('sha256');
  const motion = {adjacentDuplicateFrames: 0, firstPixelHash: null, lastPixelHash: null, duplicateFrameExamples: []};
  try {
    for (let frame = job.start; frame < job.end; frame++) {
      const svg = svgAt(frame);
      svgDigest.update(svg).update('\0');
      const {data, info} = await sharp(Buffer.from(svg), {density: 72, unlimited: false})
        .resize(WIDTH, HEIGHT, {fit: 'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject: true});
      if (info.width !== WIDTH || info.height !== HEIGHT || info.channels !== 4) throw new Error('Unexpected raw frame dimensions');
      const pixelHash = hash(data);
      pixelDigest.update(pixelHash);
      if (!motion.firstPixelHash) motion.firstPixelHash = pixelHash;
      if (pixelHash === motion.lastPixelHash) {
        motion.adjacentDuplicateFrames++;
        if (motion.duplicateFrameExamples.length < 12) motion.duplicateFrameExamples.push(frame);
      }
      motion.lastPixelHash = pixelHash;
      if (pipeError) throw pipeError;
      if (processResult || child.stdin.destroyed) throw prematureExit();
      if (!child.stdin.write(data)) await Promise.race([
        once(child.stdin, 'drain'),
        completed.then(() => { throw prematureExit(); }),
      ]);
      if ((frame - job.start + 1) % FPS === 0) send({type: 'progress', id: job.id, frames: frame - job.start + 1, total: job.end - job.start, seconds: (Date.now() - started) / 1000});
    }
    child.stdin.end();
    const result = await completed;
    if (result.error || result.code !== 0) throw new Error(`FFmpeg failed: ${result.error?.message || result.signal || result.code}\n${stderr}`);
    if (svgDigest.digest('hex') !== job.svgHash) throw new Error(`Non-deterministic FrameSvg output in ${job.id}; render must be a pure function of frame`);
    if (job.end - job.start > 1 && motion.adjacentDuplicateFrames === job.end - job.start - 1) throw new Error(`All frames are visually identical in ${job.id}; no static-frame fallback is permitted`);
    if (job.strictMotion && motion.adjacentDuplicateFrames > 0) throw new Error(`Found ${motion.adjacentDuplicateFrames} adjacent duplicate frames in ${job.id}`);
    fs.renameSync(temporary, job.file);
    const record = {
      cacheKey: job.cacheKey, svgHash: job.svgHash, startFrame: job.start, endFrameExclusive: job.end,
      frames: job.end - job.start, width: WIDTH, height: HEIGHT, fps: FPS, crf: job.crf,
      seconds: (Date.now() - started) / 1000, bytes: fs.statSync(job.file).size,
      fileHash: hash(fs.readFileSync(job.file)), pixelSequenceHash: pixelDigest.digest('hex'), ...motion,
    };
    atomicJson(job.record, record);
    return record;
  } catch (error) {
    child.kill('SIGTERM');
    child.stdin.destroy();
    await completed;
    try { fs.unlinkSync(temporary); } catch {}
    throw error;
  } finally { child = undefined; childCompleted = undefined; activeTemporary = undefined; }
}

process.on('message', async (job) => {
  try { send({type: 'done', id: job.id, record: await renderChunk(job)}); }
  catch (error) { send({type: 'error', id: job.id, error: error.stack || String(error)}); }
});
async function stop(code) {
  if (stopping) return;
  stopping = true;
  const temporary = activeTemporary;
  child?.kill('SIGTERM');
  child?.stdin.destroy();
  if (childCompleted) await childCompleted;
  if (temporary) { try { fs.unlinkSync(temporary); } catch {} }
  process.exit(code);
}
process.on('disconnect', () => { void stop(0); });
process.on('SIGTERM', () => { void stop(143); });
send({type: 'ready'});
