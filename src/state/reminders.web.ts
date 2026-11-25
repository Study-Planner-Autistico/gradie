// Promemoria dell'Agenda sul web (dec. 195): notifiche del browser, finché la pagina resta aperta.
import { useEffect, useSyncExternalStore } from 'react';
import { fromYmd, occurrencesOn, ymd, type AgendaItem } from './agenda';
import { t } from '../i18n';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

const api = typeof window !== 'undefined' && 'Notification' in window ? window.Notification : null;
const read = (): PermissionState => (!api ? 'unavailable' : api.permission === 'granted' ? 'granted' : api.permission === 'denied' ? 'denied' : 'undetermined');

let state: PermissionState = read();
const listeners = new Set<() => void>();
const set = (s: PermissionState) => {
  state = s;
  listeners.forEach((l) => l());
};

export async function refreshReminders() {
  set(read());
}

export async function enableReminders() {
  if (!api || state === 'denied') return;
  await api.requestPermission();
  set(read());
}

export function useReminderPermission() {
  useEffect(() => {
    refreshReminders();
  }, []);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

let timers: ReturnType<typeof setTimeout>[] = [];

/** Avvisi che scattano oggi o domani: i timer del browser non sopravvivono alla chiusura della pagina. */
export async function syncReminders(agenda: AgendaItem[]) {
  timers.forEach(clearTimeout);
  timers = [];
  if (state !== 'granted' || !api) return;
  const now = Date.now();
  for (let d = 0; d < 9; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    for (const o of occurrencesOn(agenda, ymd(day))) {
      if (o.alert === undefined) continue;
      // Senza orario l'impegno conta dalle 9 del mattino.
      const at = fromYmd(o.date);
      at.setHours(o.start ? Number(o.start.slice(0, 2)) : 9, o.start ? Number(o.start.slice(3, 5)) : 0, 0, 0);
      at.setMinutes(at.getMinutes() - o.alert);
      const wait = at.getTime() - now;
      if (wait <= 0 || wait > 2 * 86400000) continue;
      timers.push(setTimeout(() => new api(o.title, { body: `${t.agenda.alerts.lead(o.alert!)} · ${o.start ? t.agenda.reminders.body(o.start, o.end, o.meta) : o.meta ?? ''}` }), wait));
    }
  }
}
