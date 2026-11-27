import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirm, notify } from '../../components/dialogs';
import { success, tap } from '../../components/haptics';
import { Icon, type IconName } from '../../components/icons';
import { ListGroup, ListRow } from '../../components/list';
import { PeopleCarousel, type CarouselPerson } from '../../components/PeopleCarousel';
import { Button, Card, Chip, EmptyState, PlaceholderScreen } from '../../components/ui';
import { demoAssignments, demoClassDocs, demoClasses, type DemoAssignment, type DemoClass } from '../../data/demo';
import { locale, t } from '../../i18n';
import { addClassDoc, removeClassDoc, submitWork, unsubmitWork, useClassroom, type ClassFile } from '../../state/classroom';
import { findPerson, friendsOf, useFriends } from '../../state/friends';
import { useTheme } from '../../theme';

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
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
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

/**
 * Pagina della classe in stile Classroom (dec. 226): in alto il riquadro con il nome e le carte dei compagni e del
 * docente, che scorrono senza fine; sotto Documenti (file condivisi per lavorare insieme) e Consegne (lavori da
 * inviare al docente). Si apre dal menu laterale (Classi e gruppi) e dal riquadro "La tua classe" della Home.
 */
export default function Classe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const klass = Object.values(demoClasses).find((c) => c.id === id);
  if (!klass) return <PlaceholderScreen title={t.menu.groups} icon="people-outline" />;
  return <ClassPage klass={klass} />;
}

function ClassPage({ klass }: { klass: DemoClass }) {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.classroom;
  const friends = useFriends();
  const room = useClassroom();
  const [tab, setTab] = useState<'docs' | 'work'>('docs');

  const people: CarouselPerson[] = [
    { id: klass.teacher.id, name: klass.teacher.name, teacher: true },
    ...friendsOf(friends).map((f) => ({ id: f.id, name: f.name })),
  ];
  const nameOf = (by: string) => (by === klass.teacher.id ? klass.teacher.name : findPerson(by)?.name ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52, marginTop: spacing.xs }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={T.back}
          style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]}>
          {t.menu.groups}
        </Text>
        <View style={{ width: layout.iconButton }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        {/* Riquadro della classe, come l'intestazione di Classroom: al posto dell'illustrazione le carte delle persone. */}
        <View style={{ backgroundColor: colors.selected, borderRadius: radius.xl, borderWidth: 2, borderBottomWidth: 6, borderColor: colors.border, overflow: 'hidden', paddingTop: spacing.lg }}>
          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xxs }}>
            <Text style={[typography.title1, { color: colors.heading }]} numberOfLines={2}>
              {klass.name}
            </Text>
            <Text style={[typography.callout, { color: colors.textSecondary }]}>{klass.detail}</Text>
          </View>
          <PeopleCarousel people={people} onPress={(p) => !p.teacher && router.push(`/amico/${p.id}`)} />
          <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', paddingBottom: spacing.md }]}>{T.dragHint}</Text>
        </View>

        {/* Documenti / Consegne. */}
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['docs', 'work'] as const).map((k) => {
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
                <Text style={[typography.overline, { color: on ? colors.selectedText : colors.textSecondary }]}>{k === 'docs' ? T.docsTab : T.workTab}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'docs' ? (
          <Docs klass={klass} mine={room.docs[klass.id] ?? []} nameOf={nameOf} />
        ) : (
          <Work klass={klass} subs={room.submissions[klass.id] ?? {}} />
        )}
      </ScrollView>
    </View>
  );
}

/** Documenti condivisi: i tuoi (si aprono e si tolgono) e quelli di compagni e docente. */
function Docs({ klass, mine, nameOf }: { klass: DemoClass; mine: ClassFile[]; nameOf: (by: string) => string }) {
  const { colors, spacing } = useTheme();
  const T = t.classroom;
  const demo = demoClassDocs[klass.id] ?? [];
  return (
    <View style={{ gap: spacing.lg }}>
      <Button
        title={T.upload}
        appearance="primary"
        iconBefore="import"
        onPress={async () => {
          const f = await pickFile();
          if (!f) return;
          addClassDoc(klass.id, f);
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
                  onPress={() => confirm(T.removeQ(d.name), T.remove, () => removeClassDoc(klass.id, d.id))}
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
function Work({ klass, subs }: { klass: DemoClass; subs: Record<string, ClassFile> }) {
  const { spacing } = useTheme();
  const list = demoAssignments[klass.id] ?? [];
  if (!list.length) return <EmptyState icon="document-outline" message={t.classroom.noWork} />;
  return (
    <View style={{ gap: spacing.lg }}>
      {list.map((a) => (
        <Assignment key={a.id} classId={klass.id} teacher={klass.teacher.name} a={a} sub={subs[a.id]} />
      ))}
    </View>
  );
}

function Assignment({ classId, teacher, a, sub }: { classId: string; teacher: string; a: DemoAssignment; sub?: ClassFile }) {
  const { colors, typography, spacing } = useTheme();
  const T = t.classroom;
  const [now] = useState(() => Date.now());
  const due = new Date(now + a.dueOffset * DAY).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' });
  const status = sub ? (
    <Chip variant="success" icon="checkmark" label={T.submitted} />
  ) : a.dueOffset < 0 ? (
    <Chip variant="danger" label={T.late} />
  ) : (
    <Chip variant="warning" label={T.toSubmit} />
  );

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
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
