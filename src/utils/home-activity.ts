import type { CollectionEntry } from 'astro:content';
import type { TimelineYear } from '../data/timeline';
import {
  localizeMonth,
  localizePath,
  localizeString,
  type Locale,
} from '../i18n/config';
import { getBlogPostDisplayTitle, getBlogPostPath } from './blog';

type BlogPost = CollectionEntry<'blog'>;

type ActivityLabels = {
  activeDays: string;
  noSignal: string;
  signalMap: string;
  totalSignals: string;
};

export type ActivitySignal = {
  date: Date;
  datetime: string;
  displayDate: string;
  dateSource: 'blog date' | 'timeline date' | 'timeline month';
  href: string;
  title: string;
  type: 'blog' | 'activity' | 'milestone';
};

const dateLocale: Record<Locale, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
};
const activityLabelLocale = 'en-US';
const activityTimeZone = 'Asia/Tokyo';
const monthIndex: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export const activityWeekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function formatActivityDate(date: Date, lang: Locale): string {
  return date.toLocaleDateString(dateLocale[lang], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatActivityMonthYear(date: Date): string {
  return date.toLocaleDateString(activityLabelLocale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function filterCrowdedMonthLabels(labels: string[], minGap = 3): string[] {
  const filteredLabels = [...labels];
  let previousLabelIndex = -1;

  labels.forEach((label, index) => {
    if (!label) return;

    if (previousLabelIndex >= 0 && index - previousLabelIndex < minGap) {
      filteredLabels[previousLabelIndex] = '';
    }

    previousLabelIndex = index;
  });

  return filteredLabels;
}

function startOfTodayInTimeZone(timeZone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(Date.UTC(getPart('year'), getPart('month') - 1, getPart('day')));
}

function buildActivityWeeks(
  startDate: Date,
  weekCount: number,
  signalsByDay: Record<string, ActivitySignal[]>,
  lang: Locale
) {
  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(startDate, weekIndex * 7 + dayIndex);
      const signals = signalsByDay[toDateKey(date)] || [];
      const intensity = Math.min(signals.length, 4);

      return {
        date,
        displayDate: formatActivityDate(date, lang),
        key: toDateKey(date),
        signals,
        intensity,
      };
    })
  );
}

function getActivityMonthLabels(
  weeks: ReturnType<typeof buildActivityWeeks>
): string[] {
  return filterCrowdedMonthLabels(weeks.map((week, weekIndex) => {
    const firstOfMonth = week.find((day) => day.date.getUTCDate() === 1);
    const labelDate = firstOfMonth?.date || (weekIndex === 0 ? week[0].date : null);

    return labelDate
      ? labelDate.toLocaleDateString(activityLabelLocale, { month: 'short', timeZone: 'UTC' })
      : '';
  }));
}

function getActivityYearLabels(
  weeks: ReturnType<typeof buildActivityWeeks>
): string[] {
  return weeks.map((week, weekIndex) => {
    const firstOfYear = week.find((day) => day.date.getUTCMonth() === 0 && day.date.getUTCDate() === 1);
    const labelDate = firstOfYear?.date || (weekIndex === 0 ? week[0].date : null);

    return labelDate ? String(labelDate.getUTCFullYear()) : '';
  });
}

function getVisibleSignals(
  activitySignals: ActivitySignal[],
  startDate: Date,
  gridEnd: Date
): ActivitySignal[] {
  return activitySignals
    .filter((signal) => {
      const signalDate = startOfDay(signal.date);
      return signalDate >= startDate && signalDate <= gridEnd;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function getActiveDayCount(signals: ActivitySignal[]): number {
  return new Set(signals.map((signal) => toDateKey(startOfDay(signal.date)))).size;
}

export function buildHomepageActivityModel({
  labels,
  lang,
  posts,
  timelineData,
}: {
  labels: ActivityLabels;
  lang: Locale;
  posts: BlogPost[];
  timelineData: TimelineYear[];
}) {
  const postSignals: ActivitySignal[] = posts.map((post) => ({
    date: post.data.date,
    datetime: toDateKey(post.data.date),
    displayDate: formatActivityDate(post.data.date, lang),
    dateSource: 'blog date',
    href: getBlogPostPath(post, lang),
    title: getBlogPostDisplayTitle(post, lang),
    type: 'blog',
  }));

  const timelineSignals: ActivitySignal[] = timelineData.flatMap((yearData) =>
    yearData.events.map((event) => {
      const englishMonth = localizeString(event.month, 'en');
      const eventMonthIndex = monthIndex[englishMonth] ?? 0;
      const eventMonth = localizeMonth(event.month, lang);
      const preciseEventDate = event.date && event.datePrecision !== 'month'
        ? new Date(`${event.date}T00:00:00Z`)
        : undefined;
      const eventDate = preciseEventDate ?? new Date(Date.UTC(yearData.year, eventMonthIndex, 15));

      return {
        date: eventDate,
        datetime: preciseEventDate
          ? toDateKey(preciseEventDate)
          : `${yearData.year}-${String(eventMonthIndex + 1).padStart(2, '0')}`,
        displayDate: `${eventMonth} ${yearData.year}`,
        dateSource: preciseEventDate ? 'timeline date' as const : 'timeline month' as const,
        href: localizePath('/timeline', lang),
        title: localizeString(event.title, lang),
        type: event.weight === 'major' ? 'milestone' as const : 'activity' as const,
      };
    })
  );

  const activitySignals = [...postSignals, ...timelineSignals];
  const today = startOfTodayInTimeZone(activityTimeZone);
  const fullWeekCount = 52;
  const compactWeekCount = 26;
  const gridEnd = addDays(today, 6 - today.getUTCDay());
  const gridStart = addDays(gridEnd, -(fullWeekCount * 7 - 1));
  const compactGridStart = addDays(gridEnd, -(compactWeekCount * 7 - 1));
  const activityRangeLabel = `${formatActivityMonthYear(gridStart)} - ${formatActivityMonthYear(gridEnd)}`;
  const compactActivityRangeLabel = `${formatActivityMonthYear(compactGridStart)} - ${formatActivityMonthYear(gridEnd)}`;
  const signalsByDay = activitySignals.reduce<Record<string, ActivitySignal[]>>((acc, signal) => {
    const key = toDateKey(startOfDay(signal.date));
    acc[key] = [...(acc[key] || []), signal];
    return acc;
  }, {});
  const activityWeeks = buildActivityWeeks(gridStart, fullWeekCount, signalsByDay, lang);
  const compactActivityWeeks = buildActivityWeeks(compactGridStart, compactWeekCount, signalsByDay, lang);
  const activityMonthLabels = getActivityMonthLabels(activityWeeks);
  const compactActivityMonthLabels = getActivityMonthLabels(compactActivityWeeks);
  const activityYearLabels = getActivityYearLabels(activityWeeks);
  const compactActivityYearLabels = getActivityYearLabels(compactActivityWeeks);
  const visibleSignals = getVisibleSignals(activitySignals, gridStart, gridEnd);
  const compactVisibleSignals = getVisibleSignals(activitySignals, compactGridStart, gridEnd);
  const activeDays = getActiveDayCount(visibleSignals);
  const compactActiveDays = getActiveDayCount(compactVisibleSignals);
  const totalSignals = visibleSignals.length;
  const compactTotalSignals = compactVisibleSignals.length;
  const activityLabel = `${labels.signalMap} ${activityRangeLabel}: ${totalSignals} ${labels.totalSignals}, ${activeDays} ${labels.activeDays}.`;
  const compactActivityLabel = `${labels.signalMap} ${compactActivityRangeLabel}: ${compactTotalSignals} ${labels.totalSignals}, ${compactActiveDays} ${labels.activeDays}.`;

  return {
    activeDays,
    activityLabel,
    activityMonthLabels,
    activityRangeLabel,
    activityWeekdayLabels,
    activityWeeks,
    activityYearLabels,
    blogSignalCount: visibleSignals.filter((signal) => signal.type === 'blog').length,
    compactActiveDays,
    compactActivityLabel,
    compactActivityMonthLabels,
    compactActivityRangeLabel,
    compactActivityWeeks,
    compactActivityYearLabels,
    compactBlogSignalCount: compactVisibleSignals.filter((signal) => signal.type === 'blog').length,
    compactGridStart,
    compactActivitySignalCount: compactVisibleSignals.filter((signal) => signal.type === 'activity').length,
    compactMilestoneSignalCount: compactVisibleSignals.filter((signal) => signal.type === 'milestone').length,
    gridEnd,
    gridStart,
    recentSignals: visibleSignals.slice(0, 6),
    activitySignalCount: visibleSignals.filter((signal) => signal.type === 'activity').length,
    milestoneSignalCount: visibleSignals.filter((signal) => signal.type === 'milestone').length,
  };
}
