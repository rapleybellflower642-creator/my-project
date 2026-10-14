import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETTE, SERIF, SANS, smooth} from '../v2/SceneShell';
import {Hero3D} from '../v2/Hero3D';
import {HistoryArt} from './HistoryArt';
import {JourneyArt} from './JourneyArt';
import {Frame} from './Frame';

const useSeconds=()=>{const f=useCurrentFrame();const {fps}=useVideoConfig();return f/fps;};

export const Hook=()=>{
  const t=useSeconds();
  const shot=t<79/30?0:t<145/30?1:2;
  return <Frame duration={7} unshaded>
    {shot===0?<HistoryArt mode="case" t={t}/>:shot===1?<JourneyArt mode="storm" t={t-79/30}/>:<HistoryArt mode="portrait" t={t-145/30}/>}
    <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(5,10,12,.88),rgba(5,10,12,.45) 45%,transparent 75%)'}}/>
    <div style={{position:'absolute',left:114,top:214,color:PALETTE.jade,fontFamily:SANS,fontSize:26,letterSpacing:7}}>{shot<2?'苏轼的人生，先有风雨':'苏轼 · 定风波'}</div>
    <div style={{position:'absolute',left:108,top:292,color:PALETTE.gold,fontFamily:SERIF,fontSize:shot===2?100:120,lineHeight:1.4,letterSpacing:6,whiteSpace:'pre-line'}}>{shot===0?'因诗入狱':shot===1?'被贬黄州':'他凭什么\n说「谁怕」？'}</div>
    <div style={{position:'absolute',left:118,bottom:129,fontSize:38,color:PALETTE.ivory,letterSpacing:3}}>{shot===0?'写下这首词以前，他失去过什么？':shot===1?'人生跌落之后，他怎样继续？':'答案，藏在一场雨里。'}</div>
  </Frame>;
};

export const Case=()=>{const t=useSeconds();return <Frame split title={'因诗获罪，\n一度身陷囹圄。'} eyebrow="1079 · 乌台诗案" duration={198/30} copies={[{from:.3,to:6.55,text:'诗文成为罪证。出狱之后，苏轼被贬黄州。'}]}><HistoryArt mode="case" t={t}/></Frame>;};
export const Exile=()=>{const t=useSeconds();return <Frame split title={'有官衔，\n却无从施展。'} eyebrow="1080 · 贬居黄州" duration={8.8} copies={[{from:.3,to:4.4,text:'名为团练副使，却不得签署公事。'},{from:4.4,to:8.75,text:'远离朝堂，他要重新安顿自己的生活。'}]}><HistoryArt mode="exile" t={t}/></Frame>;};
export const Cultivate=()=>{const t=useSeconds();return <Frame split title={'把日子，\n一寸寸种回来。'} eyebrow="黄州 · 躬耕东坡" duration={8.8} copies={[{from:.3,to:4.4,text:'生活困顿，他躬耕东坡，也继续写作。'},{from:4.4,to:8.75,text:'那个失意的苏轼，渐渐活成了「东坡居士」。'}]}><HistoryArt mode="farm" t={t}/></Frame>;};
export const RainRecord=()=>{const t=useSeconds();return <Frame split title={'1082\n沙湖道中'} eyebrow="元丰五年 · 三月七日" duration={8.8} copies={[{from:.3,to:4.4,text:'雨具先去，同行皆狼狈。'},{from:4.4,to:8.75,text:'余独不觉。已而遂晴，故作此。'}]}><HistoryArt mode="manuscript" t={t}/></Frame>;};

export const Companions=()=>{const t=useSeconds();return <Frame title="莫听穿林打叶声。" eyebrow="一场雨 · 两种步调" duration={8.8} copies={[{from:.3,to:4.4,text:'雨点敲打树叶，同行人忙着避雨。'},{from:4.4,to:8.75,text:'苏轼却在喧响里，留下自己的节奏。'}]}><JourneyArt mode="companions" t={t}/></Frame>;};
export const Walk=()=>{const t=useSeconds();return <Frame title="何妨吟啸且徐行。" eyebrow="雨没有停 · 人可以从容" duration={263/30} copies={[{from:.3,to:4.4,text:'一边吟咏，一边慢慢走。'},{from:4.4,to:8.71,text:'他经历过更大的风雨，仍能选择怎样回应。'}]}><JourneyArt mode="walk" t={t}/></Frame>;};

export const LightStep=()=>{
  const t=useSeconds(); const frame=useCurrentFrame();
  return <Frame title="竹杖芒鞋轻胜马。" eyebrow="轻 · 是此刻的心境" duration={8.8} copies={[{from:.15,to:2.2,text:'一根竹杖，一双草鞋。'},{from:2.2,to:5.5,text:'行装简朴，脚步却可以轻快。'},{from:5.5,to:8.75,text:'仕途的得失，不必决定此刻的心。'}]}>
    {t<2.2?<div style={{position:'absolute',left:420,top:203}}><Hero3D kind={t<1.1?'staff':'shoes'} width={1100} height={650} frame={frame} reveal={1} rotation={-.28+t*.23} warm={.5}/></div>:t<5.5?<HistoryArt mode="portrait" t={t-2.2}/>:<JourneyArt mode="walk" t={t-5.5}/>}
    {t>=2.2&&t<5.5&&<div style={{position:'absolute',left:164,top:372,fontSize:116,fontFamily:SERIF,letterSpacing:12,color:PALETTE.gold,opacity:smooth((t-2.2)/.35)}}>身轻<br/><span style={{fontSize:66,color:PALETTE.jade}}>心亦轻</span></div>}
  </Frame>;
};

export const Who=()=>{const t=useSeconds();return <Frame title={t<2.2?undefined:'一蓑烟雨任平生。'} eyebrow="从眼前风雨 · 写到人生风雨" duration={8.8} copies={[{from:2.2,to:5.5,text:'「一蓑烟雨」，把一场雨写成了一生。'},{from:5.5,to:8.75,text:'这份旷达，是经历风雨后仍愿前行。'}]}><JourneyArt mode="storm" t={t}/>{t<2.2&&<div style={{position:'absolute',left:0,right:0,top:340,textAlign:'center',fontSize:188,color:PALETTE.gold,letterSpacing:24,opacity:smooth((t+.08)/.22),textShadow:'0 5px 30px #050c0d'}}>谁怕</div>}</Frame>;};

export const Cold=()=>{const t=useSeconds();return <Frame title="料峭春风吹酒醒，微冷。" eyebrow="真实的冷 · 也在词里" duration={6.6} copies={[{from:.3,to:3.3,text:'春风吹醒酒意，身上仍有几分凉。'},{from:3.3,to:6.55,text:'他的从容，也容得下这一刻的冷。'}]}><JourneyArt mode="cold" t={t}/></Frame>;};
export const Sun=()=>{const t=useSeconds();return <Frame title="山头斜照却相迎。" eyebrow="转晴 · 光照进来" warm={.9} duration={6.6} copies={[{from:.3,to:3.3,text:'山头的斜阳，迎面照来。'},{from:3.3,to:6.55,text:'冷暖都真实，眼前仍有值得感受的光。'}]}><JourneyArt mode="sun" t={t}/></Frame>;};
export const LookBack=()=>{const t=useSeconds();return <Frame title="回首向来萧瑟处。" eyebrow="回望 · 那段路已经走过" warm={.5} duration={8.8} copies={[{from:.3,to:4.4,text:'他回头望向刚才风雨交加的地方。'},{from:4.4,to:8.75,text:'经历过的困顿，也可以成为身后的来路。'}]}><JourneyArt mode="lookback" t={t}/></Frame>;};
export const Freedom=()=>{const t=useSeconds();return <Frame title={t<2.2?'归去。':'也无风雨也无晴。'} eyebrow="把阴晴 · 一同放下" warm={.6} duration={263/30} copies={[{from:.3,to:4.4,text:'风雨过去了，心也不再追着阴晴起落。'},{from:4.4,to:8.71,text:'可以这样读：逆境里不失自己，顺境里也不执着。'}]}><JourneyArt mode="freedom" t={t}/></Frame>;};
export const Meaning=()=>{const t=useSeconds();return <Frame split title={'境遇会变，\n人仍可以向前。'} eyebrow="从苏轼 · 读回自己" warm={.6} duration={8.8} copies={[{from:.3,to:4.4,text:'写下「谁怕」的人，也经历过牢狱、贬谪和困顿。'},{from:4.4,to:8.75,text:'这首词留给我们的，是面对顺逆时的一份从容。'}]}>{t<4.4?<HistoryArt mode="portrait" t={t}/>:<JourneyArt mode="freedom" t={t-4.4}/>}</Frame>;};
export const Ending=()=>{const t=useSeconds();return <Frame duration={158/30} warm={.65} unshaded>
  <div style={{opacity:.48}}><JourneyArt mode="freedom" t={t+12}/></div>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 42%,rgba(8,13,14,.75),transparent 76%)'}}/>
  <div style={{position:'absolute',left:0,right:0,top:260,textAlign:'center',fontFamily:SANS,fontSize:27,letterSpacing:10,color:PALETTE.jade}}>苏轼 · 定风波</div>
  <div style={{position:'absolute',left:0,right:0,top:368,textAlign:'center',fontSize:112,letterSpacing:12,color:PALETTE.gold}}>也无风雨也无晴。</div>
  <div style={{position:'absolute',left:0,right:0,top:571,textAlign:'center',fontSize:43,letterSpacing:5,color:PALETTE.ivory}}>走过风雨，仍有自己的从容。</div>
 </Frame>;};

export const CoverV3=()=> <Frame duration={120} warm={.4} unshaded>
 <HistoryArt mode="portrait" t={3.5}/>
 <AbsoluteFill style={{background:'linear-gradient(90deg,#070d0f,rgba(7,13,15,.75) 33%,transparent 73%)'}}/>
 <div style={{position:'absolute',left:116,top:230,color:PALETTE.jade,fontSize:30,fontFamily:SANS,letterSpacing:9}}>苏轼 · 黄州 · 元丰五年</div>
 <div style={{position:'absolute',left:105,top:334,color:PALETTE.gold,fontSize:168,letterSpacing:18}}>谁怕？</div>
 <div style={{position:'absolute',left:119,top:605,color:PALETTE.ivory,fontSize:52,letterSpacing:5}}>一个失意的人，如何写出《定风波》</div>
 </Frame>;
