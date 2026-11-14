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
  type: 'work' | 'person' | 'group' | 'studio' | 'topic' | 'series';
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
  | 'produced-by' | 'shared-universe' | 'associated-with'
  | 'part-of' | 'style-of' | 'ingredient-of';

export interface BeyondCodeEdge {
  id: string;
  source: string;
  target: string;
  relationship: BeyondCodeRelationship;
  label: LocalizedString;
  provenance: {
    kind: 'existing-metadata' | 'official-source' | 'user-confirmed';
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

type DetailedInterest = Extract<InterestItem, { title: LocalizedString }>;

function hasInterestTitle(item: InterestItem): item is DetailedInterest {
  return typeof item === 'object' && 'title' in item;
}

function collectionNode(item: InterestItem, category: BeyondCodeCategoryId): BeyondCodeNode {
  const detail = hasInterestTitle(item) ? item : undefined;
  const title = detail ? detail.title : item as LocalizedString;
  return {
    id: detail?.id ?? `${category}-${slug(resolveLocalized(title))}`,
    category,
    type: detail ? detail.kind ?? 'work' : 'topic',
    title,
    subtitle: detail?.artist,
    wikiPage: detail?.wikiPage,
    externalUrl: detail?.wikiPage
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(detail.wikiPage.replaceAll(' ', '_'))}`
      : undefined,
    previewProvider: detail?.previewProvider,
    itunesCountry: detail?.itunesCountry,
    itunesTerm: detail?.itunesTerm,
    audioSrc: detail?.audioSrc,
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
  'associated-with': { en: 'Associated with', zh: '相关联', ja: '関連' },
  'part-of': { en: 'Part of series', zh: '属于系列', ja: 'シリーズ作品' },
  'style-of': { en: 'Style of', zh: '风格分支', ja: '系統' },
  'ingredient-of': { en: 'Ingredient for', zh: '食材', ja: '食材' },
};

function edge(
  source: string, target: string, relationship: BeyondCodeRelationship,
  provenance: BeyondCodeEdge['provenance'],
): BeyondCodeEdge {
  return { id: `${source}--${relationship}--${target}`, source, target, relationship,
    label: labels[relationship], provenance };
}

const artistNodeIds: Record<string, string> = {
  Queen: 'group-queen',
  'Kenshi Yonezu': 'person-kenshi-yonezu',
  'Fujii Kaze': 'music-fujii-kaze',
};

const artistSources: Record<string, BeyondCodeEdge['provenance']> = {
  'music-another-one-bites-the-dust': {
    kind: 'official-source', source: 'https://www.queenonline.com/news/the-game-44-years-on',
  },
  'music-matsuri': {
    kind: 'official-source', source: 'https://fujiikaze.com/gallery/matsuri_mv_bts/',
  },
  'music-kirari': {
    kind: 'official-source', source: 'https://fujiikaze.com/music/kirari/',
  },
};

// Only explicit artist metadata creates music links; a favorite artist is not inferred.
const artistEdges = interests.flatMap((category) => category.items.flatMap((item) => {
  if (!hasInterestTitle(item) || !item.artist) return [];
  const artist = resolveLocalized(item.artist);
  const target = artistNodeIds[artist];
  if (!target) throw new Error(`Missing Beyond Code artist context: ${artist}`);
  const source = collectionNode(item, categoryId(category.name)).id;
  return [edge(source, target, 'performed-by', artistSources[source]
    ?? { kind: 'existing-metadata', source: 'src/data/about.ts#interests/Music/artist' })];
}));

const approvedExpansion = {
  kind: 'user-confirmed' as const,
  source: 'docs/beyond-code-preview.md#approved-expansion-2026-11-14',
};
const trilogySource = {
  kind: 'official-source' as const,
  source: 'https://www.fathomentertainment.com/series/the-lord-of-the-rings-trilogy/',
};

export const edges: BeyondCodeEdge[] = [
  ...artistEdges,
  edge('movies-howls-moving-castle', 'studio-ghibli', 'produced-by', {
    kind: 'official-source', source: 'https://www.ghibli.jp/works/howl/',
  }),
  edge('movies-coco', 'studio-pixar', 'produced-by', {
    kind: 'official-source', source: 'https://www.pixar.com/coco',
  }),
  edge('movies-ratatouille', 'studio-pixar', 'produced-by', {
    kind: 'official-source', source: 'https://www.pixar.com/ratatouille',
  }),
  edge('movies-coco', 'movies-disney', 'associated-with', {
    kind: 'official-source', source: 'https://movies.disney.com/coco',
  }),
  edge('movies-ratatouille', 'movies-disney', 'associated-with', {
    kind: 'official-source', source: 'https://movies.disney.com/ratatouille',
  }),
  edge('topics-analytical-psychology', 'topics-carl-jung', 'associated-with', {
    kind: 'official-source', source: 'https://iaap.org/jung-analytical-psychology/carl-gustav-jung/',
  }),
  edge('movies-the-fellowship-of-the-ring', 'movies-the-lord-of-the-rings', 'part-of', trilogySource),
  edge('movies-the-two-towers', 'movies-the-lord-of-the-rings', 'part-of', trilogySource),
  edge('movies-the-return-of-the-king', 'movies-the-lord-of-the-rings', 'part-of', trilogySource),
  edge('foods-jiro-ramen', 'foods-ramen', 'style-of', approvedExpansion),
  edge('foods-otoro', 'foods-sushi', 'ingredient-of', approvedExpansion),
  edge('foods-wagyu', 'foods-yakiniku', 'ingredient-of', approvedExpansion),
  edge('foods-beef-tongue', 'foods-yakiniku', 'ingredient-of', approvedExpansion),
  edge('games-cyberpunk-2077', 'drama-cyberpunk-edgerunners', 'shared-universe', {
    kind: 'official-source',
    source: 'https://www.cyberpunk.net/en/news/35512/announcing-an-original-anime-series-cyberpunk-edgerunners',
  }),
];
