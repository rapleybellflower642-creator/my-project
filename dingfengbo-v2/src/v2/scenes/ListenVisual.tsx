import React from 'react';
import {SVG, Defs, gold, ivory, jade, red, smooth, clamp, VisualProps, Label} from './early-helpers';

export const ListenVisual: React.FC<VisualProps> = ({frame}) => {
  const arrive = smooth(frame / 33);
  const chosen = smooth((frame - 132) / 32);
  const shake = (1 - chosen) * Math.sin(frame * .9) * 3.5;
  const selectedPath = smooth((frame - 132) / 64);
  const coreX = 960 + shake;
  const wavePath = (line: number) => Array.from({length: 141}, (_, i) => {
    const x = 225 + i * 10.5;
    const envelope = Math.sin(i / 140 * Math.PI) ** .7;
    const exclusion = 1 - chosen * Math.exp(-(((x - 960) / 240) ** 2));
    const y = 485 + line * 16 + Math.sin(i * .108 - frame * .054 + line * .35) * (31 + Math.sin(i * .054 + frame * .017) * 27) * envelope * exclusion;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return <SVG>
    <Defs id="listen"/>
    <ellipse cx="960" cy="520" rx="610" ry="280" fill="url(#listen-light)"/>
    <g opacity={arrive}>
      {Array.from({length: 13}, (_, i) => <path key={i} d={wavePath(i - 6)} stroke={i % 4 === 0 ? gold : '#86978B'} strokeWidth={i % 4 === 0 ? 1.5 : .7} fill="none" opacity={(i % 4 === 0 ? .52 : .25) * (1 - chosen * .12)}/>)}
      <g transform={`translate(${coreX} 493)`}>
        <circle r="189" stroke={gold} fill="#0C1012" strokeWidth="1" strokeOpacity=".56"/>
        <circle r="181" stroke="url(#listen-gold)" fill="none" strokeWidth="3" opacity=".82"/>
        <circle r="161" stroke={gold} fill="none" strokeWidth="1" opacity=".22"/>
        {Array.from({length: 44}, (_, i) => <line key={i} x1="0" y1="-173" x2="0" y2={i % 4 ? -169 : -163} stroke={gold} opacity=".34" transform={`rotate(${i / 44 * 360})`}/>)}
        <g opacity={1 - chosen}>{Array.from({length: 7}, (_, i) => {
          const y = (i - 3) * 25;
          const d = Array.from({length: 51}, (_, j) => `${j ? 'L' : 'M'}${-133 + j * 5.3} ${y + Math.sin(j * .32 - frame * .13 + i * .8) * 20 * Math.sin(j / 50 * Math.PI)}`).join(' ');
          return <path key={i} d={d} fill="none" stroke={i % 2 ? gold : ivory} strokeWidth="1.7" opacity=".65"/>;
        })}</g>
        <circle r={35 + 35 * chosen} fill="url(#listen-jade)" opacity={chosen}/>
        <circle r={6 + chosen * 3} fill={chosen > .5 ? jade : ivory}/>
        <circle r="22" stroke={jade} fill="none" opacity={chosen * .6}/>
        <path d="M-147 0 H147" stroke={jade} strokeWidth="2.6" opacity={chosen}/>
      </g>
      <g opacity={smooth((frame - 38) / 24)}>
        <Label x={330} y={311} text="评价" color={gold} opacity={.66}/>
        <path d="M355 333 L436 389" stroke={gold} strokeWidth="1" opacity=".35"/>
        <Label x={1550} y={676} text="变故" color={red} opacity={.82}/>
        <path d="M1512 637 L1434 584" stroke={red} strokeWidth="1" opacity=".55"/>
      </g>
      <path d="M290 493 H1660" pathLength="1" fill="none" stroke={jade} strokeWidth="3.1" strokeDasharray="1" strokeDashoffset={1 - selectedPath} opacity={chosen} filter="url(#listen-glow)"/>
      <g opacity={chosen}>
        <circle cx={290 + selectedPath * 1370} cy="493" r="6" fill={ivory}/>
        <path d="M1178 492 L1260 386 H1390" pathLength="1" stroke={jade} fill="none" strokeDasharray="1" strokeDashoffset={1 - smooth((frame - 173) / 45)} opacity=".75"/>
        <Label x={1400} y={372} text="值得回应" anchor="end" color={jade} opacity={smooth((frame - 187) / 25)}/>
        <Label x={960} y={760} text="先听见，再选择" color={ivory} opacity={smooth((frame - 172) / 22) * .8}/>
      </g>
      {Array.from({length: 8}, (_, i) => {
        const phase = ((frame + i * 19) % 146) / 146;
        const x = 235 + phase * 1435;
        const y = 493 + Math.sin(phase * Math.PI * 4 + i) * 97;
        const opacity = Math.sin(phase * Math.PI) * .6 * (1 - chosen * Math.exp(-(((x - 960) / 240) ** 2)));
        return <circle key={i} cx={x} cy={y} r={i % 3 ? 2 : 3.5} fill={i % 3 ? gold : red} opacity={clamp(opacity)}/>;
      })}
    </g>
  </SVG>;
};
