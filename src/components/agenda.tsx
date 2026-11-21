import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DemoAgendaItem } from '../data/demo';
import { locale, t } from '../i18n';
import { useTheme, type TintName } from '../theme';
import type { IconName } from './icons';

export const KIND_ICON: Record<TintName, IconName> = {
  lesson: 'book-outline',
  appointment: 'person-outline',
  activity: 'flag-outline',
  official: 'people-outline',
  holiday: 'sunny-outline',
};

/** Riga evento con tinta per tipo (DESIGN.md §5.3). */
export function EventRow({ item, onPress }: { item: DemoAgendaItem; onPress?: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const tint = colors.tints[item.kind];
  const time = item.start && item.end ? `${item.start} – ${item.end}` : t.agenda.kind[item.kind];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t.agenda.kind[item.kind]}: ${item.title}, ${time}`}
      style={({ pressed }) => ({
        backgroundColor: tint.bg,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <View style={[styles.row, { gap: spacing.xs }]}>
          <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.locked && (
            <Ionicons name="lock-closed" size={12} color={tint.fg} accessibilityLabel={t.agenda.teacherTimetable} />
          )}
        </View>
        <Text style={[typography.time, { color: tint.fg }]}>{time}</Text>
      </View>
      {item.meta && item.start && (
        <Text style={[typography.caption, { color: tint.fg }]} numberOfLines={1}>
          {item.meta}
        </Text>
      )}
      <Ionicons name={KIND_ICON[item.kind]} size={18} color={tint.fg} />
    </Pressable>
  );
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  r.setHours(0, 0, 0, 0);
  return r;
}

export function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Numero di settimana ISO. */
export function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Striscia della settimana (DESIGN.md §5.7). */
export function WeekStrip({
  selected,
  onSelect,
  hasItems,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
  hasItems: (d: Date) => boolean;
}) {
  const { colors, typography, spacing, layout } = useTheme();
  const today = new Date().toDateString();
  const monday = startOfWeek(selected);
  return (
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((d) => {
        const isSel = d.toDateString() === selected.toDateString();
        const isToday = d.toDateString() === today;
        return (
          <Pressable
            key={d.toISOString()}
            onPress={() => onSelect(d)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSel }}
            accessibilityLabel={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            style={{ alignItems: 'center', gap: spacing.xs, minWidth: 44 }}
          >
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
            </Text>
            <View
              style={{
                width: layout.dayCell,
                height: layout.dayCell,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSel ? colors.ink : colors.surfaceMuted,
              }}
            >
              <Text
                style={[
                  typography.callout,
                  {
                    fontWeight: '600',
                    color: isSel ? colors.onInk : isToday ? colors.accent : colors.text,
                  },
                ]}
              >
                {d.getDate()}
              </Text>
            </View>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: hasItems(d) ? colors.accent : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
