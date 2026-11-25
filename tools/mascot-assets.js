// Nuovo logo e GIF della mascotte (dec. 201): toglie lo sfondo bianco, ridimensiona, ricrea GIF trasparenti.
// Uso: npm i --no-save omggif pngjs, poi node tools/mascot-assets.js (originali sul Desktop).
// Scrive solo assets/mascot e splash-icon.png: l'icona dell'app (icon.png, Android, favicon) resta quella di prima.
const fs = require('fs');
const path = require('path');
const { GifReader, GifWriter } = require('omggif');
const { PNG } = require('pngjs');

const DESK = 'C:/Users/mitho/Desktop';
const OUT = 'E:/Claude/Applicazione/Gradie/assets';

// Sfondo: pixel quasi bianchi e poco saturi collegati al bordo diventano trasparenti (riempimento dal bordo).
// Sfocatura 3x3 ripetuta: toglie la puntinatura (dithering) dei GIF originali.
function blur(src, w, h, times = 2) {
  let a = Buffer.from(src);
  for (let t = 0; t < times; t++) {
    const b = Buffer.from(a);
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++)
        for (let c = 0; c < 3; c++) {
          let s = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += a[((y + dy) * w + x + dx) * 4 + c];
          b[(y * w + x) * 4 + c] = s / 9;
        }
    a = b;
  }
  return a;
}

function clearBackground(src, w, h, thr = 246, times = 1) {
  const rgba = times ? blur(src, w, h, times) : Buffer.from(src);
  const isBg = (i) => Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) >= thr;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (!isBg(p * 4)) continue;
    rgba[p * 4 + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // Bordo morbido: i pixel chiari accanto alla trasparenza diventano semitrasparenti, così non resta l'alone bianco.
  const out = Buffer.from(rgba);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x, i = p * 4;
      if (!rgba[i + 3]) continue;
      if (!(rgba[i - 1] === 0 || rgba[i + 7] === 0 || rgba[i - w * 4 + 3] === 0 || rgba[i + w * 4 + 3] === 0)) continue;
      const light = (rgba[i] + rgba[i + 1] + rgba[i + 2]) / 3;
      if (light > 235) out[i + 3] = Math.round(255 * Math.max(0, (255 - light) / 20));
    }
  // Macchioline isolate (resti della puntinatura): via i gruppi di meno di 120 pixel.
  const lab = new Int32Array(w * h).fill(-1);
  for (let p0 = 0; p0 < w * h; p0++) {
    if (lab[p0] !== -1 || !out[p0 * 4 + 3]) continue;
    const comp = [p0];
    lab[p0] = p0;
    for (let k = 0; k < comp.length; k++) {
      const p = comp[k], x = p % w, y = (p / w) | 0;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1])
        if (q >= 0 && lab[q] === -1 && out[q * 4 + 3]) { lab[q] = p0; comp.push(q); }
    }
    if (comp.length < 120) for (const p of comp) out[p * 4 + 3] = 0;
  }
  // Le righe e colonne del bordo non sono sfocate: sempre trasparenti (sono sfondo).
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (x < 3 || y < 3 || x >= w - 3 || y >= h - 3) out[(y * w + x) * 4 + 3] = 0;
  return out;
}

// Riduzione con media a scatola, premoltiplicata per l'alfa.
function resize(src, sw, sh, dw, dh) {
  const dst = Buffer.alloc(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const y0 = (y * sh) / dh, y1 = ((y + 1) * sh) / dh;
    for (let x = 0; x < dw; x++) {
      const x0 = (x * sw) / dw, x1 = ((x + 1) * sw) / dw;
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = Math.floor(y0); yy < Math.ceil(y1); yy++)
        for (let xx = Math.floor(x0); xx < Math.ceil(x1); xx++) {
          const i = (yy * sw + xx) * 4, al = src[i + 3];
          r += src[i] * al; g += src[i + 1] * al; b += src[i + 2] * al; a += al; n++;
        }
      const o = (y * dw + x) * 4;
      if (a) { dst[o] = r / a; dst[o + 1] = g / a; dst[o + 2] = b / a; }
      dst[o + 3] = a / n;
    }
  }
  return dst;
}

// Ritaglio quadrato attorno al contenuto (alfa > 0) con un margine, comune a tutti i fotogrammi.
function bounds(frames, w, h) {
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (const f of frames)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (f[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const side = Math.max(x1 - x0, y1 - y0) + 12;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return { x: Math.round(cx - side / 2), y: Math.round(cy - side / 2), side };
}
function crop(src, w, h, b) {
  const dst = Buffer.alloc(b.side * b.side * 4);
  for (let y = 0; y < b.side; y++)
    for (let x = 0; x < b.side; x++) {
      const sx = b.x + x, sy = b.y + y;
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      src.copy(dst, (y * b.side + x) * 4, (sy * w + sx) * 4, (sy * w + sx) * 4 + 4);
    }
  return dst;
}

// Tavolozza comune (taglio mediano) da 255 colori + 1 trasparente.
function palette(frames, size = 255) {
  const counts = new Map();
  for (const f of frames)
    for (let i = 0; i < f.length; i += 4) {
      if (f[i + 3] < 128) continue;
      const k = ((f[i] >> 2) << 12) | ((f[i + 1] >> 2) << 6) | (f[i + 2] >> 2);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  const cols = [...counts].map(([k, n]) => ({ c: [((k >> 12) & 63) * 4 + 2, ((k >> 6) & 63) * 4 + 2, (k & 63) * 4 + 2], n }));
  let boxes = [cols];
  while (boxes.length < size) {
    let bi = -1, best = -1, ch = 0;
    boxes.forEach((bx, j) => {
      if (bx.length < 2) return;
      for (let c = 0; c < 3; c++) {
        let lo = 255, hi = 0;
        for (const p of bx) { lo = Math.min(lo, p.c[c]); hi = Math.max(hi, p.c[c]); }
        const score = (hi - lo) * Math.log(1 + bx.reduce((s, p) => s + p.n, 0));
        if (score > best) { best = score; bi = j; ch = c; }
      }
    });
    if (bi < 0) break;
    const bx = boxes[bi].sort((a, b) => a.c[ch] - b.c[ch]);
    const total = bx.reduce((s, p) => s + p.n, 0);
    let acc = 0, cut = 1;
    for (; cut < bx.length - 1; cut++) { acc += bx[cut - 1].n; if (acc >= total / 2) break; }
    boxes.splice(bi, 1, bx.slice(0, cut), bx.slice(cut));
  }
  return boxes.map((bx) => {
    const t = bx.reduce((s, p) => s + p.n, 0);
    return [0, 1, 2].map((c) => Math.round(bx.reduce((s, p) => s + p.c[c] * p.n, 0) / t));
  });
}

function toIndexed(f, pal, cache) {
  const idx = new Uint8Array(f.length / 4);
  for (let p = 0; p < idx.length; p++) {
    const i = p * 4;
    if (f[i + 3] < 128) { idx[p] = 255; continue; }
    const k = (f[i] << 16) | (f[i + 1] << 8) | f[i + 2];
    let v = cache.get(k);
    if (v === undefined) {
      let bd = 1e9;
      pal.forEach((c, j) => {
        const d = (c[0] - f[i]) ** 2 + (c[1] - f[i + 1]) ** 2 + (c[2] - f[i + 2]) ** 2;
        if (d < bd) { bd = d; v = j; }
      });
      cache.set(k, v);
    }
    idx[p] = v;
  }
  return idx;
}

function writePng(file, rgba, w, h, opaqueBg) {
  const png = new PNG({ width: w, height: h, colorType: opaqueBg ? 2 : 6 });
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, a = rgba[i + 3] / 255;
    if (opaqueBg) {
      png.data[i] = rgba[i] * a + opaqueBg[0] * (1 - a);
      png.data[i + 1] = rgba[i + 1] * a + opaqueBg[1] * (1 - a);
      png.data[i + 2] = rgba[i + 2] * a + opaqueBg[2] * (1 - a);
      png.data[i + 3] = 255;
    } else rgba.copy(png.data, i, i, i + 4);
  }
  fs.writeFileSync(file, PNG.sync.write(png, opaqueBg ? { colorType: 2 } : {}));
}

function gif(name, outName, size) {
  const buf = fs.readFileSync(path.join(DESK, name));
  const r = new GifReader(buf);
  const w = r.width, h = r.height;
  const frames = [];
  const canvas = Buffer.alloc(w * h * 4);
  let delay = 4;
  for (let k = 0; k < r.numFrames(); k++) {
    r.decodeAndBlitFrameRGBA(k, canvas);
    delay = r.frameInfo(k).delay || delay;
    frames.push(clearBackground(Buffer.from(canvas), w, h));
  }
  const b = bounds(frames, w, h);
  const small = frames.map((f) => resize(crop(f, w, h, b), b.side, b.side, size, size));
  const pal = palette(small);
  const flat = new Array(256).fill(0);
  pal.forEach((c, j) => (flat[j] = (c[0] << 16) | (c[1] << 8) | c[2]));
  const out = Buffer.alloc(size * size * small.length + 4096 * small.length);
  const wr = new GifWriter(out, size, size, { palette: flat, loop: 0 });
  const cache = new Map();
  for (const f of small) wr.addFrame(0, 0, size, size, toIndexed(f, pal, cache), { delay, transparent: 255, disposal: 2 });
  fs.writeFileSync(path.join(OUT, 'mascot', outName + '.gif'), out.subarray(0, wr.end()));
  // Primo fotogramma fermo, per "Riduci movimento".
  writePng(path.join(OUT, 'mascot', outName + '-still.png'), small[0], size, size);
  console.log(outName, r.numFrames(), 'fotogrammi', 'delay', delay, (wr.end() / 1024).toFixed(0) + ' KB', 'crop', b);
}

fs.mkdirSync(path.join(OUT, 'mascot'), { recursive: true });
gif('Gradie-dorme.gif', 'gradie-dorme', 300);
gif('Gradie-stelline-dinamiche.gif', 'gradie-stelline', 300);

// Logo: sfondo tolto, poi icone.
const L = PNG.sync.read(fs.readFileSync(path.join(DESK, 'Mascotte nuvola con cappello dorato e scintille.png')));
const lw = L.width, lh = L.height;
let logo = clearBackground(Buffer.from(L.data), lw, lh, 251, 0);
const lb = bounds([logo], lw, lh);
logo = crop(logo, lw, lh, lb);
const LS = lb.side;
const at = (s) => resize(logo, LS, LS, s, s);
writePng(path.join(OUT, 'mascot', 'gradie-logo.png'), at(512), 512, 512);
writePng(path.join(OUT, 'splash-icon.png'), at(512), 512, 512);
console.log('logo crop', lb);
