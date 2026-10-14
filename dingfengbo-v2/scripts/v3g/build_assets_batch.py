"""Produce all four animation strips in one Blender process (2 CPU threads).
blender -b -t 2 --python scripts/v3g/build_assets_batch.py
Each frame is a fresh path-traced view, not a warped still.
"""
import runpy,sys
from pathlib import Path
source=Path(__file__).with_name('build_assets.py')
for asset,frames in [('seal',30),('scroll',8),('cup',8),('sandals',8),('cloak',1)]:
    sys.argv=['blender','--','--asset',asset,'--frames',str(frames),'--size','720','--samples','16']
    runpy.run_path(str(source),run_name='__main__')
