import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Glass } from './Glass';
import { TABS } from './tabs';

/**
 * Tab bar flottante in glass, usata solo sul web (DESIGN.md §1).
 * Su iOS e Android si usa NativeTabs (Liquid Glass di sistema su iOS 26).
 */
export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <Glass style={[styles.bar, { borderRadius: radius.pill, shadowColor: colors.shadow }]}>
        {state.routes.map((route, i) => {
          const cfg = TABS.find((x) => x.name === route.name);
          if (!cfg) return null;
          const focused = state.index === i;
          const onPress = () => {
            const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigateToTab(route.key);
          };
          const fg = focused ? colors.accent : colors.textSecondary;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={cfg.label}
              style={[styles.item, { borderRadius: radius.pill, backgroundColor: focused ? colors.surface : 'transparent' }]}
            >
              <Ionicons name={focused ? cfg.iconActive : cfg.icon} size={22} color={fg} />
              <Text style={[typography.caption, { color: fg, fontSize: 10 }]} numberOfLines={1}>
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    padding: 6,
    gap: 2,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  item: { width: 66, height: 54, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
