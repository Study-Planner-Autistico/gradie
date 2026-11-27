import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Animated, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { drawerWidth, menuProgress, useMenuOpen } from '../state/menu';
import { useTheme } from '../theme';
import { Glass } from './Glass';
import { TABS } from './tabs';
import { Icon } from './icons';

/**
 * Tab bar flottante in glass, usata solo sul web (DESIGN.md §1), solo icone (dec. 161).
 * Su iOS e Android si usa NativeTabs (Liquid Glass di sistema su iOS 26), che col menu aperto si nasconde.
 * Qui, col menu della Home aperto, la barra si sposta e si scurisce insieme alla Home.
 */
export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const menuOpen = useMenuOpen();
  // Segue la Home quando si apre il menu laterale (dec. 126).
  const shift = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [0, drawerWidth(width)] });
  // Stesso velo nero della Home (SideMenu: 0 → 0.55).
  const dim = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });
  return (
    <Animated.View pointerEvents={menuOpen ? 'none' : 'box-none'} style={[styles.wrap, { bottom: Math.max(insets.bottom, 12), transform: [{ translateX: shift }] }]}>
      <Glass style={[styles.bar, { borderRadius: radius.pill }]}>
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
              style={[styles.item, { borderRadius: radius.pill, backgroundColor: focused ? colors.selected : 'transparent' }]}
            >
              <Icon name={focused ? cfg.iconActive : cfg.icon} size={24} color={fg} strokeWidth={focused ? 2.5 : 2} />
            </Pressable>
          );
        })}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: dim }]} />
      </Glass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    padding: 6,
    gap: 2,
  },
  item: { width: 60, height: 48, alignItems: 'center', justifyContent: 'center' },
});
