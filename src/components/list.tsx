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
      {title && <Text style={[typography.label, { color: colors.textSecondary, marginLeft: spacing.xs }]}>{title}</Text>}
      {/* Prova storybook: riquadro con bordo pieno 2 px e divisori 2 px a tutta larghezza. */}
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, overflow: 'hidden' }}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={{ height: 2, backgroundColor: colors.border }} />}
            <View style={{ paddingHorizontal: spacing.lg }}>{child}</View>
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
      {leading ?? (icon && <Icon name={icon} size={24} color={colors.textSecondary} />)}
      <View style={{ flex: 1 }}>
        <Text style={[typography.headline, { color: colors.text }]}>{label}</Text>
        {detail && <Text style={[typography.caption, { color: colors.textTertiary }]}>{detail}</Text>}
      </View>
      {trailing ?? <Icon name="chevron-forward" size={20} color={colors.borderBold} />}
    </Pressable>
  );
}
