import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { EventRow, KIND_ICON } from '../../components/agenda';
import { Avatar, Card, Chip, EmptyState, GradientCard, Screen, ScreenHeader, SectionHeader, IconButton } from '../../components/ui';
import { demoAgenda, demoGrades, demoUser } from '../../data/demo';
import { locale, t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { useTheme } from '../../theme';

function greeting(h: number) {
  if (h < 13) return t.greeting.morning;
  if (h < 18) return t.greeting.afternoon;
  return t.greeting.evening;
}

/** Home: blocchi fissi nell'ordine della dec. 20, non riordinabili (dec. 21). DESIGN.md §6. */
export default function Home() {
  const { colors, typography, spacing } = useTheme();
  const { active } = useEnvironment();
  const now = new Date();
  const today = demoAgenda.filter((i) => i.dayOffset === 0);
  const lessons = today.filter((i) => i.kind === 'lesson').length;
  const deadlines = demoAgenda.filter((i) => i.kind === 'activity');

  return (
    <Screen>
      <ScreenHeader
        compact
        left={
          <Pressable onPress={() => router.push('/ambienti')} accessibilityRole="button" accessibilityLabel={t.a11y.switchEnv}>
            <Avatar firstName={demoUser.firstName} lastName={demoUser.lastName} />
          </Pressable>
        }
        title={`${greeting(now.getHours())}, ${demoUser.firstName}`}
        subtitle={active.name}
        right={
          <>
            <IconButton icon="notifications-outline" label={t.a11y.notifications} />
            <IconButton icon="grid-outline" label={t.a11y.openMenu} onPress={() => router.push('/menu')} />
          </>
        }
      />

      {/* Riepilogo di oggi: unica card a gradiente della schermata */}
      <GradientCard>
        <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'capitalize' }]}>
          {`${now.toLocaleDateString(locale, { weekday: 'long' })} · ${now.toLocaleDateString(locale, { month: 'long' })}`}
        </Text>
        <Text style={[typography.hero, { color: colors.text }]}>{now.getDate()}</Text>
        <Text style={[typography.body, { color: colors.text }]}>{t.home.summary(lessons, today.length - lessons)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {today[0]?.start && (
            <Chip variant="glass" icon="time-outline" label={`${t.home.nextUp}: ${today[0].title} · ${today[0].start}`} />
          )}
          <Chip variant="glass" icon="school-outline" label={active.detail} />
        </View>
      </GradientCard>

      <Card>
        <SectionHeader title={t.home.today} action={t.home.seeAll} onAction={() => router.navigate('/agenda')} />
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: -spacing.sm }]}>{t.demo}</Text>
        {today.length === 0 ? (
          <EmptyState icon="sunny-outline" message={t.home.emptyToday} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {today.map((item) => (
              <EventRow key={item.id} item={item} />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <SectionHeader title={t.home.deadlines} />
        {deadlines.length === 0 ? (
          <EmptyState icon="flag-outline" message={t.home.emptyDeadlines} />
        ) : (
          deadlines.map((d) => (
            <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name={KIND_ICON.activity} size={18} color={colors.tints.activity.fg} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text }]}>{d.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{d.meta}</Text>
              </View>
              <Chip
                tint="activity"
                label={d.dayOffset === 1 ? t.agenda.tomorrow : t.agenda.inDays(d.dayOffset)}
              />
            </View>
          ))
        )}
      </Card>

      <Card>
        <SectionHeader title={t.home.progress} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.home.average}</Text>
            <Text style={[typography.display, { color: colors.text }]}>{demoGrades.average}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.home.gradesCount(demoGrades.count)}</Text>
          </View>
          <Chip variant="muted" icon="lock-closed-outline" label={t.home.privateGrades} />
        </View>
      </Card>

      <Card>
        <SectionHeader title={t.home.recent} />
        <EmptyState icon="time-outline" message={t.home.emptyRecent} />
      </Card>

      <Card>
        <SectionHeader title={t.home.community} />
        <EmptyState icon="people-outline" message={t.home.emptyCommunity} />
      </Card>
    </Screen>
  );
}
