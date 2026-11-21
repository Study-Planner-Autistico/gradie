import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useTheme } from '../theme';
import type { IconName } from './ui';

// Voci fisse della barra inferiore (dec. 19).
const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: t.tabs.home, icon: 'home-outline', iconActive: 'home' },
  agenda: { label: t.tabs.agenda, icon: 'calendar-outline', iconActive: 'calendar' },
  attivita: { label: t.tabs.activities, icon: 'checkbox-outline', iconActive: 'checkbox' },
  community: { label: t.tabs.community, icon: 'people-outline', iconActive: 'people' },
  profilo: { label: t.tabs.profile, icon: 'person-outline', iconActive: 'person' },
};

/** Tab bar flottante a pill (DESIGN.md §6.4). */
export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors, typography, radius, layout, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          left: layout.tabBarMargin,
          right: layout.tabBarMargin,
          bottom: Math.max(insets.bottom, layout.tabBarMargin),
          height: layout.tabBarHeight,
          borderRadius: radius.xl,
          backgroundColor: colors.tabBar,
          shadowColor: colors.shadow,
          paddingHorizontal: spacing.xs,
        },
      ]}
    >
      {state.routes.map((route, i) => {
        const cfg = TABS[route.name];
        if (!cfg) return null;
        const focused = state.index === i;
        const onPress = () => {
          const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigateToTab(route.key);
        };
        const fg = focused ? colors.onPrimary : colors.tabInactive;
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={cfg.label}
            style={[
              styles.item,
              { borderRadius: radius.lg, backgroundColor: focused ? colors.primary : 'transparent' },
            ]}
          >
            <Ionicons name={focused ? cfg.iconActive : cfg.icon} size={22} color={fg} />
            <Text style={[typography.micro, { color: fg }]} numberOfLines={1}>
              {cfg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  item: { flex: 1, height: 56, marginHorizontal: 2, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
