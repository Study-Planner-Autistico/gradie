import { t } from '../i18n';
import type { IconName } from './icons';

// Voci fisse della barra inferiore (dec. 19), solo icona (dec. 161): l'etichetta resta per l'accessibilità.
// `img`/`imgActive`: le stesse icone Hugeicons in PNG per NativeTabs, generate da @hugeicons/core-free-icons
// (tratto 2, scheda attiva 2.5) in assets/tabs (dec. 162).
// `label` è un getter: legge la lingua attuale a ogni render (cambio lingua dalle Impostazioni, dec. 137).
export const TABS = [
  { name: 'home', get label() { return t.tabs.home; }, icon: 'home', iconActive: 'home', img: require('../../assets/tabs/home.png'), imgActive: require('../../assets/tabs/home-active.png') },
  { name: 'agenda', get label() { return t.tabs.agenda; }, icon: 'calendar-outline', iconActive: 'calendar', img: require('../../assets/tabs/agenda.png'), imgActive: require('../../assets/tabs/agenda-active.png') },
  { name: 'attivita', get label() { return t.tabs.activities; }, icon: 'note', iconActive: 'note', img: require('../../assets/tabs/attivita.png'), imgActive: require('../../assets/tabs/attivita-active.png') },
  { name: 'community', get label() { return t.tabs.community; }, icon: 'people-outline', iconActive: 'people', img: require('../../assets/tabs/community.png'), imgActive: require('../../assets/tabs/community-active.png') },
  { name: 'profilo', get label() { return t.tabs.profile; }, icon: 'person-circle-outline', iconActive: 'person-circle', img: require('../../assets/tabs/profilo.png'), imgActive: require('../../assets/tabs/profilo-active.png') },
] as const satisfies readonly { name: string; label: string; icon: IconName; iconActive: IconName; img: number; imgActive: number }[];
