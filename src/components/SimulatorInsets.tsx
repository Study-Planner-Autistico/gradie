import { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { SafeAreaInsetsContext, type EdgeInsets } from 'react-native-safe-area-context';

/**
 * Aree sicure dei simulatori (dec. 190): sul web l'app non sa della Dynamic Island, quindi nei simulatori di
 * tools/simulatori.html (che danno all'iframe il nome "sim-iphone", "sim-ipad"…) si usano quelle vere dei
 * dispositivi. Così intestazioni e bottoni stanno sotto l'isola come su iPhone e iPad. Fuori dai simulatori non fa nulla.
 */
const INSETS: Record<string, EdgeInsets> = {
  'sim-iphone': { top: 59, bottom: 34, left: 0, right: 0 },
  'sim-iphone-land': { top: 0, bottom: 21, left: 59, right: 59 },
  'sim-ipad': { top: 24, bottom: 20, left: 0, right: 0 },
  'sim-ipad-land': { top: 24, bottom: 20, left: 0, right: 0 },
};

const current = () => (Platform.OS === 'web' && typeof window !== 'undefined' ? (INSETS[window.name] ?? null) : null);

export function SimulatorInsets({ children }: { children: ReactNode }) {
  const [insets, setInsets] = useState(current);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // Girando il dispositivo il simulatore cambia il nome dell'iframe e la sua misura.
    const update = () => setInsets(current());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  if (!insets) return <>{children}</>;
  return <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>;
}
