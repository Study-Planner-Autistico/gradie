import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COVER_SWATCH } from '../components/coverArt';
import { tap } from '../components/haptics';
import { Icon } from '../components/icons';
import { t } from '../i18n';
import { formatAvg, MAX_GRADE, MIN_GRADE, useGradeBook, type SubjectAverage } from '../state/grades';
import { subjectLook, useSubjectLooks, useSubjects } from '../state/subjects';
import { useTheme } from '../theme';

const CHART_H = 140;
const COL_W = 30;

/** Etichetta corta sotto la colonna: "Pro", "Geo"; "Ana I", "Ing B2" se la seconda parola è corta; altrimenti le iniziali ("SM"). */
const short = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 2 && words[1].length <= 3) return `${words[0].slice(0, 3)} ${words[1]}`;
  return words.length > 1 ? words.map((w) => w[0].toLocaleUpperCase()).join('') : name.slice(0, 3);
};

/**
 * Registro voti (dec. 195, 229): nello stile del resto dell'app (dec. 223). In alto il titolo grande e il "+"; una card
 * con bordo con la media generale e il grafico delle medie (una colonna per materia nel colore della materia, più alta
 * = media più alta); sotto le materie in un elenco con bordo: media, numero di voti e barra fino a 30. Voti in
 * trentesimi (dec. 196); una riga apre tutti i voti di quella materia.
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
  const best = book.rows.filter((r) => r.count).reduce<SubjectAverage | undefined>((a, b) => (!a || b.average > a.average ? b : a), undefined);
  const [selected, setSelected] = useState<string | undefined>(best?.subject);
  const current = book.rows.find((r) => r.subject === selected);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52, marginTop: spacing.xs }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={T.back}
          style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.giant, gap: spacing.xl, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text accessibilityRole="header" style={[typography.title1, { flex: 1, color: colors.heading }]}>
            {T.title}
          </Text>
          <Pressable
            onPress={() => {
              tap();
              router.push('/nuovo-voto');
            }}
            accessibilityRole="button"
            accessibilityLabel={T.add}
            style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Icon name="plus" size={22} color={colors.selectedText} />
          </Pressable>
        </View>

        {/* Media generale e grafico delle medie per materia. */}
        <View style={{ borderRadius: radius.xl, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md }}>
            <View style={{ gap: spacing.xxs }}>
              <Text style={[typography.overline, { color: colors.textSecondary }]}>{T.overall}</Text>
              <Text style={[typography.hero, { color: colors.heading, fontVariant: ['tabular-nums'] }]}>
                {book.count ? formatAvg(book.average) : '—'}
                <Text style={[typography.title2, { color: colors.textTertiary }]}>/30</Text>
              </Text>
            </View>
            <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.selected, marginBottom: spacing.sm }}>
              <Text style={[typography.overline, { color: colors.selectedText }]}>{T.count(book.count)}</Text>
            </View>
          </View>

          <View style={{ height: 2, backgroundColor: colors.border }} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', gap: spacing.sm, paddingTop: 34 }}>
            {book.rows.map((r) => {
              const on = r.subject === selected;
              const color = colorOf(r.subject);
              // Trentesimi: la colonna parte dal 18 (dec. 196); senza voti resta un gradino grigio.
              const h = r.count ? Math.max(0.12, (r.average - MIN_GRADE) / (MAX_GRADE - MIN_GRADE)) * CHART_H : 8;
              return (
                <Pressable
                  key={r.subject}
                  onPress={() => {
                    tap();
                    setSelected(r.subject);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${r.subject}: ${r.count ? `${T.average} ${formatAvg(r.average)}` : T.empty}`}
                  style={{ alignItems: 'center', gap: spacing.xs, width: COL_W + 8 }}
                >
                  <View style={{ height: CHART_H, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {on && r.count > 0 && (
                      <View style={{ position: 'absolute', bottom: h + 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: color }}>
                        <Text style={[typography.caption, { color: '#fff', fontWeight: '700' }]}>{formatAvg(r.average)}</Text>
                      </View>
                    )}
                    {/* Colonna tridimensionale come i pulsanti (dec. 223): piena se scelta, tenue le altre. */}
                    <View
                      style={{
                        width: COL_W,
                        height: h,
                        borderRadius: radius.md,
                        backgroundColor: r.count ? (on ? color : color + '40') : colors.surfaceMuted,
                        borderWidth: 2,
                        borderBottomWidth: 4,
                        borderColor: r.count ? (on ? color : color + '66') : colors.border,
                      }}
                    />
                  </View>
                  <Text numberOfLines={1} style={[typography.caption, { color: on ? colors.text : colors.textTertiary, fontWeight: on ? '700' : '400' }]}>
                    {short(r.subject)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {current && (
            <Text style={[typography.callout, { color: colors.textSecondary, textAlign: 'center' }]} numberOfLines={1}>
              {current.subject} · {current.count ? `${T.average} ${formatAvg(current.average)}` : T.empty}
            </Text>
          )}
        </View>

        {/* Materie in un elenco con bordo (DESIGN.md §5.4). */}
        <View style={{ gap: spacing.sm }}>
          <Text accessibilityRole="header" style={[typography.overline, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
            {T.bySubject}
          </Text>
          <View style={{ borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
            {book.rows.map((r, i) => (
              <SubjectRow key={r.subject} row={r} color={colorOf(r.subject)} first={i === 0} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SubjectRow({ row, color, first }: { row: SubjectAverage; color: string; first: boolean }) {
  const { colors, typography, spacing, radius } = useTheme();
  const fill = row.count ? Math.max(0.04, row.average / MAX_GRADE) : 0;
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push({ pathname: '/voti/[materia]', params: { materia: row.subject } });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${row.subject}: ${row.count ? `${t.grades.average} ${formatAvg(row.average)}` : t.grades.empty}, ${t.grades.count(row.count)}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 72,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: first ? 0 : 2,
        borderTopColor: colors.border,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}
    >
      <View style={{ width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: color + '26', borderWidth: 2, borderBottomWidth: 4, borderColor: color + '66' }}>
        <Icon name="book" size={20} color={color} />
      </View>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text numberOfLines={1} style={[typography.headline, { color: colors.text }]}>
          {row.subject}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            <View style={{ width: `${fill * 100}%`, height: '100%', borderRadius: 5, backgroundColor: color }} />
          </View>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.grades.count(row.count)}</Text>
        </View>
      </View>
      <View style={{ minWidth: 56, height: 40, paddingHorizontal: spacing.sm, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: row.count ? colors.selected : colors.surfaceMuted }}>
        <Text style={[typography.headline, { color: row.count ? colors.selectedText : colors.textTertiary, fontVariant: ['tabular-nums'] }]}>{row.count ? formatAvg(row.average) : '—'}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.borderBold} />
    </Pressable>
  );
}
