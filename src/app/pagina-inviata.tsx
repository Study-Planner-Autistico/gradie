import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { copyLabel } from '../components/chat';
import { Icon } from '../components/icons';
import { ThumbView } from '../components/SheetThumb';
import { t } from '../i18n';
import { useThreads } from '../state/messages';
import { useTheme } from '../theme';

/**
 * Pagina degli Appunti ricevuta o inviata in chat (dec. 192): si vede la copia fatta al momento dell'invio, a tutto
 * schermo e solo da guardare. Non è la pagina viva: le modifiche fatte dopo non compaiono.
 */
export default function PaginaInviata() {
  const { thread, msg } = useLocalSearchParams<{ thread: string; msg: string }>();
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const note = useThreads()
    .find((x) => x.id === thread)
    ?.messages.find((m) => m.id === msg)?.note;
  const [box, setBox] = useState({ w: 0, h: 0 });
  const T = t.messages;
  if (!note) return null;
  // Foglio in proporzione (come in Appunti) e il più grande possibile.
  const ratio = 1.32;
  const pw = Math.min(box.w, box.h / ratio);
  const ph = pw * ratio;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing.xs, paddingBottom: insets.bottom }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 52 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={T.close} style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Icon name="close" size={26} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]} numberOfLines={1}>
            {(note.subject || T.otherSheets) + ' · ' + copyLabel(note.at)}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.informationBg }}>
        <Icon name="lock-closed-outline" size={18} color={colors.information} />
        <Text style={[typography.caption, { flex: 1, color: colors.information }]}>{T.copyNote}</Text>
      </View>
      <View style={{ flex: 1, padding: spacing.lg }} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width - spacing.lg * 2, h: e.nativeEvent.layout.height - spacing.lg * 2 })}>
        {pw > 0 && (
          <View style={{ alignSelf: 'center', width: pw, height: ph, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF' }}>
            <ThumbView snap={note} width={pw} height={ph} />
          </View>
        )}
      </View>
    </View>
  );
}
