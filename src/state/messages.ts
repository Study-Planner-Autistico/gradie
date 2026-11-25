// Messaggi (dec. 189), come i Direct di Instagram: conversazioni con gli amici, richieste di chi non è ancora amico
// e la chat con Gradie, l'assistente. Stato solo in memoria: nessun backend (dec. 53); Gradie risponde con frasi pronte.
import { useSyncExternalStore } from 'react';
import { t } from '../i18n';

export type Message = {
  id: string;
  from: 'me' | 'them';
  at: number;
  text?: string;
  /** Foto scattata o scelta dalla libreria. */
  image?: string;
  /** Video girato o scelto dalla libreria (dec. 190). */
  video?: string;
  /** File allegato: nome, dimensione in byte e indirizzo. */
  file?: { uri: string; name: string; size?: number };
  /** Pagina degli Appunti condivisa: si apre nella lavagna (dec. 190). */
  note?: { id: string; title: string; subject: string; cover?: string | null };
  /** Vocale: file, durata e altezze della forma d'onda (0-1). */
  audio?: { uri?: string; seconds: number; bars: number[] };
  /** Risposte rapide sotto un messaggio di Gradie. */
  choices?: string[];
  /**
   * Messaggi miei (dec. 190): una spunta grigia = inviato ma non ancora arrivato; due grigie = arrivato;
   * due blu = visualizzato.
   */
  status?: 'sent' | 'delivered' | 'read';
};

export type Thread = {
  id: string;
  /** Amico (id di friends.ts) oppure 'gradie' per l'assistente. */
  personId: string;
  /** Chi ti scrive senza essere tuo amico: finisce in Richieste finché non accetti. */
  request?: boolean;
  important: boolean;
  unread: number;
  /** Silenziata: niente numero sui Direct della Home (dec. 190). */
  muted?: boolean;
  /** Archiviata: sta negli Archiviati, accanto alla ricerca (dec. 190). */
  archived?: boolean;
  messages: Message[];
};

export const ASSISTANT = 'gradie';

let counter = 0;
const newId = () => `m-${Date.now().toString(36)}-${++counter}`;
const ago = (min: number) => Date.now() - min * 60000;
const DAY = 24 * 60;

const M = t.messages.seed;
let threads: Thread[] = [
  {
    id: 't-gradie',
    personId: ASSISTANT,
    important: false,
    unread: 0,
    messages: [{ id: 'g1', from: 'them', at: ago(30), text: M.gradieHello, choices: M.gradieChoices }],
  },
  {
    id: 't-f1',
    personId: 'f1',
    important: false,
    unread: 1,
    messages: [
      { id: 'a1', from: 'me', at: ago(DAY + 50), text: M.marco[0], status: 'read' },
      { id: 'a2', from: 'them', at: ago(12), text: M.marco[1] },
    ],
  },
  {
    id: 't-f2',
    personId: 'f2',
    important: true,
    unread: 0,
    messages: [
      { id: 'b1', from: 'them', at: ago(DAY + 200), text: M.sofia[0] },
      { id: 'b2', from: 'me', at: ago(DAY + 190), text: M.sofia[1], status: 'read' },
      { id: 'b3', from: 'them', at: ago(DAY + 185), text: M.sofia[2] },
    ],
  },
  {
    id: 't-f3',
    personId: 'f3',
    important: false,
    unread: 0,
    messages: [{ id: 'c1', from: 'me', at: ago(2 * DAY + 30), text: M.luca[0], status: 'delivered' }],
  },
  {
    id: 't-f4',
    personId: 'f4',
    important: false,
    unread: 0,
    messages: [{ id: 'd1', from: 'them', at: ago(4 * DAY), text: M.chiara[0] }],
  },
  {
    id: 't-p1',
    personId: 'p1',
    request: true,
    important: false,
    unread: 1,
    messages: [{ id: 'e1', from: 'them', at: ago(90), text: M.giulia[0] }],
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useThreads = () => useSyncExternalStore(subscribe, () => threads);
const patch = (id: string, fn: (t: Thread) => Thread) => {
  threads = threads.map((x) => (x.id === id ? fn(x) : x));
  emit();
};

/** La conversazione con questa persona; se non c'è ancora, la crea vuota. */
export function threadFor(personId: string) {
  const found = threads.find((x) => x.personId === personId);
  if (found) return found.id;
  const id = `t-${personId}`;
  threads = [...threads, { id, personId, important: false, unread: 0, messages: [] }];
  emit();
  return id;
}

export const lastOf = (th: Thread) => th.messages[th.messages.length - 1];
/** Numero sui Direct della Home: messaggi non letti, senza richieste, silenziate e archiviate. */
export const unreadTotal = (list: Thread[]) => list.filter((x) => !x.request && !x.muted && !x.archived).reduce((n, x) => n + x.unread, 0);

export const markRead = (id: string) => patch(id, (x) => (x.unread ? { ...x, unread: 0 } : x));
export const toggleImportant = (id: string) => patch(id, (x) => ({ ...x, important: !x.important }));
/** "Segna come da leggere": torna col numero, come se fosse appena arrivata. */
export const markUnread = (id: string) => patch(id, (x) => ({ ...x, unread: Math.max(1, x.unread) }));
export const toggleMuted = (id: string) => patch(id, (x) => ({ ...x, muted: !x.muted }));
export const toggleArchived = (id: string) => patch(id, (x) => ({ ...x, archived: !x.archived }));
export const acceptThread = (id: string) => patch(id, (x) => ({ ...x, request: false }));
export function deleteThread(id: string) {
  threads = threads.filter((x) => x.id !== id);
  emit();
}

/** Manda un messaggio (testo, foto o vocale). L'amico lo "visualizza" poco dopo; Gradie risponde. */
export function send(id: string, msg: Omit<Message, 'id' | 'from' | 'at'>) {
  const mine: Message = { ...msg, id: newId(), from: 'me', at: Date.now(), status: 'sent' };
  patch(id, (x) => ({ ...x, messages: [...x.messages.map((m) => (m.choices ? { ...m, choices: undefined } : m)), mine] }));
  const th = threads.find((x) => x.id === id);
  if (!th) return;
  if (th.personId === ASSISTANT) {
    setTyping(id, true);
    setTimeout(() => {
      setTyping(id, false);
      patch(id, (x) => ({ ...x, messages: [...x.messages, { id: newId(), from: 'them', at: Date.now(), ...assistantReply(msg) }] }));
    }, 1100);
  } else {
    // Arriva dopo poco; chi è online lo visualizza, chi no lo vedrà più tardi (le spunte restano grigie).
    const set = (status: Message['status']) => patch(id, (x) => ({ ...x, messages: x.messages.map((m) => (m.id === mine.id ? { ...m, status } : m)) }));
    setTimeout(() => set('delivered'), 900);
    if (ONLINE.has(th.personId)) setTimeout(() => set('read'), 2600);
  }
}

/** Chi risulta online negli esempi (pallino verde). */
export const ONLINE = new Set([ASSISTANT, 'f1', 'f2']);

// Esempio di notifica (dec. 190): mezzo minuto dopo l'apertura Sofia scrive, e sui Direct della Home compare il numero.
setTimeout(() => {
  const th = threads.find((x) => x.personId === 'f2');
  if (!th) return;
  patch(th.id, (x) => ({ ...x, unread: x.unread + 1, messages: [...x.messages, { id: newId(), from: 'them', at: Date.now(), text: t.messages.seed.sofiaLater }] }));
}, 30000);

/** Risposte pronte di Gradie, come nell'esempio: richiesta, conferma, poi genera o ricomincia. */
function assistantReply(msg: Omit<Message, 'id' | 'from' | 'at'>): Pick<Message, 'text' | 'choices'> {
  const R = t.messages.gradie;
  if (msg.text === R.generate) return { text: R.generated, choices: [R.newRequest] };
  if (msg.text === R.newRequest) return { text: R.again, choices: t.messages.seed.gradieChoices };
  if (msg.text === R.continueRequest) return { text: R.goOn };
  if (msg.audio) return { text: R.heardAudio, choices: [R.generate, R.newRequest, R.continueRequest] };
  if (msg.image || msg.video || msg.file || msg.note) return { text: R.sawImage, choices: [R.generate, R.newRequest, R.continueRequest] };
  return { text: R.confirm, choices: [R.generate, R.newRequest, R.continueRequest] };
}

// "Sta scrivendo…" di Gradie.
let typing: string[] = [];
const typingListeners = new Set<() => void>();
function setTyping(id: string, on: boolean) {
  typing = on ? [...typing, id] : typing.filter((x) => x !== id);
  typingListeners.forEach((l) => l());
}
export const useTyping = (id: string) =>
  useSyncExternalStore(
    (l) => {
      typingListeners.add(l);
      return () => typingListeners.delete(l);
    },
    () => typing.includes(id),
  );
