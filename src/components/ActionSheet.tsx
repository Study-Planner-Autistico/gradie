import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useTheme } from '../theme';
import { tap } from './haptics';
import { Icon, type IconName } from './icons';

export type SheetAction = { icon: IconName; label: string; onPress: () => void; danger?: boolean };

/**
 * Menu che sale dal basso (dec. 190): tenendo premuta una chat, dalla graffetta, dai "…" della chat.
 * Uguale su iPhone, iPad e web (l'Alert di sistema sul web non mostra le scelte).
 */
export function ActionSheet({
  visible,
  title,
  header,
  actions,
  onClose,
  children,
}: {
  visible: boolean;
  title?: string;
  header?: ReactNode;
  actions?: SheetAction[];
  onClose: () => void;
  /** Al posto delle azioni: un contenuto proprio (es. la scelta delle pagine degli appunti). */
  children?: ReactNode;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  // Chiuso: niente Modal. Sul web la dissolvenza di chiusura restava a metà, sotto il menu successivo.
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: colors.blanket }} onPress={onClose} accessibilityLabel={t.messages.cancel} />
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end', alignItems: 'center' }}>
      <View
        accessibilityViewIsModal
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: colors.surfaceOverlay,
          borderTopLeftRadius: radius.xxl,
          borderTopRightRadius: radius.xxl,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.md,
          maxHeight: '85%',
        }}
      >
        <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderBold, opacity: 0.5, marginBottom: spacing.sm }} />
        {header}
        {title && (
          <Text accessibilityRole="header" style={[typography.headline, { color: colors.text, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }]}>
            {title}
          </Text>
        )}
        {children ??
          actions?.map((a) => (
            <Pressable
              key={a.label}
              onPress={() => {
                tap();
                onClose();
                a.onPress();
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 56, paddingHorizontal: spacing.xl, backgroundColor: pressed ? colors.surfaceMuted : 'transparent' })}
            >
              <Icon name={a.icon} size={24} color={a.danger ? colors.danger : colors.text} />
              <Text style={[typography.body, { color: a.danger ? colors.danger : colors.text }]}>{a.label}</Text>
            </Pressable>
          ))}
      </View>
      </View>
    </Modal>
  );
}
