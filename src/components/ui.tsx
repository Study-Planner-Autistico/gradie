import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useTheme, type TintName } from '../theme';
import { Glass } from './Glass';
import type { IconName } from './icons';

export type { IconName } from './icons';

/** Contenitore schermata: sfondo bg, margini 16, spazio per la tab bar. */
export function Screen({ children, withTabBar = true }: { children: ReactNode; withTabBar?: boolean }) {
  const { colors, spacing, layout } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          gap: spacing.md,
          paddingBottom: withTabBar ? layout.tabBarClearance : spacing.xxl,
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Header della schermata (DESIGN.md §5.1). */
export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  /** Titolo più piccolo, per l'header con avatar della Home. */
  compact?: boolean;
}) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.md, paddingVertical: spacing.sm }]}>
      {left}
      <View style={{ flex: 1 }}>
        {title && (
          <Text
            style={[compact ? typography.headline : typography.title1, { color: colors.text }]}
            accessibilityRole="header"
            numberOfLines={compact ? 1 : undefined}
          >
            {title}
          </Text>
        )}
        {subtitle && <Text style={[typography.callout, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {right && <View style={[styles.row, { gap: spacing.sm }]}>{right}</View>}
    </View>
  );
}

/** Card bianca (DESIGN.md §4). */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          padding: spacing.xl,
          gap: spacing.md,
          shadowColor: colors.shadow,
          shadowOpacity: 1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 2 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Card con gradiente "mesh" (DESIGN.md §5.2). Una per schermata. */
export function GradientCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, style]}>
      <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={colors.heroGradientOverlay}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ padding: spacing.xl, gap: spacing.md }}>{children}</View>
    </View>
  );
}

/** Intestazione di card con link facoltativo. */
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.title2, { color: colors.text, flex: 1 }]} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={12} accessibilityRole="link">
          <Text style={[typography.callout, { color: colors.accent }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Chip (DESIGN.md §5.6). */
export function Chip({
  label,
  icon,
  tint,
  variant = 'tint',
}: {
  label: string;
  icon?: IconName;
  tint?: TintName;
  variant?: 'tint' | 'success' | 'glass' | 'muted';
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const fg =
    variant === 'success' ? colors.success : variant === 'tint' && tint ? colors.tints[tint].fg : colors.text;
  const content = (
    <View style={[styles.row, { gap: spacing.xs, paddingHorizontal: 10, height: 28 }]}>
      {icon && <Ionicons name={icon} size={13} color={fg} />}
      <Text style={[typography.caption, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
  if (variant === 'glass') {
    return (
      <Glass variant="clear" style={{ borderRadius: radius.pill }}>
        {content}
      </Glass>
    );
  }
  const bg =
    variant === 'success'
      ? colors.successBg
      : variant === 'tint' && tint
        ? colors.tints[tint].bg
        : colors.surfaceMuted;
  return <View style={{ backgroundColor: bg, borderRadius: radius.pill, alignSelf: 'flex-start' }}>{content}</View>;
}

/** Stato vuoto compatto (DESIGN.md §7). */
export function EmptyState({ icon, message }: { icon: IconName; message: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <View style={[styles.circle40, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>{message}</Text>
    </View>
  );
}

/** Bottone primario: pill nera con cerchio-freccia (DESIGN.md §5.5). */
export function PrimaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const { colors, radius, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        height: 56,
        borderRadius: radius.pill,
        backgroundColor: colors.ink,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={[styles.circle40, styles.leading, { backgroundColor: colors.onInk }]}>
        <Ionicons name="arrow-forward" size={20} color={colors.ink} />
      </View>
      <Text style={[typography.headline, { color: colors.onInk }]}>{title}</Text>
    </Pressable>
  );
}

/** Avatar con iniziali (DESIGN.md §5.8). */
export function Avatar({ firstName, lastName, size = 44 }: { firstName: string; lastName: string; size?: number }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={[size > 56 ? typography.title2 : typography.callout, { color: colors.text, fontWeight: '600' }]}>
        {`${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()}
      </Text>
    </View>
  );
}

/** Schermata segnaposto per moduli non ancora progettati. */
export function PlaceholderScreen({ title, icon }: { title: string; icon: IconName }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Screen>
      <ScreenHeader title={title} />
      <Card style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
        <View style={[styles.circle56, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name={icon} size={26} color={colors.textSecondary} />
        </View>
        <Text style={[typography.headline, { color: colors.text }]}>{t.placeholder.title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{t.placeholder.body}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  circle40: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  circle56: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  leading: { position: 'absolute', left: 8 },
});
