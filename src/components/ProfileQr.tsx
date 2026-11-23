import { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import QRCode from 'qrcode';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import { qrColors, radius } from '../theme';

const FINDER = 7;
/** Margine bianco attorno al codice (in moduli): i lettori ne hanno bisogno per trovarlo. */
const QUIET = 2;

/** Centri dei quadratini di allineamento (standard QR, come in qrcode/lib/core/alignment-pattern). */
function alignmentCenters(n: number): [number, number][] {
  const version = (n - 17) / 4;
  if (version < 2) return [];
  const count = Math.floor(version / 7) + 2;
  const step = n === 145 ? 26 : Math.ceil((n - 13) / (2 * count - 2)) * 2;
  const pos = [n - 7];
  for (let i = 1; i < count - 1; i++) pos.push(pos[i - 1] - step);
  pos.push(6);
  pos.reverse();
  const last = count - 1;
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++)
    for (let j = 0; j < count; j++) if (!((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0))) out.push([pos[i], pos[j]]);
  return out;
}

/**
 * QR in stile Duolingo: moduli a puntini, i tre "occhi" agli angoli arrotondati e un riquadro libero
 * al centro per l'avatar. Verificato con jsQR. Correzione d'errore alta (H, ~30%) così il centro coperto non ne impedisce la lettura.
 */
export function ProfileQr({ value, size, center, accessibilityLabel }: { value: string; size: number; center?: ReactNode; accessibilityLabel: string }) {
  const withCenter = !!center;
  const { n, dots, aligns } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: 'H' });
    const n = modules.size;
    // Riquadro centrale vuoto: circa il 22% del lato, con numero dispari di moduli per restare centrato.
    const hole = Math.floor(n * 0.22) | 1;
    const h0 = (n - hole) / 2;
    const inFinder = (r: number, c: number) => (r < FINDER && (c < FINDER || c >= n - FINDER)) || (r >= n - FINDER && c < FINDER);
    const inHole = (r: number, c: number) => withCenter && r >= h0 - 1 && r < h0 + hole + 1 && c >= h0 - 1 && c < h0 + hole + 1;
    // I quadratini di allineamento restano pieni: a puntini molti lettori non trovano più il codice.
    const aligns = alignmentCenters(n).filter(([r, c]) => !inHole(r, c));
    const inAlign = (r: number, c: number) => aligns.some(([ar, ac]) => Math.abs(r - ar) <= 2 && Math.abs(c - ac) <= 2);
    const dots: [number, number][] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (modules.get(r, c) && !inFinder(r, c) && !inAlign(r, c) && !inHole(r, c)) dots.push([r, c]);
    return { n, dots, aligns };
  }, [value, withCenter]);

  const corners: [number, number][] = [[0, 0], [0, n - FINDER], [n - FINDER, 0]];
  const centerSize = Math.round(size * 0.24);

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`${-QUIET} ${-QUIET} ${n + QUIET * 2} ${n + QUIET * 2}`}>
        <Rect x={-QUIET} y={-QUIET} width={n + QUIET * 2} height={n + QUIET * 2} fill={qrColors.bg} />
        <G fill={qrColors.fg}>
          {dots.map(([r, c]) => (
            <Circle key={`${r}-${c}`} cx={c + 0.5} cy={r + 0.5} r={0.42} />
          ))}
        </G>
        {corners.map(([r, c]) => (
          <G key={`${r}-${c}`}>
            <Rect x={c + 0.5} y={r + 0.5} width={FINDER - 1} height={FINDER - 1} rx={1.8} fill="none" stroke={qrColors.fg} strokeWidth={1} />
            <Rect x={c + 2} y={r + 2} width={3} height={3} rx={0.9} fill={qrColors.fg} />
          </G>
        ))}
        {aligns.map(([r, c]) => (
          <G key={`a${r}-${c}`}>
            <Rect x={c - 1.5} y={r - 1.5} width={4} height={4} rx={1.1} fill="none" stroke={qrColors.fg} strokeWidth={1} />
            <Rect x={c} y={r} width={1} height={1} rx={0.3} fill={qrColors.fg} />
          </G>
        ))}
      </Svg>
      {center && (
        <View
          style={{
            position: 'absolute',
            left: (size - centerSize) / 2,
            top: (size - centerSize) / 2,
            width: centerSize,
            height: centerSize,
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          {center}
        </View>
      )}
    </View>
  );
}
