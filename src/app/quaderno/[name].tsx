import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { confirm, notify } from '../../components/dialogs';
import { AddCard, CoverCard, ItemMenu, NotebookEditor } from '../../components/notebooks';
import { IconButton, Screen, ScreenHeader } from '../../components/ui';
import { BoardPreview } from '../../components/whiteboard/BoardPreview';
import { downloadNotes } from '../../components/whiteboard/exportPdf';
import { CoverThumb, PaperThumb } from '../../components/whiteboard/Paper';
import { t } from '../../i18n';
import { metaOf, NO_SUBJECT, renameNotebook, sheetsOf, useSheets, type Sheet } from '../../state/notebooks';
import { setSubjectLook, subjectLook, useSubjectLooks, useSubjects } from '../../state/subjects';
import { deleteNote, duplicateNote, getBoardItems, getNoteMeta, getViewport, useBoards } from '../../state/whiteboard';
import { useTheme } from '../../theme';

/** Quaderno di una materia: i fogli salvati e Nuovo foglio (dec. 143). */
export default function Quaderno() {
  const { spacing } = useTheme();
  const { name = '' } = useLocalSearchParams<{ name: string }>();
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const itemsOf = useBoards();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [listW, setListW] = useState(0);

  const others = name === NO_SUBJECT;
  const label = others ? t.activitiesHub.otherSheets : name;
  const list = sheetsOf(sheets, name);
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
  const menuSheet = list.find((s) => s.id === menuFor);

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar={false}>
        <ScreenHeader
          title={label}
          subtitle={list.length ? t.activitiesHub.sheetCount(list.length) : t.activitiesHub.emptyBook}
          left={<IconButton icon="chevron-back" label={t.whiteboard.back} onPress={() => router.back()} />}
          right={!others && <IconButton icon="color-palette-outline" label={t.activitiesHub.editBook} onPress={() => setEditing(true)} />}
        />

        <View onLayout={(e) => setListW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: gap, rowGap: spacing.lg }}>
          {w > 0 && (
            <>
              <AddCard width={w} height={h} label={t.activitiesHub.newSheet} onPress={newSheet} />
              {list.map((s) => (
                <CoverCard key={s.id} width={w} height={h} label={s.title} caption={s.edited} onOpen={() => open(s)} onMenu={() => setMenuFor(s.id)}>
                  <SheetThumb sheet={s} items={itemsOf(s.id)} width={w} height={h} />
                </CoverCard>
              ))}
            </>
          )}
        </View>
      </Screen>

      {menuSheet && (
        <ItemMenu
          title={menuSheet.title}
          onClose={() => setMenuFor(null)}
          items={[
            { icon: 'open-outline', label: t.activitiesHub.open, onPress: () => open(menuSheet) },
            { icon: 'color-palette-outline', label: t.activitiesHub.editSheet, onPress: () => router.push({ pathname: '/nuova-nota', params: { id: menuSheet.id } }) },
            { icon: 'copy-outline', label: t.manage.duplicate, onPress: () => duplicate(menuSheet) },
            { icon: 'download-outline', label: t.manage.download, onPress: () => download(menuSheet) },
            { icon: 'trash-outline', label: t.manage.delete, danger: true, onPress: () => confirm(t.manage.confirmDelete(1), t.manage.delete, () => deleteNote(menuSheet.id)) },
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
