import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DemoLesson } from '../data/demo';
import { t } from '../i18n';
import { useTheme } from '../theme';

/** Card lezione piena (DESIGN.md §6.2). Nessun voto mostrato qui. */
export function LessonCard({ lesson, onPress }: { lesson: DemoLesson; onPress?: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const past = lesson.status === 'missed';
  const bg = past ? colors.primaryDeep : colors.primary;
  const statusLabel =
    lesson.status === 'attended' ? t.lesson.attended : lesson.status === 'missed' ? t.lesson.missed : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={styles.row}>
        <Text style={[typography.title2, { color: colors.onPrimary, flex: 1 }]}>{lesson.subject}</Text>
        {statusLabel && (
          <View style={[styles.row, { gap: spacing.xs }]}>
            <Text style={[typography.caption, { color: colors.onPrimary }]}>{statusLabel}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: lesson.status === 'attended' ? colors.success : colors.neutralBadge },
              ]}
            >
              <Ionicons name={lesson.status === 'attended' ? 'checkmark' : 'close'} size={11} color={colors.onPrimary} />
            </View>
          </View>
        )}
      </View>

      <View style={[styles.pill, { backgroundColor: colors.pill, borderRadius: radius.pill, gap: spacing.xs }]}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={[typography.callout, { color: colors.onPill }]}>
          {lesson.start}–{lesson.end}
        </Text>
      </View>

      {lesson.note && <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>{lesson.note}</Text>}

      {lesson.teacher && (
        <View style={[styles.row, { marginTop: spacing.xs }]}>
          <Text style={[typography.headline, { color: colors.onPrimary, flex: 1 }]}>{lesson.teacher}</Text>
          {!past && (
            <View style={[styles.pill, { backgroundColor: colors.pill, borderRadius: radius.pill, paddingHorizontal: spacing.md }]}>
              <Text style={[typography.callout, { color: colors.pillText }]}>{t.lesson.details} →</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4 },
});
