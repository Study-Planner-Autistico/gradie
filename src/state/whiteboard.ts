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
/** Forme (dec. 111). Per linea e freccia, (x,y) è l'inizio e (x+w, y+h) la fine. */
export type ShapeKind = 'arrow' | 'line' | 'square' | 'circle' | 'triangle' | 'star' | 'rhombus' | 'hexagon' | 'octagon' | 'decagon';
export type ShapeItem = { kind: 'shape'; id: string; shape: ShapeKind; x: number; y: number; w: number; h: number; fill: string | null; stroke: string; strokeWidth: number; text: string };
export type AudioItem = { kind: 'audio'; id: string; x: number; y: number; uri: string; seconds: number; comment: string };

export type BoardItem = Stroke | TextItem | ImageItem | StickerItem | NoteItem | AudioItem | ShapeItem;

/** Parte di lavagna visibile: angolo in alto a sinistra e misure, in coordinate della lavagna. */
export type Viewport = { x: number; y: number; w: number; h: number };

/** Nota creata dal + (dec. 112): nome, copertina e carta. */
export type PaperTemplate = 'blank' | 'lined' | 'narrow' | 'wide' | 'margin' | 'cornell' | 'grid' | 'smallGrid' | 'dots' | 'music';
export type PageSize = 'a4' | 'letter';
export type Paper = { template: PaperTemplate; color: string; dark: boolean; size: PageSize; landscape: boolean };
/** `subject`: materia in cui sta la nota negli Appunti (dec. 141); vuota = Senza materia. */
export type NoteMeta = { id: string; title: string; cover: string | null; paper: Paper; created: number; subject?: string };

/** Pagina modificata: id della lavagna e ora dell'ultima modifica. */
export type PageInfo = { id: string; edited: number };

const EMPTY: BoardItem[] = [];
const boards = new Map<string, BoardItem[]>();
const edited = new Map<string, number>();
const viewports = new Map<string, Viewport>();
const metas = new Map<string, NoteMeta>();
let notes: NoteMeta[] = [];
const listeners = new Set<() => void>();
let pages: PageInfo[] = [];

function emit() {
  notes = [...metas.values()].sort((a, b) => (edited.get(b.id) ?? b.created) - (edited.get(a.id) ?? a.created));
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

// Cronologia per annulla e ripeti (dec. 116): istantanee della lavagna prima di ogni modifica.
const HISTORY_MAX = 100;
const undoStack = new Map<string, BoardItem[][]>();
const redoStack = new Map<string, BoardItem[][]>();
/** Gruppo dell'ultima modifica: le modifiche dello stesso gesto o dello stesso testo sono un solo passo. */
const lastGroup = new Map<string, string | null>();

const sameItems = (a: BoardItem[], b: BoardItem[]) => a.length === b.length && a.every((x, k) => x === b[k]);

/** Aggiorna la lavagna `id`; `group` unisce in un solo passo di annulla le modifiche consecutive con lo stesso gruppo. */
function updateBoard(id: string, fn: (prev: BoardItem[]) => BoardItem[], group?: string) {
  const prev = boards.get(id) ?? EMPTY;
  const next = fn(prev);
  if (sameItems(prev, next)) return;
  const undo = undoStack.get(id) ?? [];
  if (group && lastGroup.get(id) === group && undo.length) {
    // Se il gesto riporta la lavagna com'era prima, il passo non serve.
    if (sameItems(undo[undo.length - 1], next)) undo.pop();
  } else {
    undo.push(prev);
    if (undo.length > HISTORY_MAX) undo.shift();
  }
  undoStack.set(id, undo);
  redoStack.set(id, []);
  lastGroup.set(id, group ?? null);
  boards.set(id, next);
  edited.set(id, Date.now());
  emit();
}

/** Annulla l'ultima modifica della lavagna. */
export function undoBoard(id: string) {
  const undo = undoStack.get(id);
  if (!undo?.length) return;
  const redo = redoStack.get(id) ?? [];
  redo.push(boards.get(id) ?? EMPTY);
  redoStack.set(id, redo);
  boards.set(id, undo.pop()!);
  lastGroup.set(id, null);
  edited.set(id, Date.now());
  emit();
}

/** Ripete l'ultima modifica annullata. */
export function redoBoard(id: string) {
  const redo = redoStack.get(id);
  if (!redo?.length) return;
  const undo = undoStack.get(id) ?? [];
  undo.push(boards.get(id) ?? EMPTY);
  undoStack.set(id, undo);
  boards.set(id, redo.pop()!);
  lastGroup.set(id, null);
  edited.set(id, Date.now());
  emit();
}

/** Toglie, senza lasciarne traccia, le modifiche del gesto `group` se sono le ultime (un tocco a più dita iniziato con un dito). */
export function revertGroup(id: string, group: string) {
  const undo = undoStack.get(id);
  if (lastGroup.get(id) !== group || !undo?.length) return;
  boards.set(id, undo.pop()!);
  lastGroup.set(id, null);
  emit();
}

/** Se si può annullare o ripetere sulla lavagna `id`. */
export function useHistory(id: string) {
  const canUndo = useSyncExternalStore(subscribe, () => (undoStack.get(id)?.length ?? 0) > 0, () => false);
  const canRedo = useSyncExternalStore(subscribe, () => (redoStack.get(id)?.length ?? 0) > 0, () => false);
  return { canUndo, canRedo };
}

/** Elementi della lavagna `id`, conservati finché l'app resta aperta. */
export function useBoard(id: string) {
  const items = useSyncExternalStore(subscribe, () => boards.get(id) ?? EMPTY, () => EMPTY);
  const update = useCallback((fn: (prev: BoardItem[]) => BoardItem[], group?: string) => updateBoard(id, fn, group), [id]);
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

/** Ricorda la visuale con cui si è lasciata la pagina (anteprima in Note). */
export function saveViewport(id: string, vp: Viewport) {
  if (vp.w <= 0 || vp.h <= 0) return;
  viewports.set(id, vp);
  emit();
}

export const getViewport = (id: string) => viewports.get(id);

/** Crea una nota vuota con copertina e carta scelte; restituisce il suo id. */
export function createNote(meta: Omit<NoteMeta, 'id' | 'created'>): string {
  const id = newId('nota');
  metas.set(id, { ...meta, id, created: Date.now() });
  emit();
  return id;
}

export const getNoteMeta = (id: string) => metas.get(id);

/** Note create dal +, dalla più recente. */
export function useNotes() {
  return useSyncExternalStore(subscribe, () => notes, () => notes);
}

/** Momento dell'ultima modifica di una lavagna, se c'è. */
export const getEdited = (id: string) => edited.get(id);

/** Note dimostrative eliminate (non hanno una lavagna propria da togliere). */
const hidden = new Set<string>();
let hiddenSnap: string[] = [];

/** Modifica nome, copertina e carta (dec. 113). Se la nota non ha ancora dati propri, li crea. */
export function saveNoteMeta(id: string, meta: Omit<NoteMeta, 'id' | 'created'>) {
  metas.set(id, { ...meta, id, created: metas.get(id)?.created ?? Date.now() });
  emit();
}

/** Duplica una nota: contenuto, visuale e dati, con un nuovo id. */
export function duplicateNote(id: string, meta: Omit<NoteMeta, 'id' | 'created'>): string {
  const copy = newId('nota');
  const items = boards.get(id);
  if (items) boards.set(copy, items.map((i) => ({ ...i, id: newId('i') })));
  const vp = viewports.get(id);
  if (vp) viewports.set(copy, vp);
  metas.set(copy, { ...meta, id: copy, created: Date.now() });
  edited.set(copy, Date.now());
  emit();
  return copy;
}

/** Elimina una nota con tutto il suo contenuto. */
export function deleteNote(id: string) {
  favorites.delete(id);
  statuses.delete(id);
  if (lastOpened === id) lastOpened = null;
  refreshExtras();
  boards.delete(id);
  metas.delete(id);
  viewports.delete(id);
  edited.delete(id);
  hidden.add(id);
  hiddenSnap = [...hidden];
  emit();
}

export function useHidden() {
  return useSyncExternalStore(subscribe, () => hiddenSnap, () => hiddenSnap);
}

export const getBoardItems = (id: string) => boards.get(id) ?? EMPTY;

// Preferiti, stato di studio e ultima nota aperta (dec. 119).
export type StudyStatus = 'todo' | 'doing' | 'done';
export type NoteExtras = { favorites: string[]; statuses: Record<string, StudyStatus>; lastOpened: string | null };
const favorites = new Set<string>();
const statuses = new Map<string, StudyStatus>();
let lastOpened: string | null = null;
let extras: NoteExtras = { favorites: [], statuses: {}, lastOpened: null };
function refreshExtras() {
  extras = { favorites: [...favorites], statuses: Object.fromEntries(statuses), lastOpened };
}

/** Mette o toglie la nota dai preferiti (sezione In evidenza). */
export function toggleFavorite(id: string) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  refreshExtras();
  emit();
}

/** Stato di studio: da studiare, in corso, ripassata. */
export function setStudyStatus(id: string, status: StudyStatus) {
  statuses.set(id, status);
  refreshExtras();
  emit();
}

/** Ricorda l'ultima nota aperta, per la scheda Riprendi da qui. */
export function markOpened(id: string) {
  if (lastOpened === id) return;
  lastOpened = id;
  refreshExtras();
  emit();
}

export function useNoteExtras() {
  return useSyncExternalStore(subscribe, () => extras, () => extras);
}
