import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { GlassButton } from '../../components/Glass';
import { ListGroup, ListRow } from '../../components/list';
import { Avatar, Chip, GradientCard, Screen, ScreenHeader } from '../../components/ui';
import { demoEnvironments, demoUser } from '../../data/demo';
import { t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { useTheme } from '../../theme';

/** Profilo (modulo 01 §5): account, ambienti, sicurezza, preferenze, privacy e dati. */
export default function Profilo() {
  const { colors, typography, spacing } = useTheme();
  const { active } = useEnvironment();
  return (
    <Screen>
      <ScreenHeader title={t.profile.title} right={<GlassButton icon="settings-outline" label={t.a11y.settings} />} />

      <GradientCard>
        <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm }}>
          <Avatar firstName={demoUser.firstName} lastName={demoUser.lastName} size={80} />
          <Text style={[typography.title2, { color: colors.text }]}>
            {demoUser.firstName} {demoUser.lastName}
          </Text>
          <Text style={[typography.callout, { color: colors.textSecondary }]}>{demoUser.email}</Text>
          <Chip variant="glass" icon="school-outline" label={`${t.profile.activeEnv}: ${active.name}`} />
        </View>
      </GradientCard>

      <ListGroup title={t.profile.account}>
        <ListRow icon="person-outline" label={t.profile.myAccount} detail={t.profile.myAccountDetail} />
        <ListRow
          icon="business-outline"
          label={t.profile.environments}
          detail={t.profile.environmentsDetail(demoEnvironments.length)}
          onPress={() => router.push('/ambienti')}
        />
        <ListRow icon="shield-checkmark-outline" label={t.profile.security} detail={t.profile.securityDetail} />
      </ListGroup>

      <ListGroup title={t.profile.app}>
        <ListRow icon="options-outline" label={t.profile.preferences} detail={t.profile.preferencesDetail} />
        <ListRow icon="document-lock-outline" label={t.profile.privacy} detail={t.profile.privacyDetail} />
      </ListGroup>
    </Screen>
  );
}
