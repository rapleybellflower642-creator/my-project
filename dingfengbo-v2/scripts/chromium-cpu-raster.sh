#!/bin/bash
# Keep ANGLE / SwiftShader available for Three.js. Use CPU Skia for 2D raster,
# avoiding costly software-GPU shading of full-screen gradients and grain.
exec "${REMOTION_BROWSER_EXECUTABLE:-/usr/bin/chromium}" "$@" --disable-gpu-rasterization
