import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass } from '../../components/Glass';
import { IconButton } from '../../components/ui';
import { Canvas, type Brush, type EraserMode, type SelectMode, type ShapeStyle, type Tool } from '../../components/whiteboard/Canvas';
import { CM, type Ruler } from '../../components/whiteboard/geometry';
import { AddPanel, AudioPanel, RecordPanel, type Picked } from '../../components/whiteboard/Sheets';
import { isStrokeTool, Toolbar, type Dock, type Panel } from '../../components/whiteboard/Toolbar';
import { demoNotes } from '../../data/demo';
import { t } from '../../i18n';
import {
  getNoteMeta,
  getViewport,
  markOpened,
  newId,
  redoBoard,
  revertGroup,
  saveViewport,
  undoBoard,
  useBoard,
  useHistory,
  type BoardItem,
  type Pt,
  type StrokeTool,
} from '../../state/whiteboard';
import { pageSize } from '../../components/whiteboard/Paper';
import { ink, useTheme } from '../../theme';
import { Icon } from '../../components/icons';

type Sheet = { kind: 'none' } | { kind: 'add' } | { kind: 'record' } | { kind: 'audio'; id: string; fresh?: boolean };

const initialBrush = (tool: StrokeTool, dark: boolean): Brush => ({
  color: (dark ? ink[tool].dark : ink[tool].light)[0],
  width: ink.widths[tool][1],
  style: 'solid',
  // Stabilizzazione bassa di partenza in ogni nuova pagina (dec. 181).
  stabilization: 0,
});

/** Lavagna di una nota (dec. 110): scrittura libera e strumenti in basso. */
export default function Lavagna() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, isDark: themeDark } = useTheme();
  const meta = getNoteMeta(id ?? '');
  // Su carta scura l'inchiostro principale è chiaro, e viceversa (dec. 112).
  const isDark = meta ? meta.paper.dark : themeDark;
  const boardId = id ?? 'new';
  const [items, update] = useBoard(boardId);
  const { canUndo, canRedo } = useHistory(boardId);
  const undo = () => {
    setEditingId(null);
    undoBoard(boardId);
  };
  const redo = () => {
    setEditingId(null);
    redoBoard(boardId);
  };
  const [tool, setTool] = useState<Tool>('pen');
  const [brushes, setBrushes] = useState<Record<StrokeTool, Brush>>(() => ({
    pen: initialBrush('pen', isDark),
    pencil: initialBrush('pencil', isDark),
    highlighter: initialBrush('highlighter', isDark),
  }));
  const [panel, setPanel] = useState<Panel>('none');
  const [dock, setDock] = useState<Dock>('bottom');
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' });
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Si riparte dalla visuale con cui si era lasciata la pagina.
  const [freeOffset, setFreeOffset] = useState<Pt>(() => {
    const vp = getViewport(id ?? 'new');
    return vp ? { x: -vp.x, y: -vp.y } : { x: 0, y: 0 };
  });
  // Nota con carta (dec. 117): il foglio occupa tutta la larghezza ed è fermo ai lati; si scorre solo in verticale.
  // `top` è il punto del foglio in cima allo schermo, in unità del foglio; null = inizio del foglio sotto l'intestazione.
  const page = meta ? pageSize(meta.paper) : null;
  const scale = page && size.w > 0 ? size.w / page.w : 1;
  const headerH = insets.top + 56;
  const [top, setTop] = useState<number | null>(() => (meta ? (getViewport(id ?? 'new')?.y ?? null) : null));
  const minTop = -headerH / scale;
  const topNow = Math.max(minTop, top ?? minTop);
  const offset: Pt = page ? { x: 0, y: -topNow * scale } : freeOffset;
  const setOffset = (p: Pt) => (page ? setTop(Math.max(minTop, -p.y / scale)) : setFreeOffset(p));
  const [ruler, setRuler] = useState<Ruler | null>(null);
  const [selectMode, setSelectMode] = useState<SelectMode>('rect');
  const [eraserMode, setEraserMode] = useState<EraserMode>('partial');
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>(() => ({
    shape: 'square',
    fill: null,
    stroke: (isDark ? ink.pen.dark : ink.pen.light)[0],
    strokeWidth: 2,
  }));

  // All'uscita salva la visuale: l'anteprima in Note mostra proprio questa parte di pagina.
  const view = useRef({ offset, size, scale });
  view.current = { offset, size, scale };
  useEffect(() => {
    const key = id ?? 'new';
    markOpened(key);
    return () => {
      const v = view.current;
      saveViewport(key, { x: -v.offset.x / v.scale, y: -v.offset.y / v.scale, w: v.size.w / v.scale, h: v.size.h / v.scale });
    };
  }, [id]);

  const toggleRuler = () =>
    setRuler((r) => (r ? null : { cx: size.w / 2, cy: size.h / 2.4, angle: 0, length: 12 * CM, thickness: 64 }));
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const title = meta?.title ?? demoNotes.find((n) => n.id === id)?.title ?? t.whiteboard.untitled;

  const brush = isStrokeTool(tool) ? brushes[tool] : null;
  const ink0 = (isDark ? ink.pen.dark : ink.pen.light)[0];

  const chooseTool = (next: Tool) => {
    setTool(next);
    if (next !== 'select') setSelected([]);
    setSheet({ kind: 'none' });
  };

  /** Punto visibile al centro della lavagna, dove compaiono gli elementi aggiunti. */
  const center = (w = 0, h = 0): Pt => ({ x: (size.w / 2 - offset.x) / scale - w / 2, y: (size.h / 2.6 - offset.y) / scale - h / 2 });

  const add = (item: BoardItem) => {
    update((prev) => [...prev, item]);
    setSheet({ kind: 'none' });
  };

  const addImage = (p: Picked) => {
    const w = Math.min(220, (size.w * 0.6) / scale);
    const h = p.width > 0 ? (w * p.height) / p.width : w;
    add({ kind: 'image', id: newId('img'), ...center(w, h), w, h, uri: p.uri });
  };

  const audio = sheet.kind === 'audio' ? items.find((i) => i.id === sheet.id) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Canvas
        items={items}
        update={update}
        tool={tool}
        brush={brush ?? brushes.pen}
        textColor={ink0}
        paper={meta?.paper}
        selectMode={selectMode}
        eraserMode={eraserMode}
        shapeStyle={shapeStyle}
        ruler={ruler}
        setRuler={setRuler}
        offset={offset}
        setOffset={setOffset}
        scale={scale}
        selected={selected}
        setSelected={setSelected}
        editingId={editingId}
        setEditingId={(v) => {
          setEditingId(v);
          if (v) setPanel('none');
        }}
        onOpenAudio={(aid) => setSheet({ kind: 'audio', id: aid })}
        activeAudio={sheet.kind === 'audio' ? sheet.id : null}
        onDeleteAudio={(aid) => {
          update((prev) => prev.filter((i) => i.id !== aid));
          setSheet({ kind: 'none' });
        }}
        onSize={setSize}
        onUndo={undo}
        onRedo={redo}
        onRevert={(g) => revertGroup(boardId, g)}
      />

      {/* Con un pannello aperto sopra la lavagna, il primo tocco la chiude soltanto, senza scrivere (dec. 177).
          Le opzioni nella barra restano aperte: scegliendo la penna si scrive subito (dec. 185). */}
      {(panel === 'colors' || panel === 'style' || (tool === 'shapes' && panel !== 'none')) && (
        <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} onResponderGrant={() => setPanel('options')} />
      )}

      {/* Annulla e ripeti, a destra a metà altezza (dec. 116); a sinistra se la barra è a destra (dec. 185). */}
      <SafeAreaView
        edges={[dock === 'right' ? 'left' : 'right']}
        pointerEvents="box-none"
        style={[{ position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' }, dock === 'right' ? { left: 0 } : { right: 0 }]}
      >
        <Glass style={{ borderRadius: 22, padding: 4, gap: 2, marginHorizontal: spacing.sm }}>
          <HistoryButton icon="undo" label={t.whiteboard.undo} disabled={!canUndo} onPress={undo} />
          <HistoryButton icon="redo" label={t.whiteboard.redo} disabled={!canRedo} onPress={redo} />
        </Glass>
      </SafeAreaView>

      <SafeAreaView edges={['top', 'left', 'right']} pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
        <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <IconButton icon="chevron-back" label={t.whiteboard.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/attivita'))} appearance="plain" />
          <Text style={[typography.headline, { color: colors.text, flex: 1 }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </SafeAreaView>

      {/* Barra degli strumenti attaccata a un bordo; si sposta trascinando la maniglia (dec. 185). */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: headerH, bottom: 0 }}>
        <Toolbar
          key={dock}
          dock={dock}
          onDock={setDock}
          extra={
            <>
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
                  onDone={(uri, seconds) => {
                    // Appena registrata resta aperta: si riascolta, si sposta trascinandola o si elimina con la x (dec. 178).
                    const aid = newId('au');
                    add({ kind: 'audio', id: aid, ...center(44, 44), uri, seconds, comment: '' });
                    setSheet({ kind: 'audio', id: aid, fresh: true });
                  }}
                />
              )}
              {audio?.kind === 'audio' && (
                <AudioPanel
                  key={audio.id}
                  uri={audio.uri}
                  seconds={audio.seconds}
                  comment={audio.comment}
                  autoPlay={!(sheet.kind === 'audio' && sheet.fresh)}
                  onComment={(c) => update((prev) => prev.map((i) => (i.id === audio.id && i.kind === 'audio' ? { ...i, comment: c } : i)))}
                  onClose={() => setSheet({ kind: 'none' })}
                />
              )}
            </>
          }
          tool={tool}
          onTool={chooseTool}
          sheet={sheet.kind === 'add' ? 'add' : sheet.kind === 'record' ? 'audio' : null}
          onAdd={() => {
            setPanel('none');
            setSelected([]);
            setSheet(sheet.kind === 'add' ? { kind: 'none' } : { kind: 'add' });
          }}
          onAudio={() => {
            setPanel('none');
            setSelected([]);
            setSheet(sheet.kind === 'record' ? { kind: 'none' } : { kind: 'record' });
          }}
          brush={brush}
          setBrush={(b) => isStrokeTool(tool) && setBrushes((prev) => ({ ...prev, [tool]: { ...prev[tool], ...b } }))}
          panel={panel}
          setPanel={setPanel}
          rulerOn={ruler !== null}
          onRuler={toggleRuler}
          selectMode={selectMode}
          setSelectMode={setSelectMode}
          eraserMode={eraserMode}
          setEraserMode={setEraserMode}
          shapeStyle={shapeStyle}
          setShapeStyle={(st) => setShapeStyle((prev) => ({ ...prev, ...st }))}
          inkDark={isDark}
        />
      </View>
    </View>
  );
}

function HistoryButton({ icon, label, disabled, onPress }: { icon: 'undo' | 'redo'; label: string; disabled: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
    >
      <Icon name={icon} size={22} color={disabled ? colors.textTertiary : colors.text} />
    </Pressable>
  );
}
