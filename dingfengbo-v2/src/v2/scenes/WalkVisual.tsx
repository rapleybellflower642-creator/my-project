import React from 'react';
import {Hero3D} from '../Hero3D';
import {SVG, Defs, gold, ivory, jade, smooth, Ripples, Splash, VisualProps, Label} from './early-helpers';

export const WalkVisual: React.FC<VisualProps> = ({frame}) => {
  const staffReveal = smooth((frame - 7) / 27);
  const staffFall = smooth((frame - 48) / 18);
  const shoesFall = smooth((frame - 117) / 15);
  const firstStep = smooth((frame - 66) / 31), secondStep = smooth((frame - 132) / 35), thirdStep = smooth((frame - 198) / 43);
  return <>
    <SVG>
      <Defs id="walk"/>
      <ellipse cx="960" cy="659" rx="650" ry="155" fill="url(#walk-light)"/>
      <path d="M240 663 H1680" stroke={gold} strokeWidth="1" fill="none" opacity=".13"/>
      <ellipse cx="655" cy="650" rx={53 - staffFall * 17} ry="10" fill="#000" opacity={staffFall * .6}/>
      <ellipse cx="1155" cy="658" rx="155" ry="20" fill="#000" opacity={shoesFall * .55}/>
      <path d="M275 650 H655" stroke={jade} strokeWidth="2.5" opacity={staffReveal * .4} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - staffReveal}/>
      <path d="M655 650 C850 650 964 658 1155 658" stroke={gold} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - firstStep}/>
      <path d="M1155 658 C1260 658 1360 663 1450 663" stroke={jade} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - secondStep}/>
      <path d="M1450 663 H1660" stroke={gold} strokeWidth="2.3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - thirdStep}/>
      <Ripples frame={frame} at={66} x={655} y={650} id="staff" color={gold}/>
      <Ripples frame={frame} at={132} x={1155} y={658} id="shoe" color={jade}/>
      <g opacity={firstStep}><circle cx="655" cy="650" r="7" fill={ivory}/><circle cx="655" cy="650" r="20" stroke={gold} fill="none" opacity=".5"/></g>
      <g opacity={secondStep}><circle cx="1155" cy="658" r="7" fill={ivory}/><circle cx="1155" cy="658" r="20" stroke={jade} fill="none" opacity=".5"/></g>
      <g opacity={thirdStep}><circle cx="1450" cy="663" r="5" fill={jade}/><circle cx={1450 + thirdStep * 210} cy="663" r="4" fill={ivory}/></g>
    </SVG>
    <div style={{position: 'absolute', left: 380, top: 150, opacity: staffReveal, width: 1100, height: 580}}><Hero3D kind="gear" action="walk" frame={frame} width={1100} height={580} reveal={1} energy={.1} rotation={0}/></div>
    <SVG>
      <Splash frame={frame} at={66} x={655} y={650} power={.6} seed={80}/>
      <Splash frame={frame} at={132} x={1155} y={658} power={.7} seed={130}/>
      <g opacity={smooth((frame - 80) / 18)}><path d="M670 430 H366 V380" stroke={gold} strokeWidth="1" opacity=".5" fill="none"/><Label x={366} y={352} text="竹杖" color={gold}/></g>
      <g opacity={smooth((frame - 149) / 24)}><path d="M1305 584 H1580 V499" stroke={gold} strokeWidth="1" opacity=".5" fill="none"/><Label x={1580} y={471} text="芒鞋" color={gold}/></g>
      <g opacity={smooth((frame - 181) / 24)}><Label x={954} y={766} text="落下一步，展开一步" color={ivory} opacity={.83}/></g>
    </SVG>
  </>;
};
