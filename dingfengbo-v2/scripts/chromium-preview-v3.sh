#!/bin/bash
# Composite the SVG illustration layers on CPU; keep SwiftShader for the two 3D inserts.
exec "${REMOTION_BROWSER_EXECUTABLE:-/usr/bin/chromium}" "$@" --disable-gpu-rasterization --disable-gpu-compositing
