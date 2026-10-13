const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill}=require('@remotion/renderer');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
 const browser=await openBrowser('chrome',{browserExecutable:'/usr/bin/chromium'});
 const composition=await selectComposition({serveUrl,id:'DingFengBo',puppeteerInstance:browser});
 const requested=process.argv.slice(2).map(Number);
 const frames=requested.length?requested:[30,84,153,252,369,540,681,795,1005,1140,1305,1449,1581,1794,1890,2040,2184,2319,2541,2733,3000,3201,3360,3555];
 fs.mkdirSync('out/review',{recursive:true});
 let index=0;
 async function worker(){while(index<frames.length){const frame=frames[index++];await renderStill({serveUrl,composition,puppeteerInstance:browser,output:`out/review/frame-${String(frame).padStart(4,'0')}.jpg`,frame,imageFormat:'jpeg',scale:.5});console.log(`Reviewed frame ${frame}`)}}
 await Promise.all([worker(),worker()]);
 await browser.close({silent:true});
})();
