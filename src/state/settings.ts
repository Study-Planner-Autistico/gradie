// Impostazioni dell'app (dec. 46 lingua, 48 tema, 56 sicurezza). Solo in memoria: nessun backend né salvataggio
// locale è stato scelto (dec. 53), quindi al riavvio tornano ai valori predefiniti.
import * as LocalAuthentication from 'expo-local-authentication';
import { useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';
import { demoDevices, type DemoDevice } from '../data/demo';
import { setLanguage, type LanguagePref } from '../i18n';

export type ThemePref = 'system' | 'light' | 'dark';

export type SettingsState = {
  language: LanguagePref;
  theme: ThemePref;
  /** Sblocco con Face ID / impronta all'apertura e al ritorno nell'app. */
  biometricLock: boolean;
  /** Preferenza sulle notifiche push; l'invio arriverà con il backend (dec. 53). */
  push: boolean;
  /** Verifica in due passaggi con app di autenticazione (dec. 56). */
  twoFactor: boolean;
  /** Dispositivi ancora collegati; "Esci" li toglie (dati dimostrativi). */
  devices: readonly DemoDevice[];
  /** Copertine dei quaderni a tinta unita, senza fantasie (dec. 145). */
  plainCovers: boolean;
};

// shortcut: per ora l'app parte in italiano e in tema chiaro; tornare a 'system' quando si decide (dec. 149).
const initial: SettingsState = { language: 'it', theme: 'light', biometricLock: false, push: true, twoFactor: false, devices: demoDevices, plainCovers: false };
let state: SettingsState = initial;
// Il tema iniziale passa da Appearance come nei cambi successivi, così lo seguono anche tab bar, sheet e barra di stato.
if (Platform.OS !== 'web') Appearance.setColorScheme(initial.theme === 'system' ? 'unspecified' : initial.theme);
const listeners = new Set<() => void>();

export function updateSettings(patch: Partial<SettingsState>) {
  state = { ...state, ...patch };
  if (patch.language) setLanguage(patch.language);
  // Il tema passa da Appearance così lo seguono anche le parti native (tab bar, sheet, barra di stato).
  if (patch.theme && Platform.OS !== 'web') Appearance.setColorScheme(patch.theme === 'system' ? 'unspecified' : patch.theme);
  listeners.forEach((l) => l());
}

/** Valori iniziali dopo uscita o eliminazione dell'account; lingua e aspetto restano, sono del telefono. */
export function resetAccountSettings() {
  updateSettings({ biometricLock: false, push: initial.push, twoFactor: false, devices: demoDevices });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useSettings() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export const getSettings = () => state;

/** Che sblocco biometrico offre il dispositivo: Face ID, impronta, oppure niente (o non configurato). */
export async function biometricKind(): Promise<'face' | 'fingerprint' | null> {
  if (!(await LocalAuthentication.hasHardwareAsync()) || !(await LocalAuthentication.isEnrolledAsync())) return null;
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  return null;
}

/** Chiede Face ID / impronta; se non va, iOS propone il codice del telefono. */
export async function authenticate(prompt: string, cancelLabel: string) {
  const res = await LocalAuthentication.authenticateAsync({ promptMessage: prompt, cancelLabel });
  return res.success;
}
