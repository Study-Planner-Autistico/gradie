// Localizzazione IT/EN (dec. 46). Minimale finché non si sceglie una libreria.
const it = {
  appName: 'Orbita',
  welcome: { claim: 'Tutta la tua vita\ndi studio, in orbita', start: 'Inizia' },
  tabs: { home: 'Home', agenda: 'Agenda', activities: 'Attività', community: 'Community', profile: 'Profilo' },
  greeting: { morning: 'Buongiorno,', afternoon: 'Buon pomeriggio,', evening: 'Buonasera,' },
  home: {
    today: 'Oggi',
    deadlines: 'Prossime scadenze',
    progress: 'Andamento',
    recent: 'Ultime attività',
    community: 'Aggiornamenti Community',
    seeAll: 'Vedi tutto',
    emptyToday: 'Nessuna lezione o impegno oggi',
    emptyDeadlines: 'Nessuna scadenza in arrivo',
    emptyProgress: 'Inserisci i tuoi voti per vedere l’andamento',
    emptyRecent: 'Le tue attività recenti appariranno qui',
    emptyCommunity: 'Gli aggiornamenti della Community appariranno qui',
  },
  lesson: { details: 'Dettagli' },
  menu: {
    title: 'Altro',
    materials: 'Materiali',
    notes: 'Appunti',
    grades: 'Registro voti',
    messages: 'Messaggi',
    groups: 'Classi e gruppi',
    notifications: 'Notifiche',
    settings: 'Impostazioni',
    inDesign: 'In progettazione',
  },
  placeholder: {
    title: 'Modulo in progettazione',
    body: 'Questa sezione verrà definita nelle prossime fasi del progetto.',
  },
  a11y: { openMenu: 'Apri menu', openAgenda: 'Apri agenda', close: 'Chiudi' },
  demo: 'Dati dimostrativi',
};

type Dict = typeof it;

const en: Dict = {
  appName: 'Orbita',
  welcome: { claim: 'Your whole study life,\nin orbit', start: 'Get started' },
  tabs: { home: 'Home', agenda: 'Agenda', activities: 'Tasks', community: 'Community', profile: 'Profile' },
  greeting: { morning: 'Good morning,', afternoon: 'Good afternoon,', evening: 'Good evening,' },
  home: {
    today: 'Today',
    deadlines: 'Upcoming deadlines',
    progress: 'Progress',
    recent: 'Recent activity',
    community: 'Community updates',
    seeAll: 'See all',
    emptyToday: 'No lessons or events today',
    emptyDeadlines: 'No upcoming deadlines',
    emptyProgress: 'Add your grades to see your progress',
    emptyRecent: 'Your recent activity will show up here',
    emptyCommunity: 'Community updates will show up here',
  },
  lesson: { details: 'Details' },
  menu: {
    title: 'More',
    materials: 'Materials',
    notes: 'Notes',
    grades: 'Grades',
    messages: 'Messages',
    groups: 'Classes & groups',
    notifications: 'Notifications',
    settings: 'Settings',
    inDesign: 'In design',
  },
  placeholder: {
    title: 'Module in design',
    body: 'This section will be defined in the next phases of the project.',
  },
  a11y: { openMenu: 'Open menu', openAgenda: 'Open agenda', close: 'Close' },
  demo: 'Demo data',
};

const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale ?? 'it-IT';
export const locale = deviceLocale.toLowerCase().startsWith('en') ? 'en-US' : 'it-IT';
export const t: Dict = locale === 'en-US' ? en : it;
