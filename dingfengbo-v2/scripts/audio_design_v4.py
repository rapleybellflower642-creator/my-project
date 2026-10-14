#!/usr/bin/env python3
"""Build V4's instrumental score from the exact public/v4/timeline.json duration.

The complete uploaded song loops at its native speed/pitch with equal-power
crossfades. Sparse, seeded Foley follows selected chapter/object/weather shots.
Only the compact AAC and reports go in public; long WAVs stay under out/v4.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

import numpy as np
import audio_design_v2 as synth

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'public/audio'
BUILD = ROOT/'out/v4'
SR = 48000
SEED = 10822335
MUSIC_GAIN = .76
CROSSFADE_SECONDS = 1.0


def run(arguments: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(arguments, check=True, capture_output=True)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024*1024), b''):
            digest.update(block)
    return digest.hexdigest()


def probe(path: Path) -> dict:
    return json.loads(run(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration,size:stream=codec_type,codec_name,sample_rate,channels,duration',
        '-of', 'json', str(path)]).stdout)


def measure(path: Path) -> dict:
    result = run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af',
                  'loudnorm=I=-15:TP=-1.8:LRA=11:print_format=json', '-f', 'null', '-'])
    match = re.search(r'\{\s*"input_i".*?\}', result.stderr.decode(), re.S)
    if not match:
        raise RuntimeError('FFmpeg loudness measurement missing')
    return json.loads(match.group())


def source_file(upload: Path | None) -> Path:
    destination = OUT/'bgm-v4-original.mp3'
    OUT.mkdir(parents=True, exist_ok=True)
    if upload is not None:
        if destination.exists() and sha256(destination) != sha256(upload):
            raise RuntimeError('Existing V4 source differs from upload; preserve it and resolve explicitly')
        if not destination.exists():
            shutil.copyfile(upload, destination)
        assert sha256(destination) == sha256(upload)
    if not destination.is_file():
        raise FileNotFoundError('Provide the original upload with --source /path/to/算力小曲.mp3')
    return destination


def layer(duration: float, parts: list[tuple[float, np.ndarray, float]]) -> np.ndarray:
    result = np.zeros(round(duration*SR), np.float32)
    for at, sound, gain in parts:
        synth.insert(result, sound, at, gain)
    return synth.peak(result)


def effect(kind: str) -> tuple[np.ndarray, float, str]:
    if kind == 'prison':
        return layer(.95, [(0, synth.grounded_impact(.72), .72),
                          (.006, synth.bamboo(1.48), .48),
                          (.126, synth.bronze_edge(.6), .13)]), .18, 'wood door / muted latch'
    if kind == 'soil':
        return layer(.86, [(0, synth.bamboo(1.58), .62),
                          (.018, synth.grass_friction(.63, 1.15), .72)]), .18, 'wood shaft / granular soil'
    if kind == 'river':
        return layer(1.45, [(0, synth.shallow_water(1.55), .8),
                           (.16, synth.shallow_water(.92), .3)]), .13, 'boat water'
    if kind == 'rain':
        return layer(1.45, [(0, synth.shallow_water(.95), .34),
                           (.026, synth.water_drop(.67), .42),
                           (.22, synth.water_drop(.52, True), .22),
                           (.41, synth.water_drop(.44, True), .13)]), .13, 'rain drops / leaves'
    if kind == 'cane':
        return synth.bamboo(1.02), .16, 'bamboo contact'
    if kind == 'step':
        return synth.straw_step(), .16, 'wet straw sole'
    if kind == 'wind':
        return synth.cool_air(1.8), .105, 'soft moving air'
    if kind == 'sun':
        return layer(1.45, [(0, synth.warm_air(1.42), .70),
                           (.075, synth.bronze_edge(.92), .12)]), .115, 'warm air / fine bronze edge'
    if kind == 'turn':
        return synth.grass_friction(.64, .74), .105, 'close sleeve fiber'
    if kind == 'release':
        return synth.warm_air(1.7), .075, 'receding weather / gentle air'
    if kind == 'paper':
        return synth.paper_fold(), .115, 'paper fiber'
    return layer(.83, [(0, synth.bamboo(1.42), .38),
                      (.010, synth.grounded_impact(.74), .44)]), .105, 'quiet chapter wood contact'


# Exact words keep generic commentary from triggering a sound on every subtitle.
RULES = [
    ('prison', r'乌台|牢狱|入狱|狱中|prison|trial', 8),
    ('soil', r'耕田|种地|田地|锄|耕种|农事|farming|soil', 8),
    ('river', r'渡江|江面|江水|舟|船|river|boat', 7),
    ('cane', r'竹杖|竹仗|bamboo|cane', 7),
    ('step', r'芒鞋|脚步|徐行|步履|footstep|walking', 6),
    ('wind', r'料峭|春风|微冷|wind|cold', 6),
    ('sun', r'斜照|夕阳|阳光|sunlight|sunshine', 6),
    ('paper', r'词序|词稿|奏章|案卷|纸|paper|manuscript', 6),
    ('rain', r'穿林打叶|风雨|烟雨|雨中|雨具|rain|storm', 4),
    ('turn', r'回首|回望|lookback', 4),
    ('release', r'也无风雨|归去|freedom|release', 3),
]


def strings(value: object) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [text for item in value for text in strings(item)]
    if isinstance(value, dict):
        return [text for key, item in value.items() if key not in ('id', 'chapter') for text in strings(item)]
    return []


def choose_cues(timeline: dict) -> list[dict]:
    fps, total = timeline['fps'], timeline['durationInFrames']
    seconds = total/fps
    target_count = min(42, max(30, round(seconds/16)))
    last_cue = total-12*fps
    candidates = []
    for index, shot in enumerate(timeline['shots']):
        text = ' '.join(strings(shot))
        matches = [(kind, score) for kind, pattern, score in RULES if re.search(pattern, text, re.I)]
        kind, score = max(matches, key=lambda pair: pair[1]) if matches else ('chapter', 0)
        frame = int(shot['from'])+min(8, max(0, int(shot['duration'])//6))
        if 0 <= frame < last_cue:
            candidates.append({'frame': frame, 'kind': kind, 'priority': score,
                               'shot_id': shot.get('id', f'shot-{index}'),
                               'scene': shot.get('scene', ''), 'chapter': shot.get('chapter', ''),
                               'selection': 'selected object / weather shot' if matches else 'selected scene transition'})
    chosen = []
    for chapter in timeline.get('chapters', []):
        at = int(chapter['from'])+(13 if int(chapter['from']) == 0 else 3)
        if at >= last_cue:
            continue
        following = next((item for item in candidates if item['frame'] >= at-13), None)
        kind = following['kind'] if following and following['priority'] >= 6 else 'chapter'
        chosen.append({'frame': at, 'kind': kind, 'priority': 9,
                       'shot_id': following['shot_id'] if following else '',
                       'scene': following['scene'] if following else '',
                       'chapter': chapter.get('id', ''), 'selection': 'chapter transition'})
    if not chosen:
        chosen.append({'frame': 13, 'kind': 'chapter', 'priority': 9, 'shot_id': '',
                       'scene': '', 'chapter': '', 'selection': 'opening'})
    # Spread selections over the film, preferring concrete actions near each anchor.
    # An eight-second gap prevents repeated subtitle-by-subtitle punctuation.
    minimum_gap = min(8*fps, int(total/(target_count*1.8)))
    for target in np.linspace(0, last_cue, target_count):
        if len(chosen) >= target_count:
            break
        if min(abs(previous['frame']-target) for previous in chosen) < minimum_gap:
            continue
        available = [item for item in candidates
                     if all(abs(item['frame']-previous['frame']) >= minimum_gap for previous in chosen)]
        if not available:
            break
        best = min(available, key=lambda item: abs(item['frame']-target)-item['priority']*fps*1.5)
        # Generic transitions are quiet; favor diverse materials over repeating rain.
        chosen.append(best)
    # If chapter-heavy timelines occupied the early anchors, fill the widest gaps.
    while len(chosen) < target_count:
        available = [item for item in candidates
                     if all(abs(item['frame']-previous['frame']) >= 4*fps for previous in chosen)]
        if not available:
            break
        chosen.append(max(available, key=lambda item: min(abs(item['frame']-previous['frame']) for previous in chosen)))
    chosen.sort(key=lambda item: item['frame'])
    if not 30 <= len(chosen) <= 50:
        raise ValueError(f'Expected 30–50 sparse cues for the long timeline; found {len(chosen)}')
    return chosen


def validate_timeline(timeline: dict) -> tuple[int, int]:
    fps, frames = int(timeline['fps']), int(timeline['durationInFrames'])
    assert fps == 30 and frames > 0
    assert abs(float(timeline['totalSeconds'])-frames/fps) <= .001
    assert timeline['shots'], 'Timeline requires actual shots'
    for shot in timeline['shots']:
        assert int(shot['from']) >= 0 and int(shot['duration']) > 0
        assert int(shot['from'])+int(shot['duration']) <= frames
    return fps, frames*(SR//fps)


def build(timeline_path: Path, bgm: Path, reuse_master: bool = False) -> dict:
    timeline_bytes = timeline_path.read_bytes()
    timeline = json.loads(timeline_bytes)
    timeline_hash = hashlib.sha256(timeline_bytes).hexdigest()
    fps, sample_count = validate_timeline(timeline)
    duration = sample_count/SR
    source_hash = sha256(bgm)
    decoded = run(['ffmpeg', '-v', 'error', '-i', str(bgm), '-ar', str(SR),
                   '-ac', '2', '-f', 'f32le', 'pipe:1']).stdout
    decoded_hash = hashlib.sha256(decoded).hexdigest()
    source = np.frombuffer(decoded, np.float32).reshape(-1, 2)
    crossfade = round(CROSSFADE_SECONDS*SR)
    assert len(source) > crossfade*4
    stride = len(source)-crossfade
    cues = choose_cues(timeline)
    synth.RNG = np.random.default_rng(SEED)
    BUILD.mkdir(parents=True, exist_ok=True)
    events, loops = [], []
    master = BUILD/'soundtrack-v4.wav'
    manifest_path = BUILD/'audio-v4-master-manifest.json'
    if reuse_master:
        # Explicit recovery path for an already-produced PCM master, e.g. when
        # AAC container verification failed after successful waveform generation.
        metadata = probe(master)
        stream = metadata['streams'][0]
        assert stream['codec_name'] == 'pcm_s24le'
        assert int(stream['sample_rate']) == SR and stream['channels'] == 2
        assert abs(float(stream['duration'])-duration) <= 1/SR
        manifest = json.loads(manifest_path.read_text())
        assert manifest['timeline_sha256'] == timeline_hash
        assert manifest['input_sha256'] == source_hash
        assert manifest['wav_master_sha256'] == sha256(master)
        angle = np.linspace(0, math.pi/2, crossfade)
        incoming, outgoing = np.sin(angle).astype(np.float32), np.cos(angle).astype(np.float32)
        for index, start in enumerate(range(0, sample_count, stride)):
            count = min(len(source), sample_count-start)
            loops.append({'loop_index': index, 'output_start_sample': start,
                          'output_start_seconds': start/SR, 'source_start_sample': 0,
                          'source_samples_used': count,
                          'crossfade_start_seconds': start/SR if index else None,
                          'crossfade_end_seconds': (start+min(crossfade, count))/SR if index else None,
                          'source_speed': 1.0, 'pitch_shift_semitones': 0})
        for index, cue in enumerate(cues):
            sound, gain, material = effect(cue['kind'])
            at = cue['frame']/fps
            ambience = min(5.8, duration-at-3) if cue['kind'] in ('rain', 'wind') and index%2 == 0 else 0
            events.append({**cue, 'seconds': round(at, 6), 'sample': cue['frame']*(SR//fps),
                           'material': material, 'gain_linear': gain,
                           'pan': (-.18, .13, -.05, .19, 0)[index%5],
                           'sound_duration_seconds': len(sound)/SR, 'ambience_seconds': ambience})
        normalization = manifest['normalization']
    else:
        with tempfile.TemporaryDirectory(prefix='v4-audio-', dir=BUILD) as folder:
            temporary = Path(folder)
            mix = np.memmap(temporary/'mix.f32', mode='w+', dtype=np.float32, shape=(sample_count, 2))
            mix[:] = 0
            angle = np.linspace(0, math.pi/2, crossfade)
            incoming, outgoing = np.sin(angle).astype(np.float32), np.cos(angle).astype(np.float32)
            incoming[0], incoming[-1], outgoing[0], outgoing[-1] = 0, 1, 1, 0
            for index, start in enumerate(range(0, sample_count, stride)):
                count = min(len(source), sample_count-start)
                segment = source[:count].copy()*MUSIC_GAIN
                if index:
                    overlap = min(crossfade, count)
                    mix[start:start+overlap] *= outgoing[:overlap, None]
                    segment[:overlap] *= incoming[:overlap, None]
                mix[start:start+count] += segment
                loops.append({'loop_index': index, 'output_start_sample': start,
                              'output_start_seconds': start/SR, 'source_start_sample': 0,
                              'source_samples_used': count,
                              'crossfade_start_seconds': start/SR if index else None,
                              'crossfade_end_seconds': (start+min(crossfade, count))/SR if index else None,
                              'source_speed': 1.0, 'pitch_shift_semitones': 0})
            del segment
            for index, cue in enumerate(cues):
                sound, gain, material = effect(cue['kind'])
                pan = (-.18, .13, -.05, .19, 0)[index % 5]
                at = cue['frame']/fps
                synth.stereo_add(mix, at, sound, gain, pan, .13)
                ambience = 0
                # Only a few weather cues receive a short, quiet continuity bed.
                if cue['kind'] in ('rain', 'wind') and index % 2 == 0:
                    span = min(5.8, duration-at-3)
                    if span > .3:
                        t = synth.time(span)
                        low, high = (1400, 7200) if cue['kind'] == 'rain' else (130, 1200)
                        for channel in (0, 1):
                            bed = synth.noise(len(t), low, high)*np.sin(np.pi*t/span)**1.4*.0019
                            start = round(at*SR)
                            mix[start:start+len(t), channel] += bed
                        ambience = span
                events.append({**cue, 'seconds': round(at, 6), 'sample': cue['frame']*(SR//fps),
                               'material': material, 'gain_linear': gain, 'pan': pan,
                               'sound_duration_seconds': len(sound)/SR, 'ambience_seconds': ambience})
            fade_in, fade_out = round(.3*SR), round(2*SR)
            mix[:fade_in] *= np.sin(np.linspace(0, math.pi/2, fade_in)).astype(np.float32)[:, None]**2
            mix[-fade_out:] *= np.cos(np.linspace(0, math.pi/2, fade_out)).astype(np.float32)[:, None]**2
            mix[0], mix[-1] = 0, 0
            mix.flush()
            premix = temporary/'premix.wav'
            run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2',
                 '-i', str(temporary/'mix.f32'), '-c:a', 'pcm_s24le', str(premix)])
            del mix
            first = measure(premix)
            normalizer = (
                f"loudnorm=I=-15:TP=-1.8:LRA=11:measured_I={first['input_i']}:"
                f"measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:"
                f"measured_thresh={first['input_thresh']}:offset={first['target_offset']}:"
                f'linear=true:print_format=json,aresample={SR},atrim=end_sample={sample_count}'
            )
            master = BUILD/'soundtrack-v4.wav'
            result = run(['ffmpeg', '-v', 'info', '-y', '-i', str(premix), '-af', normalizer,
                          '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s24le', str(master)])
            match = re.search(r'\{\s*"input_i".*?\}', result.stderr.decode(), re.S)
            normalization = json.loads(match.group()) if match else {}
        manifest_path.write_text(json.dumps({
            'timeline_sha256': timeline_hash, 'input_sha256': source_hash,
            'wav_master_sha256': sha256(master), 'normalization': normalization,
            'duration_seconds': duration, 'samples_per_channel': sample_count,
        }, ensure_ascii=False, indent=2)+'\n')

    target = OUT/'soundtrack-v4.m4a'
    encode_gain = 0.0
    measurements = []
    for attempt in range(2):
        args = ['ffmpeg', '-v', 'error', '-y', '-i', str(master)]
        if encode_gain:
            args += ['-af', f'volume={encode_gain:.6f}dB']
        args += ['-c:a', 'aac', '-b:a', '256k', '-ar', str(SR), '-ac', '2',
                 '-movflags', '+faststart', '-movie_timescale', str(SR), str(target)]
        run(args)
        measured = measure(target)
        measurements.append({'encode_gain_db': encode_gain, 'measurement': measured})
        if float(measured['input_tp']) <= -1:
            break
        encode_gain -= float(measured['input_tp'])+1.1
    metadata = probe(target)
    audio = next(stream for stream in metadata['streams'] if stream['codec_type'] == 'audio')
    assert audio['codec_name'] == 'aac' and int(audio['sample_rate']) == SR and audio['channels'] == 2
    assert abs(float(audio['duration'])-duration) <= 1/SR+.000001
    assert abs(float(metadata['format']['duration'])-duration) <= .001
    assert -16 <= float(measured['input_i']) <= -14
    assert float(measured['input_tp']) <= -1
    assert source_hash == sha256(bgm)
    assert timeline_hash == sha256(timeline_path), 'Timeline changed during audio generation'
    # Decode every AAC packet, and enforce the exact logical soundtrack sample count.
    result = run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(target), '-af',
                  f'atrim=end_sample={sample_count}', '-ar', str(SR), '-ac', '2', '-f', 'f32le', 'pipe:1'])
    assert len(result.stdout) == sample_count*2*4
    assert not result.stderr.strip()
    result_audio = np.frombuffer(result.stdout, np.float32)
    clipped = int(np.count_nonzero(np.abs(result_audio) >= 1))
    assert clipped == 0
    tail_window = result_audio.reshape(-1, 2)[sample_count-4*SR:sample_count-2*SR]
    tail_rms = float(20*np.log10(max(1e-12, np.sqrt(np.mean(tail_window*tail_window)))))
    assert tail_rms > -45, 'Music must continue audibly into the final fade'
    assert loops[-1]['output_start_sample']+loops[-1]['source_samples_used'] == sample_count
    report = {
        'version': 4, 'duration_seconds': duration, 'duration_in_frames': timeline['durationInFrames'],
        'fps': fps, 'sample_rate': SR, 'samples_per_channel': sample_count, 'channels': 2,
        'codec': 'aac', 'target_bitrate_kbps': 256, 'integrated_lufs': float(measured['input_i']),
        'true_peak_dbtp': float(measured['input_tp']), 'loudness_range_lu': float(measured['input_lra']),
        'clipped_decoded_samples': clipped, 'full_audio_decode': 'passed',
        'input_file': bgm.name, 'input_file_bytes': bgm.stat().st_size, 'input_sha256': source_hash,
        'input_file_unchanged': source_hash == sha256(bgm), 'decoded_source_samples': len(source),
        'decoded_source_duration_seconds': len(source)/SR, 'decoded_source_sha256': decoded_hash,
        'source_speed': 1.0, 'pitch_shift_semitones': 0, 'source_trim_before_looping': False,
        'loops': loops, 'loop_count': len(loops), 'crossfade_seconds': CROSSFADE_SECONDS,
        'crossfade_shape': 'equal power: outgoing cos(theta), incoming sin(theta), theta 0..pi/2',
        'crossfade_power_sum_max_error': float(np.max(np.abs(outgoing**2+incoming**2-1))),
        'fade_in_seconds': .3, 'fade_out_seconds': 2,
        'added_voiceover': False, 'external_sound_effects': False, 'synthesis_seed': SEED,
        'foreground_cue_count': len(events), 'events': events,
        'last_foreground_cue_seconds': events[-1]['seconds'],
        'timeline_sha256': timeline_hash, 'soundtrack_sha256': sha256(target),
        'soundtrack_bytes': target.stat().st_size, 'wav_master': 'out/v4/soundtrack-v4.wav',
        'wav_master_sha256': sha256(master), 'normalization': normalization,
        'pcm_master_reused': reuse_master, 'm4a_movie_timescale': SR,
        'tail_before_fade_rms_dbfs': tail_rms,
        'loop_coverage_reaches_exact_end': True,
        'aac_encode_measurements': measurements, 'aac_final_gain_db': encode_gain,
        'subjective_listening_checked': False, 'perceptual_av_sync_checked': False,
        'sync_note': 'Cue frames follow selected V4 chapter/shot starts; objective sample mapping only, not a perceptual synchronization claim.',
    }
    (OUT/'audio-v4-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    with (OUT/'audio-v4-cues.csv').open('w', newline='') as output:
        writer = csv.DictWriter(output, fieldnames=list(events[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(events)
    write_docs(report)
    return report


def write_docs(report: dict) -> None:
    seam_rows = '\n'.join(f"| {item['loop_index']} | {item['crossfade_start_seconds']:.3f} | {item['crossfade_end_seconds']:.3f} |"
                          for item in report['loops'] if item['loop_index'])
    cue_rows = '\n'.join(f"| {cue['frame']} | {cue['seconds']:.3f} | {cue['chapter']} | {cue['kind']} | {cue['shot_id']} |"
                         for cue in report['events'])
    text = f'''# V4 长片配乐与音效

字幕动画长片：{report['duration_seconds']:.3f} 秒，{report['duration_in_frames']} 帧，30 fps。没有新增旁白。

## 文件与重建

- 使用 `public/audio/soundtrack-v4.m4a`，其中已经包含完整配乐与少量音效。
- 用户上传《算力小曲》按字节保存为 `public/audio/bgm-v4-original.mp3`，SHA-256：`{report['input_sha256']}`。
- 完整源曲解码长度 {report['decoded_source_duration_seconds']:.6f} 秒，原速、原调连续循环；不先裁剪或改变源曲速度。
- 长 WAV 母带只保存在 `out/v4/soundtrack-v4.wav`。公开资产采用 AAC 256 kbps、48 kHz 双声道，避免超大文件进入仓库。
- 运行 `python scripts/audio_design_v4.py`。输入时间轴为 `public/v4/timeline.json`。时间轴未生成时脚本退出并提示，不进行等待轮询。
- 如需从上传源重新复制，可传 `--source /path/to/算力小曲.mp3`；脚本不会覆盖字节不同的既有源文件。

## 技术验证

- 音频逻辑长度严格对应 {report['samples_per_channel']} 个 48 kHz 样本，与视频帧数对应。
- AAC 实测：**{report['integrated_lufs']:.2f} LUFS / {report['true_peak_dbtp']:.2f} dBTP**；完整解码通过，无解码样本削波。
- 开头淡入 0.3 秒，片尾淡出 2 秒；循环接缝采用 1 秒等功率交叉淡化。
- {report['foreground_cue_count']} 处前景音效，仅选择部分章节、具体物件、动作与天气镜头；少量环境层低于音乐。不对每条字幕敲击。
- 所有音效由固定随机种子与原有合成函数产生，没有外部音效采样，也没有新增旁白。
- 母带按 -15 LUFS / -1.8 dBTP 目标进行两遍响度校准，交付 AAC 的实测指标如上；AAC 额外增益：{report['aac_final_gain_db']:.3f} dB。
- 片尾淡出前 2 秒检测窗口的 RMS 为 {report['tail_before_fade_rms_dbfs']:.2f} dBFS，确认循环音乐持续至淡出。最后一段源曲从 {report['loops'][-1]['output_start_seconds']:.6f} 秒开始，精确覆盖至视频末尾。
- 量化报告在 `public/audio/audio-v4-report.json`；逐帧 cue 表在 `public/audio/audio-v4-cues.csv`。

当前完成的是技术指标、源文件与时间映射验证。**尚未进行主观听音或视听同步审查**；循环平滑度和音乐/音效听感仍需带声音预览确认。

## 循环交叉淡化

| 接入循环序号 | 淡化开始（秒） | 淡化结束（秒） |
| ---: | ---: | ---: |
{seam_rows}

## 前景音效 cue

| 帧 | 秒 | 章节 | 材质类别 | 镜头 |
| ---: | ---: | --- | --- | --- |
{cue_rows}
'''
    destination = ROOT/'docs/AUDIO_V4.md'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(text)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--timeline', type=Path, default=ROOT/'public/v4/timeline.json')
    parser.add_argument('--source', type=Path)
    parser.add_argument('--analyze-only', action='store_true')
    parser.add_argument('--reuse-master', action='store_true',
                        help='Recover encoding from the current verified PCM master after an encoding/mux failure')
    args = parser.parse_args()
    bgm = source_file(args.source)
    if args.analyze_only:
        print(json.dumps({'input': bgm.name, 'input_sha256': sha256(bgm),
                          'metadata': probe(bgm), 'loudness': measure(bgm)}, ensure_ascii=False, indent=2))
        return
    if not args.timeline.is_file():
        raise SystemExit(f'Timeline not ready: {args.timeline}. Rerun after the timeline is generated.')
    report = build(args.timeline, bgm, args.reuse_master)
    print(json.dumps({key: report[key] for key in [
        'duration_seconds', 'duration_in_frames', 'integrated_lufs', 'true_peak_dbtp',
        'foreground_cue_count', 'loop_count', 'soundtrack_bytes', 'soundtrack_sha256',
    ]}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
