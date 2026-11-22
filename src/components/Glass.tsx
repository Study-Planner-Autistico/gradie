import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

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
  tint,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'regular' | 'clear';
  interactive?: boolean;
  /** Colore del vetro (es. accent per il bottone flottante). */
  tint?: string;
}) {
  const { colors, isDark } = useTheme();
  if (nativeGlass) {
    return (
      <GlassView glassEffectStyle={variant} isInteractive={interactive} tintColor={tint} style={[styles.clip, style]}>
        {children}
      </GlassView>
    );
  }
  const veil = tint ?? (variant === 'clear' ? 'transparent' : colors.glassFallback);
  return (
    <View style={[styles.clip, { borderWidth: 1, borderColor: colors.glassBorder }, style]}>
      <BlurView intensity={variant === 'clear' ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: veil }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
