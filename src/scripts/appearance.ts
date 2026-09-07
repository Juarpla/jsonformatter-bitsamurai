/**
 * Appearance state helpers shared by the navbar (settings) and the
 * workspace (editor theme sync). Keys are persisted in localStorage.
 */

export type ThemeSetting = 'system' | 'light' | 'dark';
export type AccentSetting = 'green' | 'blue' | 'red';

export const THEME_KEY = 'app.theme';
export const ACCENT_KEY = 'app.accent';
export const SPLITTER_KEY = 'app.splitter';

export const APPEARANCE_EVENT = 'app:appearance';

export function isDarkAppearance(): boolean {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function currentThemeSetting(): ThemeSetting {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'dark' || theme === 'light') return theme;
  return 'system';
}

export function currentAccentSetting(): AccentSetting {
  const accent = document.documentElement.dataset.accent;
  if (accent === 'green' || accent === 'red') return accent;
  return 'blue';
}

export function persistTheme(setting: ThemeSetting): void {
  if (setting === 'system') {
    delete document.documentElement.dataset.theme;
    try {
      localStorage.removeItem(THEME_KEY);
    } catch {
      /* storage unavailable */
    }
    return;
  }
  document.documentElement.dataset.theme = setting;
  try {
    localStorage.setItem(THEME_KEY, setting);
  } catch {
    /* storage unavailable */
  }
}

export function persistAccent(accent: AccentSetting): void {
  document.documentElement.dataset.accent = accent;
  try {
    localStorage.setItem(ACCENT_KEY, accent);
  } catch {
    /* storage unavailable */
  }
}

/** Notify listeners (editors, etc.) that appearance may have changed. */
export function announceAppearance(): void {
  document.dispatchEvent(new CustomEvent(APPEARANCE_EVENT));
}
