// Calendari del telefono (dec. 186): si scelgono quali importare in Agenda. API "legacy" di expo-calendar,
// l'unica che funziona in Expo Go. Sul web non ci sono calendari (deviceCalendar.web.ts).
import * as Calendar from 'expo-calendar/legacy';
import type { AgendaItem } from './agenda';
import { fromMin, ymd } from './agenda';

export type DeviceCalendar = { id: string; title: string; color: string; source: string };

export const calendarAvailable = true;

/** Chiede il permesso e restituisce i calendari degli eventi; null se il permesso è negato. */
export async function listCalendars(): Promise<DeviceCalendar[] | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;
  const list = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  return list.map((c) => ({ id: c.id, title: c.title, color: c.color, source: c.source?.name ?? '' }));
}

/** Eventi dei calendari scelti da una settimana fa a tre mesi avanti, già nella forma dell'Agenda. */
export async function readEvents(calendarIds: string[]): Promise<AgendaItem[]> {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setMonth(to.getMonth() + 3);
  const events = await Calendar.getEventsAsync(calendarIds, from, to);
  const hm = (d: Date) => fromMin(d.getHours() * 60 + d.getMinutes());
  return events.map((e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    const timed = !e.allDay && start.toDateString() === end.toDateString();
    return {
      id: `cal-${e.calendarId}-${e.id}`,
      kind: 'appointment',
      title: e.title || '—',
      date: ymd(start),
      ...(timed ? { start: hm(start), end: hm(end) } : {}),
      ...(e.location ? { meta: e.location } : {}),
      imported: { calendarId: e.calendarId, eventId: e.id },
    } satisfies AgendaItem;
  });
}
