#!/usr/bin/env python3
"""Deterministic physical-inspired Foley and final 120-second film mix.

Only the user-provided music is sampled. Every Foley/ambience sample is generated
from seeded noise, damped modes and envelopes here; no external SFX is used.
Requires Python 3, numpy, scipy and ffmpeg/ffprobe.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48_000
DURATION = 120.0
N = int(SR * DURATION)
RNG = np.random.default_rng(10820307)
PROJECT = Path(__file__).resolve().parents[1]
OUT = PROJECT / 'public' / 'audio'
EVENTS: list[dict] = []


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(args, check=True, capture_output=True)


def shaped_noise(length: int, lo: float, hi: float) -> np.ndarray:
    x = RNG.standard_normal(length).astype(np.float32)
    sos = butter(3, [lo, hi], btype='bandpass', fs=SR, output='sos')
    y = sosfilt(sos, x).astype(np.float32)
    return y / max(1e-6, float(np.sqrt(np.mean(y * y))))


def normalize_peak(x: np.ndarray) -> np.ndarray:
    return (x / max(1e-8, float(np.max(np.abs(x))))).astype(np.float32)


def smooth_envelope(t: np.ndarray, attack: float, release: float) -> np.ndarray:
    return (1 - np.exp(-t / attack)) * np.exp(-t / release)


def drop(size: float = 1.0, dry: bool = False) -> np.ndarray:
    dur = 0.24 if dry else 0.48
    t = np.arange(round(dur * SR)) / SR
    pitch = RNG.uniform(920, 1620) / size
    # Inharmonic, heavily damped water modes with a short stochastic impact.
    signal = np.zeros(len(t), np.float32)
    for partial, amp in [(1.0, .6), (1.43, .3), (2.18, .13)]:
        phase = 2 * np.pi * pitch * partial * (t + .016 * (1 - np.exp(-t / .025)))
        signal += (np.sin(phase + RNG.uniform(-.3, .3)) * amp *
                   smooth_envelope(t, .001, .025 * size / partial)).astype(np.float32)
    noise = shaped_noise(len(t), 1000, 8500)
    signal += noise * smooth_envelope(t, .0005, .008 if dry else .016) * .9
    if not dry:
        signal += shaped_noise(len(t), 180, 1400) * smooth_envelope(t, .003, .048) * .18
    return normalize_peak(signal)


def splash(size: float = 1.0) -> np.ndarray:
    dur = .95 * size
    t = np.arange(round(dur * SR)) / SR
    body = shaped_noise(len(t), 120, 3100) * smooth_envelope(t, .007, .13 * size)
    spray = shaped_noise(len(t), 2300, 11000) * smooth_envelope(t, .016, .21 * size)
    y = body * .62 + spray * .24
    # Small physical droplets emerge after the broad contact sound.
    for _ in range(14):
        at = int(RNG.uniform(.016, .38 * size) * SR)
        d = drop(RNG.uniform(.65, 1.5)) * RNG.uniform(.014, .055)
        end = min(len(y), at + len(d))
        y[at:end] += d[:end-at]
    return normalize_peak(y)


def cane() -> np.ndarray:
    t = np.arange(int(.48 * SR)) / SR
    y = np.zeros(len(t), np.float32)
    for freq, amp, tail in [(265, .5, .048), (697, .33, .027), (1693, .14, .016)]:
        y += (np.sin(2*np.pi*freq*t) * smooth_envelope(t, .0003, tail) * amp).astype(np.float32)
    y += shaped_noise(len(t), 300, 6500) * smooth_envelope(t, .0003, .006) * .42
    y += shaped_noise(len(t), 80, 430) * smooth_envelope(t, .001, .035) * .14
    return normalize_peak(y)


def footstep(wet: bool = True, size: float = 1.0) -> np.ndarray:
    t = np.arange(int(.73 * SR)) / SR
    heel = shaped_noise(len(t), 65, 430) * smooth_envelope(t, .004, .045)
    straw = shaped_noise(len(t), 800, 6000)
    grain = .35 + .65 * np.sin(2*np.pi*31*t+.7)**2
    y = heel * .8 + straw * grain * smooth_envelope(t, .006, .09) * .21
    if wet:
        water = splash(.65)
        count = min(len(y)-int(.021*SR), len(water))
        y[int(.021*SR):int(.021*SR)+count] += water[:count] * .28
    return normalize_peak(y) * size


def cloth(duration: float = 1.1, intensity: float = 1.0) -> np.ndarray:
    t = np.arange(round(duration*SR)) / SR
    env = np.sin(np.pi*t/duration)**2
    irregular = .16 + .35 * np.sin(2*np.pi*7.2*t)**2 + .49*np.sin(2*np.pi*19.7*t+.6)**4
    y = shaped_noise(len(t), 380, 5800) * env * irregular
    y += shaped_noise(len(t), 95, 900) * env * .22
    return normalize_peak(y) * intensity


def gust(duration: float = 3.6) -> np.ndarray:
    t = np.arange(round(duration*SR)) / SR
    env = np.sin(np.pi*t/duration)**2
    y = shaped_noise(len(t), 75, 740) * env * (0.7+.3*np.sin(2*np.pi*.8*t))
    y += shaped_noise(len(t), 1500, 5300) * env * .095
    return normalize_peak(y)


def low_pulse() -> np.ndarray:
    t = np.arange(round(1.05*SR)) / SR
    phase = 2*np.pi*(48*t+17*.075*(1-np.exp(-t/.075)))
    y = np.sin(phase) * smooth_envelope(t, .016, .25)
    y += shaped_noise(len(t), 90, 380) * smooth_envelope(t, .012, .12) * .08
    return normalize_peak(y)


def light_harmonics(duration: float = 2.8) -> np.ndarray:
    t = np.arange(round(duration*SR)) / SR
    # Low-level modes follow the measured 70s music spectrum (606/908/1213 Hz).
    y = np.zeros(len(t), np.float32)
    for freq, amp in [(606.4, .8), (908.2, .46), (1212.9, .17), (1365.2, .07)]:
        y += (np.sin(2*np.pi*freq*t + .25*np.sin(2*np.pi*.73*t)) * amp *
              smooth_envelope(t, .28, .55)).astype(np.float32)
    y += shaped_noise(len(t), 2100, 6900)*np.sin(np.pi*t/duration)**2*.06
    return normalize_peak(y)


def add(mix: np.ndarray, at: float, sound: np.ndarray, gain: float,
        pan: float = 0, room: float = .12) -> None:
    start = round(at*SR)
    if start >= len(mix):
        return
    weights = [math.cos((pan+1)*np.pi/4), math.sin((pan+1)*np.pi/4)]
    count = min(len(sound), len(mix)-start)
    for c in (0, 1):
        mix[start:start+count, c] += sound[:count] * gain * weights[c]
    # Sparse diffused early reflections, useful space without long reverb wash.
    if room:
        for delay, decay in [(0.037, .36), (.073, .24), (.119, .15), (.173, .08)]:
            off = start + round(delay*SR)
            take = min(len(sound), len(mix)-off)
            if take > 0:
                for c in (0,1):
                    mix[off:off+take,c] += sound[:take]*gain*room*decay*weights[1-c]


def event(time: float, name: str, description: str) -> None:
    EVENTS.append({'time_seconds':time,'name':name,'description':description})


def make_sfx() -> np.ndarray:
    mix = np.zeros((N, 2), np.float32)
    times = np.arange(N, dtype=np.float32)/SR
    rain_env = np.interp(times,
        [0, 1, 6, 15, 18, 25, 42, 52, 58, 60, 69, 73, 79, 88.4, 97.2, 106, 112, 120],
        [.7, 1, .44, .64, .48, .38, .3, .5, .38, .23, .2, .08, .065, .026, .02, .015, .008, 0]).astype(np.float32)
    wind_env = np.interp(times,
        [0, 6, 18, 42, 51, 59, 62, 66, 70, 79, 88.4, 97.2, 106, 111, 120],
        [.15, .28, .15, .32, .28, .4, 1, .7, .21, .18, .08, .08, .25, .12, .02]).astype(np.float32)
    for channel in (0,1):
        rain = shaped_noise(N, 1500, 8200)
        rain *= .75 + .14*np.sin(times*.71+channel) + .1*np.sin(times*1.37+.6*channel)
        mix[:,channel] += rain * rain_env * .0062
        wind = shaped_noise(N, 65, 720)
        mix[:,channel] += wind * wind_env * .0064
        leaf = shaped_noise(N, 1400, 4700)
        leaf *= (.4+.6*np.sin(times*2.45+channel*.9)**4)
        mix[:,channel] += leaf*wind_env*.0016
    # Natural irregular fine drops sit behind the intentional foreground events.
    at = .15
    while at < 118:
        intensity = float(np.interp(at,[0,6,18,60,70,88,106,118],[1,.3,.45,.35,.09,.025,.014,0]))
        at += RNG.exponential(.16 if at < 70 else .85)
        add(mix, at, drop(RNG.uniform(.5,1.2), dry=True),
            RNG.uniform(.002,.009)*intensity, RNG.uniform(-.95,.95), .1)

    event(.42,'近处雨滴','一滴落叶水珠，细小后续水滴分布左右')
    add(mix,.42,drop(1.1),.095,-.34,.22)
    add(mix,1.10,drop(.7),.025,.56,.15)
    event(2.62,'水洼涟漪','水面接触与三枚自然水珠')
    add(mix,2.62,splash(.65),.086,.25,.17)
    for at,p in [(2.81,-.12),(3.02,.52),(3.11,-.64)]:
        add(mix,at,drop(RNG.uniform(.8,1.3)),.016,p,.17)
    event(4.81,'草鞋入水','脚步低频触地，水面溅起随后落回')
    add(mix,4.81,footstep(),.155,-.08,.13)
    add(mix,4.845,splash(.8),.067,.08,.15)
    event(8.11,'枝叶掠过','柔和竹叶与衣料擦动，题名有极轻木响')
    add(mix,8.11,cloth(1.3),.026,-.45,.16)
    add(mix,10.32,cane(),.043,.2,.18)
    event(18.01,'第一记竹杖','音乐推进时稳定落杖')
    add(mix,18.01,cane(),.155,-.22,.19)
    event(24.05,'徐行两步','低位跟拍的两次草鞋落地与衣角')
    add(mix,24.05,footstep(),.10,-.2,.15)
    add(mix,26.80,footstep(),.086,.2,.15)
    add(mix,27.01,cloth(.82),.022,.34,.12)
    event(33.39,'竹节与芒鞋','短竹节接触，随后草编擦地')
    add(mix,33.39,cane(),.103,-.35,.14)
    add(mix,36.14,footstep(wet=False),.09,.22,.16)
    event(42.18,'谁怕','一次克制低频脉冲，风抬起衣角')
    add(mix,42.18,low_pulse(),.108,0,.0)
    add(mix,42.20,cloth(1.5),.056,-.15,.24)
    event(44.38,'迈过浅水','短促浅水接触与水滴')
    add(mix,44.38,footstep(),.11,-.17,.15)
    add(mix,44.41,splash(.74),.073,.13,.16)
    event(53.17,'蓑衣雨点','贴近蓑衣的细密雨点和草编纹理')
    add(mix,53.17,cloth(1.45),.041,.08,.12)
    for offset in [.04,.19,.39,.58,.91,1.16]:
        add(mix,53.17+offset,drop(.55,dry=True),.018,RNG.uniform(-.55,.55),.08)
    event(60.86,'微冷','近处一阵春风，随后拢衣摩擦')
    add(mix,60.86,gust(4.5),.085,-.08,.20)
    add(mix,62.41,cloth(1.5),.066,.12,.1)
    event(70.26,'斜照','低音量、宽声场的短暖光泛音')
    light=light_harmonics()
    add(mix,70.26,light,.031,-.32,.35)
    add(mix,70.30,light,.023,.63,.30)
    event(80.15,'阴晴间行路','逐渐远离的两次脚步')
    add(mix,80.15,footstep(wet=False),.065,-.15,.23)
    add(mix,82.90,footstep(wet=False),.053,.08,.25)
    event(89.49,'回望留白','远处一滴水，声场明显收敛')
    add(mix,89.49,drop(1.1),.014,-.54,.48)
    event(95.54,'来路余雨','极轻远水滴，音乐成为主体')
    add(mix,95.54,drop(.88),.009,.43,.44)
    event(98.70,'归去','两次微小脚步走入远处')
    add(mix,98.70,footstep(wet=False),.036,-.12,.31)
    add(mix,101.45,footstep(wet=False),.027,.12,.36)
    event(105.88,'空间打开','柔和空气推开与低频呼吸，在106秒后扩散')
    expansion=gust(3.8)
    add(mix,105.88,expansion,.048,-.48,.36)
    add(mix,106.04,expansion,.041,.60,.36)
    add(mix,106.08,low_pulse(),.063,0,0)
    event(118.60,'共同收束','音乐与所有环境音采用1.4秒平滑淡出，无新增敲击')
    return mix


def fade_array() -> np.ndarray:
    envelope=np.ones(N,np.float32)
    length=round(1.4*SR)
    envelope[-length:]=np.cos(np.linspace(0,np.pi/2,length)).astype(np.float32)**2
    # Just 8ms protects the first encoded sample without changing the entrance.
    envelope[:384]*=np.linspace(0,1,384,dtype=np.float32)
    return envelope


def loudness(path: Path) -> dict:
    proc=run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af',
        'loudnorm=I=-15:TP=-1.3:LRA=11:print_format=json','-f','null','-'])
    match=re.search(r'\{\s*"input_i".*?\}',proc.stderr.decode(),re.S)
    if not match:
        raise RuntimeError('No loudnorm measurements found')
    return json.loads(match.group())


def write_pcm24(x:np.ndarray,path:Path,temp:Path) -> None:
    wavfile.write(str(temp),SR,x.astype(np.float32))
    run(['ffmpeg','-v','error','-y','-i',str(temp),'-c:a','pcm_s24le','-ar',str(SR),str(path)])


def main() -> None:
    parser=argparse.ArgumentParser()
    parser.add_argument('--bgm',type=Path,default=OUT/'bgm-original.mp3')
    args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    source=args.bgm.resolve()
    if not source.is_file():
        raise FileNotFoundError(f'Missing original BGM: {source}')
    if source != (OUT/'bgm-original.mp3').resolve():
        shutil.copyfile(source,OUT/'bgm-original.mp3')
    decoded=run(['ffmpeg','-v','error','-t','120','-i',str(source),'-ar',str(SR),
        '-ac','2','-f','f32le','pipe:1']).stdout
    music=np.frombuffer(decoded,dtype=np.float32).reshape(-1,2).copy()
    if len(music)<N:
        raise RuntimeError('BGM is shorter than 120 seconds')
    music=music[:N]
    # A single final Foley trim keeps detailed contacts audible under a full mix.
    sfx=make_sfx()*1.8
    fade=fade_array()
    sfx*=fade[:,None]
    music*=.76
    # At the first big tactile moments, at most 0.6dB brief music accommodation.
    at=np.arange(N,dtype=np.float32)/SR
    duck=np.ones(N,np.float32)
    for when in [4.81,18.01,42.18,60.86]:
        duck-=.064*np.exp(-((at-when)/.19)**2).astype(np.float32)
    music*=duck[:,None]*fade[:,None]
    raw=music+sfx
    with tempfile.TemporaryDirectory(prefix='dingfengbo-audio-') as tmp:
        tmp=Path(tmp)
        write_pcm24(sfx,OUT/'sfx.wav',tmp/'sfx-float.wav')
        wavfile.write(str(tmp/'premix.wav'),SR,raw)
        first=loudness(tmp/'premix.wav')
        params=(f"loudnorm=I=-15:TP=-1.3:LRA=11:measured_I={first['input_i']}:"
            f"measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:"
            f"measured_thresh={first['input_thresh']}:offset={first['target_offset']}:"
            'linear=true:print_format=json,aresample=48000,atrim=end_sample=5760000')
        final=run(['ffmpeg','-v','info','-y','-i',str(tmp/'premix.wav'),'-af',params,
            '-c:a','pcm_s24le','-ar',str(SR),'-ac','2',str(OUT/'soundtrack.wav')])
        second_match=re.search(r'\{\s*"input_i".*?\}',final.stderr.decode(),re.S)
        norm=json.loads(second_match.group()) if second_match else {}
    measured=loudness(OUT/'soundtrack.wav')
    sfx_measured=loudness(OUT/'sfx.wav')
    sample_rate, audio=wavfile.read(OUT/'soundtrack.wav')
    normalized=audio.astype(np.float64)/2**31
    mono=np.mean(normalized,axis=1)
    correlation=float(np.corrcoef(normalized.T)[0,1])
    report={
        'sample_rate':sample_rate,'channels':audio.shape[1],'samples':len(audio),
        'duration_seconds':len(audio)/sample_rate,'integrated_lufs':float(measured['input_i']),
        'true_peak_dbtp':float(measured['input_tp']),'loudness_range_lu':float(measured['input_lra']),
        'sample_peak_dbfs':float(20*np.log10(max(1e-12,np.max(np.abs(normalized))))),
        'clipped_samples':int(np.count_nonzero(np.abs(normalized)>=1)),
        'stereo_correlation':correlation,'mono_rms_dbfs':float(20*np.log10(np.sqrt(np.mean(mono*mono)))),
        'last_sample_absolute':float(np.max(np.abs(normalized[-1]))),
        'sfx_integrated_lufs':float(sfx_measured['input_i']),
        'sfx_true_peak_dbtp':float(sfx_measured['input_tp']),
        'normalization':norm,
        'bgm_sha256':hashlib.sha256((OUT/'bgm-original.mp3').read_bytes()).hexdigest(),
        'soundtrack_sha256':hashlib.sha256((OUT/'soundtrack.wav').read_bytes()).hexdigest(),
        'sound_effects_source':'Original deterministic synthesis; seed 10820307',
        'music_change':'First 120s at original speed/pitch; gain automation and 118.6–120s fade only',
        'events':EVENTS,
    }
    assert len(audio)==N and sample_rate==SR and audio.shape[1]==2
    assert -15.5 <= report['integrated_lufs'] <= -14.5, report
    assert report['true_peak_dbtp'] <= -1.0, report
    assert report['clipped_samples']==0, report
    (OUT/'audio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ('events','normalization')},
                     ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
