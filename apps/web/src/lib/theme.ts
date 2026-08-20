'use client';

export type Theme = 'light' | 'dark' | 'system';

const EVENT = 'hooneylog:themechange';

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function resolveIsDark(theme: Theme): boolean {
  if (theme !== 'system') return theme === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', resolveIsDark(theme));
  try {
    if (theme === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', theme);
  } catch {
    // storage unavailable; the class change still applies for this session
  }
  window.dispatchEvent(new Event(EVENT));
}

// The <html class="dark"> attribute plus localStorage are the source of truth;
// no React state mirrors them. Same-tab changes fire EVENT, other tabs fire
// `storage`, and anything else touching the class is caught by the observer.
export function subscribeToTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
