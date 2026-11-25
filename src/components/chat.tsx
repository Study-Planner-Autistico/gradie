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
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { t } from '../i18n';
import { findPerson } from '../state/friends';
import { ASSISTANT } from '../state/messages';
import { useTheme } from '../theme';
import { FriendAvatar } from './FriendAvatar';
import { tap } from './haptics';
import { Icon } from './icons';
import { MascotBadge } from './Mascot';

/** Chi risulta online negli esempi (pallino verde). */
const ONLINE = new Set([ASSISTANT, 'f1', 'f2']);
export const isOnline = (personId: string) => ONLINE.has(personId);

export function nameOf(personId: string) {
  return personId === ASSISTANT ? t.messages.gradie.name : (findPerson(personId)?.name ?? '—');
}

/** Avatar della persona (Gradie: la mascotte), con il pallino verde se è online. */
export function PersonAvatar({ personId, size = 48, dot = false }: { personId: string; size?: number; dot?: boolean }) {
  const { colors } = useTheme();
  const p = findPerson(personId);
  const d = Math.max(10, Math.round(size * 0.26));
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

/** Due spunte: grigie se inviato, viola se visualizzato. */
export function Ticks({ read }: { read?: boolean }) {
  const { colors } = useTheme();
  const c = read ? colors.accent : colors.textTertiary;
  return (
    <View accessibilityLabel={read ? t.messages.read : t.messages.sent} style={{ flexDirection: 'row', width: 20 }}>
      <Icon name="check" size={14} color={c} />
      <View style={{ position: 'absolute', left: 5 }}>
        <Icon name="check" size={14} color={c} />
      </View>
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
