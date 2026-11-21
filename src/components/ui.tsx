import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useTheme } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Contenitore schermata: sfondo bg, margini 16, spazio per la tab bar flottante. */
export function Screen({ children, withTabBar = true }: { children: ReactNode; withTabBar?: boolean }) {
  const { colors, spacing, layout } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.md,
          paddingBottom: withTabBar ? layout.tabBarHeight + layout.tabBarMargin + spacing.xxl : spacing.xxl,
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Card neutra (DESIGN.md §6.3). */
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.sm,
          shadowColor: colors.shadow,
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.headline, { color: colors.text, flex: 1 }]} accessibilityRole="header">
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={12} accessibilityRole="link">
          <Text style={[typography.callout, { color: colors.primary }]}>{t.home.seeAll}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Stato vuoto (DESIGN.md §8). */
export function EmptyState({ icon, message }: { icon: IconName; message: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.md, paddingVertical: spacing.sm }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>{message}</Text>
    </View>
  );
}

/** Bottone icona quadrato 44 (header). */
export function IconButton({
  icon,
  onPress,
  label,
  tone = 'warm',
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  tone?: 'warm' | 'muted';
}) {
  const { colors, radius, layout } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: layout.iconButton,
        height: layout.iconButton,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tone === 'warm' ? colors.accentWarm : colors.surfaceMuted,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Ionicons name={icon} size={22} color={tone === 'warm' ? colors.onPrimary : colors.text} />
    </Pressable>
  );
}

/** Bottone primario pill (DESIGN.md §6.5). */
export function PrimaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const { colors, radius, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        height: 52,
        borderRadius: radius.pill,
        backgroundColor: pressed ? colors.primaryPressed : colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Text style={[typography.headline, { color: colors.onPrimary }]}>{title}</Text>
    </Pressable>
  );
}

/** Schermata segnaposto per moduli non ancora progettati. */
export function PlaceholderScreen({ title, icon }: { title: string; icon: IconName }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Screen>
      <Text style={[typography.title1, { color: colors.text, marginBottom: spacing.sm }]}>{title}</Text>
      <Card style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
        <View style={[styles.bigIcon, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name={icon} size={28} color={colors.textSecondary} />
        </View>
        <Text style={[typography.headline, { color: colors.text }]}>{t.placeholder.title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{t.placeholder.body}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bigIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
