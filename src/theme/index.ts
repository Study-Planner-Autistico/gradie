import { useColorScheme } from 'react-native';
import { useSettings } from '../state/settings';
import { darkColors, layout, lightColors, motion, radius, spacing, typography } from './tokens';

export * from './tokens';

/** Tema chiaro/scuro/automatico (dec. 48): segue il sistema o la scelta nelle Impostazioni (Appearance). */
export function useTheme() {
  const system = useColorScheme();
  // Iscrive alle Impostazioni: quasi ogni componente chiama useTheme, così tema e lingua si aggiornano subito ovunque.
  const pref = useSettings().theme;
  const scheme = pref === 'system' ? system : pref;
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return { colors, spacing, radius, typography, layout, motion, isDark: scheme === 'dark' };
}

export type Theme = ReturnType<typeof useTheme>;
