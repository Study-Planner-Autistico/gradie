import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { COVER_SWATCH } from '../components/coverArt';
import { tap } from '../components/haptics';
import { Icon } from '../components/icons';
import { t } from '../i18n';
import { formatAvg, useGradeBook, type SubjectAverage } from '../state/grades';
import { subjectLook, useSubjectLooks, useSubjects } from '../state/subjects';
import { useTheme } from '../theme';

const CHART_H = 140;
const COL_W = 30;
const GREEN = '#22C55E';
const GREEN_DARK = '#15803D';
const GREEN_SOFT = '#BBF7D0';

/** Etichetta corta sotto la colonna: "Mat", "Ita"; per due parole le iniziali ("SM"). */
const short = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  return words.length > 1 ? words.map((w) => w[0].toLocaleUpperCase()).join('') : name.slice(0, 3);
};

/**
 * Registro voti (dec. 195): in alto il grafico delle medie (una colonna per materia, più alta = media più alta,
 * il nome sotto) con la media generale; sotto una finestra per materia con la media e un anello.
 * Si apre dal menu laterale e dalla media della Panoramica in Profilo. Voti dimostrativi.
 */
export default function RegistroVoti() {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.grades;
  const book = useGradeBook();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const colorOf = (s: string) => {
    const i = subjects.indexOf(s);
    return COVER_SWATCH[subjectLook(looks, s, Math.max(0, i)).color];
  };
  const best = book.rows.reduce<SubjectAverage | undefined>((a, b) => (!a || b.average > a.average ? b : a), undefined);
  const [selected, setSelected] = useState<string | undefined>(best?.subject);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52, marginTop: spacing.xs }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={T.back}
          style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]}>
          {T.title}
        </Text>
        <View style={{ width: layout.iconButton }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        {/* Media generale e grafico delle medie per materia. */}
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ gap: spacing.xxs }}>
              <Text style={[typography.callout, { color: colors.textSecondary }]}>{T.overall}</Text>
              <Text style={[typography.hero, { color: colors.text, fontVariant: ['tabular-nums'] }]}>{formatAvg(book.average)}</Text>
            </View>
            <Text style={[typography.callout, { color: colors.textTertiary, marginBottom: spacing.sm }]}>{T.count(book.count)}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', gap: spacing.sm, paddingTop: 34 }}>
            {book.rows.map((r) => {
              const on = r.subject === selected;
              const h = Math.max(0.12, (r.average - 4) / 6) * CHART_H;
              const id = `g-${r.subject.replace(/\W/g, '')}`;
              return (
                <Pressable
                  key={r.subject}
                  onPress={() => {
                    tap();
                    setSelected(r.subject);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${r.subject}: ${T.average} ${formatAvg(r.average)}`}
                  style={{ alignItems: 'center', gap: spacing.xs, width: COL_W + 8 }}
                >
                  <View style={{ height: CHART_H, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {on && (
                      <View style={{ position: 'absolute', bottom: h + 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: GREEN_DARK }}>
                        <Text style={[typography.caption, { color: '#fff', fontWeight: '700' }]}>{formatAvg(r.average)}</Text>
                      </View>
                    )}
                    <Svg width={COL_W} height={h}>
                      <Defs>
                        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={on ? GREEN : GREEN_SOFT} />
                          <Stop offset="1" stopColor={on ? GREEN_DARK : GREEN_SOFT} stopOpacity={on ? 1 : 0.45} />
                        </LinearGradient>
                      </Defs>
                      <Rect x={0} y={0} width={COL_W} height={h} rx={8} fill={`url(#${id})`} />
                    </Svg>
                  </View>
                  <Text numberOfLines={1} style={[typography.caption, { color: on ? colors.text : colors.textSecondary, fontWeight: on ? '700' : '400' }]}>
                    {short(r.subject)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Una finestra per materia: media e anello pieno quanto la media (su 10). */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {book.rows.map((r) => (
            <SubjectCard key={r.subject} row={r} color={colorOf(r.subject)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SubjectCard({ row, color }: { row: SubjectAverage; color: string }) {
  const { colors, typography, spacing, radius } = useTheme();
  const low = row.average < 6;
  return (
    <View
      accessible
      accessibilityLabel={`${row.subject}: ${t.grades.average} ${formatAvg(row.average)}, ${t.grades.count(row.count)}`}
      style={{ flexGrow: 1, flexBasis: '45%', minWidth: 150, borderRadius: radius.xl, padding: spacing.md, gap: spacing.md, backgroundColor: color + '1F', overflow: 'hidden' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="book" size={18} color={color} />
        <Text numberOfLines={1} style={[typography.headline, { flex: 1, color: colors.text }]}>{row.subject}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={[typography.title1, { color: low ? colors.danger : colors.text, fontVariant: ['tabular-nums'] }]}>{formatAvg(row.average)}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.grades.count(row.count)}</Text>
        </View>
        <Ring value={row.average / 10} color={low ? colors.danger : color} track={colors.bg} />
      </View>
    </View>
  );
}

function Ring({ value, color, track }: { value: number; color: string; track: string }) {
  const size = 46;
  const w = 6;
  const r = (size - w) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={w} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />
    </Svg>
  );
}
