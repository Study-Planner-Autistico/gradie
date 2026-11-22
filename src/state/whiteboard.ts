// Lavagna (dec. 110). Stato solo in memoria: nessun backend né salvataggio locale è stato scelto (dec. 53).
import { useCallback, useSyncExternalStore } from 'react';

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

/** Pagina modificata: id della lavagna e ora dell'ultima modifica. */
export type PageInfo = { id: string; edited: number };

const EMPTY: BoardItem[] = [];
const boards = new Map<string, BoardItem[]>();
const edited = new Map<string, number>();
const listeners = new Set<() => void>();
let pages: PageInfo[] = [];

function emit() {
  pages = [...edited.entries()]
    .filter(([id]) => (boards.get(id)?.length ?? 0) > 0)
    .map(([id, at]) => ({ id, edited: at }))
    .sort((a, b) => b.edited - a.edited);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

let counter = 0;
export const newId = (prefix = 'i') => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Elementi della lavagna `id`, conservati finché l'app resta aperta. */
export function useBoard(id: string) {
  const items = useSyncExternalStore(subscribe, () => boards.get(id) ?? EMPTY, () => EMPTY);
  const update = useCallback(
    (fn: (prev: BoardItem[]) => BoardItem[]) => {
      boards.set(id, fn(boards.get(id) ?? EMPTY));
      edited.set(id, Date.now());
      emit();
    },
    [id],
  );
  return [items, update] as const;
}

/** Pagine con contenuto, dalla più recente. */
export function usePages() {
  return useSyncExternalStore(subscribe, () => pages, () => pages);
}

/** Contenuto di più lavagne, per le anteprime. */
export function useBoards() {
  useSyncExternalStore(subscribe, () => pages, () => pages);
  return (id: string) => boards.get(id) ?? EMPTY;
}
