// Shared Lumen theme tokens — same values as net-worth-tracker and
// marketplace-selling so the three apps feel like siblings. One StyleSheet
// per screen; these are just colors.

// Lumen surface/effect tokens (shared by value across the sibling apps —
// keep them in sync, don't redesign here).
export const theme = {
  bg: {
    base: '#0b1024',
    mid: '#131c33',
    end: '#171233',
  },

  glass: {
    fill: 'rgba(255, 255, 255, 0.055)',
    fillStrong: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    divider: 'rgba(255, 255, 255, 0.07)',
    blurIntensity: 24,
  },

  text: {
    primary: '#eef0f8',
    secondary: '#b9c1d9',
    muted: '#8f97b4',
  },

  brand: '#cdd6ff',
  accent: '#38bdf8',

  pos: '#7ee2b0',
  neg: '#ff9d9d',

  radius: {
    card: 24,
    chip: 14,
    pill: 999,
  },
} as const;

// Token names shared with the sibling apps' StyleSheets so Lumen components
// drop in unchanged.
export const colors = {
  bg: theme.bg.base,
  card: theme.glass.fill,
  cardBorder: theme.glass.border,
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: theme.glass.border,
  track: 'rgba(255, 255, 255, 0.09)',

  text: theme.text.primary,
  textSoft: '#d7ddf2',
  textMid: theme.text.secondary,
  textDim: theme.text.muted,

  accent: '#38bdf8',
  green: '#34d399',
  greenSoft: theme.pos,
  red: '#f87171',
  redSoft: theme.neg,
  amber: '#fbbf24',
} as const;

export const CARD_MAX = 640;
