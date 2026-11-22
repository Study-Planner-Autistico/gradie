import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { t } from '../../i18n';
import { useTheme } from '../../theme';
import { Glass } from '../Glass';

type McIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Adesivi locali: nessun catalogo esterno è stato scelto. */
const STICKERS = ['⭐', '✅', '❗', '❓', '💡', '📌', '📚', '✏️', '🧠', '🎯', '🔥', '❤️', '👍', '😀', '🤔', '🎉'];

export type Picked = { uri: string; width: number; height: number };

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Glass style={{ borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, width: 340, maxWidth: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[typography.headline, { color: colors.text, flex: 1 }]}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.a11y.close}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>
      {children}
    </Glass>
  );
}

function Option({ icon, label, onPress }: { icon: McIcon; label: string; onPress: () => void }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <MaterialCommunityIcons name={icon} size={26} color={colors.text} />
      <Text style={[typography.caption, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Ottavo strumento: foto, adesivi, note aggiuntive, GIF (dalla galleria). */
export function AddPanel({
  onClose,
  onImage,
  onSticker,
  onNote,
}: {
  onClose: () => void;
  onImage: (p: Picked) => void;
  onSticker: (emoji: string) => void;
  onNote: () => void;
}) {
  const { spacing } = useTheme();
  const [stickers, setStickers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setError(t.whiteboard.add.photosDenied);
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    onImage({ uri: a.uri, width: a.width, height: a.height });
  };

  return (
    <Panel title={t.whiteboard.tools.add} onClose={onClose}>
      {stickers ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' }}>
          {STICKERS.map((s) => (
            <Pressable key={s} onPress={() => onSticker(s)} accessibilityRole="button" accessibilityLabel={s} style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 32 }}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Option icon="image-outline" label={t.whiteboard.add.photo} onPress={pick} />
          <Option icon="sticker-emoji" label={t.whiteboard.add.sticker} onPress={() => setStickers(true)} />
          <Option icon="note-text-outline" label={t.whiteboard.add.note} onPress={onNote} />
          <Option icon="file-gif-box" label={t.whiteboard.add.gif} onPress={pick} />
        </View>
      )}
      {error && <ErrorText text={error} />}
    </Panel>
  );
}

function ErrorText({ text }: { text: string }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.caption, { color: colors.danger }]}>{text}</Text>;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Nono strumento: registra un audio e lo mette sulla lavagna. */
export function RecordPanel({ onClose, onDone }: { onClose: () => void; onDone: (uri: string, seconds: number) => void }) {
  const { colors, spacing, typography } = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(0);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((Date.now() - started.current) / 1000), 250);
    return () => clearInterval(id);
  }, [recording]);

  const start = async () => {
    setError(null);
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) return setError(t.whiteboard.audio.micDenied);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      started.current = Date.now();
      setSeconds(0);
      setRecording(true);
    } catch {
      setError(t.whiteboard.audio.failed);
    }
  };

  const stop = async () => {
    try {
      const total = (Date.now() - started.current) / 1000;
      await recorder.stop();
      setRecording(false);
      setSeconds(total);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (recorder.uri) onDone(recorder.uri, total);
      else setError(t.whiteboard.audio.failed);
    } catch {
      setRecording(false);
      setError(t.whiteboard.audio.failed);
    }
  };

  return (
    <Panel title={t.whiteboard.tools.audio} onClose={onClose}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Text style={[typography.title1, { color: colors.text, fontVariant: ['tabular-nums'] }]}>{fmt(seconds)}</Text>
        <Pressable
          onPress={recording ? stop : start}
          accessibilityRole="button"
          accessibilityLabel={recording ? t.whiteboard.audio.stop : t.whiteboard.audio.record}
          style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger }}
        >
          <MaterialCommunityIcons name={recording ? 'stop' : 'microphone'} size={30} color="#FFFFFF" />
        </Pressable>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {recording ? t.whiteboard.audio.recording : t.whiteboard.audio.hint}
        </Text>
      </View>
      {error && <ErrorText text={error} />}
    </Panel>
  );
}

/** Audio sulla lavagna: riproduzione e commento. */
export function AudioPanel({
  uri,
  seconds,
  comment,
  onComment,
  onClose,
}: {
  uri: string;
  seconds: number;
  comment: string;
  onComment: (c: string) => void;
  onClose: () => void;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.play();
  }, [player]);

  const toggle = () => {
    if (status.playing) return player.pause();
    if (status.duration > 0 && status.currentTime >= status.duration - 0.05) player.seekTo(0);
    player.play();
  };

  return (
    <Panel title={t.whiteboard.audio.title} onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={status.playing ? t.whiteboard.audio.pause : t.whiteboard.audio.play}
          style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent }}
        >
          <MaterialCommunityIcons name={status.playing ? 'pause' : 'play'} size={26} color={colors.onAccent} />
        </Pressable>
        <Text style={[typography.time, { color: colors.textSecondary }]}>
          {fmt(status.currentTime)} / {fmt(status.duration || seconds)}
        </Text>
      </View>
      <TextInput
        multiline
        value={comment}
        onChangeText={onComment}
        placeholder={t.whiteboard.audio.comment}
        placeholderTextColor={colors.textTertiary}
        style={[typography.body, { color: colors.text, minHeight: 60, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }]}
      />
    </Panel>
  );
}
