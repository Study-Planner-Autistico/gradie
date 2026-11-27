import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirm } from '../../components/dialogs';
import { tap } from '../../components/haptics';
import { Icon } from '../../components/icons';
import { showUndo } from '../../components/UndoToast';
import { locale, t } from '../../i18n';
import { addGrade, formatAvg, formatGrade, mean, removeGrade, useGrades } from '../../state/grades';
import { useTheme } from '../../theme';

/**
 * Voti di una materia (dec. 196), toccando la sua finestra nel Registro voti: media e tutte le volte che hai
 * inserito un voto, dal più recente. Stile dell'app (dec. 229): titolo grande, card ed elenco con bordo. Il "+" aggiunge un voto già su questa materia; il cestino lo toglie, con "Annulla".
 */
export default function VotiMateria() {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.grades;
  const { materia } = useLocalSearchParams<{ materia: string }>();
  const list = useGrades()
    .filter((x) => x.subject === materia)
    .sort((a, b) => b.date.localeCompare(a.date));
  const avg = mean(list.map((x) => x.value));
  const iconBtn = ({ pressed }: { pressed: boolean }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.6 : 1 });
  const when = (ymd: string) => new Date(`${ymd}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52, marginTop: spacing.xs }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={T.back} style={iconBtn}>
          <Icon name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.giant, gap: spacing.xl, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Text accessibilityRole="header" numberOfLines={2} style={[typography.title1, { flex: 1, color: colors.heading }]}>
            {materia}
          </Text>
          <Pressable
            onPress={() => {
              tap();
              router.push({ pathname: '/nuovo-voto', params: { subject: materia } });
            }}
            accessibilityRole="button"
            accessibilityLabel={T.add}
            style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Icon name="plus" size={22} color={colors.selectedText} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: spacing.lg, borderRadius: radius.xl, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.border, backgroundColor: colors.surface }}>
          <View style={{ gap: spacing.xxs }}>
            <Text style={[typography.overline, { color: colors.textSecondary }]}>{T.subjectAverage}</Text>
            <Text style={[typography.hero, { color: colors.heading, fontVariant: ['tabular-nums'] }]}>
              {list.length ? formatAvg(avg) : '—'}
              <Text style={[typography.title2, { color: colors.textTertiary }]}>/30</Text>
            </Text>
          </View>
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.selected, marginBottom: spacing.sm }}>
            <Text style={[typography.overline, { color: colors.selectedText }]}>{T.count(list.length)}</Text>
          </View>
        </View>

        {list.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl }]}>{T.empty}</Text>
        ) : (
          <View style={{ borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
            {list.map((g, i) => (
              <View
                key={g.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingLeft: spacing.md, paddingRight: spacing.xs, borderTopWidth: i ? 2 : 0, borderTopColor: colors.border }}
              >
                <View style={{ minWidth: 56, height: 40, paddingHorizontal: spacing.sm, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.selected }}>
                  <Text style={[typography.headline, { color: colors.selectedText, fontVariant: ['tabular-nums'] }]}>{g.lode ? `${g.value}L` : g.value}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.text }]}>{g.kind === 'exam' ? T.exam : T.partial}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{when(g.date)}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    confirm(T.deleteConfirm(formatGrade(g, T.lode)), T.delete, () => {
                      removeGrade(g.id);
                      showUndo(T.deleted, () => {
                        addGrade({ subject: g.subject, value: g.value, lode: g.lode, kind: g.kind, date: g.date });
                      });
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${T.delete}: ${formatGrade(g, T.lode)}, ${when(g.date)}`}
                  style={iconBtn}
                >
                  <Icon name="trash" size={20} color={colors.textTertiary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
