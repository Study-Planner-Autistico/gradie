import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="attivita" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profilo" />
    </Tabs>
  );
}
