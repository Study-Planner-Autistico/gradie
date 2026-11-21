import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/FloatingTabBar';
import { TABS } from '../../components/tabs';

/** Web: tab bar flottante in glass (blur), perché la tab bar nativa non esiste. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}
