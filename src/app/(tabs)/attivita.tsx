import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COVER_RATIO } from '../../components/coverArt';
import { AddCard, CoverCard, downloadNotebook, ItemMenu, NotebookCover, NotebookEditor, SortBar } from '../../components/notebooks';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';
import { showUndo } from '../../components/UndoToast';
import { Chip, IconButton, Screen, ScreenHeader, type IconName } from '../../components/ui';
import { t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { NO_SUBJECT, renameNotebook, restoreNotebook, setBookSort, sheetsOf, sortBooks, trashNotebook, useOrder, useSheets } from '../../state/notebooks';
import { addSubject, moveSubject, setSubjectLook, subjectLook, useSubjectLooks, useSubjects, type NotebookLook } from '../../state/subjects';
import { useTheme } from '../../theme';

type QuickAction = { key: keyof typeof t.activitiesHub.actions; icon: IconName; brand?: boolean };

/** Azioni rapide (dec. 109; senza Prendi appunti e Crea lavagna, dec. 118). Da definire. */
const ACTIONS: QuickAction[] = [
  { key: 'importFile', icon: 'download-outline' },
  { key: 'youtube', icon: 'logo-youtube', brand: true },
];

/** Quaderno: una materia con i suoi fogli (dec. 143). `lastEdit`: ultima modifica tra i suoi fogli. */
type Notebook = { subject: string; label: string; look: NotebookLook; count: number; lastEdit: number };

/** Appunti: i quaderni, uno per materia, due per riga (dec. 141-145; prima Attività, dec. 109 e 135). */
function AttivitaScreen() {
  const { colors, spacing } = useTheme();
  const { active } = useEnvironment();
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const order = useOrder();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<Notebook | 'new' | null>(null);
  const [reordering, setReordering] = useState(false);
  const [listW, setListW] = useState(0);

  const bookOf = (subject: string, label: string, look: NotebookLook): Notebook => {
    const list = sheetsOf(sheets, subject);
    return { subject, label, look, count: list.length, lastEdit: Math.max(0, ...list.map((s) => s.at)) };
  };
  const books = sortBooks(
    subjects.map((s, i) => bookOf(s, s, subjectLook(looks, s, i))),
    order.books,
  );
  // I fogli senza materia restano raggiungibili in un quaderno a parte, sempre in fondo.
  if (sheetsOf(sheets, NO_SUBJECT).length) books.push(bookOf(NO_SUBJECT, t.activitiesHub.otherSheets, { theme: 'polka', color: 'lilac' }));

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
  const toggleReorder = () => {
    if (!reordering) setBookSort('custom');
    setReordering(!reordering);
  };
  const menuBook = books.find((b) => b.subject === menuFor);

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <ScreenHeader
          title={t.tabs.activities}
          subtitle={active.name}
          right={
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <IconButton icon="trash-outline" label={t.trash.title} onPress={() => router.push('/cestino')} />
              <IconButton icon="add" label={t.activitiesHub.newBook} onPress={() => setEditing('new')} />
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
            <ActionButton key={a.key} icon={a.icon} label={t.activitiesHub.actions[a.key]} iconColor={a.brand ? colors.danger : colors.textSecondary} />
          ))}
        </ScrollView>

        <SortBar
          value={order.books}
          onChange={(m) => {
            setBookSort(m);
            if (m !== 'custom') setReordering(false);
          }}
          reordering={reordering}
          onReorder={toggleReorder}
        />

        <View onLayout={(e) => setListW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: gap, rowGap: spacing.lg }}>
          {bookW > 0 && (
            <>
              {books.map((b) => {
                const i = subjects.indexOf(b.subject);
                const movable = reordering && b.subject !== NO_SUBJECT;
                return (
                  <CoverCard
                    key={b.subject}
                    width={bookW}
                    height={bookH}
                    label={b.label}
                    caption={b.count ? t.activitiesHub.sheetCount(b.count) : t.activitiesHub.emptyBook}
                    onOpen={() => open(b)}
                    onMenu={() => setMenuFor(b.subject)}
                    move={
                      movable
                        ? { prev: i > 0 ? () => moveSubject(b.subject, -1) : undefined, next: i < subjects.length - 1 ? () => moveSubject(b.subject, 1) : undefined }
                        : undefined
                    }
                  >
                    <NotebookCover look={b.look} name={b.label} width={bookW} height={bookH} />
                  </CoverCard>
                );
              })}
              {!reordering && <AddCard width={bookW} height={bookH} label={t.activitiesHub.newBook} onPress={() => setEditing('new')} />}
            </>
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
            { icon: 'document-outline', label: t.activitiesHub.downloadBook, onPress: () => downloadNotebook(menuBook.label, sheetsOf(sheets, menuBook.subject)) },
            { icon: 'trash-outline', label: t.trash.moveToTrash, onPress: () => remove(menuBook), danger: true },
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

// Scorrendo a destra/sinistra si cambia scheda (dec. 140).
registerTabScreen('attivita', AttivitaScreen);
export default function Attivita() {
  return (
    <TabSwipe name="attivita">
      <AttivitaScreen />
    </TabSwipe>
  );
}
