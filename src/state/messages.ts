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
  /** Vocale: file, durata e altezze della forma d'onda (0-1). */
  audio?: { uri?: string; seconds: number; bars: number[] };
  /** Risposte rapide sotto un messaggio di Gradie. */
  choices?: string[];
  /** Messaggio mio visualizzato dall'altro. */
  read?: boolean;
};

export type Thread = {
  id: string;
  /** Amico (id di friends.ts) oppure 'gradie' per l'assistente. */
  personId: string;
  /** Chi ti scrive senza essere tuo amico: finisce in Richieste finché non accetti. */
  request?: boolean;
  important: boolean;
  unread: number;
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
      { id: 'a1', from: 'me', at: ago(DAY + 50), text: M.marco[0], read: true },
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
      { id: 'b2', from: 'me', at: ago(DAY + 190), text: M.sofia[1], read: true },
      { id: 'b3', from: 'them', at: ago(DAY + 185), text: M.sofia[2] },
    ],
  },
  {
    id: 't-f3',
    personId: 'f3',
    important: false,
    unread: 0,
    messages: [{ id: 'c1', from: 'me', at: ago(2 * DAY + 30), text: M.luca[0], read: true }],
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
export const unreadTotal = (list: Thread[]) => list.filter((x) => !x.request).reduce((n, x) => n + x.unread, 0);

export const markRead = (id: string) => patch(id, (x) => (x.unread ? { ...x, unread: 0 } : x));
export const toggleImportant = (id: string) => patch(id, (x) => ({ ...x, important: !x.important }));
export const acceptThread = (id: string) => patch(id, (x) => ({ ...x, request: false }));
export function deleteThread(id: string) {
  threads = threads.filter((x) => x.id !== id);
  emit();
}

/** Manda un messaggio (testo, foto o vocale). L'amico lo "visualizza" poco dopo; Gradie risponde. */
export function send(id: string, msg: Omit<Message, 'id' | 'from' | 'at'>) {
  const mine: Message = { ...msg, id: newId(), from: 'me', at: Date.now() };
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
    setTimeout(() => patch(id, (x) => ({ ...x, messages: x.messages.map((m) => (m.id === mine.id ? { ...m, read: true } : m)) })), 1500);
  }
}

/** Risposte pronte di Gradie, come nell'esempio: richiesta, conferma, poi genera o ricomincia. */
function assistantReply(msg: Omit<Message, 'id' | 'from' | 'at'>): Pick<Message, 'text' | 'choices'> {
  const R = t.messages.gradie;
  if (msg.text === R.generate) return { text: R.generated, choices: [R.newRequest] };
  if (msg.text === R.newRequest) return { text: R.again, choices: t.messages.seed.gradieChoices };
  if (msg.text === R.continueRequest) return { text: R.goOn };
  if (msg.audio) return { text: R.heardAudio, choices: [R.generate, R.newRequest, R.continueRequest] };
  if (msg.image) return { text: R.sawImage, choices: [R.generate, R.newRequest, R.continueRequest] };
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
