import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {OpeningVisual} from '../scenes/OpeningVisual';
export const Opening=()=>{const frame=useCurrentFrame();return <SceneShell index={0} start={0} duration={210} chapter="风雨骤至" poem="风雨一来" warm={0.1} cards={[{"from": 32, "to": 204, "lines": ["人生，就得跟着摇晃吗？"]}]}>
 <OpeningVisual frame={frame} duration={210}/>
</SceneShell>;};
