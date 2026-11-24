// Sul web non ci sono i calendari del telefono (dec. 186): l'importazione si fa da iPhone o iPad.
import type { AgendaItem } from './agenda';

export type DeviceCalendar = { id: string; title: string; color: string; source: string };

export const calendarAvailable = false;

export async function listCalendars(): Promise<DeviceCalendar[] | null> {
  return [];
}

export async function readEvents(_ids: string[]): Promise<AgendaItem[]> {
  return [];
}
