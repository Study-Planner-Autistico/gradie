import { View } from 'react-native';
import type { Sheet } from '../state/notebooks';
import { getNoteMeta, getViewport, useBoards } from '../state/whiteboard';
import { useTheme } from '../theme';
import { Icon, IMPORT_ICON } from './icons';
import { BoardPreview } from './whiteboard/BoardPreview';
import { CoverThumb, PaperThumb } from './whiteboard/Paper';

/**
 * Anteprima di un foglio: copertina, visuale dell'ultima volta o la carta scelta. La stessa in Appunti e nei
 * Messaggi (dec. 191): legge gli stessi dati, quindi ogni modifica (colore, copertina, disegno) si vede subito ovunque.
 */
export function SheetThumb({ sheet, width, height }: { sheet: Sheet; width: number; height: number }) {
  const { colors } = useTheme();
  const items = useBoards()(sheet.id);
  if (sheet.source)
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted }}>
        <Icon name={IMPORT_ICON[sheet.source.kind]} size={width * 0.3} color={sheet.source.kind === 'word' || sheet.source.kind === 'ppt' ? colors.textSecondary : colors.dangerIcon} />
      </View>
    );
  const paper = getNoteMeta(sheet.id)?.paper ?? { template: 'blank' as const, color: '#FFFFFF', dark: false };
  if (sheet.cover) return <CoverThumb color={sheet.cover} title={sheet.title} width={width} height={height} />;
  if (items.length > 0) return <BoardPreview items={items} height={height} viewport={getViewport(sheet.id)} />;
  return <PaperThumb template={paper.template} gap={'gap' in paper ? paper.gap : undefined} color={paper.color} dark={paper.dark} width={width} height={height} />;
}
