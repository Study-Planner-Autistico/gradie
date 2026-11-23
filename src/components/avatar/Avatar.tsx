import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Rect } from 'react-native-svg';
import { avatarPalette } from '../../theme';
import * as parts from './parts';

/** Stili disponibili per ogni parte (i disegni sono quelli di react-nice-avatar). */
export const AVATAR_STYLES = {
  hair: ['none', 'normal', 'thick', 'mohawk', 'womanShort', 'womanLong'],
  hat: ['none', 'beanie', 'turban'],
  eyebrow: ['up', 'upWoman'],
  eyes: ['circle', 'oval', 'smile'],
  glasses: ['none', 'round', 'square'],
  ear: ['small', 'big'],
  nose: ['short', 'long', 'round'],
  mouth: ['smile', 'laugh', 'peace'],
  shirt: ['short', 'hoody', 'polo'],
} as const;

export type AvatarStylePart = keyof typeof AVATAR_STYLES;
export type AvatarColorPart = 'skin' | 'hairColor' | 'hatColor' | 'shirtColor' | 'bg';

export type AvatarConfig = { [K in AvatarStylePart]: (typeof AVATAR_STYLES)[K][number] } & { [K in AvatarColorPart]: string };

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: avatarPalette.skin[0],
  hair: 'normal',
  hairColor: avatarPalette.hair[1],
  hat: 'none',
  hatColor: avatarPalette.hat[7],
  eyebrow: 'up',
  eyes: 'oval',
  glasses: 'none',
  ear: 'small',
  nose: 'short',
  mouth: 'smile',
  shirt: 'short',
  shirtColor: avatarPalette.shirt[1],
  bg: avatarPalette.bg[0],
};

/** Inquadrature: tutto l'avatar, la testa o solo il viso (per le anteprime dell'editor). */
export const AVATAR_FRAMES = { full: '0 0 100 100', head: '8 0 84 84', face: '20 20 64 64' } as const;

// shortcut: schiarisce mescolando col bianco invece di chroma.brighten(1) come la libreria; basta per le maglie.
function lighten(hex: string, k = 0.35) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) + (255 - ((n >> s) & 255)) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

/**
 * Avatar disegnato (dec. 133: solo avatar, niente foto). Un unico SVG 100x100 con le parti nell'ordine
 * di react-nice-avatar: viso, cappello o capelli, sopracciglia, occhi, occhiali, orecchie, naso, bocca, maglia.
 */
export function Avatar({
  config,
  size,
  shape = 'circle',
  frame = 'full',
  background = true,
  accessibilityLabel,
}: {
  config: AvatarConfig;
  size: number;
  shape?: 'circle' | 'square';
  frame?: keyof typeof AVATAR_FRAMES;
  background?: boolean;
  accessibilityLabel?: string;
}) {
  const id = `av${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const p = (c: string) => ({ c, c2: lighten(c), id });
  const c = config;
  const svg = (
    <Svg width={size} height={size} viewBox={AVATAR_FRAMES[frame]}>
      <Defs>
        <ClipPath id={`${id}clip`}>{shape === 'circle' ? <Circle cx={50} cy={50} r={50} /> : <Rect width={100} height={100} />}</ClipPath>
      </Defs>
      <G clipPath={`url(#${id}clip)`}>
        {background && <Rect x={-10} y={-10} width={120} height={120} fill={c.bg} />}
        {parts.face(p(c.skin))}
        {c.hat !== 'none' ? parts.hat[c.hat](p(c.hatColor)) : c.hair !== 'none' && parts.hair[c.hair](p(c.hairColor))}
        {parts.eyebrow[c.eyebrow](p(c.hairColor))}
        {parts.eyes[c.eyes](p(c.hairColor))}
        {c.glasses !== 'none' && parts.glasses[c.glasses](p(c.hairColor))}
        {parts.ear[c.ear](p(c.skin))}
        {parts.nose[c.nose](p(c.skin))}
        {parts.mouth[c.mouth](p(c.skin))}
        {parts.shirt[c.shirt](p(c.shirtColor))}
      </G>
    </Svg>
  );
  // L'etichetta sta su una View: sul web react-native-svg passerebbe `accessible` al DOM.
  return accessibilityLabel ? (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      {svg}
    </View>
  ) : (
    svg
  );
}
