import { View } from 'react-native';
import type { Sheet } from '../state/notebooks';
import type { NotebookLook } from '../state/subjects';
import { getBoardItems, getNoteMeta, getViewport, useBoards, type BoardItem, type ImportSource, type Paper, type Viewport } from '../state/whiteboard';
import { useTheme } from '../theme';
import { Icon, IMPORT_ICON } from './icons';
import { BoardPreview } from './whiteboard/BoardPreview';
import { CoverThumb, PaperThumb } from './whiteboard/Paper';

/**
 * Copia di una pagina degli Appunti com'era al momento dell'invio (dec. 192): disegno, visuale, carta, copertina,
 * titolo e quaderno. Chi la riceve vede solo questa; le modifiche fatte dopo non arrivano.
 */
export type NoteSnapshot = {
  id: string;
  title: string;
  subject: string;
  cover: string | null;
  look?: NotebookLook;
  items: BoardItem[];
  viewport?: Viewport;
  paper?: Pick<Paper, 'template' | 'color' | 'dark' | 'gap'>;
  source?: ImportSource;
  at: number;
};

export function snapshotOf(sheet: Sheet, look?: NotebookLook): NoteSnapshot {
  const paper = getNoteMeta(sheet.id)?.paper;
  const vp = getViewport(sheet.id);
  return {
    id: sheet.id,
    title: sheet.title,
    subject: sheet.subject,
    cover: sheet.cover ?? null,
    look,
    // Copia vera, non un riferimento: la lavagna può cambiare dopo l'invio.
    items: JSON.parse(JSON.stringify(getBoardItems(sheet.id))) as BoardItem[],
    viewport: vp ? { ...vp } : undefined,
    paper: paper ? { template: paper.template, color: paper.color, dark: paper.dark, gap: paper.gap } : undefined,
    source: sheet.source,
    at: Date.now(),
  };
}

/** Anteprima da dati fissi (una copia inviata o i dati di un foglio). */
export function ThumbView({ snap, width, height }: { snap: Pick<NoteSnapshot, 'source' | 'cover' | 'title' | 'items' | 'viewport' | 'paper'>; width: number; height: number }) {
  const { colors } = useTheme();
  if (snap.source)
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted }}>
        <Icon name={IMPORT_ICON[snap.source.kind]} size={width * 0.3} color={snap.source.kind === 'word' || snap.source.kind === 'ppt' ? colors.textSecondary : colors.dangerIcon} />
      </View>
    );
  const paper = snap.paper ?? { template: 'blank' as const, color: '#FFFFFF', dark: false };
  if (snap.cover) return <CoverThumb color={snap.cover} title={snap.title} width={width} height={height} />;
  if (snap.items.length > 0) return <BoardPreview items={snap.items} height={height} viewport={snap.viewport} />;
  return <PaperThumb template={paper.template} gap={paper.gap} color={paper.color} dark={paper.dark} width={width} height={height} />;
}

/**
 * Anteprima di un foglio: copertina, visuale dell'ultima volta o la carta scelta. La stessa in Appunti e nella scelta
 * delle pagine da mandare (dec. 191): legge gli Appunti in tempo reale.
 */
export function SheetThumb({ sheet, width, height }: { sheet: Sheet; width: number; height: number }) {
  const items = useBoards()(sheet.id);
  const paper = getNoteMeta(sheet.id)?.paper;
  return (
    <ThumbView
      snap={{ source: sheet.source, cover: sheet.cover ?? null, title: sheet.title, items, viewport: getViewport(sheet.id), paper }}
      width={width}
      height={height}
    />
  );
}
