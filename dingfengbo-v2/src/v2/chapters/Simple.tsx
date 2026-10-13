import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {SimpleVisual} from '../scenes/SimpleVisual';
export const Simple=()=>{const frame=useCurrentFrame();return <SceneShell index={4} start={936} duration={264} chapter="自己的步调" poem="竹杖芒鞋轻胜马。" warm={0.1} cards={[{"from": 58, "to": 258, "lines": ["少一点比较，多一点自己的步调。"]}]}>
 <SimpleVisual frame={frame} duration={264}/>
</SceneShell>;};
