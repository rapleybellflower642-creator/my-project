#!/usr/bin/env python3
"""V3 Pulse: 120 s native-speed user music + sparse original synthesized Foley.

Run: python3 scripts/v3p/audio.py
Requires installed NumPy, SciPy, ffmpeg, ffprobe. Temporary PCM stays in /tmp.
Only this script, the V3p AAC/reports, and docs/v3-pulse/AUDIO.md are new assets.
"""
from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import correlate, find_peaks, stft

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import audio_design_v2 as synth  # Existing deterministic synthesizers, unchanged.

SR = 48_000
FPS = 30
DURATION = 120
SAMPLES = SR * DURATION
SEED = 10820307 + 2032
SOURCE = ROOT / 'public/audio/bgm-v4-original.mp3'
OUT = ROOT / 'public/audio'
MUSIC_GAIN = .67
TARGET_LUFS = -15.0
TARGET_TP = -1.8  # Reserve AAC reconstruction headroom before the -1 dBTP requirement.
EVENTS: list[dict] = []
GRID_PATH = ROOT / 'public/v3p/edit-grid.json'
GRID = json.loads(GRID_PATH.read_text())
assert GRID['shotCount'] == 52 and GRID['durationInFrames'] == 3600
SHOTS = {(shot['chapter'], shot['shot']): shot for shot in GRID['entries']}


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(args, check=True, capture_output=True)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def probe(path: Path) -> dict:
    return json.loads(run(['ffprobe', '-v', 'error', '-show_entries',
                          'format=duration,size,bit_rate:stream=codec_type,codec_name,sample_rate,channels,duration,bit_rate',
                          '-of', 'json', str(path)]).stdout)


def measure(path: Path) -> dict:
    result = run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af',
                  f'loudnorm=I={TARGET_LUFS}:TP={TARGET_TP}:LRA=11:print_format=json',
                  '-f', 'null', '-'])
    match = re.search(r'\{\s*"input_i".*?\}', result.stderr.decode(), re.S)
    if not match:
        raise RuntimeError('No loudness measurement in FFmpeg output')
    return json.loads(match.group())


def analyze(source: np.ndarray) -> dict:
    """5 ms spectral-flux timing; numerical candidates, never subjective approval."""
    sample_rate = 24000
    # FFmpeg performs proper antialiased downsampling for spectral analysis only.
    data = run(['ffmpeg', '-v', 'error', '-i', str(SOURCE), '-ac', '1',
                '-ar', str(sample_rate), '-f', 'f32le', 'pipe:1']).stdout
    x = np.frombuffer(data, np.float32)
    hop = 120
    frequencies, times, transform = stft(x, fs=sample_rate, nperseg=1024,
                                       noverlap=1024-hop, boundary='zeros')
    magnitude = np.log1p(np.abs(transform) * 100)
    flux = np.maximum(0, np.diff(magnitude, axis=1, prepend=magnitude[:, :1]))
    full = flux[(frequencies >= 45) & (frequencies < 9500)].mean(axis=0)
    bass = flux[(frequencies >= 45) & (frequencies < 260)].mean(axis=0)
    full /= max(float(full.max()), 1e-9)
    bass /= max(float(bass.max()), 1e-9)
    score = .65 * full + .35 * bass
    peaks, _ = find_peaks(score, distance=44, prominence=.023)
    peaks = peaks[times[peaks] < DURATION]
    pulse_times = times[peaks]
    selected = (pulse_times > 0) & ~((pulse_times > 10) & (pulse_times < 17.7))
    pulse_times, weights = pulse_times[selected], score[peaks][selected]
    period, phase = .27475, .405
    for _ in range(5):
        pulse_indices = np.rint((pulse_times-phase)/period)
        residual = pulse_times - (phase+pulse_indices*period)
        regular = np.abs(residual) < .04
        period, phase = np.polyfit(pulse_indices[regular], pulse_times[regular],
                                  1, w=weights[regular])
    onset_window = 240
    rms = np.sqrt(np.mean(x[:len(x)//onset_window*onset_window]
                         .reshape(-1, onset_window)**2, axis=1))
    nearby = []
    for index in peaks[(times[peaks] >= 72) & (times[peaks] < 79)]:
        nearby.append({'seconds': round(float(times[index]), 3),
                       'spectral_flux_strength_relative': round(float(score[index]), 4),
                       'bass_flux_relative': round(float(bass[index]), 4)})
    # Autocorrelation can confuse metrical levels; record competing candidates.
    envelope = score[:24000]
    autocorrelation = correlate(envelope-envelope.mean(), envelope-envelope.mean(),
                                mode='full', method='fft')[len(envelope)-1:]
    candidates, _ = find_peaks(autocorrelation)
    candidates = [int(a) for a in candidates if 60/180/.005 <= a <= 60/55/.005]
    candidates = sorted(candidates, key=lambda a: autocorrelation[a], reverse=True)[:3]
    return {
        'method': '24 kHz mono analysis copy; 1024-sample Hann STFT; 120-sample hop (5 ms); positive log spectral flux weighted 65% 45–9500 Hz + 35% 45–260 Hz; autocorrelation and robust periodic fit',
        'first_10ms_rms_above_minus60_dbfs_seconds': round(float(np.flatnonzero(rms > .001)[0] * .01), 3),
        'first_strong_spectral_onset_seconds': .405,
        'autocorrelation_tempo_candidates_bpm': [round(60/(a*.005), 3) for a in candidates],
        'fitted_pulse_bpm_candidate': round(float(60/(2*period)), 6),
        'fitted_subdivision_seconds': round(float(period), 9),
        'fitted_phase_seconds': round(float(phase), 6),
        'fit_median_absolute_error_seconds': round(float(np.median(np.abs(residual[regular]))), 6),
        'thirty_two_pulse_phrase_grid_candidates_seconds': [round(float(phase+i*64*period), 3) for i in range(7)],
        'climax_local_onset_candidates': nearby,
        'recommended_anchors': [
            {'frame': 12, 'seconds': .4, 'purpose': 'opening seal contacts ground; source first attack .405 s'},
            {'frame': 210, 'seconds': 7.0, 'purpose': 'title main impact exactly on cut'},
            {'frame': 392, 'seconds': 392/30, 'purpose': 'history red seal on shot start'},
            {'frame': 697, 'seconds': 697/30, 'purpose': 'hoe contact on shot start'},
            {'frame': 784, 'seconds': 784/30, 'purpose': 'seed actual contact, 13 frames after new close-up'},
            {'frame': 1864, 'seconds': 1864/30, 'purpose': 'bamboo actual contact, 5 frames after shot start'},
            {'frame': 2013, 'seconds': 2013/30, 'purpose': 'identity cord breaks, 5 frames after shot start'},
            {'frame': 2222, 'seconds': 2222/30, 'purpose': '谁怕 exactly on cut; source attack 74.060 s'},
            {'frame': 2321, 'seconds': 2321/30, 'purpose': '一蓑烟雨 on cut; source attack 77.360 s'},
            {'frame': 3178, 'seconds': 3178/30, 'purpose': '归去: old line releases on cut'},
            {'frame': 3558, 'seconds': 118.6, 'purpose': 'final 1.4-second fade begins'},
        ],
        'limitations': [
            'Spectral onsets mark energy attacks, not verified metrical downbeats or semantic phrase boundaries.',
            'Tempo has half/double/triplet metrical ambiguities; the phrase grid is an editing suggestion only.',
            '5 ms analysis hop and the STFT window limit attack precision; animation contacts use exact 30 fps frames.',
            'No subjective listening, headphone review, or visual sync playback is claimed by this report.',
        ],
    }


def layer(duration: float, parts: list[tuple[float, np.ndarray, float]]) -> np.ndarray:
    result = np.zeros(round(duration * SR), np.float32)
    for seconds, sound, gain in parts:
        synth.insert(result, sound, seconds, gain)
    return synth.peak(result)


def door_close() -> np.ndarray:
    return layer(.95, [(0, synth.grounded_impact(.72), .74),
                        (.006, synth.bamboo(1.48), .48),
                        (.072, synth.bamboo(.74), .15),
                        (.126, synth.bronze_edge(.6), .10)])


def earth_cut() -> np.ndarray:
    t = synth.time(.68)
    earth = synth.noise(len(t), 220, 1750) * synth.env(t, .004, .082)
    earth += synth.noise(len(t), 1700, 5400) * synth.env(t, .021, .11) * .22
    return layer(.9, [(0, synth.bamboo(1.63), .55),
                       (.012, synth.peak(earth), .75),
                       (.048, synth.grass_friction(.44, .85), .27)])


def cloth_turn(duration: float = .74) -> np.ndarray:
    return layer(duration+.12, [(0, synth.grass_friction(duration, .72), .73),
                                (.10, synth.cool_air(duration*.8), .18)])


def rain_scatter(duration: float, density: float = 17) -> np.ndarray:
    t = synth.time(duration)
    y = synth.noise(len(t), 1800, 8100) * .025
    for seconds in np.sort(synth.RNG.uniform(.005, max(.006, duration-.16),
                                             round(duration*density))):
        synth.insert(y, synth.water_drop(float(synth.RNG.uniform(.38, .64)), True),
                     float(seconds), float(synth.RNG.uniform(.045, .16)))
    y *= np.minimum(1, t/.026) * np.minimum(1, (duration-t)/.17)
    return synth.peak(y)


def river_pass() -> np.ndarray:
    return layer(1.65, [(0, synth.shallow_water(1.7), .8),
                        (.13, synth.shallow_water(1.12), .36)])


def bronze_soft(duration: float = .9, weight: float = 1.0) -> np.ndarray:
    """Warm, damped metal body with no bright gong or melodic notification tail."""
    t = synth.time(duration)
    y = np.zeros(len(t), np.float32)
    for hz, gain, decay in [(142, .66, .19), (321, .39, .16),
                             (527, .22, .105), (887, .10, .065)]:
        y += (np.sin(2*np.pi*hz/weight*t)*synth.env(t, .0018, decay)*gain).astype(np.float32)
    y += synth.noise(len(t), 180, 2400)*synth.env(t, .001, .014)*.14
    return synth.peak(y)


def seal_contact(weight: float = 1.0) -> np.ndarray:
    return layer(.88, [(0, bronze_soft(.85, weight), .72),
                       (.003, synth.bamboo(1.9*weight), .24),
                       (.012, synth.paper_fold(), .075)])


def silk_line(duration: float = .8) -> np.ndarray:
    """Fine irregular fibers tracing a line; little low end and no hard strike."""
    t = synth.time(duration)
    y = synth.noise(len(t), 1300, 5500) * .55
    y += synth.noise(len(t), 340, 1300) * .12
    envelope = np.sin(np.pi*t/duration)**1.8
    grain = .35 + .30*np.sin(t*17.3+np.sin(t*4.1))**2 + .35*np.sin(t*53.1)**6
    return synth.peak(y*envelope*grain)


def paper_scroll(duration: float = 1.1) -> np.ndarray:
    return layer(duration+.30, [(0, silk_line(duration), .51),
                                (.05, synth.paper_fold(), .49),
                                (duration*.7, synth.paper_fold(), .22)])


def seed_contact() -> np.ndarray:
    t = synth.time(.38)
    y = synth.noise(len(t), 230, 1900)*synth.env(t, .0013, .034)*.82
    y += np.sin(2*np.pi*432*t)*synth.env(t, .001, .023)*.23
    return synth.peak(y)


def cup_touch() -> np.ndarray:
    """Restrained ceramic rim resonance, used as object texture, not a clink loop."""
    t = synth.time(.68)
    y = np.zeros(len(t), np.float32)
    for hz, gain, decay in [(731, .62, .13), (1327, .29, .075), (2189, .095, .038)]:
        y += (np.sin(2*np.pi*hz*t)*synth.env(t, .004, decay)*gain).astype(np.float32)
    y += synth.noise(len(t), 350, 1700)*synth.env(t, .001, .012)*.08
    return synth.peak(y)


def cord_snap() -> np.ndarray:
    """Short stretched-fiber release, distinct from metal, bamboo, or a footstep."""
    t = synth.time(.45)
    phase = 2*np.pi*(820*t - 260*.031*(1-np.exp(-t/.031)))
    y = np.sin(phase)*synth.env(t, .0003, .029)*.27
    y += synth.noise(len(t), 1300, 7500)*synth.env(t, .0002, .009)*.56
    y += synth.noise(len(t), 300, 1550)*synth.env(t, .002, .045)*.19
    return synth.peak(y)


def leaf_hit() -> np.ndarray:
    return layer(.70, [(0, synth.water_drop(.44, True), .63),
                       (.005, synth.grass_friction(.24, 1.5), .22),
                       (.366667, synth.water_drop(.35, True), .29)])


def make_sfx() -> tuple[np.ndarray, list[dict]]:
    synth.RNG = np.random.default_rng(SEED)
    EVENTS.clear()
    mix = np.zeros((SAMPLES, 2), np.float32)

    def cue(chapter: str, shot: int, name: str, material: str, sound: np.ndarray,
            gain: float, pan: float = 0, room: float = .10, offset_frames: int = 0,
            sync: str = 'composition cut; soft texture', tier: str = 'texture',
            secondary_contacts: list[dict] | None = None) -> None:
        edit = SHOTS[(chapter, shot)]
        frame = edit['frame'] + offset_frames
        synth.stereo_add(mix, frame/FPS, sound, gain, pan, room)
        EVENTS.append({
            'frame': frame, 'seconds': round(frame/FPS, 6), 'sample': frame*(SR//FPS),
            'shot_id': edit['id'], 'chapter': chapter, 'shot': shot,
            'shot_start_frame': edit['frame'], 'offset_from_cut_frames': offset_frames,
            'name': name, 'material': material, 'tier': tier, 'gain_linear': gain,
            'pan': pan, 'room_linear': room,
            'sound_duration_seconds': round(len(sound)/SR, 6), 'sync_basis': sync,
            'secondary_contacts': json.dumps(secondary_contacts or [], ensure_ascii=False, separators=(',', ':')),
        })

    # Hook: the actual seal contact meets the original music's first 0.405 s attack.
    cue('hook', 0, '坠落铜印触地', 'soft brass / grounded wood', seal_contact(1.13),
        .228, .02, .11, 12, 'physical contact frame 12; source first attack .405 s', 'primary')
    cue('hook', 1, '入狱朱印', 'ink seal / thick paper',
        layer(.54, [(0, synth.bamboo(1.65), .58), (.006, seed_contact(), .30)]),
        .129, -.09, .06, sync='red seal already contacts at cut frame 45', tier='material')
    cue('hook', 2, '骤雨迎面', 'rain on fiber', rain_scatter(.84, 21), .110, .12, .12)
    cue('hook', 3, '蓑衣背影切入', 'woven fiber / short air',
        layer(.72, [(0, silk_line(.62), .60), (.03, synth.warm_air(.60), .31)]), .063, -.09, .10)

    cue('title', 0, '定字主落点', 'warm low metal / fine paper',
        layer(.88, [(0, bronze_soft(.78, 1.24), .75), (.01, silk_line(.55), .17)]),
        .174, 0, .13, sync='main title cut frame 210; no default delayed attack', tier='primary')
    cue('title', 1, '题卷近景展开', 'rolled paper fibers', paper_scroll(.79), .089, -.14, .09,
        sync='scroll close-up begins at cut frame 276', tier='material')

    cue('history', 0, '诗页被划除', 'paper / dry fine brush', silk_line(.43), .055, -.11, .05)
    cue('history', 1, '案卷翻页朱印落定', 'paper / wood stamp',
        layer(.74, [(0, synth.bamboo(1.72), .55), (.012, synth.paper_fold(), .27)]),
        .126, .08, .06, sync='red seal contacts exactly at cut frame 392', tier='material')
    cue('history', 2, '京城至黄州迁徙线', 'fine silk / paper', silk_line(.68), .051, -.10, .12)
    cue('history', 3, '官职与权力被划断', 'dry fiber / muted bronze',
        layer(.63, [(0, cord_snap(), .47), (.015, bronze_soft(.55, 1.38), .32)]),
        .090, .11, .07, sync='cross-out starts on cut frame 512, finishes within five frames', tier='material')
    cue('history', 4, '贬谪条目纸页展开', 'dry paper', paper_scroll(.52), .064, -.13, .05)
    cue('history', 4, '贬谪朱印辅点', 'small ink stamp', seed_contact(), .067,
        .16, .04, 14, 'small red seal physical contact frame 587', 'detail')
    cue('history', 5, '官场落向谋生阶梯', 'short fine line / low air', silk_line(.55), .043, .13, .11)

    cue('cultivate', 0, '木锄撞入土层', 'wood shaft / granular soil', earth_cut(), .178,
        -.12, .055, sync='hoe already contacts soil on cut frame 697', tier='material')
    cue('cultivate', 1, '种子落土', 'seed / dry soil', seed_contact(), .099,
        .12, .04, 13, 'seed contact frame 784; close-up has thirteen-frame fall', 'material')
    cue('cultivate', 2, '根系切至新芽', 'fine dry fiber / light air',
        layer(.75, [(0, silk_line(.65), .57), (.05, synth.warm_air(.63), .32)]), .052, -.05, .13)
    cue('cultivate', 3, '东坡田畦铺展', 'warm air / scattered soil fiber',
        layer(.81, [(0, synth.warm_air(.76), .57), (.04, silk_line(.60), .31)]), .051, .06, .16)

    cue('rain', 0, '伞面两滴近雨', 'close droplets / taut leaf fiber',
        layer(.90, [(0, synth.water_drop(.57, True), .72),
                     (.45, synth.water_drop(.43, True), .34)]),
        .105, -.09, .08, 5, 'umbrella impact at local .18 s, quantized to frame 974', 'material',
        [{'frame': 988, 'material': 'quieter second umbrella droplet, local .63 s'}])
    cue('rain', 1, '雨具向旁滑出', 'short fiber / moving air',
        layer(.82, [(0, silk_line(.72), .50), (.04, synth.cool_air(.74), .46)]), .066, .20, .11)
    cue('rain', 2, '同行分岔斜雨加密', 'angled rain / fine cloth', rain_scatter(.95, 23),
        .105, -.16, .12, 4, 'route split at local .12 s, quantized to frame 1121', 'material')
    cue('rain', 3, '稳定金路托住画面', 'warm low metal / quiet air',
        layer(.70, [(0, bronze_soft(.65, 1.45), .35), (.02, synth.warm_air(.61), .48)]),
        .058, 0, .13)

    cue('listen', 0, '雨点轻击竹叶', 'water / leaf fiber', leaf_hit(), .085,
        -.15, .07, 5, 'first leaf contact at local .16 s, frame 1271', 'material',
        [{'frame': 1282, 'material': 'second softer leaf contact at local .52 s'}])
    cue('listen', 1, '噪声细线掠过', 'dry fine silk', silk_line(.46), .055, .20, .09)
    cue('listen', 3, '乱波拉直收束', 'tensioned silk / tiny fiber catch',
        layer(1.06, [(0, silk_line(.84), .64), (.85, seed_contact(), .11)]), .054, -.14, .09,
        sync='line starts straightening at cut 1447, settles at local .85 s',
        secondary_contacts=[{'frame': 1473, 'material': 'tiny line catch after straightening'}])
    cue('listen', 4, '心稳住中心', 'warm air / close fiber', synth.warm_air(.61), .045, 0, .12)

    cue('walk', 0, '行路金线入画', 'fine line / moving air', silk_line(.59), .049, -.13, .11)
    cue('walk', 1, '两步从容落下', 'soft straw sole / dry fiber',
        layer(1.30, [(0, synth.straw_step(False), .82),
                     (.68, synth.straw_step(False, .85), .46)]),
        .084, -.08, .08, sync='first selected step on cut 1645; one quieter contact at local .68 s',
        tier='material', secondary_contacts=[{'frame': 1665, 'material': 'quieter second selected step'}])
    cue('walk', 2, '吟啸波环软展开', 'light open air', synth.warm_air(.85), .056, .12, .18)

    cue('light', 0, '竹杖点地', 'bamboo / damp ground', synth.bamboo(1.08), .153,
        -.14, .07, 5, 'bamboo physical contact at local .16 s, frame 1864', 'material')
    cue('light', 1, '身份束线拉紧', 'tensioned dry fiber',
        layer(.80, [(0, silk_line(.67), .70), (.24, synth.grass_friction(.45, 1.85), .23)]),
        .069, .13, .07, 2, 'identity lines tighten at local .05 s, nearest frame 1936', 'detail')
    cue('light', 2, '束缚之线断开', 'short stretched-fiber snap', cord_snap(), .137,
        -.06, .06, 5, 'cord breaks at local .18 s, nearest frame 2013', 'material')
    cue('light', 3, '轻盈金线自由流动', 'fine silk / open air',
        layer(.85, [(0, silk_line(.71), .52), (.03, synth.warm_air(.77), .43)]), .063, .16, .17)

    cue('who', 0, '雨击蓑衣纹理', 'rain / woven fabric',
        layer(.90, [(0, rain_scatter(.86, 17), .57), (.03, silk_line(.70), .31)]), .090, -.14, .13)
    cue('who', 1, '谁怕主冲击', 'warm low metal / grounded body',
        layer(.95, [(0, bronze_soft(.86, 1.09), .70),
                     (.002, synth.grounded_impact(.72), .54)]),
        .244, 0, .09, sync='word and scale impact exactly at cut frame 2222; source attack 74.060 s', tier='primary')
    cue('who', 2, '一蓑烟雨衣料近景', 'woven fiber / fine rain / open air',
        layer(1.03, [(0, silk_line(.86), .49), (.02, rain_scatter(.92, 12), .26),
                     (.045, synth.warm_air(.94), .45)]),
        .116, -.04, .20, sync='text and fabric close-up start exactly at cut frame 2321', tier='material')
    cue('who', 3, '任平生路径展开', 'fine silk / quiet air', silk_line(.83), .060, .11, .15)

    cue('cold', 0, '酒盏水环余韵', 'soft ceramic / small water body',
        layer(.82, [(0, cup_touch(), .68), (.02, synth.water_drop(.57), .15)]),
        .064, .13, .15, sync='cup and surface rings start on cut frame 2461; quiet material motif', tier='detail')
    cue('cold', 1, '凉风切入蒸汽', 'short moving cold air', synth.cool_air(1.18), .083, -.20, .15)
    cue('cold', 3, '杯口反光轻闪', 'quiet ceramic overtone', cup_touch(), .029,
        .18, .18, 12, 'cup reflection reaches bright region at frame 2654', 'detail')

    cue('sun', 0, '日轮越山', 'warm air', synth.warm_air(.70), .051, -.12, .19)
    cue('sun', 1, '斜照光路扫过', 'fine silk / warm air',
        layer(.90, [(0, silk_line(.78), .44), (.03, synth.warm_air(.83), .54)]), .062, .15, .22)
    cue('sun', 2, '雨滴化作亮粒', 'fine water bead / warm fiber',
        layer(.80, [(0, synth.water_drop(.37, True), .34), (.03, silk_line(.71), .53)]), .052, -.11, .20)
    cue('sun', 3, '宽幅金弧相迎', 'warm air / muted metal edge',
        layer(.91, [(0, synth.warm_air(.86), .72), (.01, bronze_soft(.72, .88), .045)]), .045, .14, .21)

    cue('return', 0, '回望线反向追溯', 'dry paper memory / fine silk', silk_line(.86), .051, -.14, .13)
    cue('return', 2, '归去旧线松开', 'released silk / quiet air',
        layer(.85, [(0, silk_line(.70), .60), (.02, synth.warm_air(.72), .36)]), .058, .11, .13,
        sync='归去 lands and old line releases exactly at cut frame 3178')
    cue('return', 3, '当下圆环向前', 'soft air / clean line', synth.warm_air(.68), .043, 0, .17)
    cue('ending', 0, '双路合流', 'fine line / receding air', silk_line(.91), .040, -.08, .15)
    cue('ending', 2, '终点金线轻收束', 'very soft air', synth.warm_air(.77), .024, .08, .17)

    beds = [
        {'start': 3.70, 'end': 6.95, 'gain': .0023, 'material': 'rain'},
        {'start': 32.30, 'end': 41.95, 'gain': .0030, 'material': 'rain'},
        {'start': 42.20, 'end': 50.30, 'gain': .0017, 'material': 'rain'},
        {'start': 71.87, 'end': 81.70, 'gain': .0020, 'material': 'rain'},
        {'start': 83.97, 'end': 89.20, 'gain': .0015, 'material': 'air'},
    ]
    for bed in beds:
        length = bed['end']-bed['start']
        t = synth.time(length)
        lo, hi = {'rain': (1700, 7800), 'air': (180, 1600)}[bed['material']]
        start = round(bed['start']*SR)
        envelope = np.minimum(1, t/.35) * np.minimum(1, (length-t)/.65)
        for channel in (0, 1):
            texture = synth.noise(len(t), lo, hi)
            texture *= envelope * (.65+.35*np.sin(t*1.85+channel*.83)**2)
            mix[start:start+len(t), channel] += texture*bed['gain']
    EVENTS.sort(key=lambda event: event['frame'])
    assert 40 <= len(EVENTS) <= 50
    return mix, beds


def music_envelope() -> tuple[np.ndarray, dict]:
    t = np.arange(SAMPLES, dtype=np.float64)/SR
    envelope = np.interp(t, [0, .10, .40, .65, 118.6, 120],
                         [.30, .52, .88, 1, 1, 0]).astype(np.float32)
    # Brief anticipation, with recovery precisely at the main composition/word cut.
    envelope *= np.interp(t, [73.72, 73.85, 73.94, 74.066667, 74.23],
                          [1, .72, .72, 1, 1]).astype(np.float32)
    envelope *= np.interp(t, [0, 100, 105, 111.0, 118.6, 120],
                          [1, 1, .94, .94, .94, .94]).astype(np.float32)
    return envelope, {
        'base_music_gain_linear': MUSIC_GAIN,
        'opening': {'natural_first_onset_seconds': .405, 'full_gain_seconds': .65},
        'climax_duck': {'start_seconds': 73.72, 'minimum_gain_linear': .72,
                         'minimum_gain_db': round(float(20*np.log10(.72)), 3),
                         'minimum_from_seconds': 73.85, 'minimum_to_seconds': 73.94,
                         'full_recovery_seconds': 74.066667, 'silence_inserted': False},
        'ending_fade': {'start_seconds': 118.6, 'end_seconds': 120.0, 'duration_seconds': 1.4},
        'ending_release_gain_linear': .94,
    }


def build() -> dict:
    assert SOURCE.is_file(), SOURCE
    OUT.mkdir(parents=True, exist_ok=True)
    source_hash = sha256(SOURCE)
    assert source_hash == GRID['music_source_sha'], 'Cut grid belongs to another source'
    grid_hash = sha256(GRID_PATH)
    decoded_bytes = run(['ffmpeg', '-v', 'error', '-i', str(SOURCE),
                         '-ar', str(SR), '-ac', '2', '-f', 'f32le', 'pipe:1']).stdout
    source = np.frombuffer(decoded_bytes, np.float32).reshape(-1, 2)
    assert len(source) >= SAMPLES
    analysis = analyze(source)
    effects, beds = make_sfx()
    envelope, automation = music_envelope()
    mix = source[:SAMPLES].copy() * (MUSIC_GAIN*envelope[:, None]) + effects
    fade = np.ones(SAMPLES, np.float32)
    count = round(1.4*SR)
    fade[-count:] = np.linspace(1, 0, count, dtype=np.float32)
    # Music already has its end fade. This also guarantees the Foley tails end cleanly.
    mix -= effects * (1-fade[:, None])
    assert np.isfinite(mix).all()
    destination = OUT / 'soundtrack-v3p.m4a'
    with tempfile.TemporaryDirectory(prefix='dingfengbo-v3p-audio-', dir='/tmp') as directory:
        premix = Path(directory) / 'premix.wav'
        wavfile.write(premix, SR, mix.astype(np.float32))
        measurement = measure(premix)
        normalization = (f'loudnorm=I={TARGET_LUFS}:TP={TARGET_TP}:LRA=11:'
                         f'measured_I={measurement["input_i"]}:'
                         f'measured_TP={measurement["input_tp"]}:'
                         f'measured_LRA={measurement["input_lra"]}:'
                         f'measured_thresh={measurement["input_thresh"]}:'
                         f'offset={measurement["target_offset"]}:linear=true:print_format=json')
        result = run(['ffmpeg', '-y', '-hide_banner', '-nostats', '-i', str(premix),
                      '-af', normalization, '-ar', str(SR), '-ac', '2', '-t', '120',
                      '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', str(destination)])
        normalization_match = re.search(r'\{\s*"input_i".*?\}', result.stderr.decode(), re.S)
        normalization_result = json.loads(normalization_match.group()) if normalization_match else {}
        final_measurement = measure(destination)
        output_probe = probe(destination)
        stream = next(x for x in output_probe['streams'] if x.get('codec_type') == 'audio')
        assert stream['codec_name'] == 'aac'
        assert int(stream['sample_rate']) == SR and int(stream['channels']) == 2
        assert abs(float(output_probe['format']['duration'])-DURATION) <= 1/SR
        assert abs(float(final_measurement['input_i'])-TARGET_LUFS) <= .25, final_measurement
        assert float(final_measurement['input_tp']) <= -1.0, final_measurement
        verify_bytes = run(['ffmpeg', '-v', 'error', '-i', str(destination), '-t', '120',
                            '-ar', str(SR), '-ac', '2', '-f', 'f32le', 'pipe:1']).stdout
        output = np.frombuffer(verify_bytes, np.float32).reshape(-1, 2)
        assert len(output) == SAMPLES and np.isfinite(output).all()
        # No point-by-point identity claim after dynamic loudness normalization or AAC. Test time alignment
        # in three quiet-Foley windows by correlation with the original at the same time.
        alignment = []
        for seconds in (10, 56, 114):
            start, end = seconds*SR, (seconds+2)*SR
            a, b = output[start:end].mean(axis=1), source[start:end].mean(axis=1)
            correlation = correlate(a-a.mean(), b-b.mean(), mode='full', method='fft')
            mid = len(a)-1
            delta = int(np.argmax(correlation[mid-96:mid+97]))-96
            coefficient = float(np.corrcoef(a, b)[0, 1])
            assert abs(delta) <= 1 and coefficient > .98
            alignment.append({'start_seconds': seconds, 'duration_seconds': 2,
                              'lag_samples': delta, 'zero_lag_correlation': round(coefficient, 6)})
        tail_rms = float(np.sqrt(np.mean(output[-round(.02*SR):]**2)))
    assert sha256(SOURCE) == source_hash, 'Original source was unexpectedly modified'
    csv_path = OUT / 'audio-v3p-cues.csv'
    with csv_path.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(EVENTS[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(EVENTS)
    assert b'\r' not in csv_path.read_bytes(), 'CSV must use LF only'
    report = {
        'version': 'v3-pulse', 'duration_seconds': DURATION, 'fps': FPS,
        'edit_grid': {'file': 'public/v3p/edit-grid.json', 'sha256': grid_hash, 'shot_count': 52,
                      'cut_alignment_validation': GRID['validation'],
                      'cuts_without_extra_foley': [shot['id'] for shot in GRID['entries'] if not any(event['shot_id'] == shot['id'] for event in EVENTS)]},
        'audio_samples': SAMPLES, 'sample_rate_hz': SR, 'channels': 2,
        'voiceover': False,
        'source': {'file': 'public/audio/bgm-v4-original.mp3', 'sha256': source_hash,
                   'probe': probe(SOURCE), 'decoded_duration_seconds': len(source)/SR,
                   'decoded_samples': len(source),
                   'decoded_float32le_sha256': hashlib.sha256(decoded_bytes).hexdigest(),
                   'used_source_start_seconds': 0.0, 'used_source_end_seconds': 120.0,
                   'playback_rate': 1.0, 'pitch_shift_semitones': 0, 'loops': 0,
                   'time_stretch_used': False, 'crossfades_or_source_edits': [],
                   'processing': 'first 120 seconds at original speed/pitch; gain automation before mixing, then final loudness normalization; no source looping required'},
        'music_analysis': analysis, 'automation': automation,
        'foley': {'seed': SEED, 'event_count': len(EVENTS),
                  'generation': 'original deterministic synthesized paper scroll, ink/brass seals, granular soil and seed, leaf/umbrella rain, silk, cord snap, straw steps, bamboo, soft ceramic cup, cold/warm air; no downloaded effects',
                  'tier_counts': {tier: sum(event['tier'] == tier for event in EVENTS) for tier in ('primary','material','detail','texture')},
                  'exact_cut_cue_count': sum(event['offset_from_cut_frames'] == 0 for event in EVENTS),
                  'physical_contact_or_detail_offset_cue_count': sum(event['offset_from_cut_frames'] != 0 for event in EVENTS),
                  'cues_file': 'public/audio/audio-v3p-cues.csv', 'cues': EVENTS,
                  'ambience_beds': beds, 'premix_peak_linear': float(np.max(np.abs(effects)))},
        'loudness': {'target_integrated_lufs': TARGET_LUFS, 'maximum_true_peak_dbtp': -1.0,
                     'normalization_ceiling_dbtp': TARGET_TP,
                     'premix_measurement': measurement,
                     'second_pass_normalization': normalization_result,
                     'encoded_aac_measurement': final_measurement,
                     'method': 'FFmpeg loudnorm EBU R128 integrated loudness and oversampled true peak, measured again after AAC encoding'},
        'output': {'file': 'public/audio/soundtrack-v3p.m4a', 'sha256': sha256(destination),
                   'probe': output_probe, 'requested_codec': 'AAC LC', 'requested_bitrate_bps': 256000,
                   'decoded_finite': True, 'decoded_samples_in_120s': len(output),
                   'final_20ms_rms_dbfs': round(float(20*np.log10(max(tail_rms, 1e-12))), 3),
                   'source_time_alignment_checks': alignment, 'cue_csv_line_endings': 'LF'},
        'review_status': {'automated_audio_checks': 'passed',
                          'subjective_listening': 'not performed; no subjective approval claimed',
                          'audiovisual_sync_playback': 'not performed by this audio build; check rendered film against contact frames'},
    }
    (OUT/'audio-v3p-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'output': str(destination), 'duration': DURATION, 'foley_cues': len(EVENTS),
                      'lufs': final_measurement['input_i'], 'true_peak_dbtp': final_measurement['input_tp'],
                      'alignment': alignment}, ensure_ascii=False, indent=2))
    return report


if __name__ == '__main__':
    build()
