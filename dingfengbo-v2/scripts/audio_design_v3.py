#!/usr/bin/env python3
"""Deterministic V3 Foley, anchored to the new 30 fps narrative edit.

Run from any directory: python scripts/audio_design_v3.py
Dependencies: numpy, scipy and FFmpeg, all already available in the cloud image.
The existing V2 synthesizers are imported unchanged. No voice or external Foley.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile

import audio_design_v2 as synth

SR = synth.SR
FPS = synth.FPS
SAMPLES = SR * 120
SAMPLES_PER_FRAME = SR // FPS
SEED = 10820307 + 2027
OUT = Path(__file__).resolve().parents[1] / 'public' / 'audio'
EVENTS: list[dict] = []


def layer(duration: float, parts: list[tuple[float, np.ndarray, float]]) -> np.ndarray:
    result = np.zeros(round(duration * SR), np.float32)
    for at, sound, gain in parts:
        synth.insert(result, sound, at, gain)
    return synth.peak(result)


def door_close() -> np.ndarray:
    """Short wooden door body, two rattling contacts and a muted metal latch."""
    return layer(.95, [
        (0, synth.grounded_impact(.72), .78),
        (.006, synth.bamboo(1.48), .48),
        (.072, synth.bamboo(.74), .20),
        (.126, synth.bronze_edge(.6), .13),
        (.177, synth.bamboo(.51), .08),
    ])


def earth_cut() -> np.ndarray:
    """Hoe contact in dry soil, followed by a short crumbling granular tail."""
    t = synth.time(.68)
    earth = synth.noise(len(t), 220, 1750) * synth.env(t, .004, .082)
    earth += synth.noise(len(t), 1700, 5400) * synth.env(t, .021, .11) * .22
    return layer(.9, [
        (0, synth.bamboo(1.63), .68),
        (.012, synth.peak(earth), .75),
        (.048, synth.grass_friction(.44, .85), .29),
    ])


def cloth_turn() -> np.ndarray:
    return layer(.86, [
        (0, synth.grass_friction(.63, .72), .73),
        (.10, synth.cool_air(.58), .23),
    ])


def rain_scatter(duration: float, density: float = 17) -> np.ndarray:
    """Irregular close droplets, suitable for a rain/leaf insert, not a whoosh."""
    t = synth.time(duration)
    y = synth.noise(len(t), 1800, 8100) * .033
    for at in np.sort(synth.RNG.uniform(.005, max(.006, duration-.16), round(duration*density))):
        synth.insert(y, synth.water_drop(float(synth.RNG.uniform(.38, .64)), True),
                     float(at), float(synth.RNG.uniform(.045, .16)))
    y *= np.minimum(1, t/.026) * np.minimum(1, (duration-t)/.17)
    return synth.peak(y)


def river_pass() -> np.ndarray:
    return layer(1.65, [
        (0, synth.shallow_water(1.7), .8),
        (.13, synth.shallow_water(1.12), .36),
        (.47, synth.bamboo(1.30), .10),
    ])


def make_sfx() -> np.ndarray:
    # Reset the imported generator as well, so repeated calls in one interpreter match.
    synth.RNG = np.random.default_rng(SEED)
    EVENTS.clear()
    mix = np.zeros((SAMPLES, 2), np.float32)

    def cue(frame: int, name: str, material: str, sound: np.ndarray,
            gain: float, pan: float = 0, room: float = .13,
            pre_frames: int = 0) -> None:
        start_frame = frame-pre_frames
        synth.stereo_add(mix, start_frame/FPS, sound, gain, pan, room)
        EVENTS.append({
            'frame': frame, 'seconds': round(frame/FPS, 6),
            'sample': frame*SAMPLES_PER_FRAME,
            'sound_start_frame': start_frame,
            'sound_start_sample': start_frame*SAMPLES_PER_FRAME,
            'name': name, 'material': material, 'gain_linear': gain,
            'pan': pan, 'pre_roll_frames': pre_frames,
            'sound_duration_seconds': round(len(sound)/SR, 6),
        })

    # Hook: three different physical attacks reinforce the three quick cuts.
    cue(13, '风雨撞入 / 开场落点', 'water + low body',
        layer(1.05, [(0, synth.grounded_impact(.76), .63),
                     (.004, synth.water_drop(1.22), .80),
                     (.036, synth.shallow_water(.86), .35)]), .44, -.02, .16)
    cue(79, '牢门闪回 / 雨幕切入', 'wood latch + rain',
        layer(1.12, [(0, door_close(), .80),
                     (.06, rain_scatter(.95), .35)]), .32, -.16, .17)
    cue(145, '开场谁怕落字', 'grounded body + muted bronze',
        layer(.88, [(0, synth.grounded_impact(.70), .80),
                    (.005, synth.bronze_edge(.75), .20)]), .37, 0, .08)

    # History: paper, confinement, a river crossing, a modest city arrival.
    cue(210, '乌台诗案卷展开', 'paper fiber', synth.paper_fold(), .31, -.2, .08, 4)
    cue(276, '狱门落闩', 'wood body / metal latch', door_close(), .39, .10, .22)
    cue(408, '渡江赴黄州', 'boat water / soft timber', river_pass(), .27, -.26, .21)
    cue(540, '黄州城显现', 'short low wood',
        layer(.77, [(0, synth.bamboo(1.55), .72),
                    (.008, synth.grounded_impact(.65), .39)]), .22, .06, .19)

    # Farming: distinct material contact instead of repeated cane/foot macros.
    cue(738, '锄头入土', 'wood shaft / granular soil', earth_cut(), .35, -.12, .06)
    cue(804, '掌心与泥土', 'dry soil / hand friction', synth.grass_friction(.64, 1.25), .22, .14, .05)
    cue(870, '草堂炊烟', 'straw roof / close timber',
        layer(.78, [(0, synth.bamboo(1.38), .35),
                    (.018, synth.grass_friction(.58, .65), .66)]), .16, -.20, .12)

    # Manuscript then abrupt weather: rain is close and grainy, not cinematic thunder.
    cue(936, '三月七日词序展开', 'paper fold', synth.paper_fold(), .26, -.22, .09, 4)
    cue(1002, '沙湖道中雨忽至', 'rain on leaves', rain_scatter(1.25, 23), .28, .10, .16)
    cue(1134, '同行皆狼狈', 'hurried wet soles',
        layer(.93, [(0, synth.straw_step(), .85),
                    (.19, synth.straw_step(size=.82), .59)]), .29, .18, .10)
    cue(1200, '穿林打叶', 'rain / bamboo leaves', rain_scatter(1.45, 25), .31, -.18, .17)
    for frame, gain, pan in [(1266, .31, -.20), (1332, .27, .16), (1398, .29, -.12)]:
        cue(frame, '同行雨中疾步', 'wet straw sole / gravel', synth.straw_step(), gain, pan, .10)

    # Su Shi keeps moving: the same pulse becomes quieter and steadier.
    for frame, gain, pan in [(1530, .27, -.13), (1596, .24, .12), (1662, .25, -.10)]:
        cue(frame, '苏轼吟啸徐行', 'measured wet step', synth.straw_step(), gain, pan, .12)

    # Cane/shoes now occupy exactly 66 visual frames (2.2 seconds).
    cue(1727, '竹杖短促落地', 'bamboo contact', synth.bamboo(1.02), .34, -.18, .10)
    cue(1760, '芒鞋掠过泥水', 'straw sole / water', synth.straw_step(), .29, .16, .10)
    cue(1793, '转到苏轼本人', 'sleeve / soft fiber', cloth_turn(), .18, .10, .06)
    cue(1840, '轻胜马词意展开', 'paper fiber', synth.paper_fold(), .18, -.10, .10, 3)

    # A single stronger central accent, then tactile clothing and rainfall.
    cue(1991, '谁怕主落点', 'low body / bamboo stamp',
        layer(1.05, [(0, synth.grounded_impact(.84), .84),
                     (.003, synth.bamboo(.89), .40),
                     (.025, synth.bronze_edge(.72), .11)]), .46, 0, .09)
    cue(2057, '一蓑烟雨空间展开', 'broad air / woven cloth',
        layer(1.26, [(0, synth.warm_air(1.2), .52),
                     (.032, synth.fiber_weave(2), .71)]), .27, -.06, .24, 3)
    cue(2123, '烟雨任平生', 'rain on cloak', rain_scatter(1.34, 21), .22, .18, .17)

    # Weather changes; attacks become softer after the main declaration.
    cue(2255, '料峭春风', 'moving cold air', synth.cool_air(2.14), .22, -.26, .18, 6)
    cue(2321, '衣袖收拢 / 微冷', 'close sleeve fiber', cloth_turn(), .23, .18, .07, 2)
    cue(2453, '山头斜照相迎', 'warm air / fine bronze edge',
        layer(1.45, [(0, synth.warm_air(1.42), .70),
                     (.075, synth.bronze_edge(.92), .14)]), .21, -.12, .31, 3)
    cue(2519, '云隙透光', 'soft air', synth.warm_air(1.04), .11, .26, .28, 2)
    cue(2651, '回首向来萧瑟处', 'cloth turn / quiet foot',
        layer(.94, [(0, cloth_turn(), .65),
                    (.058, synth.straw_step(False), .38)]), .19, .04, .17)
    cue(2783, '来路最后一滴雨', 'distant droplet', synth.water_drop(.88), .078, -.44, .38)
    cue(2915, '也无风雨也无晴', 'receding weather / gentle air',
        layer(2.1, [(0, synth.cool_air(1.95), .42),
                    (.21, rain_scatter(1.66, 7), .26)]), .105, -.05, .30, 4)
    cue(3178, '把下一步走下去', 'quiet forward step', synth.straw_step(False), .22, -.10, .18)
    cue(3309, '继续向前', 'quiet forward step', synth.straw_step(False), .16, .11, .22)

    # Low scene beds provide continuity, and stop when the narrative leaves each place.
    # Every bed is declared separately; no invented extra visual/beat cue is implied.
    ambience = [
        (0, 198, .0035, 'rain'), (408, 649, .0030, 'river'),
        (1002, 1452, .0064, 'rain'), (1464, 1713, .0048, 'rain'),
        (1991, 2237, .0043, 'rain'), (2255, 2434, .0030, 'air'),
        (2651, 2859, .0012, 'rain'),
    ]
    for start_frame, end_frame, gain, material in ambience:
        duration = (end_frame-start_frame)/FPS
        t = synth.time(duration)
        lo, hi = {'rain': (1500, 8200), 'river': (110, 2200), 'air': (140, 1400)}[material]
        start = start_frame*SAMPLES_PER_FRAME
        for channel in (0, 1):
            bed = synth.noise(len(t), lo, hi) * np.sin(np.pi*t/duration)**1.2
            bed *= .65+.35*np.sin(t*2.05+channel*.83)**2
            mix[start:start+len(t), channel] += bed*gain
    return mix


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    bgm = OUT/'bgm-original.mp3'
    bgm_hash = synth.sha(bgm)
    decode_args = ['ffmpeg', '-v', 'error', '-i', str(bgm), '-t', '120',
                   '-ar', str(SR), '-ac', '2', '-f', 'f32le', 'pipe:1']
    decoded = synth.run(decode_args).stdout
    music = np.frombuffer(decoded, np.float32).reshape(-1, 2).copy()
    assert music.shape == (SAMPLES, 2)
    sfx = make_sfx()

    fade = np.ones(SAMPLES, np.float32)
    fade[:384] = np.linspace(0, 1, 384, dtype=np.float32)
    fade[-67200:] = np.cos(np.linspace(0, np.pi/2, 67200)).astype(np.float32)**2
    fade[-1] = 0
    duck = np.ones(SAMPLES, np.float32)
    duck_frames = [13, 79, 145, 276, 738, 1002, 1200, 1727, 1991, 2057]
    for frame in duck_frames:
        center = frame*SAMPLES_PER_FRAME
        radius = round(.36*SR)
        a, b = max(0, center-radius), min(SAMPLES, center+radius)
        relative = (np.arange(a, b)-center)/SR
        duck[a:b] -= .13*np.exp(-(relative/.13)**2).astype(np.float32)
    processed_music = music*.73*fade[:, None]*duck[:, None]
    sfx *= fade[:, None]
    premix = processed_music+sfx

    with tempfile.TemporaryDirectory(prefix='dingfengbo-v3-audio-') as folder:
        temporary = Path(folder)
        wavfile.write(temporary/'sfx-f32.wav', SR, sfx)
        synth.run(['ffmpeg', '-v', 'error', '-y', '-i', str(temporary/'sfx-f32.wav'),
                   '-c:a', 'pcm_s24le', str(OUT/'sfx-v3.wav')])
        wavfile.write(temporary/'premix-f32.wav', SR, premix)
        first = synth.measure(temporary/'premix-f32.wav')
        normalizer = (
            f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={first['input_i']}:"
            f"measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:"
            f"measured_thresh={first['input_thresh']}:offset={first['target_offset']}:"
            f'linear=true:print_format=json,aresample={SR},atrim=end_sample={SAMPLES}'
        )
        result = synth.run(['ffmpeg', '-v', 'info', '-y', '-i', str(temporary/'premix-f32.wav'),
                            '-af', normalizer, '-c:a', 'pcm_s24le', '-ar', str(SR),
                            '-ac', '2', str(OUT/'soundtrack-v3.wav')])
        match = re.search(r'\{\s*"input_i".*?\}', result.stderr.decode(), re.S)
        normalization = json.loads(match.group()) if match else {}

    measured = synth.measure(OUT/'soundtrack-v3.wav')
    sfx_measured = synth.measure(OUT/'sfx-v3.wav')
    sr, audio = wavfile.read(OUT/'soundtrack-v3.wav')
    normalized = audio.astype(np.float64)/2**31
    event_levels = []
    for event in EVENTS:
        a = event['sound_start_sample']
        b = min(SAMPLES, a+round((event['sound_duration_seconds']+.20)*SR))
        effect, musical = sfx[a:b], processed_music[a:b]
        event_levels.append({
            'frame': event['frame'],
            'effect_peak_dbfs': round(float(20*np.log10(max(1e-12, np.max(np.abs(effect))))), 2),
            'effect_rms_dbfs': round(float(20*np.log10(max(1e-12, np.sqrt(np.mean(effect*effect))))), 2),
            'music_rms_dbfs': round(float(20*np.log10(max(1e-12, np.sqrt(np.mean(musical*musical))))), 2),
        })
    # This is an implementation invariant, not a perceptual synchronization claim.
    mapping_checks = []
    for frame in [0, 210, 408, 738, 936, 1200, 1727, 1991, 2255, 2651, 3178, 3558]:
        a, b = frame*SAMPLES_PER_FRAME, min(SAMPLES, frame*SAMPLES_PER_FRAME+SR//4)
        reconstructed = music[a:b]*(.73*fade[a:b, None]*duck[a:b, None])
        mapping_checks.append({
            'source_start_sample': a, 'output_start_sample': a, 'samples_checked': b-a,
            'max_processing_error': float(np.max(np.abs(reconstructed-processed_music[a:b]))),
        })
    report = {
        'version': 3, 'duration_seconds': len(audio)/sr, 'sample_rate': sr,
        'samples': len(audio), 'channels': audio.shape[1], 'bit_depth': 24,
        'integrated_lufs': float(measured['input_i']),
        'true_peak_dbtp': float(measured['input_tp']),
        'sample_peak_dbfs': float(20*np.log10(np.max(np.abs(normalized)))),
        'loudness_range_lu': float(measured['input_lra']),
        'clipped_samples': int(np.count_nonzero(np.abs(normalized) >= 1)),
        'last_sample_absolute': float(np.max(np.abs(normalized[-1]))),
        'stereo_correlation': float(np.corrcoef(normalized.T)[0, 1]),
        'sfx_integrated_lufs': float(sfx_measured['input_i']),
        'sfx_true_peak_dbtp': float(sfx_measured['input_tp']),
        'foreground_event_count': len(EVENTS), 'synthesis_seed': SEED,
        'external_sfx': False, 'voiceover': False,
        'sound_effects_source': 'Original deterministic synthesis; unchanged V2 physical-mode and noise functions plus V3 material layering.',
        'bgm_sha256': bgm_hash, 'bgm_file_unchanged': synth.sha(bgm) == bgm_hash,
        'decoded_first_120_seconds_float32_sha256': hashlib.sha256(decoded).hexdigest(),
        'bgm_decode_arguments': decode_args, 'bgm_speed': 1.0, 'bgm_pitch_shift_semitones': 0,
        'bgm_start_offset_samples': 0,
        'bgm_transform': 'Native 48000 Hz first 5760000 samples; gain, short ducking and end fade only. Output sample n uses source sample n.',
        'music_mapping_checks': mapping_checks, 'music_mapping_float32_tolerance': 2e-7,
        'music_ducking': {'anchor_frames': duck_frames,
                          'max_db': float(20*np.log10(float(duck.min()))),
                          'gaussian_width_seconds': .13},
        'final_fade': {'start_seconds': 118.6, 'end_seconds': 120, 'shape': 'cosine squared'},
        'last_foreground_cue_frame': 3309, 'closing_start_frame': 3442,
        'no_new_impact_during_closing': True,
        'normalization': normalization,
        'sync_validation': {
            'fps': FPS, 'samples_per_frame': SAMPLES_PER_FRAME,
            'cue_anchor_source': 'User-requested V3 editorial pulse grid supplied by composition owner.',
            'frame_and_sample_mapping_checked': True,
            'listening_checked': False, 'perceptual_sync_checked': False,
            'caveat': 'Frame alignment is exact by construction; subjective sound balance and picture sync need listening in Studio.',
        },
        'events': EVENTS, 'event_level_checks': event_levels,
        'soundtrack_sha256': synth.sha(OUT/'soundtrack-v3.wav'),
        'sfx_sha256': synth.sha(OUT/'sfx-v3.wav'),
    }
    assert sr == SR and audio.shape == (SAMPLES, 2)
    assert -15.5 <= report['integrated_lufs'] <= -14.5
    assert report['true_peak_dbtp'] <= -1.3
    assert report['clipped_samples'] == 0 and report['last_sample_absolute'] == 0
    assert report['bgm_file_unchanged']
    assert normalization.get('normalization_type') == 'linear', 'Keep final mix gain linear'
    assert all(check['max_processing_error'] <= 2e-7 for check in mapping_checks)
    assert all(event['sample'] == event['frame']*SAMPLES_PER_FRAME for event in EVENTS)
    assert all(event['frame'] < 3442 for event in EVENTS)
    (OUT/'audio-v3-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    with (OUT/'audio-v3-cues.csv').open('w', newline='') as output:
        writer = csv.DictWriter(output, fieldnames=list(EVENTS[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(EVENTS)
    print(json.dumps({key: report[key] for key in [
        'duration_seconds', 'sample_rate', 'samples', 'integrated_lufs',
        'true_peak_dbtp', 'foreground_event_count', 'clipped_samples',
        'bgm_file_unchanged', 'soundtrack_sha256', 'sfx_sha256',
    ]}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
