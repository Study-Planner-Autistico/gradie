// Pezzi dei Messaggi (dec. 189): avatar, orari, vocale in una bolla, barra di registrazione.
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { t } from '../i18n';
import { findPerson } from '../state/friends';
import { NO_SUBJECT, sheetsOf, sortBooks, sortSheets, useOrder, useSheets, type Sheet } from '../state/notebooks';
import { subjectLook, useSubjectLooks, useSubjects, type NotebookLook } from '../state/subjects';
import { COVER_RATIO } from './coverArt';
import { NotebookCover } from './notebooks';
import { SheetThumb, snapshotOf, ThumbView, type NoteSnapshot } from './SheetThumb';
import { ASSISTANT, ONLINE, type Message } from '../state/messages';
import { useTheme } from '../theme';
import { FriendAvatar } from './FriendAvatar';
import { tap } from './haptics';
import { Icon } from './icons';
import { MascotBadge } from './Mascot';

export const isOnline = (personId: string) => ONLINE.has(personId);

export function nameOf(personId: string) {
  return personId === ASSISTANT ? t.messages.gradie.name : (findPerson(personId)?.name ?? '—');
}

/** Avatar della persona (Gradie: la mascotte), con il pallino verde se è online. */
export function PersonAvatar({ personId, size = 48, dot = false }: { personId: string; size?: number; dot?: boolean }) {
  const { colors } = useTheme();
  const p = findPerson(personId);
  // Pallino dell'online più grande (dec. 190), con il bordo del colore dello sfondo.
  const d = Math.max(14, Math.round(size * 0.32));
  return (
    <View style={{ width: size, height: size }}>
      {personId === ASSISTANT ? (
        <MascotBadge size={size} />
      ) : p ? (
        <FriendAvatar person={p} size={size} />
      ) : (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted }} />
      )}
      {dot && isOnline(personId) && (
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: d, height: d, borderRadius: d / 2, backgroundColor: colors.successIcon, borderWidth: 2, borderColor: colors.bg }} />
      )}
    </View>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');
export const clock = (at: number) => {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const dayDiff = (at: number) => {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(at);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
};
/** Nell'elenco: l'ora se è di oggi, "Ieri", altrimenti la data. */
export function shortWhen(at: number) {
  const d = dayDiff(at);
  if (d === 0) return clock(at);
  if (d === 1) return t.messages.yesterday;
  const x = new Date(at);
  return `${pad(x.getDate())}.${pad(x.getMonth() + 1)}.${x.getFullYear()}`;
}
/** Separatore del giorno nella chat: "Oggi 9:41", "Ieri 9:41", "23.11.2026". */
export function dayLabel(at: number) {
  const d = dayDiff(at);
  if (d === 0) return `${t.messages.today} ${clock(at)}`;
  if (d === 1) return `${t.messages.yesterday} ${clock(at)}`;
  return shortWhen(at);
}
/** "Copia di oggi, 21:38", "Copia di ieri, …", "Copia del 23.11.2026, …" (dec. 192). */
export function copyLabel(at: number) {
  const d = dayDiff(at);
  return d === 0 ? t.messages.copyToday(clock(at)) : d === 1 ? t.messages.copyYesterday(clock(at)) : t.messages.copyOn(shortWhen(at), clock(at));
}
export const sameDay = (a: number, b: number) => dayDiff(a) === dayDiff(b);
export const mmss = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

/** Blu delle spunte "visualizzato" (dec. 190). */
export const READ_BLUE = '#1CB0F6';

/** Spunte (dec. 190): una grigia = inviato, non ancora arrivato; due grigie = arrivato; due blu = visualizzato. */
export function Ticks({ status = 'sent' }: { status?: Message['status'] }) {
  const { colors } = useTheme();
  const c = status === 'read' ? READ_BLUE : colors.textTertiary;
  const label = status === 'read' ? t.messages.read : status === 'delivered' ? t.messages.delivered : t.messages.sent;
  return (
    <View accessible accessibilityLabel={label} style={{ flexDirection: 'row', width: status === 'sent' ? 14 : 20 }}>
      <Icon name="check" size={14} color={c} />
      {status !== 'sent' && (
        <View style={{ position: 'absolute', left: 5 }}>
          <Icon name="check" size={14} color={c} />
        </View>
      )}
    </View>
  );
}

/** Forma d'onda: barre verticali; quelle già ascoltate sono piene. */
function Wave({ bars, progress, color, dim, height = 28 }: { bars: number[]; progress: number; color: string; dim: string; height?: number }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height }}>
      {bars.map((b, i) => (
        <View key={i} style={{ flex: 1, height: Math.max(3, b * height), borderRadius: 2, backgroundColor: i / bars.length < progress ? color : dim }} />
      ))}
    </View>
  );
}

/** Vocale dentro una bolla: play/pausa, forma d'onda e durata. */
export function AudioBubble({ uri, seconds, bars, mine }: { uri?: string; seconds: number; bars: number[]; mine: boolean }) {
  const { colors, typography, spacing } = useTheme();
  const player = useAudioPlayer(uri ?? null);
  const status = useAudioPlayerStatus(player);
  const total = status.duration || seconds;
  const fg = mine ? colors.onAccent : colors.text;
  const toggle = () => {
    tap();
    if (status.playing) return player.pause();
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    if (status.duration > 0 && status.currentTime >= status.duration - 0.05) player.seekTo(0);
    player.play();
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: 220 }}>
      <Pressable
        onPress={toggle}
        disabled={!uri}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? t.messages.pause : t.messages.play}
        style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: mine ? 'rgba(255,255,255,0.22)' : colors.selected }}
      >
        <Icon name={status.playing ? 'pause' : 'play'} size={18} color={mine ? colors.onAccent : colors.selectedText} />
      </Pressable>
      <Wave bars={bars} progress={total ? status.currentTime / total : 0} color={fg} dim={mine ? 'rgba(255,255,255,0.45)' : colors.borderBold} />
      <Text style={[typography.caption, { color: fg, fontVariant: ['tabular-nums'] }]}>{mmss(status.playing ? status.currentTime : total)}</Text>
    </View>
  );
}

/**
 * Barra del vocale, al posto del campo di testo (come nell'esempio): onda dal vivo, tempo, cestino, pausa, invia.
 * Parte subito a registrare; `onStatus` dice alla chat se si sta registrando.
 */
export function RecorderBar({ onCancel, onSend }: { onCancel: () => void; onSend: (uri: string, seconds: number, bars: number[]) => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 120);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const levels = useRef<number[]>([]);
  const [, redraw] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) return setError(t.messages.micDenied);
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
      } catch {
        setError(t.messages.failed);
      }
    })();
    return () => {
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Un livello ogni aggiornamento: dal microfono (dB), o un'onda finta dove il livello non c'è (web).
  useEffect(() => {
    if (!state.isRecording) return;
    const db = state.metering;
    const v = typeof db === 'number' ? Math.min(1, Math.max(0.08, (db + 55) / 55)) : 0.25 + Math.abs(Math.sin(levels.current.length / 2.3)) * 0.6;
    levels.current = [...levels.current, v].slice(-400);
    redraw((n) => n + 1);
  }, [state.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps

  const seconds = state.durationMillis / 1000;
  const shown = levels.current.slice(-44);
  const bars = [...Array(Math.max(0, 44 - shown.length)).fill(0.06), ...shown];

  const stopAnd = async (send: boolean) => {
    tap();
    try {
      if (state.isRecording || paused) await recorder.stop();
    } catch {}
    if (!send) return onCancel();
    if (!recorder.uri) return setError(t.messages.failed);
    // Forma d'onda della bolla: 32 barre prese da tutta la registrazione.
    const all = levels.current.length ? levels.current : [0.3];
    const out = Array.from({ length: 32 }, (_, i) => all[Math.floor((i / 32) * all.length)] ?? 0.3);
    onSend(recorder.uri, seconds, out);
  };

  const btn = { width: 48, height: 48, borderRadius: 24, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ backgroundColor: colors.accent, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.lg, gap: spacing.md }}>
      <Text style={[typography.caption, { color: colors.onAccent, opacity: 0.85 }]}>{error ?? t.messages.recording}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Wave bars={bars} progress={1} color={colors.onAccent} dim={colors.onAccent} height={36} />
        <Text style={[typography.headline, { color: colors.onAccent, fontVariant: ['tabular-nums'] }]}>{mmss(seconds)}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => stopAnd(false)} accessibilityRole="button" accessibilityLabel={t.messages.discard} style={btn}>
          <Icon name="trash-outline" size={26} color={colors.onAccent} />
        </Pressable>
        <Pressable
          onPress={() => {
            tap();
            if (paused) {
              recorder.record();
              setPaused(false);
            } else {
              recorder.pause();
              setPaused(true);
            }
          }}
          disabled={!!error}
          accessibilityRole="button"
          accessibilityLabel={paused ? t.messages.resumeRec : t.messages.pauseRec}
          style={{ ...btn, backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Icon name={paused ? 'microphone' : 'pause'} size={26} color={colors.onAccent} />
        </Pressable>
        <Pressable onPress={() => stopAnd(true)} disabled={!!error} accessibilityRole="button" accessibilityLabel={t.messages.sendVoice} style={{ ...btn, backgroundColor: colors.onAccent }}>
          <Icon name="send" size={24} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

/** Video in una bolla: si guarda lì, con i comandi del sistema (dec. 190). */
export function VideoBubble({ uri }: { uri: string }) {
  const { radius } = useTheme();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView player={player} nativeControls contentFit="cover" style={{ width: 240, height: 180, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000' }} />;
}

const size = (b?: number) => (b == null ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/** File in una bolla: icona, nome e dimensione; un tocco lo apre. */
export function FileBubble({ file, mine }: { file: NonNullable<Message['file']>; mine: boolean }) {
  const { colors, typography, spacing, radius } = useTheme();
  const fg = mine ? colors.onAccent : colors.text;
  return (
    <Pressable
      onPress={() => {
        tap();
        if (Platform.OS === 'web') window.open(file.uri, '_blank');
        else Linking.openURL(file.uri).catch(() => {});
      }}
      accessibilityRole="button"
      accessibilityLabel={`${t.messages.file}: ${file.name}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: 230 }}
    >
      <View style={{ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: mine ? 'rgba(255,255,255,0.22)' : colors.selected }}>
        <Icon name="document-outline" size={24} color={mine ? colors.onAccent : colors.selectedText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.callout, { color: fg, fontWeight: '600' }]} numberOfLines={2}>
          {file.name}
        </Text>
        {!!file.size && <Text style={[typography.caption, { color: fg, opacity: 0.8 }]}>{size(file.size)}</Text>}
      </View>
    </Pressable>
  );
}

/**
 * Pagina degli Appunti in una bolla (dec. 191, 192): la copia com'era all'invio, non la pagina viva. Le modifiche fatte
 * dopo (da chi l'ha mandata o da altri) non arrivano. Anteprima, mini copertina del quaderno, materia, titolo e ora della copia.
 */
export function NoteBubble({ note, mine, onOpen }: { note: NonNullable<Message['note']>; mine: boolean; onOpen: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const fg = mine ? colors.onAccent : colors.text;
  const W = 64;
  const H = Math.round(W * 1.32);
  return (
    <Pressable
      onPress={() => {
        tap();
        onOpen();
      }}
      accessibilityRole="button"
      accessibilityLabel={t.messages.openNote(note.title)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: 236 }}
    >
      <View style={{ width: W, height: H, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: mine ? 'rgba(255,255,255,0.5)' : colors.border, backgroundColor: '#FFFFFF' }}>
        <ThumbView snap={note} width={W} height={H} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {note.look && (
            <View style={{ width: 16, height: Math.round(16 / COVER_RATIO), borderRadius: 2, overflow: 'hidden' }}>
              <NotebookCover look={note.look} name="" width={16} height={Math.round(16 / COVER_RATIO)} />
            </View>
          )}
          <Text style={[typography.caption, { flex: 1, color: fg, opacity: 0.85 }]} numberOfLines={1}>
            {note.subject || t.messages.otherSheets}
          </Text>
        </View>
        <Text style={[typography.callout, { color: fg, fontWeight: '600' }]} numberOfLines={2}>
          {note.title}
        </Text>
        <Text style={[typography.caption, { color: fg, opacity: 0.75 }]}>{copyLabel(note.at)}</Text>
      </View>
      <Icon name="chevron-forward" size={18} color={fg} />
    </Pressable>
  );
}

/**
 * Scelta delle pagine degli Appunti da mandare (dec. 190, 191): prima i quaderni, con le stesse copertine e lo stesso
 * ordine di Appunti; poi le pagine del quaderno con la loro anteprima. Tutto letto dagli Appunti in tempo reale.
 * Se ne possono scegliere più di una; "Invia" le manda tutte.
 */
export function NotePicker({ onSend }: { onSend: (pages: NoteSnapshot[]) => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.messages;
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const order = useOrder();
  const [w, setW] = useState(0);
  const [subject, setSubject] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);

  type Book = { subject: string; label: string; look: NotebookLook; count: number; lastEdit: number };
  const bookOf = (s: string, label: string, look: NotebookLook): Book => {
    const list = sheetsOf(sheets, s);
    return { subject: s, label, look, count: list.length, lastEdit: Math.max(0, ...list.map((x) => x.at)) };
  };
  const books = sortBooks(
    subjects.map((s, i) => bookOf(s, s, subjectLook(looks, s, i))),
    order.books,
  );
  const others = sheetsOf(sheets, NO_SUBJECT).length ? bookOf(NO_SUBJECT, T.otherSheets, { theme: 'polka', color: 'lilac' }) : null;
  const all = others ? [...books, others] : books;
  const book = all.find((b) => b.subject === subject);
  const pages = subject ? sortSheets(sheetsOf(sheets, subject), subject, [], order) : [];

  // Tre per riga come una mensola; su iPad quattro.
  const gap = spacing.md;
  const cols = w >= 480 ? 4 : 3;
  const cw = w > 0 ? (w - gap * (cols - 1)) / cols : 0;
  const bookH = Math.round(cw / COVER_RATIO);
  const pageH = Math.round(cw * 1.32);

  return (
    <View style={{ flexShrink: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 44 }}>
        {subject ? (
          <Pressable onPress={() => (setSubject(null), setChosen([]))} accessibilityRole="button" accessibilityLabel={T.back} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
        <Text accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]} numberOfLines={1}>
          {book ? book.label : T.pickSubject}
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {cw > 0 &&
            !subject &&
            all.map((b) => (
              <Pressable
                key={b.subject}
                onPress={() => {
                  tap();
                  setSubject(b.subject);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${b.label}, ${T.pagesCount(b.count)}`}
                style={({ pressed }) => ({ width: cw, gap: spacing.xs, opacity: pressed ? 0.7 : 1 })}
              >
                <View style={{ borderRadius: radius.md, overflow: 'hidden' }}>
                  <NotebookCover look={b.look} name={b.label} width={cw} height={bookH} />
                </View>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>{T.pagesCount(b.count)}</Text>
              </Pressable>
            ))}
          {cw > 0 && subject && pages.length === 0 && (
            <Text style={[typography.callout, { color: colors.textTertiary, paddingVertical: spacing.xl }]}>{T.noPages}</Text>
          )}
          {cw > 0 &&
            subject &&
            pages.map((p) => {
              const on = chosen.includes(p.id);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    tap();
                    setChosen((c) => (on ? c.filter((x) => x !== p.id) : [...c, p.id]));
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={p.title}
                  style={{ width: cw, gap: spacing.xs }}
                >
                  <View style={{ borderRadius: radius.md, overflow: 'hidden', borderWidth: on ? 3 : 1, borderColor: on ? colors.accent : colors.border, backgroundColor: '#FFFFFF' }}>
                    <SheetThumb sheet={p} width={cw - (on ? 6 : 2)} height={pageH - (on ? 6 : 2)} />
                    <View style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? colors.accent : '#FFFFFF', backgroundColor: on ? colors.accent : 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <Icon name="check" size={14} color={colors.onAccent} />}
                    </View>
                  </View>
                  <Text style={[typography.caption, { color: colors.text, fontWeight: '600' }]} numberOfLines={2}>
                    {p.title}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>
      {subject && (
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <Pressable
            disabled={!chosen.length}
            onPress={() => {
              tap();
              // Copia fissa di ogni pagina, presa adesso (dec. 192).
              onSend(pages.filter((p) => chosen.includes(p.id)).map((p) => snapshotOf(p, book?.look)));
            }}
            accessibilityRole="button"
            style={({ pressed }) => ({ height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: !chosen.length ? colors.surfaceMuted : pressed ? colors.accentPressed : colors.accent })}
          >
            <Text style={[typography.headline, { color: chosen.length ? colors.onAccent : colors.textDisabled }]}>{T.sendPages(chosen.length)}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
