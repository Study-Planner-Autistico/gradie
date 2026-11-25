// Impegni dell'Agenda (dec. 186): lezioni (anche ripetute ogni settimana), scadenze, blocchi di studio,
// eventi importati dal calendario del telefono. Stato solo in memoria: nessun backend (dec. 53).
// Si parte dagli esempi di demoAgenda; la Home li legge ancora da lì (punto 2 dell'elenco, non fatto).
import { useSyncExternalStore } from 'react';
import { demoAgenda, type DemoAgendaItem } from '../data/demo';
import type { TintName } from '../theme/tokens';

export type AgendaKind = TintName;

export type AgendaItem = {
  id: string;
  kind: AgendaKind;
  title: string;
  subject?: string;
  /** "HH:MM"; senza orario è una scadenza da consegnare in giornata (dec. 186). */
  start?: string;
  end?: string;
  /** Aula, oppure il tipo di scadenza (Compito, Verifica…). */
  meta?: string;
  /** Lezione dell'orario del docente: non modificabile (dec. 102). */
  locked?: boolean;
  /** Giorno, "YYYY-MM-DD"; per le ripetute è il primo. */
  date: string;
  /** Ogni settimana fino a `until` compreso, tranne i giorni in `skip` e le festività (dec. 186). */
  repeat?: { until: string; skip: string[] };
  /** Evento preso dal calendario del telefono: serve a riconoscerlo se lo si importa di nuovo. */
  imported?: { calendarId: string; eventId: string };
  /** Avviso, minuti prima dell'inizio (0 = all'ora dell'evento); senza, nessuna notifica (dec. 198). */
  alert?: number;
};

/** Un impegno in un giorno preciso: per le ripetute `id` è "serie@giorno", `seriesId` la serie. */
export type Occurrence = DemoAgendaItem & { date: string; seriesId: string; recurring: boolean; imported?: AgendaItem['imported']; alert?: number };

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDaysYmd = (s: string, n: number) => {
  const d = fromYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};
const today = () => ymd(new Date());
const offsetOf = (s: string) => Math.round((fromYmd(s).getTime() - fromYmd(today()).getTime()) / 86400000);
export const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
export const fromMin = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** Fine del semestre scolastico: 31 gennaio per il primo (settembre-gennaio), 10 giugno per il secondo. */
export function semesterEnd(from: Date) {
  const m = from.getMonth();
  if (m >= 8) return ymd(new Date(from.getFullYear() + 1, 0, 31));
  if (m === 0) return ymd(new Date(from.getFullYear(), 0, 31));
  return ymd(new Date(from.getFullYear(), 5, 10));
}

// Esempi: le lezioni con orario si ripetono ogni settimana fino a fine semestre.
const seed: AgendaItem[] = demoAgenda.map(({ dayOffset, ...rest }) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const date = ymd(d);
  return rest.kind === 'lesson' && rest.start ? { ...rest, date, repeat: { until: semesterEnd(d), skip: [] } } : { ...rest, date };
});

let items: AgendaItem[] = seed;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useAgenda = () => useSyncExternalStore(subscribe, () => items);
export const getAgenda = () => items;
/** Rimette la lista com'era (annulla). */
export function setAgenda(next: AgendaItem[]) {
  items = next;
  emit();
}

let counter = 0;
export const newAgendaId = () => `ag-${Date.now().toString(36)}-${++counter}`;

export function addItems(list: AgendaItem[]) {
  items = [...items, ...list];
  emit();
}
export function updateItem(id: string, patch: Partial<AgendaItem>) {
  items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
  emit();
}
export function removeItem(id: string) {
  items = items.filter((i) => i.id !== id);
  emit();
}
/** Toglie un solo giorno da una serie (festività non segnata, gita, recupero spostato altrove). */
export function skipDay(seriesId: string, date: string) {
  items = items.map((i) => (i.id === seriesId && i.repeat ? { ...i, repeat: { ...i.repeat, skip: [...i.repeat.skip, date] } } : i));
  emit();
}

/** Giorni di chiusura (festività): lì le lezioni ripetute non ci sono. */
const closedOn = (list: AgendaItem[], date: string) => list.some((i) => i.kind === 'holiday' && i.date === date);

/** Impegni di un giorno, con le serie espanse. */
export function occurrencesOn(list: AgendaItem[], date: string): Occurrence[] {
  const closed = closedOn(list, date);
  const weekday = fromYmd(date).getDay();
  const out: Occurrence[] = [];
  for (const i of list) {
    const { repeat, ...base } = i;
    if (!repeat) {
      if (i.date === date) out.push({ ...base, date, dayOffset: offsetOf(date), seriesId: i.id, recurring: false });
      continue;
    }
    if (date < i.date || date > repeat.until || fromYmd(i.date).getDay() !== weekday) continue;
    if (repeat.skip.includes(date) || (closed && i.kind === 'lesson')) continue;
    out.push({ ...base, id: `${i.id}@${date}`, date, dayOffset: offsetOf(date), seriesId: i.id, recurring: true });
  }
  return out;
}

/** Giorni in cui cade un impegno (le ripetute: ogni settimana fino alla fine, al massimo un anno). */
export function datesOf(i: Pick<AgendaItem, 'date' | 'repeat'>) {
  if (!i.repeat) return [i.date];
  const out: string[] = [];
  for (let d = i.date; d <= i.repeat.until && out.length < 53; d = addDaysYmd(d, 7)) if (!i.repeat.skip.includes(d)) out.push(d);
  return out;
}

export type Conflict = { title: string; date: string; start: string; end: string };

/**
 * Sovrapposizioni (dec. 186): un impegno con orario che si accavalla con lezioni, studio o altri impegni con orario.
 * `ignore`: la serie che si sta modificando. Al massimo `max` risultati.
 */
export function conflictsOf(list: AgendaItem[], cand: Pick<AgendaItem, 'date' | 'repeat' | 'start' | 'end'>, ignore?: string, max = 3): Conflict[] {
  if (!cand.start || !cand.end) return [];
  const a0 = toMin(cand.start);
  const a1 = toMin(cand.end);
  const out: Conflict[] = [];
  for (const date of datesOf(cand)) {
    for (const o of occurrencesOn(list, date)) {
      if (o.seriesId === ignore || !o.start || !o.end || o.kind === 'holiday') continue;
      if (toMin(o.start) < a1 && a0 < toMin(o.end)) {
        out.push({ title: o.title, date, start: o.start, end: o.end });
        if (out.length >= max) return out;
      }
    }
  }
  return out;
}
