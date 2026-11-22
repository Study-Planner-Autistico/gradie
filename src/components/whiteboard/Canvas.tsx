import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, TextInput, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { locale, t } from '../../i18n';
import {
  newId,
  type BoardItem,
  type LineStyle,
  type Pt,
  type Paper,
  type ShapeItem,
  type ShapeKind,
  type Stabilization,
  type Stroke,
  type StrokeTool,
} from '../../state/whiteboard';
import { ink, paperLines, useTheme } from '../../theme';
import { pageCount, pageSize, PaperPattern } from './Paper';
import {
  bounds,
  brushOutline,
  CM,
  contains,
  dashArray,
  eraseStroke,
  hitsStroke,
  inLasso,
  intersects,
  moveItem,
  onRuler,
  pathD,
  projectOnEdge,
  rectFrom,
  snapToRuler,
  stabilize,
  textMetrics,
  union,
  type Rect,
  type Ruler,
} from './geometry';
import { ShapeSvg } from './shapes';

export type Tool = StrokeTool | 'eraser' | 'text' | 'select' | 'hand' | 'shapes';
export type Brush = { color: string; width: number; style: LineStyle; stabilization: Stabilization };
export type SelectMode = 'rect' | 'lasso';
export type ShapeStyle = { shape: ShapeKind; fill: string | null; stroke: string; strokeWidth: number };

const ERASER_RADIUS = 10;
/** Tocco a più dita (dec. 116): le dita devono appoggiarsi entro TAP_DELAY e il tocco finire entro TAP_MAX. */
const TAP_DELAY = 500;
const TAP_MAX = 1000;
const TAP_SLOP = 30;
const isOpenShape = (s: ShapeKind) => s === 'line' || s === 'arrow';

type Drag =
  | { mode: 'draw'; points: Pt[] }
  | { mode: 'drawRuler'; anchor: Pt; start: Pt }
  | { mode: 'erase' }
  | { mode: 'pan'; startPage: Pt; startOffset: Pt }
  | { mode: 'rect'; start: Pt }
  | { mode: 'lasso'; points: Pt[] }
  | { mode: 'move'; last: Pt }
  | { mode: 'shape'; start: Pt }
  | { mode: 'rulerMove'; last: Pt }
  | { mode: 'rulerRotate'; grab: number; startAngle: number }
  | { mode: 'tap'; start: Pt; moved: boolean; wasEditing: boolean }
  | { mode: 'multi'; c0: Pt; d0: number; startOffset: Pt; active: boolean };

/** Due dita: punto medio e distanza. */
const pinch = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
  const [a, b] = touches;
  return { c: { x: (a.pageX + b.pageX) / 2, y: (a.pageY + b.pageY) / 2 }, d: Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) };
};

export function Canvas({
  items,
  update,
  tool,
  brush,
  textColor,
  selectMode,
  shapeStyle,
  ruler,
  setRuler,
  offset,
  setOffset,
  selected,
  setSelected,
  editingId,
  setEditingId,
  onOpenAudio,
  onSize,
  paper,
  onUndo,
  onRedo,
  onRevert,
  scale = 1,
}: {
  /** Carta: unità del foglio per punto dello schermo (il foglio occupa tutta la larghezza, dec. 117). */
  scale?: number;
  paper?: Paper;
  items: BoardItem[];
  update: (fn: (prev: BoardItem[]) => BoardItem[], group?: string) => void;
  /** Due dita: annulla. Tre dita: ripeti. */
  onUndo: () => void;
  onRedo: () => void;
  /** Toglie le modifiche già fatte dal gesto quando diventa un tocco a più dita. */
  onRevert: (group: string) => void;
  tool: Tool;
  brush: Brush;
  textColor: string;
  selectMode: SelectMode;
  shapeStyle: ShapeStyle;
  ruler: Ruler | null;
  setRuler: (r: Ruler) => void;
  offset: Pt;
  setOffset: (p: Pt) => void;
  selected: string[];
  setSelected: (ids: string[]) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onOpenAudio: (id: string) => void;
  onSize: (s: { w: number; h: number }) => void;
}) {
  const { isDark } = useTheme();
  const origin = useRef<Pt>({ x: 0, y: 0 });
  const drag = useRef<Drag | null>(null);
  // Ogni gesto è un solo passo di annulla.
  const gesture = useRef('');
  const multi = useRef({ t0: 0, max: 0, start: { x: 0, y: 0 }, invalid: false });
  const [live, setLive] = useState<Pt[] | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [lasso, setLasso] = useState<Pt[] | null>(null);
  const [liveShape, setLiveShape] = useState<ShapeItem | null>(null);
  const [eraser, setEraser] = useState<Pt | null>(null);
  const [measure, setMeasure] = useState<{ at: Pt; cm: number } | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const itemsRef = useRef(items);
  itemsRef.current = items;
  // Rimpicciolimento con due dita sulla carta: solo un effetto, poi il foglio torna com'era (dec. 117).
  const [zoom, setZoom] = useState(1);
  const [anchorY, setAnchorY] = useState(0);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  const frame = useRef<number | null>(null);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);
  const bounceBack = () => {
    const from = zoomRef.current;
    if (from === 1) return;
    const t0 = Date.now();
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / 260);
      setZoom(from + (1 - from) * (1 - Math.pow(1 - k, 3)));
      frame.current = k < 1 ? requestAnimationFrame(step) : null;
    };
    frame.current = requestAnimationFrame(step);
  };

  const page = paper ? pageSize(paper) : null;
  const S = scale * zoom;
  // Con la carta il foglio resta centrato orizzontalmente (occupa tutta la larghezza quando non è rimpicciolito).
  const tx = page ? (box.w - page.w * S) / 2 : offset.x;
  const ty = anchorY - (anchorY - offset.y) * zoom;
  const eraserR = ERASER_RADIUS / S;

  // Numero del foglio al centro dello schermo: compare mentre si scorre e sparisce 1 secondo dopo (dec. 118).
  const insets = useSafeAreaInsets();
  const pageNumber = page && box.h > 0 ? Math.max(0, Math.floor((box.h / 2 - ty) / S / page.h)) + 1 : 0;
  const hasPage = page !== null;
  const badge = useRef(new Animated.Value(0)).current;
  const lastY = useRef(offset.y);
  useEffect(() => {
    if (!hasPage || offset.y === lastY.current) return;
    lastY.current = offset.y;
    badge.stopAnimation();
    badge.setValue(1);
    const timer = setTimeout(() => Animated.timing(badge, { toValue: 0, duration: 200, useNativeDriver: true }).start(), 1000);
    return () => clearTimeout(timer);
  }, [offset.y, hasPage, badge]);

  const selectedBox = union(items.filter((i) => selected.includes(i.id)).map(bounds));
  const strokeTool = tool === 'pen' || tool === 'pencil' || tool === 'highlighter';

  const screen = (e: GestureResponderEvent): Pt => ({ x: e.nativeEvent.pageX - origin.current.x, y: e.nativeEvent.pageY - origin.current.y });
  const toCanvas = (s: Pt): Pt => ({ x: (s.x - tx) / S, y: (s.y - ty) / S });

  const eraseAt = (p: Pt) => {
    if (!itemsRef.current.some((i) => i.kind === 'stroke' && hitsStroke(i, p, eraserR))) return;
    update((prev) => prev.flatMap<BoardItem>((i) => (i.kind === 'stroke' ? eraseStroke(i, p, eraserR, () => newId('s')) : [i])), gesture.current);
  };

  /** Interrompe il gesto in corso senza aggiungere nulla. */
  const cancelDrag = () => {
    const d = drag.current;
    drag.current = null;
    setLive(null);
    setRect(null);
    setLasso(null);
    setLiveShape(null);
    setEraser(null);
    setMeasure(null);
    if (d && (d.mode === 'erase' || d.mode === 'move')) onRevert(gesture.current);
  };

  /** Conta le dita: se se ne appoggiano altre entro TAP_DELAY, il gesto diventa un tocco a più dita. */
  const trackTouches = (e: GestureResponderEvent) => {
    const m = multi.current;
    const touches = e.nativeEvent.touches;
    const n = touches.length;
    if (n > m.max) {
      if (Date.now() - m.t0 > TAP_DELAY) m.invalid = true;
      else {
        m.max = n;
        if (n >= 2) startMulti(e);
      }
    }
    if (m.max >= 2 && n > 0 && Math.hypot(touches[0].pageX - m.start.x, touches[0].pageY - m.start.y) > TAP_SLOP) m.invalid = true;
  };

  /** Più dita: un tocco fermo annulla o ripete; trascinando si scorre, avvicinandole si rimpicciolisce (solo effetto). */
  const startMulti = (e: GestureResponderEvent) => {
    if (drag.current?.mode !== 'multi') cancelDrag();
    const { c, d } = pinch(e.nativeEvent.touches);
    drag.current = { mode: 'multi', c0: c, d0: d, startOffset: offset, active: false };
  };

  const moveMulti = (e: GestureResponderEvent, d: Extract<Drag, { mode: 'multi' }>) => {
    if (e.nativeEvent.touches.length < 2) return;
    const { c, d: dist } = pinch(e.nativeEvent.touches);
    if (!d.active && (Math.hypot(c.x - d.c0.x, c.y - d.c0.y) > 10 || Math.abs(dist - d.d0) > 10)) {
      d.active = true;
      multi.current.invalid = true;
    }
    if (!d.active) return;
    setOffset({ x: page ? d.startOffset.x : d.startOffset.x + c.x - d.c0.x, y: d.startOffset.y + c.y - d.c0.y });
    if (page && d.d0 > 0) {
      const r = dist / d.d0;
      // Resistenza: il foglio si rimpicciolisce meno delle dita e mai sotto metà.
      setZoom(r < 1 ? Math.max(0.5, 1 - (1 - r) * 0.5) : 1);
      setAnchorY(c.y - origin.current.y);
    }
  };

  const onGrant = (e: GestureResponderEvent) => {
    // I livelli sopra il canvas non ricevono tocchi: location è relativa al canvas.
    origin.current = { x: e.nativeEvent.pageX - e.nativeEvent.locationX, y: e.nativeEvent.pageY - e.nativeEvent.locationY };
    gesture.current = newId('g');
    const fingers = e.nativeEvent.touches.length || 1;
    multi.current = { t0: Date.now(), max: fingers, start: { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }, invalid: false };
    const wasEditing = editingId !== null;
    if (wasEditing) setEditingId(null);
    if (fingers >= 2) return startMulti(e);
    const sp = screen(e);
    const p = toCanvas(sp);

    // Il righello si sposta (al centro) o si ruota (verso gli estremi) con qualsiasi strumento.
    if (ruler && onRuler(sp, ruler)) {
      const along = (sp.x - ruler.cx) * Math.cos(ruler.angle) + (sp.y - ruler.cy) * Math.sin(ruler.angle);
      drag.current =
        Math.abs(along) < 70
          ? { mode: 'rulerMove', last: sp }
          : { mode: 'rulerRotate', grab: Math.atan2(sp.y - ruler.cy, sp.x - ruler.cx), startAngle: ruler.angle };
      return;
    }

    switch (tool) {
      case 'pen':
      case 'pencil':
      case 'highlighter': {
        const snap = ruler ? snapToRuler(sp, ruler) : null;
        if (snap) {
          const start = toCanvas(snap);
          drag.current = { mode: 'drawRuler', anchor: snap, start };
          setLive([start, start]);
        } else {
          drag.current = { mode: 'draw', points: [p] };
          setLive([p]);
        }
        break;
      }
      case 'eraser':
        drag.current = { mode: 'erase' };
        setEraser(p);
        eraseAt(p);
        break;
      case 'hand':
        drag.current = { mode: 'pan', startPage: { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }, startOffset: offset };
        break;
      case 'select':
        if (selectedBox && contains(selectedBox, p)) drag.current = { mode: 'move', last: p };
        else if (selectMode === 'lasso') {
          drag.current = { mode: 'lasso', points: [p] };
          setLasso([p]);
        } else {
          drag.current = { mode: 'rect', start: p };
          setRect({ x: p.x, y: p.y, w: 0, h: 0 });
        }
        break;
      case 'shapes':
        drag.current = { mode: 'shape', start: p };
        break;
      case 'text':
        drag.current = { mode: 'tap', start: p, moved: false, wasEditing };
        break;
    }
  };

  const onMove = (e: GestureResponderEvent) => {
    trackTouches(e);
    const d = drag.current;
    if (d?.mode === 'multi') return moveMulti(e, d);
    if (!d || e.nativeEvent.touches.length > 1) return;
    const sp = screen(e);
    const p = toCanvas(sp);
    switch (d.mode) {
      case 'draw': {
        const last = d.points[d.points.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
        d.points.push(p);
        setLive([...d.points]);
        break;
      }
      case 'drawRuler': {
        if (!ruler) return;
        const end = toCanvas(projectOnEdge(sp, d.anchor, ruler));
        setLive([d.start, end]);
        // Il righello misura sullo schermo: la lunghezza sul foglio va riportata in punti dello schermo.
        setMeasure({ at: end, cm: (Math.hypot(end.x - d.start.x, end.y - d.start.y) * S) / CM });
        break;
      }
      case 'erase':
        setEraser(p);
        eraseAt(p);
        break;
      case 'pan':
        setOffset({ x: d.startOffset.x + e.nativeEvent.pageX - d.startPage.x, y: d.startOffset.y + e.nativeEvent.pageY - d.startPage.y });
        break;
      case 'rect':
        setRect(rectFrom(d.start, p));
        break;
      case 'lasso':
        d.points.push(p);
        setLasso([...d.points]);
        break;
      case 'move': {
        const dx = p.x - d.last.x;
        const dy = p.y - d.last.y;
        d.last = p;
        update((prev) => prev.map((i) => (selected.includes(i.id) ? moveItem(i, dx, dy) : i)), gesture.current);
        break;
      }
      case 'shape':
        setLiveShape(makeShape(d.start, p));
        break;
      case 'rulerMove':
        if (!ruler) return;
        setRuler({ ...ruler, cx: ruler.cx + sp.x - d.last.x, cy: ruler.cy + sp.y - d.last.y });
        d.last = sp;
        break;
      case 'rulerRotate':
        if (!ruler) return;
        setRuler({ ...ruler, angle: d.startAngle + Math.atan2(sp.y - ruler.cy, sp.x - ruler.cx) - d.grab });
        break;
      case 'tap':
        if (Math.hypot(p.x - d.start.x, p.y - d.start.y) > 6) d.moved = true;
        break;
    }
  };

  const makeShape = (a: Pt, b: Pt): ShapeItem => ({
    kind: 'shape',
    id: newId('sh'),
    ...shapeStyle,
    x: a.x,
    y: a.y,
    w: b.x - a.x,
    h: b.y - a.y,
    text: '',
  });

  const addStroke = (points: Pt[]) => {
    const stroke: Stroke = { kind: 'stroke', id: newId('s'), tool: tool as StrokeTool, color: brush.color, width: brush.width, style: brush.style, points };
    update((prev) => [...prev, stroke]);
  };

  const onRelease = (fingersUp: boolean) => {
    const m = multi.current;
    if (m.max >= 2) {
      cancelDrag();
      bounceBack();
      if (fingersUp && !m.invalid && Date.now() - m.t0 <= TAP_MAX) (m.max >= 3 ? onRedo : onUndo)();
      return;
    }
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    switch (d.mode) {
      case 'draw':
        addStroke(stabilize(d.points, brush.stabilization));
        setLive(null);
        break;
      case 'drawRuler':
        if (live && live.length === 2) addStroke(live);
        setLive(null);
        setMeasure(null);
        break;
      case 'erase':
        setEraser(null);
        break;
      case 'rect': {
        // Basta toccare una parte dell'elemento per prenderlo tutto.
        const r = rect;
        setRect(null);
        if (!r || r.w + r.h < 6) setSelected([]);
        else setSelected(itemsRef.current.filter((i) => intersects(bounds(i), r)).map((i) => i.id));
        break;
      }
      case 'lasso':
        setLasso(null);
        setSelected(d.points.length < 3 ? [] : itemsRef.current.filter((i) => inLasso(i, d.points)).map((i) => i.id));
        break;
      case 'shape': {
        const s = liveShape;
        setLiveShape(null);
        // Un tocco senza trascinare mette la forma con una misura standard.
        const item =
          s && Math.abs(s.w) + Math.abs(s.h) > 12
            ? s
            : isOpenShape(shapeStyle.shape)
              ? makeShape(d.start, { x: d.start.x + 140, y: d.start.y })
              : makeShape({ x: d.start.x - 50, y: d.start.y - 50 }, { x: d.start.x + 50, y: d.start.y + 50 });
        update((prev) => [...prev, item]);
        break;
      }
      case 'tap': {
        // Toccare la lavagna mentre si scrive chiude la scrittura, senza creare un altro testo.
        if (d.moved || d.wasEditing) break;
        const hit = [...itemsRef.current]
          .reverse()
          .find((i) => (i.kind === 'text' || i.kind === 'note' || (i.kind === 'shape' && !isOpenShape(i.shape))) && contains(bounds(i), d.start));
        if (hit) setEditingId(hit.id);
        else {
          const id = newId('t');
          update((prev) => [...prev, { kind: 'text', id, x: d.start.x, y: d.start.y - textMetrics.lineHeight / 2, text: '', color: textColor }], `text:${id}`);
          setEditingId(id);
        }
        break;
      }
    }
  };

  const finishEditing = () => {
    const id = editingId;
    setEditingId(null);
    update((prev) => prev.filter((i) => !(i.id === id && i.kind === 'text' && i.text.trim() === '')), `text:${id}`);
  };

  const setText = (id: string, text: string) =>
    update((prev) => prev.map((i) => (i.id === id && (i.kind === 'text' || i.kind === 'note' || i.kind === 'shape') ? { ...i, text } : i)), `text:${id}`);

  const deleteSelection = () => {
    update((prev) => prev.filter((i) => !selected.includes(i.id)));
    setSelected([]);
  };

  const highlights = items.filter((i): i is Stroke => i.kind === 'stroke' && i.tool === 'highlighter');
  const inks = items.filter((i): i is Stroke => i.kind === 'stroke' && i.tool !== 'highlighter');
  const shapes = items.filter((i): i is ShapeItem => i.kind === 'shape');
  const liveStroke: Stroke | null =
    live && strokeTool ? { kind: 'stroke', id: 'live', tool: tool as StrokeTool, color: brush.color, width: brush.width, style: brush.style, points: live } : null;
  const translate = `translate(${tx} ${ty}) scale(${S})`;
  // Fogli: quelli scritti, e quanti servono per arrivare in fondo allo schermo mentre si scende (dec. 117).
  const pages = paper && page ? Math.max(pageCount(paper, items), Math.ceil((box.h - ty) / S / page.h)) : 0;
  // Si disegnano solo i fogli sullo schermo.
  const firstPage = page ? Math.max(0, Math.floor(-ty / S / page.h)) : 0;
  const lastPage = page ? Math.min(pages - 1, Math.floor((box.h - ty) / S / page.h)) : -1;
  const visiblePages = Array.from({ length: Math.max(0, lastPage - firstPage + 1) }, (_, k) => firstPage + k);
  // Testi, note e immagini seguono la scala del foglio.
  const scaled = { transform: [{ scale: S }], transformOrigin: 'top left' };
  const background = paper ? (isDark ? paperLines.desk.dark : paperLines.desk.light) : isDark ? ink.paper.dark : ink.paper.light;

  return (
    <View
      style={{ flex: 1, backgroundColor: background, overflow: 'hidden' }}
      onLayout={(e) => {
        const next = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
        setBox(next);
        onSize(next);
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderStart={trackTouches}
      onResponderMove={onMove}
      onResponderRelease={() => onRelease(true)}
      onResponderTerminate={() => onRelease(false)}
    >
      <Svg pointerEvents="none" width={box.w} height={box.h} style={fill}>
        <G transform={translate}>
          {paper && page && (
            <>
              <SvgRect x={0} y={0} width={page.w} height={page.h * pages} fill={paper.color} />
              {/* La carta si ripete foglio dopo foglio; una linea leggera segna dove inizia il successivo. */}
              {visiblePages.map((k) => (
                <G key={k}>
                  <PaperPattern template={paper.template} dark={paper.dark} x={0} y={k * page.h} w={page.w} h={page.h} />
                  {k > 0 && <Line x1={0} y1={k * page.h} x2={page.w} y2={k * page.h} stroke={paper.dark ? paperLines.dark : paperLines.light} strokeWidth={2} strokeDasharray="8 6" />}
                </G>
              ))}
            </>
          )}
          <StrokeLayer strokes={highlights} />
          {liveStroke?.tool === 'highlighter' && <StrokeShape s={liveStroke} />}
          {shapes.map((s) => (
            <ShapeSvg key={s.id} s={s} />
          ))}
          {liveShape && <ShapeSvg s={liveShape} />}
        </G>
      </Svg>

      {items.map((i) => {
        if (i.kind === 'stroke' || i.kind === 'audio') return null;
        const editing = editingId === i.id;
        if (i.kind === 'shape') {
          if (isOpenShape(i.shape) || (!i.text && !editing)) return null;
          const r = rectFrom({ x: i.x, y: i.y }, { x: i.x + i.w, y: i.y + i.h });
          const style = { fontSize: 15, lineHeight: 20, color: i.stroke, textAlign: 'center' as const, padding: 0 };
          return (
            <View
              key={i.id}
              pointerEvents={editing ? 'auto' : 'none'}
              style={{ position: 'absolute', left: r.x * S + tx, top: r.y * S + ty, width: r.w, height: r.h, alignItems: 'center', justifyContent: 'center', padding: 8, ...scaled }}
            >
              {editing ? (
                <TextInput autoFocus multiline value={i.text} onChangeText={(v) => setText(i.id, v)} onBlur={finishEditing} placeholder={t.whiteboard.textPlaceholder} style={[style, { alignSelf: 'stretch' }]} />
              ) : (
                <Text style={style}>{i.text}</Text>
              )}
            </View>
          );
        }
        const pos = { position: 'absolute' as const, left: i.x * S + tx, top: i.y * S + ty, ...scaled };
        if (i.kind === 'image')
          return <Image key={i.id} pointerEvents="none" source={{ uri: i.uri }} style={[pos, { width: i.w, height: i.h, borderRadius: 10 }]} />;
        if (i.kind === 'sticker')
          return (
            <Text key={i.id} pointerEvents="none" style={[pos, { fontSize: i.size, lineHeight: i.size * 1.2 }]}>
              {i.emoji}
            </Text>
          );
        if (i.kind === 'note')
          return (
            <View
              key={i.id}
              pointerEvents={editing ? 'auto' : 'none'}
              style={[pos, { width: i.w, minHeight: i.w * 0.8, padding: 10, borderRadius: 6, backgroundColor: ink.sticky, transform: [...scaled.transform, { rotate: '-1.5deg' }] }]}
            >
              {editing ? (
                <TextInput
                  autoFocus
                  multiline
                  value={i.text}
                  onChangeText={(v) => setText(i.id, v)}
                  onBlur={finishEditing}
                  placeholder={t.whiteboard.notePlaceholder}
                  placeholderTextColor="rgba(58,50,0,0.45)"
                  style={{ fontSize: 15, lineHeight: 20, color: ink.onSticky, padding: 0 }}
                />
              ) : (
                <Text style={{ fontSize: 15, lineHeight: 20, color: ink.onSticky }}>{i.text || t.whiteboard.notePlaceholder}</Text>
              )}
            </View>
          );
        const textStyle = { fontSize: textMetrics.size, lineHeight: textMetrics.lineHeight, color: i.color, padding: 0, minWidth: 40 };
        return editing ? (
          <TextInput key={i.id} autoFocus multiline value={i.text} onChangeText={(v) => setText(i.id, v)} onBlur={finishEditing} placeholder={t.whiteboard.textPlaceholder} style={[pos, textStyle]} />
        ) : (
          <Text key={i.id} pointerEvents="none" style={[pos, textStyle]}>
            {i.text}
          </Text>
        );
      })}

      <Svg pointerEvents="none" width={box.w} height={box.h} style={fill}>
        <G transform={translate}>
          <StrokeLayer strokes={inks} />
          {liveStroke && liveStroke.tool !== 'highlighter' && <StrokeShape s={liveStroke} />}
          {rect && <SvgRect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="rgba(31,111,235,0.08)" stroke={ink.selection} strokeWidth={1.5} strokeDasharray="6 4" />}
          {lasso && <Path d={`${pathD(lasso)} Z`} fill="rgba(31,111,235,0.08)" stroke={ink.selection} strokeWidth={1.5} strokeDasharray="6 4" />}
          {selectedBox && !rect && !lasso && (
            <SvgRect
              x={selectedBox.x - 6}
              y={selectedBox.y - 6}
              width={selectedBox.w + 12}
              height={selectedBox.h + 12}
              rx={6}
              fill="rgba(31,111,235,0.05)"
              stroke={ink.selection}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          )}
          {eraser && <Circle cx={eraser.x} cy={eraser.y} r={eraserR} fill="rgba(128,128,128,0.15)" stroke="rgba(128,128,128,0.8)" strokeWidth={1 / S} />}
          {measure && (
            <SvgText x={measure.at.x + 10} y={measure.at.y - 10} fontSize={13} fontWeight="600" fill={ink.selection}>
              {`${measure.cm.toLocaleString(locale, { maximumFractionDigits: 1 })} cm`}
            </SvgText>
          )}
        </G>
        {ruler && <RulerSvg r={ruler} dark={isDark} />}
      </Svg>

      {items.map((i) =>
        i.kind === 'audio' ? (
          <Pressable
            key={i.id}
            pointerEvents={tool === 'select' ? 'none' : 'auto'}
            onPress={() => onOpenAudio(i.id)}
            accessibilityRole="button"
            accessibilityLabel={t.whiteboard.audio.play}
            style={{ position: 'absolute', left: i.x * S + tx, top: i.y * S + ty, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: ink.selection }}
          >
            <MaterialCommunityIcons name={i.comment ? 'message-processing-outline' : 'volume-high'} size={22} color="#FFFFFF" />
          </Pressable>
        ) : null,
      )}

      {tool === 'select' && selectedBox && !rect && !lasso && (
        <Pressable
          onPress={deleteSelection}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t.whiteboard.deleteSelection}
          style={{
            position: 'absolute',
            left: (selectedBox.x + selectedBox.w + 6) * S + tx - 14,
            top: (selectedBox.y - 6) * S + ty - 14,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ink.selection,
          }}
        >
          <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
        </Pressable>
      )}

      {page && (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityLabel={t.whiteboard.pageNumber(pageNumber)}
          style={{
            position: 'absolute',
            top: insets.top + 64,
            alignSelf: 'center',
            minWidth: 40,
            height: 40,
            paddingHorizontal: 8,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ink.selection,
            opacity: badge,
            transform: [{ scale: badge.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>{pageNumber}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const fill = { position: 'absolute' as const, left: 0, top: 0, right: 0, bottom: 0 };

/** Righello: tacche in mm e cm su entrambi i bordi, angolo al centro. */
function RulerSvg({ r, dark }: { r: Ruler; dark: boolean }) {
  const deg = ((((r.angle * 180) / Math.PI) % 180) + 180) % 180;
  const half = r.length / 2;
  const th = r.thickness / 2;
  const fg = dark ? '#F4F4F6' : '#16161A';
  const ticks = [];
  const mm = CM / 10;
  const count = Math.floor(r.length / mm);
  for (let k = 0; k <= count; k++) {
    const x = -half + k * mm;
    const len = k % 10 === 0 ? 14 : k % 5 === 0 ? 10 : 6;
    ticks.push(<Line key={`t${k}`} x1={x} y1={-th} x2={x} y2={-th + len} stroke={fg} strokeWidth={1} />);
    ticks.push(<Line key={`b${k}`} x1={x} y1={th} x2={x} y2={th - len} stroke={fg} strokeWidth={1} />);
    if (k % 10 === 0 && k > 0 && k < count)
      ticks.push(
        <SvgText key={`n${k}`} x={x} y={-th + 26} fontSize={10} fill={fg} textAnchor="middle">
          {String(k / 10)}
        </SvgText>,
      );
  }
  return (
    <G transform={`translate(${r.cx} ${r.cy}) rotate(${(r.angle * 180) / Math.PI})`}>
      <SvgRect x={-half} y={-th} width={r.length} height={r.thickness} rx={8} fill={dark ? 'rgba(60,60,70,0.78)' : 'rgba(235,235,240,0.82)'} stroke={fg} strokeOpacity={0.25} />
      {ticks}
      <G transform={`rotate(${-(r.angle * 180) / Math.PI})`}>
        <Circle r={24} fill={dark ? '#17171C' : '#FFFFFF'} stroke={ink.selection} strokeWidth={1.5} />
        <SvgText y={5} fontSize={13} fontWeight="700" fill={ink.selection} textAnchor="middle">
          {`${Math.round(deg)}°`}
        </SvgText>
      </G>
    </G>
  );
}

const StrokeLayer = memo(function StrokeLayer({ strokes }: { strokes: Stroke[] }) {
  return (
    <>
      {strokes.map((s) => (
        <StrokeShape key={s.id} s={s} />
      ))}
    </>
  );
});

export function StrokeShape({ s }: { s: Stroke }) {
  const opacity = s.tool === 'highlighter' ? ink.highlighterOpacity : s.tool === 'pencil' ? ink.pencilOpacity : 1;
  if (s.style === 'brush') return <Path d={brushOutline(s.points, s.width * 1.6)} fill={s.color} opacity={opacity} />;
  return (
    <Path
      d={pathD(s.points)}
      stroke={s.color}
      strokeWidth={s.width}
      strokeLinecap={s.tool === 'highlighter' && s.style === 'solid' ? 'butt' : 'round'}
      strokeLinejoin="round"
      strokeDasharray={dashArray(s.style, s.width)}
      fill="none"
      opacity={opacity}
    />
  );
}
