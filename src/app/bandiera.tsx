import { router } from 'expo-router';
import { Platform, ScrollView, Text, View } from 'react-native';
import { ListGroup, ListRow } from '../components/list';
import { Flag } from '../components/Flag';
import { demoCountries } from '../data/demo';
import { locale, t } from '../i18n';
import { updateProfile, useProfile } from '../state/profile';
import { useTheme } from '../theme';
import { Icon } from '../components/icons';

/** Scelta della bandiera del profilo (dec. 133). */
export default function Bandiera() {
  const { colors, typography, spacing } = useTheme();
  const { country } = useProfile();
  const it = locale.startsWith('it');
  const sorted = [...demoCountries].sort((a, b) => (a.code === 'IT' ? -1 : b.code === 'IT' ? 1 : (it ? a.it : a.en).localeCompare(it ? b.it : b.en)));
  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.title1, { color: colors.heading }]}>{t.profile.chooseCountry}</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t.profile.chooseCountryHint}</Text>
      </View>
      <ListGroup>
        {sorted.map((c) => (
          <ListRow
            key={c.code}
            leading={<Flag code={c.code} width={36} />}
            label={it ? c.it : c.en}
            onPress={() => {
              updateProfile({ country: c.code });
              router.back();
            }}
            trailing={c.code === country ? <Icon name="checkmark-circle" size={24} color={colors.accent} /> : <View style={{ width: 24 }} />}
          />
        ))}
      </ListGroup>
    </ScrollView>
  );
}
