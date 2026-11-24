// Scarica (dec. 113): esporta le note in PDF, un foglio PDF per ogni foglio della nota (dec. 116).
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { BoardItem, NoteMeta, Paper, ShapeItem } from '../../state/whiteboard';
import { ink, paperLines } from '../../theme';
import { bounds, brushOutline, dashArray, pathD, rectFrom, shapePoints, textMetrics, union, type Rect } from './geometry';
import { LINE_GAP, MARGIN_X, pageCount, pageSize } from './Paper';

export type ExportNote = { title: string; items: BoardItem[]; meta?: NoteMeta };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function paperSvg(p: Paper, r: Rect): string {
  const c = p.dark ? paperLines.dark : paperLines.light;
  const out: string[] = [`<rect x="0" y="0" width="${r.w}" height="${r.h}" fill="${p.color}"/>`];
  const hLines = (gap: number) => {
    for (let y = gap; y < r.h; y += gap) out.push(`<line x1="0" y1="${y}" x2="${r.w}" y2="${y}" stroke="${c}"/>`);
  };
  const vLines = (gap: number) => {
    for (let x = gap; x < r.w; x += gap) out.push(`<line x1="${x}" y1="0" x2="${x}" y2="${r.h}" stroke="${c}"/>`);
  };
  switch (p.template) {
    case 'lined':
    case 'margin':
    case 'cornell':
      hLines(LINE_GAP);
      break;
    case 'narrow':
      hLines(20);
      break;
    case 'wide':
      hLines(38);
      break;
    case 'grid':
      hLines(LINE_GAP);
      vLines(LINE_GAP);
      break;
    case 'smallGrid':
      hLines(16);
      vLines(16);
      break;
    case 'dots':
      for (let y = LINE_GAP / 2; y < r.h; y += LINE_GAP)
        for (let x = LINE_GAP / 2; x < r.w; x += LINE_GAP) out.push(`<circle cx="${x}" cy="${y}" r="1.3" fill="${c}"/>`);
      break;
    case 'music':
      for (let top = 78 - 12; top < r.h; top += 78) for (let k = 0; k < 5; k++) out.push(`<line x1="0" y1="${top - k * 8}" x2="${r.w}" y2="${top - k * 8}" stroke="${c}"/>`);
      break;
  }
  if (p.template === 'margin') out.push(`<line x1="${MARGIN_X}" y1="0" x2="${MARGIN_X}" y2="${r.h}" stroke="${paperLines.margin}"/>`);
  if (p.template === 'cornell') {
    out.push(`<line x1="110" y1="0" x2="110" y2="${r.h * 0.78}" stroke="${paperLines.margin}"/>`);
    out.push(`<line x1="0" y1="${r.h * 0.78}" x2="${r.w}" y2="${r.h * 0.78}" stroke="${paperLines.margin}"/>`);
  }
  return out.join('');
}

function shapeSvg(s: ShapeItem): string {
  const st = `stroke="${s.stroke}" stroke-width="${s.strokeWidth}" stroke-linejoin="round"`;
  if (s.shape === 'line' || s.shape === 'arrow') {
    const x2 = s.x + s.w;
    const y2 = s.y + s.h;
    const a = Math.atan2(s.h, s.w);
    const head = Math.max(10, s.strokeWidth * 4);
    const line = `<line x1="${s.x}" y1="${s.y}" x2="${x2}" y2="${y2}" ${st} stroke-linecap="round"/>`;
    if (s.shape === 'line') return line;
    const p1 = `${x2 - head * Math.cos(a - 0.45)},${y2 - head * Math.sin(a - 0.45)}`;
    const p2 = `${x2 - head * Math.cos(a + 0.45)},${y2 - head * Math.sin(a + 0.45)}`;
    return `${line}<polygon points="${x2},${y2} ${p1} ${p2}" fill="${s.stroke}" ${st}/>`;
  }
  const r = rectFrom({ x: s.x, y: s.y }, { x: s.x + s.w, y: s.y + s.h });
  const fill = s.fill ?? 'none';
  let body: string;
  if (s.shape === 'square') body = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${fill}" ${st}/>`;
  else if (s.shape === 'circle') body = `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" fill="${fill}" ${st}/>`;
  else body = `<polygon points="${shapePoints(s.shape, r).map((p) => `${p.x},${p.y}`).join(' ')}" fill="${fill}" ${st}/>`;
  const text = s.text ? `<text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 5}" font-size="15" text-anchor="middle" fill="${s.stroke}">${esc(s.text)}</text>` : '';
  return body + text;
}

function itemSvg(i: BoardItem): string {
  switch (i.kind) {
    case 'stroke': {
      const op = i.tool === 'highlighter' ? ink.highlighterOpacity : i.tool === 'pencil' ? ink.pencilOpacity : 1;
      if (i.style === 'brush') return `<path d="${brushOutline(i.points, i.width * 1.6)}" fill="${i.color}" opacity="${op}"/>`;
      const dash = dashArray(i.style, i.width);
      const cap = i.tool === 'highlighter' && i.style === 'solid' ? 'butt' : 'round';
      return `<path d="${pathD(i.points)}" fill="none" stroke="${i.color}" stroke-width="${i.width}" stroke-linecap="${cap}" stroke-linejoin="round" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
    }
    case 'text':
      return i.text
        .split('\n')
        .map((l, k) => `<text x="${i.x}" y="${i.y + textMetrics.size + k * textMetrics.lineHeight}" font-size="${textMetrics.size}" fill="${i.color}">${esc(l)}</text>`)
        .join('');
    case 'sticker':
      return `<text x="${i.x}" y="${i.y + i.size}" font-size="${i.size}">${esc(i.emoji)}</text>`;
    case 'note': {
      const b = bounds(i);
      const lines = i.text.split('\n').map((l, k) => `<text x="${b.x + 10}" y="${b.y + 26 + k * 20}" font-size="15" fill="${ink.onSticky}">${esc(l)}</text>`);
      return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6" fill="${ink.sticky}"/>${lines.join('')}`;
    }
    case 'image':
      return `<image href="${esc(i.uri)}" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" preserveAspectRatio="xMidYMid slice"/>`;
    case 'shape':
      return shapeSvg(i);
    case 'audio':
      return `<circle cx="${i.x + 22}" cy="${i.y + 22}" r="22" fill="${ink.selection}"/><text x="${i.x + 22}" y="${i.y + 29}" font-size="20" text-anchor="middle" fill="#fff">♪</text>`;
  }
}

/** Una o più pagine SVG della nota: con la carta, un foglio PDF per ogni foglio della nota (dec. 116). */
function noteSvgs(n: ExportNote): string[] {
  const highlights = n.items.filter((i) => i.kind === 'stroke' && i.tool === 'highlighter');
  const rest = n.items.filter((i) => !(i.kind === 'stroke' && i.tool === 'highlighter'));
  const ink = [...highlights, ...rest].map(itemSvg).join('');
  const svg = (area: Rect, bg: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${area.x} ${area.y} ${area.w} ${area.h}" style="width:100%;max-height:92vh"><g transform="translate(${area.x} ${area.y})">${bg}</g>${ink}</svg>`;
  if (n.meta) {
    const paper = n.meta.paper;
    const size = pageSize(paper);
    return Array.from({ length: pageCount(paper, n.items) }, (_, k) => {
      const area = { x: 0, y: k * size.h, w: size.w, h: size.h };
      return svg(area, paperSvg(paper, { x: 0, y: 0, w: size.w, h: size.h }));
    });
  }
  const content = union(n.items.map(bounds));
  const area: Rect = content ? { x: content.x - 20, y: content.y - 20, w: content.w + 40, h: content.h + 40 } : { x: 0, y: 0, w: 380, h: 537 };
  return [svg(area, `<rect x="0" y="0" width="${area.w}" height="${area.h}" fill="#FFFFFF"/>`)];
}

/** Prima pagina del quaderno esportato (dec. 145): nome e indice dei fogli. */
function titlePage(title: string, notes: ExportNote[]) {
  const list = notes.map((n) => `<li style="margin:4px 0">${esc(n.title)}</li>`).join('');
  return `<h1 style="font:700 28px -apple-system,Helvetica,sans-serif;margin:0 0 16px">${esc(title)}</h1><ol style="font:400 15px -apple-system,Helvetica,sans-serif;padding-left:20px">${list}</ol>`;
}

function html(notes: ExportNote[], title?: string) {
  const cover = title ? [titlePage(title, notes)] : [];
  const sheets = [...cover, ...notes.flatMap((n) =>
    noteSvgs(n).map((svg, k) => `${k === 0 ? `<h2 style="font:600 16px -apple-system,Helvetica,sans-serif;margin:0 0 8px">${esc(n.title)}</h2>` : ''}${svg}`),
  )];
  const pages = sheets.map((s, k) => `<section style="${k < sheets.length - 1 ? 'page-break-after:always;' : ''}">${s}</section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:24px">${pages}</body></html>`;
}

/**
 * Crea il PDF e lo apre nel foglio di condivisione (sul web: finestra di stampa, da cui si salva in PDF).
 * Con `title` (un quaderno intero, dec. 145) la prima pagina ha il nome e l'indice dei fogli.
 */
export async function downloadNotes(notes: ExportNote[], title?: string) {
  const doc = html(notes, title);
  if (Platform.OS === 'web') return Print.printAsync({ html: doc });
  const { uri } = await Print.printToFileAsync({ html: doc });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}
