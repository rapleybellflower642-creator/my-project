#!/usr/bin/env python3
"""V3 gold: 120 s native-speed user music + sparse original synthesized Foley.

Run: python3 scripts/v3g/audio.py
Requires installed NumPy, SciPy, ffmpeg, ffprobe. Temporary PCM stays in /tmp.
Only this script, the V3g AAC/reports, and docs/v3-gold/AUDIO.md are new assets.
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
SEED = 10820307 + 2031
SOURCE = ROOT / 'public/audio/bgm-v4-original.mp3'
OUT = ROOT / 'public/audio'
MUSIC_GAIN = .67
TARGET_LUFS = -15.0
TARGET_TP = -1.8  # Reserve AAC reconstruction headroom before the -1 dBTP requirement.
EVENTS: list[dict] = []


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
            {'seconds': .405, 'purpose': 'first source musical onset; preserve natural opening'},
            {'seconds': 1.1, 'purpose': 'fixed opening brass-seal contact, frame 33'},
            {'seconds': 7.0, 'purpose': 'title scroll begins unfolding, source onset 7.010'},
            {'seconds': 12.966667, 'purpose': 'history red seal contact, frame 389'},
            {'seconds': 19.833333, 'purpose': 'official brass seal settles, frame 595'},
            {'seconds': 25.333333, 'purpose': 'hoe contacts soil, frame 760'},
            {'seconds': 27.966667, 'purpose': 'seed contacts soil, frame 839'},
            {'seconds': 34.266667, 'purpose': 'rain begins, frame 1028'},
            {'seconds': 49.6, 'purpose': 'wavering line settles, frame 1488'},
            {'seconds': 55.5, 'purpose': '何妨 settles into a calm line gesture; one accent only'},
            {'seconds': 62.0, 'purpose': 'fixed bamboo contact; source bass onset 61.975'},
            {'seconds': 64.0, 'purpose': 'lightness lines expand, sustained silk texture'},
            {'seconds': 74.066667, 'purpose': 'fixed 谁怕 entry, frame 2222; source onset 74.060'},
            {'seconds': 77.366667, 'purpose': 'fixed 任平生 sentence expands, frame 2321; source onset 77.360'},
            {'seconds': 118.6, 'purpose': '1.4-second ending fade begins'},
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


def make_sfx() -> tuple[np.ndarray, list[dict]]:
    synth.RNG = np.random.default_rng(SEED)
    EVENTS.clear()
    mix = np.zeros((SAMPLES, 2), np.float32)

    def cue(frame: int, name: str, material: str, sound: np.ndarray,
            gain: float, pan: float = 0, room: float = .10,
            sync: str = 'scene texture, not a claimed physical contact', pre_frames: int = 0) -> None:
        start_frame = frame-pre_frames
        synth.stereo_add(mix, start_frame/FPS, sound, gain, pan, room)
        EVENTS.append({
            'frame': frame, 'seconds': round(frame/FPS, 6),
            'sample': frame * (SR//FPS), 'sound_start_frame': start_frame,
            'sound_start_sample': start_frame * (SR//FPS), 'name': name,
            'material': material, 'gain_linear': gain, 'pan': pan,
            'pre_roll_frames': pre_frames,
            'sound_duration_seconds': round(len(sound)/SR, 6), 'sync_basis': sync,
        })

    # One warm seal statement opens the film; the title breathes as a paper scroll.
    cue(33, '开场铜印落下', 'muted brass / paper / short wood', seal_contact(1.12),
        .193, .02, .10, 'fixed opening contact at 1.100 s')
    cue(210, '定风波题卷展开', 'rolled paper / fine fibers', paper_scroll(1.15),
        .094, -.14, .09, 'fixed title scroll onset at 7.000 s')

    cue(336, '案卷翻开', 'dry paper', paper_scroll(1.15), .073, -.15, .07,
        'History page opens globally 11.20–12.35 s')
    cue(389, '诗案朱印接触', 'ink seal / paper',
        layer(.58, [(0, synth.bamboo(1.72), .60), (.012, seed_contact(), .28)]),
        .116, .10, .05, 'History seal contact at 12.96 s, nearest frame 389')
    cue(461, '赴黄州金线展开', 'fine paper / silk', silk_line(1.45), .053, -.10, .14,
        'History route unfolds globally 15.35–16.85 s')
    cue(595, '官印落桌', 'damped brass / wood', seal_contact(1.28), .146,
        .12, .08, 'History official seal contact at 19.82 s, nearest frame 595')

    cue(760, '木锄落土', 'wood shaft / granular soil', earth_cut(), .156, -.12, .05,
        'Cultivate hoe contact at 25.32 s, nearest frame 760')
    cue(839, '一粒种子入土', 'seed / fine soil', seed_contact(), .087, .11, .04,
        'Cultivate seed contact at 27.95 s, nearest frame 839')
    cue(870, '新芽细细展开', 'soft air / silk fibers',
        layer(1.72, [(0, synth.warm_air(1.6), .58), (.14, silk_line(1.28), .27)]),
        .054, -.04, .17, 'Cultivate sprouts grow globally 28.3–30.6 s; nonliteral growth texture')

    cue(1028, '细雨落下', 'fine rain / close droplets', rain_scatter(1.5, 21), .137,
        .09, .13, 'Rain begins at 34.25 s, rounded to frame 1028')
    cue(1143, '稳住自己的金路', 'warm low metal / air',
        layer(.9, [(0, bronze_soft(.8, 1.4), .40), (.05, synth.warm_air(.8), .43)]),
        .061, -.08, .16, 'stable golden route appears at 38.1 s; diagram accent')
    cue(1488, '波线归于稳定', 'fine silk settling', silk_line(.73), .061,
        -.15, .10, 'Listen first stable point at 49.6 s; texture rises for 4 frames', 4)
    cue(1584, '金线第一步', 'soft wood / close fiber',
        layer(.58, [(0, synth.bamboo(1.6), .25), (.02, silk_line(.45), .70)]),
        .071, -.08, .06, 'Walk first step at 52.8 s; later 0.53 s steps remain unaccented')
    cue(1665, '何妨从容展开', 'silk line / quiet air', silk_line(.92), .054,
        .12, .12, 'Walk 何妨 starts at 55.5 s; one gesture for both characters')

    cue(1860, '竹杖点地', 'bamboo / muted ground', synth.bamboo(1.08), .147,
        -.14, .07, 'fixed Light bamboo contact at 62.0 s; source bass onset 61.975 s')
    cue(1920, '轻盈线条展开', 'fine silk / moving air',
        layer(1.20, [(0, silk_line(1.10), .64), (.12, synth.warm_air(.94), .31)]),
        .067, .15, .18, 'fixed Light line expansion at 64.0 s; no hard transient')

    cue(2222, '谁怕落字', 'warm low metal / short grounded body',
        layer(.94, [(0, bronze_soft(.84, 1.08), .68),
                     (.003, synth.grounded_impact(.72), .48)]),
        .207, 0, .09, 'fixed word entry frame 2222; source spectral onset 74.060 s')
    cue(2321, '任平生主句展开', 'woven silk / open air',
        layer(1.42, [(0, silk_line(1.22), .51), (.05, synth.warm_air(1.31), .54)]),
        .093, -.03, .22, 'fixed sentence expansion frame 2321; source onset 77.360 s')

    # Later scene cues are intentionally soft; the cup is a resonant motif, not a drop.
    cue(2547, '微冷杯口余韵', 'soft ceramic resonance', cup_touch(), .043,
        .14, .16, 'Cold 微冷 begins settling at 84.9 s; quiet cup resonance, no physical drop claimed')
    cue(2508, '春风拂过杯口', 'light cold air', synth.cool_air(2.55), .076,
        -.18, .18, 'Cold steam visibly bends at 83.6 s; wind begins at 83.15 s')
    cue(2790, '斜照越过山脊', 'warm air / fine silk',
        layer(1.8, [(0, synth.warm_air(1.65), .67), (.21, silk_line(1.18), .22), (.03, bronze_soft(.8, .9), .045)]),
        .063, -.10, .25, 'Sun clears mountain ridge at 93.0 s; soft air with restrained overtone')
    cue(2823, '暖光铺展', 'gentle warm air', synth.warm_air(1.4), .039,
        .18, .23, 'Sun first golden ground line at 94.1 s; subsequent lines have no extra accent')
    cue(3010, '回首来路', 'soft silk / paper memory', silk_line(1.24), .048,
        -.12, .19, 'Return route pullback begins at 100 s')
    cue(3150, '归去向前', 'fine line / receding air',
        layer(1.24, [(0, silk_line(.98), .43), (.12, synth.warm_air(1.08), .53)]),
        .049, .13, .18, 'Return point moves 104.5–108.8 s; one soft line gesture at 105.0 s')
    cue(3315, '风雨晴光归于同一条线', 'very soft air', synth.warm_air(1.60), .030,
        .02, .22, 'Return arcs finish merging at 110.5 s; soft release, no hard contact')

    beds = [
        {'start': 34.25, 'end': 41.9, 'gain': .0026, 'material': 'rain'},
        {'start': 42.0, 'end': 50.9, 'gain': .0018, 'material': 'rain'},
        {'start': 72.3, 'end': 81.7, 'gain': .0018, 'material': 'rain'},
        {'start': 83.15, 'end': 89.7, 'gain': .0015, 'material': 'air'},
    ]
    for bed in beds:
        length = bed['end']-bed['start']
        t = synth.time(length)
        lo, hi = {'rain': (1800, 7600), 'air': (180, 1600)}[bed['material']]
        start = round(bed['start']*SR)
        envelope = np.minimum(1, t/.8) * np.minimum(1, (length-t)/1.0)
        for channel in (0, 1):
            texture = synth.noise(len(t), lo, hi)
            texture *= envelope * (.65+.35*np.sin(t*1.65+channel*.83)**2)
            mix[start:start+len(t), channel] += texture * bed['gain']
    EVENTS.sort(key=lambda event: event['frame'])
    assert 22 <= len(EVENTS) <= 28
    return mix, beds


def music_envelope() -> tuple[np.ndarray, dict]:
    t = np.arange(SAMPLES, dtype=np.float64)/SR
    envelope = np.ones(SAMPLES, np.float32)
    # Preserve the file's natural first 0.4 s; let the first phrase rise lightly.
    envelope *= np.interp(t, [0, .36, .405, 1.25, 2.4, 118.6, 120],
                          [.12, .32, .46, .80, 1, 1, 0]).astype(np.float32)
    # A 0.55 s anticipation dip: no cut, silence, speed edit, or artificial loop.
    points = [73.52, 73.76, 73.89, 74.066667, 74.23]
    gains = [1.0, .68, .68, 1.0, 1.0]
    envelope *= np.interp(t, points, gains).astype(np.float32)
    # The film's emotional release becomes slightly less dense, still continuous.
    envelope *= np.interp(t, [0, 99.8, 104.8, 108.5, 111.0, 118.6, 120],
                          [1, 1, .88, .88, .91, .91, .91]).astype(np.float32)
    # Fade out equal-amplitude to silence over exactly 1.4 s.
    return envelope, {
        'base_music_gain_linear': MUSIC_GAIN,
        'opening': {'natural_first_onset_seconds': .405, 'full_gain_seconds': 2.4},
        'climax_duck': {'start_seconds': 73.52, 'minimum_gain_linear': .68,
                         'minimum_gain_db': round(float(20*np.log10(.68)), 3),
                         'minimum_from_seconds': 73.76, 'minimum_to_seconds': 73.89,
                         'full_recovery_seconds': 74.066667, 'silence_inserted': False},
        'ending_fade': {'start_seconds': 118.6, 'end_seconds': 120.0, 'duration_seconds': 1.4},
        'ending_release_gain_linear': .88,
    }


def build() -> dict:
    assert SOURCE.is_file(), SOURCE
    OUT.mkdir(parents=True, exist_ok=True)
    source_hash = sha256(SOURCE)
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
    destination = OUT / 'soundtrack-v3g.m4a'
    with tempfile.TemporaryDirectory(prefix='dingfengbo-v3g-audio-', dir='/tmp') as directory:
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
        for seconds in (9, 66, 114):
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
    csv_path = OUT / 'audio-v3g-cues.csv'
    with csv_path.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(EVENTS[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(EVENTS)
    assert b'\r' not in csv_path.read_bytes(), 'CSV must use LF only'
    report = {
        'version': 'v3-gold', 'duration_seconds': DURATION, 'fps': FPS,
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
                  'generation': 'original deterministic synthesized paper scroll, warm muted bronze seal, granular soil and seed, fine rain, silk line, bamboo, soft ceramic cup, cold/warm air; no downloaded effects',
                  'cues_file': 'public/audio/audio-v3g-cues.csv', 'cues': EVENTS,
                  'ambience_beds': beds, 'premix_peak_linear': float(np.max(np.abs(effects)))},
        'loudness': {'target_integrated_lufs': TARGET_LUFS, 'maximum_true_peak_dbtp': -1.0,
                     'normalization_ceiling_dbtp': TARGET_TP,
                     'premix_measurement': measurement,
                     'second_pass_normalization': normalization_result,
                     'encoded_aac_measurement': final_measurement,
                     'method': 'FFmpeg loudnorm EBU R128 integrated loudness and oversampled true peak, measured again after AAC encoding'},
        'output': {'file': 'public/audio/soundtrack-v3g.m4a', 'sha256': sha256(destination),
                   'probe': output_probe, 'requested_codec': 'AAC LC', 'requested_bitrate_bps': 256000,
                   'decoded_finite': True, 'decoded_samples_in_120s': len(output),
                   'final_20ms_rms_dbfs': round(float(20*np.log10(max(tail_rms, 1e-12))), 3),
                   'source_time_alignment_checks': alignment, 'cue_csv_line_endings': 'LF'},
        'review_status': {'automated_audio_checks': 'passed',
                          'subjective_listening': 'not performed; no subjective approval claimed',
                          'audiovisual_sync_playback': 'not performed by this audio build; check rendered film against contact frames'},
    }
    (OUT/'audio-v3g-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'output': str(destination), 'duration': DURATION, 'foley_cues': len(EVENTS),
                      'lufs': final_measurement['input_i'], 'true_peak_dbtp': final_measurement['input_tp'],
                      'alignment': alignment}, ensure_ascii=False, indent=2))
    return report


if __name__ == '__main__':
    build()
