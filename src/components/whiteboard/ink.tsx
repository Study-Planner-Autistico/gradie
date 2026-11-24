import { Canvas as SkiaCanvas, DashPathEffect, Group, Path, Skia } from '@shopify/react-native-skia';
import { memo, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, GestureStateManager, PointerType, usePanGesture } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { Pt, Stroke } from '../../state/whiteboard';
import { dashArray, strokeGeometry } from './geometry';
import { strokeOpacity } from './StrokeSvg';

/** Trasformazione della lavagna: punto del foglio → schermo = (p * S) + (tx, ty). */
export type InkView = { tx: number; ty: number; S: number };
export type LivePen = { pts: SharedValue<number[]> } & Pick<Stroke, 'tool' | 'color' | 'width' | 'style'>;

const STYLUS = PointerType.STYLUS;

/**
 * Apple Pencil (dec. 166): il tratto si disegna sul thread dell'interfaccia, senza passare da React,
 * con la pressione. Il dito non passa di qui e resta al gestore di tocchi della lavagna.
 * `pts`: punti del tratto in corso, piatti (x, y, pressione) in unità del foglio.
 */
export type RelayPhase = 'start' | 'move' | 'end' | 'cancel';

export function usePen({
  enabled,
  relay,
  view,
  onBegin,
  onUp,
  onStroke,
  onRelay,
}: {
  enabled: boolean;
  /** I punti della Pencil vanno al gestore della lavagna invece che all'inchiostro dal vivo (gomma, righello). */
  relay: boolean;
  view: InkView;
  /** La Pencil ha toccato il foglio: arriva subito, prima di qualsiasi movimento. */
  onBegin: () => void;
  /** La Pencil si è alzata (anche dopo un tocco senza movimento). */
  onUp: () => void;
  onStroke: (pts: Pt[]) => void;
  /** Coordinate sullo schermo, relative alla lavagna. */
  onRelay: (phase: RelayPhase, x: number, y: number) => void;
}) {
  const pts = useSharedValue<number[]>([]);
  const relayOn = useSharedValue(relay);
  // La Pencil è appoggiata: scritto all'istante sul thread dell'interfaccia, il gestore della lavagna lo legge
  // prima di prendere lo stesso tocco per uno scorrimento (il foglio si spostava un po' all'inizio).
  const down = useSharedValue(false);
  // Punto d'appoggio della penna: il gesto si attiva al primo movimento e senza questo l'inizio del tratto mancherebbe.
  const downAt = useSharedValue({ x: 0, y: 0 });
  useEffect(() => {
    relayOn.value = relay;
  }, [relayOn, relay]);
  const v = useSharedValue(view);
  useEffect(() => {
    v.value = view;
  }, [v, view.tx, view.ty, view.S]); // eslint-disable-line react-hooks/exhaustive-deps

  // Il gesto tiene le funzioni con cui è stato creato: passano da un ref per usare sempre quelle aggiornate (pennello, strumento).
  const cb = useRef({ onBegin, onUp, onStroke, onRelay });
  cb.current = { onBegin, onUp, onStroke, onRelay };
  const begin = useCallback(() => cb.current.onBegin(), []);
  const up = useCallback(() => cb.current.onUp(), []);
  const pass = useCallback((phase: RelayPhase, x: number, y: number) => cb.current.onRelay(phase, x, y), []);
  const finish = useCallback((flat: number[]) => {
    const out: Pt[] = [];
    for (let i = 0; i < flat.length; i += 3) out.push({ x: flat[i], y: flat[i + 1], p: flat[i + 2] });
    cb.current.onStroke(out);
  }, []);

  const pan = usePanGesture({
    enabled,
    manualActivation: true,
    maxPointers: 1,
    shouldCancelWhenOutside: false,
    // Solo la Pencil attiva il gesto; il dito lo fa fallire e passa ai tocchi normali.
    onTouchesDown: (e) => {
      'worklet';
      // Si decide al primo tocco; il palmo appoggiato dopo non interrompe la penna.
      if (e.numberOfTouches !== 1) return;
      if (e.pointerType === STYLUS) {
        down.value = true;
        downAt.value = { x: e.allTouches[0].x, y: e.allTouches[0].y };
        GestureStateManager.activate(e.handlerTag);
      } else GestureStateManager.fail(e.handlerTag);
    },
    // All'appoggio il gesto può non essere ancora pronto per attivarsi: si riprova al primo movimento.
    onTouchesMove: (e) => {
      'worklet';
      if (down.value) GestureStateManager.activate(e.handlerTag);
    },
    onActivate: (e) => {
      'worklet';
      scheduleOnRN(begin);
      if (relayOn.value) {
        scheduleOnRN(pass, 'start', downAt.value.x, downAt.value.y);
        scheduleOnRN(pass, 'move', e.x, e.y);
        return;
      }
      const { tx, ty, S } = v.value;
      const p = e.stylusData?.pressure ?? 0.5;
      const { x: x0, y: y0 } = downAt.value;
      const a = [(x0 - tx) / S, (y0 - ty) / S, p];
      if (Math.hypot(e.x - x0, e.y - y0) >= 0.5) a.push((e.x - tx) / S, (e.y - ty) / S, p);
      pts.value = a;
    },
    onUpdate: (e) => {
      'worklet';
      if (relayOn.value) {
        scheduleOnRN(pass, 'move', e.x, e.y);
        return;
      }
      const { tx, ty, S } = v.value;
      const x = (e.x - tx) / S;
      const y = (e.y - ty) / S;
      const p = e.stylusData?.pressure ?? 0.5;
      pts.modify((a) => {
        'worklet';
        const n = a.length;
        if (n >= 3 && Math.hypot(x - a[n - 3], y - a[n - 2]) < 0.5) return a;
        a.push(x, y, p);
        return a;
      });
    },
    onDeactivate: (e) => {
      'worklet';
      if (relayOn.value) scheduleOnRN(pass, e.canceled ? 'cancel' : 'end', 0, 0);
      else if (e.canceled) pts.value = [];
      else scheduleOnRN(finish, pts.value.slice());
    },
    // Sempre, anche se il gesto è stato interrotto: la lavagna non deve restare bloccata.
    onFinalize: () => {
      'worklet';
      down.value = false;
      scheduleOnRN(up);
    },
  });

  return {
    pts,
    down,
    /** Toglie il tratto dal vivo: si chiama dopo che quello salvato è sulla lavagna, così non sparisce per un fotogramma. */
    clear: () => {
      pts.value = [];
    },
    wrap: (children: ReactNode) => <GestureDetector gesture={pan}>{children}</GestureDetector>,
  };
}

/** Inchiostro della lavagna con Skia (dec. 166): tratti salvati, tratto col dito e tratto della Pencil dal vivo. */
export function InkCanvas({ strokes, live, view, pen }: { strokes: Stroke[]; live: Stroke | null; view: InkView; pen: LivePen | null }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SkiaCanvas style={StyleSheet.absoluteFill}>
        <Group transform={[{ translateX: view.tx }, { translateY: view.ty }, { scale: view.S }]}>
          {strokes.map((s) => (
            <InkStroke key={s.id} s={s} />
          ))}
          {live && <InkStroke s={live} />}
          {pen && <PenLive {...pen} />}
        </Group>
      </SkiaCanvas>
    </View>
  );
}

type Look = Pick<Stroke, 'tool' | 'color' | 'width' | 'style'>;

function Ink({ look, path, filled }: { look: Look; path: string | SharedValue<ReturnType<typeof Skia.Path.Make>>; filled: boolean }) {
  if (filled) return <Path path={path} color={look.color} opacity={strokeOpacity(look)} />;
  const dash = dashArray(look.style, look.width);
  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={look.width}
      strokeCap={look.tool === 'highlighter' && look.style === 'solid' ? 'butt' : 'round'}
      strokeJoin="round"
      color={look.color}
      opacity={strokeOpacity(look)}
    >
      {dash ? <DashPathEffect intervals={dash.split(' ').map(Number)} /> : null}
    </Path>
  );
}

const InkStroke = memo(function InkStroke({ s }: { s: Stroke }) {
  const { d, filled } = strokeGeometry(s.points, s.tool, s.style, s.width);
  return <Ink look={s} path={d} filled={filled} />;
});

function PenLive({ pts, ...look }: LivePen) {
  const { tool, style, width } = look;
  const path = useDerivedValue(() => {
    const a = pts.value;
    const p: Pt[] = [];
    for (let i = 0; i < a.length; i += 3) p.push({ x: a[i], y: a[i + 1], p: a[i + 2] });
    return (p.length ? Skia.Path.MakeFromSVGString(strokeGeometry(p, tool, style, width).d) : null) ?? Skia.Path.Make();
  });
  // Con la pressione il tratto è sempre un contorno pieno, tranne linee tratteggiate ed evidenziatore.
  const { filled } = strokeGeometry([{ x: 0, y: 0, p: 0.5 }], tool, style, width);
  return <Ink look={look} path={path} filled={filled} />;
}
