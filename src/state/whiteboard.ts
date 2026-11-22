// Lavagna (dec. 110). Stato solo in memoria: nessun backend né salvataggio locale è stato scelto (dec. 53).
import { useCallback, useState } from 'react';

export type Pt = { x: number; y: number };
export type StrokeTool = 'pen' | 'pencil' | 'highlighter';
export type LineStyle = 'solid' | 'brush' | 'dashed' | 'dotted';
/** Stabilizzazione del tratto: 0 bassa, 1 media, 2 alta. */
export type Stabilization = 0 | 1 | 2;

export type Stroke = { kind: 'stroke'; id: string; tool: StrokeTool; color: string; width: number; style: LineStyle; points: Pt[] };
export type TextItem = { kind: 'text'; id: string; x: number; y: number; text: string; color: string };
export type ImageItem = { kind: 'image'; id: string; x: number; y: number; w: number; h: number; uri: string };
export type StickerItem = { kind: 'sticker'; id: string; x: number; y: number; emoji: string; size: number };
export type NoteItem = { kind: 'note'; id: string; x: number; y: number; w: number; text: string };
export type AudioItem = { kind: 'audio'; id: string; x: number; y: number; uri: string; seconds: number; comment: string };

export type BoardItem = Stroke | TextItem | ImageItem | StickerItem | NoteItem | AudioItem;

const boards = new Map<string, BoardItem[]>();

let counter = 0;
export const newId = (prefix = 'i') => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Elementi della lavagna `id`, conservati finché l'app resta aperta. */
export function useBoard(id: string) {
  const [items, setItems] = useState<BoardItem[]>(() => boards.get(id) ?? []);
  const update = useCallback(
    (fn: (prev: BoardItem[]) => BoardItem[]) =>
      setItems((prev) => {
        const next = fn(prev);
        boards.set(id, next);
        return next;
      }),
    [id],
  );
  return [items, update] as const;
}
