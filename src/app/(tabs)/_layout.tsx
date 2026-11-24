import { NativeTabs } from 'expo-router/native-tabs';
import { TABS } from '../../components/tabs';
import { useMenuOpen } from '../../state/menu';
import { useTheme } from '../../theme';

/** iOS/Android: tab bar nativa, solo icone (dec. 161-162). Su iOS 26 è Liquid Glass e non si riduce scorrendo (dec. 123). */
export default function TabsLayout() {
  const { colors } = useTheme();
  // Con il menu della Home aperto la tab bar nativa scende via (non può spostarsi con la Home, dec. 126).
  const menuOpen = useMenuOpen();
  return (
    <NativeTabs tintColor={colors.accent} minimizeBehavior="never" hidden={menuOpen}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label hidden>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={{ default: tab.img, selected: tab.imgActive }} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
