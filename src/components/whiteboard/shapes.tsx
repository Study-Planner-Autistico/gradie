import { Ellipse, G, Line, Polygon, Rect } from 'react-native-svg';
import type { ShapeItem, ShapeKind } from '../../state/whiteboard';
import { rectFrom, shapePoints } from './geometry';

/** Forme nell'ordine della dec. 111. */
export const SHAPES: ShapeKind[] = ['arrow', 'line', 'square', 'circle', 'triangle', 'star', 'rhombus', 'hexagon', 'octagon', 'decagon'];

/** Disegna una forma (dentro un elemento <Svg>). */
export function ShapeSvg({ s }: { s: Pick<ShapeItem, 'shape' | 'x' | 'y' | 'w' | 'h' | 'fill' | 'stroke' | 'strokeWidth'> }) {
  const common = { stroke: s.stroke, strokeWidth: s.strokeWidth, strokeLinejoin: 'round' as const };
  if (s.shape === 'line' || s.shape === 'arrow') {
    const x2 = s.x + s.w;
    const y2 = s.y + s.h;
    const a = Math.atan2(s.h, s.w);
    const head = Math.max(10, s.strokeWidth * 4);
    const p1 = { x: x2 - head * Math.cos(a - 0.45), y: y2 - head * Math.sin(a - 0.45) };
    const p2 = { x: x2 - head * Math.cos(a + 0.45), y: y2 - head * Math.sin(a + 0.45) };
    return (
      <G>
        <Line x1={s.x} y1={s.y} x2={x2} y2={y2} {...common} strokeLinecap="round" />
        {s.shape === 'arrow' && <Polygon points={`${x2},${y2} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={s.stroke} {...common} />}
      </G>
    );
  }
  const r = rectFrom({ x: s.x, y: s.y }, { x: s.x + s.w, y: s.y + s.h });
  const fill = s.fill ?? 'none';
  if (s.shape === 'square') return <Rect x={r.x} y={r.y} width={r.w} height={r.h} fill={fill} {...common} />;
  if (s.shape === 'circle') return <Ellipse cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w / 2} ry={r.h / 2} fill={fill} {...common} />;
  return <Polygon points={shapePoints(s.shape, r).map((p) => `${p.x},${p.y}`).join(' ')} fill={fill} {...common} />;
}
