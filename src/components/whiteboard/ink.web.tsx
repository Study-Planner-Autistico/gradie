import type { ReactNode } from 'react';
import Svg, { G } from 'react-native-svg';
import type { Pt, Stroke } from '../../state/whiteboard';
import { StrokeShape } from './StrokeSvg';

// Sul web niente Skia né Pencil: l'inchiostro resta in SVG e i tocchi passano tutti dal gestore della lavagna.
export type InkView = { tx: number; ty: number; S: number };
export type LivePen = never;

export type RelayPhase = 'start' | 'move' | 'end' | 'cancel';

export function usePen(_: { enabled: boolean; relay: boolean; view: InkView; onBegin: () => void; onUp: () => void; onStroke: (pts: Pt[]) => void; onRelay: (phase: RelayPhase, x: number, y: number) => void }) {
  return { pts: null, down: { value: false }, clear: () => {}, wrap: (children: ReactNode) => children };
}

export function InkCanvas({ strokes, live, view }: { strokes: Stroke[]; live: Stroke | null; view: InkView; pen: LivePen | null }) {
  return (
    <Svg pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%">
      <G transform={`translate(${view.tx} ${view.ty}) scale(${view.S})`}>
        {strokes.map((s) => (
          <StrokeShape key={s.id} s={s} />
        ))}
        {live && <StrokeShape s={live} />}
      </G>
    </Svg>
  );
}
