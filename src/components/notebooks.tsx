// Pezzi comuni di Appunti e quaderno (dec. 142-143): copertina con ⋯, menu rapido, editor del quaderno.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
import { t } from '../i18n';
import { covers, useTheme } from '../theme';
import { tap } from './haptics';
import { Button, TextField, type IconName } from './ui';
import { CoverThumb } from './whiteboard/Paper';

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

/**
 * Nuovo quaderno o modifica: nome della materia e colore della copertina (dec. 143).
 * `onSave` restituisce un messaggio d'errore se il nome non va bene.
 */
export function NotebookEditor({
  initial,
  onClose,
  onSave,
}: {
  initial?: { name: string; color: string };
  onClose: () => void;
  onSave: (name: string, color: string) => string | undefined;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? covers[0].color);
  const [err, setErr] = useState<string | undefined>();
  const save = () => {
    const v = name.trim();
    if (!v) return setErr(t.activitiesHub.subjectEmpty);
    const e = onSave(v, color);
    if (e) setErr(e);
  };
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={onClose} accessibilityLabel={t.a11y.close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl }}>
          <Pressable style={{ alignSelf: 'center', width: '100%', maxWidth: 420, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.md, boxShadow: colors.shadowOverlay }}>
            <Text style={[typography.title2, { color: colors.text }]} accessibilityRole="header">
              {initial ? t.activitiesHub.editBookTitle : t.activitiesHub.newBook}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              <CoverThumb color={color} title={name || t.activitiesHub.subjectPh} width={64} height={88} />
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
            <Text style={[typography.overline, { color: colors.textSecondary }]}>{t.activitiesHub.bookColor}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {covers.map((c, i) => (
                <Pressable
                  key={c.id}
                  onPress={() => setColor(c.color)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.newNote.classic} ${i + 1}`}
                  accessibilityState={{ selected: color === c.color }}
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: color === c.color ? colors.accent : 'transparent' }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.color, alignItems: 'center', justifyContent: 'center' }}>
                    {color === c.color && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                  </View>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Button title={t.manage.cancel} appearance="subtle" fullWidth={false} onPress={onClose} />
              <Button title={initial ? t.newNote.save : t.newNote.create} appearance="primary" fullWidth={false} onPress={save} />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
