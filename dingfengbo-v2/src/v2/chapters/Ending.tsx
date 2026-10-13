import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {EndingVisual} from '../scenes/EndingVisual';
import {ClosingTitle} from '../ClosingTitle';
export const Ending=()=>{const frame=useCurrentFrame();return <SceneShell index={13} start={3442} duration={158} chapter="定风波" poem="定风波" warm={0.35} cards={[]} ending>
 <EndingVisual frame={frame} duration={158}/>
 <ClosingTitle frame={frame}/>
</SceneShell>;};
