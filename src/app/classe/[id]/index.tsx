import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionSheet } from '../../../components/ActionSheet';
import { Avatar } from '../../../components/avatar/Avatar';
import { COVER_ART, COVER_RATIO, COVER_SWATCH } from '../../../components/coverArt';
import { confirm } from '../../../components/dialogs';
import { success, tap } from '../../../components/haptics';
import { Icon, type IconName } from '../../../components/icons';
import { NotebookEditor } from '../../../components/notebooks';
import { avatarFor } from '../../../components/PeopleCarousel';
import { Button, PlaceholderScreen, TextField } from '../../../components/ui';
import { demoAssignments, demoClasses, type DemoAssignment, type DemoClass } from '../../../data/demo';
import { locale, t } from '../../../i18n';
import { roomKey, useClassroom } from '../../../state/classroom';
import { CODE_LENGTH, courseLink, createCourse, findCourse, isValidCode, joinCourse, leaveCourse, normalizeCode, useCourses, type Course } from '../../../state/courses';
import { useSettings } from '../../../state/settings';
import { useTheme } from '../../../theme';

const DAY = 86_400_000;

const openCourse = (c: Course, tab?: 'work') => router.push({ pathname: '/classe/[id]/[corso]', params: { id: c.classId, corso: c.code, ...(tab ? { tab } : {}) } });

/**
 * Corsi della classe, come la pagina iniziale di Classroom (dec. 228): in alto le consegne con scadenza vicina, sotto
 * le carte dei corsi. "Aggiungi corso" crea un corso nuovo o iscrive a uno esistente con il suo codice di 6 lettere o
 * cifre; a un corso ci si iscrive solo con il codice o con il link.
 */
export default function CorsiDellaClasse() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const klass = Object.values(demoClasses).find((c) => c.id === id);
  if (!klass) return <PlaceholderScreen title={t.menu.groups} icon="people-outline" />;
  return <Courses klass={klass} />;
}

function Courses({ klass }: { klass: DemoClass }) {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.classroom;
  const all = useCourses();
  const store = useClassroom();
  const [now] = useState(() => Date.now());
  const [listW, setListW] = useState(0);
  const [sheet, setSheet] = useState<null | 'add' | 'create' | 'join'>(null);
  const [menu, setMenu] = useState<Course | null>(null);
  const courses = all.filter((c) => c.classId === klass.id);

  // Consegne non ancora fatte nei tuoi corsi, dalla più vicina.
  const due = courses
    .flatMap((c) =>
      (demoAssignments[klass.id] ?? []).filter((a) => a.subject === c.name && a.dueOffset >= 0 && !store.submissions[roomKey(klass.id, c.code)]?.[a.id]).map((a) => ({ a, c })),
    )
    .sort((x, y) => x.a.dueOffset - y.a.dueOffset)
    .slice(0, 3);

  const gap = spacing.md;
  const cols = listW >= 700 ? 3 : listW >= 330 ? 2 : 1;
  const cardW = listW > 0 ? (listW - gap * (cols - 1)) / cols : 0;
  const panel = { backgroundColor: colors.surface, borderRadius: radius.xxl, borderWidth: 2, borderColor: colors.border, padding: spacing.lg, gap: spacing.md } as const;

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
        <Text accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]} numberOfLines={1}>
          {klass.name}
        </Text>
        <View style={{ width: layout.iconButton }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.lg, maxWidth: 960, width: '100%', alignSelf: 'center' }}>
        {/* Con scadenza recente. */}
        <View style={panel}>
          <Text accessibilityRole="header" style={[typography.title2, { color: colors.text }]}>
            {T.dueSoon}
          </Text>
          {due.length ? (
            due.map(({ a, c }) => <DueRow key={`${c.code}-${a.id}`} a={a} course={c} now={now} />)
          ) : (
            <Text style={[typography.callout, { color: colors.textSecondary }]}>{T.noDueSoon}</Text>
          )}
        </View>

        {/* Corsi. */}
        <View style={panel}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text accessibilityRole="header" style={[typography.title2, { flex: 1, color: colors.text }]}>
              {T.courses}
            </Text>
            <Pressable
              onPress={() => {
                tap();
                setSheet('add');
              }}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, minHeight: 44, opacity: pressed ? 0.6 : 1 })}
            >
              <Icon name="add" size={24} color={colors.accent} />
              <Text style={[typography.headline, { color: colors.accent }]}>{T.addCourse}</Text>
            </Pressable>
          </View>
          <View onLayout={(e) => setListW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
            {cardW > 0 && courses.map((c) => <CourseCard key={c.code} course={c} width={cardW} onMore={() => setMenu(c)} />)}
          </View>
          {!courses.length && <Text style={[typography.callout, { color: colors.textSecondary }]}>{T.noCourses}</Text>}
        </View>
      </ScrollView>

      <ActionSheet
        visible={sheet === 'add'}
        title={T.addCourse}
        onClose={() => setSheet(null)}
        actions={[
          { icon: 'search-outline', label: T.joinCourse, onPress: () => setSheet('join') },
          { icon: 'add-circle-outline', label: T.createCourse, onPress: () => setSheet('create') },
        ]}
      />
      {sheet === 'create' && (
        <NotebookEditor
          title={T.createCourse}
          nameLabel={T.courseName}
          onClose={() => setSheet(null)}
          onSave={(name, look) => {
            const c = createCourse(klass.id, name, look);
            setSheet(null);
            success();
            openCourse(c);
            return undefined;
          }}
        />
      )}
      {sheet === 'join' && <JoinDialog classId={klass.id} onClose={() => setSheet(null)} />}
      <ActionSheet
        visible={!!menu}
        title={menu?.name}
        onClose={() => setMenu(null)}
        actions={
          menu
            ? [
                {
                  icon: 'person-add-outline',
                  label: T.invite,
                  onPress: () => Share.share({ message: T.inviteMessage(menu.name, menu.code, courseLink(menu.code)) }).catch(() => {}),
                },
                {
                  icon: 'trash-outline',
                  label: menu.owner ? T.deleteCourse : T.leaveCourse,
                  danger: true,
                  onPress: () =>
                    confirm(menu.owner ? T.deleteCourseQ(menu.name) : T.leaveCourseQ(menu.name), menu.owner ? T.deleteCourse : T.leaveCourse, () => leaveCourse(menu.code)),
                },
              ]
            : []
        }
      />
    </View>
  );
}

/** Una consegna vicina: titolo, corso e giorno; apre le consegne del corso. */
function DueRow({ a, course, now }: { a: DemoAssignment; course: Course; now: number }) {
  const { colors, typography, spacing, radius } = useTheme();
  const date = new Date(now + a.dueOffset * DAY).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <Pressable
      onPress={() => {
        tap();
        openCourse(course, 'work');
      }}
      accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.6 : 1 })}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: COVER_SWATCH[course.look.color] }}>
        <Icon name="document-text-outline" size={22} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
          {a.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>{`${course.name} · ${date}`}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

/** Carta del corso come in Classroom: in alto la copertina con il nome e il docente, sotto le scorciatoie. */
function CourseCard({ course, width, onMore }: { course: Course; width: number; onMore: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const { plainCovers } = useSettings();
  const T = t.classroom;
  const foot: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'folder-outline', label: T.docsTab, onPress: () => openCourse(course) },
    { icon: 'document-text-outline', label: T.workTab, onPress: () => openCourse(course, 'work') },
    { icon: 'ellipsis-horizontal', label: T.more, onPress: onMore },
  ];
  return (
    <View style={{ width, borderRadius: radius.xl, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
      <Pressable
        onPress={() => {
          tap();
          openCourse(course);
        }}
        accessibilityRole="button"
        accessibilityLabel={course.teacher ? `${course.name}, ${course.teacher.name}` : course.name}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View style={{ height: 104, overflow: 'hidden', backgroundColor: COVER_SWATCH[course.look.color] }}>
          {!plainCovers && (
            // Solo la fantasia della copertina: si taglia via il dorso a sinistra e l'etichetta in alto.
            <Image
              source={COVER_ART[course.look.theme][course.look.color]}
              style={{ position: 'absolute', left: -0.14 * width, top: (-0.55 * 1.14 * width) / COVER_RATIO, width: 1.14 * width, height: (1.14 * width) / COVER_RATIO }}
            />
          )}
          {/* Nome su un'etichetta bianca, come sui quaderni: si legge su ogni fantasia. */}
          <View style={{ position: 'absolute', left: spacing.sm, right: spacing.sm, top: spacing.sm }}>
            <View
              style={{
                alignSelf: 'flex-start',
                maxWidth: '100%',
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xxs,
              }}
            >
              <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
                {course.name}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                {course.teacher?.name ?? T.yourCourse}
              </Text>
            </View>
          </View>
        </View>
        {/* Avatar del docente a cavallo della copertina, come in Classroom. */}
        <View style={{ height: 40 }}>
          {course.teacher && (
            <View style={{ position: 'absolute', right: spacing.md, top: -28, borderRadius: 30, borderWidth: 3, borderColor: colors.surface }}>
              <Avatar config={avatarFor(course.teacher.id)} size={52} />
            </View>
          )}
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 2, borderColor: colors.border, paddingHorizontal: spacing.xs }}>
        {foot.map((f) => (
          <Pressable
            key={f.icon}
            onPress={() => {
              tap();
              f.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${f.label}, ${course.name}`}
            style={({ pressed }) => ({ width: 44, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}
          >
            <Icon name={f.icon} size={22} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Iscriviti con il codice del corso (6 lettere o cifre) o incollando il link d'invito. */
function JoinDialog({ classId, onClose }: { classId: string; onClose: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.classroom;
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | undefined>();
  const found = isValidCode(code) ? findCourse(code) : undefined;
  const join = () => {
    if (!isValidCode(code)) return setErr(T.codeInvalid);
    if (!found) return setErr(T.codeNotFound);
    if (found.course.classId !== classId) return setErr(T.codeOtherClass);
    const c = joinCourse(code);
    if (!c) return setErr(T.codeNotFound);
    success();
    onClose();
    openCourse(c);
  };
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={onClose} accessibilityLabel={t.a11y.close} style={{ flex: 1, backgroundColor: colors.blanket, justifyContent: 'center', padding: spacing.lg }}>
          <Pressable
            style={{
              alignSelf: 'center',
              width: '100%',
              maxWidth: 440,
              borderRadius: radius.lg,
              backgroundColor: colors.surface,
              boxShadow: colors.shadowOverlay,
              padding: spacing.lg,
              gap: spacing.md,
            }}
          >
            <Text accessibilityRole="header" style={[typography.title2, { color: colors.text }]}>
              {T.joinCourse}
            </Text>
            <Text style={[typography.callout, { color: colors.textSecondary }]}>{T.joinHelp}</Text>
            <TextField
              label={T.codeLabel}
              placeholder="AB12CD"
              value={code}
              onChangeText={(v) => {
                setCode(normalizeCode(v));
                setErr(undefined);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={join}
              helper={`${code.length}/${CODE_LENGTH}`}
              error={err}
            />
            {found && !err && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border }}
              >
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: COVER_SWATCH[found.course.look.color] }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.text }]}>{found.course.name}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{found.joined ? T.alreadyJoined : (found.course.teacher?.name ?? '')}</Text>
                </View>
              </View>
            )}
            <Button title={found?.joined ? T.openCourse : T.join} appearance="primary" disabled={code.length !== CODE_LENGTH} onPress={join} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
