import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { COVER_RATIO } from '../../components/coverArt';
import { NativeMoreMenu } from '../../components/NativeMoreMenu';
import { AddCard, CoverCard, downloadNotebook, ItemMenu, NotebookCover, NotebookEditor } from '../../components/notebooks';
import { SortableGrid } from '../../components/SortableGrid';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';
import { showUndo } from '../../components/UndoToast';
import { Glass } from '../../components/Glass';
import { tap } from '../../components/haptics';
import { Chip, IconButton, Screen, type IconName } from '../../components/ui';
import { updateSettings, useSettings } from '../../state/settings';
import { t } from '../../i18n';
import { NO_SUBJECT, renameNotebook, restoreNotebook, setBookSort, type SortMode, sheetsOf, sortBooks, trashNotebook, useOrder, useSheets } from '../../state/notebooks';
import { addSubject, reorderSubjects, setSubjectLook, subjectLook, useSubjectLooks, useSubjects, type NotebookLook } from '../../state/subjects';
import { useTheme } from '../../theme';
import { Icon } from '../../components/icons';

const IOS = Platform.OS === 'ios';

/** Azioni sotto il titolo (dec. 175). Da definire: per ora non fanno nulla. */
const ACTIONS: { key: keyof typeof t.activitiesHub.actions; icon: IconName; onPress?: () => void }[] = [
  { key: 'import', icon: 'import', onPress: () => router.push('/importa') },
  { key: 'studyAi', icon: 'ai-sparkles' },
];

/** Quaderno: una materia con i suoi fogli (dec. 143). `lastEdit`: ultima modifica tra i suoi fogli. */
type Notebook = { subject: string; label: string; look: NotebookLook; count: number; lastEdit: number };

/** Appunti: i quaderni, uno per materia, due per riga (dec. 141-146; prima Attività, dec. 109 e 135). */
function AttivitaScreen() {
  const { colors, spacing, typography, layout } = useTheme();
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const order = useOrder();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const { plainCovers } = useSettings();
  const [editing, setEditing] = useState<Notebook | 'new' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [listW, setListW] = useState(0);

  const bookOf = (subject: string, label: string, look: NotebookLook): Notebook => {
    const list = sheetsOf(sheets, subject);
    return { subject, label, look, count: list.length, lastEdit: Math.max(0, ...list.map((s) => s.at)) };
  };
  const books = sortBooks(
    subjects.map((s, i) => bookOf(s, s, subjectLook(looks, s, i))),
    order.books,
  );
  // I fogli senza materia restano raggiungibili in un quaderno a parte, sempre in fondo (non si sposta).
  const others = sheetsOf(sheets, NO_SUBJECT).length ? bookOf(NO_SUBJECT, t.activitiesHub.otherSheets, { theme: 'polka', color: 'lilac' }) : null;

  // Due quaderni per riga (dec. 143); su iPad e in orizzontale quattro.
  const gap = spacing.md;
  const cols = listW >= 700 ? 4 : 2;
  const bookW = listW > 0 ? (listW - gap * (cols - 1)) / cols : 0;
  const bookH = Math.round(bookW / COVER_RATIO);

  const open = (b: Notebook) => router.push({ pathname: '/quaderno/[name]', params: { name: b.subject } });
  // Niente conferma: il quaderno va nel cestino e l'avviso permette di annullare subito (dec. 145).
  const remove = (b: Notebook) => {
    const ids = trashNotebook(b.subject, sheets);
    showUndo(t.trash.bookTrashed(b.label), () => restoreNotebook(b.subject, ids));
  };
  const download = (b: Notebook) => downloadNotebook(b.label, sheetsOf(sheets, b.subject));
  const card = (b: Notebook, drag?: Parameters<typeof CoverCard>[0]['drag']) => {
    const cover = (
    <CoverCard
      width={bookW}
      height={bookH}
      label={b.label}
      caption={b.count ? t.activitiesHub.sheetCount(b.count) : t.activitiesHub.emptyBook}
      onOpen={() => open(b)}
      onMenu={() => setMenuFor(b.subject)}
      drag={IOS ? undefined : drag}
      systemMenu={IOS}
    >
      <NotebookCover look={b.look} name={b.label} width={bookW} height={bookH} />
    </CoverCard>
    );
    if (!IOS) return cover;
    // Tenendo premuto: menu contestuale di sistema di iOS (dec. 172); un tocco apre il quaderno.
    return (
      <Link key={b.subject} href={{ pathname: '/quaderno/[name]', params: { name: b.subject } }} asChild>
        <Link.Trigger>{cover}</Link.Trigger>
        <Link.Menu>
          {b.subject !== NO_SUBJECT ? (
            <Link.MenuAction icon="paintpalette" onPress={() => setEditing(b)}>
              {t.activitiesHub.editBook}
            </Link.MenuAction>
          ) : null}
          <Link.MenuAction icon="arrow.down.doc" onPress={() => download(b)}>
            {t.activitiesHub.downloadBook}
          </Link.MenuAction>
          <Link.Menu inline>
            <Link.MenuAction icon="trash" destructive onPress={() => remove(b)}>
              {t.trash.moveToTrash}
            </Link.MenuAction>
          </Link.Menu>
        </Link.Menu>
      </Link>
    );
  };
  const menuBook = others?.subject === menuFor ? others : books.find((b) => b.subject === menuFor);

  return (
    <View style={{ flex: 1 }}>
      <Screen
        scrollEnabled={!dragging}
        header={
          // Barra alta come quella di Home e Agenda: Nuovo a sinistra, il menu ⋮ a destra (dec. 174-175).
          <View style={{ height: layout.iconButton, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <NewButton onPress={() => setEditing('new')} />
            <MoreMenu
              sort={order.books}
              plainCovers={plainCovers}
              onSort={setBookSort}
              onPlainCovers={(v) => updateSettings({ plainCovers: v })}
              onTrash={() => router.push('/cestino')}
              onOpenFallback={() => setMoreOpen(true)}
            />
          </View>
        }
      >
        {/* Titolo grande e centrato, identico ad Agenda (dec. 174). */}
        <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <Text style={[typography.hero, { lineHeight: 60, color: colors.text }]} accessibilityRole="header">
            {t.tabs.activities}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {ACTIONS.map((a) => (
            <ActionButton key={a.key} icon={a.icon} label={t.activitiesHub.actions[a.key]} onPress={a.onPress} />
          ))}
        </View>

        {/* Tenendo premuto un quaderno lo si trascina in un altro posto (dec. 146). */}
        <View onLayout={(e) => setListW(e.nativeEvent.layout.width)}>
          {bookW > 0 && (
            <SortableGrid
              items={books}
              keyOf={(b) => b.subject}
              cols={cols}
              cellW={bookW}
              cellH={bookH + 52}
              colGap={gap}
              rowGap={spacing.lg}
              trailing={[...(others ? [card(others)] : []), <AddCard key="add" width={bookW} height={bookH} label={t.activitiesHub.newBook} onPress={() => setEditing('new')} />]}
              renderItem={(b, drag) => card(b, drag)}
              onReorder={(keys) => {
                // Spostare a mano rende l'ordine visto quello scelto a mano.
                reorderSubjects(keys);
                setBookSort('custom');
              }}
              onLongPressRelease={(b) => !IOS && setMenuFor(b.subject)}
              onDragging={setDragging}
            />
          )}
        </View>
        <View style={{ alignItems: 'flex-start' }}>
          <Chip label={t.demo} variant="muted" />
        </View>
      </Screen>

      {menuBook && (
        <ItemMenu
          title={menuBook.label}
          onClose={() => setMenuFor(null)}
          items={[
            { icon: 'open-outline', label: t.activitiesHub.open, onPress: () => open(menuBook) },
            ...(menuBook.subject !== NO_SUBJECT ? [{ icon: 'color-palette-outline' as const, label: t.activitiesHub.editBook, onPress: () => setEditing(menuBook) }] : []),
            { icon: 'document-outline', label: t.activitiesHub.downloadBook, onPress: () => download(menuBook) },
            { icon: 'trash-outline', label: t.trash.moveToTrash, onPress: () => remove(menuBook), danger: true },
          ]}
        />
      )}
      {moreOpen && (
        <ItemMenu
          title={t.activitiesHub.more}
          onClose={() => setMoreOpen(false)}
          items={[
            ...SORTS.map((m) => ({
              icon: 'sort' as const,
              label: order.books === m ? `${t.activitiesHub.sortLabel}: ${t.activitiesHub.sort[m]} ✓` : `${t.activitiesHub.sortLabel}: ${t.activitiesHub.sort[m]}`,
              onPress: () => setBookSort(m),
            })),
            { icon: 'color-palette-outline', label: plainCovers ? `${t.settings.plainCovers} ✓` : t.settings.plainCovers, onPress: () => updateSettings({ plainCovers: !plainCovers }) },
            { icon: 'trash-outline', label: t.trash.title, onPress: () => router.push('/cestino') },
          ]}
        />
      )}
      {editing && (
        <NotebookEditor
          initial={editing === 'new' ? undefined : { name: editing.subject, look: editing.look }}
          onClose={() => setEditing(null)}
          onSave={(name, look) => {
            const ok = editing === 'new' ? addSubject(name) : renameNotebook(editing.subject, name, sheets);
            if (!ok) return t.activitiesHub.subjectDup;
            setSubjectLook(name, look);
            setEditing(null);
            return undefined;
          }}
        />
      )}
    </View>
  );
}

const SORTS: SortMode[] = ['custom', 'alpha', 'recent'];

/** Pulsante Nuovo azzurro in Liquid Glass (dec. 174), come i pulsanti principali nelle barre di iOS. */
function NewButton({ onPress }: { onPress: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={t.activitiesHub.newBook}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <Glass interactive tint={colors.glassBlue} style={{ height: 40, borderRadius: radius.pill, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.glassBlue }}>
        <Icon name="book-add" size={20} color="#FFFFFF" />
        <Text style={[typography.callout, { color: '#FFFFFF', fontWeight: '600' }]}>{t.activitiesHub.newShort}</Text>
      </Glass>
    </Pressable>
  );
}

/**
 * Menu ⋮ di Appunti (dec. 174): ordine dei quaderni, copertine semplici e cestino.
 * Su iOS è il menu nativo di SwiftUI (si apre con un tocco); altrove il menu dell'app.
 */
function MoreMenu({
  sort,
  plainCovers,
  onSort,
  onPlainCovers,
  onTrash,
  onOpenFallback,
}: {
  sort: SortMode;
  plainCovers: boolean;
  onSort: (m: SortMode) => void;
  onPlainCovers: (v: boolean) => void;
  onTrash: () => void;
  onOpenFallback: () => void;
}) {
  const { colors, layout } = useTheme();
  const icon = (
    <View style={{ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="more-square" size={26} color={colors.text} />
    </View>
  );
  if (!IOS) {
    return (
      <Pressable onPress={onOpenFallback} accessibilityRole="button" accessibilityLabel={t.activitiesHub.more} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        {icon}
      </Pressable>
    );
  }
  return <NativeMoreMenu icon={icon} sorts={SORTS} sort={sort} plainCovers={plainCovers} onSort={onSort} onPlainCovers={onPlainCovers} onTrash={onTrash} />;
}

function ActionButton({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  // Pillola piena senza bordo, come i pulsanti secondari di iOS (dec. 175).
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
        borderRadius: radius.xl,
        backgroundColor: colors.surfaceMuted,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon name={icon} size={18} color={colors.text} />
      <Text style={[typography.callout, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

// Scorrendo a destra/sinistra si cambia scheda (dec. 140).
registerTabScreen('attivita', AttivitaScreen);
export default function Attivita() {
  return (
    <TabSwipe name="attivita">
      <AttivitaScreen />
    </TabSwipe>
  );
}
