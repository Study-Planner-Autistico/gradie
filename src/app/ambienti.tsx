import { router } from 'expo-router';
import { Platform, ScrollView, Text, View } from 'react-native';
import { ListGroup, ListRow } from '../components/list';
import { demoEnvironments } from '../data/demo';
import { t } from '../i18n';
import { useEnvironment } from '../state/environment';
import { useTheme } from '../theme';
import { Icon } from '../components/icons';

/**
 * Selettore ambienti (modulo 01, J5). Form sheet: su iOS 26 lo sfondo è Liquid Glass di sistema,
 * quindi qui lo sfondo resta trasparente su iOS (DESIGN.md §1).
 */
export default function Ambienti() {
  const { colors, typography, spacing } = useTheme();
  const { active, setActive } = useEnvironment();
  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.title1, { color: colors.text }]}>{t.envSwitcher.title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t.envSwitcher.subtitle}</Text>
      </View>
      <ListGroup>
        {demoEnvironments.map((env) => (
          <ListRow
            key={env.id}
            icon={env.kind === 'superiori' ? 'school-outline' : 'library-outline'}
            label={env.name}
            detail={env.detail}
            onPress={() => {
              setActive(env.id);
              router.back();
            }}
            trailing={
              env.id === active.id ? (
                <Icon name="checkmark-circle" size={24} color={colors.accent} accessibilityLabel="Attivo" />
              ) : (
                <View style={{ width: 24 }} />
              )
            }
          />
        ))}
      </ListGroup>
      <ListGroup>
        <ListRow icon="add-circle-outline" label={t.envSwitcher.add} />
      </ListGroup>
    </ScrollView>
  );
}
