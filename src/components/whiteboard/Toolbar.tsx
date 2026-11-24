import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Path } from 'react-native-svg';
import { t } from '../../i18n';
import type { LineStyle, Stabilization, StrokeTool } from '../../state/whiteboard';
import { ink, useTheme } from '../../theme';
import type { Brush, EraserMode, SelectMode, ShapeStyle, Tool } from './Canvas';
import { brushOutline, dashArray } from './geometry';
import { SHAPES, ShapeSvg } from './shapes';
import { Icon, type IconName } from '../icons';
import { ART_FULL, ART_H, ART_W, ToolArt, type ArtKey } from './toolArt';

type Key = Tool | 'add' | 'audio' | 'more' | 'less' | 'ruler';

/** Strumenti nell'ordine della dec. 110; la freccia mostra al loro posto righello e forme (dec. 111, 116). */
const TOOLS: ArtKey[] = ['pen', 'pencil', 'highlighter', 'eraser', 'text', 'select', 'add', 'audio', 'hand'];
const EXTRA: ArtKey[] = ['ruler', 'shapes'];

const STYLES: LineStyle[] = ['solid', 'brush', 'dashed', 'dotted'];
export const isStrokeTool = (x: string): x is StrokeTool => x === 'pen' || x === 'pencil' || x === 'highlighter';
/** Strumenti con opzioni: scelti, le mostrano subito nella barra; toccati di nuovo le nascondono. */
const hasOptions = (x: string) => isStrokeTool(x) || x === 'select' || x === 'shapes' || x === 'eraser';

export type Panel = 'none' | 'options' | 'colors' | 'style';
/** Bordo dello schermo a cui è attaccata la barra (dec. 177). */
export type Dock = 'top' | 'bottom' | 'left' | 'right';

/** Lato della barra: spessore e dimensione di ogni casella. */
const BAR = 64;
const TILE = 40;

export function Toolbar({
  tool,
  onTool,
  onAdd,
  onAudio,
  sheet = null,
  brush,
  setBrush,
  panel,
  setPanel,
  rulerOn,
  onRuler,
  selectMode,
  setSelectMode,
  eraserMode,
  setEraserMode,
  shapeStyle,
  setShapeStyle,
  inkDark,
  dock,
  onDock,
  extra,
}: {
  tool: Tool;
  onTool: (t: Tool) => void;
  onAdd: () => void;
  onAudio: () => void;
  /** Pannello Aggiungi o audio aperto: è lui lo strumento alzato, non quello di prima (dec. 181). */
  sheet?: 'add' | 'audio' | null;
  brush: Brush | null;
  setBrush: (b: Partial<Brush>) => void;
  panel: Panel;
  setPanel: (p: Panel) => void;
  rulerOn: boolean;
  onRuler: () => void;
  selectMode: SelectMode;
  setSelectMode: (m: SelectMode) => void;
  eraserMode: EraserMode;
  setEraserMode: (m: EraserMode) => void;
  shapeStyle: ShapeStyle;
  setShapeStyle: (s: Partial<ShapeStyle>) => void;
  /** Carta scura: servono inchiostri chiari. Se assente segue il tema. */
  inkDark?: boolean;
  dock: Dock;
  onDock: (d: Dock) => void;
  /** Pannelli della lavagna (aggiungi, registra, audio): compaiono accanto alla barra, dalla parte del foglio. */
  extra?: ReactNode;
}) {
  const { colors, spacing, isDark: themeDark } = useTheme();
  const isDark = inkDark ?? themeDark;
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const [more, setMore] = useState(false);
  const vertical = dock === 'left' || dock === 'right';

  const press = (key: Key) => {
    if (key === 'add') return onAdd();
    if (key === 'audio') return onAudio();
    if (key === 'ruler') return onRuler();
    // Passando all'altra metà della barra si chiude il pannello aperto (es. forme).
    if (key === 'more' || key === 'less') {
      setPanel('none');
      return setMore(key === 'more');
    }
    // Anche toccando lo strumento già scelto si chiudono Aggiungi e audio (dec. 180).
    if (key === tool && hasOptions(key)) {
      onTool(key);
      return setPanel(panel === 'none' ? 'options' : 'none');
    }
    setPanel(hasOptions(key) ? 'options' : 'none');
    onTool(key);
  };

  // Si trascina dalla maniglia; lasciata, la barra si attacca al bordo più vicino al dito.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      tx.value = e.translationX;
      ty.value = e.translationY;
    },
    onDeactivate: (e) => {
      'worklet';
      const d = [e.absoluteY, H - e.absoluteY, e.absoluteX, W - e.absoluteX];
      const i = d.indexOf(Math.min(...d));
      const next: Dock = (['top', 'bottom', 'left', 'right'] as const)[i];
      if (next === dock) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      } else scheduleOnRN(onDock, next);
    },
  });
  const drag = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const palette = isStrokeTool(tool) ? ink[tool] : null;
  const defaultInk = (k: StrokeTool) => (isDark ? ink[k].dark : ink[k].light)[0];
  const divider = (
    <View
      style={
        vertical
          ? {
              height: 1,
              width: TILE,
              marginVertical: spacing.xs,
              backgroundColor: colors.border,
            }
          : {
              width: 1,
              height: TILE,
              marginHorizontal: spacing.xs,
              backgroundColor: colors.border,
            }
      }
    />
  );
  const show = panel !== 'none';
  // Su schermi larghi le opzioni stanno nella barra dopo gli strumenti, come nel riferimento; sul telefono in una fascia attaccata alla barra.
  const inline = (vertical ? H - 120 : W) >= 820;
  const lead = inline ? divider : null;

  // Opzioni dello strumento scelto, nella barra accanto agli strumenti (dec. 177).
  let options: ReactNode = null;
  if (show && brush && palette && isStrokeTool(tool)) {
    options = (
      <>
        {lead}
        <Tile label={t.whiteboard.style} active={panel === 'style'} onPress={() => setPanel(panel === 'style' ? 'options' : 'style')} wide>
          <StylePreview style={brush.style} color={colors.text} small />
        </Tile>
        {divider}
        {ink.widths[tool].map((w, i) => (
          <Tile key={w} label={`${t.whiteboard.width} ${i + 1}`} active={brush.width === w} onPress={() => setBrush({ width: w })}>
            <View
              style={{
                width: 5 + i * 5,
                height: 5 + i * 5,
                borderRadius: 10,
                backgroundColor: colors.text,
              }}
            />
          </Tile>
        ))}
        {divider}
        {(isDark ? palette.dark : palette.light).map((c) => (
          <Swatch key={c} color={c} active={brush.color === c} onPress={() => setBrush({ color: c })} />
        ))}
        <Tile label={t.whiteboard.moreColors} active={panel === 'colors'} onPress={() => setPanel(panel === 'colors' ? 'options' : 'colors')}>
          <Icon name="plus" size={18} color={colors.text} />
        </Tile>
      </>
    );
  } else if (show && (tool === 'select' || tool === 'eraser')) {
    const opts: { m: string; icon: IconName; label: string }[] =
      tool === 'select'
        ? [
            {
              m: 'rect',
              icon: 'selection-drag',
              label: t.whiteboard.selectRect,
            },
            { m: 'lasso', icon: 'lasso', label: t.whiteboard.selectFree },
          ]
        : [
            { m: 'partial', icon: 'eraser', label: t.whiteboard.eraserPartial },
            {
              m: 'whole',
              icon: 'eraser-whole',
              label: t.whiteboard.eraserWhole,
            },
          ];
    const cur = tool === 'select' ? selectMode : eraserMode;
    options = (
      <>
        {lead}
        {opts.map((o) => (
          <Tile key={o.m} label={o.label} active={cur === o.m} onPress={() => (tool === 'select' ? setSelectMode(o.m as SelectMode) : setEraserMode(o.m as EraserMode))}>
            <Icon name={o.icon} size={20} color={cur === o.m ? colors.accent : colors.text} />
          </Tile>
        ))}
      </>
    );
  }

  const popover =
    brush && palette && panel === 'colors' ? (
      <Card
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          justifyContent: 'center',
          maxWidth: 300,
        }}
      >
        {palette.extra.map((c) => (
          <Swatch key={c} color={c} active={brush.color === c} onPress={() => setBrush({ color: c })} />
        ))}
      </Card>
    ) : brush && panel === 'style' ? (
      <StyleCard brush={brush} setBrush={setBrush} />
    ) : tool === 'shapes' && show ? (
      <ShapeOptions style={shapeStyle} setStyle={setShapeStyle} isDark={isDark} />
    ) : null;

  // Se c'è posto (iPad, telefono in orizzontale) tutti gli strumenti stanno su una riga, senza freccia (dec. 178).
  const oneRow = (vertical ? H - 120 : W) >= (TOOLS.length + EXTRA.length) * (ART_W + 2) + 80;
  const keys: (ArtKey | 'more' | 'less')[] = oneRow ? [...TOOLS, ...EXTRA] : more ? ['less', ...EXTRA] : [...TOOLS, 'more'];
  // Pannelli dalla parte del foglio: sopra la barra in basso, sotto quella in alto, di lato alle barre verticali.
  const direction = (
    {
      bottom: 'column',
      top: 'column-reverse',
      left: 'row-reverse',
      right: 'row',
    } as const
  )[dock];
  // Margine di sicurezza del bordo a cui è attaccata la barra: gli strumenti ci entrano fino al bordo dello schermo, il resto ne sta fuori.
  const edge = { bottom: insets.bottom, top: 0, left: insets.left, right: insets.right }[dock];
  const edgePad = { bottom: { paddingBottom: edge }, top: {}, left: { paddingLeft: edge }, right: { paddingRight: edge } }[dock];
  const pad = vertical ? { paddingBottom: insets.bottom } : { paddingLeft: insets.left, paddingRight: insets.right };

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      pointerEvents="box-none"
      style={[
        {
          flex: 1,
          flexDirection: direction,
          alignItems: 'center',
        },
        drag,
      ]}
    >
      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: dock === 'top' ? 'flex-start' : dock === 'bottom' ? 'flex-end' : 'center',
          alignItems: 'center',
          gap: spacing.sm,
          padding: spacing.md,
        }}
      >
        {popover}
        {extra}
      </View>
      <View style={{ alignSelf: 'stretch', flexDirection: direction, backgroundColor: colors.surface, boxShadow: colors.shadowOverlay }}>
        {!inline && options && (
          <Animated.View
            entering={FadeIn.duration(160)}
            style={[
              { borderColor: colors.border },
              vertical
                ? { width: BAR, [dock === 'left' ? 'borderLeftWidth' : 'borderRightWidth']: 1, paddingBottom: insets.bottom }
                : { height: BAR - 8, [dock === 'bottom' ? 'borderBottomWidth' : 'borderTopWidth']: 1, paddingLeft: insets.left, paddingRight: insets.right },
            ]}
          >
            <ScrollView
              horizontal={!vertical}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: spacing.sm }}
            >
              {options}
            </ScrollView>
          </Animated.View>
        )}
        <View
          style={[
            {
              alignSelf: 'stretch',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
            },
            vertical ? { width: BAR + edge } : { height: BAR + edge },
            pad,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View
              accessibilityLabel={t.whiteboard.moveToolbar}
              style={[
                {
                  width: vertical ? BAR + edge : 28,
                  height: vertical ? 28 : BAR + edge,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                edgePad,
              ]}
            >
              <Grip vertical={vertical} />
            </View>
          </GestureDetector>
          <ScrollView
            horizontal={!vertical}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              ...edgePad,
              flexGrow: 1,
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              paddingHorizontal: vertical ? 0 : spacing.sm,
              paddingVertical: vertical ? spacing.sm : 0,
            }}
          >
            {keys.map((k) => {
              if (k === 'more' || k === 'less')
                return (
                  <Pressable
                    key={k}
                    onPress={() => press(k)}
                    accessibilityRole="button"
                    accessibilityLabel={t.whiteboard.tools[k]}
                    hitSlop={6}
                    style={{
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: [{ rotate: vertical ? '90deg' : '0deg' }],
                    }}
                  >
                    <Icon name={k === 'more' ? 'chevron-right' : 'chevron-left'} size={20} color={colors.textSecondary} />
                  </Pressable>
                );
              const active = (sheet ? k === sheet : k === tool) || (k === 'ruler' && rulerOn);
              return (
                <ToolSlot key={k} label={t.whiteboard.tools[k]} active={active} dock={dock} edge={edge} onPress={() => press(k)}>
                  <ToolArt
                    tool={k}
                    color={isStrokeTool(k) ? (k === tool && brush ? brush.color : defaultInk(k)) : colors.text}
                    lasso={selectMode === 'lasso'}
                    eraserWhole={eraserMode === 'whole'}
                  turn={{ bottom: '0deg', top: '180deg', left: '-90deg', right: '90deg' }[dock]}
                  />
                </ToolSlot>
              );
            })}
            {inline && options}
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
}

/** Casella di uno strumento: l'illustrazione esce dal bordo della barra e, scelta, si allunga un poco (dec. 177). */
function ToolSlot({ label, active, dock, edge, onPress, children }: { label: string; active: boolean; dock: Dock; edge: number; onPress: () => void; children: ReactNode }) {
  const rise = useSharedValue(active ? 0 : 12);
  useEffect(() => {
    rise.value = withSpring(active ? 0 : 12, { damping: 14, stiffness: 220 });
  }, [active, rise]);
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: rise.value }] }));
  const vertical = dock === 'left' || dock === 'right';
  const sw = vertical ? ART_H + edge : ART_W + 2;
  const sh = vertical ? ART_W + 2 : ART_H + edge;
  // L'illustrazione, ruotata verso il foglio, ha la punta sul lato del foglio e la base oltre il bordo della barra.
  const at = {
    bottom: { left: (sw - ART_W) / 2, top: 0, rotate: '0deg', margin: { marginBottom: -edge } },
    top: { left: (sw - ART_W) / 2, top: sh - ART_FULL, rotate: '180deg', margin: {} },
    left: { left: sw - ART_FULL / 2 - ART_W / 2, top: sh / 2 - ART_FULL / 2, rotate: '90deg', margin: { marginLeft: -edge } },
    right: { left: ART_FULL / 2 - ART_W / 2, top: sh / 2 - ART_FULL / 2, rotate: '-90deg', margin: { marginRight: -edge } },
  }[dock];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[{ width: sw, height: sh, overflow: 'hidden' }, at.margin]}
    >
      <View style={{ position: 'absolute', left: at.left, top: at.top, width: ART_W, height: ART_FULL, transform: [{ rotate: at.rotate }] }}>
        <Animated.View style={lift}>{children}</Animated.View>
      </View>
    </Pressable>
  );
}

/** Maniglia a puntini per trascinare la barra. */
function Grip({ vertical }: { vertical: boolean }) {
  const { colors } = useTheme();
  const dot = (
    <View
      style={{
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textTertiary,
      }}
    />
  );
  const col = (
    <View style={{ gap: 4 }}>
      {dot}
      {dot}
      {dot}
    </View>
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        transform: [{ rotate: vertical ? '90deg' : '0deg' }],
      }}
    >
      {col}
      {col}
    </View>
  );
}

/** Riquadro bianco dei pannelli accanto alla barra. */
function Card({ children, style }: { children: ReactNode; style?: object }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          padding: spacing.md,
          boxShadow: colors.shadowOverlay,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Casella delle opzioni: lilla quando è scelta, come nella barra di riferimento. */
function Tile({ label, active, onPress, wide, children }: { label: string; active: boolean; onPress: () => void; wide?: boolean; children: ReactNode }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        width: wide ? 52 : TILE,
        height: TILE,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? colors.selected : 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/** Colore a quadrato, come la scelta dei colori dell'avatar: tasto con il bordo in basso più spesso (dec. 177). */
function Swatch({ color, active, onPress }: { color: string; active: boolean; onPress: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={color}
      accessibilityState={{ checked: active }}
      style={({ pressed }) => ({
        width: TILE,
        height: TILE,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderBottomWidth: 3,
        borderColor: active ? colors.borderFocused : colors.border,
        backgroundColor: active ? colors.selected : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radius.md,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    </Pressable>
  );
}

/** Tratto (continuo, pennello, tratteggio, puntini) e stabilizzazione. */
function StyleCard({ brush, setBrush }: { brush: Brush; setBrush: (b: Partial<Brush>) => void }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Card
      style={{
        padding: spacing.lg,
        gap: spacing.md,
        width: 320,
        maxWidth: '100%',
      }}
    >
      <Text style={[typography.headline, { color: colors.text }]}>{t.whiteboard.style}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {STYLES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setBrush({ style: s })}
            accessibilityRole="button"
            accessibilityLabel={t.whiteboard.styles[s]}
            accessibilityState={{ selected: brush.style === s }}
            style={{
              flex: 1,
              height: 44,
              borderRadius: radius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: brush.style === s ? colors.selected : colors.surfaceMuted,
            }}
          >
            <StylePreview style={s} color={colors.text} />
          </Pressable>
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[typography.headline, { color: colors.text, flex: 1 }]}>{t.whiteboard.stabilization}</Text>
        <Text style={[typography.callout, { color: colors.textSecondary }]}>{t.whiteboard.levels[brush.stabilization]}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {([0, 1, 2] as Stabilization[]).map((lv) => (
          <Pressable
            key={lv}
            onPress={() => setBrush({ stabilization: lv })}
            accessibilityRole="button"
            accessibilityLabel={t.whiteboard.levels[lv]}
            accessibilityState={{ selected: brush.stabilization === lv }}
            style={{ flex: 1, height: 28, justifyContent: 'center' }}
          >
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: lv <= brush.stabilization ? colors.accent : colors.border,
              }}
            />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const SHAPE_WIDTHS = [2, 4, 7];

/** Forme: tipo, colore di riempimento e bordo (colore e spessore). */
function ShapeOptions({ style, setStyle, isDark }: { style: ShapeStyle; setStyle: (s: Partial<ShapeStyle>) => void; isDark: boolean }) {
  const { colors, radius, spacing, typography } = useTheme();
  const palette = [...(isDark ? ink.pen.dark : ink.pen.light), ...ink.pen.extra.slice(0, 4)];
  const label = (text: string) => <Text style={[typography.caption, { color: colors.textSecondary, width: 58 }]}>{text}</Text>;
  return (
    <Card style={{ gap: spacing.sm, width: 360, maxWidth: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        {SHAPES.map((sh) => (
          <Pressable
            key={sh}
            onPress={() => setStyle({ shape: sh })}
            accessibilityRole="button"
            accessibilityLabel={t.whiteboard.shapes[sh]}
            accessibilityState={{ selected: style.shape === sh }}
            style={{
              width: 56,
              height: 40,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: style.shape === sh ? colors.accent : colors.surfaceMuted,
            }}
          >
            <Svg width={28} height={28}>
              <ShapeSvg
                s={{
                  shape: sh,
                  ...(sh === 'line' || sh === 'arrow' ? { x: 3, y: 25, w: 22, h: -22 } : { x: 3, y: 3, w: 22, h: 22 }),
                  fill: null,
                  stroke: style.shape === sh ? colors.onAccent : colors.text,
                  strokeWidth: 2,
                }}
              />
            </Svg>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {label(t.whiteboard.fill)}
        <Pressable
          onPress={() => setStyle({ fill: null })}
          accessibilityRole="button"
          accessibilityLabel={t.whiteboard.noFill}
          accessibilityState={{ selected: style.fill === null }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: style.fill === null ? colors.accent : 'transparent',
          }}
        >
          <Icon name="cancel" size={22} color={colors.textSecondary} />
        </Pressable>
        {palette.map((c) => (
          <SmallDot key={c} color={c} active={style.fill === c} onPress={() => setStyle({ fill: c })} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {label(t.whiteboard.border)}
        {palette.map((c) => (
          <SmallDot key={c} color={c} active={style.stroke === c} onPress={() => setStyle({ stroke: c })} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {label(t.whiteboard.width)}
        {SHAPE_WIDTHS.map((w, i) => (
          <Pressable
            key={w}
            onPress={() => setStyle({ strokeWidth: w })}
            accessibilityRole="button"
            accessibilityLabel={`${t.whiteboard.width} ${i + 1}`}
            accessibilityState={{ selected: style.strokeWidth === w }}
            style={{
              width: 44,
              height: 30,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceMuted,
              borderWidth: 2,
              borderColor: style.strokeWidth === w ? colors.accent : 'transparent',
            }}
          >
            <View
              style={{
                width: 24,
                height: w,
                borderRadius: w,
                backgroundColor: colors.text,
              }}
            />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function SmallDot({ color, active, onPress }: { color: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={color}
      accessibilityState={{ selected: active }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: active ? colors.borderFocused : 'transparent',
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    </Pressable>
  );
}

const WAVE = [
  { x: 4, y: 15 },
  { x: 12, y: 8 },
  { x: 20, y: 7 },
  { x: 28, y: 12 },
  { x: 36, y: 17 },
  { x: 44, y: 16 },
  { x: 52, y: 9 },
];

function StylePreview({ style, color, small }: { style: LineStyle; color: string; small?: boolean }) {
  const d = 'M4 15 C12 5, 22 5, 30 13 S46 21, 52 9';
  return (
    <Svg width={small ? 40 : 56} height={small ? 16 : 22} viewBox="0 0 56 22">
      {style === 'brush' ? (
        <Path d={brushOutline(WAVE, 6)} fill={color} />
      ) : (
        <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray={dashArray(style, 2.5)} />
      )}
    </Svg>
  );
}
