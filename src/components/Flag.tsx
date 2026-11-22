/**
 * Bandiera stondata come su Duolingo (dec. 134): disegni di "country-flag-icons" (licenza MIT, copiati in flagSvgs.ts) in formato 3:2,
 * angoli molto arrotondati e un bordino in basso più scuro che dà spessore.
 * Ci sono solo i paesi proposti nel profilo, per non appesantire l'app.
 */
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { FLAG_SVGS as FLAGS } from './flagSvgs';

/** Bandiera con angoli stondati; `width` in punti, altezza 3:2. */
export function Flag({ code, width = 40 }: { code: string; width?: number }) {
  const height = Math.round((width * 2) / 3);
  const xml = FLAGS[code.toUpperCase()];
  const r = Math.round(height * 0.28);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, borderRadius: r, overflow: 'hidden', backgroundColor: '#E4E4E9' }}
    >
      {xml && <SvgXml xml={xml} width={width} height={height} preserveAspectRatio="xMidYMid slice" />}
      {/* Bordino interno e spessore in basso, come le bandiere di Duolingo */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: r,
          borderWidth: 1.5,
          borderBottomWidth: Math.max(3, Math.round(height * 0.12)),
          borderColor: 'rgba(0,0,0,0.12)',
        }}
      />
    </View>
  );
}
