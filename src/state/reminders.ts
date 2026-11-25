// Promemoria dell'Agenda (dec. 195, 198): con il permesso delle notifiche, per ogni impegno con un avviso arriva
// una notifica del telefono all'ora scelta (all'inizio, 5 minuti prima… 1 settimana prima) con titolo, orario e aula. Notifiche locali di expo-notifications,
// che funzionano anche in Expo Go. Sul web: reminders.web.ts.
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';
import { useEffect, useSyncExternalStore } from 'react';
import { fromYmd, occurrencesOn, ymd, type AgendaItem } from './agenda';
import { t } from '../i18n';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

let state: PermissionState = 'undetermined';
const listeners = new Set<() => void>();
const set = (s: PermissionState) => {
  state = s;
  listeners.forEach((l) => l());
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const toState = (p: Notifications.NotificationPermissionsStatus): PermissionState =>
  p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied';

export async function refreshReminders() {
  try {
    set(toState(await Notifications.getPermissionsAsync()));
  } catch {
    set('unavailable');
  }
}

/** Chiede il permesso; se è già stato negato apre le Impostazioni del telefono, l'unico posto dove cambiarlo. */
export async function enableReminders() {
  if (state === 'denied') return Linking.openSettings();
  try {
    set(toState(await Notifications.requestPermissionsAsync()));
  } catch {
    set('unavailable');
  }
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

/** iOS tiene al massimo 64 notifiche in attesa: si programmano le prossime, giorno per giorno. */
const MAX = 60;
const DAYS = 14;

/** Riprogramma le notifiche degli impegni con un avviso (dec. 198) che scattano nei prossimi 14 giorni. */
export async function syncReminders(agenda: AgendaItem[]) {
  if (state !== 'granted') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  let n = 0;
  // Si guarda una settimana più in là: un avviso "1 settimana prima" può scattare entro i 14 giorni.
  for (let d = 0; d < DAYS + 7 && n < MAX; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    for (const o of occurrencesOn(agenda, ymd(day))) {
      if (n >= MAX) continue;
      if (o.alert === undefined) continue;
      // Senza orario l'impegno conta dalle 9 del mattino.
      const at = fromYmd(o.date);
      at.setHours(o.start ? Number(o.start.slice(0, 2)) : 9, o.start ? Number(o.start.slice(3, 5)) : 0, 0, 0);
      at.setMinutes(at.getMinutes() - o.alert);
      if (at.getTime() <= now || at.getTime() > now + DAYS * 86400000) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: o.title, body: `${t.agenda.alerts.lead(o.alert!)} · ${o.start ? t.agenda.reminders.body(o.start, o.end, o.meta) : o.meta ?? ''}` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      });
      n++;
    }
  }
}
