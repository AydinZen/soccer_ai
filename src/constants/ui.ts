/** Brand accent — matches the splash backgroundColor in app.json. */
export const BRAND = '#208AEF';
/** Error / destructive accent (Radix red 9). */
export const DANGER = '#E5484D';

/**
 * Vibrant accent palette used across the app for colorful cards, stats, and
 * gradients. Each entry pairs a saturated base with a soft tint for backgrounds
 * and a deep shade for text on the tint.
 */
export const ACCENTS = {
  blue: { base: '#2563EB', tint: '#E5EDFF', deep: '#1E3A8A' },
  violet: { base: '#7C3AED', tint: '#F0E9FF', deep: '#4C1D95' },
  green: { base: '#16A34A', tint: '#DCFCE7', deep: '#14532D' },
  orange: { base: '#F97316', tint: '#FFEDD5', deep: '#7C2D12' },
  pink: { base: '#EC4899', tint: '#FCE7F3', deep: '#831843' },
  cyan: { base: '#0891B2', tint: '#CFFAFE', deep: '#164E63' },
} as const;

/** Hero gradient — energetic blue → violet. */
export const HERO_GRADIENT = ['#2563EB', '#7C3AED'] as const;
/** Pitch gradient — used on the progress / stats surfaces. */
export const PITCH_GRADIENT = ['#16A34A', '#0891B2'] as const;
