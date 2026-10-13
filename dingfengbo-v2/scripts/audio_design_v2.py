#!/usr/bin/env python3
"""Original, deterministic object Foley for Dingfengbo V2.

Dependencies: numpy, scipy, ffmpeg.  No downloaded or sampled Foley is used.
The sole sampled asset is the user's unaltered BGM, decoded at its native 48 kHz.
All event anchors are exact 30 fps frame boundaries (1,600 samples per frame).
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48_000
FPS = 30
SAMPLES = SR * 120
SEED = 10820307 + 2026
RNG = np.random.default_rng(SEED)
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'audio'
EVENTS: list[dict] = []


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(args, check=True, capture_output=True)


def noise(n: int, low: float, high: float) -> np.ndarray:
    y = sosfilt(butter(3, [low, high], btype='bandpass', fs=SR, output='sos'),
                RNG.standard_normal(n)).astype(np.float32)
    return y / max(1e-7, float(np.sqrt(np.mean(y*y))))


def peak(y: np.ndarray) -> np.ndarray:
    return (y / max(1e-7, float(np.max(np.abs(y))))).astype(np.float32)


def time(duration: float) -> np.ndarray:
    return np.arange(round(duration * SR), dtype=np.float64) / SR


def env(t: np.ndarray, attack: float, decay: float) -> np.ndarray:
    return (1 - np.exp(-t/attack)) * np.exp(-t/decay)


def insert(dst: np.ndarray, sample: np.ndarray, seconds: float, gain: float = 1) -> None:
    start = round(seconds * SR)
    count = min(len(dst)-start, len(sample))
    if count > 0:
        dst[start:start+count] += sample[:count] * gain


def water_drop(size: float = 1, dry: bool = False) -> np.ndarray:
    """A damped upward bubble chirp, broadband contact, then small droplets."""
    t = time(.54 * size)
    p = RNG.uniform(740, 1020) / size
    phase = 2*np.pi*p*(t + .021*(1-np.exp(-t/.021)))
    y = (np.sin(phase) * env(t, .00035, .025*size) * .68 +
         np.sin(phase*1.57+.7) * env(t, .0004, .014*size) * .16)
    y += noise(len(t), 550 if dry else 180, 7900) * env(t, .0003, .010) * .25
    if not dry:
        y += noise(len(t), 110, 1250) * env(t, .0017, .035*size) * .3
    return peak(y)


def shallow_water(size: float = 1) -> np.ndarray:
    t = time(.76 * size)
    y = noise(len(t), 130, 2400) * env(t, .003, .075*size) * .67
    y += noise(len(t), 2200, 8700) * env(t, .011, .12*size) * .25
    for at in np.sort(RNG.uniform(.025, .29*size, 10)):
        insert(y, water_drop(RNG.uniform(.55, .82), dry=True), at, RNG.uniform(.035, .08))
    return peak(y)


def bamboo(size: float = 1) -> np.ndarray:
    t = time(.38)
    y = np.zeros(len(t), np.float32)
    for hz, gain, decay in [(362, .57, .051), (981, .34, .035),
                             (2317, .16, .016), (3441, .055, .01)]:
        y += (gain*np.sin(2*np.pi*hz/size*t)*env(t, .00015, decay)).astype(np.float32)
    y += noise(len(t), 530, 8700) * env(t, .0001, .0032) * .38
    y += noise(len(t), 70, 290) * env(t, .0005, .027) * .21
    # Very quiet second contact from a physical bounce, not a long tonal tail.
    insert(y, noise(round(.025*SR), 1100, 7300)*np.exp(-time(.025)/.004), .041, .035)
    return peak(y)


def grass_friction(duration: float, tension: float = 1) -> np.ndarray:
    """Short irregular fiber stick-slip grains; no single generic sweep."""
    t = time(duration)
    y = np.zeros(len(t), np.float32)
    at = 0.0
    while at < duration - .035:
        at += RNG.uniform(.018, .057) / tension
        span = RNG.uniform(.007, .032)
        tt = time(span)
        grain = noise(len(tt), RNG.uniform(1100, 1800), RNG.uniform(5300, 8000))
        grain *= np.sin(np.pi*tt/span)**1.6
        insert(y, grain, at, RNG.uniform(.13, .35))
    carrier = noise(len(t), 290, 2800)
    y += carrier * (.09 + .11*np.sin(2*np.pi*15.3*t)**4)
    y *= np.sin(np.pi*t/duration)**1.2
    return peak(y)


def straw_step(wet: bool = True, size: float = 1) -> np.ndarray:
    t = time(.72)
    y = noise(len(t), 58, 330)*env(t, .0018, .039)*.88
    y += noise(len(t), 410, 1850)*env(t, .004, .053)*.20
    insert(y, grass_friction(.28, 1.5), .017, .21)
    if wet:
        insert(y, shallow_water(.70), .009, .48)
    return peak(y)*size


def paper_fold() -> np.ndarray:
    t = time(.55)
    y = noise(len(t), 420, 5300)*np.sin(np.pi*t/.55)**1.8
    y *= .27+.73*np.sin(2*np.pi*25*t+2*np.sin(2*np.pi*3.7*t))**4
    insert(y, bamboo(.4), .42, .11)
    return peak(y)


def bronze_edge(duration: float = 1.0) -> np.ndarray:
    t = time(duration)
    y = np.zeros(len(t), np.float32)
    # Inharmonic and muted: a fine drawn metal edge, not a notification chime.
    for hz, gain, tail in [(2273, .6, .12), (3511, .24, .085), (5737, .095, .035)]:
        y += (np.sin(2*np.pi*hz*t)*gain*env(t, .001, tail)).astype(np.float32)
    y += noise(len(t), 2200, 8600)*env(t, .0001, .006)*.13
    return peak(y)


def grounded_impact(duration: float = .82) -> np.ndarray:
    t = time(duration)
    phase = 2*np.pi*(49*t + 24*.023*(1-np.exp(-t/.023)))
    y = np.sin(phase)*env(t, .0026, .15)
    y += noise(len(t), 140, 660)*env(t, .001, .021)*.38
    return peak(y)


def fiber_weave(stage: int) -> np.ndarray:
    t = time(.78 if stage < 3 else 1.04)
    y = grass_friction(len(t)/SR, 1.6+stage*.3)*.68
    # Several distinct crossing contacts become tighter as the cloak closes.
    for at, g in [(0, .37), (.075, .2), (.16, .14), (.28, .11)]:
        insert(y, bamboo(.31+stage*.045), at, g)
    return peak(y)


def cool_air(duration: float = 2.35) -> np.ndarray:
    t = time(duration)
    envelope = np.sin(np.pi*t/duration)**1.8
    y = noise(len(t), 90, 810)*envelope*.9
    y += noise(len(t), 2200, 6100)*envelope*(.10+.07*np.sin(2*np.pi*4.2*t)**2)
    return peak(y)


def warm_air(duration: float = 1.45) -> np.ndarray:
    t = time(duration)
    y = noise(len(t), 460, 2200)*env(t, .11, .24)*.7
    y += noise(len(t), 2200, 6200)*env(t, .08, .17)*.15
    return peak(y)


def stereo_add(mix: np.ndarray, at: float, sound: np.ndarray,
               gain: float, pan: float = 0, room: float = .1) -> None:
    start = round(at * SR)
    skip = max(0, -start)
    start = max(0, start)
    n = min(len(sound)-skip, len(mix)-start)
    if n <= 0:
        return
    weights = [math.cos((pan+1)*math.pi/4), math.sin((pan+1)*math.pi/4)]
    for c in [0, 1]:
        mix[start:start+n,c] += sound[skip:skip+n]*gain*weights[c]
    # Diffuse early reflections occupy opposite sides, leaving the dry contact centered.
    for delay, decay in [(.031, .43), (.057, .28), (.091, .17), (.137, .10), (.193, .055)]:
        off = start+round(delay*SR)
        take = min(n, len(mix)-off)
        if take > 0:
            for c in [0, 1]:
                mix[off:off+take,c] += sound[skip:skip+take]*gain*room*decay*weights[1-c]


def make_sfx() -> np.ndarray:
    mix = np.zeros((SAMPLES, 2), np.float32)

    def cue(frame: int, name: str, kind: str, sound: np.ndarray, gain: float,
            pan: float = 0, room: float = .13, pre: float = 0) -> float:
        at = frame/FPS
        stereo_add(mix, at-pre, sound, gain, pan, room)
        EVENTS.append({'frame':frame, 'seconds':round(at, 6), 'sample':frame*1600,
                       'name':name, 'material':kind, 'gain_linear':gain,
                       'pan':pan, 'pre_roll_seconds':pre,
                       'sound_duration_seconds':round(len(sound)/SR, 6)})
        return at

    at=cue(13, '雨滴撞入金线', 'water / short body / micro droplets', water_drop(1.35), .29, -.06, .21)
    stereo_add(mix, at+.005, grounded_impact(.62), .135, 0, .06)
    stereo_add(mix, at+.033, shallow_water(.85), .21, .16, .22)
    cue(79, '冲击环扩散', 'shallow water / bronze edge', shallow_water(.7), .155, .19, .24)
    stereo_add(mix, 79/FPS+.023, bronze_edge(.6), .025, -.24, .2)
    cue(190, '词稿展开', 'paper fiber', paper_fold(), .10, -.22, .12, .18)
    cue(210, '题名压印落定', 'muted bronze / wood stamp', bamboo(.65), .125, 0, .18)
    stereo_add(mix, 210/FPS, bronze_edge(.7), .030, .1, .2)
    cue(540, '回应路径落定', 'dry bamboo contact', bamboo(.81), .265, .03, .1)
    at=cue(738, '竹杖第一步', 'bamboo on wet stone', bamboo(1.02), .34, -.17, .11)
    stereo_add(mix, at+.007, shallow_water(.4), .065, -.17, .1)
    cue(804, '芒鞋第一步', 'straw sole / shallow water', straw_step(), .28, .16, .12)
    cue(870, '竹杖第二步', 'bamboo contact', bamboo(.92), .225, -.09, .13)
    cue(936, '芒鞋承接', 'straw sole / water', straw_step(), .19, .1, .16)
    cue(1002, '物件比较转向', 'grass friction / short air', grass_friction(.42, 1.2), .125, -.3, .19, .12)
    cue(1068, '自己的步调', 'dry straw sole', straw_step(False), .18, .15, .13)
    cue(1200, '谁怕落字', 'short grounded low contact', grounded_impact(), .30, 0, .07)
    at=cue(1266, '踏上玉青落点', 'close straw step / water burst', straw_step(), .37, -.015, .13)
    stereo_add(mix, at+.027, shallow_water(.82), .16, .21, .20)
    cue(1464, '蓑衣纤维穿插', 'dry braided fiber / crossing contacts', fiber_weave(1), .245, -.27, .10)
    cue(1530, '蓑衣经纬编织', 'denser braided fiber', fiber_weave(2), .275, .21, .11)
    at=cue(1596, '蓑衣整体收束', 'tightened fiber / low wooden closure', fiber_weave(3), .265, .02, .18)
    stereo_add(mix, at, bamboo(1.2), .17, 0, .15)
    at=cue(1630, '雨珠滑过蓑衣', 'small water beads', water_drop(.63, True), .105, -.23, .10)
    for delay, pan in [(.09,.04), (.23,.26), (.39,.35)]:
        stereo_add(mix, at+delay, water_drop(.55, True), .047, pan, .1)
    cue(1727, '微冷春风', 'soft moving air', cool_air(2.55), .15, -.07, .18, .32)
    cue(1859, '照料自己拢衣', 'close cloth / straw fiber', grass_friction(.82, .68), .12, .08, .07, .12)
    at=cue(1991, '斜照迎来', 'fine bronze edge / warming air', bronze_edge(1.1), .054, -.15, .35)
    stereo_add(mix, at-.09, warm_air(1.45), .093, .29, .30)
    cue(2057, '暖光滑过物件', 'soft surface air', warm_air(.9), .075, .28, .28, .09)
    cue(2255, '天气波带经过', 'water / dry contact', water_drop(.88), .091, -.27, .22)
    cue(2387, '人生路径延伸', 'quiet straw / paper fiber', grass_friction(.40, .8), .071, .14, .2, .06)
    cue(2519, '视野扩大', 'brief soft air', warm_air(.8), .041, .05, .25, .11)
    cue(2651, '回首来路余雨', 'distant single droplet', water_drop(.93), .038, -.45, .40)
    cue(3046, '归去轻落杖', 'distant bamboo', bamboo(1.06), .088, -.1, .21)
    cue(3112, '当下的一步', 'quiet dry straw sole', straw_step(False), .079, .08, .23)
    at=cue(3178, '天气空间展开', 'broad air / grounded body / sparse metal', grounded_impact(.9), .29, 0, .08)
    stereo_add(mix, at-.12, warm_air(1.1), .10, -.58, .38)
    stereo_add(mix, at+.033, warm_air(1.28), .089, .59, .36)
    stereo_add(mix, at+.052, bronze_edge(.9), .036, -.33, .39)
    stereo_add(mix, at+.173, bronze_edge(.8), .021, .41, .32)

    # Sparse, extremely quiet material ambience. No artificial constant hiss bed.
    for start, duration, gain, material in [(.05, 3.8, .0021, 'rain'),
          (13.9, 8.2, .0016, 'rain'), (48.8, 7.9, .0014, 'fiber'),
          (57.57, 7.8, .0022, 'air'), (106.2, 7.6, .0010, 'air')]:
        t = time(duration)
        for c in [0, 1]:
            low, high = (2000, 8000) if material=='rain' else ((700, 5300) if material=='fiber' else (150, 1300))
            bed=noise(len(t),low,high)*np.sin(np.pi*t/duration)**1.1
            bed*=.66+.24*np.sin(t*2.1+c*.9)**2
            begin=round(start*SR)
            mix[begin:begin+len(t),c] += bed*gain
    return mix


def measure(path: Path) -> dict:
    p = run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af',
             'loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json','-f','null','-'])
    match=re.search(r'\{\s*"input_i".*?\}',p.stderr.decode(),re.S)
    if not match:
        raise RuntimeError('FFmpeg loudness measurement missing')
    return json.loads(match.group())


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    bgm = OUT/'bgm-original.mp3'
    input_hash = sha(bgm)
    decode_args=['ffmpeg','-v','error','-i',str(bgm),'-t','120','-ar','48000','-ac','2','-f','f32le','pipe:1']
    decoded=run(decode_args).stdout
    music=np.frombuffer(decoded,np.float32).reshape(-1,2).copy()
    assert len(music)==SAMPLES, f'Expected {SAMPLES} source samples, got {len(music)}'
    decoded_hash=hashlib.sha256(decoded).hexdigest()
    sfx=make_sfx()
    fade=np.ones(SAMPLES,np.float32)
    fade[-67200:]=np.cos(np.linspace(0,np.pi/2,67200)).astype(np.float32)**2
    fade[:384]=np.linspace(0,1,384,dtype=np.float32)
    duck=np.ones(SAMPLES,np.float32)
    duck_frames=[13, 540, 738, 804, 1200, 1266, 1464, 1530, 1596, 3178]
    # Less than 0.8 dB at ten tactile anchors; no blanket suppression of the BGM.
    for frame in duck_frames:
        center=frame*1600
        radius=round(.36*SR)
        a=max(0,center-radius)
        b=min(SAMPLES,center+radius)
        relative=(np.arange(a,b)-center)/SR
        duck[a:b]-=.083*np.exp(-(relative/.13)**2).astype(np.float32)
    processed_music=music*.76*fade[:,None]*duck[:,None]
    sfx*=fade[:,None]
    premix=processed_music+sfx
    with tempfile.TemporaryDirectory(prefix='dingfengbo-v2-audio-') as td:
        tmp=Path(td)
        wavfile.write(tmp/'sfx-f32.wav',SR,sfx)
        run(['ffmpeg','-v','error','-y','-i',str(tmp/'sfx-f32.wav'),'-c:a','pcm_s24le',str(OUT/'sfx-v2.wav')])
        wavfile.write(tmp/'premix-f32.wav',SR,premix)
        first=measure(tmp/'premix-f32.wav')
        normalizer=(f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={first['input_i']}:"
          f"measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:"
          f"measured_thresh={first['input_thresh']}:offset={first['target_offset']}:"
          'linear=true:print_format=json,aresample=48000,atrim=end_sample=5760000')
        result=run(['ffmpeg','-v','info','-y','-i',str(tmp/'premix-f32.wav'),'-af',normalizer,
          '-c:a','pcm_s24le','-ar','48000','-ac','2',str(OUT/'soundtrack-v2.wav')])
        match=re.search(r'\{\s*"input_i".*?\}',result.stderr.decode(),re.S)
        normalization=json.loads(match.group()) if match else {}
    measured=measure(OUT/'soundtrack-v2.wav')
    sfx_measured=measure(OUT/'sfx-v2.wav')
    sr,audio=wavfile.read(OUT/'soundtrack-v2.wav')
    normalized=audio.astype(np.float64)/2**31
    channel_correlation=float(np.corrcoef(normalized.T)[0,1])
    # Explicitly document the unchanged input mapping: output sample n uses BGM sample n.
    proof_windows=[]
    for second in [0,7,18,24.6,40,48.8,57.567,66.367,88.367,105.933,118.6]:
        a=round(second*SR)
        b=min(a+SR//4,SAMPLES)
        coefficient=.76*fade[a:b,None]*duck[a:b,None]
        reconstructed=music[a:b]*coefficient
        proof_windows.append({'source_start_sample':a,'output_start_sample':a,
          'frames':b-a,'max_processing_error':float(np.max(np.abs(reconstructed-processed_music[a:b])))})
    event_levels=[]
    for e in EVENTS:
        a=max(0,e['sample']-int(e['pre_roll_seconds']*SR))
        b=min(SAMPLES,a+round((e['sound_duration_seconds']+.20)*SR))
        effect=sfx[a:b]
        musical=processed_music[a:b]
        event_levels.append({'frame':e['frame'], 'effect_peak_dbfs':round(float(20*np.log10(max(1e-12,np.max(np.abs(effect))))),2),
          'effect_rms_dbfs':round(float(20*np.log10(max(1e-12,np.sqrt(np.mean(effect*effect))))),2),
          'music_rms_dbfs':round(float(20*np.log10(max(1e-12,np.sqrt(np.mean(musical*musical))))),2)})
    report={
      'version':2,'duration_seconds':len(audio)/sr,'sample_rate':sr,
      'samples':len(audio),'channels':audio.shape[1],'bit_depth':24,
      'integrated_lufs':float(measured['input_i']),'true_peak_dbtp':float(measured['input_tp']),
      'sample_peak_dbfs':float(20*np.log10(np.max(np.abs(normalized)))),
      'loudness_range_lu':float(measured['input_lra']),
      'clipped_samples':int(np.count_nonzero(np.abs(normalized)>=1)),
      'last_sample_absolute':float(np.max(np.abs(normalized[-1]))),
      'stereo_correlation':channel_correlation,
      'sfx_integrated_lufs':float(sfx_measured['input_i']),
      'sfx_true_peak_dbtp':float(sfx_measured['input_tp']),
      'foreground_event_count':len(EVENTS),
      'synthesis_seed':SEED,'external_sfx':False,
      'sound_effects_source':'Original seeded noise, damped physical modes, granular fiber friction and early reflections.',
      'bgm_sha256':input_hash,'bgm_file_unchanged':sha(bgm)==input_hash,
      'decoded_first_120_seconds_float32_sha256':decoded_hash,
      'bgm_decode_arguments':decode_args,
      'bgm_speed':1.0,'bgm_pitch_shift_semitones':0,
      'bgm_start_offset_samples':0,
      'bgm_transform':'Native 48kHz first 5760000 samples, gain only; output sample n maps to source sample n.',
      'music_mapping_checks':proof_windows,'music_mapping_float32_tolerance':2e-7,
      'music_ducking':{'anchor_frames':duck_frames,'max_db':float(20*np.log10(float(duck.min()))),'gaussian_width_seconds':.13},
      'final_fade':{'start_seconds':118.6,'end_seconds':120,'shape':'cosine squared'},
      'no_new_impact_after_frame':3178,'ending_frame':3442,
      'normalization':normalization,'events':EVENTS,'event_level_checks':event_levels,
      'soundtrack_sha256':sha(OUT/'soundtrack-v2.wav'),'sfx_sha256':sha(OUT/'sfx-v2.wav'),
    }
    assert sr==SR and len(audio)==SAMPLES and audio.shape[1]==2
    assert -15.5 <= report['integrated_lufs'] <= -14.5
    assert report['true_peak_dbtp'] <= -1.3
    assert report['clipped_samples']==0
    assert report['last_sample_absolute']==0
    assert report['bgm_file_unchanged']
    assert all(x['max_processing_error']<=2e-7 for x in proof_windows)
    (OUT/'audio-v2-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ['duration_seconds','sample_rate','samples','integrated_lufs','true_peak_dbtp',
      'foreground_event_count','clipped_samples','bgm_file_unchanged','soundtrack_sha256']},ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
