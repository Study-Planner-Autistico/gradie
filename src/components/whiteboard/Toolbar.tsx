import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { t } from '../../i18n';
import type { LineStyle, Stabilization, StrokeTool } from '../../state/whiteboard';
import { ink, useTheme } from '../../theme';
import { Glass } from '../Glass';
import type { Brush, SelectMode, ShapeStyle, Tool } from './Canvas';
import { brushOutline, dashArray } from './geometry';
import { SHAPES, ShapeSvg } from './shapes';

type McIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];
type Key = Tool | 'add' | 'audio' | 'more' | 'less' | 'ruler';

/** Strumenti nell'ordine della dec. 110 (il quarto è rinviato); la freccia mostra al loro posto righello e forme (dec. 111, 116). */
const TOOLS: { key: Key; icon: McIcon }[] = [
  { key: 'pen', icon: 'pen' },
  { key: 'pencil', icon: 'pencil-outline' },
  { key: 'highlighter', icon: 'marker' },
  { key: 'eraser', icon: 'eraser' },
  { key: 'text', icon: 'format-text' },
  { key: 'select', icon: 'selection-drag' },
  { key: 'add', icon: 'plus-circle-outline' },
  { key: 'audio', icon: 'microphone-outline' },
  { key: 'hand', icon: 'hand-back-right-outline' },
];
const EXTRA: { key: Key; icon: McIcon }[] = [
  { key: 'ruler', icon: 'ruler' },
  { key: 'shapes', icon: 'shape-outline' },
];

const STYLES: LineStyle[] = ['solid', 'brush', 'dashed', 'dotted'];
export const isStrokeTool = (x: string): x is StrokeTool => x === 'pen' || x === 'pencil' || x === 'highlighter';
/** Strumenti che, toccati di nuovo, aprono le loro opzioni. */
const hasOptions = (x: string) => isStrokeTool(x) || x === 'select' || x === 'shapes';

export type Panel = 'none' | 'options' | 'colors' | 'style';

export function Toolbar({
  tool,
  onTool,
  onAdd,
  onAudio,
  brush,
  setBrush,
  panel,
  setPanel,
  rulerOn,
  onRuler,
  selectMode,
  setSelectMode,
  shapeStyle,
  setShapeStyle,
  inkDark,
}: {
  tool: Tool;
  onTool: (t: Tool) => void;
  onAdd: () => void;
  onAudio: () => void;
  brush: Brush | null;
  setBrush: (b: Partial<Brush>) => void;
  panel: Panel;
  setPanel: (p: Panel) => void;
  rulerOn: boolean;
  onRuler: () => void;
  selectMode: SelectMode;
  setSelectMode: (m: SelectMode) => void;
  shapeStyle: ShapeStyle;
  setShapeStyle: (s: Partial<ShapeStyle>) => void;
  /** Carta scura: servono inchiostri chiari. Se assente segue il tema. */
  inkDark?: boolean;
}) {
  const { colors, radius, spacing, isDark: themeDark } = useTheme();
  const isDark = inkDark ?? themeDark;
  const [more, setMore] = useState(false);

  const press = (key: Key) => {
    if (key === 'add') return onAdd();
    if (key === 'audio') return onAudio();
    if (key === 'ruler') return onRuler();
    if (key === 'more') return setMore(true);
    if (key === 'less') return setMore(false);
    if (key === tool && hasOptions(key)) return setPanel(panel === 'none' ? 'options' : 'none');
    // Le forme si scelgono subito: il pannello si apre insieme allo strumento.
    setPanel(key === 'shapes' ? 'options' : 'none');
    onTool(key);
  };

  // Righello e forme prendono il posto degli strumenti di scrittura; la freccia iniziale riporta indietro.
  const keys: { key: Key; icon: McIcon }[] = more ? [{ key: 'less', icon: 'chevron-left' }, ...EXTRA] : [...TOOLS, { key: 'more', icon: 'chevron-right' }];

  return (
    <View style={{ gap: spacing.sm, alignItems: 'center', alignSelf: 'stretch' }} pointerEvents="box-none">
      {brush && isStrokeTool(tool) && panel !== 'none' && (
        <BrushOptions tool={tool} brush={brush} setBrush={setBrush} panel={panel} setPanel={setPanel} isDark={isDark} />
      )}
      {tool === 'select' && panel !== 'none' && <SelectOptions mode={selectMode} setMode={setSelectMode} />}
      {tool === 'shapes' && panel !== 'none' && <ShapeOptions style={shapeStyle} setStyle={setShapeStyle} isDark={isDark} />}
      <Glass style={{ borderRadius: radius.xl, alignSelf: 'stretch' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ padding: spacing.xs, gap: 0, flexGrow: 1, justifyContent: 'center' }}
        >
          {keys.map((tl) => {
            const active = tl.key === tool || (tl.key === 'ruler' && rulerOn);
            const label = t.whiteboard.tools[tl.key];
            const icon: McIcon = tl.key === 'select' && selectMode === 'lasso' ? 'lasso' : tl.icon;
            return (
              <Pressable
                key={tl.key}
                onPress={() => press(tl.key)}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => ({
                  width: tl.key === 'more' || tl.key === 'less' ? 30 : 38,
                  height: 44,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? colors.accent : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialCommunityIcons name={icon} size={22} color={active ? colors.onAccent : tl.key === 'more' || tl.key === 'less' ? colors.danger : colors.text} />
                {active && isStrokeTool(tl.key) && brush && (
                  <View style={{ position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: brush.color, borderWidth: 1, borderColor: colors.onAccent }} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Glass>
    </View>
  );
}

/** Selezione: a rettangolo o libera. */
function SelectOptions({ mode, setMode }: { mode: SelectMode; setMode: (m: SelectMode) => void }) {
  const { colors, radius, spacing, typography } = useTheme();
  const opts: { m: SelectMode; icon: McIcon; label: string }[] = [
    { m: 'rect', icon: 'selection-drag', label: t.whiteboard.selectRect },
    { m: 'lasso', icon: 'lasso', label: t.whiteboard.selectFree },
  ];
  return (
    <Glass style={{ borderRadius: radius.lg, padding: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
      {opts.map((o) => (
        <Pressable
          key={o.m}
          onPress={() => setMode(o.m)}
          accessibilityRole="button"
          accessibilityLabel={o.label}
          accessibilityState={{ selected: mode === o.m }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            height: 36,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            backgroundColor: mode === o.m ? colors.accent : colors.surfaceMuted,
          }}
        >
          <MaterialCommunityIcons name={o.icon} size={18} color={mode === o.m ? colors.onAccent : colors.text} />
          <Text style={[typography.callout, { color: mode === o.m ? colors.onAccent : colors.text }]}>{o.label}</Text>
        </Pressable>
      ))}
    </Glass>
  );
}

const SHAPE_WIDTHS = [2, 4, 7];

/** Forme: tipo, colore di riempimento e bordo (colore e spessore). */
function ShapeOptions({ style, setStyle, isDark }: { style: ShapeStyle; setStyle: (s: Partial<ShapeStyle>) => void; isDark: boolean }) {
  const { colors, radius, spacing, typography } = useTheme();
  const palette = [...(isDark ? ink.pen.dark : ink.pen.light), ...ink.pen.extra.slice(0, 4)];
  const label = (text: string) => <Text style={[typography.caption, { color: colors.textSecondary, width: 58 }]}>{text}</Text>;
  return (
    <Glass style={{ borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, width: 360, maxWidth: '100%' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {SHAPES.map((sh) => (
          <Pressable
            key={sh}
            onPress={() => setStyle({ shape: sh })}
            accessibilityRole="button"
            accessibilityLabel={t.whiteboard.shapes[sh]}
            accessibilityState={{ selected: style.shape === sh }}
            style={{ width: 56, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: style.shape === sh ? colors.accent : colors.surfaceMuted }}
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
          style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: style.fill === null ? colors.accent : 'transparent' }}
        >
          <MaterialCommunityIcons name="cancel" size={22} color={colors.textSecondary} />
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
            <View style={{ width: 24, height: w, borderRadius: w, backgroundColor: colors.text }} />
          </Pressable>
        ))}
      </View>
    </Glass>
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
      style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: active ? colors.accent : 'transparent' }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color, borderWidth: 1, borderColor: colors.border }} />
    </Pressable>
  );
}

function BrushOptions({
  tool,
  brush,
  setBrush,
  panel,
  setPanel,
  isDark,
}: {
  tool: StrokeTool;
  brush: Brush;
  setBrush: (b: Partial<Brush>) => void;
  panel: Panel;
  setPanel: (p: Panel) => void;
  isDark: boolean;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const palette = ink[tool];
  const main = isDark ? palette.dark : palette.light;
  const widths = ink.widths[tool];
  const divider = <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.border }} />;

  return (
    <View style={{ gap: spacing.sm, alignItems: 'center', maxWidth: '100%' }}>
      {panel === 'style' && (
        <Glass style={{ borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, width: 320, maxWidth: '100%' }}>
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
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surfaceMuted,
                  borderWidth: 2,
                  borderColor: brush.style === s ? colors.accent : 'transparent',
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
                <View style={{ height: 6, borderRadius: 3, backgroundColor: lv <= brush.stabilization ? colors.accent : colors.border }} />
              </Pressable>
            ))}
          </View>
        </Glass>
      )}

      {panel === 'colors' && (
        <Glass style={{ borderRadius: radius.lg, padding: spacing.sm, flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 340 }}>
          {palette.extra.map((c) => (
            <ColorDot key={c} color={c} active={brush.color === c} onPress={() => setBrush({ color: c })} />
          ))}
        </Glass>
      )}

      <Glass style={{ borderRadius: radius.lg, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {main.map((c) => (
          <ColorDot key={c} color={c} active={brush.color === c} onPress={() => setBrush({ color: c })} />
        ))}
        <Pressable
          onPress={() => setPanel(panel === 'colors' ? 'options' : 'colors')}
          accessibilityRole="button"
          accessibilityLabel={t.whiteboard.moreColors}
          style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted }}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.text} />
        </Pressable>
        {divider}
        {widths.map((w, i) => (
          <Pressable
            key={w}
            onPress={() => setBrush({ width: w })}
            accessibilityRole="button"
            accessibilityLabel={`${t.whiteboard.width} ${i + 1}`}
            accessibilityState={{ selected: brush.width === w }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceMuted,
              borderWidth: 2,
              borderColor: brush.width === w ? colors.accent : 'transparent',
            }}
          >
            <View style={{ width: 6 + i * 5, height: 6 + i * 5, borderRadius: 10, backgroundColor: colors.text }} />
          </Pressable>
        ))}
        {divider}
        <Pressable
          onPress={() => setPanel(panel === 'style' ? 'options' : 'style')}
          accessibilityRole="button"
          accessibilityLabel={t.whiteboard.style}
          style={{ height: 34, paddingHorizontal: 6, justifyContent: 'center' }}
        >
          <StylePreview style={brush.style} color={colors.text} />
        </Pressable>
      </Glass>
    </View>
  );
}

function ColorDot({ color, active, onPress }: { color: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={color}
      accessibilityState={{ selected: active }}
      style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: active ? colors.accent : 'transparent' }}
    >
      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color, borderWidth: 1, borderColor: colors.border }} />
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

function StylePreview({ style, color }: { style: LineStyle; color: string }) {
  const d = 'M4 15 C12 5, 22 5, 30 13 S46 21, 52 9';
  return (
    <Svg width={56} height={22}>
      {style === 'brush' ? (
        <Path d={brushOutline(WAVE, 6)} fill={color} />
      ) : (
        <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray={dashArray(style, 2.5)} />
      )}
    </Svg>
  );
}
