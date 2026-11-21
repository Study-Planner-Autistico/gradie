import { router } from 'expo-router';
import { Text } from 'react-native';
import { LessonCard } from '../../components/LessonCard';
import { TodayHeader } from '../../components/TodayHeader';
import { Card, EmptyState, Screen, SectionHeader } from '../../components/ui';
import { demoLessons, demoUser } from '../../data/demo';
import { t } from '../../i18n';
import { useTheme } from '../../theme';

/** Home: blocchi fissi nell'ordine della dec. 20, non riordinabili (dec. 21). */
export default function Home() {
  const { colors, typography } = useTheme();
  return (
    <Screen>
      <TodayHeader
        firstName={demoUser.firstName}
        lastName={demoUser.lastName}
        onMenu={() => router.push('/menu')}
        onAgenda={() => router.navigate('/agenda')}
        markedDays={[new Date().getDate()]}
      />

      <SectionHeader title={t.home.today} onSeeAll={() => router.navigate('/agenda')} />
      <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.demo}</Text>
      {demoLessons.map((l) => (
        <LessonCard key={l.id} lesson={l} />
      ))}

      <Card>
        <SectionHeader title={t.home.deadlines} />
        <EmptyState icon="flag-outline" message={t.home.emptyDeadlines} />
      </Card>
      <Card>
        <SectionHeader title={t.home.progress} />
        <EmptyState icon="trending-up-outline" message={t.home.emptyProgress} />
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
