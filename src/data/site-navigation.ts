import type { Locale } from '../i18n/config';

// Retained URLs that should not be listed or indexed as public destinations.
export const unlistedPagePaths = ['/timeline'] as const;

// Navigation metadata only. Register a destination after its real page exists.
export const aboutDestinations = [
  {
    id: 'beyond-code', path: '/beyond-code', icon: 'sparkle',
    label: { en: 'Beyond Code', zh: '代码之外', ja: 'コードを超えて' },
  },
  {
    id: 'atlas', path: '/journey', icon: 'earthAtlas',
    label: { en: 'Travel Atlas', zh: '旅行星图', ja: '旅の星図' },
  },
] as const satisfies readonly {
  id: string; path: string; icon: string; label: Record<Locale, string>;
}[];

export const aboutMenuLabels = {
  en: { toggle: 'More about me', landmark: 'More about me' },
  zh: { toggle: '更多关于我的页面', landmark: '更多关于我' },
  ja: { toggle: '自分についてのページ', landmark: '自分について' },
} as const satisfies Record<Locale, { toggle: string; landmark: string }>;
