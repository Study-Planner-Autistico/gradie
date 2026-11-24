// Griglia riordinabile trascinando (dec. 146): si tiene premuto un elemento, si sposta col dito, gli altri fanno posto.
// Senza librerie di gesti: sistema dei responder di React Native, come TabSwipe.
import { useRef, useState, type ReactNode } from 'react';
import { Animated, LayoutAnimation, Platform, View, type GestureResponderEvent } from 'react-native';
import { tap } from './haptics';

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
  const offset = useRef(new Animated.ValueXY()).current;
  const drag = useRef<{ key: string; from: number; x: number; y: number; moved: boolean; hover: number } | null>(null);

  const pos = (i: number) => ({ left: (i % cols) * (cellW + colGap), top: Math.floor(i / cols) * (h + rowGap) });

  // Ordine mostrato: durante il trascinamento l'elemento preso sta al posto su cui si trova il dito.
  const order = [...keys];
  if (drag.current && hover != null) {
    order.splice(drag.current.from, 1);
    order.splice(hover, 0, drag.current.key);
  }

  /** Posti in cui può andare l'elemento `from`: quelli del suo gruppo. */
  const range = (from: number) => {
    const g = groupOf(items[from]);
    let lo = from;
    let hi = from;
    while (lo > 0 && groupOf(items[lo - 1]) === g) lo--;
    while (hi < items.length - 1 && groupOf(items[hi + 1]) === g) hi++;
    return [lo, hi] as const;
  };

  const reset = () => {
    drag.current = null;
    offset.setValue({ x: 0, y: 0 });
    setLifted(null);
    setHover(null);
    onDragging?.(false);
  };

  const finish = () => {
    const d = drag.current;
    if (!d) return;
    if (d.moved && d.hover !== d.from) {
      const next = [...keys];
      next.splice(d.from, 1);
      next.splice(d.hover, 0, d.key);
      onReorder(next);
    }
    reset();
  };

  const handleFor = (item: T, index: number): DragHandle => {
    const key = keyOf(item);
    return {
      lifted: lifted === key,
      onLongPress: (e) => {
        tap();
        drag.current = { key, from: index, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, moved: false, hover: index };
        setLifted(key);
        setHover(index);
        onDragging?.(true);
      },
      onPressOut: () => {
        const d = drag.current;
        if (!d || d.key !== key || d.moved) return;
        reset();
        onLongPressRelease(item);
      },
      move: (delta) => {
        const [lo, hi] = range(index);
        const to = index + delta;
        if (to < lo || to > hi) return;
        const next = [...keys];
        next.splice(index, 1);
        next.splice(to, 0, key);
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
      const dx = e.nativeEvent.pageX - d.x;
      const dy = e.nativeEvent.pageY - d.y;
      offset.setValue({ x: dx, y: dy });
      // Posto sotto il centro dell'elemento trascinato.
      const start = pos(leading.length + d.from);
      const cx = start.left + dx + cellW / 2;
      const cy = start.top + dy + h / 2;
      const col = Math.max(0, Math.min(cols - 1, Math.floor(cx / (cellW + colGap))));
      const row = Math.max(0, Math.floor(cy / (h + rowGap)));
      const [lo, hi] = range(d.from);
      const to = Math.max(lo, Math.min(hi, row * cols + col - leading.length));
      if (to !== d.hover) {
        d.hover = to;
        if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.create(160, 'easeInEaseOut', 'opacity'));
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
        const at = order.indexOf(key);
        // L'elemento preso resta ancorato al suo posto di partenza e segue il dito con uno spostamento.
        const p = isLifted && drag.current ? pos(leading.length + drag.current.from) : pos(leading.length + at);
        return (
          <Animated.View
            key={key}
            onLayout={index === 0 ? (e) => setMeasuredH(Math.ceil(e.nativeEvent.layout.height)) : undefined}
            style={{
              position: 'absolute',
              width: cellW,
              ...p,
              zIndex: isLifted ? 10 : 0,
              transform: isLifted ? [{ translateX: offset.x }, { translateY: offset.y }, { scale: 1.05 }] : [],
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
