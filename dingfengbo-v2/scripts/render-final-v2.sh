#!/usr/bin/env bash
set -euo pipefail
TASK_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$TASK_PROJECT_DIR"
mkdir -p out
npm run typecheck
TASK_BROWSER="$TASK_PROJECT_DIR/scripts/chromium-cpu-raster.sh"
node scripts/render-production-v2.cjs "$TASK_BROWSER"
ffmpeg -v error -y -i out/render-master-v2.mp4 -i public/audio/soundtrack-v2.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 \
  -t 120 -movflags +faststart out/dingfengbo-v2.mp4
python3 scripts/verify-video.py out/dingfengbo-v2.mp4 --report out/validation-v2.json
