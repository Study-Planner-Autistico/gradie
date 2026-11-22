// Design tokens — fonte di verità: DESIGN.md (v2, basato su Atlassian Design System).
// Valori presi da @atlaskit/tokens 20.14 (temi atlassian-light / atlassian-dark). Non usare valori hardcoded.
import type { TextStyle } from 'react-native';

/** Tinte per tipo di elemento (DESIGN.md §2.3): color.background.accent.*.subtlest + color.text.accent.*. */
const lightTints = {
  lesson: { bg: '#E9F2FE', fg: '#1558BC' }, // blue
  appointment: { bg: '#FFECF8', fg: '#943D73' }, // magenta
  activity: { bg: '#FFF5DB', fg: '#9E4C00' }, // orange
  official: { bg: '#DCFFF1', fg: '#216E4E' }, // green
  holiday: { bg: '#F0F1F2', fg: '#505258' }, // gray
};

const darkTints: typeof lightTints = {
  lesson: { bg: '#1C2B42', fg: '#8FB8F6' },
  appointment: { bg: '#3D2232', fg: '#F797D2' },
  activity: { bg: '#3A2C1F', fg: '#FBC828' },
  official: { bg: '#1C3329', fg: '#7EE2B8' },
  holiday: { bg: '#303134', fg: '#A9ABAF' },
};

export const lightColors = {
  /** elevation.surface.sunken — sfondo dello schermo, le card stanno sopra. */
  bg: '#F8F8F8',
  /** elevation.surface.raised */
  surface: '#FFFFFF',
  /** elevation.surface.overlay — sheet, menu */
  surfaceOverlay: '#FFFFFF',
  /** color.background.neutral */
  surfaceMuted: '#0515240F',
  neutralHovered: '#0B120E24',
  neutralPressed: '#080F214A',
  /** color.border */
  border: '#0B120E24',
  borderBold: '#7D818A',
  borderInput: '#8C8F97',
  borderFocused: '#4688EC',
  /** color.text / .subtle / .subtlest */
  text: '#292A2E',
  textSecondary: '#505258',
  textTertiary: '#6B6E76',
  textDisabled: '#080F214A',
  /** color.background.neutral.bold — bottone "ink" */
  ink: '#292A2E',
  onInk: '#FFFFFF',
  /** color.background.brand.bold — bottone primario, selezione */
  accent: '#1868DB',
  accentHovered: '#1558BC',
  accentPressed: '#144794',
  onAccent: '#FFFFFF',
  link: '#1868DB',
  /** color.background.selected / brand.subtlest */
  selected: '#E9F2FE',
  selectedText: '#1868DB',
  success: '#4C6B1F',
  successBg: '#EFFFD6',
  successIcon: '#6A9A23',
  warning: '#9E4C00',
  warningBg: '#FFF5DB',
  warningIcon: '#E06C00',
  danger: '#AE2E24',
  dangerBg: '#FFECEB',
  dangerIcon: '#C9372C',
  information: '#1558BC',
  informationBg: '#E9F2FE',
  discovery: '#803FA5',
  discoveryBg: '#F8EEFE',
  /** color.blanket — velo dietro sheet e dialoghi */
  blanket: '#050C1F75',
  /** elevation.shadow.raised / overlay (CSS box-shadow, supportato da RN ≥ 0.76) */
  shadowRaised: '0px 1px 1px #1E1F2140, 0px 0px 1px #1E1F214F',
  shadowOverlay: '0px 8px 12px #1E1F2126, 0px 0px 1px #1E1F214F',
  /** Fallback del Liquid Glass di sistema (solo tab bar web) */
  glassFallback: 'rgba(255,255,255,0.78)',
  glassBorder: '#0B120E24',
  /** Gradiente tenue per la card in evidenza: blue.subtlest → purple.subtlest (DESIGN.md §2.4). */
  heroGradient: ['#E9F2FE', '#F8EEFE', '#FFFFFF'] as readonly [string, string, ...string[]],
  heroGradientOverlay: ['rgba(255,255,255,0)', 'rgba(207,225,253,0.55)'] as readonly [string, string, ...string[]],
  tints: lightTints,
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  bg: '#18191A',
  surface: '#242528',
  surfaceOverlay: '#2B2C2F',
  surfaceMuted: '#CECED912',
  neutralHovered: '#E3E4F21F',
  neutralPressed: '#E5E9F640',
  border: '#E3E4F21F',
  borderBold: '#7E8188',
  borderInput: '#7E8188',
  borderFocused: '#8FB8F6',
  text: '#CECFD2',
  textSecondary: '#A9ABAF',
  textTertiary: '#96999E',
  textDisabled: '#E5E9F640',
  ink: '#CECFD2',
  onInk: '#1F1F21',
  accent: '#669DF1',
  accentHovered: '#8FB8F6',
  accentPressed: '#ADCBFB',
  onAccent: '#1F1F21',
  link: '#669DF1',
  selected: '#1C2B42',
  selectedText: '#669DF1',
  success: '#B3DF72',
  successBg: '#28311B',
  successIcon: '#82B536',
  warning: '#FBC828',
  warningBg: '#3A2C1F',
  warningIcon: '#FBC828',
  danger: '#FD9891',
  dangerBg: '#42221F',
  dangerIcon: '#F15B50',
  information: '#8FB8F6',
  informationBg: '#1C2B42',
  discovery: '#D8A0F7',
  discoveryBg: '#35243F',
  blanket: '#10121499',
  shadowRaised: '0px 0px 0px 1px #00000000, 0px 1px 1px #01040480, 0px 0px 1px #01040480',
  shadowOverlay: '0px 0px 0px 1px #BDBDBD1F, 0px 8px 12px #0104045C, 0px 0px 1px 1px #01040480',
  glassFallback: 'rgba(36,37,40,0.78)',
  glassBorder: '#E3E4F21F',
  heroGradient: ['#1C2B42', '#35243F', '#242528'] as readonly [string, string, ...string[]],
  heroGradientOverlay: ['rgba(36,37,40,0)', 'rgba(70,136,236,0.25)'] as readonly [string, string, ...string[]],
  tints: darkTints,
};

export type TintName = keyof typeof lightTints;

/** space.050 … space.1000 (base 8). */
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, giant: 48 } as const;

/** radius.small 4 · medium 6 · large 8 · xlarge 12 · xxlarge 16 · full. */
export const radius = { xs: 2, sm: 4, md: 6, lg: 8, xl: 12, xxl: 16, pill: 999 } as const;

/** font.heading.* / font.body.* / font.metric.* — peso bold Atlassian = 653 → '700' su iOS. */
export const typography = {
  /** Estensione mobile: numero grande in evidenza (giorno, media). */
  hero: { fontSize: 40, lineHeight: 44, fontWeight: '700', letterSpacing: -0.5 },
  /** font.heading.xxlarge */
  display: { fontSize: 32, lineHeight: 36, fontWeight: '700' },
  /** font.heading.xlarge — titolo della schermata */
  title1: { fontSize: 28, lineHeight: 32, fontWeight: '700' },
  /** font.heading.medium — titolo della card */
  title2: { fontSize: 20, lineHeight: 24, fontWeight: '700' },
  /** font.heading.small */
  headline: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
  /** font.body.large — testo su mobile */
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  /** font.body + medium — bottoni, link, etichette */
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  /** font.body.small */
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  /** font.heading.xxsmall — etichette di sezione */
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  /** font.metric.large */
  metric: { fontSize: 28, lineHeight: 32, fontWeight: '700', fontVariant: ['tabular-nums'] },
  /** Orari: cifre a larghezza fissa. */
  time: { fontSize: 14, lineHeight: 20, fontWeight: '500', fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export const layout = {
  /** Area tappabile minima iOS (Atlassian: 32 su desktop, qui 44). */
  iconButton: 44,
  smallIconButton: 32,
  /** Bottone standard su mobile. */
  button: 48,
  input: 48,
  avatar: 40,
  dayCell: 40,
  checkbox: 20,
  tabBarClearance: 110,
} as const;

/** duration.* e easing.* di Atlassian (bezier per Animated.Easing.bezier). */
export const motion = {
  xshort: 100,
  short: 150,
  medium: 200,
  long: 250,
  xlong: 400,
  xxlong: 600,
  press: 150,
  transition: 250,
  easeOutPractical: [0.4, 1, 0.6, 1] as const,
  easeInPractical: [0.6, 0, 0.8, 0.6] as const,
  easeInOutBold: [0.4, 0, 0, 1] as const,
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
} as const;

/**
 * Inchiostri della lavagna (dec. 110). Per ogni strumento: 3 colori principali + altri colori dal "+".
 * Il primo colore della penna segue il tema: nero sul chiaro, bianco sullo scuro.
 */
export const ink = {
  pen: {
    light: ['#16161A', '#1F6FEB', '#D93025'],
    dark: ['#FFFFFF', '#3B8BFF', '#FF453A'],
    extra: ['#24894F', '#B86E00', '#8E44AD', '#E91E63', '#00A3A3', '#6B4F2A'],
  },
  pencil: {
    light: ['#2B2B2F', '#5E5E66', '#8E8E97'],
    dark: ['#E4E4E8', '#B4B4BC', '#85858E'],
    extra: ['#1A1A1D', '#45454C', '#75757E', '#A5A5AE', '#C8C8CF', '#E0E0E5'],
  },
  highlighter: {
    light: ['#FFE14D', '#7CF29A', '#FF8AD8'],
    dark: ['#FFE14D', '#7CF29A', '#FF8AD8'],
    extra: ['#7FD4FF', '#FFB86B', '#C9A2FF', '#FF7A7A'],
  },
  widths: { pen: [2, 4, 7], pencil: [1.5, 3, 5], highlighter: [12, 18, 26] },
  /** Opacità dell'evidenziatore: lascia leggere ciò che sta sotto. */
  highlighterOpacity: 0.4,
  pencilOpacity: 0.85,
  /** Canvas della lavagna: foglio chiaro o scuro secondo il tema. */
  paper: { light: '#FFFFFF', dark: '#0C0C0F' },
  sticky: '#FFF3B0',
  onSticky: '#3A3200',
  selection: '#1F6FEB',
} as const;

/** Copertine delle note (dec. 112). */
export const covers = [
  { id: 'classic1', color: '#2F5DA8' },
  { id: 'classic2', color: '#2E6B4F' },
  { id: 'classic3', color: '#C77A2E' },
  { id: 'classic4', color: '#B23A48' },
  { id: 'classic5', color: '#5B4B9A' },
  { id: 'classic6', color: '#2B2B2F' },
  { id: 'classic7', color: '#E39AB0' },
  { id: 'classic8', color: '#D9B23F' },
] as const;

/** Colori della carta (dec. 112); `dark` indica che sopra serve inchiostro chiaro. */
export const paperColors = [
  { id: 'white', color: '#FFFFFF', dark: false },
  { id: 'cream', color: '#FFF8E7', dark: false },
  { id: 'graphite', color: '#2A2A2E', dark: true },
  { id: 'black', color: '#0C0C0F', dark: true },
  { id: 'rose', color: '#F6C9CF', dark: false },
  { id: 'pink', color: '#F9D6E6', dark: false },
  { id: 'lavender', color: '#E3D9F7', dark: false },
] as const;

/** Righe e quadretti della carta, e margine rosso. */
export const paperLines = { light: 'rgba(60,90,160,0.22)', dark: 'rgba(255,255,255,0.18)', margin: 'rgba(217,61,82,0.6)', desk: { light: '#E4E4E9', dark: '#000000' } } as const;
