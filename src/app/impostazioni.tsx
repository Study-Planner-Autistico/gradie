import { router } from 'expo-router';
import { Platform, ScrollView, Text } from 'react-native';
import { ListGroup, ListRow } from '../components/list';
import { demoEnvironments } from '../data/demo';
import { t } from '../i18n';
import { useEnvironment } from '../state/environment';
import { useTheme } from '../theme';

/** Impostazioni (dall'ingranaggio del Profilo, dec. 133): le voci che prima stavano sotto il profilo (modulo 01 §5). */
export default function Impostazioni() {
  const { colors, typography, spacing } = useTheme();
  const { active } = useEnvironment();
  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg }}
    >
      <Text style={[typography.title1, { color: colors.text }]}>{t.profile.settingsTitle}</Text>
      <ListGroup>
        <ListRow icon="person-outline" label={t.profile.myAccount} detail={t.profile.myAccountDetail} />
        <ListRow
          icon="business-outline"
          label={t.profile.environments}
          detail={`${active.name} · ${t.profile.environmentsDetail(demoEnvironments.length)}`}
          onPress={() => router.push('/ambienti')}
        />
        <ListRow icon="shield-checkmark-outline" label={t.profile.security} detail={t.profile.securityDetail} />
        <ListRow icon="options-outline" label={t.profile.preferences} detail={t.profile.preferencesDetail} />
        <ListRow icon="document-lock-outline" label={t.profile.privacy} detail={t.profile.privacyDetail} />
      </ListGroup>
    </ScrollView>
  );
}
