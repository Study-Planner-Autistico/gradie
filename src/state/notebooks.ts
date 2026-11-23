// Quaderni e fogli degli Appunti (dec. 143): ogni quaderno è una materia e contiene più fogli (le note).
import { demoNotes, type DemoNote } from '../data/demo';
import { locale, t } from '../i18n';
import { removeSubject, renameSubject } from './subjects';
import { deleteNote, getEdited, getNoteMeta, saveNoteMeta, useHidden, useNotes, usePages, type NoteMeta } from './whiteboard';

/** Foglio: una nota della lavagna, con la materia del quaderno in cui sta. */
export type Sheet = DemoNote & { cover?: string | null };

/** Quaderno dei fogli senza materia (es. pagine create prima dei quaderni). */
export const NO_SUBJECT = '__altri';

const key = (s: string) => s.trim().toLocaleLowerCase();

/** "Oggi, 09:12" per le pagine create in questa sessione. */
export function editedLabel(at: number) {
  return `${t.home.today}, ${new Date(at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}

/** Tutti i fogli: creati dall'utente (dec. 112), pagine nuove con contenuto, fogli dimostrativi. */
export function useSheets(): Sheet[] {
  const metas = useNotes();
  const pages = usePages();
  const hidden = useHidden();
  const fromPlus: Sheet[] = metas.map((m) => {
    const demo = demoNotes.find((d) => d.id === m.id);
    return {
      id: m.id,
      title: m.title,
      subject: m.subject ?? demo?.subject ?? '',
      edited: editedLabel(getEdited(m.id) ?? m.created),
      tint: demo?.tint ?? 'lesson',
      cover: m.cover,
    };
  });
  const loose: Sheet[] = pages
    .filter((p) => !demoNotes.some((n) => n.id === p.id) && !metas.some((m) => m.id === p.id) && !hidden.includes(p.id))
    .map((p) => ({ id: p.id, title: t.whiteboard.untitled, subject: '', edited: editedLabel(p.edited), tint: 'lesson' }));
  const demos = demoNotes.filter((n) => !hidden.includes(n.id) && !metas.some((m) => m.id === n.id));
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

/** Elimina il quaderno con tutti i suoi fogli. */
export function deleteNotebook(subject: string, sheets: Sheet[]) {
  sheetsOf(sheets, subject).forEach((n) => deleteNote(n.id));
  if (subject !== NO_SUBJECT) removeSubject(subject);
}
