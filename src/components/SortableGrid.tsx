// Griglia riordinabile trascinando (dec. 146-147): si tiene premuto un elemento, si sposta col dito, gli altri fanno posto.
// Senza librerie di gesti: sistema dei responder di React Native, come TabSwipe. Tutti i movimenti sono molle
// sul thread nativo (transform), così restano fluidi anche mentre JS lavora.
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, View, type GestureResponderEvent } from 'react-native';
import { lift as liftHaptic, tap } from './haptics';

/** Cosa riceve ogni elemento per farsi trascinare. */
export type DragHandle = {
  /** Da collegare alla pressione lunga: solleva l'elemento. */
  onLongPress: (e: GestureResponderEvent) => void;
  /** Da collegare al rilascio: se l'elemento non si è mosso è stata una pressione lunga (es. apre il menu). */
  onPressOut: () => void;
  /** L'elemento è sollevato. */
  lifted: boolean;
  /** Sposta di un posto senza trascinare (VoiceOver e TalkBack). */
  move: (delta: -1 | 1) => void;
};

/** Sotto questa distanza (in punti) il dito non sta ancora trascinando. */
const SLOP = 6;
const native = Platform.OS !== 'web';
/** Molla per chi fa posto: rapida, senza rimbalzi vistosi. */
const SHIFT = { useNativeDriver: native, stiffness: 320, damping: 30, mass: 0.9 } as const;
/** Molla del sollevamento e della posa: un piccolo rimbalzo dà l'idea dell'oggetto. */
const POP = { useNativeDriver: native, stiffness: 260, damping: 18, mass: 0.8 } as const;

type Pos = { left: number; top: number };

export function SortableGrid<T>({
  items,
  keyOf,
  groupOf = () => 0,
  cols,
  cellW,
  cellH,
  colGap,
  rowGap,
  leading = [],
  trailing = [],
  renderItem,
  onReorder,
  onLongPressRelease,
  onDragging,
}: {
  items: T[];
  keyOf: (item: T) => string;
  /** Gli elementi si spostano solo dentro il proprio gruppo (es. fogli fissati in cima e no); i gruppi sono contigui. */
  groupOf?: (item: T) => string | number;
  cols: number;
  cellW: number;
  /** Altezza della cella stimata; quella vera si misura sul primo elemento. */
  cellH: number;
  colGap: number;
  rowGap: number;
  /** Celle fisse prima e dopo gli elementi (es. Nuovo foglio, Nuovo quaderno). */
  leading?: ReactNode[];
  trailing?: ReactNode[];
  renderItem: (item: T, drag: DragHandle) => ReactNode;
  /** Nuovo ordine delle chiavi, dopo uno spostamento. */
  onReorder: (keys: string[]) => void;
  onLongPressRelease: (item: T) => void;
  /** Inizio e fine del trascinamento (per bloccare lo scorrimento della pagina). */
  onDragging?: (active: boolean) => void;
}) {
  const [measuredH, setMeasuredH] = useState(0);
  const h = measuredH || cellH;
  const keys = items.map(keyOf);
  const [lifted, setLifted] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  /** Elemento appena posato: tiene sollevamento e inclinazione finché le molle non tornano a zero. */
  const [settling, setSettling] = useState<string | null>(null);

  // Spostamento del dito, inclinazione (segue la velocità orizzontale) e sollevamento dell'elemento preso.
  const offset = useRef(new Animated.ValueXY()).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const liftAmount = useRef(new Animated.Value(0)).current;
  const drag = useRef<{ key: string; from: number; x: number; y: number; lastDx: number; dx: number; dy: number; moved: boolean; hover: number } | null>(null);

  // Posizione animata di ogni elemento e ultimo posto verso cui sta andando.
  const anim = useRef(new Map<string, { xy: Animated.ValueXY; to: Pos }>()).current;
  /** Le molle servono solo durante e subito dopo un trascinamento; per il resto i posti cambiano subito. */
  const animating = useRef(false);

  const pos = (i: number): Pos => ({ left: (i % cols) * (cellW + colGap), top: Math.floor(i / cols) * (h + rowGap) });

  // Ordine mostrato: durante il trascinamento l'elemento preso sta al posto su cui si trova il dito.
  const order = [...keys];
  if (drag.current && hover != null) {
    order.splice(drag.current.from, 1);
    order.splice(hover, 0, drag.current.key);
  }

  const valueFor = (key: string, to: Pos) => {
    let a = anim.get(key);
    if (!a) {
      a = { xy: new Animated.ValueXY({ x: to.left, y: to.top }), to };
      anim.set(key, a);
    }
    return a;
  };

  // Ogni elemento va verso il suo posto: con una molla se si sta riordinando, altrimenti subito.
  useLayoutEffect(() => {
    order.forEach((key, i) => {
      const to = pos(leading.length + i);
      const a = valueFor(key, to);
      if (key === lifted) return; // l'elemento preso segue il dito
      if (a.to.left === to.left && a.to.top === to.top) return;
      a.to = to;
      if (animating.current) Animated.spring(a.xy, { ...SHIFT, toValue: { x: to.left, y: to.top } }).start();
      else a.xy.setValue({ x: to.left, y: to.top });
    });
    [...anim.keys()].forEach((k) => !keys.includes(k) && anim.delete(k));
  });

  /** Posti in cui può andare l'elemento `from`: quelli del suo gruppo. */
  const range = (from: number) => {
    const g = groupOf(items[from]);
    let lo = from;
    let hi = from;
    while (lo > 0 && groupOf(items[lo - 1]) === g) lo--;
    while (hi < items.length - 1 && groupOf(items[hi + 1]) === g) hi++;
    return [lo, hi] as const;
  };

  /** Posa l'elemento preso nel posto `slot` (indice tra gli elementi) con una molla, poi chiude il trascinamento. */
  const drop = (slot: number) => {
    const d = drag.current;
    if (!d) return;
    const a = anim.get(d.key);
    const target = pos(leading.length + slot);
    if (a) {
      // Da dove si trova ora (posto di partenza + dito) verso il posto nuovo, senza scatti.
      a.xy.setValue({ x: a.to.left + d.dx, y: a.to.top + d.dy });
      offset.setValue({ x: 0, y: 0 });
      a.to = target;
      Animated.spring(a.xy, { ...POP, toValue: { x: target.left, y: target.top } }).start();
    }
    Animated.spring(liftAmount, { ...POP, toValue: 0 }).start();
    Animated.spring(tilt, { ...POP, toValue: 0 }).start();
    drag.current = null;
    setSettling(d.key);
    setLifted(null);
    setHover(null);
    onDragging?.(false);
    // Le molle finiscono da sole; dopo, i cambi di posto tornano immediati.
    setTimeout(() => {
      if (!drag.current) animating.current = false;
      setSettling((k) => (k === d.key ? null : k));
    }, 450);
  };

  const finish = () => {
    const d = drag.current;
    if (!d) return;
    const changed = d.moved && d.hover !== d.from;
    const next = [...keys];
    if (changed) {
      next.splice(d.from, 1);
      next.splice(d.hover, 0, d.key);
    }
    drop(d.hover);
    if (changed) onReorder(next);
  };

  const handleFor = (item: T, index: number): DragHandle => {
    const key = keyOf(item);
    return {
      lifted: lifted === key,
      onLongPress: (e) => {
        liftHaptic();
        animating.current = true;
        drag.current = { key, from: index, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, lastDx: 0, dx: 0, dy: 0, moved: false, hover: index };
        offset.setValue({ x: 0, y: 0 });
        Animated.spring(liftAmount, { ...POP, toValue: 1 }).start();
        setLifted(key);
        setHover(index);
        onDragging?.(true);
      },
      onPressOut: () => {
        const d = drag.current;
        if (!d || d.key !== key || d.moved) return;
        drop(d.from);
        onLongPressRelease(item);
      },
      move: (delta) => {
        const [lo, hi] = range(index);
        const to = index + delta;
        if (to < lo || to > hi) return;
        const next = [...keys];
        next.splice(index, 1);
        next.splice(to, 0, key);
        animating.current = true;
        setTimeout(() => (animating.current = false), 450);
        onReorder(next);
      },
    };
  };

  const responder = {
    // Appena il dito si muove con un elemento sollevato, il trascinamento passa alla griglia.
    onMoveShouldSetResponderCapture: (e: GestureResponderEvent) => {
      const d = drag.current;
      if (!d) return false;
      if (Math.hypot(e.nativeEvent.pageX - d.x, e.nativeEvent.pageY - d.y) < SLOP) return false;
      d.moved = true;
      return true;
    },
    onResponderTerminationRequest: () => !drag.current,
    onResponderMove: (e: GestureResponderEvent) => {
      const d = drag.current;
      if (!d) return;
      d.dx = e.nativeEvent.pageX - d.x;
      d.dy = e.nativeEvent.pageY - d.y;
      offset.setValue({ x: d.dx, y: d.dy });
      // Si inclina un po' nella direzione in cui va, come un foglio tenuto in mano.
      const vx = d.dx - d.lastDx;
      d.lastDx = d.dx;
      Animated.spring(tilt, { ...SHIFT, toValue: Math.max(-6, Math.min(6, vx * 0.6)) }).start();
      // Posto sotto il centro dell'elemento trascinato.
      const start = pos(leading.length + d.from);
      const cx = start.left + d.dx + cellW / 2;
      const cy = start.top + d.dy + h / 2;
      const col = Math.max(0, Math.min(cols - 1, Math.floor(cx / (cellW + colGap))));
      const row = Math.max(0, Math.floor(cy / (h + rowGap)));
      const [lo, hi] = range(d.from);
      const to = Math.max(lo, Math.min(hi, row * cols + col - leading.length));
      if (to !== d.hover) {
        d.hover = to;
        tap();
        setHover(to);
      }
    },
    onResponderRelease: finish,
    onResponderTerminate: finish,
  };

  const total = leading.length + items.length + trailing.length;
  const rows = Math.ceil(total / cols);
  const cell = (i: number) => ({ position: 'absolute' as const, width: cellW, ...pos(i) });
  const scale = liftAmount.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const rotate = tilt.interpolate({ inputRange: [-6, 6], outputRange: ['-6deg', '6deg'] });

  return (
    <View {...responder} style={{ height: rows > 0 ? rows * h + (rows - 1) * rowGap : 0 }}>
      {leading.map((node, i) => (
        <View key={`lead-${i}`} style={cell(i)}>
          {node}
        </View>
      ))}
      {items.map((item, index) => {
        const key = keyOf(item);
        const isLifted = lifted === key;
        const raised = isLifted || settling === key;
        const a = valueFor(key, pos(leading.length + order.indexOf(key)));
        const x = isLifted ? Animated.add(a.xy.x, offset.x) : a.xy.x;
        const y = isLifted ? Animated.add(a.xy.y, offset.y) : a.xy.y;
        return (
          <Animated.View
            key={key}
            onLayout={index === 0 ? (e) => setMeasuredH(Math.ceil(e.nativeEvent.layout.height)) : undefined}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: cellW,
              zIndex: raised ? 10 : 0,
              transform: [{ translateX: x }, { translateY: y }, ...(raised ? [{ scale }, { rotate }] : [])],
            }}
          >
            {renderItem(item, handleFor(item, index))}
          </Animated.View>
        );
      })}
      {trailing.map((node, i) => (
        <View key={`trail-${i}`} style={cell(leading.length + items.length + i)}>
          {node}
        </View>
      ))}
    </View>
  );
}
