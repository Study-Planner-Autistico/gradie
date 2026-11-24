// Pezzi comuni di Appunti e quaderno (dec. 142-145): copertina con ⋯, menu rapido, copertina disegnata, editor del quaderno, ordine.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { t } from '../i18n';
import type { Sheet, SortMode } from '../state/notebooks';
import { useSettings } from '../state/settings';
import type { NotebookLook } from '../state/subjects';
import { getBoardItems, getNoteMeta, type StudyStatus } from '../state/whiteboard';
import { notify } from './dialogs';
import { downloadNotes } from './whiteboard/exportPdf';
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
  pinned,
  status,
  move,
}: {
  width: number;
  height: number;
  label: string;
  caption: string;
  children: ReactNode;
  onOpen: () => void;
  onMenu: () => void;
  /** Foglio fissato in cima (dec. 145). */
  pinned?: boolean;
  /** Stato di studio del foglio (dec. 145). */
  status?: StudyStatus;
  /** In modalità Riordina: sposta prima o dopo (undefined = già al bordo). */
  move?: { prev?: () => void; next?: () => void };
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
        {(pinned || status) && (
          <View pointerEvents="none" style={{ position: 'absolute', left: 8, top: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
            {status ? <StatusBadge status={status} /> : <View />}
            {pinned && (
              <View accessibilityLabel={t.activitiesHub.pinned} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="pin" size={16} color="#172B4D" />
              </View>
            )}
          </View>
        )}
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
      {move && (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <MoveButton icon="arrow-back" label={`${t.activitiesHub.moveBefore}: ${label}`} onPress={move.prev} />
          <MoveButton icon="arrow-forward" label={`${t.activitiesHub.moveAfter}: ${label}`} onPress={move.next} />
        </View>
      )}
    </View>
  );
}

function MoveButton({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => ({
        flex: 1,
        height: 44,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
        opacity: onPress ? 1 : 0.35,
      })}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

/** Stato di studio con colore fisso e icona propria, così si distingue anche senza colori (dec. 145). */
export const STATUS_ICON: Record<StudyStatus, IconName> = { todo: 'ellipse-outline', doing: 'time-outline', done: 'checkmark-circle' };

export function StatusBadge({ status }: { status: StudyStatus }) {
  const { colors, typography, radius } = useTheme();
  const tone = { todo: [colors.warningBg, colors.warning], doing: [colors.discoveryBg, colors.discovery], done: [colors.successBg, colors.success] }[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 26, borderRadius: radius.pill, backgroundColor: tone[0], flexShrink: 1 }}>
      <Ionicons name={STATUS_ICON[status]} size={14} color={tone[1]} />
      <Text style={[typography.caption, { color: tone[1], fontWeight: '700' }]} numberOfLines={1}>
        {t.activitiesHub.status[status]}
      </Text>
    </View>
  );
}

/** Scelta dell'ordine e modalità Riordina (dec. 145). */
export function SortBar({ value, onChange, reordering, onReorder }: { value: SortMode; onChange: (m: SortMode) => void; reordering: boolean; onReorder: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const modes: SortMode[] = ['custom', 'alpha', 'recent'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t.activitiesHub.sortLabel} style={{ flexDirection: 'row', padding: 2, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }}>
        {modes.map((m) => {
          const on = value === m;
          return (
            <Pressable
              key={m}
              onPress={() => onChange(m)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${t.activitiesHub.sortLabel}: ${t.activitiesHub.sort[m]}`}
              style={{ minHeight: 36, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.md, backgroundColor: on ? colors.surface : 'transparent', boxShadow: on ? colors.shadowRaised : undefined }}
            >
              <Text style={[typography.callout, { color: on ? colors.text : colors.textSecondary, fontWeight: on ? '700' : '400' }]}>{t.activitiesHub.sort[m]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onReorder}
        accessibilityRole="button"
        accessibilityState={{ selected: reordering }}
        accessibilityLabel={reordering ? t.activitiesHub.reorderDone : t.activitiesHub.reorder}
        style={({ pressed }) => ({
          minHeight: 40,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: reordering ? colors.accent : colors.border,
          backgroundColor: reordering ? colors.accent : pressed ? colors.surfaceMuted : 'transparent',
        })}
      >
        <Ionicons name={reordering ? 'checkmark' : 'swap-horizontal'} size={18} color={reordering ? colors.onAccent : colors.text} />
        <Text style={[typography.callout, { color: reordering ? colors.onAccent : colors.text, fontWeight: '600' }]}>{reordering ? t.activitiesHub.reorderDone : t.activitiesHub.reorder}</Text>
      </Pressable>
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

/** Etichetta delle copertine semplici, in proporzione alla copertina. */
const PLAIN_TITLE = { left: 0.2, right: 0.86, top: 0.28, bottom: 0.42 };

/** Copertina del quaderno: il disegno scelto con il nome della materia scritto sull'etichetta (dec. 144). */
export function NotebookCover({ look, name, width, height }: { look: NotebookLook; name: string; width: number; height: number }) {
  const { plainCovers } = useSettings();
  // Copertine semplici (dec. 145): solo il colore, con un'etichetta bianca al posto della fantasia.
  const box = plainCovers ? PLAIN_TITLE : COVER_TITLE[look.theme];
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
      {plainCovers ? (
        <View style={{ width, height, backgroundColor: COVER_SWATCH[look.color] }}>
          <View
            style={{
              position: 'absolute',
              left: (PLAIN_TITLE.left - 0.04) * width,
              right: (1 - PLAIN_TITLE.right - 0.04) * width,
              top: (PLAIN_TITLE.top - 0.03) * height,
              bottom: (1 - PLAIN_TITLE.bottom - 0.03) * height,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
            }}
          />
        </View>
      ) : (
        <Image source={COVER_ART[look.theme][look.color]} style={{ width, height }} resizeMode="stretch" accessibilityIgnoresInvertColors />
      )}
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
          <Text numberOfLines={twoLines ? 2 : 1} allowFontScaling={false} style={{ color: '#1F1F1F', fontWeight: '800', textAlign: 'center', fontSize, lineHeight: Math.round(fontSize * 1.15) }}>
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
  const { plainCovers } = useSettings();
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

              {!plainCovers && <Text style={[typography.overline, { color: colors.textSecondary }]}>{t.activitiesHub.bookTheme}</Text>}
              {!plainCovers && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
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
              </ScrollView>}

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

/** Scarica in un solo PDF tutti i fogli del quaderno, con una prima pagina di indice (dec. 145). */
export async function downloadNotebook(title: string, sheets: Sheet[]) {
  if (!sheets.length) return notify(t.activitiesHub.nothingToDownload);
  try {
    await downloadNotes(
      sheets.map((s) => ({ title: s.title, items: getBoardItems(s.id), meta: getNoteMeta(s.id) })),
      title,
    );
  } catch {
    notify(t.manage.downloadFailed);
  }
}
