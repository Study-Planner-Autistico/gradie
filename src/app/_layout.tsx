import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { EnvironmentProvider } from '../state/environment';
import { useTheme } from '../theme';

export default function RootLayout() {
  const { colors } = useTheme();
  return (
    <EnvironmentProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        {/* Su iOS 26 i form sheet hanno il Liquid Glass di sistema (DESIGN.md §1). */}
        <Stack.Screen
          name="ambienti"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true, contentStyle: { backgroundColor: 'transparent' } }}
        />
        <Stack.Screen name="lavagna/[id]" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="nuova-nota" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true }} />
        <Stack.Screen name="menu" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
      </Stack>
    </EnvironmentProvider>
  );
}
