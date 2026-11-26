// Design tokens — fonte di verità: DESIGN.md (v3).
// Brand Gradie (viola del logo) sopra la base Atlassian (@atlaskit/tokens 20.14):
// neutri, semantici e tinte per tipo restano Atlassian. Non usare valori hardcoded.
import type { TextStyle } from 'react-native';

/** Tinte per tipo di elemento (DESIGN.md §2.3): color.background.accent.*.subtlest + color.text.accent.*. */
const lightTints = {
  lesson: { bg: '#E9F2FE', fg: '#1558BC' }, // blue
  appointment: { bg: '#FFECF8', fg: '#943D73' }, // magenta
  activity: { bg: '#FFF5DB', fg: '#9E4C00' }, // orange
  official: { bg: '#DCFFF1', fg: '#216E4E' }, // green
  holiday: { bg: '#F0F1F2', fg: '#505258' }, // gray
  study: { bg: '#F3F0FF', fg: '#5E4DB2' }, // purple (dec. 186)
};

const darkTints: typeof lightTints = {
  lesson: { bg: '#1C2B42', fg: '#8FB8F6' },
  appointment: { bg: '#3D2232', fg: '#F797D2' },
  activity: { bg: '#3A2C1F', fg: '#FBC828' },
  official: { bg: '#1C3329', fg: '#7EE2B8' },
  holiday: { bg: '#303134', fg: '#A9ABAF' },
  study: { bg: '#2B2541', fg: '#B8ACF6' },
};

// Prova "storybook" (ramo di prova, non è una decisione): carta bianca, viola Gradie per titoli e progresso,
// blu per link e azioni secondarie, grigi caldi per il testo, bordi pieni 2 px, niente ombre, sfumature o vetro.
export const lightColors = {
  /** Carta bianca: schermo e card sono dello stesso bianco, le card si staccano col bordo. */
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceOverlay: '#FFFFFF',
  surfaceMuted: '#F7F7F7',
  neutralHovered: '#E5E5E5',
  neutralPressed: '#D5D5D5',
  border: '#E5E5E5',
  borderBold: '#AFAFAF',
  borderInput: '#AFAFAF',
  borderFocused: '#5D55D7',
  text: '#4B4B4B',
  textSecondary: '#777777',
  textTertiary: '#777777',
  textDisabled: '#AFAFAF',
  ink: '#4B4B4B',
  onInk: '#FFFFFF',
  /** Viola Gradie: bottone principale, progresso, selezione. Bianco sopra 5.6:1. */
  accent: '#5D55D7',
  accentHovered: '#5149C9',
  /** Bordo inferiore dei pulsanti tridimensionali e stato premuto. */
  accentPressed: '#463FB5',
  /** Titoli grandi delle pagine. */
  heading: '#5D55D7',
  onAccent: '#FFFFFF',
  switchThumb: '#FFFFFF',
  /** Blu: link e azioni secondarie. */
  link: '#1A73C9',
  selected: '#EEECFF',
  selectedText: '#4A42C2',
  gold: '#FFC800',
  success: '#58A700',
  successBg: '#D7FFB8',
  successIcon: '#58CC02',
  warning: '#CD7900',
  warningBg: '#FFF4D6',
  warningIcon: '#FF9600',
  danger: '#EA2B2B',
  dangerBg: '#FFDFE0',
  dangerIcon: '#FF4B4B',
  information: '#1899D6',
  informationBg: '#DDF4FF',
  discovery: '#A560E8',
  discoveryBg: '#F6E8FF',
  blanket: '#00000066',
  /** Niente ombre: un'ombra piena da 2 px senza sfocatura disegna il bordo "adesivo" su tutte le superfici. */
  shadowRaised: '0px 0px 0px 2px #E5E5E5',
  shadowOverlay: '0px 0px 0px 2px #E5E5E5',
  glassFallback: '#FFFFFF',
  glassBlue: '#1A73C9',
  glassBorder: '#E5E5E5',
  /** Niente sfumature: tinte piatte. */
  heroGradient: ['#FFFFFF', '#FFFFFF'] as readonly [string, string, ...string[]],
  heroGradientOverlay: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'] as readonly [string, string, ...string[]],
  brandGradient: ['#5D55D7', '#5D55D7'] as readonly [string, string, ...string[]],
  feature: '#5D55D7',
  onFeature: '#FFFFFF',
  tints: lightTints,
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  bg: '#131F24',
  surface: '#131F24',
  surfaceOverlay: '#202F36',
  surfaceMuted: '#202F36',
  neutralHovered: '#37464F',
  neutralPressed: '#4A5B65',
  border: '#37464F',
  borderBold: '#52656D',
  borderInput: '#52656D',
  borderFocused: '#A9A2FF',
  text: '#F1F7FB',
  textSecondary: '#A9B8C0',
  textTertiary: '#A9B8C0',
  textDisabled: '#52656D',
  ink: '#F1F7FB',
  onInk: '#131F24',
  accent: '#5D55D7',
  accentHovered: '#6F67E8',
  accentPressed: '#3D37A8',
  heading: '#A9A2FF',
  onAccent: '#FFFFFF',
  switchThumb: '#FFFFFF',
  link: '#6FB0F5',
  selected: '#29254F',
  selectedText: '#B3ACFF',
  gold: '#FFC800',
  success: '#93D333',
  successBg: '#1F3A12',
  successIcon: '#58CC02',
  warning: '#FFC800',
  warningBg: '#3A2E10',
  warningIcon: '#FF9600',
  danger: '#FF7878',
  dangerBg: '#3F1F22',
  dangerIcon: '#FF4B4B',
  information: '#49C0F8',
  informationBg: '#14324A',
  discovery: '#CE82FF',
  discoveryBg: '#33244A',
  blanket: '#000000A0',
  shadowRaised: '0px 0px 0px 2px #37464F',
  shadowOverlay: '0px 0px 0px 2px #37464F',
  glassFallback: '#131F24',
  glassBlue: '#6FB0F5',
  glassBorder: '#37464F',
  heroGradient: ['#131F24', '#131F24'] as readonly [string, string, ...string[]],
  heroGradientOverlay: ['rgba(19,31,36,0)', 'rgba(19,31,36,0)'] as readonly [string, string, ...string[]],
  brandGradient: ['#5D55D7', '#5D55D7'] as readonly [string, string, ...string[]],
  feature: '#4A42C2',
  onFeature: '#FFFFFF',
  tints: darkTints,
};

/** Colori della mascotte (nuvoletta col tocco), presi dal logo. Uguali in chiaro e in scuro. */
export const mascot = {
  cloudTop: '#FFFFFF',
  cloudBottom: '#D8D2FF',
  cloudShade: '#C4BCFA',
  eye: '#2E2C86',
  eyeLow: '#4B49C2',
  sparkle: '#FFFFFF',
  brow: '#3E3AA6',
  capTop: '#6A60E8',
  capSide: '#4B45C9',
  capBand: '#3D37A8',
  tassel: '#F7C55A',
  tasselShade: '#D9A43A',
  star: '#FFE7A3',
  cheek: '#F5B8D8',
} as const;

/**
 * Avatar (react-nice-avatar): colori fissi, uguali in chiaro e in scuro, come la mascotte.
 * Gli sfondi sono pastello perché nel Profilo ci si scrive sopra con `ink` (contrasto ≥ 4.5:1).
 */
export const avatarPalette = {
  skin: ['#F9C9B6', '#F1C6A0', '#DDA47A', '#C58556', '#AC6651', '#7A4A36'],
  hair: ['#000000', '#77311D', '#B8763E', '#E8C26A', '#FFFFFF', '#FC909F', '#506AF4', '#F48150'],
  hat: ['#000000', '#FFFFFF', '#77311D', '#FC909F', '#D2EFF3', '#506AF4', '#F48150', '#5D55D7'],
  shirt: ['#9287FF', '#5D55D7', '#6BD9E9', '#74D153', '#F4D150', '#FC909F', '#F48150', '#77311D'],
  bg: ['#E0DDFF', '#D2EFF3', '#DCFFF1', '#FFEBA4', '#FFEDEF', '#F0F1F2'],
  ink: '#292A2E',
} as const;

/** Codice QR: sempre scuro su bianco, anche in tema scuro, perché tutti i lettori lo riconoscano. */
export const qrColors = { bg: '#FFFFFF', fg: '#292A2E' } as const;

export type TintName = keyof typeof lightTints;

/** space.050 … space.1000 (base 8). */
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, giant: 48 } as const;

/** Prova storybook: 12 px su bottoni, card, pillole e campi. */
export const radius = { xs: 2, sm: 8, md: 12, lg: 12, xl: 12, xxl: 16, pill: 999 } as const;

/** Font caricati in src/app/_layout.tsx: Fredoka (tondo) per i titoli, Rubik per il testo. */
export const fonts = {
  heading: 'Fredoka_700Bold',
  title: 'Fredoka_600SemiBold',
  body: 'Rubik_400Regular',
  semibold: 'Rubik_500Medium',
  bold: 'Rubik_600SemiBold',
  extrabold: 'Rubik_700Bold',
} as const;

export const typography = {
  hero: { fontSize: 48, lineHeight: 56, fontFamily: fonts.heading, fontWeight: '700', letterSpacing: -1 },
  display: { fontSize: 40, lineHeight: 48, fontFamily: fonts.heading, fontWeight: '700', letterSpacing: -0.8 },
  /** Titolo della schermata */
  title1: { fontSize: 32, lineHeight: 38, fontFamily: fonts.heading, fontWeight: '700', letterSpacing: -0.6 },
  /** Titolo della card */
  title2: { fontSize: 20, lineHeight: 26, fontFamily: fonts.title, fontWeight: '600' },
  stat: { fontSize: 24, lineHeight: 28, fontFamily: fonts.title, fontWeight: '600', fontVariant: ['tabular-nums'] },
  /** Maiuscolo spaziato, come le etichette di navigazione della reference. */
  label: { fontSize: 15, lineHeight: 20, fontFamily: fonts.bold, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  headline: { fontSize: 17, lineHeight: 22, fontFamily: fonts.bold, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24, fontFamily: fonts.body, fontWeight: '400' },
  /** Testo dei campi su una riga: senza lineHeight, così iOS lo centra nel campo. */
  input: { fontSize: 17, fontFamily: fonts.body, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 20, fontFamily: fonts.semibold, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 17, fontFamily: fonts.body, fontWeight: '400' },
  overline: { fontSize: 13, lineHeight: 16, fontFamily: fonts.extrabold, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  metric: { fontSize: 32, lineHeight: 36, fontFamily: fonts.heading, fontWeight: '700', fontVariant: ['tabular-nums'] },
  time: { fontSize: 15, lineHeight: 20, fontFamily: fonts.semibold, fontWeight: '500', fontVariant: ['tabular-nums'] },
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
  // Matita: una gradazione più chiara della penna, anche il primo grigio (dec. 178).
  pencil: {
    light: ['#55555C', '#7E7E87', '#A5A5AE'],
    dark: ['#C8C8CF', '#9E9EA6', '#75757E'],
    extra: ['#3A3A40', '#5E5E66', '#8E8E97', '#B4B4BC', '#D2D2D8', '#E8E8EC'],
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
