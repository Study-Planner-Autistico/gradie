import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionSheet, type SheetAction } from '../../components/ActionSheet';
import { AudioBubble, clock, dayLabel, FileBubble, isOnline, nameOf, NoteBubble, NotePicker, PersonAvatar, RecorderBar, sameDay, Ticks, VideoBubble } from '../../components/chat';
import { success, tap } from '../../components/haptics';
import { Icon } from '../../components/icons';
import { t } from '../../i18n';
import { acceptThread, ASSISTANT, deleteThread, markRead, send, toggleArchived, toggleImportant, toggleMuted, useThreads, useTyping, type Message } from '../../state/messages';
import { useTheme } from '../../theme';

/**
 * Una conversazione (dec. 189), presa dall'esempio: in alto chi è e se è online; bolle mie (viola) e sue (bianche),
 * separate per giorno, con ora e spunte; sotto il campo con allegato, fotocamera e microfono. Il microfono apre la
 * barra del vocale. Con Gradie compaiono le risposte rapide. Chi non è ancora amico arriva come richiesta.
 */
export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.messages;
  const thread = useThreads().find((x) => x.id === id);
  const typing = useTyping(id);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [sheet, setSheet] = useState<'attach' | 'notes' | 'more' | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    if (thread?.unread) markRead(thread.id);
  }, [thread?.unread, thread?.id]);

  if (!thread) return null;
  const assistant = thread.personId === ASSISTANT;
  const name = nameOf(thread.personId);
  const status = recording ? T.recordingStatus : typing ? T.typing : isOnline(thread.personId) ? T.online : T.lastSeen;
  const msgs = thread.messages;
  const lastChoices = msgs[msgs.length - 1]?.choices;

  const sendText = (value = text) => {
    const v = value.trim();
    if (!v) return;
    tap();
    send(thread.id, { text: v });
    setText('');
  };
  // Foto e video: dalla fotocamera (si apre subito, foto o video) o dalla libreria (dec. 190).
  const pick = async (camera: boolean) => {
    tap();
    try {
      const useCamera = camera && Platform.OS !== 'web';
      const perm = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images', 'videos'], quality: 0.7, videoMaxDuration: 120 };
      const res = useCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync({ ...opts, allowsMultipleSelection: true, selectionLimit: 10 });
      if (res.canceled) return;
      for (const a of res.assets) send(thread.id, a.type === 'video' ? { video: a.uri } : { image: a.uri });
    } catch {}
  };
  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
      if (res.canceled) return;
      for (const a of res.assets) send(thread.id, { file: { uri: a.uri, name: a.name, size: a.size ?? undefined } });
    } catch {}
  };
  const confirmDelete = () => {
    const go = () => {
      router.back();
      deleteThread(thread.id);
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`${T.deleteTitle}\n${T.deleteBody}`)) go();
      return;
    }
    Alert.alert(T.deleteTitle, T.deleteBody, [
      { text: T.cancel, style: 'cancel' },
      { text: T.delete, style: 'destructive', onPress: go },
    ]);
  };
  const attachActions: SheetAction[] = [
    { icon: 'image-outline', label: T.attach.media, onPress: () => pick(false) },
    { icon: 'document-outline', label: T.attach.file, onPress: pickFile },
    { icon: 'book-outline', label: T.attach.notes, onPress: () => setTimeout(() => setSheet('notes'), 250) },
  ];
  const moreActions: SheetAction[] = [
    { icon: 'star', label: thread.important ? T.unmarkImportant : T.markImportant, onPress: () => toggleImportant(thread.id) },
    { icon: thread.muted ? 'bell' : 'bell-off', label: thread.muted ? T.unmute : T.mute, onPress: () => toggleMuted(thread.id) },
    ...(assistant ? [] : [{ icon: 'person-circle-outline' as const, label: T.openProfile, onPress: () => router.push({ pathname: '/amico/[id]', params: { id: thread.personId } }) }]),
    {
      icon: 'archive',
      label: thread.archived ? T.unarchive : T.archive,
      onPress: () => {
        toggleArchived(thread.id);
        if (!thread.archived) router.back();
      },
    },
    { icon: 'trash-outline', label: T.deleteChat, danger: true, onPress: () => setTimeout(confirmDelete, 250) },
  ];
  const more = () => {
    tap();
    setSheet('more');
  };
  const iconBtn = ({ pressed }: { pressed: boolean }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.6 : 1 });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Intestazione: indietro, avatar, nome e stato; stella e altre azioni. */}
      {/* Sotto la Dynamic Island e la barra di stato, su iPhone e iPad (dec. 190). */}
      <View style={{ paddingTop: insets.top + spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={T.back} style={iconBtn}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Pressable
          disabled={assistant}
          onPress={() => router.push({ pathname: '/amico/[id]', params: { id: thread.personId } })}
          accessibilityRole={assistant ? undefined : 'button'}
          accessibilityLabel={`${name}, ${status}`}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <PersonAvatar personId={thread.personId} size={40} dot />
          <View style={{ flex: 1 }}>
            <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[typography.caption, { color: recording ? colors.danger : typing || isOnline(thread.personId) ? colors.success : colors.textTertiary }]}>{status}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            tap();
            toggleImportant(thread.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={thread.important ? T.unmarkImportant : T.markImportant}
          accessibilityState={{ selected: thread.important }}
          style={iconBtn}
        >
          <Icon name="star" size={22} color={thread.important ? colors.gold : colors.textTertiary} />
        </Pressable>
        <Pressable onPress={more} accessibilityRole="button" accessibilityLabel={T.more} style={iconBtn}>
          <Icon name="ellipsis-horizontal" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xs }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const next = msgs[i + 1];
          const newDay = !prev || !sameDay(prev.at, m.at);
          const lastOfGroup = !next || next.from !== m.from || !sameDay(next.at, m.at);
          const firstOfGroup = !prev || prev.from !== m.from || newDay;
          return (
            <Fragment key={m.id}>
              {newDay && <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'center', marginVertical: spacing.md }]}>{dayLabel(m.at)}</Text>}
              {firstOfGroup && m.from === 'them' && (
                <Text style={[typography.caption, { color: colors.textTertiary, marginLeft: 44, marginTop: spacing.sm }]}>{name}</Text>
              )}
              <Bubble message={m} personId={thread.personId} showAvatar={lastOfGroup} threadId={thread.id} />
              {lastOfGroup && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', marginLeft: m.from === 'me' ? 0 : 44, marginBottom: spacing.sm }}>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>{clock(m.at)}</Text>
                  {m.from === 'me' && !assistant && <Ticks status={m.status} />}
                </View>
              )}
            </Fragment>
          );
        })}
        {/* Risposte rapide di Gradie, come i pulsanti dell'esempio. */}
        {lastChoices && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginLeft: 44 }}>
            {lastChoices.map((c) => (
              <Pressable
                key={c}
                onPress={() => sendText(c)}
                accessibilityRole="button"
                style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.accent, backgroundColor: pressed ? colors.selected : 'transparent' })}
              >
                <Text style={[typography.callout, { color: colors.selectedText, fontWeight: '600' }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {typing && (
          <View style={{ marginLeft: 44, alignSelf: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface }}>
            <Text style={[typography.body, { color: colors.textTertiary }]}>•••</Text>
          </View>
        )}
      </ScrollView>

      {thread.request ? (
        <View style={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
          <Text style={[typography.headline, { color: colors.text, textAlign: 'center' }]}>{T.requestTitle(name)}</Text>
          <Text style={[typography.callout, { color: colors.textSecondary, textAlign: 'center' }]}>{T.requestBody}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Pressable
              onPress={() => {
                tap();
                router.back();
                deleteThread(thread.id);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({ flex: 1, height: layout.button, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.neutralPressed : colors.surfaceMuted })}
            >
              <Text style={[typography.headline, { color: colors.danger }]}>{T.decline}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                success();
                acceptThread(thread.id);
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({ flex: 1, height: layout.button, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.accentPressed : colors.accent })}
            >
              <Text style={[typography.headline, { color: colors.onAccent }]}>{T.accept}</Text>
            </Pressable>
          </View>
        </View>
      ) : recording ? (
        <View style={{ paddingBottom: insets.bottom, backgroundColor: colors.accent }}>
          <RecorderBar
            onCancel={() => setRecording(false)}
            onSend={(uri, seconds, bars) => {
              setRecording(false);
              send(thread.id, { audio: { uri, seconds, bars } });
            }}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.sm }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', minHeight: 48, paddingLeft: spacing.lg, paddingRight: spacing.xs, borderRadius: 24, backgroundColor: colors.surfaceMuted }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={assistant ? T.askGradie : T.placeholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              accessibilityLabel={assistant ? T.askGradie : T.placeholder}
              style={[typography.body, { flex: 1, color: colors.text, maxHeight: 120, paddingTop: 13, paddingBottom: 13 }]}
            />
            <Pressable
              onPress={() => {
                tap();
                setSheet('attach');
              }}
              accessibilityRole="button"
              accessibilityLabel={T.attachA11y} style={({ pressed }) => ({ width: 40, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>
              <Icon name="attach" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => pick(true)} accessibilityRole="button" accessibilityLabel={T.cameraA11y} style={({ pressed }) => ({ width: 40, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>
              <Icon name="camera" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              if (text.trim()) return sendText();
              tap();
              setRecording(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={text.trim() ? T.sendA11y : T.micA11y}
            style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.accentPressed : colors.accent })}
          >
            <Icon name={text.trim() ? 'send' : 'microphone'} size={22} color={colors.onAccent} />
          </Pressable>
        </View>
      )}
      <ActionSheet visible={sheet === 'attach'} title={T.attach.title} actions={attachActions} onClose={() => setSheet(null)} />
      <ActionSheet visible={sheet === 'more'} title={name} actions={moreActions} onClose={() => setSheet(null)} />
      <ActionSheet visible={sheet === 'notes'} onClose={() => setSheet(null)}>
        <NotePicker
          onSend={(pages) => {
            setSheet(null);
            for (const note of pages) send(thread.id, { note });
          }}
        />
      </ActionSheet>
    </KeyboardAvoidingView>
  );
}

/** Una bolla: mia a destra in viola, sua a sinistra in bianco con l'avatar sull'ultima del gruppo. */
function Bubble({ message: m, personId, showAvatar, threadId }: { message: Message; personId: string; showAvatar: boolean; threadId: string }) {
  const { colors, typography, spacing, radius } = useTheme();
  const mine = m.from === 'me';
  const media = !!(m.image || m.video);
  const body = m.image ? (
    <Image source={{ uri: m.image }} style={{ width: 220, height: 220, borderRadius: radius.lg }} accessibilityLabel={t.messages.photo} />
  ) : m.video ? (
    <VideoBubble uri={m.video} />
  ) : m.file ? (
    <FileBubble file={m.file} mine={mine} />
  ) : m.note ? (
    <NoteBubble note={m.note} mine={mine} onOpen={() => router.push({ pathname: '/pagina-inviata', params: { thread: threadId, msg: m.id } })} />
  ) : m.audio ? (
    <AudioBubble uri={m.audio.uri} seconds={m.audio.seconds} bars={m.audio.bars} mine={mine} />
  ) : (
    <Text style={[typography.body, { color: mine ? colors.onAccent : colors.text }]}>{m.text}</Text>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
      {!mine && <View style={{ width: 36 }}>{showAvatar && <PersonAvatar personId={personId} size={36} />}</View>}
      <View
        style={{
          maxWidth: '78%',
          padding: media ? spacing.xs : spacing.md,
          paddingHorizontal: media ? spacing.xs : spacing.lg,
          borderRadius: radius.xl,
          borderBottomRightRadius: mine && showAvatar ? spacing.xs : radius.xl,
          borderBottomLeftRadius: !mine && showAvatar ? spacing.xs : radius.xl,
          backgroundColor: mine ? colors.accent : colors.surface,
          borderWidth: mine ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        {body}
      </View>
    </View>
  );
}
