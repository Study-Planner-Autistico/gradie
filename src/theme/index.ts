import { useColorScheme } from 'react-native';
import { darkColors, layout, lightColors, motion, radius, spacing, typography } from './tokens';

export * from './tokens';

/** Tema chiaro/scuro/automatico (dec. 48). Per ora segue il sistema. */
export function useTheme() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return { colors, spacing, radius, typography, layout, motion, isDark: scheme === 'dark' };
}

export type Theme = ReturnType<typeof useTheme>;
