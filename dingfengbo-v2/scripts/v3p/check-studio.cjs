#!/usr/bin/env node
'use strict';

// Verify the actual Studio page with the installed headless Chromium.
// Example: node scripts/v3p/check-studio.cjs --composition DingFengBoV3Pulse
const fs = require('node:fs');
const path = require('node:path');
const {openBrowser} = require('@remotion/renderer');
const root = path.resolve(__dirname, '../..');

(async () => {
  let base = 'http://localhost:3002', composition = 'DingFengBoV3Pulse', frame = 90;
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url') base = argv[++i];
    else if (argv[i] === '--composition') composition = argv[++i];
    else if (argv[i] === '--frame') frame = Number(argv[++i]);
    else throw new Error(`Unknown option ${argv[i]}`);
  }
  if (!Number.isInteger(frame) || frame < 0 || frame >= 3600) throw new Error('--frame must be 0–3599');
  const url = new URL(composition ? encodeURIComponent(composition) : '', base.endsWith('/') ? base : base + '/');
  url.searchParams.set('frame', String(frame));
  const out = path.join(root, 'out/v3p');
  fs.mkdirSync(out, {recursive: true});
  const name = 'studio-' + (composition || 'home').replace(/[^a-z0-9_-]/gi, '_');
  const report = {url: url.href, composition, requestedFrame: frame, status: 'running', createdAt: new Date().toISOString()};
  let browser;
  try {
    browser = await openBrowser('chrome', {browserExecutable: path.join(root, 'scripts/chromium-cpu-raster.sh'), chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
    const page = await browser.newPage({context: () => null, logLevel: 'error', indent: false, pageIndex: 0, onBrowserLog: null, onLog: () => {}});
    await page.setViewport({width: 1600, height: 1000, deviceScaleFactor: 1});
    await page.goto({url: url.href, timeout: 60000});
    report.page = await page.evaluate(async ({expected, target}) => {
      const start = performance.now();
      while (performance.now() - start < 20000) {
        const text = document.body?.innerText || '';
        if (text.length > 80 && (!expected || document.querySelector('svg[viewBox="0 0 1920 1080"]'))) break;
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      let frameSet = false;
      if (expected && document.querySelector('svg[viewBox="0 0 1920 1080"]')) {
        if (typeof window.remotion_setFrame !== 'function') throw new Error('Studio frame-control API is unavailable');
        window.remotion_setFrame(target, expected, 1);
        frameSet = true;
      }
      await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 10000))]);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const references = [...new Set([...document.querySelectorAll('svg[viewBox="0 0 1920 1080"] image')]
        .map(node => node.getAttribute('href') || node.getAttribute('xlink:href')).filter(Boolean))];
      const images = await Promise.all(references.map(async reference => {
        const img = new Image();
        img.src = reference;
        let timer;
        try {
          await Promise.race([img.decode(), new Promise((_, reject) => {timer = setTimeout(() => reject(new Error('Image decode timeout')), 10000);})]);
          return {reference: reference.slice(0, 240), decoded: true, width: img.naturalWidth, height: img.naturalHeight};
        } catch (error) { return {reference: reference.slice(0, 240), decoded: false, error: String(error)}; }
        finally { clearTimeout(timer); }
      }));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {title: document.title, location: location.href, frameSet, text: document.body?.innerText.slice(0, 6000), svgCount: document.querySelectorAll('svg').length,
        frameSvgCount: document.querySelectorAll('svg[viewBox="0 0 1920 1080"]').length, images, fontStatus: document.fonts.status,
        serifLoaded: document.fonts.check('48px "Noto Serif CJK SC"'), sansLoaded: document.fonts.check('48px "Noto Sans CJK SC"')};
    }, {expected: composition, target: frame});
    const shot = await page._client().send('Page.captureScreenshot', {format: 'png'});
    report.screenshot = path.join(out, name + '.png');
    fs.writeFileSync(report.screenshot, Buffer.from(shot.value.data, 'base64'));
    if (!report.page.location.startsWith(new URL(base).origin + '/')) throw new Error('Browser did not reach the requested Studio origin');
    if (!report.page.text || report.page.text.length < 80) throw new Error('Studio page did not mount');
    if (composition && report.page.frameSvgCount < 1) throw new Error('Requested SVG composition did not appear; inspect screenshot and page text');
    if (report.page.images.some(asset => !asset.decoded)) throw new Error(`Studio SVG image decode failed: ${JSON.stringify(report.page.images.filter(asset => !asset.decoded))}`);
    report.status = 'passed';
    console.log(JSON.stringify({status: report.status, url: report.url, svgFrames: report.page.frameSvgCount, screenshot: report.screenshot}));
  } catch (error) {
    report.status = 'failed'; report.error = error.stack || String(error);
    throw error;
  } finally {
    if (browser) await browser.close({silent: true});
    fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify(report, null, 2) + '\n');
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
