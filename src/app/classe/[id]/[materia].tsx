import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirm, notify } from '../../../components/dialogs';
import { success, tap } from '../../../components/haptics';
import { Icon, type IconName } from '../../../components/icons';
import { Avatar } from '../../../components/avatar/Avatar';
import { clock, dayLabel, sameDay } from '../../../components/chat';
import { ListGroup, ListRow } from '../../../components/list';
import { avatarFor, PeopleCarousel, type CarouselPerson } from '../../../components/PeopleCarousel';
import { Button, Card, Chip, EmptyState, PlaceholderScreen } from '../../../components/ui';
import { demoAssignments, demoClassChat, demoClassDocs, demoClasses, type DemoAssignment, type DemoClass } from '../../../data/demo';
import { locale, t } from '../../../i18n';
import { addClassDoc, removeClassDoc, roomKey, sendClassMessage, submitWork, unsubmitWork, useClassroom, type ClassFile, type ClassMessage } from '../../../state/classroom';
import { findPerson, friendsOf, useFriends } from '../../../state/friends';
import { useTheme } from '../../../theme';

const DAY = 86_400_000;

/** Icona del file dall'estensione. */
function fileIcon(name: string): IconName {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'word';
  if (ext === 'ppt' || ext === 'pptx') return 'ppt';
  if (['jpg', 'jpeg', 'png', 'heic', 'gif', 'webp'].includes(ext)) return 'image-outline';
  return 'document-outline';
}

/** "oggi", "ieri", "3 giorni fa". */
const ago = (days: number) => (days <= 0 ? t.classroom.today : days === 1 ? t.classroom.yesterday : t.classroom.daysAgo(days));
const daysSince = (at: number) => Math.floor((Date.now() - at) / DAY);

/** Sceglie un file qualsiasi dal telefono; il file resta nella cache dell'app (dec. 53). */
async function pickFile() {
  const res = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.[0]) return undefined;
  const file = res.assets[0];
  if (file.size === 0) {
    notify(t.classroom.emptyFile);
    return undefined;
  }
  return { name: file.name, uri: file.uri };
}

async function openFile(f: ClassFile) {
  try {
    await Sharing.shareAsync(f.uri, { dialogTitle: f.name });
  } catch {
    notify(t.importer.openFailed);
  }
}

type Tab = 'docs' | 'work' | 'chat';

/**
 * Pagina di una materia della classe, in stile Classroom (dec. 226-227): in alto il riquadro con classe e materia e
 * le carte dei compagni e del docente, che scorrono senza fine; sotto Documenti (file condivisi per lavorare insieme),
 * Consegne (lavori da inviare al docente) e Chat (di gruppo, con compagni e docente). Si apre dalla scelta della
 * materia (classe/[id]), raggiungibile dal menu laterale (Classi e gruppi) e dal riquadro "La tua classe" della Home.
 */
export default function Classe() {
  const { id, materia } = useLocalSearchParams<{
    id: string;
    materia: string;
  }>();
  const klass = Object.values(demoClasses).find((c) => c.id === id);
  if (!klass || !materia) return <PlaceholderScreen title={t.menu.groups} icon="people-outline" />;
  return <ClassPage klass={klass} subject={materia} />;
}

function ClassPage({ klass, subject }: { klass: DemoClass; subject: string }) {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.classroom;
  const friends = useFriends();
  const store = useClassroom();
  const [tab, setTab] = useState<Tab>('docs');
  const room = roomKey(klass.id, subject);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  // La barra per scrivere sale con la tastiera (come nella chat dei Messaggi).
  const keyboard = useAnimatedKeyboard();
  const kbStyle = useAnimatedStyle(() => ({
    paddingBottom: Platform.OS === 'ios' ? Math.max(keyboard.height.value - insets.bottom, 0) : 0,
  }));

  const people: CarouselPerson[] = [{ id: klass.teacher.id, name: klass.teacher.name, teacher: true }, ...friendsOf(friends).map((f) => ({ id: f.id, name: f.name }))];
  const nameOf = (by: string) => (by === klass.teacher.id ? klass.teacher.name : (findPerson(by)?.name ?? ''));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          minHeight: 52,
          marginTop: spacing.xs,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={T.back}
          style={({ pressed }) => ({
            width: layout.iconButton,
            height: layout.iconButton,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]}>
          {t.menu.groups}
        </Text>
        <View style={{ width: layout.iconButton }} />
      </View>

      <Animated.View style={[{ flex: 1 }, kbStyle]}>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => tab === 'chat' && scroll.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl,
            gap: spacing.lg,
            maxWidth: 720,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          {/* Riquadro della classe, come l'intestazione di Classroom: al posto dell'illustrazione le carte delle persone. */}
          <View
            style={{
              backgroundColor: colors.selected,
              borderRadius: radius.xl,
              borderWidth: 2,
              borderBottomWidth: 6,
              borderColor: colors.border,
              overflow: 'hidden',
              paddingTop: spacing.lg,
            }}
          >
            <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xxs }}>
              <Text style={[typography.title1, { color: colors.heading }]} numberOfLines={2}>
                {subject}
              </Text>
              <Text style={[typography.callout, { color: colors.textSecondary }]}>{`${klass.name} · ${klass.detail}`}</Text>
            </View>
            <PeopleCarousel people={people} onPress={(p) => !p.teacher && router.push(`/amico/${p.id}`)} />
            <Text
              style={[
                typography.caption,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  paddingBottom: spacing.md,
                },
              ]}
            >
              {T.dragHint}
            </Text>
          </View>

          {/* Documenti / Consegne / Chat. */}
          <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['docs', 'work', 'chat'] as const).map((k) => {
              const on = tab === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => {
                    tap();
                    setTab(k);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={{
                    flex: 1,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.lg,
                    borderWidth: 2,
                    borderColor: on ? colors.borderFocused : colors.border,
                    backgroundColor: on ? colors.selected : colors.surface,
                  }}
                >
                  <Text
                    style={[
                      typography.overline,
                      {
                        color: on ? colors.selectedText : colors.textSecondary,
                      },
                    ]}
                  >
                    {k === 'docs' ? T.docsTab : k === 'work' ? T.workTab : T.chatTab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'docs' ? (
            <Docs klass={klass} room={room} subject={subject} mine={store.docs[room] ?? []} nameOf={nameOf} />
          ) : tab === 'work' ? (
            <Work klass={klass} room={room} subject={subject} subs={store.submissions[room] ?? {}} />
          ) : (
            <Chat room={room} teacherId={klass.teacher.id} mine={store.chat[room] ?? []} nameOf={nameOf} />
          )}
        </ScrollView>
        {tab === 'chat' && <Composer room={room} />}
      </Animated.View>
    </View>
  );
}

/** Documenti condivisi: i tuoi (si aprono e si tolgono) e quelli di compagni e docente. */
function Docs({ klass, room, subject, mine, nameOf }: { klass: DemoClass; room: string; subject: string; mine: ClassFile[]; nameOf: (by: string) => string }) {
  const { colors, spacing } = useTheme();
  const T = t.classroom;
  const demo = (demoClassDocs[klass.id] ?? []).filter((d) => d.subject === subject);
  return (
    <View style={{ gap: spacing.lg }}>
      <Button
        title={T.upload}
        appearance="primary"
        iconBefore="import"
        onPress={async () => {
          const f = await pickFile();
          if (!f) return;
          addClassDoc(room, f);
          success();
        }}
      />
      {mine.length + demo.length === 0 ? (
        <EmptyState icon="folder-outline" message={T.noDocs} />
      ) : (
        <ListGroup title={T.docsTitle}>
          {mine.map((d) => (
            <ListRow
              key={d.id}
              icon={fileIcon(d.name)}
              label={d.name}
              detail={`${T.you} · ${ago(daysSince(d.at))}`}
              onPress={() => openFile(d)}
              trailing={
                <Pressable
                  onPress={() => confirm(T.removeQ(d.name), T.remove, () => removeClassDoc(room, d.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`${T.remove} ${d.name}`}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Icon name="trash-outline" size={22} color={colors.dangerIcon} />
                </Pressable>
              }
            />
          ))}
          {demo.map((d) => (
            <ListRow key={d.id} icon={fileIcon(d.name)} label={d.name} detail={`${nameOf(d.by)} · ${ago(d.daysAgo)}`} onPress={() => notify(T.demoFile)} />
          ))}
        </ListGroup>
      )}
    </View>
  );
}

/** Consegne: per ogni lavoro la scadenza, lo stato e il tuo file consegnato. */
function Work({ klass, room, subject, subs }: { klass: DemoClass; room: string; subject: string; subs: Record<string, ClassFile> }) {
  const { spacing } = useTheme();
  const list = (demoAssignments[klass.id] ?? []).filter((a) => a.subject === subject);
  if (!list.length) return <EmptyState icon="document-outline" message={t.classroom.noWork} />;
  return (
    <View style={{ gap: spacing.lg }}>
      {list.map((a) => (
        <Assignment key={a.id} classId={room} teacher={klass.teacher.name} a={a} sub={subs[a.id]} />
      ))}
    </View>
  );
}

function Assignment({ classId, teacher, a, sub }: { classId: string; teacher: string; a: DemoAssignment; sub?: ClassFile }) {
  const { colors, typography, spacing } = useTheme();
  const T = t.classroom;
  const [now] = useState(() => Date.now());
  const due = new Date(now + a.dueOffset * DAY).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  const status = sub ? (
    <Chip variant="success" icon="checkmark" label={T.submitted} />
  ) : a.dueOffset < 0 ? (
    <Chip variant="danger" label={T.late} />
  ) : (
    <Chip variant="warning" label={T.toSubmit} />
  );

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <Text style={[typography.title2, { color: colors.text }]}>{a.title}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{T.due(due, teacher)}</Text>
        </View>
        {status}
      </View>
      <Text style={[typography.callout, { color: colors.text }]}>{a.detail}</Text>
      {sub ? (
        <>
          <ListGroup>
            <ListRow icon={fileIcon(sub.name)} label={sub.name} detail={T.sentTo(teacher)} onPress={() => openFile(sub)} />
          </ListGroup>
          <Button title={T.unsubmit} onPress={() => confirm(T.unsubmitQ, T.unsubmit, () => unsubmitWork(classId, a.id))} />
        </>
      ) : (
        <Button
          title={T.addWork}
          appearance="primary"
          iconBefore="attach"
          onPress={async () => {
            const f = await pickFile();
            if (!f) return;
            submitWork(classId, a.id, f);
            success();
          }}
        />
      )}
    </Card>
  );
}

/** Chat di gruppo della materia: i messaggi di esempio di compagni e docente e i tuoi (dec. 227). */
function Chat({ room, teacherId, mine, nameOf }: { room: string; teacherId: string; mine: ClassMessage[]; nameOf: (by: string) => string }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.classroom;
  const [now] = useState(() => Date.now());
  const list = [
    ...(demoClassChat[room] ?? []).map((m) => ({
      id: `d-${m.id}`,
      from: m.from,
      text: m.text,
      at: now - m.minutesAgo * 60_000,
    })),
    ...mine,
  ];
  if (!list.length) return <EmptyState icon="chatbubbles-outline" message={T.noChat} />;
  return (
    <View style={{ gap: spacing.sm }}>
      {list.map((m, i) => {
        const me = m.from === 'me';
        const prev = list[i - 1];
        const newDay = !prev || !sameDay(prev.at, m.at);
        const first = newDay || prev.from !== m.from;
        const teacher = m.from === teacherId;
        return (
          <View key={m.id} style={{ gap: spacing.xs }}>
            {newDay && (
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: spacing.sm,
                  },
                ]}
              >
                {dayLabel(m.at)}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: spacing.sm,
                justifyContent: me ? 'flex-end' : 'flex-start',
              }}
            >
              {!me && (first ? <Avatar config={avatarFor(m.from)} size={32} accessibilityLabel={nameOf(m.from)} /> : <View style={{ width: 32 }} />)}
              <View
                style={{
                  maxWidth: '78%',
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.lg,
                  borderWidth: 2,
                  borderColor: me ? colors.accent : teacher ? colors.accent : colors.border,
                  backgroundColor: me ? colors.accent : colors.surface,
                  gap: spacing.xxs,
                }}
              >
                {!me && first && (
                  <Text
                    style={[
                      typography.caption,
                      {
                        fontWeight: '700',
                        color: teacher ? colors.accent : colors.textSecondary,
                      },
                    ]}
                  >
                    {teacher ? `${nameOf(m.from)} · ${T.teacher}` : nameOf(m.from)}
                  </Text>
                )}
                <Text style={[typography.body, { color: me ? colors.onAccent : colors.text }]}>{m.text}</Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      alignSelf: 'flex-end',
                      color: me ? colors.onAccent : colors.textTertiary,
                    },
                  ]}
                >
                  {clock(m.at)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Barra per scrivere nella chat di gruppo. */
function Composer({ room }: { room: string }) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.classroom;
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    tap();
    sendClassMessage(room, text);
    setText('');
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: insets.bottom + spacing.sm,
        borderTopWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={T.chatPlaceholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        onSubmitEditing={send}
        submitBehavior="blurAndSubmit"
        accessibilityLabel={T.chatPlaceholder}
        style={[
          typography.body,
          {
            flex: 1,
            minHeight: 48,
            maxHeight: 120,
            paddingHorizontal: spacing.lg,
            paddingTop: 13,
            paddingBottom: 13,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.surfaceMuted,
            color: colors.text,
          },
        ]}
      />
      <Pressable
        onPress={send}
        disabled={!text.trim()}
        accessibilityRole="button"
        accessibilityLabel={T.sendA11y}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: text.trim() ? 1 : 0.4,
          backgroundColor: pressed ? colors.accentPressed : colors.accent,
        })}
      >
        <Icon name="send" size={22} color={colors.onAccent} />
      </Pressable>
    </View>
  );
}
