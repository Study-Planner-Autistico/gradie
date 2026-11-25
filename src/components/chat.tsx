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
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { t } from '../i18n';
import { findPerson } from '../state/friends';
import { NO_SUBJECT, useSheets, type Sheet } from '../state/notebooks';
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
export const sameDay = (a: number, b: number) => dayDiff(a) === dayDiff(b);
export const mmss = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

/** Blu delle spunte "visualizzato" (dec. 190). */
export const READ_BLUE = '#1D9BF0';

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

/** Pagina degli Appunti in una bolla: copertina, titolo e materia; un tocco la apre nella lavagna. */
export function NoteBubble({ note, mine }: { note: NonNullable<Message['note']>; mine: boolean }) {
  const { colors, typography, spacing, radius } = useTheme();
  const fg = mine ? colors.onAccent : colors.text;
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push(`/lavagna/${note.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={t.messages.openNote(note.title)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: 230 }}
    >
      <View style={{ width: 44, height: 56, borderRadius: radius.sm, backgroundColor: note.cover ?? colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: mine ? 'rgba(255,255,255,0.5)' : colors.border }}>
        <Icon name="book-outline" size={20} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: fg, opacity: 0.8 }]} numberOfLines={1}>
          {note.subject || t.messages.notes}
        </Text>
        <Text style={[typography.callout, { color: fg, fontWeight: '600' }]} numberOfLines={2}>
          {note.title}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={fg} />
    </Pressable>
  );
}

/**
 * Scelta delle pagine degli Appunti da mandare (dec. 190): prima la materia (il quaderno), poi le pagine.
 * Se ne possono scegliere più di una; "Invia" le manda tutte.
 */
export function NotePicker({ onSend }: { onSend: (pages: Sheet[]) => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.messages;
  const sheets = useSheets();
  const subjects = useMemo(() => {
    const map = new Map<string, Sheet[]>();
    for (const s of sheets) {
      const k = s.subject || NO_SUBJECT;
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()].sort((a, b) => (a[0] === NO_SUBJECT ? 1 : b[0] === NO_SUBJECT ? -1 : a[0].localeCompare(b[0])));
  }, [sheets]);
  const [subject, setSubject] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const pages = subject ? (subjects.find(([k]) => k === subject)?.[1] ?? []) : [];
  const label = (k: string) => (k === NO_SUBJECT ? T.otherSheets : k);

  const row = (key: string, children: ReactNode, onPress: () => void, a11y: string, selected?: boolean) => (
    <Pressable
      key={key}
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole={selected === undefined ? 'button' : 'checkbox'}
      accessibilityState={selected === undefined ? undefined : { checked: selected }}
      accessibilityLabel={a11y}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 60, paddingHorizontal: spacing.xl, backgroundColor: pressed ? colors.surfaceMuted : 'transparent' })}
    >
      {children}
    </Pressable>
  );

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
          {subject ? label(subject) : T.pickSubject}
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView style={{ flexShrink: 1 }}>
        {!subject &&
          subjects.map(([k, list]) =>
            row(
              k,
              <>
                <View style={{ width: 40, height: 50, borderRadius: radius.sm, backgroundColor: list[0]?.cover ?? colors.accent }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.text }]}>{label(k)}</Text>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>{T.pagesCount(list.length)}</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
              </>,
              () => setSubject(k),
              `${label(k)}, ${T.pagesCount(list.length)}`,
            ),
          )}
        {subject &&
          pages.map((p) => {
            const on = chosen.includes(p.id);
            return row(
              p.id,
              <>
                <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: on ? colors.accent : colors.borderBold, backgroundColor: on ? colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Icon name="check" size={16} color={colors.onAccent} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>{p.edited}</Text>
                </View>
              </>,
              () => setChosen((c) => (on ? c.filter((x) => x !== p.id) : [...c, p.id])),
              p.title,
              on,
            );
          })}
      </ScrollView>
      {subject && (
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <Pressable
            disabled={!chosen.length}
            onPress={() => {
              tap();
              onSend(pages.filter((p) => chosen.includes(p.id)));
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
