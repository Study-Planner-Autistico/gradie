import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Card, IconButton, Screen, type IconName } from '../components/ui';
import { t } from '../i18n';
import { useTheme } from '../theme';

// Sidebar per funzioni secondarie (dec. 18-19). Moduli non ancora progettati.
const ITEMS: { label: string; icon: IconName }[] = [
  { label: t.menu.materials, icon: 'folder-outline' },
  { label: t.menu.notes, icon: 'create-outline' },
  { label: t.menu.grades, icon: 'stats-chart-outline' },
  { label: t.menu.messages, icon: 'chatbubbles-outline' },
  { label: t.menu.groups, icon: 'school-outline' },
  { label: t.menu.notifications, icon: 'notifications-outline' },
  { label: t.menu.settings, icon: 'settings-outline' },
];

export default function Menu() {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Screen withTabBar={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={[typography.title1, { color: colors.text, flex: 1 }]}>{t.menu.title}</Text>
        <IconButton icon="close" tone="muted" label={t.a11y.close} onPress={() => router.back()} />
      </View>
      <Card style={{ paddingVertical: spacing.sm, gap: 0 }}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityHint={t.menu.inDesign}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              height: 52,
              gap: spacing.md,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                backgroundColor: colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.label}</Text>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.menu.inDesign}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}
