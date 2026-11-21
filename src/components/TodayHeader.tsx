import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { locale, t } from '../i18n';
import { useTheme } from '../theme';
import { IconButton } from './ui';

function startOfWeek(d: Date) {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7; // lunedì = 0
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

function greeting(now: Date) {
  const h = now.getHours();
  if (h < 13) return t.greeting.morning;
  if (h < 18) return t.greeting.afternoon;
  return t.greeting.evening;
}

/** Header "Oggi" con saluto e week strip (DESIGN.md §6.1). */
export function TodayHeader({
  firstName,
  lastName,
  onMenu,
  onAgenda,
  markedDays = [],
}: {
  firstName: string;
  lastName: string;
  onMenu?: () => void;
  onAgenda?: () => void;
  markedDays?: number[];
}) {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const today = new Date();
  const [selected, setSelected] = useState(today.toDateString());
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md }}>
      <View style={styles.row}>
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel={t.a11y.openMenu}
          style={{
            width: layout.headerAvatar,
            height: layout.headerAvatar,
            borderRadius: radius.md,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: colors.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[typography.headline, { color: colors.primary }]}>{initials}</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{greeting(today)}</Text>
          <Text style={[typography.title1, { color: colors.text }]}>{firstName}!</Text>
        </View>
        <IconButton icon="calendar" label={t.a11y.openAgenda} onPress={onAgenda} />
      </View>

      <Text style={[typography.body, { color: colors.textSecondary }]}>
        {today.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>

      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        {days.map((d) => {
          const isSel = d.toDateString() === selected;
          const marked = markedDays.includes(d.getDate());
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => setSelected(d.toDateString())}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              style={{ alignItems: 'center', gap: spacing.xs, minWidth: 40 }}
            >
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
              </Text>
              <View
                style={{
                  width: layout.dayCell,
                  height: layout.dayCell,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSel ? colors.primary : colors.surfaceMuted,
                  borderWidth: isSel ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={[
                    typography.callout,
                    { color: isSel ? colors.onPrimary : colors.textSecondary, fontWeight: isSel ? '700' : '500' },
                  ]}
                >
                  {d.getDate()}
                </Text>
                {marked && <View style={[styles.dot, { backgroundColor: colors.accentWarm }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: 3 },
});
