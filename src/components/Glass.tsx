import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Niente vetro (dec. 223). Superficie piatta con bordo pieno 2 px; stessa interfaccia del Glass di prima
 * (`variant` e `interactive` restano per compatibilità e non cambiano più l'aspetto).
 */
export function Glass({
  children,
  style,
  tint,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'regular' | 'clear';
  interactive?: boolean;
  /** Colore pieno (es. il bottone Nuovo). */
  tint?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.clip, { backgroundColor: tint ?? colors.surface, borderWidth: tint ? 0 : 2, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
