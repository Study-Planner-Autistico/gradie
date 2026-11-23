import { Platform, ScrollView, Text } from 'react-native';
import { ListGroup, ListRow } from '../components/list';
import { Chip, type IconName } from '../components/ui';
import { t } from '../i18n';
import { useTheme } from '../theme';

// Sidebar per funzioni secondarie (dec. 18-19), in un form sheet. Moduli non ancora progettati.
const ITEMS: { label: string; icon: IconName }[] = [
  { get label() { return t.menu.materials; }, icon: 'folder-outline' },
  { get label() { return t.menu.notes; }, icon: 'create-outline' },
  { get label() { return t.menu.grades; }, icon: 'stats-chart-outline' },
  { get label() { return t.menu.messages; }, icon: 'chatbubbles-outline' },
  { get label() { return t.menu.groups; }, icon: 'people-circle-outline' },
  { get label() { return t.menu.notifications; }, icon: 'notifications-outline' },
];

export default function Menu() {
  const { colors, typography, spacing } = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg }}
    >
      <Text style={[typography.title1, { color: colors.text }]}>{t.menu.title}</Text>
      <ListGroup>
        {ITEMS.map((item) => (
          <ListRow key={item.label} icon={item.icon} label={item.label} trailing={<Chip variant="muted" label={t.menu.inDesign} />} />
        ))}
      </ListGroup>
    </ScrollView>
  );
}
