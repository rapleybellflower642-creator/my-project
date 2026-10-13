import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {FreedomVisual} from '../scenes/FreedomVisual';
export const Freedom=()=>{const frame=useCurrentFrame();return <SceneShell index={12} start={3178} duration={264} chapter="安放阴晴" poem="也无风雨也无晴。" warm={0.35} cards={[{"from": 70, "to": 258, "lines": ["把阴晴都放进生命里，", "把脚步交还给自己。"]}]}>
 <FreedomVisual frame={frame} duration={264}/>
</SceneShell>;};
