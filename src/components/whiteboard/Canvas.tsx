import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { memo, useRef, useState } from 'react';
import { Image, Pressable, Text, TextInput, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, G, Path, Rect as SvgRect } from 'react-native-svg';
import { t } from '../../i18n';
import {
  newId,
  type BoardItem,
  type LineStyle,
  type Pt,
  type Stabilization,
  type Stroke,
  type StrokeTool,
} from '../../state/whiteboard';
import { ink, useTheme } from '../../theme';
import { bounds, brushOutline, contains, dashArray, hitsStroke, intersects, moveItem, pathD, rectFrom, stabilize, textMetrics, union, type Rect } from './geometry';

export type Tool = StrokeTool | 'eraser' | 'text' | 'select' | 'hand';
export type Brush = { color: string; width: number; style: LineStyle; stabilization: Stabilization };

const ERASER_RADIUS = 10;

type Drag =
  | { mode: 'draw'; points: Pt[] }
  | { mode: 'erase' }
  | { mode: 'pan'; startPage: Pt; startOffset: Pt }
  | { mode: 'rect'; start: Pt }
  | { mode: 'move'; last: Pt }
  | { mode: 'tap'; start: Pt; moved: boolean };

export function Canvas({
  items,
  update,
  tool,
  brush,
  textColor,
  offset,
  setOffset,
  selected,
  setSelected,
  editingId,
  setEditingId,
  onOpenAudio,
  onSize,
}: {
  items: BoardItem[];
  update: (fn: (prev: BoardItem[]) => BoardItem[]) => void;
  tool: Tool;
  brush: Brush;
  textColor: string;
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
  const [live, setLive] = useState<Pt[] | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [eraser, setEraser] = useState<Pt | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const selectedBox = union(items.filter((i) => selected.includes(i.id)).map(bounds));

  const page = (e: GestureResponderEvent): Pt => ({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
  const toCanvas = (e: GestureResponderEvent): Pt => ({
    x: e.nativeEvent.pageX - origin.current.x - offset.x,
    y: e.nativeEvent.pageY - origin.current.y - offset.y,
  });

  const eraseAt = (p: Pt) => {
    if (itemsRef.current.some((i) => i.kind === 'stroke' && hitsStroke(i, p, ERASER_RADIUS))) {
      update((prev) => prev.filter((i) => !(i.kind === 'stroke' && hitsStroke(i, p, ERASER_RADIUS))));
    }
  };

  const onGrant = (e: GestureResponderEvent) => {
    // I livelli sopra il canvas non ricevono tocchi: location è relativa al canvas.
    origin.current = { x: e.nativeEvent.pageX - e.nativeEvent.locationX, y: e.nativeEvent.pageY - e.nativeEvent.locationY };
    if (editingId) setEditingId(null);
    const p = toCanvas(e);
    switch (tool) {
      case 'pen':
      case 'pencil':
      case 'highlighter':
        drag.current = { mode: 'draw', points: [p] };
        setLive([p]);
        break;
      case 'eraser':
        drag.current = { mode: 'erase' };
        setEraser(p);
        eraseAt(p);
        break;
      case 'hand':
        drag.current = { mode: 'pan', startPage: page(e), startOffset: offset };
        break;
      case 'select':
        if (selectedBox && contains(selectedBox, p)) drag.current = { mode: 'move', last: p };
        else {
          drag.current = { mode: 'rect', start: p };
          setRect({ x: p.x, y: p.y, w: 0, h: 0 });
        }
        break;
      case 'text':
        drag.current = { mode: 'tap', start: p, moved: false };
        break;
    }
  };

  const onMove = (e: GestureResponderEvent) => {
    const d = drag.current;
    if (!d || e.nativeEvent.touches.length > 1) return;
    const p = toCanvas(e);
    switch (d.mode) {
      case 'draw': {
        const last = d.points[d.points.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
        d.points.push(p);
        setLive([...d.points]);
        break;
      }
      case 'erase':
        setEraser(p);
        eraseAt(p);
        break;
      case 'pan': {
        const now = page(e);
        setOffset({ x: d.startOffset.x + now.x - d.startPage.x, y: d.startOffset.y + now.y - d.startPage.y });
        break;
      }
      case 'rect':
        setRect(rectFrom(d.start, p));
        break;
      case 'move': {
        const dx = p.x - d.last.x;
        const dy = p.y - d.last.y;
        d.last = p;
        update((prev) => prev.map((i) => (selected.includes(i.id) ? moveItem(i, dx, dy) : i)));
        break;
      }
      case 'tap':
        if (Math.hypot(p.x - d.start.x, p.y - d.start.y) > 6) d.moved = true;
        break;
    }
  };

  const onRelease = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    switch (d.mode) {
      case 'draw': {
        const stroke: Stroke = {
          kind: 'stroke',
          id: newId('s'),
          tool: tool as StrokeTool,
          color: brush.color,
          width: brush.width,
          style: brush.style,
          points: stabilize(d.points, brush.stabilization),
        };
        update((prev) => [...prev, stroke]);
        setLive(null);
        break;
      }
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
      case 'tap': {
        if (d.moved) break;
        const hit = [...itemsRef.current].reverse().find((i) => (i.kind === 'text' || i.kind === 'note') && contains(bounds(i), d.start));
        if (hit) setEditingId(hit.id);
        else {
          const id = newId('t');
          update((prev) => [...prev, { kind: 'text', id, x: d.start.x, y: d.start.y - textMetrics.lineHeight / 2, text: '', color: textColor }]);
          setEditingId(id);
        }
        break;
      }
    }
  };

  const finishEditing = () => {
    const id = editingId;
    setEditingId(null);
    update((prev) => prev.filter((i) => !(i.id === id && i.kind === 'text' && i.text.trim() === '')));
  };

  const setText = (id: string, text: string) =>
    update((prev) => prev.map((i) => (i.id === id && (i.kind === 'text' || i.kind === 'note') ? { ...i, text } : i)));

  const highlights = items.filter((i): i is Stroke => i.kind === 'stroke' && i.tool === 'highlighter');
  const inks = items.filter((i): i is Stroke => i.kind === 'stroke' && i.tool !== 'highlighter');
  const liveStroke: Stroke | null = live
    ? { kind: 'stroke', id: 'live', tool: tool as StrokeTool, color: brush.color, width: brush.width, style: brush.style, points: live }
    : null;
  const translate = `translate(${offset.x} ${offset.y})`;

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? ink.paper.dark : ink.paper.light, overflow: 'hidden' }}
      onLayout={(e) => {
        const next = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
        setBox(next);
        onSize(next);
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onRelease}
      onResponderTerminate={onRelease}
    >
      <Svg pointerEvents="none" width={box.w} height={box.h} style={fill}>
        <G transform={translate}>
          <StrokeLayer strokes={highlights} />
          {liveStroke?.tool === 'highlighter' && <StrokeShape s={liveStroke} />}
        </G>
      </Svg>

      {items.map((i) => {
        if (i.kind === 'stroke' || i.kind === 'audio') return null;
        const pos = { position: 'absolute' as const, left: i.x + offset.x, top: i.y + offset.y };
        const editing = editingId === i.id;
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
              style={[pos, { width: i.w, minHeight: i.w * 0.8, padding: 10, borderRadius: 6, backgroundColor: ink.sticky, transform: [{ rotate: '-1.5deg' }] }]}
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
          <TextInput
            key={i.id}
            autoFocus
            multiline
            value={i.text}
            onChangeText={(v) => setText(i.id, v)}
            onBlur={finishEditing}
            placeholder={t.whiteboard.textPlaceholder}
            style={[pos, textStyle]}
          />
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
          {selectedBox && !rect && (
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
          {eraser && <Circle cx={eraser.x} cy={eraser.y} r={ERASER_RADIUS} fill="rgba(128,128,128,0.15)" stroke="rgba(128,128,128,0.8)" strokeWidth={1} />}
        </G>
      </Svg>

      {items.map((i) =>
        i.kind === 'audio' ? (
          <Pressable
            key={i.id}
            pointerEvents={tool === 'select' ? 'none' : 'auto'}
            onPress={() => onOpenAudio(i.id)}
            accessibilityRole="button"
            accessibilityLabel={t.whiteboard.audio.play}
            style={{
              position: 'absolute',
              left: i.x + offset.x,
              top: i.y + offset.y,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: ink.selection,
            }}
          >
            <MaterialCommunityIcons name={i.comment ? 'message-processing-outline' : 'volume-high'} size={22} color="#FFFFFF" />
          </Pressable>
        ) : null,
      )}
    </View>
  );
}

const fill = { position: 'absolute' as const, left: 0, top: 0, right: 0, bottom: 0 };

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
