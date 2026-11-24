import type { BoardItem, Pt, ShapeKind, Stabilization, Stroke } from '../../state/whiteboard';

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
    // La pressione resta quella del punto: la media la appiattirebbe.
    return p.p === undefined ? { x: sx / n, y: sy / n } : { x: sx / n, y: sy / n, p: p.p };
  });
}

/** Percorso SVG morbido: curve quadratiche tra i punti medi. */
export function pathD(points: Pt[]): string {
  'worklet';
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
  'worklet';
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

/**
 * Tratto a pressione (dec. 166): contorno pieno che si allarga dove si preme di più, con estremi arrotondati.
 * A pressione media (0.5) lo spessore è quello scelto. Gira anche sul thread dell'interfaccia (tratto dal vivo).
 */
export function pressureOutline(points: Pt[], width: number): string {
  'worklet';
  const n = points.length;
  const half = (i: number) => {
    // Pressione ammorbidita sui vicini: la Pencil la manda a scatti.
    let s = 0;
    let c = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(n - 1, i + 2); j++) {
      s += points[j].p ?? 0.5;
      c++;
    }
    return Math.max(0.4, (width * (0.4 + 1.2 * (s / c))) / 2);
  };
  if (n === 0) return '';
  if (n === 1 || Math.hypot(points[n - 1].x - points[0].x, points[n - 1].y - points[0].y) < 0.5) {
    const r = half(0);
    const { x, y } = points[0];
    return `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  }
  const left: Pt[] = [];
  const right: Pt[] = [];
  const radii: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const r = half(i);
    radii.push(r);
    const nx = (-(b.y - a.y) / len) * r;
    const ny = ((b.x - a.x) / len) * r;
    left.push({ x: points[i].x + nx, y: points[i].y + ny });
    right.push({ x: points[i].x - nx, y: points[i].y - ny });
  }
  // Lati morbidi: curve tra i punti medi, come pathD.
  const side = (pts: Pt[]) => {
    let d = '';
    for (let i = 1; i < pts.length - 1; i++) d += ` Q${pts[i].x} ${pts[i].y} ${(pts[i].x + pts[i + 1].x) / 2} ${(pts[i].y + pts[i + 1].y) / 2}`;
    const last = pts[pts.length - 1];
    return `${d} L${last.x} ${last.y}`;
  };
  right.reverse();
  const re = radii[n - 1];
  const rs = radii[0];
  return `M${left[0].x} ${left[0].y}${side(left)} A${re} ${re} 0 0 0 ${right[0].x} ${right[0].y}${side(right)} A${rs} ${rs} 0 0 0 ${left[0].x} ${left[0].y} Z`;
}

/** Forma di un tratto: contorno pieno (pennello, pressione) o linea da tracciare. Stessa resa su schermo, anteprime e PDF. */
export function strokeGeometry(points: Pt[], tool: Stroke['tool'], style: Stroke['style'], width: number): { d: string; filled: boolean } {
  'worklet';
  if (style === 'brush') return { d: brushOutline(points, width * 1.6), filled: true };
  if (style === 'solid' && tool !== 'highlighter' && points.length > 0 && points[0].p !== undefined) return { d: pressureOutline(points, width), filled: true };
  return { d: pathD(points), filled: false };
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
    case 'shape': {
      const pad = item.strokeWidth / 2 + (item.shape === 'arrow' ? 8 : 0);
      const r = rectFrom({ x: item.x, y: item.y }, { x: item.x + item.w, y: item.y + item.h });
      return { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };
    }
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
  if (item.kind === 'stroke') return { ...item, points: item.points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) };
  return { ...item, x: item.x + dx, y: item.y + dy };
}

/** Infittisce i punti perché la gomma possa tagliare anche i segmenti lunghi (linee dritte). */
function densify(points: Pt[], step: number): Pt[] {
  if (points.length < 2) return points;
  const out: Pt[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step);
    for (let k = 1; k <= n; k++) {
      const q: Pt = { x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n };
      if (a.p !== undefined && b.p !== undefined) q.p = a.p + ((b.p - a.p) * k) / n;
      out.push(q);
    }
  }
  return out;
}

/** Gomma: toglie solo la parte di tratto sotto la gomma, dividendo il tratto in pezzi. */
export function eraseStroke(s: Stroke, p: Pt, radius: number, makeId: () => string): Stroke[] {
  if (!hitsStroke(s, p, radius)) return [s];
  const r = radius + s.width / 2;
  const pieces: Pt[][] = [];
  let run: Pt[] = [];
  for (const q of densify(s.points, 2)) {
    if (Math.hypot(q.x - p.x, q.y - p.y) <= r) {
      if (run.length > 1) pieces.push(run);
      run = [];
    } else run.push(q);
  }
  if (run.length > 1) pieces.push(run);
  return pieces.map((points, i) => ({ ...s, id: i === 0 ? s.id : makeId(), points }));
}

export function pointInPolygon(p: Pt, poly: Pt[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Selezione libera: basta che una parte dell'elemento sia dentro il contorno. */
export function inLasso(item: BoardItem, poly: Pt[]) {
  if (poly.length < 3) return false;
  if (item.kind === 'stroke') return item.points.some((q) => pointInPolygon(q, poly));
  const b = bounds(item);
  const probes = [
    { x: b.x, y: b.y },
    { x: b.x + b.w, y: b.y },
    { x: b.x, y: b.y + b.h },
    { x: b.x + b.w, y: b.y + b.h },
    { x: b.x + b.w / 2, y: b.y + b.h / 2 },
  ];
  return probes.some((q) => pointInPolygon(q, poly)) || poly.some((q) => contains(b, q));
}

/** Punti del contorno di una forma chiusa, inscritta nel rettangolo. */
export function shapePoints(shape: ShapeKind, r: Rect): Pt[] {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const regular = (n: number, start: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = start + (i * 2 * Math.PI) / n;
      return { x: cx + (r.w / 2) * Math.cos(a), y: cy + (r.h / 2) * Math.sin(a) };
    });
  switch (shape) {
    case 'triangle':
      return [{ x: cx, y: r.y }, { x: r.x + r.w, y: r.y + r.h }, { x: r.x, y: r.y + r.h }];
    case 'rhombus':
      return [{ x: cx, y: r.y }, { x: r.x + r.w, y: cy }, { x: cx, y: r.y + r.h }, { x: r.x, y: cy }];
    case 'hexagon':
      return regular(6, 0);
    case 'octagon':
      return regular(8, Math.PI / 8);
    case 'decagon':
      return regular(10, 0);
    case 'star':
      return Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const k = i % 2 === 0 ? 1 : 0.42;
        return { x: cx + (r.w / 2) * k * Math.cos(a), y: cy + (r.h / 2) * k * Math.sin(a) };
      });
    default:
      return [];
  }
}

/** Righello (dec. 111): 1 cm in punti dello schermo (riferimento 160 punti per pollice). */
export const CM = 160 / 2.54;
export type Ruler = { cx: number; cy: number; angle: number; length: number; thickness: number };

/** Proietta p sul bordo del righello più vicino; null se p è lontano dal righello. */
export function snapToRuler(p: Pt, r: Ruler, reach = 28): Pt | null {
  const ux = Math.cos(r.angle);
  const uy = Math.sin(r.angle);
  const dx = p.x - r.cx;
  const dy = p.y - r.cy;
  const along = dx * ux + dy * uy;
  const across = -dx * uy + dy * ux;
  if (Math.abs(along) > r.length / 2) return null;
  const half = r.thickness / 2;
  const dist = Math.abs(across) - half;
  if (dist < -half + 6 || dist > reach) return null;
  const edge = across < 0 ? -half : half;
  return { x: r.cx + along * ux - edge * uy, y: r.cy + along * uy + edge * ux };
}

/** Vero se p cade sul corpo del righello (per spostarlo o ruotarlo). */
export function onRuler(p: Pt, r: Ruler) {
  const dx = p.x - r.cx;
  const dy = p.y - r.cy;
  const along = dx * Math.cos(r.angle) + dy * Math.sin(r.angle);
  const across = -dx * Math.sin(r.angle) + dy * Math.cos(r.angle);
  return Math.abs(along) <= r.length / 2 && Math.abs(across) <= r.thickness / 2 - 6;
}

/** Proiezione di p sulla retta del bordo indicato dal punto 'anchor' (già sul bordo). */
export function projectOnEdge(p: Pt, anchor: Pt, r: Ruler): Pt {
  const ux = Math.cos(r.angle);
  const uy = Math.sin(r.angle);
  const t = (p.x - anchor.x) * ux + (p.y - anchor.y) * uy;
  return { x: anchor.x + t * ux, y: anchor.y + t * uy };
}
