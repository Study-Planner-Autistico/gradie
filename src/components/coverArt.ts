// Copertine dei quaderni (dec. 144): 8 temi x 8 colori, ritagliate dalle tavole fornite.
// File generato: le immagini stanno in assets/covers/<tema>-<colore>.webp, senza la scritta originale.
import type { ImageSourcePropType } from 'react-native';

export const COVER_THEMES = ["stripes","watercolor","leopard","plaid","zebra","spots","polka","stars"] as const;
export type CoverTheme = (typeof COVER_THEMES)[number];
export const COVER_COLORS = ["blue","red","yellow","teal","lilac","orange","pink","purple"] as const;
export type CoverColor = (typeof COVER_COLORS)[number];

/** Colore del pallino nella scelta del colore. */
export const COVER_SWATCH: Record<CoverColor, string> = {
  "blue": "#3D6FB0",
  "red": "#C7343C",
  "yellow": "#E8B532",
  "teal": "#2E9C8C",
  "lilac": "#A27FC6",
  "orange": "#E07028",
  "pink": "#E04A82",
  "purple": "#5E3478"
};

/** Zona del titolo sull'etichetta (sopra la prima riga), in proporzione alla copertina. */
export const COVER_TITLE: Record<CoverTheme, { left: number; right: number; top: number; bottom: number }> = {
  stripes: { left: 0.269, right: 0.806, top: 0.138, bottom: 0.296 },
  watercolor: { left: 0.263, right: 0.786, top: 0.133, bottom: 0.286 },
  leopard: { left: 0.287, right: 0.78, top: 0.235, bottom: 0.329 },
  plaid: { left: 0.327, right: 0.767, top: 0.172, bottom: 0.253 },
  zebra: { left: 0.319, right: 0.752, top: 0.195, bottom: 0.273 },
  spots: { left: 0.297, right: 0.746, top: 0.199, bottom: 0.281 },
  polka: { left: 0.298, right: 0.777, top: 0.217, bottom: 0.304 },
  stars: { left: 0.318, right: 0.745, top: 0.332, bottom: 0.402 },
};

/** Rapporto larghezza/altezza delle copertine (420 x 572). */
export const COVER_RATIO = 420 / 572;

export const COVER_ART: Record<CoverTheme, Record<CoverColor, ImageSourcePropType>> = {
  stripes: {
    blue: require('../../assets/covers/stripes-blue.webp'),
    red: require('../../assets/covers/stripes-red.webp'),
    yellow: require('../../assets/covers/stripes-yellow.webp'),
    teal: require('../../assets/covers/stripes-teal.webp'),
    lilac: require('../../assets/covers/stripes-lilac.webp'),
    orange: require('../../assets/covers/stripes-orange.webp'),
    pink: require('../../assets/covers/stripes-pink.webp'),
    purple: require('../../assets/covers/stripes-purple.webp'),
  },
  watercolor: {
    blue: require('../../assets/covers/watercolor-blue.webp'),
    red: require('../../assets/covers/watercolor-red.webp'),
    yellow: require('../../assets/covers/watercolor-yellow.webp'),
    teal: require('../../assets/covers/watercolor-teal.webp'),
    lilac: require('../../assets/covers/watercolor-lilac.webp'),
    orange: require('../../assets/covers/watercolor-orange.webp'),
    pink: require('../../assets/covers/watercolor-pink.webp'),
    purple: require('../../assets/covers/watercolor-purple.webp'),
  },
  leopard: {
    blue: require('../../assets/covers/leopard-blue.webp'),
    red: require('../../assets/covers/leopard-red.webp'),
    yellow: require('../../assets/covers/leopard-yellow.webp'),
    teal: require('../../assets/covers/leopard-teal.webp'),
    lilac: require('../../assets/covers/leopard-lilac.webp'),
    orange: require('../../assets/covers/leopard-orange.webp'),
    pink: require('../../assets/covers/leopard-pink.webp'),
    purple: require('../../assets/covers/leopard-purple.webp'),
  },
  plaid: {
    blue: require('../../assets/covers/plaid-blue.webp'),
    red: require('../../assets/covers/plaid-red.webp'),
    yellow: require('../../assets/covers/plaid-yellow.webp'),
    teal: require('../../assets/covers/plaid-teal.webp'),
    lilac: require('../../assets/covers/plaid-lilac.webp'),
    orange: require('../../assets/covers/plaid-orange.webp'),
    pink: require('../../assets/covers/plaid-pink.webp'),
    purple: require('../../assets/covers/plaid-purple.webp'),
  },
  zebra: {
    blue: require('../../assets/covers/zebra-blue.webp'),
    red: require('../../assets/covers/zebra-red.webp'),
    yellow: require('../../assets/covers/zebra-yellow.webp'),
    teal: require('../../assets/covers/zebra-teal.webp'),
    lilac: require('../../assets/covers/zebra-lilac.webp'),
    orange: require('../../assets/covers/zebra-orange.webp'),
    pink: require('../../assets/covers/zebra-pink.webp'),
    purple: require('../../assets/covers/zebra-purple.webp'),
  },
  spots: {
    blue: require('../../assets/covers/spots-blue.webp'),
    red: require('../../assets/covers/spots-red.webp'),
    yellow: require('../../assets/covers/spots-yellow.webp'),
    teal: require('../../assets/covers/spots-teal.webp'),
    lilac: require('../../assets/covers/spots-lilac.webp'),
    orange: require('../../assets/covers/spots-orange.webp'),
    pink: require('../../assets/covers/spots-pink.webp'),
    purple: require('../../assets/covers/spots-purple.webp'),
  },
  polka: {
    blue: require('../../assets/covers/polka-blue.webp'),
    red: require('../../assets/covers/polka-red.webp'),
    yellow: require('../../assets/covers/polka-yellow.webp'),
    teal: require('../../assets/covers/polka-teal.webp'),
    lilac: require('../../assets/covers/polka-lilac.webp'),
    orange: require('../../assets/covers/polka-orange.webp'),
    pink: require('../../assets/covers/polka-pink.webp'),
    purple: require('../../assets/covers/polka-purple.webp'),
  },
  stars: {
    blue: require('../../assets/covers/stars-blue.webp'),
    red: require('../../assets/covers/stars-red.webp'),
    yellow: require('../../assets/covers/stars-yellow.webp'),
    teal: require('../../assets/covers/stars-teal.webp'),
    lilac: require('../../assets/covers/stars-lilac.webp'),
    orange: require('../../assets/covers/stars-orange.webp'),
    pink: require('../../assets/covers/stars-pink.webp'),
    purple: require('../../assets/covers/stars-purple.webp'),
  },
};
