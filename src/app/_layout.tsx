import { Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppLock } from '../components/AppLock';
import { SimulatorInsets } from '../components/SimulatorInsets';
import { UndoToast } from '../components/UndoToast';
import { EnvironmentProvider } from '../state/environment';
import { useTheme } from '../theme';

export default function RootLayout() {
  const { colors } = useTheme();
  // Si aspettano i font (sono nel pacchetto, si caricano subito): senza attesa la Home veniva disegnata
  // col font di sistema e restava così, perché non si ridisegna quando il font arriva.
  const [fontsReady] = useFonts({ Fredoka_600SemiBold, Fredoka_700Bold, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold });
  if (!fontsReady) return null;
  return (
    // Serve a Gesture Handler (Pencil sulla lavagna, dec. 166).
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SimulatorInsets>
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
        <Stack.Screen name="quaderno/[name]" />
        <Stack.Screen name="cestino" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="lavagna/[id]" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="nuova-nota" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true }} />
        <Stack.Screen name="importa" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true }} />
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
        {/* Pagina della classe a tutto schermo, in stile Classroom (dec. 226). */}
        <Stack.Screen name="classe/[id]/index" />
        <Stack.Screen name="classe/[id]/[materia]" />
        <Stack.Screen name="amici" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true }} />
        <Stack.Screen name="aggiungi-amico" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.8, 1], sheetGrabberVisible: true }} />
        <Stack.Screen name="amico/[id]" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.6, 1], sheetGrabberVisible: true }} />
        {/* Messaggi a tutto schermo, come i Direct di Instagram (dec. 189). */}
        <Stack.Screen name="messaggi" />
        <Stack.Screen name="registro-voti" />
        <Stack.Screen name="voti/[materia]" />
        <Stack.Screen name="nuovo-voto" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true }} />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="pagina-inviata" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="menu"options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7, 1], sheetGrabberVisible: true }} />
      </Stack>
      <UndoToast />
      <AppLock />
    </EnvironmentProvider>
    </SimulatorInsets>
    </GestureHandlerRootView>
  );
}
