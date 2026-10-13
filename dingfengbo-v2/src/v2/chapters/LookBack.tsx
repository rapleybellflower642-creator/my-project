import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {LookBackVisual} from '../scenes/LookBackVisual';
export const LookBack=()=>{const frame=useCurrentFrame();return <SceneShell index={10} start={2651} duration={264} chapter="回看走过的路" poem="回首向来萧瑟处。" warm={0.35} cards={[{"from": 60, "to": 258, "lines": ["那段难走的路，已经成为走过的路。"]}]}>
 <LookBackVisual frame={frame} duration={264}/>
</SceneShell>;};
