import { t } from '../i18n';
import type { IconName } from './icons';

// Voci fisse della barra inferiore (dec. 19). Le icone SF/Material sono per NativeTabs.
// `label` è un getter: legge la lingua attuale a ogni render (cambio lingua dalle Impostazioni, dec. 137).
export const TABS = [
  { name: 'home', get label() { return t.tabs.home; }, icon: 'home-outline', iconActive: 'home', sf: 'house', sfActive: 'house.fill', md: 'home' },
  { name: 'agenda', get label() { return t.tabs.agenda; }, icon: 'calendar-outline', iconActive: 'calendar', sf: 'calendar', sfActive: 'calendar', md: 'calendar_month' },
  { name: 'attivita', get label() { return t.tabs.activities; }, icon: 'checkbox-outline', iconActive: 'checkbox', sf: 'checklist', sfActive: 'checklist', md: 'checklist' },
  { name: 'community', get label() { return t.tabs.community; }, icon: 'people-outline', iconActive: 'people', sf: 'person.2', sfActive: 'person.2.fill', md: 'group' },
  { name: 'profilo', get label() { return t.tabs.profile; }, icon: 'person-circle-outline', iconActive: 'person-circle', sf: 'person.crop.circle', sfActive: 'person.crop.circle.fill', md: 'account_circle' },
] as const satisfies readonly { name: string; label: string; icon: IconName; iconActive: IconName; sf: string; sfActive: string; md: string }[];
