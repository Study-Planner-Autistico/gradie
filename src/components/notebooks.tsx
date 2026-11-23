// Pezzi comuni di Appunti e quaderno (dec. 142-144): copertina con ⋯, menu rapido, copertina disegnata, editor del quaderno.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { t } from '../i18n';
import type { NotebookLook } from '../state/subjects';
import { useTheme } from '../theme';
import { COVER_ART, COVER_COLORS, COVER_RATIO, COVER_SWATCH, COVER_THEMES, COVER_TITLE } from './coverArt';
import { tap } from './haptics';
import { Button, TextField, type IconName } from './ui';

/** Elemento della griglia (quaderno o foglio): tocco per aprire, ⋯ o pressione lunga per il menu. */
export function CoverCard({
  width,
  height,
  label,
  caption,
  children,
  onOpen,
  onMenu,
}: {
  width: number;
  height: number;
  label: string;
  caption: string;
  children: ReactNode;
  onOpen: () => void;
  onMenu: () => void;
}) {
  const { colors, typography, radius } = useTheme();
  const menu = () => {
    tap();
    onMenu();
  };
  return (
    <View style={{ width, gap: 6 }}>
      <View style={{ borderRadius: radius.md, boxShadow: colors.shadowRaised }}>
        <Pressable onPress={onOpen} onLongPress={menu} delayLongPress={400} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
          <View style={{ width, height, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>{children}</View>
        </Pressable>
        <Pressable
          onPress={menu}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${t.activitiesHub.more}: ${label}`}
          style={({ pressed }) => ({
            position: 'absolute',
            right: 8,
            bottom: 8,
            width: 36,
            height: 36,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#172B4D" />
        </Pressable>
      </View>
      <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}

/** Riquadro tratteggiato per creare un elemento nuovo nella griglia. */
export function AddCard({ width, height, label, onPress }: { width: number; height: number; label: string; onPress: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width,
        height,
        borderRadius: radius.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.borderInput,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent }}>
        <Ionicons name="add" size={28} color={colors.onAccent} />
      </View>
      <Text style={[typography.headline, { color: colors.text, textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  );
}

export type MenuItem = { icon: IconName; label: string; onPress: () => void; danger?: boolean };

/** Menu rapido di un quaderno o di un foglio (dec. 119, 142). */
export function ItemMenu({ title, items, onClose }: { title: string; items: MenuItem[]; onClose: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} accessibilityLabel={t.a11y.close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl }}>
        <Pressable style={{ alignSelf: 'center', width: '100%', maxWidth: 360, borderRadius: radius.lg, backgroundColor: colors.surface, paddingVertical: spacing.sm, boxShadow: colors.shadowOverlay }}>
          <Text style={[typography.headline, { color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }]} numberOfLines={1}>
            {title}
          </Text>
          {items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => {
                onClose();
                it.onPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={it.label}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                minHeight: 48,
                paddingHorizontal: spacing.lg,
                backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
              })}
            >
              <Ionicons name={it.icon} size={22} color={it.danger ? colors.danger : colors.text} />
              <Text style={[typography.body, { color: it.danger ? colors.danger : colors.text }]}>{it.label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Copertina del quaderno: il disegno scelto con il nome della materia scritto sull'etichetta (dec. 144). */
export function NotebookCover({ look, name, width, height }: { look: NotebookLook; name: string; width: number; height: number }) {
  const box = COVER_TITLE[look.theme];
  // Dimensione del nome calcolata qui (sul web il testo non si rimpicciolisce da solo):
  // una riga se ci sta abbastanza grande, altrimenti due righe più piccole.
  const bw = (box.right - box.left) * width - 8;
  const bh = (box.bottom - box.top) * height - 2;
  const CHAR = 0.62;
  const one = Math.min(bh * 0.62, width * 0.09, bw / (Math.max(name.length, 1) * CHAR));
  const twoLines = one < width * 0.055 && name.includes(' ');
  const longestWord = Math.max(...name.split(/\s+/).map((w) => w.length), 1);
  const two = Math.min(bh / 2.4, width * 0.075, bw / (Math.max(Math.ceil(name.length / 2), longestWord) * CHAR));
  const fontSize = Math.max(7, twoLines ? two : one);
  return (
    <View style={{ width, height }}>
      <Image source={COVER_ART[look.theme][look.color]} style={{ width, height }} resizeMode="stretch" accessibilityIgnoresInvertColors />
      {!!name && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: box.left * width + 4,
            width: bw,
            top: box.top * height + 2,
            height: bh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text numberOfLines={twoLines ? 2 : 1} style={{ color: '#1F1F1F', fontWeight: '800', textAlign: 'center', fontSize, lineHeight: Math.round(fontSize * 1.15) }}>
            {name}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Nuovo quaderno o modifica: nome della materia, tema e colore della copertina (dec. 143-144).
 * `onSave` restituisce un messaggio d'errore se il nome non va bene.
 */
export function NotebookEditor({
  initial,
  onClose,
  onSave,
}: {
  initial?: { name: string; look: NotebookLook };
  onClose: () => void;
  onSave: (name: string, look: NotebookLook) => string | undefined;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [look, setLook] = useState<NotebookLook>(initial?.look ?? { theme: 'stripes', color: 'blue' });
  const [err, setErr] = useState<string | undefined>();
  const save = () => {
    const v = name.trim();
    if (!v) return setErr(t.activitiesHub.subjectEmpty);
    const e = onSave(v, look);
    if (e) setErr(e);
  };
  const THUMB_W = 64;
  const THUMB_H = Math.round(THUMB_W / COVER_RATIO);
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={onClose} accessibilityLabel={t.a11y.close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg }}>
          <Pressable style={{ alignSelf: 'center', width: '100%', maxWidth: 440, maxHeight: '92%', borderRadius: radius.lg, backgroundColor: colors.surface, boxShadow: colors.shadowOverlay, overflow: 'hidden' }}>
            <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} keyboardShouldPersistTaps="handled">
              <Text style={[typography.title2, { color: colors.text }]} accessibilityRole="header">
                {initial ? t.activitiesHub.editBookTitle : t.activitiesHub.newBook}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <View style={{ borderRadius: radius.sm, overflow: 'hidden' }}>
                  <NotebookCover look={look} name={name.trim() || t.activitiesHub.subjectPh} width={96} height={Math.round(96 / COVER_RATIO)} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label={t.activitiesHub.bookName}
                    placeholder={t.activitiesHub.subjectPh}
                    value={name}
                    onChangeText={(v) => {
                      setName(v);
                      setErr(undefined);
                    }}
                    onSubmitEditing={save}
                    returnKeyType="done"
                    autoFocus={!initial}
                    maxLength={40}
                    error={err}
                  />
                </View>
              </View>

              <Text style={[typography.overline, { color: colors.textSecondary }]}>{t.activitiesHub.bookTheme}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {COVER_THEMES.map((th) => {
                  const on = look.theme === th;
                  return (
                    <Pressable
                      key={th}
                      onPress={() => setLook((l) => ({ ...l, theme: th }))}
                      accessibilityRole="button"
                      accessibilityLabel={t.activitiesHub.themes[th]}
                      accessibilityState={{ selected: on }}
                      style={{ alignItems: 'center', gap: 4 }}
                    >
                      <View style={{ borderRadius: radius.sm, borderWidth: 2, borderColor: on ? colors.accent : 'transparent', padding: 2 }}>
                        <Image source={COVER_ART[th][look.color]} style={{ width: THUMB_W, height: THUMB_H, borderRadius: radius.sm - 2 }} />
                      </View>
                      <Text style={[typography.caption, { color: on ? colors.text : colors.textSecondary, fontWeight: on ? '700' : '400' }]}>{t.activitiesHub.themes[th]}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[typography.overline, { color: colors.textSecondary }]}>{t.activitiesHub.bookColor}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {COVER_COLORS.map((c) => {
                  const on = look.color === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setLook((l) => ({ ...l, color: c }))}
                      accessibilityRole="button"
                      accessibilityLabel={t.activitiesHub.coverColors[c]}
                      accessibilityState={{ selected: on }}
                      style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: on ? colors.accent : 'transparent' }}
                    >
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COVER_SWATCH[c], alignItems: 'center', justifyContent: 'center' }}>
                        {on && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' }}>
                <Button title={t.manage.cancel} appearance="subtle" fullWidth={false} onPress={onClose} />
                <Button title={initial ? t.newNote.save : t.newNote.create} appearance="primary" fullWidth={false} onPress={save} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
