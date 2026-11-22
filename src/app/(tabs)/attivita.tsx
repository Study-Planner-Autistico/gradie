import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Chip, IconButton, Screen, ScreenHeader, SectionHeader, type IconName } from '../../components/ui';
import { Glass } from '../../components/Glass';
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
  useBoards,
  useHidden,
  useNotes,
  usePages,
  type BoardItem,
  type NoteMeta,
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

  const duplicate = () => {
    chosen.forEach((n) => {
      const m = metaOf(n);
      duplicateNote(n.id, { ...m, title: `${m.title} ${t.manage.copySuffix}` });
    });
    setPicked([]);
  };

  const download = async () => {
    try {
      await downloadNotes(chosen.map((n) => ({ title: n.title, items: getBoardItems(n.id), meta: getNoteMeta(n.id) })));
    } catch {
      notify(t.manage.downloadFailed);
    }
  };

  const remove = () =>
    confirm(t.manage.confirmDelete(chosen.length), t.manage.delete, () => {
      chosen.forEach((n) => deleteNote(n.id));
      setPicked([]);
    });

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

      <View style={{ marginTop: spacing.md }}>
        <SectionHeader title={t.activitiesHub.notes} />
      </View>
      <View style={{ gap: spacing.md, flexDirection: 'row', flexWrap: 'wrap' }} onLayout={(e) => setListW(e.nativeEvent.layout.width)}>
        {notes.map((n) => (
          <View key={n.id} style={{ width: cardW ?? '100%' }}>
            <NoteCard note={n} items={itemsOf(n.id)} managing={managing} picked={picked.includes(n.id)} onPick={() => toggle(n.id)} />
          </View>
        ))}
      </View>
      <View style={{ alignItems: 'flex-start' }}>
        <Chip label={t.demo} variant="muted" />
      </View>
      {managing && <View style={{ height: 72 }} />}
    </Screen>
    {managing && (
      <View pointerEvents="box-none" style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: layout.tabBarClearance - 18 }}>
        <Glass style={{ borderRadius: 22, flexDirection: 'row', padding: spacing.xs }}>
          <BarButton icon="copy-outline" label={t.manage.duplicate} disabled={!chosen.length} onPress={duplicate} />
          <BarButton icon="download-outline" label={t.manage.download} disabled={!chosen.length} onPress={download} />
          <BarButton
            icon="create-outline"
            label={t.manage.modify}
            disabled={chosen.length !== 1}
            onPress={() => router.push({ pathname: '/nuova-nota', params: { id: chosen[0].id } })}
          />
          <BarButton icon="trash-outline" label={t.manage.delete} disabled={!chosen.length} danger onPress={remove} />
        </Glass>
      </View>
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

/** Riga nota: a sinistra la visuale dell'ultima volta (o un'anteprima decorativa), a destra titolo e data. */
function NoteCard({
  note,
  items,
  managing,
  picked,
  onPick,
}: {
  note: CardNote;
  items: BoardItem[];
  managing: boolean;
  picked: boolean;
  onPick: () => void;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const tint = colors.tints[note.tint];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={note.title}
      accessibilityState={managing ? { selected: picked } : undefined}
      onPress={managing ? onPick : () => router.push(`/lavagna/${note.id}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: managing && picked ? colors.accent : 'transparent',
        boxShadow: colors.shadowRaised,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ width: THUMB.w, height: THUMB.h, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        {note.cover ? (
          <CoverThumb color={note.cover} title={note.title} width={THUMB.w} height={THUMB.h} />
        ) : items.length > 0 ? (
          <BoardPreview items={items} height={THUMB.h} viewport={getViewport(note.id)} />
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
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.headline, { color: colors.text }]} numberOfLines={2}>
          {note.title}
        </Text>
        {!!note.subject && <Text style={[typography.caption, { color: tint.fg }]}>{note.subject}</Text>}
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{note.edited}</Text>
      </View>
      {managing ? (
        <Ionicons name={picked ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={picked ? colors.accent : colors.textTertiary} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

/** "Oggi, 09:12" per le pagine create in questa sessione. */
function editedLabel(at: number) {
  return `${t.home.today}, ${new Date(at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}
