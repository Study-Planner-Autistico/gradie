import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { tap } from './haptics';
import { Icon, type IconName } from './icons';

/** Gruppo di righe in una card raised (DESIGN.md §5.4). */
export function ListGroup({ children, title }: { children: ReactNode; title?: string }) {
  const { colors, radius, spacing, typography } = useTheme();
  const items = Children.toArray(children);
  return (
    <View style={{ gap: spacing.sm }}>
      {title && <Text style={[typography.overline, { color: colors.textTertiary, marginLeft: spacing.xs }]}>{title}</Text>}
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing.lg, boxShadow: colors.shadowRaised }}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 48 }} />}
            {child}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/** Riga con icona in un riquadro, etichetta e chevron (DESIGN.md §5.4). */
export function ListRow({
  icon,
  leading,
  label,
  detail,
  onPress,
  trailing,
}: {
  icon?: IconName;
  /** Al posto dell'icona (es. una bandiera). */
  leading?: ReactNode;
  label: string;
  detail?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      accessibilityRole="button"
      style={({ pressed }) => ({
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {leading ?? (
        <View style={{ width: 32, height: 32, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          {icon && <Icon name={icon} size={18} color={colors.textSecondary} />}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[typography.callout, { color: colors.text }]}>{label}</Text>
        {detail && <Text style={[typography.caption, { color: colors.textTertiary }]}>{detail}</Text>}
      </View>
      {trailing ?? <Icon name="chevron-forward" size={18} color={colors.textTertiary} />}
    </Pressable>
  );
}
