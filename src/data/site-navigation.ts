import type { Locale } from '../i18n/config';

// Navigation metadata only. Register a destination after its real page exists.
export const exploreDestinations = [
  {
    id: 'beyond-code', path: '/beyond-code', icon: 'sparkle',
    label: { en: 'Beyond Code', zh: '代码之外', ja: 'コードを超えて' },
  },
  {
    id: 'atlas', path: '/journey', icon: 'earthAtlas',
    label: { en: 'Travel Atlas', zh: '旅行星图', ja: '旅の星図' },
  },
  {
    id: 'timeline', path: '/timeline', icon: 'clock',
    label: { en: 'Timeline', zh: '时间线', ja: 'タイムライン' },
  },
] as const satisfies readonly {
  id: string; path: string; icon: string; label: Record<Locale, string>;
}[];

export const exploreLabels = {
  en: { toggle: 'Explore', landmark: 'Explore site sections' },
  zh: { toggle: '探索', landmark: '探索站点分区' },
  ja: { toggle: '探索', landmark: 'サイトを探索' },
} as const satisfies Record<Locale, { toggle: string; landmark: string }>;
