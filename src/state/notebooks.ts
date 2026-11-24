// Quaderni e fogli degli Appunti (dec. 143): ogni quaderno è una materia e contiene più fogli (le note).
import { useSyncExternalStore } from 'react';
import { demoNotes, type DemoNote } from '../data/demo';
import { locale, t } from '../i18n';
import { forgetSubject, getTrashedBooks, renameSubject, restoreSubject, trashSubject, useTrashedBooks } from './subjects';
import {
  deleteNote,
  getEdited,
  getNoteMeta,
  getTrash,
  restoreNote,
  saveNoteMeta,
  trashNote,
  useHidden,
  useNotes,
  usePages,
  useTrash,
  type NoteMeta,
} from './whiteboard';

/** Foglio: una nota della lavagna, con la materia del quaderno in cui sta. `at`: ultima modifica (0 = dimostrativo). */
export type Sheet = DemoNote & { cover?: string | null; at: number };

/** Quaderno dei fogli senza materia (es. pagine create prima dei quaderni). */
export const NO_SUBJECT = '__altri';

/** Giorni in cui un elemento resta nel cestino (dec. 145). */
export const TRASH_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const key = (s: string) => s.trim().toLocaleLowerCase();

/** "Oggi, 09:12" per le pagine create in questa sessione. */
export function editedLabel(at: number) {
  return `${t.home.today}, ${new Date(at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}

/** Tutti i fogli fuori dal cestino: creati dall'utente (dec. 112), pagine nuove con contenuto, fogli dimostrativi. */
export function useSheets(): Sheet[] {
  const trash = useTrash();
  return useAllSheets().filter((s) => !trash[s.id]);
}

/** Tutti i fogli, anche quelli nel cestino. */
function useAllSheets(): Sheet[] {
  const metas = useNotes();
  const pages = usePages();
  const hidden = useHidden();
  const fromPlus: Sheet[] = metas.map((m) => {
    const demo = demoNotes.find((d) => d.id === m.id);
    const at = getEdited(m.id) ?? m.created;
    return {
      id: m.id,
      title: m.title,
      subject: m.subject ?? demo?.subject ?? '',
      edited: editedLabel(at),
      tint: demo?.tint ?? 'lesson',
      cover: m.cover,
      at,
    };
  });
  const loose: Sheet[] = pages
    .filter((p) => !demoNotes.some((n) => n.id === p.id) && !metas.some((m) => m.id === p.id) && !hidden.includes(p.id))
    .map((p) => ({ id: p.id, title: t.whiteboard.untitled, subject: '', edited: editedLabel(p.edited), tint: 'lesson', at: p.edited }));
  const demos: Sheet[] = demoNotes.filter((n) => !hidden.includes(n.id) && !metas.some((m) => m.id === n.id)).map((n) => ({ ...n, at: 0 }));
  return [...fromPlus, ...loose, ...demos];
}

/** Fogli del quaderno `subject` (o di Altri fogli). */
export function sheetsOf(sheets: Sheet[], subject: string) {
  return subject === NO_SUBJECT ? sheets.filter((s) => !s.subject) : sheets.filter((s) => !!s.subject && key(s.subject) === key(subject));
}

/** Dati del foglio da salvare: quelli propri, o predefiniti per i fogli dimostrativi senza dati. */
export function metaOf(n: Sheet): Omit<NoteMeta, 'id' | 'created'> {
  const m = getNoteMeta(n.id);
  return m
    ? { title: m.title, cover: m.cover, paper: m.paper, subject: m.subject ?? n.subject }
    : { title: n.title, cover: n.cover ?? null, paper: { template: 'blank', color: '#FFFFFF', dark: false, size: 'a4', landscape: false }, subject: n.subject };
}

/** Rinomina il quaderno: la materia e tutti i suoi fogli. Restituisce false se il nome non va bene. */
export function renameNotebook(from: string, to: string, sheets: Sheet[]) {
  if (!renameSubject(from, to)) return false;
  sheetsOf(sheets, from).forEach((n) => saveNoteMeta(n.id, { ...metaOf(n), subject: to.trim() }));
  return true;
}

// --- Cestino (dec. 145) ---

/** Sposta il quaderno nel cestino con tutti i suoi fogli; "Altri fogli" non è una materia, quindi vanno i soli fogli. */
export function trashNotebook(subject: string, sheets: Sheet[]) {
  const book = subject === NO_SUBJECT ? undefined : subject;
  const ids = sheetsOf(sheets, subject).map((n) => n.id);
  ids.forEach((id) => trashNote(id, book));
  if (book) trashSubject(book);
  return ids;
}

/** Annulla `trashNotebook` (`ids`: i fogli che ha spostato). */
export function restoreNotebook(subject: string, ids: string[]) {
  ids.forEach(restoreNote);
  if (subject !== NO_SUBJECT) restoreSubject(subject);
}

/** Ripristina un foglio; se il suo quaderno è nel cestino torna anche quello (senza gli altri fogli). */
export function restoreSheet(sheet: Sheet) {
  restoreNote(sheet.id);
  if (sheet.subject && getTrashedBooks().some((b) => key(b.name) === key(sheet.subject))) restoreSubject(sheet.subject);
}

/** Ripristina un quaderno del cestino con tutti i fogli eliminati insieme a lui. */
export function restoreTrashedBook(name: string) {
  Object.entries(getTrash()).forEach(([id, e]) => e.book && key(e.book) === key(name) && restoreNote(id));
  restoreSubject(name);
}

/** Elimina per sempre un quaderno del cestino con i suoi fogli. */
export function purgeNotebook(name: string) {
  Object.entries(getTrash()).forEach(([id, e]) => e.book && key(e.book) === key(name) && deleteNote(id));
  forgetSubject(name);
}

/** Elimina per sempre un foglio del cestino. */
export const purgeSheet = (id: string) => deleteNote(id);

/** Elimina per sempre ciò che sta nel cestino da più di 30 giorni (o tutto, con `all`). */
export function purgeTrash(all = false) {
  const now = Date.now();
  const old = (at: number) => all || now - at > TRASH_DAYS * DAY;
  getTrashedBooks().forEach((b) => old(b.at) && purgeNotebook(b.name));
  Object.entries(getTrash()).forEach(([id, e]) => old(e.at) && deleteNote(id));
}

/** Elemento del cestino: un quaderno (con i suoi fogli) oppure un foglio eliminato da solo. */
export type TrashItem = { kind: 'book'; name: string; at: number; count: number } | { kind: 'sheet'; sheet: Sheet; at: number };

/** Contenuto del cestino, dal più recente. */
export function useTrashItems(): TrashItem[] {
  const all = useAllSheets();
  const trash = useTrash();
  const books = useTrashedBooks();
  const inBook = (book?: string) => !!book && books.some((b) => key(b.name) === key(book));
  const items: TrashItem[] = books.map((b) => ({
    kind: 'book',
    name: b.name,
    at: b.at,
    count: all.filter((s) => trash[s.id]?.book && key(trash[s.id].book!) === key(b.name)).length,
  }));
  all.forEach((s) => {
    const e = trash[s.id];
    if (e && !inBook(e.book)) items.push({ kind: 'sheet', sheet: s, at: e.at });
  });
  return items.sort((a, b) => b.at - a.at);
}

/** Giorni che restano prima dell'eliminazione definitiva. */
export const daysLeft = (at: number) => Math.max(1, Math.ceil((at + TRASH_DAYS * DAY - Date.now()) / DAY));

// --- Ordine di quaderni e fogli (dec. 145) ---

/** Ordine: scelto a mano (predefinito, non cambia da solo), alfabetico o dall'ultima modifica. */
export type SortMode = 'custom' | 'alpha' | 'recent';
type Order = { books: SortMode; sheets: SortMode; sheetOrder: Record<string, string[]> };
let order: Order = { books: 'custom', sheets: 'custom', sheetOrder: {} };
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
function setOrder(patch: Partial<Order>) {
  order = { ...order, ...patch };
  listeners.forEach((l) => l());
}

export function useOrder() {
  return useSyncExternalStore(subscribe, () => order, () => order);
}

export const setBookSort = (mode: SortMode) => setOrder({ books: mode });
export const setSheetSort = (mode: SortMode) => setOrder({ sheets: mode });

const byName = (a: string, b: string) => a.localeCompare(b, locale, { sensitivity: 'base' });

/**
 * Fogli del quaderno nell'ordine da mostrare: prima quelli fissati in cima, poi gli altri.
 * Nell'ordine a mano i fogli nuovi (non ancora spostati) stanno all'inizio, dal più nuovo.
 */
export function sortSheets(list: Sheet[], subject: string, pinned: string[], o: Order) {
  const saved = o.sheetOrder[key(subject)] ?? [];
  const sorted = [...list].sort((a, b) => {
    if (o.sheets === 'alpha') return byName(a.title, b.title);
    if (o.sheets === 'recent') return b.at - a.at;
    const ia = saved.indexOf(a.id);
    const ib = saved.indexOf(b.id);
    if (ia < 0 && ib < 0) return b.at - a.at;
    if (ia < 0) return -1;
    if (ib < 0) return 1;
    return ia - ib;
  });
  return [...sorted.filter((s) => pinned.includes(s.id)), ...sorted.filter((s) => !pinned.includes(s.id))];
}

/** Sposta un foglio di un posto dentro il suo gruppo (fissati o no); `shown` è l'ordine mostrato ora. */
export function moveSheet(subject: string, shown: Sheet[], id: string, delta: -1 | 1, pinned: string[]) {
  const ids = shown.map((s) => s.id);
  const i = ids.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= ids.length || pinned.includes(ids[i]) !== pinned.includes(ids[j])) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  setOrder({ sheets: 'custom', sheetOrder: { ...order.sheetOrder, [key(subject)]: ids } });
}

/** Quaderni nell'ordine da mostrare; `lastEdit` è l'ultima modifica tra i fogli di ogni quaderno. */
export function sortBooks<T extends { label: string; lastEdit: number }>(books: T[], mode: SortMode) {
  if (mode === 'alpha') return [...books].sort((a, b) => byName(a.label, b.label));
  if (mode === 'recent') return [...books].sort((a, b) => b.lastEdit - a.lastEdit);
  return books;
}
