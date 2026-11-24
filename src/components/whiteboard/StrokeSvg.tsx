import { Path } from 'react-native-svg';
import type { Stroke } from '../../state/whiteboard';
import { ink } from '../../theme';
import { dashArray, strokeGeometry } from './geometry';

export const strokeOpacity = (s: Pick<Stroke, 'tool'>) => (s.tool === 'highlighter' ? ink.highlighterOpacity : s.tool === 'pencil' ? ink.pencilOpacity : 1);

/** Un tratto in SVG: anteprime, evidenziatore e lavagna sul web. Sul telefono l'inchiostro è disegnato con Skia (ink.tsx). */
export function StrokeShape({ s }: { s: Stroke }) {
  const { d, filled } = strokeGeometry(s.points, s.tool, s.style, s.width);
  if (filled) return <Path d={d} fill={s.color} opacity={strokeOpacity(s)} />;
  return (
    <Path
      d={d}
      stroke={s.color}
      strokeWidth={s.width}
      strokeLinecap={s.tool === 'highlighter' && s.style === 'solid' ? 'butt' : 'round'}
      strokeLinejoin="round"
      strokeDasharray={dashArray(s.style, s.width)}
      fill="none"
      opacity={strokeOpacity(s)}
    />
  );
}
