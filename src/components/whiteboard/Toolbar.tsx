import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { t } from '../../i18n';
import type { LineStyle, Stabilization, StrokeTool } from '../../state/whiteboard';
import { ink, useTheme } from '../../theme';
import { Glass } from '../Glass';
import type { Brush, Tool } from './Canvas';
import { brushOutline, dashArray } from './geometry';

type McIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Strumenti nell'ordine della dec. 110 (il quarto è rinviato). */
const TOOLS: { key: Tool | 'add' | 'audio'; icon: McIcon }[] = [
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

const STYLES: LineStyle[] = ['solid', 'brush', 'dashed', 'dotted'];
export const isStrokeTool = (x: string): x is StrokeTool => x === 'pen' || x === 'pencil' || x === 'highlighter';

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
}: {
  tool: Tool;
  onTool: (t: Tool) => void;
  onAdd: () => void;
  onAudio: () => void;
  brush: Brush | null;
  setBrush: (b: Partial<Brush>) => void;
  panel: Panel;
  setPanel: (p: Panel) => void;
}) {
  const { colors, radius, spacing, isDark } = useTheme();

  const press = (key: (typeof TOOLS)[number]['key']) => {
    if (key === 'add') return onAdd();
    if (key === 'audio') return onAudio();
    if (key === tool && isStrokeTool(key)) return setPanel(panel === 'none' ? 'options' : 'none');
    setPanel('none');
    onTool(key);
  };

  return (
    <View style={{ gap: spacing.sm, alignItems: 'center' }} pointerEvents="box-none">
      {brush && isStrokeTool(tool) && panel !== 'none' && (
        <BrushOptions tool={tool} brush={brush} setBrush={setBrush} panel={panel} setPanel={setPanel} isDark={isDark} />
      )}
      <Glass style={{ borderRadius: radius.xl, maxWidth: '100%' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing.xs, gap: 0 }}>
          {TOOLS.map((tl) => {
            const active = tl.key === tool;
            const label = t.whiteboard.tools[tl.key];
            return (
              <Pressable
                key={tl.key}
                onPress={() => press(tl.key)}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => ({
                  width: 38,
                  height: 44,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? colors.accent : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={tl.icon}
                  size={22}
                  color={active ? colors.onAccent : colors.text}
                />
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
