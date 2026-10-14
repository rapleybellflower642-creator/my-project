import React from 'react';
import {PAPER_DATA_URI} from './paper-data';

export type Place = 'prison' | 'river' | 'cottage' | 'farm' | 'desk' | 'bamboo' | 'path' | 'ridge' | 'return';

type Props = {kind: Place; t: number; warm?: number; rain?: number; layer?: 'back' | 'front'};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const rand = (n: number) => {const a = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return a - Math.floor(a);};
const mod = (n: number, d: number) => ((n % d) + d) % d;
const blend = (a: string, b: string, n: number) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - n) + parseInt(b.slice(i, i + 2), 16) * n).toString(16).padStart(2, '0')).join('');

/** All motion is a function of seconds. These SVG layers also render in react-dom/server + sharp. */
function Definitions({id, warm}: {id: string; warm: number}) {
  return <defs>
    <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={blend('#607c75', '#818a70', warm)}/><stop offset=".64" stopColor="#a1b3a2"/><stop offset="1" stopColor="#789786"/></linearGradient>
    <linearGradient id={`${id}-inkmist`} x1="0" y1="0" x2="1" y2=".12"><stop stopColor="#102e2b" stopOpacity=".76"/><stop offset=".44" stopColor="#173a33" stopOpacity=".47"/><stop offset=".77" stopColor="#315448" stopOpacity="0"/></linearGradient>
    <linearGradient id={`${id}-floor`} x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#8c9981"/><stop offset="1" stopColor="#334e43"/></linearGradient>
    <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#aabeb0"/><stop offset=".55" stopColor="#668d80"/><stop offset="1" stopColor="#315a53"/></linearGradient>
    <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#718476"/><stop offset=".6" stopColor="#4c6457"/><stop offset="1" stopColor="#9aa18b"/></linearGradient>
    <linearGradient id={`${id}-light`} x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#eed8a0" stopOpacity=".7"/><stop offset="1" stopColor="#e8d5a7" stopOpacity="0"/></linearGradient>
    <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#ead8a6" stopOpacity="0"/><stop offset=".7" stopColor="#efdaa4" stopOpacity=".55"/><stop offset="1" stopColor="#fbebba" stopOpacity=".9"/></linearGradient>
    <radialGradient id={`${id}-sun`}><stop stopColor="#fff1c3" stopOpacity=".65"/><stop offset=".28" stopColor="#eed29a" stopOpacity=".28"/><stop offset="1" stopColor="#ead4a0" stopOpacity="0"/></radialGradient>
    <pattern id={`${id}-paper`} width="127" height="113" patternUnits="userSpaceOnUse"><path d="M8 21h11M43 68h5M106 19h7M87 102h8M20 92h3M60 7h4" stroke="#edf0dc" strokeWidth="1" opacity=".22"/><path d="M27 32h3M89 52h7M58 108h6M113 78h4" stroke="#28493d" opacity=".12"/></pattern>
    <pattern id={`${id}-thatch`} width="17" height="23" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><path d="M3 0v23M11 4v16" stroke="#d1c590" strokeWidth="2" opacity=".4"/></pattern>
  </defs>;
}

function Sky({id, t, warm}: {id: string; t: number; warm: number}) {
  return <g>
    <rect width="1920" height="1080" fill={`url(#${id}-sky)`}/>
    <ellipse cx={1550 - warm * 90} cy={210 + warm * 30} rx="420" ry="350" fill={`url(#${id}-sun)`} opacity={.12 + warm * .88}/>
    <circle cx={1560 - warm * 90} cy="248" r={37 + warm * 5} fill="#f7eac1" opacity={.08 + warm * .8}/>
    <g fill="#eef0df" opacity=".31" transform={`translate(${Math.sin(t * .045) * 25} 0)`}>
      <path d="M-80 240C170 189 296 220 483 212S752 166 962 216C806 210 737 238 600 230S445 249 318 242 86 238-80 266Z"/>
      <path d="M983 148C1190 121 1288 153 1424 139S1715 112 1970 155C1832 139 1722 170 1605 162S1450 184 1342 169 1137 169 983 174Z"/>
      <path d="M803 392C1100 369 1294 412 1495 385S1780 370 1970 399C1750 391 1720 419 1548 407S1282 431 1097 409 936 408 803 414Z" opacity=".55"/>
    </g>
  </g>;
}

function Mountains({id, warm, high = false}: {id: string; warm: number; high?: boolean}) {
  return <g transform={high ? 'translate(0 -45)' : undefined}>
    <path d="M-30 611Q37 600 90 555Q133 550 185 586Q270 573 313 516Q350 493 405 545Q445 517 478 471Q507 441 515 437Q558 443 602 486Q650 453 699 455Q761 471 809 526Q862 520 920 464Q962 461 1029 510Q1102 472 1149 419Q1195 402 1262 465Q1294 433 1328 381Q1351 340 1374 336Q1420 350 1452 391L1487 407Q1544 359 1601 359Q1654 389 1712 458Q1741 423 1780 397Q1803 386 1810 387Q1894 401 1950 445V815H-30Z" fill="#a2b7a8"/>
    <path d="M-30 632Q62 601 135 598Q231 602 295 628Q342 589 401 562Q426 553 433 555Q482 557 526 604L576 626Q654 585 736 571Q790 566 822 583Q892 552 925 515Q950 488 965 489Q993 490 1023 530L1068 559Q1121 559 1175 537Q1228 478 1270 463Q1296 453 1307 456Q1374 488 1435 566Q1485 515 1538 502Q1603 510 1659 544Q1706 493 1772 477Q1810 469 1869 513L1950 575V821H-30Z" fill="#829f8d"/>
    <path d="M-30 706C160 680 264 708 439 661Q526 657 624 683Q725 619 800 608Q866 607 923 647Q1000 613 1049 594Q1088 586 1162 629Q1218 585 1252 559Q1274 548 1288 551Q1359 578 1421 627Q1513 571 1554 565Q1609 565 1662 598Q1741 558 1802 550Q1870 553 1950 598V875H-30Z" fill="#628570"/>
    <path d="M960 626Q1008 599 1049 594Q1038 627 1003 680M1097 614Q1131 622 1162 629L1120 707M1216 600Q1253 557 1288 551Q1281 618 1325 690M1360 600L1421 627Q1404 661 1394 724M1494 591Q1528 565 1554 565Q1545 629 1591 704M1631 583L1662 598Q1666 652 1712 718M1734 571Q1773 550 1802 550Q1792 609 1848 677" fill="none" stroke="#b3c3a8" strokeWidth="3" opacity=".22"/>
    <path d="M970 489Q994 490 1068 559Q1121 559 1175 537Q1249 451 1307 456Q1374 488 1435 566Q1485 515 1538 502Q1603 510 1659 544Q1706 493 1772 477Q1810 469 1950 575V774H1180Z" fill={`url(#${id}-shine)`} opacity={warm * .62}/>
    <path d="M1278 565l-28 69-18 14M1266 591l-39 62M1295 593l12 48 23 27M1244 624l-20 43M1519 598l-28 50-26 18M1535 594l-19 68M1558 614l11 43 18 13M1795 576l-39 61-32 17M1798 618l-11 35M1814 598l14 45 26 21M1769 645l-19 22M1028 611l-37 34-22 9M1018 634l-28 30M1035 636l-14 28M1627 619l18 47M1382 636l-14 40" stroke="#355e4c" strokeWidth="2" opacity=".22" fill="none"/>
    <path d="M1337 387l-22 47-18 22M1350 398l-22 51M1374 362l10 23M1367 424l27 29M1566 387l-28 29-23 7M1584 402l-31 34M1768 421l-22 30M514 461l-21 35M484 497l-20 19M922 487l-34 28" stroke="#6f9180" strokeWidth="2" opacity=".27" fill="none"/>
    <path d="M-40 686C216 657 429 717 712 684S1218 660 1538 677S1783 651 1970 673V716C1610 687 1489 718 1250 704S825 730 517 700 91 721-40 706Z" fill="#ced9c4" opacity=".29"/>
  </g>;
}

function House({x, y, scale = 1, light = false}: {x: number; y: number; scale?: number; light?: boolean}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-75-5V-84H81V-5Z" fill={light ? '#bfc1a4' : '#859884'}/>
    <path d="M-100-81L-4-135 108-84 84-76-5-109-79-72Z" fill="#335549"/>
    <path d="M-100-81L-4-135 108-84M-88-85L-4-129 97-87M-80-87L-4-120 77-85" fill="none" stroke="#c0c9a8" strokeWidth="2" opacity=".47"/>
    <path d="M-11-7V-70H22V-7" fill="#37564a"/><path d="M-49-59h21v25h-21Z M43-57h20v24H43Z" fill={light ? '#d8b877' : '#405f51'}/>
    <path d="M-74-8H82M-67-80V-10M73-78V-10M-39-58V-34M53-55V-35" stroke="#506b58" strokeWidth="3" fill="none"/>
  </g>;
}

function Pine({x, y, scale = 1, flip = false}: {x: number; y: number; scale?: number; flip?: boolean}) {
  return <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
    <path d="M-5 0L3-91-7-169 17-246 29-305 40-318 34-260 11-179 20-99 11 0Z" fill="#24483d"/>
    <path d="M10-160L-39-216-84-229M16-216L81-270 123-274M26-272L-9-306-46-310M15-130L62-183 90-194" stroke="#24483d" strokeWidth="7" fill="none"/>
    <path d="M-133-218L-120-225-125-229-109-239-112-243-99-241-87-250-70-238-58-253-46-256-44-248-25-246-14-233-5-232 5-218-21-222-32-216-50-225-69-219-91-226-110-218Z M41-262L50-276 59-278 61-289 77-291 83-299 97-283 109-296 123-302 131-295 144-294 146-283 160-278 165-269 143-273 132-266 113-275 96-269 81-277 65-267Z M-76-304L-69-317-60-321-56-333-42-329-32-320-16-334-8-331 1-336 10-330 16-320 29-311 12-312 3-307-14-313-24-307-43-313-60-306Z M34-180L41-194 50-195 55-208 71-211 75-219 86-207 96-222 108-222 114-215 124-214 129-201 140-193 139-187 121-192 104-184 85-193 70-185 54-190Z" fill="#2c5643"/>
    <path d="M-124-226L-95-235-74-244M49-269L81-284 119-291M-65-310L-26-326M47-187L85-212" fill="none" stroke="#81987a" strokeWidth="3" opacity=".65"/>
  </g>;
}

function Grass({x, y, scale = 1, gold = false}: {x: number; y: number; scale?: number; gold?: boolean}) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0 0Q-10-34-22-45Q-11-14-6 0M0 0Q3-48 13-64Q8-28 6 0M8 0Q27-43 39-46Q18-19 14 0M-4 0Q-32-20-40-20Q-22-9-16 0M14 0Q30-20 45-16Q23-6 22 0" fill={gold ? '#a8a36e' : '#3a6250'} opacity=".8"/>;
}

function Bamboo({x, y, scale = 1, t, opacity = 1}: {x: number; y: number; scale?: number; t: number; opacity?: number}) {
  return <g opacity={opacity} transform={`translate(${x} ${y}) rotate(${Math.sin(t * .68 + x) * 1.15}) scale(${scale})`}>
    <path d="M-4 0Q-9-253 0-498Q3-660-5-817" fill="none" stroke="#254f40" strokeWidth="15"/>
    <path d="M-2 0Q-7-253 2-498Q5-660-3-817" fill="none" stroke="#839f78" strokeWidth="3" opacity=".57"/>
    <path d="M-12-135h19M-12-278h21M-9-422h21M-8-566H9M-9-704H9" fill="none" stroke="#b6c49a" strokeWidth="4" opacity=".73"/>
    <path d="M0-430Q67-501 140-522M0-577Q-67-637-142-650M-2-709Q49-759 94-773M-5-278Q-63-324-101-329" fill="none" stroke="#315b45" strokeWidth="4"/>
    <path d="M41-469Q32-529 38-548Q56-506 49-480M64-487Q94-541 114-552Q97-510 74-491M94-505Q140-504 168-477Q121-481 104-496M127-518Q155-560 186-567Q158-528 137-519M39-474Q73-467 100-432Q55-451 42-465M-38-610Q-43-669-59-691Q-63-645-45-617M-70-630Q-118-668-147-665Q-105-632-82-629M-104-642Q-137-691-164-700Q-145-661-117-645M-75-630Q-97-604-102-575Q-73-598-66-619M-131-648Q-172-650-194-627Q-151-631-135-641M28-739Q19-789 32-812Q42-777 37-748M55-757Q89-793 119-792Q84-759 63-755M84-771Q111-754 135-724Q98-740 83-761M-42-306Q-50-352-65-365Q-66-328-50-310M-69-321Q-109-345-132-336Q-100-318-77-316M-85-326Q-106-296-108-275Q-83-291-79-316" fill="#2c5944"/>
  </g>;
}

function Water({id, t, from = 702}: {id: string; t: number; from?: number}) {
  return <g>
    <rect y={from} width="1920" height={1080 - from} fill={`url(#${id}-water)`}/>
    {Array.from({length: 25}, (_, i) => {
      const y = from + 14 + (i / 25) ** 1.45 * (1060 - from);
      const x = rand(i + 44) * 1740 + Math.sin(t * .3 + i) * 12;
      const len = 38 + rand(i + 88) * (i * 8 + 110);
      return <path key={i} d={`M${x} ${y}q${len * .42} ${-2 - i * .1} ${len} 0`} fill="none" stroke={i % 3 ? '#c7d0b4' : '#294f47'} strokeWidth={1 + i * .05} opacity={.14 + rand(i) * .19}/>;
    })}
  </g>;
}

function Prison({id}: {id: string}) {
  return <g>
    <rect width="1920" height="1080" fill={`url(#${id}-wall)`}/>
    <path d="M0 710L1920 687V1080H0Z" fill={`url(#${id}-floor)`}/>
    <path d="M0 710H1920M850 710L660 1080M1270 710L1350 1080M1730 710L1990 1080M0 865H1920M0 1022H1920" stroke="#314f43" strokeWidth="3" opacity=".35" fill="none"/>
    <g stroke="#bdc2a9" strokeWidth="2" opacity=".14"><path d="M10 148H957M0 299H1068M0 450H994M0 601H1014M269 0V148M772 0V148M78 148V299M588 148V299M966 148V299M286 299V450M787 299V450M80 450V601M594 450V601M283 601V713M788 601V713"/></g>
    <path d="M1434 97H1789V513H1434Z" fill="#233f34" stroke="#6f7d63" strokeWidth="22"/>
    <rect x="1450" y="110" width="321" height="389" fill="#ced2b4"/>
    <path d="M1450 309L1532 249 1604 289 1684 212 1771 276V500H1450Z" fill="#809c7f"/>
    <path d="M1454 499L1771 499 1461 929 890 929Z" fill={`url(#${id}-light)`} opacity=".65"/>
    {Array.from({length: 6}, (_, i) => <g key={i}><path d={`M${1469 + i * 56} 108V509`} stroke="#3d4f3d" strokeWidth="15"/><path d={`M${1459 + i * 56} 510L${905 + i * 99} 929`} stroke="#294939" strokeWidth="16" opacity=".23"/></g>)}
    <path d="M1434 251H1789M1434 414H1789" stroke="#3b4e3c" strokeWidth="15"/>
    <path d="M991 0V750M1889 0V756M991 41H1889" stroke="#31493a" strokeWidth="24"/><path d="M1001 0V748M1880 0V746" stroke="#899076" strokeWidth="3"/>
    <path d="M1394 842Q1500 803 1606 842L1638 878 1375 896Z" fill="#818965"/>
    <path d="M1398 853L1571 834M1411 874L1608 852M1464 879L1585 872M1459 841L1419 884M1496 831L1468 886M1531 838L1501 879" stroke="#b4ad74" strokeWidth="3" opacity=".5"/>
    <ellipse cx="1740" cy="872" rx="51" ry="15" fill="#27473b"/><path d="M1709 823Q1704 875 1740 875Q1777 875 1770 823Z" fill="#627b63"/><ellipse cx="1740" cy="823" rx="31" ry="10" fill="#9ca68a"/><ellipse cx="1740" cy="824" rx="23" ry="6" fill="#385c48"/>
  </g>;
}

function River({id, t, warm}: {id: string; t: number; warm: number}) {
  const sway = Math.sin(t * .78) * 2.8;
  return <g><Mountains id={id} warm={warm}/>
    <path d="M0 692Q430 659 812 685L1092 660 1290 686 1601 668 1920 677V737H0Z" fill="#5d826d"/>
    <g opacity=".67" transform="translate(550 664) scale(.47)">
      <path d="M-665 0V-64H338V0" fill="#8a9e80"/>
      <path d="M-665-64h82v-16h30v16h97v-16h30v16h97v-16h30v16h97v-16h30v16h97v-16h30v16h97v-16h30v16h97v-16h30v16h98" fill="none" stroke="#506f59" strokeWidth="10"/>
      <path d="M-238 0V-31Q-214-69-190-31V0" fill="#365e4e"/>
      <House x={-213} y={-65} scale={.85}/><House x={-475} y={-73} scale={.55}/><House x={104} y={-67} scale={.6}/>
    </g>
    <Water id={id} t={t} from={704}/>
    <path d="M0 865Q178 814 363 889L493 955 0 1080Z" fill="#3b6653"/><path d="M0 900Q182 837 359 907" stroke="#b3b898" strokeWidth="3" fill="none" opacity=".45"/>
    <Grass x={90} y={908} scale={1.9}/><Grass x={243} y={915} scale={1.1}/>
    <g transform={`translate(0 ${sway}) rotate(${Math.sin(t * .54) * .28} 1280 823)`}>
      <ellipse cx="1301" cy="898" rx="325" ry="19" fill="#203f38" opacity=".18"/>
      <path d="M913 789Q1212 837 1692 779L1615 860Q1307 916 1005 847Z" fill="#3e5140" stroke="#a4ab7e" strokeWidth="3"/>
      <path d="M915 789Q1248 822 1692 779L1646 806Q1305 849 959 818Z" fill="#8d9871"/>
      <path d="M1005 847Q1322 894 1615 860M959 818Q1291 861 1646 806" stroke="#132f2b" strokeWidth="4" fill="none"/>
      <path d="M1358 796V682Q1452 576 1552 677V796Z" fill="#62735b"/><path d="M1358 793V682Q1452 576 1552 677V791" fill="none" stroke="#b3b18b" strokeWidth="4"/>
      <path d="M1383 797V679Q1453 594 1528 679V796M1410 801V677Q1457 616 1499 677V801M1359 707H1552M1359 747H1552" fill="none" stroke="#c4b887" strokeWidth="2" opacity=".5"/>
      <path d="M1509 821L1780 667" stroke="#4a5b43" strokeWidth="8"/><path d="M1709 707L1790 652 1814 659 1725 716Z" fill="#b6af7d"/>
    </g>
  </g>;
}

function Cottage({id, t, desk = false}: {id: string; t: number; desk?: boolean}) {
  return <g>
    <rect width="1920" height="1080" fill="#849582"/>
    <path d="M0 0H1920V729L0 754Z" fill={`url(#${id}-wall)`}/>
    <path d="M0 754L1920 729V1080H0Z" fill={`url(#${id}-floor)`}/>
    <path d="M0 754L1920 729M0 904L1920 880M756 748L520 1080M1150 741L1220 1080M1575 735L1780 1080" stroke="#395b46" strokeWidth="3" opacity=".35" fill="none"/>
    <path d="M0 53L1000 146 1920 13M990 117V752M1911 4V1080" fill="none" stroke="#405a44" strokeWidth="33"/><path d="M0 70L990 164 1920 35" fill="none" stroke="#a5ab87" strokeWidth="4" opacity=".58"/>
    <rect x="1240" y="178" width="455" height="394" fill="#ccd1b4" stroke="#526847" strokeWidth="20"/>
    <path d="M1251 433L1345 332 1450 411 1575 289 1685 366V564H1251Z" fill="#8ba384"/>
    <path d="M1251 509L1430 428 1541 459 1685 411V564H1251Z" fill="#688b6b"/>
    <path d="M1249 570L1684 570 1590 993 978 938Z" fill={`url(#${id}-light)`} opacity=".6"/>
    <path d="M1238 302H1697M1238 455H1697M1389 178V574M1544 178V574" stroke="#536b49" strokeWidth="13"/>
    <path d="M1241 585H1697" stroke="#b9ba91" strokeWidth="8"/>
    <path d="M1004 573Q1120 534 1199 589M1018 580L1082 758M1179 585L1143 765" fill="none" stroke="#657b59" strokeWidth="6" opacity=".7"/>
    {!desk && <g>
      <path d="M1440 715L1780 695 1867 812 1510 835Z" fill="#889276" stroke="#465f45" strokeWidth="10"/>
      <path d="M1499 830L1503 913M1846 807L1841 879M1451 715V821M1769 698V790" stroke="#425a40" strokeWidth="15"/>
      <path d="M1474 717L1740 706 1802 771 1520 791Z" fill="#b1b292"/>
      <path d="M1490 734L1755 718M1498 751L1770 736M1510 769L1781 754" stroke="#7b9276" strokeWidth="4" opacity=".6"/>
      <path d="M1490 720Q1495 697 1544 701L1573 722 1546 737Z" fill="#d0ccaa"/>
      <path d="M970 831L1081 807 1138 857 1118 914 1006 930 965 881Z" fill="#aab08d" stroke="#556a4c" strokeWidth="4"/>
      <path d="M984 837Q1053 864 1128 855M1030 822L1054 920M1094 822L1011 920" fill="none" stroke="#667e59" strokeWidth="9"/>
      <path d="M1060 843Q1045 789 1087 802Q1121 822 1082 849" fill="none" stroke="#667e59" strokeWidth="6"/>
      <path d="M1695 640H1775V689H1695Z" fill="#526947"/><ellipse cx="1735" cy="640" rx="40" ry="10" fill="#9fa986"/><path d="M1722 630L1706 596M1740 630L1751 590M1750 632L1776 600" stroke="#405d3f" strokeWidth="5"/>
    </g>}
    <g opacity=".45"><path d="M317 205h317M274 507h430M69 384h188M787 670h143" stroke="#bcc1a0" strokeWidth="2"/><path d="M336 206l-9 20 14 16-8 29M707 506l-13 22 7 34" fill="none" stroke="#526b51" strokeWidth="2"/></g>
    {desk && <g>
      <path d="M1749 618V298H1863V615Z" fill="#5b7454"/><path d="M1750 401H1864M1750 511H1864M1797 300V616" stroke="#9ea881" strokeWidth="7"/>
      <path d="M1761 400V345H1787V400M1810 397V348H1839V397M1763 506V457H1791V506M1808 505V443H1843V505" fill="#bdba8d" stroke="#768969" strokeWidth="3"/>
      <path d="M1060 917V719H1303V917M1060 752H1303M1060 793H1303" stroke="#3b5740" strokeWidth="13" fill="none"/>
    </g>}
    <g transform={`translate(1771 179) rotate(${Math.sin(t * .4) * .5})`}><path d="M0-110V0" stroke="#455c3f" strokeWidth="3"/><path d="M-19 0Q-27 27-13 52H17Q29 24 19 0Z" fill="#b8b082" stroke="#65764e" strokeWidth="3"/><path d="M-19 4H19M-16 45H18M0 1V48" stroke="#66764c" strokeWidth="2"/></g>
  </g>;
}

function DeskFront() {
  return <g>
    <path d="M989 762L1593 728 1810 824 1135 877Z" fill="#859579" stroke="#354f3a" strokeWidth="7"/>
    <path d="M1135 877L1810 824V859L1135 915 989 798V762Z" fill="#496347"/>
    <path d="M1163 903V1053M1740 864V1022M1016 802V950" stroke="#345039" strokeWidth="23"/>
    <path d="M1100 785L1476 762 1642 827 1244 853Z" fill="#d5d2aa"/>
    <path d="M1160 794L1278 787M1196 809L1370 797M1240 823L1440 808M1376 785L1400 791M1432 796L1518 812" stroke="#62775b" strokeWidth="3" opacity=".57"/>
    <path d="M1164 794l12 9 4-12M1222 792l6 11M1260 804l8 12 7-11M1312 811l9-14 8 10M1404 813l14 7 11-9" stroke="#3b5544" strokeWidth="3" fill="none" opacity=".66"/>
    <path d="M1520 760L1596 755 1638 774 1556 783Z" fill="#233f36" stroke="#a3ae86" strokeWidth="3"/><ellipse cx="1581" cy="765" rx="28" ry="7" fill="#112f2a"/>
    <path d="M1538 811L1675 765" stroke="#bfae72" strokeWidth="7"/><path d="M1538 811L1515 822 1543 817Z" fill="#2c4937"/>
    <path d="M1658 736L1709 733 1716 781Q1687 795 1660 780Z" fill="#778567" stroke="#3e5d43" strokeWidth="3"/>
    <path d="M1675 743L1662 679M1690 742L1700 660M1703 741L1725 685" stroke="#c7b785" strokeWidth="5"/><path d="M1659 681L1660 663M1700 662L1700 642M1726 685L1731 670" stroke="#2f4a37" strokeWidth="6"/>
    <ellipse cx="1028" cy="789" rx="20" ry="8" fill="#bbc0a0"/><path d="M1009 789L1015 815Q1032 825 1045 814L1047 789" fill="#97ad8a" stroke="#3f6248" strokeWidth="3"/><ellipse cx="1028" cy="790" rx="15" ry="5" fill="#56714a"/>
  </g>;
}

function Farm({id, t, warm, returning = false}: {id: string; t: number; warm: number; returning?: boolean}) {
  return <g><Mountains id={id} warm={warm}/>
    <path d="M0 737Q460 655 882 728T1920 674V1080H0Z" fill={returning ? '#8c9d77' : '#6d896d'}/>
    <path d="M0 769L1920 703M0 846L1920 735M0 952L1920 780M0 1080L1920 845" fill="none" stroke="#bfd0a2" strokeWidth="4" opacity=".35"/>
    <path d={returning ? 'M1096 702C1194 719 1326 751 1326 791S1168 851 1040 916L756 1080H1311C1301 992 1334 893 1390 852S1460 772 1330 742L1160 696Z' : 'M1133 706L1195 715 1314 1080H961L1138 819Z'} fill="#b4b79a"/>
    <path d={returning ? 'M1109 710C1374 757 1436 792 1234 879Q1086 947 1003 1080' : 'M1165 719L1155 871 1125 1080'} fill="none" stroke="#d0c9a5" strokeWidth="4" opacity=".6"/>
    <path d="M0 941Q470 901 961 881M0 1030Q460 972 997 950M1339 876L1920 797M1361 952L1920 863M1383 1045L1920 946" fill="none" stroke="#395f48" strokeWidth="17" opacity=".73"/>
    {Array.from({length: 26}, (_, i) => {
      const left = i < 14; const j = left ? i : i - 14;
      const x = left ? 65 + (j % 7) * 142 : 1435 + (j % 6) * 96;
      const y = left ? 894 + Math.floor(j / 7) * 89 - (j % 7) * 8 : 864 + Math.floor(j / 6) * 92 - (j % 6) * 15;
      return <g key={i} transform={`rotate(${Math.sin(t * .8 + i) * 1.6} ${x} ${y})`}><Grass x={x} y={y} scale={.51 + y / 1700} gold={returning}/></g>;
    })}
    <House x={1469} y={703} scale={.93} light={returning}/><House x={1696} y={693} scale={.7} light={returning}/><House x={1835} y={706} scale={.84}/>
    <Pine x={1605} y={715} scale={.77}/><Pine x={1892} y={731} scale={.85} flip/>
    <path d="M1369 737L1873 710M1380 725V764M1463 723V754M1548 718V747M1644 714V742M1742 705V734M1841 699V729" stroke="#586f50" strokeWidth="5" fill="none"/>
    {returning && <g fill="none" stroke="#46684d" strokeWidth="2.5" opacity=".6"><path d="M1433 396q12-12 24 0q12-13 24 0M1545 374q9-9 18 0q9-10 18 0M1635 408q8-8 16 0q8-8 16 0"/></g>}
    {!returning && <g><path d="M1474 862L1618 809" stroke="#8f9b6e" strokeWidth="9"/><path d="M1474 855L1470 889 1425 902 1439 868Z" fill="#375742" stroke="#a4ad83" strokeWidth="2"/></g>}
  </g>;
}

function Walking({id, t, warm, bamboo = false}: {id: string; t: number; warm: number; bamboo?: boolean}) {
  return <g><Mountains id={id} warm={warm}/>
    <path d="M0 739Q331 664 661 728L970 754Q1390 640 1920 676V1080H0Z" fill="#6d8d70"/>
    <path d="M0 804Q340 714 695 761L1000 818 1241 760 1429 739 1580 813 1920 743V1080H0Z" fill="#52775d"/>
    <path d={bamboo ? 'M1280 703C1447 715 1526 757 1399 803S1028 900 965 1080H1533C1379 949 1465 870 1556 820S1505 720 1358 699Z' : 'M1243 690C1141 723 1140 755 1243 785S1353 858 1240 908L1018 1080H1633C1518 957 1495 887 1369 839S1210 759 1280 691Z'} fill={bamboo ? '#acb29a' : '#91a695'}/>
    <path d={bamboo ? 'M1299 716C1518 739 1518 778 1320 851Q1160 931 1160 1040' : 'M1255 706C1152 752 1302 795 1360 840S1376 936 1265 1035'} stroke="#d1d1b4" strokeWidth="5" fill="none" opacity=".47"/>
    <path d="M0 865L175 811 267 846 422 798 572 847 755 821 993 962 930 1080H0Z" fill="#3e694f"/>
    <path d="M1600 884L1750 814 1920 788V1080H1580L1499 982Z" fill="#3d684e"/>
    {bamboo ? <g><Bamboo x={1783} y={882} scale={.88} t={t}/><Bamboo x={1654} y={814} scale={.7} t={t} opacity={.78}/><Bamboo x={947} y={792} scale={.61} t={t} opacity={.62}/><Bamboo x={870} y={800} scale={.7} t={t} opacity={.7}/><Bamboo x={1901} y={875} scale={.97} t={t}/></g> : <g>
      <Pine x={1679} y={828} scale={1.15}/><Pine x={1850} y={785} scale={.83} flip/>
      <path d="M1079 1000Q1170 967 1296 983L1330 999Q1229 1018 1120 1008Z M1283 861Q1337 850 1385 869L1374 881 1323 884Z M1209 768L1258 775 1236 782 1211 779Z" fill="#c0cabb" opacity=".5"/>
      <path d="M1099 999L1278 992M1305 872L1375 871" stroke="#d2dcc5" strokeWidth="2" opacity=".6"/>
    </g>}
    <Grass x={940} y={976} scale={1.5}/><Grass x={1570} y={1010} scale={1.8}/><Grass x={1750} y={905} scale={1.4}/><Grass x={507} y={865} scale={1.2}/>
    <path d="M739 912L783 893 826 912 810 938 750 940Z M1692 961L1750 923 1794 946 1785 979 1708 981Z" fill="#77957e" stroke="#aac0a0" strokeWidth="2"/>
  </g>;
}

function Ridge({id, t, warm}: {id: string; t: number; warm: number}) {
  return <g><Mountains id={id} warm={warm} high/>
    <path d="M0 747Q237 728 461 761T993 727Q1184 682 1470 731T1920 705V1080H0Z" fill="#8da688"/>
    <path d="M0 895Q278 819 487 856L834 868 1012 805 1241 828 1446 767 1636 794 1920 731V1080H0Z" fill="#557b5e"/>
    <path d="M853 986L984 938 1038 867 1231 852 1352 890 1490 891 1616 976 1920 1036V1080H627Z" fill="#638060"/>
    <path d="M975 948L1043 870 1230 857 1350 895 1479 895 1576 957 1365 940 1231 905 1079 910Z" fill="#a5ac85"/>
    <path d="M0 980Q400 857 689 916L978 950 895 1080H0Z" fill="#355f48"/>
    <path d="M1100 914L1097 975 1047 1058M1328 942L1387 1001 1422 1080M1532 970L1567 1035" stroke="#355c45" strokeWidth="6" opacity=".56" fill="none"/>
    <path d="M1540 272L1050 869 1645 969 1890 540Z" fill={`url(#${id}-light)`} opacity={warm * .34}/>
    <Pine x={1737} y={883} scale={1.24} flip/><Grass x={958} y={968} scale={1.3} gold/><Grass x={1580} y={975} scale={1.2} gold/>
    <g transform={`translate(${Math.sin(t * .08) * 16} 0)`} opacity=".3" fill="#d7ddc6"><path d="M350 717Q614 681 969 712T1470 687L1401 722Q1090 757 832 733T350 737Z"/></g>
  </g>;
}

function Rain({t, amount}: {t: number; amount: number}) {
  return <g stroke="#e1e7cf" fill="none" strokeLinecap="round">
    {Array.from({length: 58}, (_, i) => {
      const speed = 330 + rand(i + 901) * 170;
      const y = mod(rand(i + 500) * 1290 + t * speed, 1290) - 100;
      const x = mod(rand(i + 30) * 2180 - t * 95, 2180) - 100;
      const length = 23 + rand(i + 211) * 40;
      return <path key={i} d={`M${x} ${y}l${-length * .29} ${length}`} strokeWidth={1 + rand(i) * .8} opacity={amount * (x < 930 ? .105 : .24)}/>;
    })}
    {Array.from({length: 12}, (_, i) => {
      const p = mod(t * .63 + rand(i + 14), 1);
      return <ellipse key={`r${i}`} cx={925 + rand(i + 6) * 780} cy={808 + rand(i + 116) * 192} rx={3 + p * (12 + rand(i) * 14)} ry={1 + p * 4} opacity={amount * (1 - p) * .27} strokeWidth="1.2"/>;
    })}
  </g>;
}

/** Suggested ground anchors (x, y, scale): prison 1240,895,.92; river 1240,807,.78;
 * cottage 1250,900,.9; farm 1210,900,.91; desk 1260,920,.94; bamboo 1270,915,.91;
 * path 1330,910,.94; ridge 1230,893,.95; return 1230,900,.9.
 * River actor bob: add sin(t*.78)*2.8 to y. Desk top lives in the front layer. */
export function Environment({kind, t, warm = 0, rain = 0, layer = 'back'}: Props) {
  const w = clamp(warm), r = clamp(rain), id = `v3r-env-${kind}-${layer}`;
  if (layer === 'front') return <g data-environment-front={kind}>
    {kind === 'prison' && <g><path d="M34 0V1080M172 0V1080M27 135H216M24 864H206" stroke="#203c31" strokeWidth="31"/><path d="M49 0V1080M183 0V1080" stroke="#7d8867" strokeWidth="4" opacity=".47"/><path d="M0 0H1920V24H0Z" fill="#263e31"/></g>}
    {(kind === 'cottage' || kind === 'desk') && <path d="M1848 0H1920V1080H1870Z M0 0H1920V38L974 177Z" fill="#294735" opacity=".82"/>}
    {kind === 'desk' && <DeskFront/>}
    {kind === 'bamboo' && <g><Bamboo x={70} y={1090} scale={1.5} t={t}/><Bamboo x={1905} y={1100} scale={1.45} t={t}/><path d="M1910 180Q1750 161 1632 36M1760 130Q1688 168 1627 154M1783 141Q1757 223 1702 251" stroke="#294f3c" strokeWidth="5" fill="none"/></g>}
    {kind === 'path' && <g><Grass x={1848} y={1080} scale={2.1}/><Grass x={76} y={1070} scale={1.9}/></g>}
    {kind === 'river' && <g><Grass x={74} y={1045} scale={2.7}/><path d="M1630 880Q1670 871 1714 880M961 872Q934 865 909 873" stroke="#d5d8b8" strokeWidth="2" opacity=".34" fill="none"/></g>}
    {r > 0 && !['prison', 'cottage', 'desk'].includes(kind) && <Rain t={t} amount={r}/>}
  </g>;
  return <g data-environment={kind}>
    <Definitions id={id} warm={w}/>
    <Sky id={id} t={t} warm={w}/>
    {kind === 'prison' && <Prison id={id}/>}
    {kind === 'river' && <River id={id} t={t} warm={w}/>}
    {kind === 'cottage' && <Cottage id={id} t={t}/>}
    {kind === 'desk' && <Cottage id={id} t={t} desk/>}
    {kind === 'farm' && <Farm id={id} t={t} warm={w}/>}
    {kind === 'return' && <Farm id={id} t={t} warm={w} returning/>}
    {(kind === 'bamboo' || kind === 'path') && <Walking id={id} t={t} warm={w} bamboo={kind === 'bamboo'}/>}
    {kind === 'ridge' && <Ridge id={id} t={t} warm={w}/>}
    {w > 0 && <path d={`M${1760 - w * 500} 0H1920V1080H${1760 - w * 730}L${1580 - w * 270} 530Z`} fill={`url(#${id}-light)`} opacity={w * .18}/>}
    <rect width="1920" height="1080" fill={`url(#${id}-inkmist)`}/>
    <image width="1920" height="1080" href={PAPER_DATA_URI} opacity=".45"/>
  </g>;
}
