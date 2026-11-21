import { NativeTabs } from 'expo-router/native-tabs';
import { TABS } from '../../components/tabs';
import { useTheme } from '../../theme';

/** iOS/Android: tab bar nativa. Su iOS 26 è Liquid Glass e si riduce scorrendo (DESIGN.md §1, §8). */
export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <NativeTabs tintColor={colors.accent} minimizeBehavior="onScrollDown">
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: tab.sf, selected: tab.sfActive }} md={tab.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
