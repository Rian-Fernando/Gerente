const STORAGE_KEY = 'gerente.darkMode';

export const getInitialDarkMode = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

export const persistDarkMode = (enabled) => {
  localStorage.setItem(STORAGE_KEY, String(enabled));
};

export const applyDarkModeClass = (enabled) => {
  document.body.classList.toggle('dark', enabled);
  document.body.classList.toggle('light', !enabled);
};
