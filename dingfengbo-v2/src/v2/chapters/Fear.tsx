import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {FearVisual} from '../scenes/FearVisual';
export const Fear=()=>{const frame=useCurrentFrame();return <SceneShell index={5} start={1200} duration={264} chapter="允许不安" poem="谁怕？" warm={0.1} cards={[{"from": 60, "to": 146, "lines": ["允许自己不安。"]}, {"from": 146, "to": 258, "lines": ["然后，做一件此刻能做的事。"]}]}>
 <FearVisual frame={frame} duration={264}/>
</SceneShell>;};
