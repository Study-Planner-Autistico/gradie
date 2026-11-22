import type { BoardItem, Pt, Stabilization, Stroke } from '../../state/whiteboard';

export type Rect = { x: number; y: number; w: number; h: number };

/** Finestra della media mobile per livello di stabilizzazione. */
const WINDOW: Record<Stabilization, number> = { 0: 0, 1: 2, 2: 5 };

/** Ammorbidisce il tratto con una media mobile; estremi invariati. */
export function stabilize(points: Pt[], level: Stabilization): Pt[] {
  const k = WINDOW[level];
  if (k === 0 || points.length < 3) return points;
  return points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return p;
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let j = Math.max(0, i - k); j <= Math.min(points.length - 1, i + k); j++) {
      sx += points[j].x;
      sy += points[j].y;
      n++;
    }
    return { x: sx / n, y: sy / n };
  });
}

/** Percorso SVG morbido: curve quadratiche tra i punti medi. */
export function pathD(points: Pt[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x} ${points[0].y} l0.01 0`;
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    d += ` Q${p.x} ${p.y} ${(p.x + q.x) / 2} ${(p.y + q.y) / 2}`;
  }
  const last = points[points.length - 1];
  return `${d} L${last.x} ${last.y}`;
}

/** Stile "pennello": contorno chiuso con spessore che si assottiglia agli estremi. */
export function brushOutline(points: Pt[], width: number): string {
  if (points.length < 3) return pathD(points);
  const left: Pt[] = [];
  const right: Pt[] = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const t = i / (n - 1);
    const half = (width * (0.25 + 0.75 * Math.sin(Math.PI * t))) / 2 + 0.3;
    const nx = (-dy / len) * half;
    const ny = (dx / len) * half;
    left.push({ x: points[i].x + nx, y: points[i].y + ny });
    right.push({ x: points[i].x - nx, y: points[i].y - ny });
  }
  const poly = [...left, ...right.reverse()];
  return `M${poly.map((p) => `${p.x} ${p.y}`).join(' L')} Z`;
}

export function dashArray(style: Stroke['style'], width: number): string | undefined {
  if (style === 'dashed') return `${width * 3} ${width * 2.2}`;
  if (style === 'dotted') return `0.1 ${width * 2}`;
  return undefined;
}

const TEXT_SIZE = 18;
export const textMetrics = { size: TEXT_SIZE, lineHeight: 24 };

/** Riquadro occupato da un elemento, in coordinate della lavagna. */
export function bounds(item: BoardItem): Rect {
  switch (item.kind) {
    case 'stroke': {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of item.points) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const h = item.width / 2;
      return { x: minX - h, y: minY - h, w: maxX - minX + item.width, h: maxY - minY + item.width };
    }
    case 'text': {
      const lines = item.text.split('\n');
      const longest = Math.max(1, ...lines.map((l) => l.length));
      return { x: item.x, y: item.y, w: longest * TEXT_SIZE * 0.55 + 8, h: lines.length * textMetrics.lineHeight + 4 };
    }
    case 'image':
      return { x: item.x, y: item.y, w: item.w, h: item.h };
    case 'sticker':
      return { x: item.x, y: item.y, w: item.size * 1.2, h: item.size * 1.2 };
    case 'note':
      return { x: item.x, y: item.y, w: item.w, h: Math.max(item.w * 0.8, 40 + item.text.split('\n').length * 20) };
    case 'audio':
      return { x: item.x, y: item.y, w: 44, h: 44 };
  }
}

export function intersects(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function contains(r: Rect, p: Pt) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

export function rectFrom(a: Pt, b: Pt): Rect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
}

export function union(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const r = Math.max(...rects.map((q) => q.x + q.w));
  const b = Math.max(...rects.map((q) => q.y + q.h));
  return { x, y, w: r - x, h: b - y };
}

function distToSegment(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Vero se il punto tocca il tratto (gomma). */
export function hitsStroke(s: Stroke, p: Pt, radius: number) {
  const r = radius + s.width / 2;
  if (s.points.length === 1) return Math.hypot(p.x - s.points[0].x, p.y - s.points[0].y) <= r;
  for (let i = 1; i < s.points.length; i++) if (distToSegment(p, s.points[i - 1], s.points[i]) <= r) return true;
  return false;
}

export function moveItem(item: BoardItem, dx: number, dy: number): BoardItem {
  if (item.kind === 'stroke') return { ...item, points: item.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
  return { ...item, x: item.x + dx, y: item.y + dy };
}
