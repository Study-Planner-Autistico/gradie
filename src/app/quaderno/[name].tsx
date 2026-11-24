import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { notify } from '../../components/dialogs';
import { AddCard, CoverCard, downloadNotebook, ItemMenu, NotebookEditor, SortBar, STATUS_ICON } from '../../components/notebooks';
import { SortableGrid } from '../../components/SortableGrid';
import { showUndo } from '../../components/UndoToast';
import { IconButton, Screen, ScreenHeader } from '../../components/ui';
import { BoardPreview } from '../../components/whiteboard/BoardPreview';
import { downloadNotes } from '../../components/whiteboard/exportPdf';
import { CoverThumb, PaperThumb } from '../../components/whiteboard/Paper';
import { t } from '../../i18n';
import { metaOf, NO_SUBJECT, renameNotebook, restoreSheet, setSheetOrder, setSheetSort, sheetsOf, sortSheets, useOrder, useSheets, type Sheet } from '../../state/notebooks';
import { setSubjectLook, subjectLook, useSubjectLooks, useSubjects } from '../../state/subjects';
import {
  clearStudyStatus,
  duplicateNote,
  getBoardItems,
  getNoteMeta,
  getViewport,
  setStudyStatus,
  toggleFavorite,
  trashNote,
  useBoards,
  useNoteExtras,
  type StudyStatus,
} from '../../state/whiteboard';
import { useTheme } from '../../theme';

const STATUSES: StudyStatus[] = ['todo', 'doing', 'done'];

/** Quaderno di una materia: i fogli salvati e Nuovo foglio (dec. 143, 145-146). */
export default function Quaderno() {
  const { spacing } = useTheme();
  const { name = '' } = useLocalSearchParams<{ name: string }>();
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const itemsOf = useBoards();
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
  const open = (s: Sheet) => router.push(`/lavagna/${s.id}`);
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
  const menuSheet = list.find((s) => s.id === menuFor);
  const statusSheet = list.find((s) => s.id === statusFor);

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar={false} scrollEnabled={!dragging}>
        <ScreenHeader
          title={label}
          subtitle={list.length ? t.activitiesHub.sheetCount(list.length) : t.activitiesHub.emptyBook}
          left={<IconButton icon="chevron-back" label={t.whiteboard.back} onPress={() => router.back()} />}
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
              renderItem={(s, drag) => (
                <CoverCard
                  width={w}
                  height={h}
                  label={s.title}
                  caption={statuses[s.id] ? `${t.activitiesHub.status[statuses[s.id]]} · ${s.edited}` : s.edited}
                  onOpen={() => open(s)}
                  onMenu={() => setMenuFor(s.id)}
                  pinned={pinned.includes(s.id)}
                  status={statuses[s.id]}
                  drag={drag}
                >
                  <SheetThumb sheet={s} items={itemsOf(s.id)} width={w} height={h} />
                </CoverCard>
              )}
              onReorder={(ids) => setSheetOrder(name, ids)}
              onLongPressRelease={(s) => setMenuFor(s.id)}
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
            { icon: 'color-palette-outline', label: t.activitiesHub.editSheet, onPress: () => router.push({ pathname: '/nuova-nota', params: { id: menuSheet.id } }) },
            { icon: 'copy-outline', label: t.manage.duplicate, onPress: () => duplicate(menuSheet) },
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

/** Anteprima del foglio: copertina, visuale dell'ultima volta o la carta scelta. */
function SheetThumb({ sheet, items, width, height }: { sheet: Sheet; items: Parameters<typeof BoardPreview>[0]['items']; width: number; height: number }) {
  const paper = getNoteMeta(sheet.id)?.paper ?? { template: 'blank' as const, color: '#FFFFFF', dark: false };
  if (sheet.cover) return <CoverThumb color={sheet.cover} title={sheet.title} width={width} height={height} />;
  if (items.length > 0) return <BoardPreview items={items} height={height} viewport={getViewport(sheet.id)} />;
  return <PaperThumb template={paper.template} color={paper.color} dark={paper.dark} width={width} height={height} />;
}
