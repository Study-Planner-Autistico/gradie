import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { IconName } from './icons';

const nativeGlass = isLiquidGlassAvailable();

/**
 * Superficie Liquid Glass (DESIGN.md §1).
 * iOS 26+: GlassView nativo. Altrove: blur + velo + bordo sottile.
 */
export function Glass({
  children,
  style,
  variant = 'regular',
  interactive = false,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'regular' | 'clear';
  interactive?: boolean;
}) {
  const { colors, isDark } = useTheme();
  if (nativeGlass) {
    return (
      <GlassView glassEffectStyle={variant} isInteractive={interactive} style={[styles.clip, style]}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[styles.clip, { borderWidth: 1, borderColor: colors.glassBorder }, style]}>
      <BlurView intensity={variant === 'clear' ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: variant === 'clear' ? 'transparent' : colors.glassFallback }]}
      />
      {children}
    </View>
  );
}

/** Bottone rotondo in glass per header e azioni flottanti (DESIGN.md §5.5). */
export function GlassButton({
  icon,
  label,
  onPress,
  size = 44,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed && !nativeGlass ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
    >
      <Glass interactive style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={20} color={colors.text} />
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
