#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {fork, spawn} = require('node:child_process');
const esbuild = require('esbuild');
const {WIDTH, HEIGHT, FPS, hash, xmlEscape, atomicJson, renderer} = require('./native.cjs');

const ROOT = path.resolve(__dirname, '../..');
// Source-time review ranges: 30 seconds / 900 frames.
const SAMPLE = [[0, 10], [40, 50], [70, 80]];
const DEFAULT_STILLS = [3, 9, 16, 27, 36, 47, 56, 66, 77, 85, 94, 106, 115];

function options(argv) {
  const args = {mode: null, jobs: 2, crf: null, fixture: false, strictMotion: false, times: null, ranges: null};
  function value(i, flag) { if (argv[i + 1] == null || argv[i + 1].startsWith('--')) throw new Error(`${flag} needs a value`); return argv[i + 1]; }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (['--stills', '--sample', '--full'].includes(arg)) {
      if (args.mode) throw new Error('Choose one of --stills, --sample, --full');
      args.mode = arg.slice(2);
      if (arg === '--stills' && argv[i + 1] && !argv[i + 1].startsWith('--')) args.times = value(i++, arg);
    } else if (['--jobs', '--crf', '--times', '--audio', '--entry', '--ranges'].includes(arg)) {
      args[arg.slice(2)] = value(i++, arg);
    } else if (arg === '--fixture') args.fixture = true;
    else if (arg === '--strict-motion') args.strictMotion = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/v3p/render.cjs --stills [3,9,16] | --sample | --full [--jobs 2] [--crf 18]\n' +
        'Options: --times SECONDS --strict-motion --audio FILE --entry FILE\n' +
        'Diagnostics: --fixture --sample --ranges 0:1,3:4 (separate fixture output directory)');
      process.exit(0);
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!args.mode) throw new Error('Choose --stills, --sample or --full (use --help)');
  args.jobs = Number(args.jobs);
  args.crf = Number(args.crf ?? 18);
  if (![1, 2, 3].includes(args.jobs)) throw new Error('--jobs must be 1, 2 or 3 for this four-CPU environment');
  if (!Number.isInteger(args.crf) || args.crf < 0 || args.crf > 35) throw new Error('--crf must be an integer from 0 to 35');
  if (args.ranges && (!args.fixture || args.mode !== 'sample')) throw new Error('--ranges is restricted to --fixture --sample diagnostics');
  args.ranges = args.ranges ? args.ranges.split(',').map((item) => item.split(':').map(Number)) : SAMPLE;
  for (const range of args.ranges) {
    if (range.length !== 2 || !range.every(Number.isFinite) || range[0] < 0 || range[1] > 120 || range[0] >= range[1] || range.some((n) => Math.abs(n * FPS - Math.round(n * FPS)) > 1e-6)) throw new Error(`Invalid frame-aligned range: ${range}`);
  }
  args.times = args.times == null ? DEFAULT_STILLS : String(args.times).split(',').map(Number);
  if (!args.times.length || args.times.some((time) => !Number.isFinite(time) || time < 0 || time >= 120)) throw new Error('Still times must be between 0 and 119.9667 seconds');
  args.entry = path.resolve(ROOT, args.entry || (args.fixture ? 'scripts/v3p/fixture.tsx' : 'src/v3p/Frame.tsx'));
  args.out = path.resolve(ROOT, args.fixture ? 'out/v3p/fixture' : 'out/v3p');
  args.audio = path.resolve(ROOT, args.audio || (args.fixture ? 'out/v3p/fixture/audio.m4a' : 'public/audio/soundtrack-v3p.m4a'));
  return args;
}

async function run(command, argv, {capture = true, env = process.env} = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, argv, {cwd: ROOT, env, stdio: ['ignore', capture ? 'pipe' : 'inherit', 'pipe']});
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr = (stderr + data).slice(-24000); });
    proc.on('error', reject);
    proc.on('close', (code, signal) => code === 0 ? resolve(stdout) : reject(new Error(`${command} failed (${signal || code}): ${stderr}`)));
  });
}

async function fonts(out) {
  const directory = path.join(out, 'fonts');
  const cache = path.join(out, 'font-cache');
  fs.mkdirSync(directory, {recursive: true});
  fs.mkdirSync(cache, {recursive: true});
  const sourceRecord = path.join(out, 'font-sources.json');
  let previous = {};
  try { previous = JSON.parse(fs.readFileSync(sourceRecord, 'utf8')); } catch {}
  const current = {};
  for (const name of ['Serif', 'Sans']) {
    const source = path.join(ROOT, `public/fonts/${name}.woff`);
    const target = path.join(directory, `${name}.ttf`);
    const sourceHash = hash(fs.readFileSync(source));
    if (!fs.existsSync(target) || previous[name]?.sourceHash !== sourceHash || previous[name]?.ttfHash !== hash(fs.readFileSync(target))) {
      const temporary = `${target}.${process.pid}.tmp`;
      await run('python3', ['-c', 'from fontTools.ttLib import TTFont\nimport sys\nf=TTFont(sys.argv[1]); f.flavor=None; f.save(sys.argv[2])', source, temporary]);
      fs.renameSync(temporary, target);
    }
    current[name] = {sourceHash, ttfHash: hash(fs.readFileSync(target))};
  }
  atomicJson(sourceRecord, current);
  const config = path.join(out, 'fonts.conf');
  fs.writeFileSync(config, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${xmlEscape(directory)}</dir><cachedir>${xmlEscape(cache)}</cachedir><config><rescan><int>0</int></rescan></config></fontconfig>\n`);
  process.env.FONTCONFIG_FILE = config;
  process.env.FONTCONFIG_PATH = path.dirname(config);
  await run('fc-cache', ['-f', directory]);
  const matches = {};
  for (const family of ['Noto Serif CJK SC', 'Noto Sans CJK SC']) {
    const result = (await run('fc-match', ['--format', '%{family}|%{file}', family])).trim();
    if (!result.startsWith(family + '|') || !result.includes(directory)) throw new Error(`Local font mismatch for ${family}: ${result}`);
    matches[family] = result.split('|')[1];
  }
  return {files: current, families: matches};
}

async function compile(args) {
  if (!fs.existsSync(args.entry)) throw new Error(`Frame source is not ready: ${args.entry}. Use --fixture to test the pipeline.`);
  const bundle = path.join(args.out, 'Frame.bundle.cjs');
  const result = await esbuild.build({entryPoints: [args.entry], outfile: bundle, bundle: true, platform: 'node', format: 'cjs', target: 'node20', jsx: 'automatic', metafile: true, packages: 'external', logLevel: 'warning', absWorkingDir: ROOT, define: {'process.env.NODE_ENV': '"production"'}});
  const inputs = Object.keys(result.metafile.inputs).sort().map((file) => ({file, sha256: hash(fs.readFileSync(path.resolve(ROOT, file)))}));
  return {bundle, sourceHash: hash(JSON.stringify(inputs)), inputs, bundleHash: hash(fs.readFileSync(bundle))};
}

function planChunks(args, svgAt, identity) {
  const ranges = args.mode === 'full' ? Array.from({length: 12}, (_, i) => [i * 10, (i + 1) * 10]) : args.ranges;
  fs.mkdirSync(path.join(args.out, 'chunks'), {recursive: true});
  return ranges.map(([from, to], index) => {
    const start = Math.round(from * FPS);
    const end = Math.round(to * FPS);
    const id = `${String(start).padStart(4, '0')}-${String(end).padStart(4, '0')}`;
    const digest = crypto.createHash('sha256');
    for (let frame = start; frame < end; frame++) digest.update(svgAt(frame)).update('\0');
    const svgHash = digest.digest('hex');
    const cacheKey = hash(JSON.stringify({identity, start, end, svgHash, crf: args.crf}));
    const file = path.join(args.out, 'chunks', `${id}-${cacheKey.slice(0, 16)}.mp4`);
    const record = file.replace(/\.mp4$/, '.json');
    let cached = null;
    try {
      const data = JSON.parse(fs.readFileSync(record, 'utf8'));
      if (data.cacheKey === cacheKey && data.frames === end - start && data.bytes === fs.statSync(file).size && data.fileHash === hash(fs.readFileSync(file)) && (!args.strictMotion || data.adjacentDuplicateFrames === 0)) cached = data;
    } catch {}
    console.log(`${cached ? 'CACHE' : 'PLAN '} ${index + 1}/${ranges.length} source ${from.toFixed(3)}–${to.toFixed(3)} s (${end - start} frames)`);
    return {id, start, end, svgHash, cacheKey, file, record, crf: args.crf, root: ROOT, bundle: args.bundle, strictMotion: args.strictMotion, cached};
  });
}

async function renderChunks(jobs, count) {
  const queue = jobs.filter((job) => !job.cached);
  const records = new Map(jobs.filter((job) => job.cached).map((job) => [job.id, job.cached]));
  if (!queue.length) return records;
  const workers = [];
  let finished = 0;
  const total = queue.length;
  const progressAt = new Map();
  try {
    await new Promise((resolve, reject) => {
      const next = (worker) => {
        const job = queue.shift();
        if (job) worker.send(job);
      };
      for (let i = 0; i < Math.min(count, total); i++) {
        const worker = fork(path.join(__dirname, 'worker.cjs'), [], {env: {...process.env, NODE_ENV: 'production', UV_THREADPOOL_SIZE: '2'}, stdio: ['ignore', 'inherit', 'inherit', 'ipc']});
        workers.push(worker);
        worker.on('error', reject);
        worker.on('exit', (code) => { if (finished < total) reject(new Error(`Render worker stopped early (${code})`)); });
        worker.on('message', (message) => {
          if (message.type === 'ready') next(worker);
          if (message.type === 'error') reject(new Error(message.error));
          if (message.type === 'progress') {
            const now = Date.now();
            if (now - (progressAt.get(message.id) || 0) > 12000) {
              console.log(`RENDER ${message.id} ${message.frames}/${message.total} frames · ${(message.frames / message.seconds).toFixed(1)} fps`);
              progressAt.set(message.id, now);
            }
          }
          if (message.type === 'done') {
            records.set(message.id, message.record);
            finished++;
            console.log(`DONE   ${message.id} · ${message.record.seconds.toFixed(1)} s · adjacent repeated frames ${message.record.adjacentDuplicateFrames}`);
            if (finished === total) resolve(); else next(worker);
          }
        });
      }
    });
  } finally { for (const worker of workers) worker.kill('SIGTERM'); }
  return records;
}

async function stills(args, svgAt, times = args.times, name = 'stills') {
  const sharp = require('sharp');
  sharp.concurrency(1);
  const directory = path.join(args.out, name);
  fs.mkdirSync(directory, {recursive: true});
  const rows = Math.ceil(times.length / 3);
  const tiles = [];
  const records = [];
  for (let index = 0; index < times.length; index++) {
    const frame = Math.round(times[index] * FPS);
    const actualTime = frame / FPS;
    const file = path.join(directory, `${String(frame).padStart(4, '0')}-${actualTime.toFixed(3)}s.png`);
    const svg = svgAt(frame);
    await sharp(Buffer.from(svg)).resize(WIDTH, HEIGHT, {fit: 'fill'}).png().toFile(file);
    const thumb = await sharp(file).resize(480, 270).png().toBuffer();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="32"><rect width="480" height="32" fill="#142b29"/><text x="14" y="23" fill="#f4efdf" font-family="Noto Sans CJK SC" font-size="17">SOURCE ${actualTime.toFixed(3)} s  /  FRAME ${frame}</text></svg>`);
    const left = (index % 3) * 480;
    const top = Math.floor(index / 3) * 302;
    tiles.push({input: thumb, left, top}, {input: label, left, top: top + 270});
    records.push({frame, sourceSeconds: actualTime, file: path.relative(args.out, file), svgHash: hash(svg)});
  }
  const sheet = path.join(args.out, `${name}-contact-sheet.png`);
  await sharp({create: {width: 1440, height: rows * 302, channels: 3, background: '#142b29'}}).composite(tiles).png().toFile(sheet);
  atomicJson(path.join(directory, 'manifest.json'), records);
  console.log(`STILLS ${records.length} frames · ${path.relative(ROOT, sheet)}`);
  return {sheet, records};
}

async function mux(args, jobs) {
  const concat = path.join(args.out, `${args.mode}-concat.txt`);
  // Absolute paths use concat-demuxer quoting; a quote is escaped by closing and reopening it.
  fs.writeFileSync(concat, jobs.map((job) => `file '${job.file.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const output = path.join(args.out, args.mode === 'full' ? 'dingfengbo-v3-pulse.mp4' : 'dingfengbo-v3-pulse-sample.mp4');
  const temporary = output.replace(/\.mp4$/, `.${process.pid}.tmp.mp4`);
  const duration = jobs.reduce((sum, job) => sum + (job.end - job.start) / FPS, 0);
  const filters = [];
  // Split before independent trims so every selected scene uses its source-time audio.
  filters.push(`[1:a]asplit=${jobs.length}${jobs.map((_, i) => `[src${i}]`).join('')}`);
  jobs.forEach((job, i) => filters.push(`[src${i}]atrim=start_sample=${job.start * 1600}:end_sample=${job.end * 1600},asetpts=PTS-STARTPTS[a${i}]`));
  filters.push(`${jobs.map((_, i) => `[a${i}]`).join('')}concat=n=${jobs.length}:v=0:a=1[aout]`);
  // Resample before trimming: 48 kHz / 30 fps = exactly 1600 audio samples per video frame.
  filters[0] = `[1:a]aresample=48000,asplit=${jobs.length}${jobs.map((_, i) => `[src${i}]`).join('')}`;
  try {
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', concat, '-i', args.audio,
      '-filter_complex_threads', '1', '-filter_complex', filters.join(';'), '-map', '0:v:0', '-map', '[aout]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-t', String(duration),
      '-movflags', '+faststart', '-metadata', 'title=定风波 · 节奏版', '-metadata', 'comment=Native SVG animation, 1920x1080, 30 fps', temporary]);
    const probe = JSON.parse(await run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', temporary]));
    const video = probe.streams.find((stream) => stream.codec_type === 'video');
    const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
    const frames = jobs.reduce((sum, job) => sum + job.end - job.start, 0);
    if (!video || video.width !== WIDTH || video.height !== HEIGHT || video.r_frame_rate !== '30/1' || Number(video.nb_frames) !== frames || video.codec_name !== 'h264' || !audio || audio.codec_name !== 'aac' || Number(audio.sample_rate) !== 48000 || audio.channels !== 2 || Math.abs(Number(video.duration) - duration) > 0.034 || Math.abs(Number(audio.duration) - duration) > 0.05) throw new Error(`Output media validation failed: ${JSON.stringify(probe)}`);
    fs.renameSync(temporary, output);
    return {output, probe, frames, duration};
  } catch (error) { try { fs.unlinkSync(temporary); } catch {} throw error; }
}

async function main() {
  const started = Date.now();
  const args = options(process.argv.slice(2));
  process.chdir(ROOT);
  fs.mkdirSync(args.out, {recursive: true});
  console.log(`V3 pulse · ${args.mode} · ${WIDTH}×${HEIGHT} · ${FPS} fps · ${args.jobs} workers${args.fixture ? ' · FIXTURE ONLY' : ''}`);
  const localFonts = await fonts(args.out);
  const source = await compile(args);
  args.bundle = source.bundle;
  const svgAt = renderer(source.bundle, ROOT);
  if (args.mode === 'stills') {
    const result = await stills(args, svgAt);
    atomicJson(path.join(args.out, 'stills-record.json'), {source, fonts: localFonts, ...result, seconds: (Date.now() - started) / 1000});
    return;
  }
  if (args.fixture && !fs.existsSync(args.audio)) {
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'aevalsrc=0.035*sin(2*PI*(220*t+3*t*t)):s=48000:d=120', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', args.audio]);
  }
  if (!fs.existsSync(args.audio)) throw new Error(`Soundtrack is not ready: ${args.audio}`);
  const audioProbe = JSON.parse(await run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', args.audio]));
  const requiredAudioDuration = args.mode === 'full' ? 120 : Math.max(...args.ranges.map((range) => range[1]));
  if (!audioProbe.streams.some((stream) => stream.codec_type === 'audio') || Number(audioProbe.format.duration) + 1 / FPS < requiredAudioDuration) throw new Error(`Soundtrack must cover source time ${requiredAudioDuration} s`);
  const sharp = require('sharp');
  const identity = {
    version: 1, rendererHash: hash(fs.readFileSync(__filename)), workerHash: hash(fs.readFileSync(path.join(__dirname, 'worker.cjs'))), nativeHash: hash(fs.readFileSync(path.join(__dirname, 'native.cjs'))),
    fonts: localFonts.files, sharp: sharp.versions, react: require('react/package.json').version, node: process.versions.node,
    ffmpeg: (await run('ffmpeg', ['-version'])).split('\n')[0], width: WIDTH, height: HEIGHT, fps: FPS,
  };
  const jobs = planChunks(args, svgAt, identity);
  const records = await renderChunks(jobs, args.jobs);
  const repeatedChunkBoundaries = jobs.slice(1).flatMap((job, index) => {
    const previous = records.get(jobs[index].id);
    const current = records.get(job.id);
    return previous.lastPixelHash === current.firstPixelHash ? [{previousSourceFrame: jobs[index].end - 1, nextSourceFrame: job.start}] : [];
  });
  if (args.strictMotion && repeatedChunkBoundaries.length) throw new Error(`Adjacent duplicate frames at chunk boundaries: ${JSON.stringify(repeatedChunkBoundaries)}`);
  const result = await mux(args, jobs);
  let review = null;
  if (args.mode === 'sample') {
    const times = args.ranges.flatMap(([start, end]) => [start, (start + end) / 2, end - 1 / FPS]);
    review = await stills(args, svgAt, times, 'sample-review');
  }
  const record = {
    mode: args.mode, fixture: args.fixture, createdAt: new Date().toISOString(), source, fonts: localFonts,
    audio: {file: args.audio, sha256: hash(fs.readFileSync(args.audio))},
    sourceRanges: jobs.map((job) => [job.start / FPS, job.end / FPS]),
    frames: result.frames, durationSeconds: result.duration, width: WIDTH, height: HEIGHT, fps: FPS,
    seconds: (Date.now() - started) / 1000, jobs: args.jobs, crf: args.crf, output: result.output,
    outputBytes: fs.statSync(result.output).size, outputSha256: hash(fs.readFileSync(result.output)),
    chunks: jobs.map((job) => ({file: job.file, cacheHit: !!job.cached, ...records.get(job.id)})), repeatedChunkBoundaries, review, media: result.probe,
  };
  atomicJson(path.join(args.out, `${args.mode}-record.json`), record);
  console.log(`OUTPUT ${path.relative(ROOT, result.output)} · ${result.frames} frames · ${result.duration} s · elapsed ${record.seconds.toFixed(1)} s`);
}

main().catch((error) => { console.error(error.stack || String(error)); process.exitCode = 1; });
