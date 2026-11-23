import { DMSerifDisplay_400Regular, useFonts } from '@expo-google-fonts/dm-serif-display';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppLock } from '../components/AppLock';
import { EnvironmentProvider } from '../state/environment';
import { useTheme } from '../theme';

export default function RootLayout() {
  const { colors } = useTheme();
  // Finché il font non è pronto il giorno usa il font di sistema: niente attesa all'avvio.
  useFonts({ DMSerifDisplay_400Regular });
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
        <Stack.Screen name="impostazioni" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="modifica-profilo" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true }} />
        <Stack.Screen name="avatar" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="avatar-intro" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.62], sheetGrabberVisible: true }} />
        <Stack.Screen name="qr" options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="dati" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="sicurezza" options={{ presentation: 'formSheet', sheetAllowedDetents: [1], sheetGrabberVisible: true }} />
        <Stack.Screen name="password" options={{ presentation: 'formSheet', sheetAllowedDetents: [1], sheetGrabberVisible: true }} />
        <Stack.Screen name="due-passaggi" options={{ presentation: 'formSheet', sheetAllowedDetents: [1], sheetGrabberVisible: true }} />
        <Stack.Screen name="riservatezza" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="scegli" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5], sheetGrabberVisible: true }} />
        <Stack.Screen name="bandiera" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="notifiche" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="classe/[id]" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true }} />
        <Stack.Screen name="messaggi" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="menu"options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
      </Stack>
      <AppLock />
    </EnvironmentProvider>
  );
}
