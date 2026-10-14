import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Shot} from './Shot';
import {timeline} from './timeline';

export const Chapter1=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="001 rain-leaves" durationInFrames={198} premountFor={fps}><Shot shot={timeline.shots[0]}/></Series.Sequence>
  <Series.Sequence name="002 portrait" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[1]}/></Series.Sequence>
  <Series.Sequence name="003 exam" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[2]}/></Series.Sequence>
  <Series.Sequence name="004 jobloss" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[3]}/></Series.Sequence>
  <Series.Sequence name="005 commute" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[4]}/></Series.Sequence>
  <Series.Sequence name="006 path" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[5]}/></Series.Sequence>
  <Series.Sequence name="007 manuscript" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[6]}/></Series.Sequence>
  <Series.Sequence name="008 portrait" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[7]}/></Series.Sequence>
</Series>;};

export const Chapter2=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="009 exile" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[8]}/></Series.Sequence>
  <Series.Sequence name="010 portrait" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[9]}/></Series.Sequence>
  <Series.Sequence name="011 prison" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[10]}/></Series.Sequence>
  <Series.Sequence name="012 river" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[11]}/></Series.Sequence>
  <Series.Sequence name="013 official" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[12]}/></Series.Sequence>
  <Series.Sequence name="014 farm" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[13]}/></Series.Sequence>
  <Series.Sequence name="015 farm" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[14]}/></Series.Sequence>
  <Series.Sequence name="016 cottage" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[15]}/></Series.Sequence>
</Series>;};

export const Chapter3=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="017 manuscript" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[16]}/></Series.Sequence>
  <Series.Sequence name="018 companions" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[17]}/></Series.Sequence>
  <Series.Sequence name="019 path" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[18]}/></Series.Sequence>
  <Series.Sequence name="020 manuscript" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[19]}/></Series.Sequence>
  <Series.Sequence name="021 walk" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[20]}/></Series.Sequence>
  <Series.Sequence name="022 river" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[21]}/></Series.Sequence>
  <Series.Sequence name="023 portrait" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[22]}/></Series.Sequence>
  <Series.Sequence name="024 forest" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[23]}/></Series.Sequence>
</Series>;};

export const Chapter4=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="025 rain-leaves" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[24]}/></Series.Sequence>
  <Series.Sequence name="026 forest" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[25]}/></Series.Sequence>
  <Series.Sequence name="027 companions" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[26]}/></Series.Sequence>
  <Series.Sequence name="028 commute" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[27]}/></Series.Sequence>
  <Series.Sequence name="029 office" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[28]}/></Series.Sequence>
  <Series.Sequence name="030 case" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[29]}/></Series.Sequence>
  <Series.Sequence name="031 rain-leaves" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[30]}/></Series.Sequence>
  <Series.Sequence name="032 portrait" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[31]}/></Series.Sequence>
  <Series.Sequence name="033 comments" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[32]}/></Series.Sequence>
  <Series.Sequence name="034 close-phone" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[33]}/></Series.Sequence>
</Series>;};

export const Chapter5=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="035 chant" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[34]}/></Series.Sequence>
  <Series.Sequence name="036 portrait" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[35]}/></Series.Sequence>
  <Series.Sequence name="037 chant" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[36]}/></Series.Sequence>
  <Series.Sequence name="038 walk" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[37]}/></Series.Sequence>
  <Series.Sequence name="039 path" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[38]}/></Series.Sequence>
  <Series.Sequence name="040 portrait" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[39]}/></Series.Sequence>
  <Series.Sequence name="041 steps" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[40]}/></Series.Sequence>
  <Series.Sequence name="042 office" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[41]}/></Series.Sequence>
  <Series.Sequence name="043 window" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[42]}/></Series.Sequence>
  <Series.Sequence name="044 walk" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[43]}/></Series.Sequence>
</Series>;};

export const Chapter6=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="045 staff" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[44]}/></Series.Sequence>
  <Series.Sequence name="046 walk" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[45]}/></Series.Sequence>
  <Series.Sequence name="047 portrait" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[46]}/></Series.Sequence>
  <Series.Sequence name="048 horse" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[47]}/></Series.Sequence>
  <Series.Sequence name="049 burden" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[48]}/></Series.Sequence>
  <Series.Sequence name="050 luxury" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[49]}/></Series.Sequence>
  <Series.Sequence name="051 luxury" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[50]}/></Series.Sequence>
  <Series.Sequence name="052 debt" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[51]}/></Series.Sequence>
  <Series.Sequence name="053 burden" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[52]}/></Series.Sequence>
  <Series.Sequence name="054 relief" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[53]}/></Series.Sequence>
</Series>;};

export const Chapter7=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="055 resolve" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[54]}/></Series.Sequence>
  <Series.Sequence name="056 portrait" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[55]}/></Series.Sequence>
  <Series.Sequence name="057 resolve" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[56]}/></Series.Sequence>
  <Series.Sequence name="058 path" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[57]}/></Series.Sequence>
  <Series.Sequence name="059 walk" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[58]}/></Series.Sequence>
  <Series.Sequence name="060 horizon" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[59]}/></Series.Sequence>
</Series>;};

export const Chapter8=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="061 raincoat" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[60]}/></Series.Sequence>
  <Series.Sequence name="062 rain-leaves" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[61]}/></Series.Sequence>
  <Series.Sequence name="063 exile" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[62]}/></Series.Sequence>
  <Series.Sequence name="064 resolve" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[63]}/></Series.Sequence>
  <Series.Sequence name="065 portrait" durationInFrames={198} premountFor={fps}><Shot shot={timeline.shots[64]}/></Series.Sequence>
  <Series.Sequence name="066 window" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[65]}/></Series.Sequence>
  <Series.Sequence name="067 market" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[66]}/></Series.Sequence>
  <Series.Sequence name="068 jobloss" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[67]}/></Series.Sequence>
  <Series.Sequence name="069 steps" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[68]}/></Series.Sequence>
  <Series.Sequence name="070 relief" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[69]}/></Series.Sequence>
</Series>;};

export const Chapter9=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="071 cold" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[70]}/></Series.Sequence>
  <Series.Sequence name="072 river" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[71]}/></Series.Sequence>
  <Series.Sequence name="073 portrait" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[72]}/></Series.Sequence>
  <Series.Sequence name="074 cold" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[73]}/></Series.Sequence>
  <Series.Sequence name="075 portrait" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[74]}/></Series.Sequence>
  <Series.Sequence name="076 window" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[75]}/></Series.Sequence>
  <Series.Sequence name="077 office" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[76]}/></Series.Sequence>
</Series>;};

export const Chapter10=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="078 sunset" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[77]}/></Series.Sequence>
  <Series.Sequence name="079 cold" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[78]}/></Series.Sequence>
  <Series.Sequence name="080 horizon" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[79]}/></Series.Sequence>
  <Series.Sequence name="081 sunset" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[80]}/></Series.Sequence>
  <Series.Sequence name="082 window" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[81]}/></Series.Sequence>
  <Series.Sequence name="083 city-dawn" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[82]}/></Series.Sequence>
  <Series.Sequence name="084 coffee" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[83]}/></Series.Sequence>
  <Series.Sequence name="085 debt" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[84]}/></Series.Sequence>
  <Series.Sequence name="086 relief" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[85]}/></Series.Sequence>
  <Series.Sequence name="087 sunset" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[86]}/></Series.Sequence>
</Series>;};

export const Chapter11=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="088 lookback" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[87]}/></Series.Sequence>
  <Series.Sequence name="089 path" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[88]}/></Series.Sequence>
  <Series.Sequence name="090 lookback" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[89]}/></Series.Sequence>
  <Series.Sequence name="091 lookback" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[90]}/></Series.Sequence>
  <Series.Sequence name="092 prison" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[91]}/></Series.Sequence>
  <Series.Sequence name="093 path" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[92]}/></Series.Sequence>
  <Series.Sequence name="094 lookback" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[93]}/></Series.Sequence>
  <Series.Sequence name="095 return" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[94]}/></Series.Sequence>
</Series>;};

export const Chapter12=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="096 return" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[95]}/></Series.Sequence>
  <Series.Sequence name="097 cottage" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[96]}/></Series.Sequence>
  <Series.Sequence name="098 river" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[97]}/></Series.Sequence>
  <Series.Sequence name="099 old-photo" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[98]}/></Series.Sequence>
  <Series.Sequence name="100 relief" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[99]}/></Series.Sequence>
  <Series.Sequence name="101 horizon" durationInFrames={116} premountFor={fps}><Shot shot={timeline.shots[100]}/></Series.Sequence>
</Series>;};

export const Chapter13=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="102 horizon" durationInFrames={99} premountFor={fps}><Shot shot={timeline.shots[101]}/></Series.Sequence>
  <Series.Sequence name="103 forest" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[102]}/></Series.Sequence>
  <Series.Sequence name="104 portrait" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[103]}/></Series.Sequence>
  <Series.Sequence name="105 lookback" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[104]}/></Series.Sequence>
  <Series.Sequence name="106 window" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[105]}/></Series.Sequence>
  <Series.Sequence name="107 exam" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[106]}/></Series.Sequence>
  <Series.Sequence name="108 office" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[107]}/></Series.Sequence>
  <Series.Sequence name="109 old-photo" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[108]}/></Series.Sequence>
  <Series.Sequence name="110 relief" durationInFrames={132} premountFor={fps}><Shot shot={timeline.shots[109]}/></Series.Sequence>
  <Series.Sequence name="111 portrait" durationInFrames={198} premountFor={fps}><Shot shot={timeline.shots[110]}/></Series.Sequence>
</Series>;};

export const Chapter14=()=>{const {fps}=useVideoConfig();return <Series>
  <Series.Sequence name="112 writing" durationInFrames={198} premountFor={fps}><Shot shot={timeline.shots[111]}/></Series.Sequence>
  <Series.Sequence name="113 path" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[112]}/></Series.Sequence>
  <Series.Sequence name="114 steps" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[113]}/></Series.Sequence>
  <Series.Sequence name="115 manuscript" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[114]}/></Series.Sequence>
  <Series.Sequence name="116 river" durationInFrames={198} premountFor={fps}><Shot shot={timeline.shots[115]}/></Series.Sequence>
  <Series.Sequence name="117 portrait" durationInFrames={182} premountFor={fps}><Shot shot={timeline.shots[116]}/></Series.Sequence>
  <Series.Sequence name="118 steps" durationInFrames={149} premountFor={fps}><Shot shot={timeline.shots[117]}/></Series.Sequence>
  <Series.Sequence name="119 return" durationInFrames={165} premountFor={fps}><Shot shot={timeline.shots[118]}/></Series.Sequence>
</Series>;};
