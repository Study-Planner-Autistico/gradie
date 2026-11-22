import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassButton } from '../../components/Glass';
import { Canvas, type Brush, type SelectMode, type ShapeStyle, type Tool } from '../../components/whiteboard/Canvas';
import { CM, type Ruler } from '../../components/whiteboard/geometry';
import { AddPanel, AudioPanel, RecordPanel, type Picked } from '../../components/whiteboard/Sheets';
import { isStrokeTool, Toolbar, type Panel } from '../../components/whiteboard/Toolbar';
import { demoNotes } from '../../data/demo';
import { t } from '../../i18n';
import { getViewport, newId, saveViewport, useBoard, type BoardItem, type Pt, type StrokeTool } from '../../state/whiteboard';
import { ink, useTheme } from '../../theme';

type Sheet = { kind: 'none' } | { kind: 'add' } | { kind: 'record' } | { kind: 'audio'; id: string };

const initialBrush = (tool: StrokeTool, dark: boolean): Brush => ({
  color: (dark ? ink[tool].dark : ink[tool].light)[0],
  width: ink.widths[tool][1],
  style: 'solid',
  stabilization: 1,
});

/** Lavagna di una nota (dec. 110): scrittura libera e strumenti in basso. */
export default function Lavagna() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, isDark } = useTheme();
  const [items, update] = useBoard(id ?? 'new');
  const [tool, setTool] = useState<Tool>('pen');
  const [brushes, setBrushes] = useState<Record<StrokeTool, Brush>>(() => ({
    pen: initialBrush('pen', isDark),
    pencil: initialBrush('pencil', isDark),
    highlighter: initialBrush('highlighter', isDark),
  }));
  const [panel, setPanel] = useState<Panel>('none');
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' });
  // Si riparte dalla visuale con cui si era lasciata la pagina.
  const [offset, setOffset] = useState<Pt>(() => {
    const vp = getViewport(id ?? 'new');
    return vp ? { x: -vp.x, y: -vp.y } : { x: 0, y: 0 };
  });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ruler, setRuler] = useState<Ruler | null>(null);
  const [selectMode, setSelectMode] = useState<SelectMode>('rect');
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>(() => ({
    shape: 'square',
    fill: null,
    stroke: (isDark ? ink.pen.dark : ink.pen.light)[0],
    strokeWidth: 2,
  }));

  // All'uscita salva la visuale: l'anteprima in Note mostra proprio questa parte di pagina.
  const view = useRef({ offset, size });
  view.current = { offset, size };
  useEffect(() => {
    const key = id ?? 'new';
    return () => saveViewport(key, { x: -view.current.offset.x, y: -view.current.offset.y, w: view.current.size.w, h: view.current.size.h });
  }, [id]);

  const toggleRuler = () =>
    setRuler((r) => (r ? null : { cx: size.w / 2, cy: size.h / 2.4, angle: 0, length: 12 * CM, thickness: 64 }));
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const title = demoNotes.find((n) => n.id === id)?.title ?? t.whiteboard.untitled;
  const brush = isStrokeTool(tool) ? brushes[tool] : null;
  const ink0 = (isDark ? ink.pen.dark : ink.pen.light)[0];

  const chooseTool = (next: Tool) => {
    setTool(next);
    if (next !== 'select') setSelected([]);
    setSheet({ kind: 'none' });
  };

  /** Punto visibile al centro della lavagna, dove compaiono gli elementi aggiunti. */
  const center = (w = 0, h = 0): Pt => ({ x: size.w / 2 - offset.x - w / 2, y: size.h / 2.6 - offset.y - h / 2 });

  const add = (item: BoardItem) => {
    update((prev) => [...prev, item]);
    setSheet({ kind: 'none' });
  };

  const addImage = (p: Picked) => {
    const w = Math.min(220, size.w * 0.6);
    const h = p.width > 0 ? (w * p.height) / p.width : w;
    add({ kind: 'image', id: newId('img'), ...center(w, h), w, h, uri: p.uri });
  };

  const audio = sheet.kind === 'audio' ? items.find((i) => i.id === sheet.id) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? ink.paper.dark : ink.paper.light }}>
      <Canvas
        items={items}
        update={update}
        tool={tool}
        brush={brush ?? brushes.pen}
        textColor={ink0}
        selectMode={selectMode}
        shapeStyle={shapeStyle}
        ruler={ruler}
        setRuler={setRuler}
        offset={offset}
        setOffset={setOffset}
        selected={selected}
        setSelected={setSelected}
        editingId={editingId}
        setEditingId={(v) => {
          setEditingId(v);
          if (v) setPanel('none');
        }}
        onOpenAudio={(aid) => setSheet({ kind: 'audio', id: aid })}
        onSize={setSize}
      />

      <SafeAreaView edges={['top']} pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
        <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <GlassButton icon="chevron-back" label={t.whiteboard.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/attivita'))} />
          <Text style={[typography.headline, { color: colors.text, flex: 1 }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <View pointerEvents="box-none" style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm, alignItems: 'center' }}>
          {sheet.kind === 'add' && (
            <AddPanel
              onClose={() => setSheet({ kind: 'none' })}
              onImage={addImage}
              onSticker={(emoji) => add({ kind: 'sticker', id: newId('st'), ...center(58, 58), emoji, size: 48 })}
              onNote={() => {
                const nid = newId('n');
                add({ kind: 'note', id: nid, ...center(170, 136), w: 170, text: '' });
                setEditingId(nid);
              }}
            />
          )}
          {sheet.kind === 'record' && (
            <RecordPanel
              onClose={() => setSheet({ kind: 'none' })}
              onDone={(uri, seconds) => add({ kind: 'audio', id: newId('au'), ...center(44, 44), uri, seconds, comment: '' })}
            />
          )}
          {audio?.kind === 'audio' && (
            <AudioPanel
              key={audio.id}
              uri={audio.uri}
              seconds={audio.seconds}
              comment={audio.comment}
              onComment={(c) => update((prev) => prev.map((i) => (i.id === audio.id && i.kind === 'audio' ? { ...i, comment: c } : i)))}
              onClose={() => setSheet({ kind: 'none' })}
            />
          )}
          <Toolbar
            tool={tool}
            onTool={chooseTool}
            onAdd={() => {
              setPanel('none');
              setSheet(sheet.kind === 'add' ? { kind: 'none' } : { kind: 'add' });
            }}
            onAudio={() => {
              setPanel('none');
              setSheet(sheet.kind === 'record' ? { kind: 'none' } : { kind: 'record' });
            }}
            brush={brush}
            setBrush={(b) => isStrokeTool(tool) && setBrushes((prev) => ({ ...prev, [tool]: { ...prev[tool], ...b } }))}
            panel={panel}
            setPanel={setPanel}
            rulerOn={ruler !== null}
            onRuler={toggleRuler}
            selectMode={selectMode}
            setSelectMode={(m) => {
              setSelectMode(m);
              setPanel('none');
            }}
            shapeStyle={shapeStyle}
            setShapeStyle={(st) => setShapeStyle((prev) => ({ ...prev, ...st }))}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
