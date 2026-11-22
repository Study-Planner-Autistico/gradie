import { useRef } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, Pattern, Rect } from 'react-native-svg';
import type { PageSize, Paper, PaperTemplate } from '../../state/whiteboard';
import { paperLines, useTheme } from '../../theme';

/** Larghezza del foglio in verticale, in punti della lavagna; l'altezza segue il formato. */
const PORTRAIT_W = 380;
const RATIO: Record<PageSize, number> = { a4: Math.SQRT2, letter: 11 / 8.5 };
export const LINE_GAP = 28;
export const MARGIN_X = 52;

export function pageSize(p: Paper) {
  const long = PORTRAIT_W * RATIO[p.size];
  return p.landscape ? { w: long, h: PORTRAIT_W } : { w: PORTRAIT_W, h: long };
}

let seq = 0;

/** Righe, quadretti o puntini della carta, da usare dentro un <Svg>. */
export function PaperPattern({ template, dark, x, y, w, h, gap = LINE_GAP, margin = MARGIN_X }: { template: PaperTemplate; dark: boolean; x: number; y: number; w: number; h: number; gap?: number; margin?: number }) {
  // Id unico per istanza: sul web gli id SVG sono globali alla pagina.
  const id = useRef(`paper-${seq++}`).current;
  const ink = dark ? paperLines.dark : paperLines.light;
  if (template === 'blank') return null;
  return (
    <>
      <Defs>
        <Pattern id={id} x={x} y={y} width={gap} height={gap} patternUnits="userSpaceOnUse">
          {(template === 'lined' || template === 'margin') && <Line x1={0} y1={gap - 0.5} x2={gap} y2={gap - 0.5} stroke={ink} strokeWidth={1} />}
          {template === 'grid' && (
            <>
              <Line x1={0} y1={gap - 0.5} x2={gap} y2={gap - 0.5} stroke={ink} strokeWidth={1} />
              <Line x1={gap - 0.5} y1={0} x2={gap - 0.5} y2={gap} stroke={ink} strokeWidth={1} />
            </>
          )}
          {template === 'dots' && <Circle cx={gap / 2} cy={gap / 2} r={1.3} fill={ink} />}
        </Pattern>
      </Defs>
      <Rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
      {template === 'margin' && <Line x1={x + margin} y1={y} x2={x + margin} y2={y + h} stroke={paperLines.margin} strokeWidth={1.2} />}
    </>
  );
}

/** Anteprima di una carta (modulo Nuova nota). */
export function PaperThumb({ template, color, dark, width, height }: { template: PaperTemplate; color: string; dark: boolean; width: number; height: number }) {
  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} rx={6} fill={color} />
      <PaperPattern template={template} dark={dark} x={0} y={0} w={width} h={height} gap={9} margin={16} />
    </Svg>
  );
}

/** Copertina della nota: colore, dorso e titolo. */
export function CoverThumb({ color, title, width, height }: { color: string; title?: string; width: number; height: number }) {
  const { typography } = useTheme();
  return (
    <View style={{ width, height, borderRadius: 6, backgroundColor: color, overflow: 'hidden', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: width * 0.1, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(0,0,0,0.18)' }} />
      <View style={{ position: 'absolute', right: width * 0.12, top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(0,0,0,0.25)' }} />
      {!!title && (
        <View style={{ marginLeft: width * 0.18, marginRight: width * 0.2, padding: 4, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <Text style={[typography.caption, { fontSize: 9, lineHeight: 11, color: '#16161A' }]} numberOfLines={2}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
}
