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

/** Passo del motivo (in punti, scala 1) per ogni carta. */
const STEP: Record<PaperTemplate, { w: number; h: number }> = {
  blank: { w: 1, h: 1 },
  lined: { w: LINE_GAP, h: LINE_GAP },
  narrow: { w: 20, h: 20 },
  wide: { w: 38, h: 38 },
  margin: { w: LINE_GAP, h: LINE_GAP },
  cornell: { w: LINE_GAP, h: LINE_GAP },
  grid: { w: LINE_GAP, h: LINE_GAP },
  smallGrid: { w: 16, h: 16 },
  dots: { w: LINE_GAP, h: LINE_GAP },
  music: { w: 40, h: 78 },
};

/** Righe, quadretti, puntini o pentagramma della carta, da usare dentro un <Svg>. `scale` riduce il motivo nelle anteprime. */
export function PaperPattern({ template, dark, x, y, w, h, scale = 1 }: { template: PaperTemplate; dark: boolean; x: number; y: number; w: number; h: number; scale?: number }) {
  // Id unico per istanza: sul web gli id SVG sono globali alla pagina.
  const id = useRef(`paper-${seq++}`).current;
  const ink = dark ? paperLines.dark : paperLines.light;
  if (template === 'blank') return null;
  const sw = STEP[template].w * scale;
  const sh = STEP[template].h * scale;
  const hLine = <Line x1={0} y1={sh - 0.5} x2={sw} y2={sh - 0.5} stroke={ink} strokeWidth={1} />;
  let cell;
  switch (template) {
    case 'grid':
    case 'smallGrid':
      cell = (
        <>
          {hLine}
          <Line x1={sw - 0.5} y1={0} x2={sw - 0.5} y2={sh} stroke={ink} strokeWidth={1} />
        </>
      );
      break;
    case 'dots':
      cell = <Circle cx={sw / 2} cy={sh / 2} r={1.3 * Math.max(scale, 0.6)} fill={ink} />;
      break;
    case 'music': {
      // Pentagramma: 5 righe ravvicinate, poi uno spazio.
      const g = 8 * scale;
      cell = (
        <>
          {[0, 1, 2, 3, 4].map((k) => (
            <Line key={k} x1={0} y1={sh - 12 * scale - k * g} x2={sw} y2={sh - 12 * scale - k * g} stroke={ink} strokeWidth={1} />
          ))}
        </>
      );
      break;
    }
    default:
      cell = hLine;
  }
  const margin = (template === 'cornell' ? 110 : MARGIN_X) * scale;
  return (
    <>
      <Defs>
        <Pattern id={id} x={x} y={y} width={sw} height={sh} patternUnits="userSpaceOnUse">
          {cell}
        </Pattern>
      </Defs>
      <Rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
      {(template === 'margin' || template === 'cornell') && <Line x1={x + margin} y1={y} x2={x + margin} y2={template === 'cornell' ? y + h * 0.78 : y + h} stroke={paperLines.margin} strokeWidth={1.2} />}
      {template === 'cornell' && <Line x1={x} y1={y + h * 0.78} x2={x + w} y2={y + h * 0.78} stroke={paperLines.margin} strokeWidth={1.2} />}
    </>
  );
}

/** Anteprima di una carta (modulo Nuova nota). */
export function PaperThumb({ template, color, dark, width, height }: { template: PaperTemplate; color: string; dark: boolean; width: number; height: number }) {
  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} rx={6} fill={color} />
      <PaperPattern template={template} dark={dark} x={0} y={0} w={width} h={height} scale={width / 220} />
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
