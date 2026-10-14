'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const xmlEscape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function atomicJson(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

function renderer(bundle, root) {
  const {FrameSvg} = require(bundle);
  if (typeof FrameSvg !== 'function') throw new Error(`${bundle} must export FrameSvg({frame, fps})`);
  const images = new Map();
  const mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp'};
  function inlineImage(reference) {
    if (reference.startsWith('data:') || reference.startsWith('#')) return reference;
    if (/^[a-z]+:/i.test(reference) || reference.startsWith('//')) throw new Error(`External image must be embedded locally: ${reference}`);
    const decoded = reference.replace(/&amp;/g, '&');
    const file = path.resolve(root, 'public', decoded.replace(/^\/+/, ''));
    if (!file.startsWith(path.resolve(root, 'public') + path.sep)) throw new Error(`Image escapes public/: ${reference}`);
    if (!images.has(file)) {
      const type = mime[path.extname(file).toLowerCase()];
      if (!type) throw new Error(`Unsupported image type: ${reference}`);
      images.set(file, `data:${type};base64,${fs.readFileSync(file).toString('base64')}`);
    }
    return images.get(file);
  }
  return (frame) => {
    let svg = renderToStaticMarkup(React.createElement(FrameSvg, {frame, fps: FPS}));
    if (!/^<svg\b/.test(svg)) throw new Error('FrameSvg must return a single root <svg>');
    if (/<foreignObject\b|<script\b|@import\b/i.test(svg)) throw new Error('Native frames must use SVG nodes, without foreignObject, script or external stylesheets');
    svg = svg.replace(/(<image\b[^>]*?\s(?:href|xlink:href)=")([^"]+)(")/g, (_, before, reference, after) => before + inlineImage(reference) + after);
    return svg;
  };
}

module.exports = {WIDTH, HEIGHT, FPS, hash, xmlEscape, atomicJson, renderer};
