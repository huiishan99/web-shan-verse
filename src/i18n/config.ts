export const defaultLocale = 'en';
export const locales = ['en', 'zh', 'ja'] as const;
export const translatedLocales = ['zh', 'ja'] as const;

export type Locale = (typeof locales)[number];
export type LocalizedString = string | Partial<Record<Locale, string>>;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

export const localeShortNames: Record<Locale, string> = {
  en: 'EN',
  zh: '中',
  ja: '日',
};

const localizedRoutes = new Set(['/', '/about', '/projects', '/timeline', '/blog', '/journey', '/beyond-code']);
const monthNames: Record<string, Record<Locale, string>> = {
  January: { en: 'January', zh: '一月', ja: '1月' },
  February: { en: 'February', zh: '二月', ja: '2月' },
  March: { en: 'March', zh: '三月', ja: '3月' },
  April: { en: 'April', zh: '四月', ja: '4月' },
  May: { en: 'May', zh: '五月', ja: '5月' },
  June: { en: 'June', zh: '六月', ja: '6月' },
  July: { en: 'July', zh: '七月', ja: '7月' },
  August: { en: 'August', zh: '八月', ja: '8月' },
  September: { en: 'September', zh: '九月', ja: '9月' },
  October: { en: 'October', zh: '十月', ja: '10月' },
  November: { en: 'November', zh: '十一月', ja: '11月' },
  December: { en: 'December', zh: '十二月', ja: '12月' },
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function normalizePath(pathname: string): string {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const segments = cleanPath.split('/').filter(Boolean);

  if (isLocale(segments[0])) {
    const withoutLocale = `/${segments.slice(1).join('/')}`;
    return withoutLocale === '/' ? '/' : withoutLocale.replace(/\/+$/, '');
  }

  return cleanPath;
}

export function localizePath(pathname: string, locale: Locale): string {
  // Page links use the host's directory URLs directly, avoiding its extra 308.
  // Keep route identity in normalizePath; queries/fragments and non-pages are opaque.
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return pathname;
  const suffixIndex = pathname.search(/[?#]/);
  const route = suffixIndex < 0 ? pathname : pathname.slice(0, suffixIndex);
  const suffix = suffixIndex < 0 ? '' : pathname.slice(suffixIndex);
  const basePath = normalizePath(route);
  const isBlogSubpath = basePath.startsWith('/blog/');
  const isProjectSubpath = basePath.startsWith('/projects/');

  if ((!localizedRoutes.has(basePath) && !isBlogSubpath && !isProjectSubpath)
      || /\.[a-z\d]+$/i.test(basePath)) {
    return pathname;
  }

  const localizedPath = locale === defaultLocale
    ? basePath
    : basePath === '/' ? `/${locale}` : `/${locale}${basePath}`;
  return `${localizedPath === '/' ? '/' : `${localizedPath}/`}${suffix}`;
}

export function localizeString(value: LocalizedString | undefined, locale: Locale): string {
  if (!value) return '';
  if (typeof value === 'string') return value;

  return value[locale] || value[defaultLocale] || Object.values(value).find(Boolean) || '';
}

export function localizeMonth(value: LocalizedString | undefined, locale: Locale): string {
  const englishMonth = localizeString(value, defaultLocale);
  return monthNames[englishMonth]?.[locale] || localizeString(value, locale);
}
