import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useTheme, type TintName } from '../theme';
import { tap } from './haptics';
import type { IconName } from './icons';
import { Mascot } from './Mascot';
import { useTabScroll } from '../state/tabScroll';

export type { IconName } from './icons';

/** Istanza di TextInput (per focus()). */
export type TextInputRef = ComponentRef<typeof TextInput>;

/** Contenitore schermata: sfondo surface.sunken, margini 16, spazio per la tab bar. */
/** Schermata con scorrimento. `header` resta fisso in alto, fuori dallo scorrimento. */
/** `scrollEnabled`: false mentre si trascina un elemento (dec. 146). */
export function Screen({ children, withTabBar = true, header, scrollEnabled = true }: { children: ReactNode; withTabBar?: boolean; header?: ReactNode; scrollEnabled?: boolean }) {
  const { colors, spacing, layout } = useTheme();
  const tabScroll = useTabScroll();
  const scrollY = useRef(new Animated.Value(tabScroll.initialY)).current;
  // Sfumatura sotto l'header fisso: compare appena il contenuto ci passa sotto.
  const fade = scrollY.interpolate({ inputRange: [0, 24], outputRange: [0, 1], extrapolate: 'clamp' });
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.bg }}>
      {header && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs, backgroundColor: colors.bg, zIndex: 1 }}>
          {header}
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: '100%', height: 32, opacity: fade }}>
            {/* Curva che cala subito e poi sfuma piano: attacca all'header senza fare una fascia bianca. */}
            <LinearGradient
              colors={[colors.bg, `${colors.bg}B3`, `${colors.bg}66`, `${colors.bg}33`, `${colors.bg}14`, `${colors.bg}00`]}
              locations={[0, 0.15, 0.35, 0.55, 0.78, 1]}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      )}
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => tabScroll.record(e.nativeEvent.contentOffset.y),
        })}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
        contentOffset={tabScroll.contentOffset}
        ref={tabScroll.ref}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          gap: spacing.md,
          paddingBottom: withTabBar ? layout.tabBarClearance : spacing.xxl,
        }}
      >
        {children}
      </Animated.ScrollView>
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

/** Card su elevation.surface.raised (DESIGN.md §4). */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          padding: spacing.lg,
          gap: spacing.md,
          boxShadow: colors.shadowRaised,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Card in evidenza con gradiente tenue (DESIGN.md §5.2). Una per schermata. */
export function GradientCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={[{ borderRadius: radius.xl, overflow: 'hidden', boxShadow: colors.shadowRaised }, style]}>
      <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={colors.heroGradientOverlay} start={{ x: 0.2, y: 0.1 }} end={{ x: 0.9, y: 0.9 }} style={StyleSheet.absoluteFill} />
      <View style={{ padding: spacing.lg, gap: spacing.md }}>{children}</View>
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
          <Text style={[typography.callout, { color: colors.link }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Lozenge Atlassian (DESIGN.md §5.6): raggio 4, testo 12 bold. */
export function Chip({
  label,
  icon,
  tint,
  variant = 'tint',
}: {
  label: string;
  icon?: IconName;
  tint?: TintName;
  variant?: 'tint' | 'success' | 'glass' | 'muted' | 'information' | 'warning' | 'danger' | 'discovery';
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const map: Record<string, [string, string]> = {
    success: [colors.successBg, colors.success],
    information: [colors.informationBg, colors.information],
    warning: [colors.warningBg, colors.warning],
    danger: [colors.dangerBg, colors.danger],
    discovery: [colors.discoveryBg, colors.discovery],
    muted: [colors.surfaceMuted, colors.textSecondary],
    glass: [colors.surface, colors.text],
  };
  const [bg, fg] = variant === 'tint' && tint ? [colors.tints[tint].bg, colors.tints[tint].fg] : (map[variant] ?? map.muted);
  return (
    <View
      style={[
        styles.row,
        {
          gap: spacing.xs,
          paddingHorizontal: spacing.sm,
          height: 24,
          borderRadius: radius.sm,
          backgroundColor: bg,
          alignSelf: 'flex-start',
          borderWidth: variant === 'glass' ? 1 : 0,
          borderColor: colors.border,
        },
      ]}
    >
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[typography.overline, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Stato vuoto compatto (DESIGN.md §7). */
export function EmptyState({ icon, message }: { icon: IconName; message: string }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <View style={[styles.box40, { backgroundColor: colors.surfaceMuted, borderRadius: radius.lg }]}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <Text style={[typography.callout, { color: colors.textSecondary, flex: 1, fontWeight: '400' }]}>{message}</Text>
    </View>
  );
}

export type ButtonAppearance = 'primary' | 'default' | 'subtle' | 'danger' | 'warning' | 'discovery' | 'ink' | 'inverse' | 'inverseSubtle';

/** Bottone Atlassian (DESIGN.md §5.5): alto 48 su mobile, raggio 8. */
export function Button({
  title,
  onPress,
  appearance = 'default',
  iconBefore,
  iconAfter,
  loading,
  disabled,
  fullWidth = true,
  accessibilityLabel,
}: {
  title: string;
  onPress?: () => void;
  appearance?: ButtonAppearance;
  iconBefore?: IconName;
  iconAfter?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}) {
  const { colors, radius, typography, layout, spacing } = useTheme();
  const palette: Record<ButtonAppearance, { bg: string; pressed: string; fg: string }> = {
    primary: { bg: colors.accent, pressed: colors.accentPressed, fg: colors.onAccent },
    ink: { bg: colors.ink, pressed: colors.textSecondary, fg: colors.onInk },
    default: { bg: colors.surfaceMuted, pressed: colors.neutralPressed, fg: colors.textSecondary },
    subtle: { bg: 'transparent', pressed: colors.surfaceMuted, fg: colors.textSecondary },
    danger: { bg: colors.dangerIcon, pressed: colors.danger, fg: '#FFFFFF' },
    warning: { bg: '#FBC828', pressed: '#F5B000', fg: '#292A2E' },
    discovery: { bg: colors.discovery, pressed: colors.discovery, fg: '#FFFFFF' },
    /** Sul gradiente di brand: bianco pieno con testo viola, o trasparente con testo bianco. */
    inverse: { bg: '#FFFFFF', pressed: '#EEECFF', fg: '#463FB5' },
    inverseSubtle: { bg: 'transparent', pressed: 'rgba(255,255,255,0.16)', fg: '#FFFFFF' },
  };
  const p = palette[appearance];
  const isOff = disabled || loading;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      disabled={isOff}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!isOff, busy: !!loading }}
      style={({ pressed }) => ({
        height: layout.button,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.lg,
        backgroundColor: disabled ? colors.surfaceMuted : pressed ? p.pressed : p.bg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {iconBefore && <Ionicons name={iconBefore} size={18} color={disabled ? colors.textDisabled : p.fg} />}
          <Text style={[typography.headline, { color: disabled ? colors.textDisabled : p.fg }]}>{title}</Text>
          {iconAfter && <Ionicons name={iconAfter} size={18} color={disabled ? colors.textDisabled : p.fg} />}
        </>
      )}
    </Pressable>
  );
}

/** Compatibilità: bottone primario a tutta larghezza. */
export function PrimaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  return <Button title={title} onPress={onPress} appearance="primary" iconAfter="arrow-forward" />;
}

/** Icon button Atlassian, forma circolare (DESIGN.md §5.5). */
export function IconButton({
  icon,
  label,
  onPress,
  appearance = 'default',
  size = 44,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  appearance?: 'default' | 'subtle' | 'primary';
  size?: number;
}) {
  const { colors } = useTheme();
  const bg = appearance === 'primary' ? colors.accent : appearance === 'subtle' ? 'transparent' : colors.surface;
  const fg = appearance === 'primary' ? colors.onAccent : colors.textSecondary;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.neutralHovered : bg,
        boxShadow: appearance === 'default' ? colors.shadowRaised : undefined,
      })}
    >
      <Ionicons name={icon} size={20} color={fg} />
    </Pressable>
  );
}

/** Bottone flottante: primary circolare con elevation.shadow.overlay (DESIGN.md §5.5). */
export function Fab({ icon, label, onPress, bottom }: { icon: IconName; label: string; onPress?: () => void; bottom: number }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 20,
        bottom,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.accentPressed : colors.accent,
        boxShadow: colors.shadowOverlay,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Ionicons name={icon} size={24} color={colors.onAccent} />
    </Pressable>
  );
}

/** Avatar con iniziali (DESIGN.md §5.8). */
export function Avatar({ firstName, lastName, size = 40 }: { firstName: string; lastName: string; size?: number }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.tints.lesson.bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.surface,
      }}
    >
      <Text style={[size > 56 ? typography.title2 : typography.callout, { color: colors.tints.lesson.fg, fontWeight: '700' }]}>
        {`${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()}
      </Text>
    </View>
  );
}

/** Campo di testo Atlassian (DESIGN.md §5.10): etichetta sopra, bordo input, focus 2 px. */
export function TextField({
  label,
  helper,
  error,
  ref,
  ...props
}: TextInputProps & { label: string; helper?: string; error?: string; ref?: Ref<TextInputRef> }) {
  const { colors, typography, radius, spacing, layout } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.dangerIcon : focused ? colors.borderFocused : colors.borderInput;
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.overline, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textTertiary}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        accessibilityLabel={label}
        style={[
          props.multiline ? typography.body : typography.input,
          {
            minHeight: layout.input,
            // Una riga: niente padding verticale, il testo resta al centro (Android: anche senza il padding del font).
            ...(props.multiline ? null : { paddingVertical: 0, textAlignVertical: 'center' as const, includeFontPadding: false }),
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            borderWidth: focused || error ? 2 : 1,
            borderColor,
            backgroundColor: colors.surface,
            color: colors.text,
          },
          // Sul web niente contorno del browser: il focus è il bordo di 2 px.
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          props.style,
        ]}
      />
      {(error || helper) && (
        <View style={[styles.row, { gap: spacing.xs }]}>
          {error && <Ionicons name="alert-circle" size={14} color={colors.dangerIcon} />}
          <Text style={[typography.caption, { color: error ? colors.danger : colors.textTertiary, flex: 1 }]}>{error ?? helper}</Text>
        </View>
      )}
    </View>
  );
}

/** Checkbox Atlassian: quadrato 20, raggio 4, brand quando selezionata. */
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  const { colors, typography, radius, spacing, layout } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onChange(!checked);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.row, { gap: spacing.md, minHeight: 44, alignItems: 'flex-start', paddingVertical: spacing.sm }]}
    >
      <View
        style={{
          width: layout.checkbox,
          height: layout.checkbox,
          marginTop: 2,
          borderRadius: radius.sm,
          borderWidth: checked ? 0 : 2,
          borderColor: colors.borderInput,
          backgroundColor: checked ? colors.accent : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Ionicons name="checkmark" size={14} color={colors.onAccent} />}
      </View>
      <Text style={[typography.callout, { color: colors.text, flex: 1, fontWeight: '400' }]}>{label}</Text>
    </Pressable>
  );
}

/** Section message Atlassian (DESIGN.md §5.11). */
export function SectionMessage({
  appearance = 'information',
  title,
  children,
}: {
  appearance?: 'information' | 'warning' | 'error' | 'success' | 'discovery';
  title?: string;
  children?: ReactNode;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const cfg = {
    information: { bg: colors.informationBg, fg: colors.information, icon: 'information-circle' as IconName },
    warning: { bg: colors.warningBg, fg: colors.warningIcon, icon: 'warning' as IconName },
    error: { bg: colors.dangerBg, fg: colors.dangerIcon, icon: 'alert-circle' as IconName },
    success: { bg: colors.successBg, fg: colors.successIcon, icon: 'checkmark-circle' as IconName },
    discovery: { bg: colors.discoveryBg, fg: colors.discovery, icon: 'sparkles' as IconName },
  }[appearance];
  return (
    <View style={[styles.row, { alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={20} color={cfg.fg} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        {title && <Text style={[typography.headline, { color: colors.text }]}>{title}</Text>}
        {typeof children === 'string' ? (
          <Text style={[typography.callout, { color: colors.text, fontWeight: '400' }]}>{children}</Text>
        ) : (
          children
        )}
      </View>
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
        <Mascot size={120} mood="sleepy" />
        <Chip variant="muted" icon={icon} label={title} />
        <Text style={[typography.headline, { color: colors.text }]}>{t.placeholder.title}</Text>
        <Text style={[typography.callout, { color: colors.textSecondary, textAlign: 'center', fontWeight: '400' }]}>{t.placeholder.body}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box40: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  box56: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
