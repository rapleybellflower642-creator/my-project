'use strict';

// Layered, full-frame plates for the fourth edition.  Deliberately no filters,
// embedded text or image dependencies: all shapes survive raster export cleanly.
const modes = ['forest', 'rain-leaves', 'storm', 'river', 'path', 'sunrise', 'sunset', 'lookback', 'horizon', 'return'];
const palettes = {
  forest: ['#ced7bc', '#657f70', '#183f37', '#9b9970'],
  'rain-leaves': ['#b8c6b9', '#668b82', '#214f48', '#b1bba0'],
  storm: ['#627b7d', '#2d5154', '#163c40', '#a9b6a2'],
  river: ['#e4e0c5', '#92ada0', '#315a50', '#b5ac80'],
  path: ['#ddd9b9', '#91a08a', '#345348', '#bfa87d'],
  sunrise: ['#f0dfb2', '#b1bda4', '#497263', '#e4b16c'],
  sunset: ['#e5bb85', '#aa9f80', '#4a6051', '#d58b50'],
  lookback: ['#c1c6ad', '#7b9890', '#284f48', '#b3ae85'],
  horizon: ['#e8e4ca', '#acbeb0', '#456e65', '#d9b87d'],
  return: ['#e4d2ac', '#a2aa8a', '#4e6650', '#c39a68'],
};

const hash = (i) => ((i * 691 + 191) % 997) / 997;
const p = (d, fill, rest = '') => `<path d="${d}" fill="${fill}" ${rest}/>`;
const line = (d, stroke, width = 1, opacity = 1) => p(d, 'none', `stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"`);
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${body}</svg>`;
const group = (body, transform = '', opacity = 1) => `<g transform="${transform}" opacity="${opacity}">${body}</g>`;

function defs(mode) {
  const [paper, mid, ink, warm] = palettes[mode];
  return `<defs>
    <linearGradient id="${mode}-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${paper}"/><stop offset=".57" stop-color="${paper}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    <linearGradient id="${mode}-far" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${mid}" stop-opacity=".91"/><stop offset="1" stop-color="${paper}" stop-opacity=".18"/></linearGradient>
    <linearGradient id="${mode}-near" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="${mid}"/><stop offset=".42" stop-color="${ink}"/><stop offset="1" stop-color="${ink}"/></linearGradient>
    <linearGradient id="${mode}-water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${paper}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${ink}"/></linearGradient>
    <linearGradient id="${mode}-road" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${paper}"/><stop offset=".6" stop-color="${warm}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    <radialGradient id="${mode}-glow"><stop stop-color="#fff4cf" stop-opacity=".63"/><stop offset=".36" stop-color="#fff1c3" stop-opacity=".22"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></radialGradient>
  </defs>`;
}
const paint = (mode, name) => `url(#${mode}-${name})`;

function paper(mode) {
  let fiber = '';
  let flecks = '';
  for (let i = 0; i < 84; i++) {
    const x = Math.round(hash(i * 7) * 1920), y = Math.round(hash(i * 19) * 1080);
    fiber += `M${x} ${y}l${4 + i % 12} ${i % 3 - 1}`;
    if (i % 3 === 0) flecks += `M${x + 12} ${y - 5}h1`;
  }
  return `<rect width="1920" height="1080" fill="${paint(mode, 'sky')}"/>${line(fiber, '#354e42', 0.75, 0.085)}${line(flecks, '#fbf0ca', 1.5, 0.23)}`;
}

function mountain(mode, d, near = false, opacity = 1) {
  return p(d, paint(mode, near ? 'near' : 'far'), `opacity="${opacity}"`);
}

function cloud(x, y, scale, fill, opacity = .55) {
  return group(p('M-290 24Q-248-3-209 9Q-192-13-156-11Q-137-40-101-24Q-58-62-13-38Q20-65 57-33Q90-41 110-15Q158-36 190-5Q227-7 246 15Q275 12 294 31Q207 50 128 37Q52 48-24 38Q-131 58-206 36Q-255 43-290 24Z', fill), `translate(${x} ${y}) scale(${scale})`, opacity);
}

function brushwork(x, y, w, h, color, opacity = .22) {
  let d = '';
  for (let i = 0; i < 26; i++) {
    const xx = x + hash(i * 13) * w, yy = y + hash(i * 17) * h;
    d += `M${xx.toFixed(1)} ${yy.toFixed(1)}q${9 + i % 11} ${13 + i % 9} ${3 - i % 13} ${31 + i % 25}m2-24l${-7 + i % 17} 15`;
  }
  return line(d, color, 1.45, opacity);
}

function ripples(x, y, w, h, color, count = 22) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const xx = x + hash(i * 7) * w, yy = y + hash(i * 23) * h;
    d += `M${xx.toFixed(1)} ${yy.toFixed(1)}q${17 + i % 19} ${i % 4 - 2} ${40 + i % 47} 0`;
  }
  return line(d, color, 1.05, .38);
}

function reeds(x, y, s = 1, color = '#4a6b50') {
  let stems = '', tips = '';
  for (let i = 0; i < 15; i++) {
    const xx = (i - 7) * 7, height = 20 + hash(i * 11) * 61;
    stems += `M0 0Q${xx * .6} ${-height * .55} ${xx} ${-height}`;
    tips += `M${xx} ${-height + 9}q${i % 2 ? 10 : -10} -7 ${i % 2 ? 5 : -6} -18q-1 9 ${i % 2 ? -5 : 6} 18Z`;
  }
  return group(line(stems, color, 1.4, .9) + p(tips, color, 'opacity=".68"'), `translate(${x} ${y}) scale(${s})`);
}

function rocks(x, y, s = 1, warm = false) {
  return group(
    p('M-72 12L-67-14L-43-42L-14-52L21-36L37-13L75 6L67 25Q13 40-72 12Z', warm ? '#687359' : '#42675a') +
    p('M-67-14L-43-42L-14-52L21-36L2-25L-28-27L-36-6Z', warm ? '#a2a381' : '#7b9980') +
    line('M-14-50L-5-20L13-5L5 22M-27-24L-35-3L-54 10M22-33L18-14L43 6', '#263f35', 2, .65) +
    line('M-44-39l12-4M13-33l15 8M-58-11l13 2', '#abb07c', 4, .72),
    `translate(${x} ${y}) scale(${s})`
  );
}

function bamboo(x, y, s = 1, mirror = false, dark = false) {
  let stems = '', nodes = '', veins = '', leavesA = '', leavesB = '';
  for (let j = 0; j < 4; j++) {
    const base = j * 32 - 35, shift = 17 + j * 8;
    stems += `M${base} 0Q${base + 3} -220 ${base + shift} -568L${base + shift + 6} -568Q${base + 10} -220 ${base + 7} 0Z`;
    for (let k = 0; k < 7; k++) {
      const yy = -43 - k * 72, xx = base + shift * -yy / 568;
      nodes += `M${xx - 2} ${yy}q5 3 11 0`;
      if (k < 2) continue;
      const side = (j + k) % 2 ? -1 : 1;
      veins += `M${xx} ${yy}q${side * 35} -12 ${side * 101} -25`;
      for (let l = 0; l < 5; l++) {
        const lx = xx + side * (13 + l * 18), ly = yy - l * 5;
        leavesA += `M${lx} ${ly}q${side * -7} -19 ${side * 6} -40q${side * 12} 25 ${side * -6} 40Z`;
        leavesB += `M${lx} ${ly}q${side * 20} 0 ${side * 36} 15q${side * -25} 0 ${side * -36} -15Z`;
      }
    }
  }
  return group(p(stems, dark ? '#254637' : '#547b5f') + line(nodes, dark ? '#71936e' : '#b2c28a', 1.4, .75) + line(veins, '#668866', 1.4) + p(leavesA, dark ? '#264d3a' : '#567f53') + p(leavesB, dark ? '#365d43' : '#88a66d'), `translate(${x} ${y}) scale(${mirror ? -s : s} ${s})`);
}

function pine(x, y, s = 1, dark = false) {
  const foliage = dark ? '#244e3d' : '#446f4d';
  const top = dark ? '#4c7551' : '#7d9362';
  let canopy = '', hatches = '';
  for (let i = 0; i < 7; i++) {
    const xx = [-85, -34, 30, 85, 139, 44, 81][i], yy = [-189, -208, -173, -215, -195, -269, -285][i];
    canopy += p('M-58 9Q-77-4-48-18Q-45-39-24-27Q-5-46 13-28Q38-33 42-15Q73-17 74 5Q32 22-2 15Q-35 27-58 9Z', foliage, `transform="translate(${xx} ${yy})"`);
    for (let j = 0; j < 11; j++) {
      const sx = xx - 44 + j * 10, sy = yy + 5 - Math.sin(j) * 4;
      hatches += `M${sx} ${sy}l-5-12m5 12l4-14m-4 14l9-9`;
    }
  }
  return group(
    p('M-20 0Q10-91 7-159Q-6-222 29-291Q20-213 29-163Q37-89 4 0Z', '#536248') +
    line('M-2-3Q27-111 18-168Q10-214 30-273M13-167Q-43-160-92-190M24-180Q96-232 148-207M22-235Q51-274 95-275', '#9c9871', 3, .85) +
    line('M15-166Q-43-161-92-190M24-180Q96-232 148-207M22-235Q51-274 95-275', '#405540', 7) + canopy + line(hatches, top, 1.2, .68), `translate(${x} ${y}) scale(${s})`
  );
}

function birds(x, y, s = 1, color = '#4b6558') {
  return group(line('M0 0q-12-16-27-12M0 0q13-17 28-11M63 19q-9-13-23-10M63 19q12-13 22-8M109-13q-11-10-21-9M109-13q10-13 22-9', color, 2.2, .7), `translate(${x} ${y}) scale(${s})`);
}

/** Feet at the passed y; ordinary cloth clothing, never the unavailable rain gear. */
function scholar(x, y, scale = .57, direction = 1, lookback = false, warm = false) {
  const robe = warm ? '#687c63' : '#4e7064';
  const face = warm ? '#d3b185' : '#c1b48e';
  const body =
    `<ellipse cx="5" cy="4" rx="67" ry="8" fill="#294636" opacity=".24"/>` +
    p('M-35-133L-26-31L-41-5L-37 2L-10 1L0-112Z', '#345747') +
    p('M12-131L21-24L36-7L65-1L64 6L26 7L9-6L-15-109Z', '#4f694e') +
    p('M-38-8L-11-9L-7 2L-44 4ZM31-8L49-3L69 0L67 7L29 7Z', '#b3a377') +
    p('M-38-317Q-66-285-60-237Q-63-171-80-77Q-59-68-39-72Q-12-55 11-67Q43-63 70-82Q56-176 60-241Q72-282 31-319Z', robe, 'stroke="#345646" stroke-width="2"') +
    p('M-40-307Q-64-283-79-229L-67-196L-49-210L-28-270L6-251L35-278L40-312L8-326Z', '#7e8f71') +
    line('M-32-227Q-33-142-59-79M-7-232Q-18-145-9-72M22-230Q17-139 38-75M45-236Q41-160 57-82', '#b5b99a', 2, .5) +
    line('M-21-204Q-33-135-29-78M7-217Q0-140 12-73', '#2b5142', 4, .65) +
    p('M-47-238Q3-223 52-240L52-229Q0-210-49-227Z', '#34563e') +
    line('M0-225Q-11-205-5-170M5-224Q22-203 12-185', '#bbb085', 3) +
    p('M-21-326L13-296L31-316L13-332L2-319L-10-333Z', '#d5d0ac') +
    line('M-21-324L13-293L36-316', '#475d47', 2.2) +
    group(
      p('M-25-44Q-24-70 2-76Q23-78 32-58L30-35L39-20L29-15L26 2L6 16L3 32L-20 20L-15-2Q-34-18-25-44Z', face) +
      p('M-26-54Q-20-77 3-77Q24-76 29-57Q5-63-3-36L-10-10L-23-5Q-16-28-26-37Z', '#233f30') +
      p('M-14-9Q-17 14-27 22Q-7 34-1 20Q10 26 25 10Q28 35 12 55Q-4 38-11 34Q-29 28-27 3Z', '#294b35') +
      line('M14-35l10-2M17-29l6 0M24-7l6 0M-4 18q0 16 14 30', '#687759', 1.4) +
      p('M-31-60L-27-105Q-12-117 8-109L24-98L31-61Q3-47-31-60Z', '#294e38', 'stroke="#779477" stroke-width="1.3"') +
      line('M-24-97Q0-106 21-94M-12-106L-14-62M19-96L23-64', '#83a07d', 1.3, .7) +
      p('M-32-67Q0-57 31-65L32-54Q-1-43-33-55Z', '#3c5c42'), `translate(0 -335) scale(${lookback ? -1 : 1} 1)`
    ) +
    line('M83-288L100 2', '#a5a36b', 4) + line('M81-251h6M83-196h6M85-140h6M89-86h6M91-34h6', '#3a6043', 2) +
    p('M32-313Q55-310 57-283Q57-262 69-253L86-254L91-234Q65-219 48-238Q25-263 21-289Z', '#698468', 'stroke="#3c5f48" stroke-width="1.6"') +
    p('M83-255Q88-265 95-258L100-246L94-237L87-241Z', face) +
    line('M38-291Q32-263 52-243M64-246L84-242', '#c1c5a3', 1.7, .55);
  return group(body, `translate(${x} ${y}) scale(${scale * direction} ${scale})`);
}

function village(x, y, s = 1) {
  return group(
    p('M-206 35L-203-41L-73-41L-70 43ZM-19 31L-20-66L110-65L113 31ZM140 43L142-20L248-21L248 45Z', '#d5c9a5') +
    p('M-236-40Q-195-42-174-61L-125-86Q-109-63-45-38L-65-28L-210-29ZM-48-65Q-5-79 46-112Q71-83 136-65L120-53L-28-53ZM120-20Q149-32 189-61Q216-40 272-20L254-10L133-10Z', '#4c6351') +
    line('M-211-39L-177-42L-126-72L-76-43L-58-39M-34-65L0-72L46-99L89-74L125-64M133-21L162-29L189-51L229-29L260-20', '#a8ab8b', 2, .7) +
    p('M-157 41L-157-6L-126-6L-126 42ZM22 31L23-17L53-17L54 31ZM190 43L190 4L216 4L216 43Z', '#55664e') +
    p('M-190-6h18v18h-18ZM-101-7h17v18h-17ZM74-25h20v22H74ZM153 1h17v16h-17Z', '#887c55') +
    p('M-164-6h4v45h-4ZM18-17h4v46h-4Z', '#af5540') +
    line('M-199 16h24M-92 20h15M83 18h22M227 22h17', '#b6ad89', 1.2, .7), `translate(${x} ${y}) scale(${s})`
  );
}

function forest(mode) {
  let bg = paper(mode);
  bg += `<ellipse cx="1110" cy="363" rx="760" ry="595" fill="${paint(mode, 'glow')}"/>`;
  bg += mountain(mode, 'M0 482L135 385L232 408L376 301L495 362L601 355L715 465L826 426L950 482L1094 382L1261 419L1430 309L1541 355L1689 275L1814 363L1920 340V1080H0Z', false, .48);
  bg += cloud(1130, 464, 2.7, '#e1e4c5', .55);
  bg += mountain(mode, 'M0 560Q133 492 253 538Q337 607 508 613Q757 637 926 592Q1050 566 1166 602Q1384 571 1532 505Q1746 422 1920 467V1080H0Z', true, .72);
  bg += p('M735 1080Q640 894 811 783Q991 684 1152 643Q1226 620 1172 595Q1237 610 1220 632Q1186 664 1066 705Q897 786 941 883Q1000 980 1091 1080Z', paint(mode, 'road'));
  bg += line('M780 977Q693 867 839 785Q1024 683 1173 641', '#e2dbab', 2.2, .45);
  bg += bamboo(119, 845, 1.54, false, true) + bamboo(410, 789, 1.18) + bamboo(670, 707, .65) + bamboo(1639, 817, 1.58, true, true) + bamboo(1453, 762, 1.01, true);
  bg += reeds(692, 804, 1.08) + rocks(1507, 796, 1.08) + brushwork(49, 633, 607, 287, '#b0bd8e', .2);
  const subject = scholar(908, 786, .59);
  const fg = bamboo(-22, 1055, 1.97, false, true) + bamboo(1972, 1011, 1.83, true, true) + reeds(382, 915, 1.94, '#294e37');
  return {bg, subject, fg};
}

function rainLeaves(mode) {
  let bg = paper(mode);
  bg += mountain(mode, 'M0 479Q174 409 306 462L485 336L609 393L722 358L904 494L1028 432L1195 509L1398 392L1539 415L1687 326L1807 381L1920 356V1080H0Z', false, .57);
  bg += cloud(1038, 520, 3.65, '#d1dbcc', .65);
  bg += mountain(mode, 'M0 762Q377 575 660 664Q878 747 1068 636Q1331 504 1532 628Q1759 702 1920 591V1080H0Z', false, .5);
  bg += p('M0 927Q416 796 751 823Q1052 858 1376 775Q1628 703 1920 759V1080H0Z', '#537e71', 'opacity=".43"');
  bg += ripples(373, 707, 1360, 173, '#eff0d3', 22);
  let leaves = '';
  leaves += line('M280 828Q669 573 1080 302Q1198 228 1340 212M797 490Q1237 509 1624 434M644 597Q466 434 415 276', '#4f7255', 13);
  leaves += line('M285 822Q693 551 1333 211M798 484Q1240 500 1618 431', '#b1c194', 2.6, .65);
  const clusters = [[546, 661, -41], [747, 516, -26], [1033, 338, -35], [1291, 495, 15], [1502, 459, 19], [486, 401, -108]];
  for (const [x, y, rotation] of clusters) {
    leaves += group(p('M0 0Q-48-89 30-193Q64-92 0 0Z', '#3b7152') + p('M0 0Q64-64 191-37Q117 16 0 0Z', '#638957') + p('M0 0Q-53 31-151 1Q-98-34 0 0Z', '#416e4a') + line('M1-1Q3-96 29-190M4-1Q97-15 185-36M-3 0Q-77-12-146 0', '#b5c691', 1.7, .57), `translate(${x} ${y}) rotate(${rotation})`);
  }
  leaves += p('M666 582Q657 604 654 616Q653 631 665 633Q680 633 679 618Q676 601 666 582ZM1172 569Q1162 592 1162 604Q1163 618 1175 618Q1188 614 1184 601Q1180 583 1172 569ZM1316 356Q1309 371 1309 380Q1310 391 1319 390Q1328 388 1327 379Q1324 366 1316 356Z', '#d6e4cb', 'fill-opacity=".84" stroke="#e5edce" stroke-width="1.2"');
  leaves += line('M662 620l1-8M1170 606l-1-7M1315 381v-4', '#ffffff', 2.4, .8);
  const fg = group(p('M-80 11Q57-74 263-4Q75 54-80 11ZM8 12Q-74-140 10-265Q63-109 8 12Z', '#234e39'), 'translate(61 541) rotate(28)', .91) + group(p('M0 0Q139-118 315-59Q215 53 0 0Z', '#315b42'), 'translate(1664 751) rotate(-15)', .94);
  return {bg, subject: leaves, fg};
}

function storm(mode) {
  let bg = paper(mode);
  bg += p('M0 177Q194 108 371 171Q528 98 713 162Q914 69 1117 144Q1333 86 1528 167Q1740 84 1920 130V441Q1728 384 1572 428Q1320 363 1108 416Q858 350 655 414Q352 363 0 470Z', '#264d51', 'opacity=".65"');
  bg += cloud(721, 329, 3.35, '#819893', .35) + cloud(1631, 243, 2.01, '#273e44', .54);
  bg += mountain(mode, 'M0 713L117 565L180 613L320 432L369 487L418 418L492 463L581 348L644 381L725 519L863 569L1044 409L1178 442L1283 339L1339 391L1433 495L1518 431L1602 472L1741 366L1873 462L1920 435V1080H0Z', false, .72);
  bg += mountain(mode, 'M0 717L204 630L310 670L489 541L597 610L715 589L831 723L995 781L1097 689L1227 719L1391 579L1503 613L1661 534L1783 632L1920 602V1080H0Z', true, .88);
  bg += p('M0 1059Q448 1033 638 866Q853 688 1134 763Q1370 827 1540 717Q1656 646 1705 631Q1591 735 1497 790Q1331 871 1165 835Q870 773 724 941L591 1080H0Z', paint(mode, 'road'), 'opacity=".77"');
  bg += line('M53 1041Q444 1021 642 861Q852 696 1129 769Q1356 833 1539 728', '#bac4a4', 2, .43);
  bg += brushwork(18, 608, 813, 269, '#bbc4a1', .25) + brushwork(1453, 584, 448, 264, '#a9b59a', .22);
  bg += pine(322, 740, 1.14, true) + rocks(828, 812, .63) + reeds(1528, 825, 1.19, '#708a66');
  const subject = scholar(1171, 787, .62) + scholar(1472, 762, .35, 1, false);
  const fg = p('M0 914Q181 817 416 851Q502 907 698 871L914 1080H0Z', '#1e413b') + reeds(270, 899, 2.2, '#597859') + p('M1491 1080Q1608 865 1740 827L1920 852V1080Z', '#203d39') + pine(1811, 977, 1.46, true);
  return {bg, subject, fg};
}

function river(mode) {
  let bg = paper(mode);
  bg += mountain(mode, 'M0 590L113 481L208 522L314 398L418 470L509 425L622 542L754 465L917 563L1081 499L1219 398L1378 459L1492 399L1592 479L1761 405L1920 522V884H0Z', false, .6);
  bg += cloud(889, 527, 3.64, '#ebe8d0', .76);
  bg += p('M0 665Q226 598 475 644Q692 695 904 641Q1194 566 1455 626Q1688 677 1920 615V1080H0Z', paint(mode, 'water'));
  bg += p('M0 708Q206 621 410 655L611 711Q380 777 0 806Z', '#648c72') + p('M1326 685Q1576 570 1920 619V767Q1668 685 1436 749Z', '#729779');
  bg += ripples(98, 689, 1595, 279, '#dce5c6', 45);
  // Low single-arch stone bridge, with an open water arch and a slight crown.
  bg += p('M469 716Q762 486 1081 609L1236 671L1212 698Q901 539 533 741Z', '#87947b', 'stroke="#506b55" stroke-width="2"');
  bg += p('M516 714Q833 544 1160 681L1085 697Q849 602 632 733Z', '#c0bfa0');
  bg += p('M468 716L472 673Q772 453 1088 576L1244 637L1236 671L1080 610Q760 488 469 716Z', '#a9b296');
  bg += line('M480 670Q776 462 1086 584L1232 641M495 693Q783 488 1082 604L1214 658', '#dee0ba', 3, .7);
  bg += line('M517 646l-1 37M575 612v38M639 580l2 40M708 557l3 41M780 545l3 41M856 543l3 41M930 552l4 41M1001 570l4 40M1076 596l3 37M1148 623l2 37M1210 647v28', '#617963', 3, .66);
  bg += pine(181, 702, .86) + village(1675, 628, .68) + reeds(342, 770, .9);
  bg += p('M1414 785Q1469 806 1538 780L1520 798Q1463 817 1428 800Z', '#4e6750') + line('M1483 783L1479 719M1459 749L1506 749', '#607851', 2.7) + p('M1480 722L1482 779L1517 774Z', '#e4d7b3');
  const subject = scholar(843, 575, .32);
  const fg = p('M0 1040Q185 890 476 948Q673 952 796 1080H0Z', '#3a6150') + reeds(169, 970, 2, '#6d8c5d') + reeds(471, 978, 1.6, '#7e925d') + rocks(1838, 984, 2.03);
  return {bg, subject, fg};
}

function path(mode) {
  let bg = paper(mode);
  bg += cloud(1311, 336, 2.4, '#f1e9ca', .6);
  bg += mountain(mode, 'M456 606L572 499L622 528L777 377L867 438L939 368L1029 429L1155 332L1241 410L1322 387L1441 500L1514 453L1613 517L1793 386L1920 454V1080H0Z', false, .69);
  bg += mountain(mode, 'M0 488L103 460L183 326L265 383L369 277L416 349L435 521L518 622L475 800L545 1080H0Z', true);
  bg += brushwork(58, 375, 347, 333, '#c7c49b', .34);
  bg += p('M0 1055Q364 828 652 844Q907 830 955 749Q958 694 854 666Q783 638 849 613Q991 574 1116 548Q1093 573 941 614Q881 635 945 660Q1119 724 1080 790Q990 909 641 950Q394 1004 311 1080H0Z', paint(mode, 'road'));
  bg += line('M122 1031Q369 884 651 872Q958 832 989 751Q1002 698 894 659Q830 635 885 615L1098 553', '#e0d4a5', 3.2, .63);
  bg += mountain(mode, 'M1221 1080Q1118 913 1234 821L1361 732L1451 537L1523 512L1577 574L1649 434L1721 463L1796 669L1920 601V1080Z', true, .88);
  bg += brushwork(1461, 568, 432, 247, '#c6c599', .32);
  bg += pine(255, 561, 1.04) + pine(1582, 678, .84, true) + rocks(1082, 790, .69, true) + reeds(816, 866, .97, '#7e8657');
  bg += birds(1284, 401, .85);
  const subject = scholar(1012, 784, .59);
  const fg = p('M0 891L188 836L270 859L326 961L521 1006L558 1080H0Z', '#3b5642') + rocks(156, 925, 1.85, true) + reeds(1245, 987, 1.96, '#5b7044');
  return {bg, subject, fg};
}

function sunrise(mode) {
  let bg = paper(mode);
  bg += `<ellipse cx="663" cy="393" rx="820" ry="618" fill="${paint(mode, 'glow')}"/><circle cx="663" cy="394" r="91" fill="#f8d58d"/>`;
  bg += p('M572 456L15 974L621 984L704 469ZM698 440L1156 1038L1501 1045L739 427Z', '#fff2c8', 'opacity=".15"');
  bg += mountain(mode, 'M0 676L103 611L192 626L295 533L355 567L466 481L558 572L620 528L743 628L854 542L958 580L1060 511L1198 607L1329 534L1440 563L1557 446L1623 497L1766 412L1836 507L1920 472V1080H0Z', false, .63);
  bg += cloud(721, 574, 3.29, '#f4e6ba', .83);
  bg += mountain(mode, 'M0 773L135 682L271 709L408 634L571 730L701 683L817 751L968 617L1085 671L1234 580L1337 645L1443 559L1510 642L1613 565L1750 612L1920 513V1080H0Z', false, .94);
  bg += cloud(498, 734, 2.6, '#e7dbae', .53);
  bg += mountain(mode, 'M832 1080Q977 868 1124 816L1275 700L1377 726L1501 827L1661 794L1920 899V1080Z', true, .9);
  bg += p('M968 1063Q1108 886 1289 778Q1319 759 1366 758L1458 803Q1416 771 1364 737Q1328 719 1287 746Q1086 893 940 1080Z', paint(mode, 'road'), 'opacity=".76"');
  bg += brushwork(1510, 824, 398, 195, '#d6d0a0', .27) + pine(1655, 855, .95) + birds(951, 421, 1.16, '#7b8063');
  const subject = scholar(1352, 772, .46, -1, false, true);
  const fg = p('M0 953Q173 878 304 943L455 1080H0Z', '#52734f') + reeds(167, 999, 1.91, '#86905a') + rocks(1846, 966, 1.59, true);
  return {bg, subject, fg};
}

function sunset(mode) {
  let bg = paper(mode);
  bg += `<ellipse cx="1438" cy="378" rx="691" ry="563" fill="${paint(mode, 'glow')}"/><circle cx="1438" cy="378" r="78" fill="#bb6747" opacity=".88"/>`;
  bg += cloud(621, 311, 2.58, '#f1d5a5', .62) + cloud(1622, 420, 2.02, '#e5c89b', .47);
  bg += mountain(mode, 'M0 611L128 514L228 549L359 437L492 499L624 469L778 582L922 520L1059 590L1221 505L1370 543L1469 493L1620 541L1732 461L1835 501L1920 467V903H0Z', false, .63);
  bg += p('M0 623Q339 680 680 641Q973 606 1247 649Q1600 687 1920 611V1080H0Z', paint(mode, 'water'));
  let reflection = '';
  for (let i = 0; i < 17; i++) {
    const yy = 650 + i * 18, xx = 1438 - i * .6 + Math.sin(i * 2.7) * 9, half = 12 + i * 3.7;
    reflection += `M${xx - half} ${yy}q${half} -3 ${half * 2} 0l${-7 - i % 5} ${2 + i % 4}h${-half * 2 + 11}Z`;
  }
  bg += p(reflection, '#f8d092', 'opacity=".48"');
  bg += ripples(426, 659, 1340, 261, '#f3d6a2', 40);
  bg += p('M0 741Q217 697 389 743Q590 801 817 775L964 819Q540 886 206 839L0 858Z', '#77846a');
  bg += p('M0 814Q343 749 621 836Q778 880 1011 817Q955 869 731 912Q435 928 0 892Z', paint(mode, 'road'), 'transform="translate(0 -58)"');
  bg += pine(285, 811, 1.49, true) + reeds(147, 856, 1.2, '#99a064') + rocks(834, 804, .7, true);
  bg += p('M1486 762Q1544 790 1612 759L1590 779Q1534 799 1500 779Z', '#5c6148') + line('M1555 762L1551 681', '#726348', 3) + p('M1548 690L1547 753L1499 747Q1529 715 1548 690Z', '#e6cea0');
  bg += birds(1191, 354, 1.1, '#84785b');
  const subject = scholar(900, 796, .54, -1, false, true);
  const fg = p('M0 947Q291 903 546 986L663 1080H0Z', '#455b40') + reeds(616, 997, 1.89, '#768052') + reeds(1800, 1050, 2.9, '#637746');
  return {bg, subject, fg};
}

function lookback(mode) {
  let bg = paper(mode);
  bg += p('M0 194Q261 136 468 209Q731 154 943 237Q1055 310 1000 367Q921 397 902 435Q826 493 698 468Q456 520 209 489Q60 481 0 524Z', '#537779', 'opacity=".38"');
  bg += `<ellipse cx="1568" cy="382" rx="785" ry="548" fill="${paint(mode, 'glow')}"/>`;
  bg += mountain(mode, 'M0 655L119 540L211 583L313 422L408 478L491 388L597 481L681 447L794 579L916 507L1030 568L1181 442L1273 476L1416 374L1545 443L1654 374L1778 449L1920 395V1080H0Z', false, .73);
  bg += cloud(726, 584, 2.79, '#c8d2b9', .7);
  bg += mountain(mode, 'M0 781Q227 640 452 661Q600 708 715 664L855 575L953 632L1069 762Q1271 687 1498 623Q1735 583 1920 625V1080H0Z', true, .64);
  // The reverse S reads as the road already travelled; broad wet bends catch the sky.
  bg += p('M1153 1080Q1252 930 1252 863Q1241 793 1009 786Q727 766 613 706Q517 642 678 609Q822 578 847 559Q856 540 808 532Q893 530 884 557Q865 597 729 626Q624 650 697 683Q827 727 1080 723Q1378 731 1394 855Q1406 966 1281 1080Z', paint(mode, 'road'));
  bg += p('M1170 894Q1337 817 1157 777Q953 749 815 740L820 756Q1039 796 1162 803Q1282 826 1170 894Z', '#d2d6b6', 'opacity=".54"');
  bg += line('M1316 1012Q1452 781 1168 752Q884 752 685 697Q585 658 697 626Q845 590 867 558', '#e1ddbc', 2.2, .7);
  bg += ripples(1034, 787, 220, 92, '#e7e7c7', 10);
  bg += bamboo(192, 823, .86, false, true) + pine(1674, 814, 1.15) + rocks(1523, 834, 1.09) + brushwork(35, 690, 427, 192, '#b4c298', .23);
  const subject = scholar(1212, 790, .59, 1, true);
  const fg = p('M0 942Q290 818 435 898L611 1080H0Z', '#3d634c') + reeds(385, 936, 1.68, '#8b9b68') + p('M1635 1080Q1664 922 1811 858L1920 884V1080Z', '#345447');
  return {bg, subject, fg};
}

function horizon(mode) {
  let bg = paper(mode);
  bg += `<ellipse cx="974" cy="319" rx="958" ry="612" fill="${paint(mode, 'glow')}"/>`;
  bg += cloud(546, 332, 1.84, '#f2ecd1', .7) + cloud(1510, 375, 2.18, '#f0ebd0', .59);
  bg += mountain(mode, 'M0 652L147 589L266 617L398 542L497 574L651 493L747 557L882 520L994 581L1146 504L1268 548L1390 467L1470 520L1588 484L1708 558L1810 506L1920 558V1007H0Z', false, .57);
  bg += mountain(mode, 'M0 799L151 701L241 755L372 675L507 730L629 668L778 767L933 683L1039 736L1221 630L1311 691L1433 646L1592 735L1704 675L1920 730V1080H0Z', false, .8);
  bg += cloud(989, 768, 4.7, '#dee0c6', .62);
  bg += mountain(mode, 'M0 1080Q242 937 426 988L604 873L703 886L827 760L919 732L1019 754L1120 824L1231 877L1387 904L1510 967L1681 937L1920 1040V1080Z', true, .93);
  bg += p('M507 1080Q707 937 803 833Q873 771 913 770Q964 762 1001 786L1091 827Q1000 785 936 790Q866 804 811 874Q741 987 662 1080Z', paint(mode, 'road'), 'opacity=".73"');
  bg += line('M827 831Q884 777 931 778Q975 775 1013 798', '#e7d9a9', 2.4, .6);
  bg += pine(1362, 963, .88, true) + brushwork(1013, 835, 430, 228, '#c1c49a', .26) + birds(1063, 392, 1.01);
  const subject = scholar(939, 780, .49, 1, false, true);
  const fg = p('M0 1013L115 956L240 976L389 1080H0Z', '#436148') + reeds(275, 1051, 1.77, '#8b9960') + rocks(1802, 1038, 1.44, true);
  return {bg, subject, fg};
}

function returning(mode) {
  let bg = paper(mode);
  bg += `<ellipse cx="1326" cy="355" rx="784" ry="487" fill="${paint(mode, 'glow')}"/>`;
  bg += mountain(mode, 'M0 595L136 499L218 534L347 406L428 454L559 403L721 533L839 458L972 514L1103 403L1238 446L1394 342L1497 391L1597 341L1728 415L1845 369L1920 416V1080H0Z', false, .6);
  bg += cloud(1041, 533, 3.1, '#e9dfbd', .77);
  bg += p('M0 725Q305 613 591 670Q838 729 1046 643Q1357 567 1607 635Q1795 613 1920 631V1080H0Z', '#8c9a70');
  bg += p('M0 792Q295 704 569 752Q919 796 1093 698Q1300 640 1455 682L1481 719Q1200 704 1048 777Q899 851 594 827Q275 777 0 869Z', '#b6b287');
  bg += p('M0 966Q265 803 567 843Q823 866 1029 793Q1188 728 1366 724L1409 744Q1207 755 1063 830Q862 928 603 905Q305 878 173 1080H0Z', paint(mode, 'road'), 'transform="translate(0 -20)"');
  bg += group(line('M416 881Q803 922 1043 815Q1194 746 1352 737', '#eee0b1', 2, .61), 'translate(0 -20)');
  bg += village(1431, 689, 1.13) + pine(1092, 707, .57) + bamboo(1755, 760, .94, true) + pine(177, 771, .84);
  bg += p('M416 808Q688 773 927 814L894 829Q659 797 423 827Z', '#617d58') + line('M448 814Q676 790 893 816M557 810v11M688 807v13M815 813v11', '#a9b383', 2, .79);
  bg += p('M1526 622Q1539 591 1523 570Q1507 541 1526 519Q1513 553 1532 574Q1547 600 1526 622Z', '#e9ddbc', 'opacity=".66"');
  bg += reeds(681, 890, 1.02, '#878c51') + rocks(1656, 804, .94, true) + birds(1239, 341, .75, '#7b8160');
  const subject = scholar(1033, 789, .51, 1, false, true);
  const fg = p('M0 965Q255 910 432 993L551 1080H0Z', '#516948') + reeds(189, 976, 1.66, '#929554') + p('M1533 1080Q1629 945 1732 914L1920 913V1080Z', '#65784d') + reeds(1750, 954, 1.46, '#a7a363');
  return {bg, subject, fg};
}

const makers = {forest, 'rain-leaves': rainLeaves, storm, river, path, sunrise, sunset, lookback, horizon, return: returning};

function make(mode) {
  if (!modes.includes(mode)) throw new Error(`Unknown nature art mode: ${mode}`);
  const {bg, subject, fg} = makers[mode](mode);
  return {background: svg(defs(mode) + bg), subject: svg(subject), foreground: svg(fg)};
}

module.exports = {modes, make};
