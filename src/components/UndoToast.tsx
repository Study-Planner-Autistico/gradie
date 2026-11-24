// Avviso con "Annulla" dopo un'eliminazione (dec. 145): resta qualche secondo in basso, sopra la barra delle schede.
import { useEffect, useSyncExternalStore } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useTheme } from '../theme';
import { tap } from './haptics';

type Toast = { id: number; message: string; undo: () => void };
let current: Toast | null = null;
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** Tempo in cui si può annullare: fisso, abbastanza lungo da leggere con calma. */
const DURATION = 7000;

/** Mostra l'avviso; un nuovo avviso sostituisce il precedente (che resta comunque nel cestino). */
export function showUndo(message: string, undo: () => void) {
  current = { id: ++counter, message, undo };
  emit();
}

function hide(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

export function UndoToast() {
  const toast = useSyncExternalStore(subscribe, () => current, () => current);
  const { colors, typography, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => hide(toast.id), DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 96, alignItems: 'center', paddingHorizontal: spacing.lg }}>
      <View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={{
          width: '100%',
          maxWidth: 480,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingLeft: spacing.lg,
          paddingRight: spacing.xs,
          minHeight: 52,
          borderRadius: radius.md,
          backgroundColor: colors.text,
          boxShadow: colors.shadowOverlay,
        }}
      >
        <Text style={[typography.callout, { flex: 1, color: colors.bg }]} numberOfLines={2}>
          {toast.message}
        </Text>
        <Pressable
          onPress={() => {
            tap();
            hide(toast.id);
            toast.undo();
          }}
          accessibilityRole="button"
          accessibilityLabel={t.trash.undo}
          hitSlop={6}
          style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.sm, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[typography.headline, { color: colors.bg }]}>{t.trash.undo}</Text>
        </Pressable>
      </View>
    </View>
  );
}
