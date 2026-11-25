import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactElement } from 'react';
import * as Sharing from 'expo-sharing';
import { Linking, Platform, View } from 'react-native';
import { notify } from '../../components/dialogs';
import { AddCard, CoverCard, downloadNotebook, ItemMenu, NotebookEditor, SortBar, STATUS_ICON } from '../../components/notebooks';
import { SortableGrid } from '../../components/SortableGrid';
import { showUndo } from '../../components/UndoToast';
import { IconButton, Screen, ScreenHeader } from '../../components/ui';
import { SheetThumb } from '../../components/SheetThumb';
import { downloadNotes } from '../../components/whiteboard/exportPdf';
import { t } from '../../i18n';
import { metaOf, NO_SUBJECT, renameNotebook, restoreSheet, setSheetOrder, setSheetSort, sheetsOf, sortSheets, useOrder, useSheets, type Sheet } from '../../state/notebooks';
import { setSubjectLook, subjectLook, useSubjectLooks, useSubjects } from '../../state/subjects';
import {
  clearStudyStatus,
  duplicateNote,
  getBoardItems,
  getNoteMeta,
  setStudyStatus,
  toggleFavorite,
  trashNote,
  useNoteExtras,
  type ImportSource,
  type StudyStatus,
} from '../../state/whiteboard';
import { useTheme } from '../../theme';

/** YouTube nel browser o nell'app; i file nel foglio di condivisione di sistema, che li mostra e li apre con Pagine, Word… */
async function openSource(src: ImportSource) {
  try {
    if (src.kind === 'youtube') await Linking.openURL(src.uri);
    else await Sharing.shareAsync(src.uri, { dialogTitle: src.name });
  } catch {
    notify(t.importer.openFailed);
  }
}

const STATUSES: StudyStatus[] = ['todo', 'doing', 'done'];
const IOS = Platform.OS === 'ios';
const STATUS_SF = { todo: 'circle', doing: 'clock', done: 'checkmark.circle' } as const;

/** Quaderno di una materia: i fogli salvati e Nuovo foglio (dec. 143, 145-146). */
export default function Quaderno() {
  const { spacing } = useTheme();
  const { name = '' } = useLocalSearchParams<{ name: string }>();
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const order = useOrder();
  const { favorites: pinned, statuses } = useNoteExtras();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [statusFor, setStatusFor] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [listW, setListW] = useState(0);

  const others = name === NO_SUBJECT;
  const label = others ? t.activitiesHub.otherSheets : name;
  // Fissati in cima per primi, poi l'ordine scelto (dec. 145).
  const list = sortSheets(sheetsOf(sheets, name), name, pinned, order);
  const look = subjectLook(looks, name, subjects.findIndex((s) => s.toLocaleLowerCase() === name.toLocaleLowerCase()));

  // Due fogli per riga, come i quaderni; su iPad e in orizzontale quattro.
  const gap = spacing.md;
  const cols = listW >= 700 ? 4 : 2;
  const w = listW > 0 ? (listW - gap * (cols - 1)) / cols : 0;
  const h = Math.round(w * 1.32);

  const newSheet = () => router.push(others ? '/nuova-nota' : { pathname: '/nuova-nota', params: { subject: name } });
  // Un file o un video importato si apre da sé, non sulla lavagna (dec. 176).
  const open = (s: Sheet) => (s.source ? openSource(s.source) : router.push(`/lavagna/${s.id}`));
  const duplicate = (s: Sheet) => {
    const m = metaOf(s);
    duplicateNote(s.id, { ...m, title: `${m.title} ${t.manage.copySuffix}` });
  };
  const download = async (s: Sheet) => {
    try {
      await downloadNotes([{ title: s.title, items: getBoardItems(s.id), meta: getNoteMeta(s.id) }]);
    } catch {
      notify(t.manage.downloadFailed);
    }
  };
  // Nel cestino, con l'avviso per annullare (dec. 145).
  const remove = (s: Sheet) => {
    trashNote(s.id);
    showUndo(t.trash.sheetTrashed(s.title), () => restoreSheet(s));
  };
  const edit = (s: Sheet) => router.push({ pathname: '/nuova-nota', params: { id: s.id } });
  const actions = { pinned, statuses, edit, duplicate, download, remove };
  const menuSheet = list.find((s) => s.id === menuFor);
  const statusSheet = list.find((s) => s.id === statusFor);

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar={false} scrollEnabled={!dragging}>
        <ScreenHeader
          title={label}
          subtitle={list.length ? t.activitiesHub.sheetCount(list.length) : t.activitiesHub.emptyBook}
          left={<IconButton icon="chevron-back" label={t.whiteboard.back} onPress={() => router.back()} appearance="plain" />}
          right={
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <IconButton icon="document-outline" label={t.activitiesHub.downloadBook} onPress={() => downloadNotebook(label, list)} />
              {!others && <IconButton icon="color-palette-outline" label={t.activitiesHub.editBook} onPress={() => setEditing(true)} />}
            </View>
          }
        />

        {list.length > 1 && (
          <SortBar value={order.sheets} onChange={setSheetSort} />
        )}

        {/* Tenendo premuto un foglio lo si trascina in un altro posto; i fissati restano tra loro, in cima (dec. 146). */}
        <View onLayout={(e) => setListW(e.nativeEvent.layout.width)}>
          {w > 0 && (
            <SortableGrid
              items={list}
              keyOf={(s) => s.id}
              groupOf={(s) => (pinned.includes(s.id) ? 0 : 1)}
              cols={cols}
              cellW={w}
              cellH={h + 52}
              colGap={gap}
              rowGap={spacing.lg}
              leading={[<AddCard key="add" width={w} height={h} label={t.activitiesHub.newSheet} onPress={newSheet} />]}
              renderItem={(s, drag) => {
                const card = (
                  <CoverCard
                    width={w}
                    height={h}
                    label={s.title}
                    caption={statuses[s.id] ? `${t.activitiesHub.status[statuses[s.id]]} · ${s.edited}` : s.edited}
                    onOpen={() => open(s)}
                    onMenu={() => setMenuFor(s.id)}
                    pinned={pinned.includes(s.id)}
                    status={statuses[s.id]}
                    drag={IOS ? undefined : drag}
                    systemMenu={IOS}
                  >
                    <SheetThumb sheet={s} width={w} height={h} />
                  </CoverCard>
                );
                return IOS ? <SheetMenu sheet={s} {...actions}>{card}</SheetMenu> : card;
              }}
              onReorder={(ids) => setSheetOrder(name, ids)}
              // Su iOS tenendo premuto fermo si apre il menu di sistema (dec. 172); altrove il menu si apre al rilascio.
              onLongPressRelease={(s) => !IOS && setMenuFor(s.id)}
              onDragging={setDragging}
            />
          )}
        </View>
      </Screen>

      {menuSheet && (
        <ItemMenu
          title={menuSheet.title}
          onClose={() => setMenuFor(null)}
          items={[
            { icon: 'open-outline', label: t.activitiesHub.open, onPress: () => open(menuSheet) },
            { icon: 'color-palette-outline', label: t.activitiesHub.editSheet, onPress: () => edit(menuSheet) },
            { icon: 'copy-outline', label: t.manage.duplicate, onPress: () => duplicate(menuSheet) },
            {
              icon: pinned.includes(menuSheet.id) ? 'pin' : 'pin-outline',
              label: pinned.includes(menuSheet.id) ? t.activitiesHub.unpin : t.activitiesHub.pin,
              onPress: () => toggleFavorite(menuSheet.id),
            },
            {
              icon: statuses[menuSheet.id] ? STATUS_ICON[statuses[menuSheet.id]] : 'ellipse-outline',
              label: statuses[menuSheet.id] ? `${t.activitiesHub.statusLabel}: ${t.activitiesHub.status[statuses[menuSheet.id]]}` : t.activitiesHub.setStatus,
              onPress: () => setStatusFor(menuSheet.id),
            },
            { icon: 'download-outline', label: t.manage.download, onPress: () => download(menuSheet) },
            { icon: 'trash-outline', label: t.trash.moveToTrash, danger: true, onPress: () => remove(menuSheet) },
          ]}
        />
      )}
      {statusSheet && (
        <ItemMenu
          title={`${t.activitiesHub.statusLabel}: ${statusSheet.title}`}
          onClose={() => setStatusFor(null)}
          items={[
            ...STATUSES.map((st) => ({
              icon: STATUS_ICON[st],
              label: statuses[statusSheet.id] === st ? `${t.activitiesHub.status[st]} ✓` : t.activitiesHub.status[st],
              onPress: () => setStudyStatus(statusSheet.id, st),
            })),
            { icon: 'close-circle-outline', label: t.activitiesHub.noStatus, onPress: () => clearStudyStatus(statusSheet.id) },
          ]}
        />
      )}
      {editing && (
        <NotebookEditor
          initial={{ name, look }}
          onClose={() => setEditing(false)}
          onSave={(next, l) => {
            if (!renameNotebook(name, next, sheets)) return t.activitiesHub.subjectDup;
            setSubjectLook(next, l);
            setEditing(false);
            router.setParams({ name: next });
            return undefined;
          }}
        />
      )}
    </View>
  );
}

/**
 * Menu contestuale di sistema di iOS (dec. 172): tenendo premuto fermo il foglio si solleva con lo sfondo sfocato
 * e compaiono le voci; un tocco lo apre. Se il dito si muove prima, resta il trascinamento per riordinare (dec. 146).
 */
function SheetMenu({
  sheet,
  children,
  pinned,
  statuses,
  edit,
  duplicate,
  download,
  remove,
}: {
  sheet: Sheet;
  children: ReactElement;
  pinned: string[];
  statuses: Partial<Record<string, StudyStatus>>;
  edit: (s: Sheet) => void;
  duplicate: (s: Sheet) => void;
  download: (s: Sheet) => void;
  remove: (s: Sheet) => void;
}) {
  const isPinned = pinned.includes(sheet.id);
  const status = statuses[sheet.id];
  return (
    <Link href={`/lavagna/${sheet.id}`} asChild>
      <Link.Trigger>{children}</Link.Trigger>
      <Link.Menu>
        <Link.MenuAction icon="square.and.pencil" onPress={() => edit(sheet)}>
          {t.activitiesHub.editSheet}
        </Link.MenuAction>
        <Link.MenuAction icon="plus.square.on.square" onPress={() => duplicate(sheet)}>
          {t.manage.duplicate}
        </Link.MenuAction>
        <Link.MenuAction icon={isPinned ? 'pin.slash' : 'pin'} onPress={() => toggleFavorite(sheet.id)}>
          {isPinned ? t.activitiesHub.unpin : t.activitiesHub.pin}
        </Link.MenuAction>
        <Link.Menu inline>
          <Link.Menu title={t.activitiesHub.statusLabel} subtitle={status ? t.activitiesHub.status[status] : undefined} icon="checklist">
            {STATUSES.map((st) => (
              <Link.MenuAction key={st} icon={STATUS_SF[st]} isOn={status === st} onPress={() => setStudyStatus(sheet.id, st)}>
                {t.activitiesHub.status[st]}
              </Link.MenuAction>
            ))}
            <Link.MenuAction icon="xmark.circle" onPress={() => clearStudyStatus(sheet.id)}>
              {t.activitiesHub.noStatus}
            </Link.MenuAction>
          </Link.Menu>
          <Link.MenuAction icon="arrow.down.doc" onPress={() => download(sheet)}>
            {t.manage.download}
          </Link.MenuAction>
        </Link.Menu>
        <Link.Menu inline>
          <Link.MenuAction icon="trash" destructive onPress={() => remove(sheet)}>
            {t.trash.moveToTrash}
          </Link.MenuAction>
        </Link.Menu>
      </Link.Menu>
    </Link>
  );
}
