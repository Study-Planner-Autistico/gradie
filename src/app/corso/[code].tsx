import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { PlaceholderScreen } from '../../components/ui';
import { t } from '../../i18n';
import { findCourse, joinCourse, normalizeCode, type Course } from '../../state/courses';

/**
 * Link d'invito a un corso (gradie://corso/AB12CD, dec. 228): ti iscrive e apre il corso. Senza backend (dec. 53)
 * funziona solo con i corsi dimostrativi e con quelli creati su questo telefono.
 */
export default function InvitoCorso() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const found = findCourse(normalizeCode(code ?? ''));
  if (!found) return <PlaceholderScreen title={t.classroom.codeNotFound} icon="people-outline" />;
  return <Join course={found.course} />;
}

function Join({ course }: { course: Course }) {
  useEffect(() => {
    joinCourse(course.code);
    router.replace({ pathname: '/classe/[id]/[corso]', params: { id: course.classId, corso: course.code } });
  }, [course]);
  return null;
}
