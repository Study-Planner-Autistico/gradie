import Ionicons from '@expo/vector-icons/Ionicons';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { IconName } from './icons';

/** Gruppo di righe in una card bianca (DESIGN.md §5.4). */
export function ListGroup({ children, title }: { children: ReactNode; title?: string }) {
  const { colors, radius, spacing, typography } = useTheme();
  const items = Children.toArray(children);
  return (
    <View style={{ gap: spacing.sm }}>
      {title && (
        <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.xs, textTransform: 'uppercase' }]}>
          {title}
        </Text>
      )}
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing.lg }}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 36 }} />}
            {child}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/** Riga con icona, etichetta e bottone-freccia rotondo (DESIGN.md §5.4). */
export function ListRow({
  icon,
  label,
  detail,
  onPress,
  trailing,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const { colors, typography, spacing, layout } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.sm,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
        {detail && <Text style={[typography.caption, { color: colors.textSecondary }]}>{detail}</Text>}
      </View>
      {trailing ?? (
        <View
          style={{
            width: layout.smallIconButton,
            height: layout.smallIconButton,
            borderRadius: layout.smallIconButton / 2,
            backgroundColor: colors.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-forward" size={16} color={colors.text} />
        </View>
      )}
    </Pressable>
  );
}
