type FontSizeOption = 'small' | 'medium' | 'large';
type AccentColorOption = 'indigo' | 'emerald' | 'purple';

const FONT_SIZE_MAP: Record<FontSizeOption, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

const ACCENT_COLORS: Record<
  AccentColorOption,
  { primary: string; primaryForeground: string; ring: string }
> = {
  indigo: {
    primary: '234 89% 74%',
    primaryForeground: '222 47% 11%',
    ring: '234 89% 74%',
  },
  emerald: {
    primary: '142 71% 45%',
    primaryForeground: '0 0% 100%',
    ring: '142 71% 45%',
  },
  purple: {
    primary: '262 83% 58%',
    primaryForeground: '0 0% 100%',
    ring: '262 83% 58%',
  },
};

export const applyUserPreferences = (metadata: Record<string, any> | undefined) => {
  if (typeof document === 'undefined') return;

  const fontSize = metadata?.font_size as FontSizeOption | undefined;
  if (fontSize && FONT_SIZE_MAP[fontSize]) {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
  } else {
    document.documentElement.style.fontSize = '';
  }

  const accent = metadata?.accent_color as AccentColorOption | undefined;
  if (accent && ACCENT_COLORS[accent]) {
    const { primary, primaryForeground, ring } = ACCENT_COLORS[accent];
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
    document.documentElement.style.setProperty('--ring', ring);
  } else {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-foreground');
    document.documentElement.style.removeProperty('--ring');
  }
};

