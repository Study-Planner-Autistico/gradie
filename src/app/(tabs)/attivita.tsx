import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Animated, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, IconButton, Screen, ScreenHeader, SectionHeader, type IconName } from '../../components/ui';
import { Glass } from '../../components/Glass';
import { tap } from '../../components/haptics';
import { downloadNotes } from '../../components/whiteboard/exportPdf';
import { BoardPreview } from '../../components/whiteboard/BoardPreview';
import { CoverThumb } from '../../components/whiteboard/Paper';
import { demoNotes, type DemoNote } from '../../data/demo';
import { locale, t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import {
  deleteNote,
  duplicateNote,
  getBoardItems,
  getEdited,
  getNoteMeta,
  getViewport,
  setStudyStatus,
  toggleFavorite,
  useBoards,
  useHidden,
  useNoteExtras,
  useNotes,
  usePages,
  type BoardItem,
  type NoteMeta,
  type StudyStatus,
} from '../../state/whiteboard';
import { useTheme } from '../../theme';

type QuickAction = { key: keyof typeof t.activitiesHub.actions; icon: IconName; brand?: boolean };

/** Azioni rapide (dec. 109; senza Prendi appunti e Crea lavagna, dec. 118: le note si creano dal +). Da definire. */
const ACTIONS: QuickAction[] = [
  { key: 'importFile', icon: 'download-outline' },
  { key: 'youtube', icon: 'logo-youtube', brand: true },
];

/** Attività: azioni rapide e note (dec. 109, modifica dec. 25). */
export default function Attivita() {
  const { colors, spacing, layout } = useTheme();
  const { active } = useEnvironment();
  const pages = usePages();
  const metas = useNotes();
  const hidden = useHidden();
  const itemsOf = useBoards();
  const extras = useNoteExtras();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  // In orizzontale e su iPad le note si dispongono su più colonne (dec. 115).
  const [listW, setListW] = useState(0);
  const cols = listW >= 960 ? 3 : listW >= 600 ? 2 : 1;
  const cardW = cols > 1 ? (listW - spacing.md * (cols - 1)) / cols : undefined;
  // Note create dal + (dec. 112), poi pagine nuove con contenuto, poi le note dimostrative.
  const fromPlus: CardNote[] = metas.map((m) => ({
    id: m.id,
    title: m.title,
    subject: '',
    edited: editedLabel(getEdited(m.id) ?? m.created),
    tint: 'lesson',
    cover: m.cover,
  }));
  const loose: CardNote[] = pages
    .filter((p) => !demoNotes.some((n) => n.id === p.id) && !metas.some((m) => m.id === p.id) && !hidden.includes(p.id))
    .map((p) => ({ id: p.id, title: t.whiteboard.untitled, subject: '', edited: editedLabel(p.edited), tint: 'lesson' }));
  // Le note dimostrative modificate compaiono tra quelle con dati propri; quelle eliminate spariscono.
  const demos = demoNotes.filter((n) => !hidden.includes(n.id) && !metas.some((m) => m.id === n.id));
  const notes: CardNote[] = [...fromPlus, ...loose, ...demos];

  const toggleManage = () => {
    setManaging((m) => !m);
    setPicked([]);
  };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const chosen = notes.filter((n) => picked.includes(n.id));

  /** Dati della nota per duplicarla: quelli propri, o predefiniti per le note senza copertina e carta. */
  const metaOf = (n: CardNote): Omit<NoteMeta, 'id' | 'created'> => {
    const m = getNoteMeta(n.id);
    return m
      ? { title: m.title, cover: m.cover, paper: m.paper }
      : { title: n.title, cover: null, paper: { template: 'blank', color: '#FFFFFF', dark: false, size: 'a4', landscape: false } };
  };

  const duplicate = (list = chosen) => {
    list.forEach((n) => {
      const m = metaOf(n);
      duplicateNote(n.id, { ...m, title: `${m.title} ${t.manage.copySuffix}` });
    });
    setPicked([]);
  };

  const download = async (list = chosen) => {
    try {
      await downloadNotes(list.map((n) => ({ title: n.title, items: getBoardItems(n.id), meta: getNoteMeta(n.id) })));
    } catch {
      notify(t.manage.downloadFailed);
    }
  };

  const remove = (list = chosen) =>
    confirm(t.manage.confirmDelete(list.length), t.manage.delete, () => {
      list.forEach((n) => deleteNote(n.id));
      setPicked([]);
    });

  // In evidenza i preferiti, poi le altre note (dec. 119).
  const favs = notes.filter((n) => extras.favorites.includes(n.id));
  const others = notes.filter((n) => !extras.favorites.includes(n.id));
  const resume = managing ? undefined : notes.find((n) => n.id === extras.lastOpened);
  const menuNote = notes.find((n) => n.id === menuFor);

  const card = (n: CardNote) => (
    <View key={n.id} style={{ width: cardW ?? '100%' }}>
      <NoteCard
        note={n}
        items={itemsOf(n.id)}
        managing={managing}
        picked={picked.includes(n.id)}
        onPick={() => toggle(n.id)}
        favorite={extras.favorites.includes(n.id)}
        status={extras.statuses[n.id] ?? 'todo'}
        onMenu={() => setMenuFor(n.id)}
        onDuplicate={() => duplicate([n])}
        onDelete={() => remove([n])}
      />
    </View>
  );
  const grid = (list: CardNote[], measure = false) => (
    <View style={{ gap: spacing.md, flexDirection: 'row', flexWrap: 'wrap' }} onLayout={measure ? (e) => setListW(e.nativeEvent.layout.width) : undefined}>
      {list.map(card)}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
    <Screen>
      <ScreenHeader
        title={t.tabs.activities}
        subtitle={managing ? (picked.length ? t.manage.selected(picked.length) : t.manage.select) : active.name}
        right={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <IconButton icon={managing ? 'checkmark' : 'pencil'} label={managing ? t.manage.done : t.manage.edit} onPress={toggleManage} />
            {!managing && <IconButton icon="add" label={t.newNote.add} onPress={() => router.push('/nuova-nota')} />}
          </View>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -spacing.lg }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
      >
        {ACTIONS.map((a) => (
          <ActionButton
            key={a.key}
            icon={a.icon}
            label={t.activitiesHub.actions[a.key]}
            iconColor={a.brand ? colors.danger : colors.textSecondary}
          />
        ))}
      </ScrollView>

      {resume && (
        <View style={{ marginTop: spacing.sm }}>
          <ResumeCard note={resume} items={itemsOf(resume.id)} />
        </View>
      )}

      {favs.length > 0 && (
        <>
          <View style={{ marginTop: spacing.md }}>
            <SectionHeader title={t.activitiesHub.favorites} />
          </View>
          {grid(favs)}
        </>
      )}

      <View style={{ marginTop: spacing.md }}>
        <SectionHeader title={t.activitiesHub.notes} />
      </View>
      {grid(others, true)}
      <View style={{ alignItems: 'flex-start' }}>
        <Chip label={t.demo} variant="muted" />
      </View>
      {managing && <View style={{ height: 72 }} />}
    </Screen>
    {managing && (
      <View pointerEvents="box-none" style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: layout.tabBarClearance - 18 }}>
        <Glass style={{ borderRadius: 22, flexDirection: 'row', padding: spacing.xs }}>
          <BarButton icon="copy-outline" label={t.manage.duplicate} disabled={!chosen.length} onPress={() => duplicate()} />
          <BarButton icon="download-outline" label={t.manage.download} disabled={!chosen.length} onPress={() => download()} />
          <BarButton
            icon="create-outline"
            label={t.manage.modify}
            disabled={chosen.length !== 1}
            onPress={() => router.push({ pathname: '/nuova-nota', params: { id: chosen[0].id } })}
          />
          <BarButton icon="trash-outline" label={t.manage.delete} disabled={!chosen.length} danger onPress={() => remove()} />
        </Glass>
      </View>
    )}
    {menuNote && (
      <NoteMenu
        title={menuNote.title}
        onClose={() => setMenuFor(null)}
        items={[
          { icon: 'open-outline', label: t.activitiesHub.open, onPress: () => router.push(`/lavagna/${menuNote.id}`) },
          { icon: 'create-outline', label: t.activitiesHub.edit, onPress: () => router.push({ pathname: '/nuova-nota', params: { id: menuNote.id } }) },
          {
            icon: extras.favorites.includes(menuNote.id) ? 'star' : 'star-outline',
            label: extras.favorites.includes(menuNote.id) ? t.activitiesHub.unfavorite : t.activitiesHub.favorite,
            onPress: () => toggleFavorite(menuNote.id),
          },
          { icon: 'copy-outline', label: t.manage.duplicate, onPress: () => duplicate([menuNote]) },
          { icon: 'download-outline', label: t.manage.download, onPress: () => download([menuNote]) },
          { icon: 'trash-outline', label: t.manage.delete, onPress: () => remove([menuNote]), danger: true },
        ]}
      />
    )}
    </View>
  );
}

function BarButton({ icon, label, onPress, disabled, danger }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  const { colors, typography } = useTheme();
  const color = disabled ? colors.textTertiary : danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, opacity: pressed ? 0.6 : 1 })}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[typography.caption, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Conferma prima di un'azione irreversibile; sul web Alert non mostra pulsanti. */
function confirm(message: string, action: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) onYes();
    return;
  }
  Alert.alert(message, undefined, [
    { text: t.manage.cancel, style: 'cancel' },
    { text: action, style: 'destructive', onPress: onYes },
  ]);
}

function notify(message: string) {
  if (Platform.OS === 'web') globalThis.alert?.(message);
  else Alert.alert(message);
}

function ActionButton({ icon, label, iconColor, onPress }: { icon: IconName; label: string; iconColor: string; onPress?: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        height: 40,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={17} color={iconColor} />
      <Text style={[typography.callout, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

type CardNote = DemoNote & { cover?: string | null };

const THUMB = { w: 84, h: 120 };
const STATUS_ORDER: StudyStatus[] = ['todo', 'doing', 'done'];
const SWIPE_W = 148;

/** Colori dello stato di studio: neutro, in corso (giallo), ripassata (verde). */
function useStatusColors(status: StudyStatus) {
  const { colors } = useTheme();
  if (status === 'done') return { bg: colors.successBg, fg: colors.success, icon: 'checkmark-circle' as const };
  if (status === 'doing') return { bg: colors.warningBg, fg: colors.warning, icon: 'time-outline' as const };
  return { bg: colors.surfaceMuted, fg: colors.textSecondary, icon: 'ellipse-outline' as const };
}

/** Stato di studio: un tocco passa al successivo (dec. 119). */
function StatusChip({ id, status }: { id: string; status: StudyStatus }) {
  const { typography, radius } = useTheme();
  const c = useStatusColors(status);
  const next = STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
  return (
    <Pressable
      onPress={() => {
        tap();
        setStudyStatus(id, next);
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${t.activitiesHub.status[status]}. ${t.activitiesHub.statusHint}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        height: 26,
        paddingHorizontal: 10,
        marginTop: 4,
        borderRadius: radius.pill,
        backgroundColor: c.bg,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={c.icon} size={14} color={c.fg} />
      <Text style={[typography.caption, { color: c.fg, fontWeight: '600' }]}>{t.activitiesHub.status[status]}</Text>
    </Pressable>
  );
}

/** Miniatura della nota: copertina, visuale dell'ultima volta o anteprima decorativa. */
function Thumb({ note, items, width, height }: { note: CardNote; items: BoardItem[]; width: number; height: number }) {
  const { colors, typography, radius, spacing } = useTheme();
  const tint = colors.tints[note.tint];
  return (
    <View style={{ width, height, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
      {note.cover ? (
        <CoverThumb color={note.cover} title={note.title} width={width} height={height} />
      ) : items.length > 0 ? (
        <BoardPreview items={items} height={height} viewport={getViewport(note.id)} />
      ) : (
        <View style={{ flex: 1, backgroundColor: tint.bg, padding: spacing.sm, gap: 5 }}>
          <Text style={[typography.caption, { color: tint.fg, fontSize: 10 }]} numberOfLines={1}>
            {note.subject}
          </Text>
          {[0.9, 0.75, 0.85, 0.6, 0.7, 0.8].map((w, i) => (
            <View key={i} style={{ height: 3, width: `${w * 100}%`, borderRadius: 2, backgroundColor: tint.fg, opacity: 0.25 }} />
          ))}
        </View>
      )}
    </View>
  );
}

/** Scheda grande in cima: l'ultima nota aperta, per ripartire con un tocco (dec. 119). */
function ResumeCard({ note, items }: { note: CardNote; items: BoardItem[] }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.activitiesHub.resume}: ${note.title}`}
      onPress={() => router.push(`/lavagna/${note.id}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.accent,
        boxShadow: colors.shadowRaised,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Thumb note={note} items={items} width={96} height={136} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text style={[typography.caption, { color: colors.onAccent, opacity: 0.85, fontWeight: '600' }]}>{t.activitiesHub.resume}</Text>
        <Text style={[typography.title2, { color: colors.onAccent }]} numberOfLines={2}>
          {note.title}
        </Text>
        <Text style={[typography.caption, { color: colors.onAccent, opacity: 0.85 }]}>{note.edited}</Text>
      </View>
      <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.22)' }}>
        <Ionicons name="arrow-forward" size={22} color={colors.onAccent} />
      </View>
    </Pressable>
  );
}

/** Riga nota: miniatura, titolo, data e stato; stella per i preferiti. Scorrendo a sinistra: Duplica ed Elimina (dec. 119). */
function NoteCard({
  note,
  items,
  managing,
  picked,
  onPick,
  favorite,
  status,
  onMenu,
  onDuplicate,
  onDelete,
}: {
  note: CardNote;
  items: BoardItem[];
  managing: boolean;
  picked: boolean;
  onPick: () => void;
  favorite: boolean;
  status: StudyStatus;
  onMenu: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const tint = colors.tints[note.tint];
  const x = useRef(new Animated.Value(0)).current;
  const [pressing, setPressing] = useState(false);
  const open = useRef(false);
  const swipedAt = useRef(0);
  const settle = (to: number) => {
    open.current = to !== 0;
    Animated.spring(x, { toValue: to, useNativeDriver: true, bounciness: 0, speed: 20 }).start();
  };
  const pan = useRef(
    PanResponder.create({
      // Solo trascinamenti orizzontali: quelli verticali restano allo scorrimento della pagina.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => x.setValue(Math.max(-SWIPE_W - 24, Math.min(0, (open.current ? -SWIPE_W : 0) + g.dx))),
      onPanResponderRelease: (_, g) => {
        swipedAt.current = Date.now();
        const end = (open.current ? -SWIPE_W : 0) + g.dx;
        settle(end < -SWIPE_W / 2 || g.vx < -0.5 ? -SWIPE_W : 0);
      },
      onPanResponderTerminate: () => settle(open.current ? -SWIPE_W : 0),
    }),
  ).current;

  const press = () => {
    // Un tocco subito dopo lo scorrimento, o con le azioni aperte, chiude soltanto.
    if (Date.now() - swipedAt.current < 250) return;
    if (open.current) return settle(0);
    if (managing) return onPick();
    router.push(`/lavagna/${note.id}`);
  };

  return (
    <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
      {!managing && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: SWIPE_W, flexDirection: 'row' }}>
          <SwipeAction icon="copy-outline" label={t.manage.duplicate} color={colors.accent} onPress={() => (settle(0), onDuplicate())} />
          <SwipeAction icon="trash-outline" label={t.manage.delete} color={colors.danger} onPress={() => (settle(0), onDelete())} />
        </View>
      )}
      <Animated.View style={{ transform: [{ translateX: x }] }} {...(managing ? {} : pan.panHandlers)}>
        {/* Il tocco sulla scheda sta sotto il contenuto: stella e stato sono pulsanti a parte, non annidati. */}
        <View
          style={{
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: managing && picked ? colors.accent : 'transparent',
            boxShadow: colors.shadowRaised,
            opacity: pressing ? 0.85 : 1,
          }}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel={note.title}
            accessibilityHint={managing ? undefined : t.activitiesHub.cardHint}
            accessibilityState={managing ? { selected: picked } : undefined}
            onPress={press}
            onPressIn={() => setPressing(true)}
            onPressOut={() => setPressing(false)}
            onLongPress={
              managing
                ? undefined
                : () => {
                    tap();
                    onMenu();
                  }
            }
            delayLongPress={400}
          />
          <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm }}>
            <View pointerEvents="none">
              <Thumb note={note} items={items} width={THUMB.w} height={THUMB.h} />
            </View>
            <View pointerEvents="box-none" style={{ flex: 1, gap: 2 }}>
              <View pointerEvents="none" style={{ gap: 2 }}>
                <Text style={[typography.headline, { color: colors.text }]} numberOfLines={2}>
                  {note.title}
                </Text>
                {!!note.subject && <Text style={[typography.caption, { color: tint.fg }]}>{note.subject}</Text>}
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{note.edited}</Text>
              </View>
              {!managing && <StatusChip id={note.id} status={status} />}
            </View>
            {managing ? (
              <View pointerEvents="none">
                <Ionicons name={picked ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={picked ? colors.accent : colors.textTertiary} />
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  tap();
                  toggleFavorite(note.id);
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={favorite ? t.activitiesHub.unfavorite : t.activitiesHub.favorite}
                accessibilityState={{ selected: favorite }}
                style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.6 : 1 })}
              >
                <Ionicons name={favorite ? 'star' : 'star-outline'} size={22} color={favorite ? colors.warningIcon : colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function SwipeAction({ icon, label, color, onPress }: { icon: IconName; label: string; color: string; onPress: () => void }) {
  const { typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: color, opacity: pressed ? 0.8 : 1 })}
    >
      <Ionicons name={icon} size={22} color="#FFFFFF" />
      <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

type MenuItem = { icon: IconName; label: string; onPress: () => void; danger?: boolean };

/** Menu rapido della nota, aperto tenendo premuta la scheda (dec. 119). */
function NoteMenu({ title, items, onClose }: { title: string; items: MenuItem[]; onClose: () => void }) {
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

/** "Oggi, 09:12" per le pagine create in questa sessione. */
function editedLabel(at: number) {
  return `${t.home.today}, ${new Date(at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}
