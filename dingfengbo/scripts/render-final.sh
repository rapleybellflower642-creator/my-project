#!/usr/bin/env bash
set -euo pipefail
TASK_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$TASK_PROJECT_DIR"
mkdir -p out
npm run typecheck
render_args=(--concurrency=3 --crf=18 --codec=h264 --audio-bitrate=320k)
if [[ -n "${REMOTION_BROWSER_EXECUTABLE:-}" ]]; then
  render_args+=("--browser-executable=$REMOTION_BROWSER_EXECUTABLE")
elif [[ -x /usr/bin/chromium ]]; then
  render_args+=(--browser-executable=/usr/bin/chromium)
fi
npx remotion render src/index.ts DingFengBo out/render-master.mp4 "${render_args[@]}"
# Mux from the lossless final mix to keep both tracks and the container exactly 120s.
ffmpeg -v error -y -i out/render-master.mp4 -i public/audio/soundtrack.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 \
  -t 120 -movflags +faststart out/dingfengbo.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,duration,nb_frames -of json out/dingfengbo.mp4
