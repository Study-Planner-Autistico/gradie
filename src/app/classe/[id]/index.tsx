import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COVER_RATIO } from '../../../components/coverArt';
import { tap } from '../../../components/haptics';
import { Icon } from '../../../components/icons';
import { AddCard, NotebookCover, NotebookEditor } from '../../../components/notebooks';
import { PlaceholderScreen } from '../../../components/ui';
import { demoClasses } from '../../../data/demo';
import { t } from '../../../i18n';
import { addSubject, setSubjectLook, subjectLook, useSubjectLooks, useSubjects } from '../../../state/subjects';
import { useTheme } from '../../../theme';

/**
 * Scelta della materia della classe (dec. 227): prima della pagina della classe si sceglie la materia, con le stesse
 * copertine dei quaderni di Appunti. Il "+" crea una materia nuova, che compare anche fra i quaderni.
 */
export default function MateriaDellaClasse() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.classroom;
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const [listW, setListW] = useState(0);
  const [creating, setCreating] = useState(false);
  const klass = Object.values(demoClasses).find((c) => c.id === id);
  if (!klass) return <PlaceholderScreen title={t.menu.groups} icon="people-outline" />;

  // Due copertine per riga, quattro su iPad e in orizzontale (come in Appunti, dec. 143).
  const gap = spacing.md;
  const cols = listW >= 700 ? 4 : 2;
  const bookW = listW > 0 ? (listW - gap * (cols - 1)) / cols : 0;
  const bookH = Math.round(bookW / COVER_RATIO);
  const open = (materia: string) => {
    tap();
    router.push({
      pathname: '/classe/[id]/[materia]',
      params: { id: klass.id, materia },
    });
  };

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
        <Pressable
          onPress={() => {
            tap();
            setCreating(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={T.newSubject}
          style={({ pressed }) => ({
            width: layout.iconButton,
            height: layout.iconButton,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="add" size={28} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
          gap: spacing.lg,
          maxWidth: 960,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.title1, { color: colors.heading }]} numberOfLines={2}>
            {klass.name}
          </Text>
          <Text style={[typography.callout, { color: colors.textSecondary }]}>{T.chooseSubject}</Text>
        </View>
        <View onLayout={(e) => setListW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {bookW > 0 && (
            <>
              {subjects.map((s, i) => (
                <Pressable
                  key={s}
                  onPress={() => open(s)}
                  accessibilityRole="button"
                  accessibilityLabel={s}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <NotebookCover look={subjectLook(looks, s, i)} name={s} width={bookW} height={bookH} />
                </Pressable>
              ))}
              <AddCard width={bookW} height={bookH} label={T.newSubject} onPress={() => setCreating(true)} />
            </>
          )}
        </View>
      </ScrollView>

      {creating && (
        <NotebookEditor
          onClose={() => setCreating(false)}
          onSave={(name, look) => {
            if (!addSubject(name)) return t.activitiesHub.subjectDup;
            setSubjectLook(name, look);
            setCreating(false);
            return undefined;
          }}
        />
      )}
    </View>
  );
}
