import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { PanResponder, Text, View } from 'react-native';
import { MAX_GRADE, MIN_GRADE } from '../state/grades';
import { useTheme } from '../theme';
import { tap } from './haptics';

const THUMB = 28;

/**
 * Barra per scegliere il voto (dec. 196): da 18 a 30, si tocca o si trascina e il pallino scatta sul voto intero.
 * Sotto, i voti di riferimento 18, 24 e 30. Con il lettore dello schermo si cambia di un punto alla volta.
 */
export function GradeSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  const [width, setWidth] = useState(0);
  const track = useRef<ComponentRef<typeof View>>(null);
  const left = useRef(0);
  const last = useRef(value);
  last.current = value;
  const span = MAX_GRADE - MIN_GRADE;

  const pick = (pageX: number) => {
    if (!width) return;
    const x = Math.max(0, Math.min(width, pageX - left.current));
    const v = Math.round(MIN_GRADE + (x / width) * span);
    if (v !== last.current) {
      last.current = v;
      tap();
      onChange(v);
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Il trascinamento resta della barra: il foglio non deve chiudersi né la pagina scorrere.
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const x = e.nativeEvent.pageX;
          track.current?.measureInWindow((wx: number) => {
            left.current = wx;
            pick(x);
          });
        },
        onPanResponderMove: (e) => pick(e.nativeEvent.pageX),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, onChange],
  );

  const p = (value - MIN_GRADE) / span;
  return (
    <View style={{ gap: spacing.xs }}>
      <View
        ref={track}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...pan.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: MIN_GRADE, max: MAX_GRADE, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') onChange(Math.min(MAX_GRADE, value + 1));
          if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(MIN_GRADE, value - 1));
        }}
        style={{ height: 44, justifyContent: 'center' }}
      >
        <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }} />
        <View style={{ position: 'absolute', left: 0, width: p * width, height: 8, borderRadius: radius.pill, backgroundColor: colors.accent }} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: p * width - THUMB / 2,
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: colors.bg,
            borderWidth: 3,
            borderColor: colors.accent,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {[MIN_GRADE, (MIN_GRADE + MAX_GRADE) / 2, MAX_GRADE].map((n) => (
          <Text key={n} style={[typography.caption, { color: colors.textTertiary }]}>
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
}
