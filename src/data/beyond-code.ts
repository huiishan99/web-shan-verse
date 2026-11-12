import { interests, type InterestItem } from './about.ts';
import { localizeString, type LocalizedString } from '../i18n/config.ts';

export type BeyondCodeCategoryId =
  | 'games' | 'movies' | 'drama' | 'books'
  | 'music' | 'foods' | 'hobbies' | 'topics';

export interface BeyondCodeCategory {
  id: BeyondCodeCategoryId;
  title: LocalizedString;
  icon: string;
}

export interface BeyondCodeNode {
  id: string;
  category: BeyondCodeCategoryId;
  type: 'work' | 'person' | 'group' | 'studio' | 'topic';
  title: LocalizedString;
  subtitle?: LocalizedString;
  wikiPage?: string;
  artwork?: string;
  externalUrl?: string;
  previewProvider?: 'itunes';
  itunesCountry?: string;
  itunesTerm?: LocalizedString;
  audioSrc?: string;
  /** Context explains a collection item; it does not assert another favorite. */
  isContext: boolean;
}

export type BeyondCodeRelationship =
  | 'performed-by' | 'written-by' | 'adapted-from'
  | 'produced-by' | 'shared-universe';

export interface BeyondCodeEdge {
  id: string;
  source: string;
  target: string;
  relationship: BeyondCodeRelationship;
  label: LocalizedString;
  provenance: {
    kind: 'existing-metadata' | 'official-source';
    source: string;
  };
}

export function resolveLocalized(value: LocalizedString | undefined, locale = 'en'): string {
  return localizeString(value, locale === 'zh' || locale === 'ja' ? locale : 'en');
}

const categoryIds: Record<string, BeyondCodeCategoryId> = {
  Games: 'games',
  Movies: 'movies',
  'Drama & Anime': 'drama',
  Books: 'books',
  Music: 'music',
  Foods: 'foods',
  Hobbies: 'hobbies',
  'Interests Topics': 'topics',
};

function categoryId(title: LocalizedString): BeyondCodeCategoryId {
  const id = categoryIds[resolveLocalized(title)];
  if (!id) throw new Error(`Unknown Beyond Code category: ${resolveLocalized(title)}`);
  return id;
}

function slug(value: string): string {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type WorkInterest = Extract<InterestItem, { title: LocalizedString }>;

function isWork(item: InterestItem): item is WorkInterest {
  return typeof item === 'object' && 'title' in item;
}

function collectionNode(item: InterestItem, category: BeyondCodeCategoryId): BeyondCodeNode {
  const work = isWork(item) ? item : undefined;
  const title = work ? work.title : item as LocalizedString;
  return {
    id: `${category}-${slug(resolveLocalized(title))}`,
    category,
    type: work ? 'work' : 'topic',
    title,
    subtitle: work?.artist,
    wikiPage: work?.wikiPage,
    externalUrl: work?.wikiPage
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(work.wikiPage.replaceAll(' ', '_'))}`
      : undefined,
    previewProvider: work?.previewProvider,
    itunesCountry: work?.itunesCountry,
    itunesTerm: work?.itunesTerm,
    audioSrc: work?.audioSrc,
    isContext: false,
  };
}

export const categories: BeyondCodeCategory[] = interests.map((category) => ({
  id: categoryId(category.name),
  title: category.name,
  icon: category.icon,
}));

// The About collection remains the single source of truth for personal interests.
const collectionNodes = interests.flatMap((category) =>
  category.items.map((item) => collectionNode(item, categoryId(category.name))),
);

const contextNodes: BeyondCodeNode[] = [
  {
    id: 'group-queen', category: 'music', type: 'group', title: 'Queen',
    subtitle: { en: 'Band', zh: '乐队', ja: 'バンド' }, isContext: true,
  },
  {
    id: 'person-kenshi-yonezu', category: 'music', type: 'person', title: 'Kenshi Yonezu',
    subtitle: { en: 'Artist', zh: '音乐人', ja: 'アーティスト' }, isContext: true,
  },
  {
    id: 'book-howls-moving-castle', category: 'books', type: 'work',
    title: { en: "Howl's Moving Castle", zh: '哈尔的移动城堡', ja: '魔法使いハウルと火の悪魔' },
    subtitle: { en: 'Source novel · Diana Wynne Jones', zh: '原作小说 · Diana Wynne Jones', ja: '原作小説 · ダイアナ・ウィン・ジョーンズ' },
    externalUrl: 'https://www.waltdisneystudios.jp/studio/ghibli/0601', isContext: true,
  },
  {
    id: 'person-diana-wynne-jones', category: 'books', type: 'person',
    title: { en: 'Diana Wynne Jones', ja: 'ダイアナ・ウィン・ジョーンズ' },
    subtitle: { en: 'Author', zh: '作家', ja: '作家' },
    externalUrl: 'https://www.ghibli.jp/works/howl/', isContext: true,
  },
  {
    id: 'studio-ghibli', category: 'movies', type: 'studio',
    title: { en: 'Studio Ghibli', zh: '吉卜力工作室', ja: 'スタジオジブリ' },
    externalUrl: 'https://www.ghibli.jp/works/howl/', isContext: true,
  },
  {
    id: 'studio-pixar', category: 'movies', type: 'studio',
    title: { en: 'Pixar', zh: '皮克斯', ja: 'ピクサー' },
    externalUrl: 'https://www.pixar.com/coco', isContext: true,
  },
];

export const nodes: BeyondCodeNode[] = [...collectionNodes, ...contextNodes];

const labels: Record<BeyondCodeRelationship, LocalizedString> = {
  'performed-by': { en: 'Performed by', zh: '演唱', ja: 'アーティスト' },
  'written-by': { en: 'Written by', zh: '作者', ja: '著者' },
  'adapted-from': { en: 'Adapted from', zh: '改编自', ja: '原作' },
  'produced-by': { en: 'Produced by', zh: '制作', ja: '制作' },
  'shared-universe': { en: 'Shared universe', zh: '共同世界观', ja: '共通の世界観' },
};

function edge(
  source: string, target: string, relationship: BeyondCodeRelationship,
  provenance: BeyondCodeEdge['provenance'],
): BeyondCodeEdge {
  return { id: `${source}--${relationship}--${target}`, source, target, relationship,
    label: labels[relationship], provenance };
}

const artistContextIds: Record<string, string> = {
  Queen: 'group-queen',
  'Kenshi Yonezu': 'person-kenshi-yonezu',
};

// Only existing artist metadata creates music links; category membership is not an edge.
const artistEdges = interests.flatMap((category) => category.items.flatMap((item) => {
  if (!isWork(item) || !item.artist) return [];
  const artist = resolveLocalized(item.artist);
  const target = artistContextIds[artist];
  if (!target) throw new Error(`Missing Beyond Code artist context: ${artist}`);
  return [edge(`${categoryId(category.name)}-${slug(resolveLocalized(item.title))}`, target,
    'performed-by', { kind: 'existing-metadata', source: 'src/data/about.ts#interests/Music/artist' })];
}));

const howlSource = { kind: 'official-source' as const, source: 'https://www.waltdisneystudios.jp/studio/ghibli/0601' };

export const edges: BeyondCodeEdge[] = [
  ...artistEdges,
  edge('movies-howls-moving-castle', 'book-howls-moving-castle', 'adapted-from', howlSource),
  edge('book-howls-moving-castle', 'person-diana-wynne-jones', 'written-by', howlSource),
  edge('movies-howls-moving-castle', 'studio-ghibli', 'produced-by', howlSource),
  edge('movies-coco', 'studio-pixar', 'produced-by', {
    kind: 'official-source', source: 'https://www.pixar.com/coco',
  }),
  edge('games-cyberpunk-2077', 'drama-cyberpunk-edgerunners', 'shared-universe', {
    kind: 'official-source',
    source: 'https://www.cyberpunk.net/en/news/35512/announcing-an-original-anime-series-cyberpunk-edgerunners',
  }),
];
