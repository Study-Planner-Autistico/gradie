// Promemoria dell'Agenda (dec. 195): con il permesso delle notifiche, all'inizio di ogni impegno con orario
// arriva una notifica del telefono con il suo titolo, l'orario e l'aula. Notifiche locali di expo-notifications,
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

/** Riprogramma tutte le notifiche dagli impegni con orario dei prossimi 14 giorni. */
export async function syncReminders(agenda: AgendaItem[]) {
  if (state !== 'granted') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  let n = 0;
  for (let d = 0; d < DAYS && n < MAX; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    for (const o of occurrencesOn(agenda, ymd(day))) {
      if (!o.start || n >= MAX) continue;
      const at = fromYmd(o.date);
      at.setHours(Number(o.start.slice(0, 2)), Number(o.start.slice(3, 5)), 0, 0);
      if (at.getTime() <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: o.title, body: t.agenda.reminders.body(o.start, o.end, o.meta) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      });
      n++;
    }
  }
}
