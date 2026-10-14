#!/usr/bin/env python3
"""V3 remake: 120 s native-speed user music + sparse original synthesized Foley.

Run: python3 scripts/v3r/audio.py
Requires installed NumPy, SciPy, ffmpeg, ffprobe. Temporary PCM stays in /tmp.
Only this script, the V3r AAC/reports, and docs/v3-remake/AUDIO.md are new assets.
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
SEED = 10820307 + 2030
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
    for index in peaks[(times[peaks] >= 67) & (times[peaks] < 71)]:
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
        'sixteen_pulse_phrase_grid_candidates_seconds': [round(float(phase+i*64*period), 3) for i in range(7)],
        'climax_local_onset_candidates': nearby,
        'recommended_anchors': [
            {'seconds': .405, 'purpose': 'first musical attack; opening remains light'},
            {'seconds': 18.0, 'purpose': 'strong source entrance supports farming chapter'},
            {'seconds': 20.533333, 'purpose': 'hoe contact follows character, not nearest beat'},
            {'seconds': 29.833333, 'purpose': 'rain arrival; source onset 29.820'},
            {'seconds': 49.8, 'purpose': 'selected measured footfall at visual contact'},
            {'seconds': 59.0, 'purpose': 'cane close-up begins; contact at 59.0'},
            {'seconds': 59.8, 'purpose': 'shoe contact during 1.6-second close-up'},
            {'seconds': 68.566667, 'purpose': '谁怕; source spectral onset 68.565; frame 2057'},
            {'seconds': 70.766667, 'purpose': '一蓑烟雨 expands; source bass onset 70.765'},
            {'seconds': 81.2, 'purpose': 'sleeve gathers at character contact'},
            {'seconds': 88.7, 'purpose': 'sun clears mountain after 88.355 phrase candidate'},
            {'seconds': 90.4, 'purpose': 'warm light reaches face; restrained air only'},
            {'seconds': 99.0, 'purpose': 'shoulders complete turn'},
            {'seconds': 105.0, 'purpose': 'departure footfall; music flows into 105.943 phrase grid'},
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


def make_sfx() -> tuple[np.ndarray, list[dict]]:
    synth.RNG = np.random.default_rng(SEED)
    EVENTS.clear()
    mix = np.zeros((SAMPLES, 2), np.float32)

    def cue(frame: int, name: str, material: str, sound: np.ndarray,
            gain: float, pan: float = 0, room: float = .10,
            sync: str = 'scene texture', pre_frames: int = 0) -> None:
        start_frame = frame-pre_frames
        synth.stereo_add(mix, start_frame/FPS, sound, gain, pan, room)
        EVENTS.append({
            'frame': frame, 'seconds': round(frame/FPS, 6),
            'sample': frame * (SR//FPS),
            'sound_start_frame': start_frame,
            'sound_start_sample': start_frame * (SR//FPS),
            'name': name, 'material': material, 'gain_linear': gain,
            'pan': pan, 'pre_roll_frames': pre_frames,
            'sound_duration_seconds': round(len(sound)/SR, 6), 'sync_basis': sync,
        })

    # Prologue: different materials, with only one hard door closure.
    cue(12, '诗案卷纤维', 'paper fiber', synth.paper_fold(), .090, -.16, .07,
        'opening source onset 0.405 s')
    cue(33, '牢门落闩', 'wood body / small metal latch', door_close(), .240, .04, .17,
        'visual latch contact at 1.10 s')
    cue(96, '贬舟掠水', 'hull / shallow water', river_pass(), .103, -.24, .16)
    cue(177, '抬眼前衣领微动', 'close cloth', cloth_turn(.45), .057, .07, .04)
    cue(222, '舟岸水退', 'water / river bank', synth.shallow_water(1.45), .086, -.18, .16)
    cue(434, '简居檐下微风', 'quiet air', synth.cool_air(1.45), .047, .22, .14)

    # One physically timed hoe strike. The next action has already cut to writing.
    cue(616, '锄头入土', 'wood shaft / granular dry soil', earth_cut(), .188, -.11, .06,
        'visual hoe contact frame 616; 20.533333 s')
    cue(733, '案上纸页轻移', 'paper fiber', synth.paper_fold(), .079, -.16, .06)
    cue(793, '笔尖行过纸面', 'dry writing fiber', synth.grass_friction(.54, 1.1), .053, .13, .04)

    cue(895, '沙湖雨来', 'rain / leaves', rain_scatter(1.5, 24), .169, .10, .14,
        'visual rain arrival frame 895; source onset 29.820 s')
    cue(1040, '同行衣衫被雨打湿', 'wet cloth / close drops',
        layer(.96, [(0, cloth_turn(.65), .54), (.09, rain_scatter(.8, 12), .54)]),
        .094, .24, .08)
    cue(1170, '穿林打叶近景', 'irregular leaf droplets', rain_scatter(1.4, 22), .111, -.22, .15)

    # Three selected walking contacts, not a mechanical click on every step.
    for frame, gain, pan in [(1494, .135, -.12), (1566, .116, .11), (1686, .105, -.08)]:
        cue(frame, '吟啸徐行落脚', 'wet straw sole / soft soil', synth.straw_step(), gain,
            pan, .09, 'visual walk: chapter starts 49 s, foot contacts each 0.8 s')
    cue(1770, '竹杖点地', 'bamboo on damp ground', synth.bamboo(1.02), .169, -.17, .07,
        'visual close-up contact 59.0 s; close-up ends at 60.6 s')
    cue(1794, '芒鞋掠过浅水', 'straw sole / water', synth.straw_step(), .144, .12, .08,
        'visual close-up foot contact 59.8 s')

    # Main declaration: a unique soft-bodied accent and open air, then sparse texture.
    cue(2057, '谁怕主落点', 'low body / muted wood edge',
        layer(.94, [(0, synth.grounded_impact(.8), .84),
                     (.003, synth.bamboo(.89), .28)]), .245, 0, .07,
        'word/pose frame 2057; source onset 68.565 s')
    cue(2123, '一蓑烟雨展开', 'woven cloak / broad air',
        layer(1.42, [(0, synth.warm_air(1.3), .55),
                     (.04, synth.grass_friction(.96, .80), .45)]), .116, -.06, .23,
        'space expansion frame 2123; source bass onset 70.765 s')
    cue(2274, '雨珠滑过蓑衣', 'fine water beads / woven surface', rain_scatter(1.2, 13),
        .078, .17, .12)

    cue(2400, '料峭春风', 'soft cold air', synth.cool_air(2.0), .086, -.24, .17,
        'cold chapter begins at 80 s')
    cue(2436, '微冷拢袖收紧', 'close sleeve fiber', cloth_turn(.65), .120, .14, .05,
        'visual sleeve tightens at 81.2 s', 2)
    cue(2661, '斜照越过山头', 'warm moving air', synth.warm_air(1.45), .064, -.13, .24,
        'visual sun clears mountain at 88.7 s', 3)
    cue(2712, '暖光迎面', 'soft air', synth.warm_air(.85), .040, .21, .20,
        'visual light reaches face at 90.4 s', 2)
    cue(2970, '回首肩袖转过', 'cloth turn', cloth_turn(.72), .079, .06, .09,
        'head turns at 97.5 s, shoulders complete at 99 s', 3)
    cue(3150, '归去向前一步', 'quiet dry straw sole', synth.straw_step(False), .091,
        -.08, .12, 'visual departure footfall at 105 s')

    beds = [
        {'start': 2.9, 'end': 10.1, 'gain': .0022, 'material': 'river'},
        {'start': 29.833333, 'end': 48.9, 'gain': .0043, 'material': 'rain'},
        {'start': 49.0, 'end': 79.6, 'gain': .0031, 'material': 'rain'},
        {'start': 79.8, 'end': 87.9, 'gain': .0023, 'material': 'air'},
        {'start': 97.0, 'end': 105.0, 'gain': .0009, 'material': 'air'},
    ]
    for bed in beds:
        length = bed['end']-bed['start']
        t = synth.time(length)
        lo, hi = {'rain': (1500, 8200), 'river': (110, 2200), 'air': (140, 1400)}[bed['material']]
        start = round(bed['start']*SR)
        envelope = np.minimum(1, t/.8) * np.minimum(1, (length-t)/1.0)
        for channel in (0, 1):
            texture = synth.noise(len(t), lo, hi)
            texture *= envelope * (.65+.35*np.sin(t*2.05+channel*.83)**2)
            mix[start:start+len(t), channel] += texture * bed['gain']
    return mix, beds


def music_envelope() -> tuple[np.ndarray, dict]:
    t = np.arange(SAMPLES, dtype=np.float64)/SR
    envelope = np.ones(SAMPLES, np.float32)
    # Preserve the file's natural first 0.4 s; let the first phrase rise lightly.
    envelope *= np.interp(t, [0, .36, .405, 1.25, 2.4, 118.6, 120],
                          [.12, .32, .46, .80, 1, 1, 0]).astype(np.float32)
    # A 0.59 s anticipation dip: no cut, silence, speed edit, or artificial loop.
    points = [67.98, 68.24, 68.36, 68.566667, 68.73]
    gains = [1.0, .64, .64, 1.0, 1.0]
    envelope *= np.interp(t, points, gains).astype(np.float32)
    # The film's emotional release becomes slightly less dense, still continuous.
    envelope *= np.interp(t, [0, 96.8, 101.8, 108.5, 111.0, 118.6, 120],
                          [1, 1, .88, .88, .91, .91, .91]).astype(np.float32)
    # Fade out equal-amplitude to silence over exactly 1.4 s.
    return envelope, {
        'base_music_gain_linear': MUSIC_GAIN,
        'opening': {'natural_first_onset_seconds': .405, 'full_gain_seconds': 2.4},
        'climax_duck': {'start_seconds': 67.98, 'minimum_gain_linear': .64,
                         'minimum_gain_db': round(float(20*np.log10(.64)), 3),
                         'minimum_from_seconds': 68.24, 'minimum_to_seconds': 68.36,
                         'full_recovery_seconds': 68.566667, 'silence_inserted': False},
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
    destination = OUT / 'soundtrack-v3r.m4a'
    with tempfile.TemporaryDirectory(prefix='dingfengbo-v3r-audio-', dir='/tmp') as directory:
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
        for seconds in (10, 62, 114):
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
    csv_path = OUT / 'audio-v3r-cues.csv'
    with csv_path.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(EVENTS[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(EVENTS)
    assert b'\r' not in csv_path.read_bytes(), 'CSV must use LF only'
    report = {
        'version': 'v3-remake', 'duration_seconds': DURATION, 'fps': FPS,
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
                  'generation': 'original deterministic synthesized paper, wooden door, granular soil, water, rain, straw steps, bamboo, cloth, cold/warm air; no downloaded effects',
                  'cues_file': 'public/audio/audio-v3r-cues.csv', 'cues': EVENTS,
                  'ambience_beds': beds, 'premix_peak_linear': float(np.max(np.abs(effects)))},
        'loudness': {'target_integrated_lufs': TARGET_LUFS, 'maximum_true_peak_dbtp': -1.0,
                     'normalization_ceiling_dbtp': TARGET_TP,
                     'premix_measurement': measurement,
                     'second_pass_normalization': normalization_result,
                     'encoded_aac_measurement': final_measurement,
                     'method': 'FFmpeg loudnorm EBU R128 integrated loudness and oversampled true peak, measured again after AAC encoding'},
        'output': {'file': 'public/audio/soundtrack-v3r.m4a', 'sha256': sha256(destination),
                   'probe': output_probe, 'requested_codec': 'AAC LC', 'requested_bitrate_bps': 256000,
                   'decoded_finite': True, 'decoded_samples_in_120s': len(output),
                   'final_20ms_rms_dbfs': round(float(20*np.log10(max(tail_rms, 1e-12))), 3),
                   'source_time_alignment_checks': alignment, 'cue_csv_line_endings': 'LF'},
        'review_status': {'automated_audio_checks': 'passed',
                          'subjective_listening': 'not performed; no subjective approval claimed',
                          'audiovisual_sync_playback': 'not performed by this audio build; check rendered film against contact frames'},
    }
    (OUT/'audio-v3r-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'output': str(destination), 'duration': DURATION, 'foley_cues': len(EVENTS),
                      'lufs': final_measurement['input_i'], 'true_peak_dbtp': final_measurement['input_tp'],
                      'alignment': alignment}, ensure_ascii=False, indent=2))
    return report


if __name__ == '__main__':
    build()
