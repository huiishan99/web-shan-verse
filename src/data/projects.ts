// Projects & Publications Data
// 以后添加新项目只需编辑这个文件
import type { LocalizedString } from '../i18n/config';

export interface ProjectDetailImage {
    src: string;
    alt: LocalizedString;
    caption?: LocalizedString;
    fit?: 'cover' | 'contain';
    source?: { label: string; url: string }; // Attribution for a reference image
}

export interface ProjectAward {
    title: LocalizedString;
    image: string;
    alt: LocalizedString;
    caption?: LocalizedString;
}

export interface ProjectItem {
    slug?: string;            // 稳定详情页 URL；不设置时根据英文标题生成
    title: LocalizedString;
    description: LocalizedString;
    details?: LocalizedString;
    authors?: LocalizedString;
    conference?: LocalizedString;
    tags?: LocalizedString[];
    status?: ProjectStatus;
    featuredLabel?: LocalizedString;
    award?: ProjectAward;   // 获奖证书；详情图集中展示，并可由奖项按钮直接打开
    // 可选字段
    github?: string;        // GitHub 链接
    paper?: string;         // ACM / IEEE / DOI 等官方论文页
    caseStudy?: string;     // 自己网站上的项目或论文介绍页
    website?: string;       // 网站/演示链接
    image?: string;         // 预览图路径 (放在 public/images/projects/)
    detailImage?: string;   // 详情弹窗图片；不设置时可回退到预览图
    detailImageAlt?: LocalizedString;
    detailImageFit?: 'cover' | 'contain';
    detailImages?: ProjectDetailImage[]; // 多图详情；设置后优先于单图字段
    featured?: boolean;     // 是否为精选项目
}

export interface ProjectCategory {
    id: string;             // 用于 HTML id 锚点
    title: LocalizedString;          // 显示的标题
    icon: string;           // 图标名称，参考 src/components/Icon.astro
    items: ProjectItem[];
}

export type ProjectStatus =
    | "live"
    | "prototype"
    | "coursework"
    | "practice"
    | "in-preparation"
    | "under-review"
    | "accepted"
    | "early-stage"
    | "on-hold"
    | "awaiting-coordination"
    | "publication"
    | "thesis"
    | "bachelor-thesis"
    | "private"
    | "archive";

export const projectCategories: ProjectCategory[] = [
    {
        id: "unity",
        title: { en: "Unity Projects", zh: "Unity 项目", ja: "Unity プロジェクト" },
        icon: "cube",
        items: [
            {
                slug: "vr-car-scene-prototype",
                title: {
                    "en": "Digital Cabin HMI Prototype",
                    "zh": "数字座舱 HMI 原型",
                    "ja": "デジタルコックピット HMI プロトタイプ"
                },
                description: {
                    "en": "Unity HMI prototype developed for an assigned Digital Cabin topic during my ALPS ALPINE internship.",
                    "zh": "在 ALPS ALPINE 实习期间，使用 Unity 完成 Digital Cabin 相关课题的 HMI 原型开发。",
                    "ja": "ALPS ALPINE のインターンシップで、Digital Cabin に関連する課題に取り組み、Unity で開発した HMI プロトタイプ。"
                },
                details: {
                    "en": "My internship work focused on a Unity prototype for an assigned automotive HMI topic, using a U.S. highway autonomous-driving scenario to explore next-generation interface concepts.",
                    "zh": "我的实习工作聚焦于指定的汽车 HMI 课题，使用 Unity 构建美国高速公路自动驾驶场景，探索下一代交互界面概念。",
                    "ja": "インターンシップでは、与えられた車載 HMI の課題に取り組みました。Unity で米国の高速道路を舞台にした自動運転シナリオを構築し、次世代インターフェースのコンセプトを検討しました。"
                },
                image: "/images/projects/alps-alpine-digital-cabin-reference.png",
                detailImages: [{
                    src: "/images/projects/alps-alpine-digital-cabin-reference.png",
                    alt: {
                        en: "Alps Alpine Digital Cabin reference showing a panoramic dashboard, steering control, and center touchscreen",
                        zh: "阿尔派 Digital Cabin 参考图，展示全景仪表台、转向控制器与中央触控屏",
                        ja: "パノラマ型ダッシュボード、ステアリング、中央タッチスクリーンを示すアルプスアルパイン Digital Cabin の参考画像"
                    },
                    caption: {
                        en: "Alps Alpine Digital Cabin · Reference image",
                        zh: "阿尔派 Digital Cabin · 参考图",
                        ja: "アルプスアルパイン Digital Cabin · 参考画像"
                    },
                    source: { label: "webCG", url: "https://www.webcg.net/articles/-/43538" },
                    fit: "contain"
                }],
                featured: true,
                tags: [
                    "Unity",
                    "HMI",
                    "Digital Cabin"
                ]
            },
            {
                slug: "ar-image-tracking",
                status: "prototype",
                title: "AR Image tracking",
                description: {
                    en: "Unity AR image-tracking practice project that places and controls 3D dragon assets in an AR scene.",
                    zh: "Unity AR 图像追踪练习项目，在 AR 场景中放置并控制 3D 龙模型资源。",
                    ja: "Unity の AR 画像認識練習プロジェクト。AR シーン上に 3D ドラゴンアセットを配置し、操作します。"
                },
                github: "https://github.com/huiishan99/unity-ar-image-tracking",
                tags: ["Unity", "C#", "AR Foundation"]
            },
            {
                slug: "mamba-project",
                status: "prototype",
                title: "Mamba Project",
                description: {
                    en: "University of Aizu CFS03 Unity VR project using an Oculus/XR scene and human anatomy model assets.",
                    zh: "会津大学 CFS03 Unity VR 项目，使用 Oculus/XR 场景和人体解剖模型资源。",
                    ja: "会津大学 CFS03 の Unity VR プロジェクト。Oculus/XR シーンと人体解剖モデルアセットを使用しています。"
                },
                github: "https://github.com/huiishan99/uoa-cfs03-unity-manba-project",
                tags: ["Unity", "C#", "VR", "Oculus"]
            },
            {
                slug: "master-project",
                status: "prototype",
                title: "Master Project",
                description: {
                    en: "Unity VR classroom research prototype with an embodied avatar, speech services, and a Python backend.",
                    zh: "Unity VR 教室研究原型，包含具身头像、语音服务和 Python 后端。",
                    ja: "身体化アバター、音声サービス、Python バックエンドを備えた Unity VR 教室研究プロトタイプ。"
                },
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                tags: ["Unity", "C#", "Python", "VR"]
            },
            {
                slug: "solar-system",
                title: "Solar System",
                description: {
                    en: "Unity practice scene simulating the rotation and revolution of the Sun, Earth, and Moon.",
                    zh: "Unity 练习场景，模拟太阳、地球和月球的自转与公转。",
                    ja: "太陽・地球・月の自転と公転をシミュレーションする Unity 練習シーン。"
                },
                github: "https://github.com/huiishan99/unity-solar-system",
                tags: ["Unity", "C#", "3D"]
            },
            {
                slug: "2d-platformer",
                title: "2D Platformer",
                description: {
                    "en": "Unity and C# practice project for a 2D platform-jumping game.",
                    "zh": "使用 Unity 与 C# 制作的 2D 平台跳跃游戏练习项目。",
                    "ja": "Unity と C# で制作した 2D プラットフォームゲームの練習プロジェクト。"
                },
                github: "",
                tags: ["Unity", "C#", "2D"]
            },
            {
                slug: "2d-shooter-game",
                title: "2D Shooter Game",
                description: {
                    en: "Unity 2D spaceship shooter with enemies, projectiles, level scenes, score UI, and menu flow.",
                    zh: "Unity 2D 太空射击游戏，包含敌人、子弹、关卡场景、分数 UI 和菜单流程。",
                    ja: "敵、弾、レベルシーン、スコア UI、メニュー導線を備えた Unity 2D 宇宙船シューティングゲーム。"
                },
                github: "https://github.com/huiishan99/unity-2d-shooter-game",
                website: "https://huiishan99.itch.io/2d-shooter",
                image: "/images/projects/2d-shooter-gameplay.webp",
                detailImages: [
                    {
                        src: "/images/projects/2d-shooter-gameplay.webp",
                        alt: {
                            en: "Running 2D Shooter WebGL gameplay with the player ship and three enemies",
                            zh: "正在运行的 2D Shooter WebGL 游戏画面，包含玩家飞船与三架敌机",
                            ja: "プレイヤー機と3機の敵が表示された 2D Shooter WebGL の実行画面"
                        },
                        caption: {
                            en: "Live WebGL build · Gameplay captured from the public itch.io release",
                            zh: "WebGL 在线版本 · 截取自公开的 itch.io 游戏运行画面",
                            ja: "WebGL 公開版 · itch.io 上で実行したゲームプレイ画面"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/2d-shooter-menu.webp",
                        alt: {
                            en: "2D Shooter WebGL main menu with new game, level select, instructions, and exit buttons",
                            zh: "2D Shooter WebGL 主菜单，包含新游戏、关卡选择、说明与退出按钮",
                            ja: "ニューゲーム、レベル選択、操作説明、終了ボタンを備えた 2D Shooter WebGL のメインメニュー"
                        },
                        caption: {
                            en: "Live WebGL build · Main menu",
                            zh: "WebGL 在线版本 · 主菜单",
                            ja: "WebGL 公開版 · メインメニュー"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["Unity", "C#", "2D", "Game UI"]
            },
            {
                slug: "kitchen-chaos",
                title: "Kitchen Chaos",
                description: {
                    en: "Overcooked-style Unity cooking practice project with counters, ingredients, cutting recipes, and player input.",
                    zh: "Overcooked 风格的 Unity 烹饪练习项目，包含操作台、食材、切菜配方和玩家输入。",
                    ja: "カウンター、食材、カットレシピ、プレイヤー入力を含む Overcooked 風の Unity 料理練習プロジェクト。"
                },
                github: "https://github.com/huiishan99/unity-kitchen-chaos",
                tags: ["Unity", "C#", "Input System"]
            }
        ]
    },
    {
        id: "web",
        title: { en: "Web Projects", zh: "Web 项目", ja: "Web プロジェクト" },
        icon: "globe",
        items: [
            {
                slug: "shan-verse",
                title: "SHAN-VERSE",
                description: {
                    "en": "Astro and MDX portfolio and blog with multilingual pages, project galleries, and a personal timeline.",
                    "zh": "使用 Astro 与 MDX 构建的作品集与博客，包含多语言页面、项目图集和个人时间线。",
                    "ja": "Astro と MDX で構築したポートフォリオ兼ブログ。多言語ページ、プロジェクトギャラリー、個人年表を備えています。"
                },
                details: {
                    "en": "Astro generates static pages from MDX articles and TypeScript project and timeline data. Custom CSS and interactive components provide the layout, galleries, and project dialogs. TypeScript checks, ESLint, unit tests, and Playwright validate the site.",
                    "zh": "Astro 将 MDX 文章及 TypeScript 项目与时间线数据生成为静态页面；自定义 CSS 与交互组件实现布局、图集和项目详情弹窗。使用 TypeScript 检查、ESLint、单元测试与 Playwright 验证网站。",
                    "ja": "Astro が MDX 記事と TypeScript のプロジェクト・年表データから静的ページを生成します。独自の CSS と対話型コンポーネントでレイアウト、ギャラリー、詳細ダイアログを実装。TypeScript、ESLint、単体テスト、Playwright で検証しています。"
                },
                detailImage: "/images/header_galaxy.jpg",
                detailImageAlt: {
                    en: "Galaxy artwork used by the SHAN-VERSE interface",
                    zh: "SHAN-VERSE 界面使用的银河视觉",
                    ja: "SHAN-VERSE のインターフェースで使用している銀河のビジュアル"
                },
                github: "https://github.com/huiishan99/web-blog",
                website: "https://shan-verse.com",
                tags: ["Astro", "MDX", "TypeScript", "CSS"]
            },
            {
                slug: "furigana-for-spotify",
                title: "Furigana for Spotify",
                description: {
                    "en": "TypeScript Spicetify extension adding Japanese lyric readings and optional Windows/macOS desktop overlays. Requires Spicetify.",
                    "zh": "TypeScript 编写的 Spicetify 扩展，为日语歌词添加注音，并提供可选的 Windows/macOS 桌面歌词悬浮窗。需要先安装 Spicetify。",
                    "ja": "TypeScript 製の Spicetify 拡張。日本語歌詞の読みと、任意の Windows/macOS デスクトップ歌詞表示を追加します。Spicetify が必要です。"
                },
                details: {
                    "en": "Kuroshiro and Kuromoji generate hiragana, katakana, or romaji locally, with optional online lookup. Desktop overlays use PowerShell/WPF on Windows and Swift/AppKit on macOS; the Windows launcher uses C#. esbuild bundles the extension and Vitest tests its logic. Requires Spotify Desktop and Spicetify. This independent project is not affiliated with Spotify AB.",
                    "zh": "Kuroshiro 与 Kuromoji 在本地生成平假名、片假名或罗马字，也支持可选的在线查询。桌面歌词在 Windows 上使用 PowerShell/WPF，在 macOS 上使用 Swift/AppKit；Windows 启动器使用 C#。扩展由 esbuild 打包、Vitest 测试。需要 Spotify 桌面版与 Spicetify。本项目独立开发，与 Spotify AB 无隶属关系。",
                    "ja": "Kuroshiro と Kuromoji でひらがな・カタカナ・ローマ字をローカル生成し、任意のオンライン検索にも対応します。デスクトップ表示には Windows で PowerShell/WPF、macOS で Swift/AppKit を使用し、Windows ランチャーは C# 製です。esbuild でビルドし、Vitest でテスト。Spotify Desktop と Spicetify が必要です。Spotify AB とは無関係の独立したプロジェクトです。"
                },
                status: "live",
                github: "https://github.com/huiishan99/extension-Furigana-for-Spotify",
                image: "/images/projects/spotify-furigana-lyrics.webp",
                detailImages: [
                    {
                        src: "/images/projects/spotify-furigana-lyrics.webp",
                        alt: {
                            en: "Spotify Desktop on Windows showing Japanese lyrics with furigana in a real v0.5.1 capture",
                            zh: "v0.5.1 的真实 Windows Spotify 桌面版截图，展示日语歌词上方的注音",
                            ja: "Windows 版 Spotify Desktop で日本語歌詞にふりがなを表示した v0.5.1 の実画面"
                        },
                        caption: {
                            en: "Real Windows capture · v0.5.1 · Spotify 1.2.97.270 / Spicetify 2.44.0. Spotify UI, artwork, and lyrics belong to their respective rights holders.",
                            zh: "Windows 实机截图 · v0.5.1 · Spotify 1.2.97.270 / Spicetify 2.44.0。Spotify 界面、封面与歌词的权利归各自权利人所有。",
                            ja: "Windows 実機キャプチャ · v0.5.1 · Spotify 1.2.97.270 / Spicetify 2.44.0。UI、アートワーク、歌詞の権利は各権利者に帰属します。"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/spotify-furigana-social-preview.webp",
                        alt: {
                            en: "Furigana for Spotify promotional graphic incorporating the real v0.5.1 lyrics screenshot",
                            zh: "使用真实 v0.5.1 歌词截图制作的 Furigana for Spotify 项目宣传图",
                            ja: "v0.5.1 の実際の歌詞画面を使用した Furigana for Spotify の紹介画像"
                        },
                        caption: {
                            en: "Repository promotional composite · Uses the v0.5.1 capture; not a new runtime screenshot",
                            zh: "仓库宣传合成图 · 使用 v0.5.1 实机素材，并非新版运行截图",
                            ja: "リポジトリの紹介用合成画像 · v0.5.1 の実画面を使用。新バージョンの実行画面ではありません"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["TypeScript", "Spicetify", "Kuroshiro / Kuromoji", "PowerShell / WPF", "Swift / AppKit", "C#"]
            },
            {
                slug: "notion-next-chinese-blog",
                title: "Notion Next Chinese Blog",
                description: {
                    en: "Forked NotionNext deployment for a Notion-powered blog using Next.js and the Notion API.",
                    zh: "基于 NotionNext 的部署实验，使用 Next.js 和 Notion API 搭建 Notion 驱动博客。",
                    ja: "Next.js と Notion API を使った Notion ベースのブログ用に、NotionNext をフォークしてデプロイしたもの。"
                },
                github: "https://github.com/huiishan99/web-notion-next",
                website: "https://notion-next-huiishan99.vercel.app/",
                tags: ["Next.js", "Notion API", "JavaScript"]
            },
            {
                slug: "math-note",
                title: "Math-Note",
                description: {
                    "en": "React/TypeScript math notebook with a drawing canvas, local pages, and export. AI solving is currently disabled in the public demo.",
                    "zh": "React/TypeScript 数学笔记本，支持手写画布、本地页面保存与导出。公开演示的 AI 求解目前尚未开放。",
                    "ja": "React/TypeScript の数学ノート。手書きキャンバス、ローカル保存、書き出しに対応。公開デモの AI 求解は現在無効です。"
                },
                details: {
                    "en": "React, TypeScript, Tailwind CSS, and Mantine provide a multi-page canvas with pen/eraser tools, undo/redo, local storage, and JSON/PDF export. A Python/FastAPI backend integrates the Google Gen AI SDK for image solving; MathJax renders equations and Vite builds the frontend. Public AI requests remain disabled pending Turnstile configuration.",
                    "zh": "React、TypeScript、Tailwind CSS 与 Mantine 实现多页画布、画笔/橡皮、撤销/重做、本地存储和 JSON/PDF 导出。Python/FastAPI 后端通过 Google Gen AI SDK 实现图像求解，MathJax 渲染公式，Vite 构建前端。公开 AI 请求仍因 Turnstile 配置未完成而关闭。",
                    "ja": "React、TypeScript、Tailwind CSS、Mantine で複数ページのキャンバス、ペン・消しゴム、元に戻す・やり直す、ローカル保存、JSON/PDF 出力を実装。Python/FastAPI のバックエンドが Google Gen AI SDK で画像を処理し、MathJax で数式を表示、Vite でフロントエンドをビルドします。Turnstile 設定が完了するまで公開 AI リクエストは無効です。"
                },
                status: "prototype",
                github: "https://github.com/huiishan99/web-math-note",
                image: "/images/projects/math-note-live.webp",
                website: "https://math-notes-clone.vercel.app/",
                detailImages: [
                    {
                        src: "/images/projects/math-note-live.webp",
                        alt: {
                            en: "Math-Note drawing canvas with handwritten input and a banner explaining that AI solving is waiting for bot-protection setup",
                            zh: "Math-Note 手写画布与输入内容，提示 AI 求解正在等待人机验证配置",
                            ja: "手書き入力と、AI 求解がボット対策の設定待ちであることを示す Math-Note キャンバス"
                        },
                        caption: {
                            en: "Public drawing demo · Captured 8 October 2026; AI solving disabled pending Turnstile setup",
                            zh: "公开绘图演示 · 截于 2026 年 10 月 8 日；AI 求解因 Turnstile 待配置而关闭",
                            ja: "公開の描画デモ · 2026年10月8日撮影。Turnstile 設定待ちのため AI 求解は無効"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["TypeScript", "Python", "React", "FastAPI", "Tailwind CSS", "Vite"]
            },
            {
                slug: "yumemi-test",
                title: "Yumemi Test",
                description: {
                    en: "React/TypeScript frontend exercise for Japanese prefecture population charts, using Highcharts and Axios. The current demo's data API is unavailable.",
                    zh: "基于 React/TypeScript 的日本都道府县人口图表前端练习，使用 Highcharts 与 Axios；当前演示的数据 API 暂不可用。",
                    ja: "React/TypeScript、Highcharts、Axios を使った都道府県別人口グラフのフロントエンド課題。公開デモでは現在データ API を利用できません。"
                },
                details: {
                    "en": "React Hooks manage prefecture selection and population categories, Axios requests data, and Highcharts draws comparison charts. Responsive CSS supports light and dark themes. Vite builds the app; tests use Vitest and React Testing Library. The public interface loads, but its original data API is unavailable.",
                    "zh": "React Hooks 管理都道府县选择与人口分类，Axios 请求数据，Highcharts 绘制对比图表。响应式 CSS 支持明暗主题，Vite 构建应用，Vitest 与 React Testing Library 用于测试。公开界面可加载，但原有数据 API 暂不可用。",
                    "ja": "React Hooks で都道府県選択と人口区分を管理し、Axios でデータを取得、Highcharts で比較グラフを描画します。レスポンシブ CSS は明暗テーマに対応。Vite でビルドし、Vitest と React Testing Library でテストします。公開画面は表示されますが、元のデータ API は現在利用できません。"
                },
                status: "prototype",
                github: "https://github.com/huiishan99/web-yumemi-test",
                website: "https://web-yumemi-test.vercel.app/",
                image: "/images/projects/yumemi-test-live.webp",
                detailImages: [
                    {
                        src: "/images/projects/yumemi-test-live.webp",
                        alt: {
                            en: "Yumemi population-chart interface showing population-category buttons, a data-loading error, and an empty Highcharts chart",
                            zh: "Yumemi 人口图表界面，显示人口分类按钮、数据加载失败提示与空白 Highcharts 图表",
                            ja: "人口区分ボタン、データ取得エラー、空の Highcharts グラフを表示した Yumemi の画面"
                        },
                        caption: {
                            en: "Current public interface · Captured 8 October 2026; data API unavailable",
                            zh: "当前线上界面 · 截于 2026 年 10 月 8 日；数据 API 暂不可用",
                            ja: "現在の公開画面 · 2026年10月8日撮影。データ API は利用不可"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["TypeScript", "React", "Highcharts", "Axios", "CSS", "Vite"]
            },
            {
                slug: "weather-app",
                title: "Weather App",
                description: {
                    "en": "HTML, CSS, and JavaScript weather app with city search, OpenWeather data, and weather-specific illustrations.",
                    "zh": "使用 HTML、CSS 和 JavaScript 构建的天气应用，支持城市搜索、OpenWeather 数据与天气插图。",
                    "ja": "HTML、CSS、JavaScript 製の天気アプリ。都市検索、OpenWeather データ、天気別のイラストを備えています。"
                },
                github: "https://github.com/huiishan99/web-weather-app",
                website: "https://js-weather-app-nine-wine.vercel.app",
                image: "/images/projects/weather-app-live.webp",
                detailImages: [
                    {
                        src: "/images/projects/weather-app-live.webp",
                        alt: {
                            en: "Running Weather App with a centered location search field on a blue interface",
                            zh: "正在运行的 Weather App，蓝色界面中央显示地点搜索框",
                            ja: "青い画面中央に地域検索欄を表示した、実行中の Weather App"
                        },
                        caption: {
                            en: "Live deployment · Location search interface",
                            zh: "在线部署 · 地点搜索界面",
                            ja: "公開デプロイ · 地域検索インターフェース"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["HTML", "CSS", "JavaScript", "OpenWeather API"]
            },
            {
                slug: "falling-sand",
                title: "Falling Sand",
                description: {
                    "en": "JavaScript and p5.js falling-sand sandbox with material rules, draggable controls, and pause/step tools; built with Vite.",
                    "zh": "使用 JavaScript 与 p5.js 构建的落沙沙盒，包含材料规则、可拖拽控件及暂停/单步工具，由 Vite 构建。",
                    "ja": "JavaScript と p5.js による落ち砂サンドボックス。素材ルール、ドラッグ操作、一時停止・ステップ機能を備え、Vite でビルドします。"
                },
                github: "https://github.com/huiishan99/web-falling-sand",
                website: "https://huiishan99.github.io/web-falling-sand/",
                image: "/images/projects/falling-sand-live.webp",
                detailImages: [
                    {
                        src: "/images/projects/falling-sand-live.webp",
                        alt: {
                            en: "Running Falling Sand simulation with an hourglass, falling grains, controls, and statistics",
                            zh: "正在运行的 Falling Sand 沙粒模拟，显示沙漏、下落颗粒、控制栏与统计信息",
                            ja: "砂時計、落下する粒子、操作パネル、統計を表示した Falling Sand の実行画面"
                        },
                        caption: {
                            en: "Live deployment · Interactive hourglass simulation",
                            zh: "在线部署 · 交互式沙漏模拟",
                            ja: "公開デプロイ · インタラクティブ砂時計シミュレーション"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["JavaScript", "p5.js", "Vite"]
            },
            {
                slug: "dark-light-toggle",
                title: "Dark Light Toggle",
                description: {
                    en: "Small HTML, CSS, and JavaScript UI experiment for an animated dark/light mode toggle.",
                    zh: "用 HTML、CSS 和 JavaScript 制作的暗色/亮色模式切换动画小实验。",
                    ja: "HTML、CSS、JavaScript で作った、ダーク/ライトモード切り替えアニメーションの小さな UI 実験。"
                },
                github: "https://github.com/huiishan99/web-dark-light-toggle",
                website: "https://huiishan99.github.io/web-dark-light-toggle/",
                image: "/images/projects/dark-light-toggle-live.webp",
                detailImages: [
                    {
                        src: "/images/projects/dark-light-toggle-live.webp",
                        alt: {
                            en: "Animated desert landscape used by the running dark and light mode toggle demo",
                            zh: "正在运行的明暗模式切换演示所使用的动态沙漠景观",
                            ja: "ダーク／ライト切替デモで表示される、実行中の砂漠アニメーション"
                        },
                        caption: {
                            en: "Live deployment · Animated theme toggle",
                            zh: "在线部署 · 动态主题切换",
                            ja: "公開デプロイ · アニメーション付きテーマ切替"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["HTML", "CSS", "JavaScript"]
            },
            {
                slug: "dreamlight",
                title: "DreamLight",
                description: {
                    "en": "HTML, SCSS, and JavaScript promotional site for a BitSummit 2024 light-show and drone game concept.",
                    "zh": "使用 HTML、SCSS 和 JavaScript 制作的宣传网站，介绍 BitSummit 2024 灯光秀与无人机游戏概念。",
                    "ja": "HTML、SCSS、JavaScript で制作した、BitSummit 2024 向けライトショー・ドローンゲーム構想の紹介サイト。"
                },
                github: "https://github.com/huiishan99/web-dreamlight",
                website: "https://web-dreamlight.vercel.app/",
                image: "/images/projects/dreamlight-live.webp",
                detailImages: [
                    {
                        src: "/images/projects/dreamlight-live.webp",
                        alt: {
                            en: "Running DreamLight promotional landing page for BitSummit 2024",
                            zh: "正在运行的 DreamLight BitSummit 2024 宣传落地页",
                            ja: "BitSummit 2024 向け DreamLight プロモーションページの実行画面"
                        },
                        caption: {
                            en: "Live deployment · BitSummit 2024 promotional site",
                            zh: "在线部署 · BitSummit 2024 宣传网站",
                            ja: "公開デプロイ · BitSummit 2024 プロモーションサイト"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["HTML", "SCSS", "JavaScript"]
            },
            {
                slug: "hexo-page",
                title: {
                    en: "Research Archive",
                    zh: "研究成果档案",
                    ja: "研究成果アーカイブ"
                },
                description: {
                    en: "Personal research website built with Hexo, Markdown, and custom EJS templates, with dedicated pages for publications and theses.",
                    zh: "使用 Hexo、Markdown 与定制 EJS 模板构建的个人研究网站，为论文与学位研究提供独立介绍页。",
                    ja: "Hexo、Markdown、独自の EJS テンプレートで構築した個人研究サイト。論文と学位研究ごとに専用ページを設けています。"
                },
                details: {
                    en: "HuiShan Lai's Research Archive brings public publications and thesis pages into one browsable index. The website uses Hexo to generate static pages from Markdown content and custom EJS templates, with CSS styling and JavaScript interactions. Vercel hosts the generated site. Each work's page provides its existing overview, figures, manuscript links, and citation information, with DOI or publisher links and BibTeX where available.",
                    zh: "HuiShan Lai 的研究成果档案将已公开的论文与学位研究页面汇集到统一目录中。网站使用 Hexo，将 Markdown 内容与定制 EJS 模板生成静态页面，以 CSS 实现样式、JavaScript 提供交互，并部署在 Vercel。各项工作页面呈现已有的概述、图示、文稿链接与引用信息，并按实际情况提供 DOI、出版方链接和 BibTeX。",
                    ja: "HuiShan Lai の研究成果アーカイブは、公開済みの論文と学位研究のページを一つの一覧にまとめたサイトです。Hexo を用いて Markdown の内容と独自の EJS テンプレートから静的ページを生成し、CSS でスタイル、JavaScript で操作機能を実装。生成したサイトは Vercel で公開しています。各成果のページには既存の概要、図、原稿リンク、引用情報を掲載し、利用可能な DOI・出版社リンク・BibTeX も提供します。"
                },
                status: "live",
                website: "https://web-publications.vercel.app/",
                image: "/images/projects/research-archive-index.webp",
                detailImages: [
                    {
                        src: "/images/projects/research-archive-index.webp",
                        alt: {
                            en: "HuiShan Lai's public research archive homepage showing the Research heading and Publications section",
                            zh: "HuiShan Lai 公开研究网站首页，显示 Research 标题与 Publications 论文目录",
                            ja: "Research の見出しと Publications 一覧を表示した HuiShan Lai の公開研究サイトのトップページ"
                        },
                        caption: {
                            en: "Live research website · Homepage captured on 8 October 2026",
                            zh: "研究网站实景 · 首页截于 2026 年 10 月 8 日",
                            ja: "公開研究サイトの実画面 · 2026年10月8日にトップページを撮影"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["Hexo", "JavaScript", "Markdown", "EJS", "CSS"]
            },
            {
                slug: "notion-resume",
                title: "Notion Resume",
                description: {
                    en: "Minimal Notion-based personal page and resume hub linking to my public Notion home.",
                    zh: "简洁的 Notion 个人主页与简历入口，链接到我的公开 Notion 首页。",
                    ja: "公開 Notion ホームにつながる、ミニマルな Notion ベースの個人ページ兼履歴書ハブ。"
                },
                github: "https://github.com/huiishan99/web-notion-resume",
                website: "",
                tags: ["Notion", "CV"]
            },
            {
                slug: "silver-game",
                title: "Silver Game",
                description: {
                    "en": "Next.js, React, and TypeScript hackathon frontend for an older-adult social platform, connected to FastAPI/PyTorch emotion analysis.",
                    "zh": "使用 Next.js、React 和 TypeScript 构建的黑客松前端，为面向老年人的社交平台接入 FastAPI/PyTorch 情绪分析。",
                    "ja": "Next.js、React、TypeScript 製のハッカソン用フロントエンド。高齢者向け交流プラットフォームに FastAPI/PyTorch の感情分析を接続します。"
                },
                github: "https://github.com/huiishan99/web-ai-in-action-frontend",
                website: "https://web-ai-in-action-frontend.vercel.app",
                image: "/images/projects/silver-game-live.webp",
                detailImages: [
                    {
                        src: "/images/projects/silver-game-live.webp",
                        alt: {
                            en: "Running Silver Game dashboard with chat rooms, contacts, and navigation controls",
                            zh: "正在运行的 Silver Game 仪表盘，显示聊天室、联系人与导航控制",
                            ja: "チャットルーム、連絡先、ナビゲーションを表示した Silver Game ダッシュボードの実行画面"
                        },
                        caption: {
                            en: "Live deployment · Social platform dashboard",
                            zh: "在线部署 · 社交平台仪表盘",
                            ja: "公開デプロイ · ソーシャルプラットフォームのダッシュボード"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["Next.js", "React", "TypeScript", "FastAPI", "PyTorch"]
            },
            {
                slug: "ai-imageforge",
                title: "AI-ImageForge",
                description: {
                    en: "Streamlit AI image-generation app with Hugging Face models, style prompts, and GPU detection.",
                    zh: "Streamlit AI 图像生成应用，使用 Hugging Face 模型、风格提示词和 GPU 检测。",
                    ja: "Hugging Face モデル、スタイルプロンプト、GPU 検出を備えた Streamlit 製 AI 画像生成アプリ。"
                },
                github: "https://github.com/huiishan99/web-genAI",
                tags: ["Python", "Streamlit", "Hugging Face", "Diffusers"]
            }
        ]
    },
    {
        id: "school",
        title: { en: "School Project", zh: "学校项目", ja: "学校プロジェクト" },
        icon: "graduation",
        items: [
            {
                "slug": "wireless-and-mobile-networks",
                "title": {
                    "en": "Wireless and Mobile Networks",
                    "zh": "无线与移动网络",
                    "ja": "無線・モバイルネットワーク"
                },
                "description": {
                    "en": "University of Aizu CNC05A coursework archive of written assignments and reports on wireless and mobile networks.",
                    "zh": "会津大学 CNC05A 课程作业记录，包含无线与移动网络相关的书面练习和报告。",
                    "ja": "会津大学 CNC05A の授業記録。無線・モバイルネットワークの筆記課題とレポートをまとめています。"
                },
                "tags": [
                    "Wireless Networks",
                    "Mobile Networks",
                    "Coursework"
                ],
                "status": "coursework"
            },
            {
                "slug": "mathematics-and-post-quantum-cryptography",
                "title": {
                    "en": "Mathematics and Post-Quantum Cryptography",
                    "zh": "数学与后量子密码学",
                    "ja": "数学と耐量子計算機暗号"
                },
                "description": {
                    "en": "University of Aizu CSA23 coursework archive of mathematics and post-quantum cryptography exercises and a written report.",
                    "zh": "会津大学 CSA23 课程作业记录，包含数学、后量子密码学练习和书面报告。",
                    "ja": "会津大学 CSA23 の授業記録。数学・耐量子計算機暗号の演習とレポートをまとめています。"
                },
                "tags": [
                    "Mathematics",
                    "Post-Quantum Cryptography",
                    "Coursework"
                ],
                "status": "coursework"
            },
            {
                "slug": "numerical-modeling-and-simulations",
                "title": {
                    "en": "Numerical Modeling and Simulations",
                    "zh": "数值建模与仿真",
                    "ja": "数値モデリングとシミュレーション"
                },
                "description": {
                    "en": "University of Aizu CSC08A coursework on floating-point representation, precision, and summation order through written exercises and C examples.",
                    "zh": "会津大学 CSC08A 课程作业，通过书面练习与 C 语言示例探讨浮点表示、精度和求和顺序。",
                    "ja": "会津大学 CSC08A の授業課題。筆記演習と C のコード例を通じて、浮動小数点表現、精度、加算順序を扱います。"
                },
                "tags": [
                    "C",
                    "Numerical Computing",
                    "Floating-Point Arithmetic"
                ],
                "status": "coursework"
            },
            {
                "slug": "research-paper-writing-seminar",
                "title": {
                    "en": "Research Paper Writing Seminar I",
                    "zh": "研究论文写作研讨 I",
                    "ja": "研究論文ライティング演習 I"
                },
                "description": {
                    "en": "University of Aizu RPW1 academic-writing coursework on literature surveys, paper structure, titles and abstracts, and technical reporting.",
                    "zh": "会津大学 RPW1 学术写作课程作业，涵盖文献调研、论文结构、标题与摘要和技术报告。",
                    "ja": "会津大学 RPW1 の学術ライティング課題。文献調査、論文構成、タイトル・要旨、技術レポートを扱います。"
                },
                "tags": [
                    "Academic Writing",
                    "Literature Review",
                    "Coursework"
                ],
                "status": "coursework"
            },
            {
                slug: "embodied-avatars-generative-ai-vr-classroom-coursework",
                title: "The Role of Embodied Avatars and Generative AI in Self Learning VR Classroom",
                description: {
                    en: "Unity 2022.3 master's thesis project with VR classroom scenes, Convai avatar components, speech services, and a Python backend.",
                    zh: "基于 Unity 2022.3 的硕士论文项目，包含 VR 教室场景、Convai 头像组件、语音服务和 Python 后端。",
                    ja: "Unity 2022.3 を用いた修士論文プロジェクト。VR 教室シーン、Convai アバターコンポーネント、音声サービス、Python バックエンドを含みます。"
                },
                featured: true,
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                tags: ["Master's Thesis", "Unity", "C#", "Python", "VR"]
            },
            {
                slug: "human-activity-pattern-processing",
                title: "Human Activity Pattern Processing",
                description: {
                    "en": "University of Aizu ITA09 Python/Jupyter coursework on activity recognition, signal alignment, and signature matching using NumPy, pandas, Matplotlib, and scikit-learn.",
                    "zh": "会津大学 ITA09 Python/Jupyter 课程作业，使用 NumPy、pandas、Matplotlib 与 scikit-learn 练习活动识别、信号对齐和签名匹配。",
                    "ja": "会津大学 ITA09 の Python/Jupyter 課題。NumPy、pandas、Matplotlib、scikit-learn を用いて、活動認識、信号の位置合わせ、署名照合を学習します。"
                },
                github: "https://github.com/huiishan99/uoa-ita09-human-activity-pattern-processing",
                tags: ["Python", "Jupyter Notebook", "Machine Learning"]
            },
            {
                slug: "advanced-robotics",
                title: "Advanced Robotics",
                description: {
                    "en": "University of Aizu ITC03A MATLAB coursework on coordinate transforms, robot-arm forward/inverse kinematics, and dynamics.",
                    "zh": "会津大学 ITC03A MATLAB 课程作业，练习坐标变换、机械臂正逆运动学和动力学。",
                    "ja": "会津大学 ITC03A の MATLAB 課題。座標変換、ロボットアームの順・逆運動学、動力学を扱います。"
                },
                github: "https://github.com/huiishan99/uoa-itc03a-advanced-robotics",
                tags: ["MATLAB", "Robotics"]
            },
            {
                slug: "biosignal-processing-and-data-mining",
                title: "Biosignal Processing and Data Mining",
                description: {
                    "en": "University of Aizu ITA25 MATLAB coursework on wavelet decomposition, signal denoising, peak detection, and sample entropy.",
                    "zh": "会津大学 ITA25 MATLAB 课程作业，练习小波分解、信号去噪、峰值检测和样本熵。",
                    "ja": "会津大学 ITA25 の MATLAB 課題。ウェーブレット分解、信号のノイズ除去、ピーク検出、サンプルエントロピーを扱います。"
                },
                github: "https://github.com/huiishan99/uoa-ita25-biosignal-processing-and-data-mining",
                tags: ["MATLAB", "Biosignal Processing", "Data Mining"]
            },
            {
                slug: "applied-statistics",
                title: "Applied Statistics",
                description: {
                    en: "University of Aizu CSC03F applied statistics coursework notes and assignment records.",
                    zh: "会津大学 CSC03F 应用统计课程笔记与作业记录。",
                    ja: "会津大学 CSC03F 応用統計の授業ノートと課題記録。"
                },
                github: "https://github.com/huiishan99/uoa-csc03f-applied-statistics",
                tags: ["Statistics", "Coursework"]
            },
            {
                slug: "software-engineering",
                title: "Software Engineering",
                description: {
                    en: "University of Aizu SEC01F software engineering coursework notes and assignment records.",
                    zh: "会津大学 SEC01F 软件工程课程笔记与作业记录。",
                    ja: "会津大学 SEC01F ソフトウェア工学の授業ノートと課題記録。"
                },
                github: "https://github.com/huiishan99/uoa-sec01f-software-engineering",
                tags: ["Software Engineering", "Coursework"]
            },
        ]
    },
    {
        id: "other",
        title: { en: "Other Project", zh: "其他项目", ja: "その他のプロジェクト" },
        icon: "folder",
        items: [
            {
                slug: "tetris-clone",
                title: "Tetris Clone",
                description: {
                    en: "Native Windows falling-block game built with C++17 and Win32/GDI, with hold, ghost and next-piece previews, adjustable controls, and a local leaderboard.",
                    zh: "使用 C++17 与 Win32/GDI 编写的原生 Windows 俄罗斯方块游戏，支持保留方块、落点与后续方块预览、操作参数调整和本地排行榜。",
                    ja: "C++17 と Win32/GDI で制作した Windows ネイティブの落ち物パズル。ホールド、ゴースト、次のブロック表示、操作設定、ローカルランキングを備えています。"
                },
                details: {
                    "en": "C++17, Win32, and GDI implement the game window, drawing, wall kicks, hold, ghost/next-piece previews, and scoring. Settings control key repeat, bindings, window size, and sound; a local leaderboard stores scores. CMake builds the game and portable rule tests, while GitHub Actions tests Windows UI and packages time-limited artifacts requiring GitHub sign-in. The game window is Windows-only; core tests also run on Linux and macOS.",
                    "zh": "C++17、Win32 与 GDI 实现游戏窗口、绘图、踢墙、暂存、落点/后续方块预览和计分。设置可调整按键重复、键位、窗口尺寸与声音，本地排行榜保存成绩。CMake 构建游戏与跨平台规则测试，GitHub Actions 测试 Windows UI 并生成需要 GitHub 登录的限时构建产物。游戏窗口仅支持 Windows，核心测试也可在 Linux 与 macOS 上运行。",
                    "ja": "C++17、Win32、GDI でゲームウィンドウ、描画、壁蹴り、ホールド、ゴースト・次ブロック表示、得点処理を実装。設定でキーリピート、割り当て、画面サイズ、サウンド設定を調整し、スコアをローカル保存します。CMake でゲームと移植可能なルールテストをビルドし、GitHub Actions で Windows UI を検証、GitHub ログインが必要な期限付き成果物を配布。ゲーム画面は Windows 専用で、ルールテストは Linux・macOS でも動作します。"
                },
                github: "https://github.com/huiishan99/game-cpp-tetris",
                image: "/images/projects/tetris-gameplay.webp",
                detailImages: [
                    {
                        src: "/images/projects/tetris-gameplay.webp",
                        alt: {
                            en: "Native Windows Tetris game showing the board, held piece, ghost, next three pieces, and score",
                            zh: "Windows 原生俄罗斯方块游戏画面，显示棋盘、保留方块、落点预览、后三块预告与分数",
                            ja: "盤面、ホールド、ゴースト、次の3個、スコアを表示した Windows ネイティブゲームの実画面"
                        },
                        caption: {
                            en: "Packaged Windows x64 game · Unedited UI capture from the 8 October 2026 CI run",
                            zh: "Windows x64 打包程序 · 2026 年 10 月 8 日 CI 运行中的原始界面截图",
                            ja: "Windows x64 配布用ビルド · 2026年10月8日の CI 実行で取得した未加工の画面"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/tetris-settings.webp",
                        alt: {
                            en: "Tetris settings for key repeat timing, line-clear effects, controls, window size, sound, and player name",
                            zh: "俄罗斯方块设置界面，可调整按键重复时序、消行特效、键位、窗口、声音与玩家名称",
                            ja: "キーリピート、消去エフェクト、操作、ウィンドウ、音、プレイヤー名を調整する設定画面"
                        },
                        caption: {
                            en: "In-game settings · Native Windows UI captured in the same CI run",
                            zh: "游戏内设置 · 同一次 CI 运行中截取的 Windows 原生界面",
                            ja: "ゲーム内設定 · 同じ CI 実行で取得した Windows ネイティブ UI"
                        },
                        fit: "contain"
                    }
                ],
                tags: ["C++17", "Win32 API", "GDI", "CMake"]
            },
            {
                slug: "opengl-practice",
                title: "OpenGL Practice",
                description: {
                    "en": "C++ and OpenGL practice project using GLFW for windows, with buffers, shaders, textures, and basic 3D rendering.",
                    "zh": "使用 C++、OpenGL 与 GLFW 的图形练习项目，涵盖窗口、缓冲区、着色器、纹理和基础 3D 渲染。",
                    "ja": "C++、OpenGL、GLFW のグラフィックス練習。ウィンドウ、バッファー、シェーダー、テクスチャー、基本的な 3D 描画を扱います。"
                },
                github: "https://github.com/huiishan99/opengl-vector-graphic",
                tags: ["C++", "OpenGL", "GLFW"]
            },
            {
                slug: "c-exercises",
                title: "C# Exercises",
                description: {
                    en: "Collection of C#/.NET practice projects, including console, WPF, MVC, and Azure-style samples.",
                    zh: "C#/.NET 练习项目合集，包含控制台、WPF、MVC 和 Azure 风格示例。",
                    ja: "コンソール、WPF、MVC、Azure 風サンプルを含む C#/.NET 練習プロジェクト集。"
                },
                github: "https://github.com/huiishan99/csharp-exercises",
                tags: ["C#", ".NET", "WPF"]
            },
            {
                slug: "c-snake-game",
                title: "C# Snake Game",
                description: {
                    en: "Classic Windows C# Snake game with keyboard controls and a simple desktop executable.",
                    zh: "经典 Windows C# 贪吃蛇游戏，支持键盘控制并提供简单桌面可执行程序。",
                    ja: "キーボード操作とシンプルなデスクトップ実行ファイルを備えた、クラシックな Windows C# スネークゲーム。"
                },
                github: "https://github.com/huiishan99/csharp-snake-game",
                tags: ["C#", ".NET Framework", "WinForms"]
            },
            {
                slug: "beecrowd-practice",
                title: "Beecrowd Practice",
                description: {
                    en: "C# solutions archive for Beecrowd online judge problems, organized by problem number.",
                    zh: "Beecrowd 在线评测题目的 C# 解题归档，按题号整理。",
                    ja: "Beecrowd オンラインジャッジ問題の C# 解答アーカイブ。問題番号ごとに整理しています。"
                },
                github: "https://github.com/huiishan99/oj-beecrowd",
                tags: ["C#", ".NET", "OJ"]
            },
            {
                slug: "pta-practice",
                title: "PTA Practice",
                description: {
                    "en": "C# practice archive for PTA online judge problems.",
                    "zh": "面向 PTA 在线评测题目的 C# 编程练习记录。",
                    "ja": "PTA オンラインジャッジ向けの C# プログラミング練習記録。"
                },
                github: "",
                tags: ["C#", "OJ"]
            },
            {
                slug: "paiza-practice",
                title: "Paiza Practice",
                description: {
                    "en": "C# practice archive for Paiza online judge problems.",
                    "zh": "面向 Paiza 在线评测题目的 C# 编程练习记录。",
                    "ja": "Paiza オンラインジャッジ向けの C# プログラミング練習記録。"
                },
                github: "",
                tags: ["C#", "OJ"]
            },
            {
                slug: "rockfall-game",
                title: "Rockfall Game",
                description: {
                    "en": "Python/Pygame avoidance game with data collection, scikit-learn Random Forest training, and AI-controlled play.",
                    "zh": "Python/Pygame 躲避游戏，支持数据采集、scikit-learn 随机森林训练和 AI 自动游玩。",
                    "ja": "Python/Pygame の回避ゲーム。データ収集、scikit-learn のランダムフォレスト学習、AI 自動プレイに対応します。"
                },
                github: "https://github.com/huiishan99/python-rockfall-game",
                tags: ["Python", "Pygame", "scikit-learn"]
            },
            {
                slug: "go-11-projects",
                title: "Go 11 Projects",
                description: {
                    en: "Go learning repo following a project-based course, including a web server, CRUD API, MySQL app, and Slack bots.",
                    zh: "跟随项目式课程学习 Go 的仓库，包含 Web 服务器、CRUD API、MySQL 应用和 Slack Bot。",
                    ja: "プロジェクトベースのコースに沿った Go 学習リポジトリ。Web サーバー、CRUD API、MySQL アプリ、Slack Bot を含みます。"
                },
                github: "https://github.com/huiishan99/go-11-projects",
                tags: ["Go", "API", "MySQL", "Slack Bot"]
            }
        ]
    },
    {
        id: "research",
        title: { en: "Research in Progress", zh: "进行中的研究", ja: "進行中の研究" },
        icon: "publication",
        items: [
            {
                slug: "confidence-gated-nids-stress-test",
                title: "Cost-Aware Confidence-Gated Two-Stage Network Intrusion Detection under a Cross-File Cross-Class Stress Test",
                authors: {
                    en: "Jiaming Zhang, Huishan Lai, Runtong He, Jingxue Chen, Chunhua Su",
                    zh: "Jiaming Zhang, Huishan Lai, Runtong He, Jingxue Chen, Chunhua Su",
                    ja: "Jiaming Zhang, Huishan Lai, Runtong He, Jingxue Chen, Chunhua Su"
                },
                conference: {
                    en: "ICICS 2026 · Short paper · Publication pending",
                    zh: "ICICS 2026 · Short Paper · 待正式发表",
                    ja: "ICICS 2026 · ショートペーパー · 正式公開待ち"
                },
                description: {
                    en: "A cost-aware two-stage NIDS pipeline for cross-file, cross-class distribution shift. An LSTM fast path escalates ambiguous flows to a lightweight verifier, while LLMs are limited to generating structured audit rationales rather than primary decisions.",
                    zh: "面向跨文件、跨类别分布偏移的成本感知两阶段网络入侵检测流程：LSTM 快速路径将模糊流量交给轻量级验证器处理，LLM 仅用于生成结构化审计解释，而不承担主要决策。",
                    ja: "ファイル間・クラス間の分布シフトに対応する、コストを考慮した二段階 NIDS パイプラインです。LSTM の高速経路が曖昧なフローだけを軽量検証器へ送り、LLM は主要な判定ではなく構造化された監査根拠の生成に限定します。"
                },
                status: "accepted",
                tags: ["Network Intrusion Detection", "Distribution Shift", "Confidence Gating", "LLM Audit", "ICICS 2026"]
            },
            {
                slug: "efficient-ai-for-network-security",
                title: {
                    en: "Efficient AI for Network Security",
                    zh: "面向网络安全的高效 AI 研究",
                    ja: "ネットワークセキュリティのための効率的 AI 研究"
                },
                conference: {
                    en: "Double-blind submission · Details withheld during review",
                    zh: "双盲匿名投稿 · 审稿期间暂不公开细节",
                    ja: "ダブルブラインド投稿 · 査読中は詳細非公開"
                },
                description: {
                    en: "Ongoing research on efficient machine-learning approaches for network security. The manuscript title, venue, methods, datasets, and results will remain private until the double-blind review process has concluded.",
                    zh: "围绕网络安全中的高效机器学习方法开展研究。为遵守双盲评审要求，论文标题、投稿会议、具体方法、数据集和实验结果将在评审结束前保持非公开。",
                    ja: "ネットワークセキュリティに向けた効率的な機械学習手法を研究しています。ダブルブラインド査読を守るため、論文名、投稿先、具体的な手法、データセット、結果は査読終了まで非公開とします。"
                },
                status: "under-review",
                tags: ["Network Security", "Machine Learning", "Efficient AI"]
            },
            {
                slug: "robust-evaluation-for-multimodal-machine-learning",
                title: {
                    en: "Robust Evaluation for Multimodal Machine Learning",
                    zh: "多模态机器学习的稳健评估研究",
                    ja: "マルチモーダル機械学習の堅牢な評価研究"
                },
                conference: {
                    en: "Double-blind submission · Details withheld during review",
                    zh: "双盲匿名投稿 · 审稿期间暂不公开细节",
                    ja: "ダブルブラインド投稿 · 査読中は詳細非公開"
                },
                description: {
                    en: "Ongoing research on reliable evaluation for multimodal machine-learning systems. The manuscript title, venue, methods, datasets, and results will remain private until the double-blind review process has concluded.",
                    zh: "围绕多模态机器学习系统的可靠评估开展研究。为遵守双盲评审要求，论文标题、投稿会议、具体方法、数据集和实验结果将在评审结束前保持非公开。",
                    ja: "マルチモーダル機械学習システムの信頼できる評価を研究しています。ダブルブラインド査読を守るため、論文名、投稿先、具体的な手法、データセット、結果は査読終了まで非公開とします。"
                },
                status: "under-review",
                tags: ["Multimodal Learning", "Model Evaluation", "Reliable AI"]
            },
            {
                slug: "human-centered-xr-interaction-research",
                title: {
                    en: "Human-Centered XR Interaction Research",
                    zh: "人本 XR 交互研究",
                    ja: "人間中心の XR インタラクション研究"
                },
                conference: {
                    en: "International HCI submission in preparation · Venue undecided",
                    zh: "国际 HCI 会议投稿准备中 · 目标会场尚未确定",
                    ja: "国際 HCI 会議への投稿準備中 · 投稿先未定"
                },
                description: {
                    en: "Ongoing research on human-centered interaction in immersive environments. The project identity, system concept, implementation, study design, collaborators, and target venue will remain private while the work is being developed.",
                    zh: "围绕沉浸式环境中的人本交互开展研究。项目身份、系统构想、实现细节、研究设计、合作信息和目标会议将在研究开发期间保持非公开。",
                    ja: "没入型環境における人間中心のインタラクションを研究しています。研究の準備中は、プロジェクト名、システム構想、実装、研究設計、共同研究者、投稿先を非公開とします。"
                },
                status: "in-preparation",
                tags: ["Human-Computer Interaction", "Extended Reality", "Immersive Systems"]
            },
            {
                slug: "interactive-world-models-research",
                title: {
                    en: "Interactive World Models Research",
                    zh: "交互式世界模型研究",
                    ja: "インタラクティブ世界モデル研究"
                },
                description: {
                    en: "Early-stage research on interactive world models that connect visual world generation, simulation, and decision support for agents. The current phase focuses on refining the research question and evidence plan before choosing the next experimental direction.",
                    zh: "围绕交互式世界模型开展早期研究，探索如何连接视觉世界生成、仿真与智能体决策支持。当前阶段主要梳理研究问题与证据计划，再确定下一步实验方向。",
                    ja: "視覚的な世界生成、シミュレーション、エージェントの意思決定支援をつなぐインタラクティブ世界モデルの初期研究です。現在は、次の実験方向を選ぶ前に研究課題と検証計画を整理しています。"
                },
                status: "early-stage",
                tags: ["World Models", "Embodied AI", "Interactive Systems"]
            },
            {
                slug: "brain-computer-interface-research",
                title: {
                    en: "Brain–Computer Interface Research",
                    zh: "脑机接口研究",
                    ja: "ブレイン・コンピュータ・インターフェース研究"
                },
                description: {
                    en: "Early-stage collaborative research on brain–computer interfaces. The current phase focuses on aligning the research question, refining the idea, and discussing feasible experimental directions with collaborators.",
                    zh: "围绕脑机接口开展的早期合作研究。当前正在与合作者明确研究问题、细化构想，并讨论可行的实验方向。",
                    ja: "ブレイン・コンピュータ・インターフェースに関する初期段階の共同研究です。現在は共同研究者と研究課題を整理し、アイデアを具体化しながら、実現可能な実験方向を検討しています。"
                },
                status: "early-stage",
                tags: ["Brain–Computer Interface", "Human-Computer Interaction", "Collaborative Research"]
            },
            {
                slug: "privacy-preserving-analytics-research",
                title: {
                    en: "Privacy-Preserving Analytics Research",
                    zh: "隐私保护分析研究",
                    ja: "プライバシー保護分析研究"
                },
                description: {
                    en: "Collaborative research on cryptographic and policy-aware approaches to privacy-preserving data analysis. The next scope and timeline remain open pending coordination and progress confirmation with collaborators.",
                    zh: "围绕密码学与策略感知的隐私保护数据分析开展合作研究。下一阶段的范围与时间线仍需在合作进度确认后确定。",
                    ja: "暗号技術とポリシーを考慮したプライバシー保護データ分析に関する共同研究です。次段階の範囲と日程は、共同研究の進捗確認後に決定します。"
                },
                status: "awaiting-coordination",
                tags: ["Applied Cryptography", "Privacy-Preserving Analytics", "Research Collaboration"]
            },
            {
                slug: "resilient-wireless-systems-research",
                title: {
                    en: "Resilient Wireless Systems Research",
                    zh: "韧性无线系统研究",
                    ja: "レジリエント無線システム研究"
                },
                description: {
                    en: "Revisiting an earlier line of work on resilient wireless and delay-tolerant communication. The previous prototype is being reorganized before the research question and evaluation scope are developed further.",
                    zh: "重新整理一项关于韧性无线通信与延迟容忍网络的早期研究。现有原型将先完成梳理，再继续明确研究问题并扩展评估范围。",
                    ja: "レジリエント無線通信と遅延耐性ネットワークに関する以前の研究を再整理しています。既存のプロトタイプを見直した上で、研究課題と評価範囲を発展させる予定です。"
                },
                status: "on-hold",
                tags: ["Wireless Networks", "Delay-Tolerant Networking", "Edge Systems"]
            }
        ]
    },
    {
        id: "publications",
        title: { en: "Publications", zh: "论文发表", ja: "発表論文" },
        icon: "publication",
        items: [
            {
                slug: "vr-math-bridge",
                title: "VR Math Bridge: Bridging Interactivity in Online Education with AI and VR",
                authors: {
                    en: "HuiShan Lai, Alaeddin Nassani, John Blake, Julián Villegas",
                    zh: "HuiShan Lai, Alaeddin Nassani, John Blake, Julián Villegas",
                    ja: "HuiShan Lai, Alaeddin Nassani, John Blake, Julián Villegas"
                },
                conference: {
                    en: "2025 IEEE Gaming, Entertainment, and Media Conference (GEM)",
                    zh: "2025 IEEE Gaming, Entertainment, and Media Conference (GEM)",
                    ja: "2025 IEEE Gaming, Entertainment, and Media Conference (GEM)"
                },
                description: {
                    en: "We present VR Math Bridge, a virtual reality (VR)-based application designed to enhance calculus education by combining immersive virtual environments with artificial intelligence (AI)-driven teaching assistance. VR Math Bridge creates a virtual classroom where students interact with Khan Academy videos and a 3D AI assistant that provides real-time, personalized feedback to their questions. This system leverages a floating panel for chapter selection, a virtual blackboard for video playback, and Cognitive 3D for analyzing user engagement. To demonstrate the system’s capabilities, we developed a prototype on Quest 3, focusing on derivatives as the initial test topic. We conducted a preliminary subjective evaluation (n=2) of the prototype to collect early insights for future user study evaluation.",
                    zh: "我们提出 VR Math Bridge，一个基于虚拟现实（VR）的微积分学习应用，通过沉浸式虚拟环境与 AI 驱动的教学辅助提升在线教育互动性。系统构建了一个虚拟教室，学生可以观看 Khan Academy 视频，并与 3D AI 助手互动，获得实时、个性化的问题反馈。原型使用浮动面板进行章节选择、虚拟黑板播放视频，并结合 Cognitive 3D 分析用户参与情况。为展示系统能力，我们在 Quest 3 上开发了以导数为初始主题的原型，并进行了初步主观评价（n=2），为未来用户研究收集早期洞察。",
                    ja: "VR Math Bridge は、没入型仮想環境と AI 駆動の教育支援を組み合わせ、微積分教育を強化する VR アプリケーションです。仮想教室内で学生は Khan Academy の動画を視聴し、3D AI アシスタントと対話して、質問に対するリアルタイムで個別化されたフィードバックを受け取れます。章選択用のフローティングパネル、動画再生用の仮想黒板、ユーザーエンゲージメント分析のための Cognitive 3D を活用しています。システムの能力を示すため、導関数を初期テーマとして Quest 3 上にプロトタイプを開発し、今後のユーザー研究に向けた初期知見を得るために予備的な主観評価（n=2）を実施しました。"
                },
                detailImages: [
                    {
                        src: "/images/projects/vr-math-bridge-overview.webp",
                        alt: {
                            en: "Quest 3 user beside a first-person view of the VR Math Bridge classroom and AI assistant",
                            zh: "Quest 3 使用者与 VR Math Bridge 虚拟教室及 AI 助手的第一人称画面",
                            ja: "Quest 3 利用者と VR Math Bridge の仮想教室・AI アシスタントの一人称画面"
                        },
                        caption: {
                            en: "Prototype overview · Quest 3 and the in-headset experience",
                            zh: "原型概览 · Quest 3 与头显内体验",
                            ja: "プロトタイプ概要 · Quest 3 とヘッドセット内体験"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/vr-math-bridge-classroom.webp",
                        alt: {
                            en: "VR classroom interface with a calculus blackboard, chapter selector, controllers, and playback control",
                            zh: "包含微积分黑板、章节选择器、控制器和播放控制的 VR 教室界面",
                            ja: "微積分の黒板、章選択、コントローラー、再生操作を備えた VR 教室画面"
                        },
                        caption: {
                            en: "Virtual classroom · Blackboard, chapter panel, and playback controls",
                            zh: "虚拟教室 · 黑板、章节面板与播放控制",
                            ja: "仮想教室 · 黒板、章パネル、再生操作"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/vr-math-bridge-ai-assistant.webp",
                        alt: {
                            en: "AI teaching avatar with chat, lip-sync, speech-to-text, and Quest 3 controller annotations",
                            zh: "标注聊天、唇形同步、语音转文字和 Quest 3 控制器的 AI 教学虚拟人",
                            ja: "チャット、リップシンク、音声認識、Quest 3 コントローラーを示した AI 教育アバター"
                        },
                        caption: {
                            en: "AI teaching assistant · Avatar, lip-sync, and spoken interaction",
                            zh: "AI 教学助手 · 虚拟人、唇形同步与语音交互",
                            ja: "AI 教育アシスタント · アバター、リップシンク、音声対話"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/vr-math-bridge-system-architecture.webp",
                        alt: {
                            en: "VR Math Bridge architecture connecting the Unity classroom, learning content, AI services, and Cognitive 3D analytics",
                            zh: "连接 Unity 虚拟教室、学习内容、AI 服务与 Cognitive 3D 分析的 VR Math Bridge 系统架构",
                            ja: "Unity 仮想教室、学習コンテンツ、AI サービス、Cognitive 3D 分析を結ぶ VR Math Bridge のシステム構成"
                        },
                        caption: {
                            en: "System architecture · Learning content, AI services, and analytics",
                            zh: "系统架构 · 学习内容、AI 服务与行为分析",
                            ja: "システム構成 · 学習コンテンツ、AI サービス、行動分析"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/vr-math-bridge-learning-analytics.webp",
                        alt: {
                            en: "Cognitive 3D session replay and analytics dashboard for the VR classroom",
                            zh: "用于 VR 教室的 Cognitive 3D 会话回放与分析仪表盘",
                            ja: "VR 教室向け Cognitive 3D セッション再生と分析ダッシュボード"
                        },
                        caption: {
                            en: "Learning analytics · Cognitive 3D replay and dashboard",
                            zh: "学习分析 · Cognitive 3D 回放与仪表盘",
                            ja: "学習分析 · Cognitive 3D の再生とダッシュボード"
                        },
                        fit: "contain"
                    }
                ],
                featured: true,
                featuredLabel: {
                    en: "Presentation Award",
                    zh: "Presentation Award",
                    ja: "Presentation Award"
                },
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                paper: "https://doi.org/10.1109/GEM66882.2025.11155841",
                caseStudy: "https://web-publications.vercel.app/publications/vr-math-bridge/",
                award: {
                    title: {
                        en: "IEEE GEM 2025 Presentation Award",
                        zh: "IEEE GEM 2025 Presentation Award 获奖证书",
                        ja: "IEEE GEM 2025 Presentation Award 受賞証明書"
                    },
                    image: "/images/projects/ieee-gem-2025-presentation-award.jpg",
                    alt: {
                        en: "IEEE GEM 2025 Presentation Award certificate presented to Lai Hui Shan",
                        zh: "颁发给 Lai Hui Shan 的 IEEE GEM 2025 Presentation Award 证书",
                        ja: "Lai Hui Shan に授与された IEEE GEM 2025 Presentation Award の証明書"
                    },
                    caption: {
                        en: "IEEE GEM 2025 · Presentation Award for the Immersive Experiences & VR session",
                        zh: "IEEE GEM 2025 · Immersive Experiences & VR 专场 Presentation Award",
                        ja: "IEEE GEM 2025 · Immersive Experiences & VR セッション Presentation Award"
                    }
                },
                tags: ["AI-driven Education", "Virtual Reality", "Embodied Avatar","IEEE GEM 2025"]
            },
            {
                slug: "vibe-coding-security",
                title: "Assessing the Security of Vibe Coding: Baseline vs. Security-Oriented Prompts in LLM Code Generation",
                authors: {
                    en: "Runtong He, Huishan Lai, Jingxue Chen, Chunhua Su",
                    zh: "Runtong He, Huishan Lai, Jingxue Chen, Chunhua Su",
                    ja: "Runtong He, Huishan Lai, Jingxue Chen, Chunhua Su"
                },
                conference: {
                    en: "ISPEC 2025: 20th International Conference on Information Security Practice and Experience",
                    zh: "ISPEC 2025: 20th International Conference on Information Security Practice and Experience",
                    ja: "ISPEC 2025: 20th International Conference on Information Security Practice and Experience"
                },
                description: {
                    en: "Large Language Models (LLMs) are increasingly used in software development through so-called “vibe coding,” where developers specify tasks in natural language and rely on the model to produce executable code. While this paradigm lowers barriers to entry and accelerates prototyping, it raises concerns about security. Prior studies show that a substantial fraction of AI-generated code contains exploitable vulnerabilities, and functional correctness does not guarantee safety. This paper investigates whether security-oriented prompting improves the security of LLM-generated code. We design ten representative Python tasks inspired by OWASP Top 10 and CWE categories, and evaluate outputs from an open-source 20B-parameter model using static analysis (Bandit) and lightweight runtime probes.",
                    zh: "大语言模型（LLMs）正越来越多地被用于所谓的 “vibe coding” 软件开发流程中：开发者用自然语言描述任务，并依赖模型生成可执行代码。虽然这种方式降低了开发门槛并加速原型构建，但也带来了安全风险。已有研究显示，AI 生成代码中有相当一部分包含可被利用的漏洞，功能正确并不等同于安全。本文研究面向安全的提示词是否能提升 LLM 生成代码的安全性。我们设计了十个受 OWASP Top 10 与 CWE 类别启发的代表性 Python 任务，并使用静态分析（Bandit）和轻量级运行时探针对一个开源 20B 参数模型的输出进行评估。",
                    ja: "大規模言語モデル（LLM）は、開発者が自然言語でタスクを指定し、モデルに実行可能なコード生成を任せる “vibe coding” を通じて、ソフトウェア開発でますます利用されています。この手法は参入障壁を下げ、プロトタイピングを高速化する一方で、セキュリティ上の懸念も生みます。先行研究では、AI 生成コードの相当数に悪用可能な脆弱性が含まれ、機能的な正しさが安全性を保証しないことが示されています。本研究では、セキュリティ指向のプロンプトが LLM 生成コードの安全性を改善するかを調査します。OWASP Top 10 と CWE カテゴリに着想を得た10個の代表的な Python タスクを設計し、オープンソースの 20B パラメータモデルの出力を静的解析（Bandit）と軽量な実行時プローブで評価します。"
                },
                detailImages: [
                    {
                        src: "/images/projects/ispec-2025-experiment-pipeline.jpg",
                        alt: {
                            en: "Experiment pipeline comparing baseline and security-oriented prompts through code generation, static analysis, runtime checks, and metric aggregation",
                            zh: "比较基础提示与安全导向提示的实验流程，涵盖代码生成、静态分析、运行时检查和指标汇总",
                            ja: "ベースラインとセキュリティ指向プロンプトを、コード生成、静的解析、実行時検査、指標集計まで比較する実験パイプライン"
                        },
                        caption: {
                            en: "Experiment pipeline · Prompting, code generation, evaluation, and metrics",
                            zh: "实验流程 · 提示设计、代码生成、安全评估与指标汇总",
                            ja: "実験パイプライン · プロンプト、コード生成、安全性評価、指標集計"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ispec-2025-gptoss-vulnerability-presence.png",
                        alt: {
                            en: "Bar chart comparing vulnerability presence for baseline and security-oriented prompts across ten GPT-OSS 20B coding tasks",
                            zh: "比较 GPT-OSS 20B 十项编程任务中基础提示与安全导向提示漏洞出现率的柱状图",
                            ja: "GPT-OSS 20B の10種類のコーディングタスクで、ベースラインとセキュリティ指向プロンプトの脆弱性発生率を比較する棒グラフ"
                        },
                        caption: {
                            en: "GPT-OSS 20B · Vulnerability presence by task",
                            zh: "GPT-OSS 20B · 各任务的漏洞出现率",
                            ja: "GPT-OSS 20B · タスク別の脆弱性発生率"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ispec-2025-gptoss-issue-count.png",
                        alt: {
                            en: "Bar chart comparing mean issue counts for baseline and security-oriented prompts across ten GPT-OSS 20B coding tasks",
                            zh: "比较 GPT-OSS 20B 十项编程任务中基础提示与安全导向提示平均问题数量的柱状图",
                            ja: "GPT-OSS 20B の10種類のコーディングタスクで、ベースラインとセキュリティ指向プロンプトの平均問題数を比較する棒グラフ"
                        },
                        caption: {
                            en: "GPT-OSS 20B · Mean issue count by task",
                            zh: "GPT-OSS 20B · 各任务的平均问题数量",
                            ja: "GPT-OSS 20B · タスク別の平均問題数"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ispec-2025-gptoss-severity-weighted-count.png",
                        alt: {
                            en: "Bar chart comparing severity-weighted issue counts for baseline and security-oriented prompts across ten GPT-OSS 20B coding tasks",
                            zh: "比较 GPT-OSS 20B 十项编程任务中基础提示与安全导向提示严重度加权问题数量的柱状图",
                            ja: "GPT-OSS 20B の10種類のコーディングタスクで、ベースラインとセキュリティ指向プロンプトの深刻度加重問題数を比較する棒グラフ"
                        },
                        caption: {
                            en: "GPT-OSS 20B · Severity-weighted issue count by task",
                            zh: "GPT-OSS 20B · 各任务的严重度加权问题数量",
                            ja: "GPT-OSS 20B · タスク別の深刻度加重問題数"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ispec-2025-cross-model-vulnerability-presence.png",
                        alt: {
                            en: "Bar chart comparing vulnerability presence across Gemma-3 27B and GPT-OSS 20B under security-oriented prompts",
                            zh: "比较安全导向提示下 Gemma-3 27B 与 GPT-OSS 20B 漏洞出现率的柱状图",
                            ja: "セキュリティ指向プロンプトにおける Gemma-3 27B と GPT-OSS 20B の脆弱性発生率を比較する棒グラフ"
                        },
                        caption: {
                            en: "Cross-model comparison · Vulnerability presence",
                            zh: "跨模型比较 · 漏洞出现率",
                            ja: "モデル間比較 · 脆弱性発生率"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ispec-2025-cross-model-issue-count.png",
                        alt: {
                            en: "Bar chart comparing mean issue counts across Gemma-3 27B and GPT-OSS 20B under security-oriented prompts",
                            zh: "比较安全导向提示下 Gemma-3 27B 与 GPT-OSS 20B 平均问题数量的柱状图",
                            ja: "セキュリティ指向プロンプトにおける Gemma-3 27B と GPT-OSS 20B の平均問題数を比較する棒グラフ"
                        },
                        caption: {
                            en: "Cross-model comparison · Mean issue count",
                            zh: "跨模型比较 · 平均问题数量",
                            ja: "モデル間比較 · 平均問題数"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ispec-2025-cross-model-severity-weighted-count.png",
                        alt: {
                            en: "Bar chart comparing severity-weighted issue counts across Gemma-3 27B and GPT-OSS 20B under security-oriented prompts",
                            zh: "比较安全导向提示下 Gemma-3 27B 与 GPT-OSS 20B 严重度加权问题数量的柱状图",
                            ja: "セキュリティ指向プロンプトにおける Gemma-3 27B と GPT-OSS 20B の深刻度加重問題数を比較する棒グラフ"
                        },
                        caption: {
                            en: "Cross-model comparison · Severity-weighted issue count",
                            zh: "跨模型比较 · 严重度加权问题数量",
                            ja: "モデル間比較 · 深刻度加重問題数"
                        },
                        fit: "contain"
                    }
                ],
                github: "https://github.com/huiishan99/vibe-sec-experiment",
                paper: "https://link.springer.com/chapter/10.1007/978-981-95-9284-5_27",
                caseStudy: "https://web-publications.vercel.app/publications/assessing-security-vibe-coding/",
                tags: ["Large Language Models","Software Security","Vibe Coding","ISPEC 2025"]
            },
            {
                slug: "bioadaptive-vr-attention-restoration",
                title: "Enhancing VR Mandala Drawing and Natural Immersion for Attention Restoration with AI-Driven Bioadaptive Multimodal Interaction",
                authors: {
                    en: "Tiantian Geng, Huishan Lai, Lei Jing",
                    zh: "Tiantian Geng, Huishan Lai, Lei Jing",
                    ja: "Tiantian Geng, Huishan Lai, Lei Jing"
                },
                conference: {
                    en: "AHs 2026: The Augmented Humans International Conference 2026",
                    zh: "AHs 2026: The Augmented Humans International Conference 2026",
                    ja: "AHs 2026: The Augmented Humans International Conference 2026"
                },
                description: {
                    en: "Digital attention fatigue is a pervasive challenge, yet most virtual reality (VR) interventions for restoration rely on passive nature exposure that lacks responsiveness to the user's internal state. Integrating Attention Restoration Theory (ART) with physiological computing, we propose a bioadaptive VR system that combines active mandala drawing within a 360° nature scene, using real-time heart rate variability (HRV) to modulate visual fog, ambient music, and haptic feedback. In a within-subject pilot study (N=11), we compared an AI-driven bioadaptive multimodal condition (AI) against an otherwise identical VR condition without bioadaptive multimodal feedback (NF), using behavioral (Oddball task), neural (EEG), autonomic (HRV), and subjective measures.",
                    zh: "数字注意疲劳是一个普遍挑战，但多数用于恢复注意力的虚拟现实（VR）干预仍依赖被动自然暴露，缺乏对用户内部状态的响应。结合注意恢复理论（ART）与生理计算，我们提出一个生物自适应 VR 系统：用户在 360° 自然场景中主动绘制曼陀罗，系统使用实时心率变异性（HRV）调节视觉雾效、环境音乐和触觉反馈。在一项被试内预实验（N=11）中，我们比较了 AI 驱动的生物自适应多模态条件（AI）与无生物自适应反馈的相同 VR 条件（NF），评估指标包括行为（Oddball 任务）、神经（EEG）、自主神经（HRV）和主观量表。",
                    ja: "デジタル注意疲労は広く見られる課題ですが、注意回復を目的とした多くの VR 介入は受動的な自然曝露に依存しており、ユーザーの内的状態への応答性が不足しています。注意回復理論（ART）と生理コンピューティングを統合し、360° 自然シーン内での能動的な曼荼羅描画と、リアルタイム心拍変動（HRV）による視覚的な霧、環境音楽、触覚フィードバックの調整を組み合わせたバイオアダプティブ VR システムを提案します。被験者内パイロット研究（N=11）では、AI 駆動のバイオアダプティブ・マルチモーダル条件（AI）と、同一 VR 環境でバイオアダプティブなフィードバックを持たない条件（NF）を、行動（Oddball 課題）、神経（EEG）、自律神経（HRV）、主観指標で比較しました。"
                },
                detailImages: [
                    {
                        src: "/images/projects/ahs-2026-figure-1-system-architecture.jpg",
                        alt: {
                            en: "Closed-loop architecture of the bioadaptive VR mandala system",
                            zh: "生物自适应 VR 曼陀罗系统的闭环架构",
                            ja: "バイオアダプティブ VR 曼荼羅システムの閉ループ構成"
                        },
                        caption: {
                            en: "Figure 1 · Closed-loop system architecture",
                            zh: "图 1 · 闭环系统架构",
                            ja: "図 1 · 閉ループシステム構成"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ahs-2026-figure-3-vr-mandala-experience.jpg",
                        alt: {
                            en: "VR mandala drawing inside a static 360-degree natural seascape",
                            zh: "在静态 360° 自然海景中进行 VR 曼陀罗绘画",
                            ja: "静的な 360° 自然海景の中で行う VR 曼荼羅描画"
                        },
                        caption: {
                            en: "Figure 3 · VR nature scene and mandala drawing",
                            zh: "图 3 · VR 自然场景与曼陀罗绘画",
                            ja: "図 3 · VR 自然シーンと曼荼羅描画"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ahs-2026-figure-2-instrumentation.jpg",
                        alt: {
                            en: "Polar H10 heart-rate sensor and Polymate Mini AP108 EEG equipment",
                            zh: "Polar H10 心率传感器与 Polymate Mini AP108 EEG 设备",
                            ja: "Polar H10 心拍センサーと Polymate Mini AP108 EEG 機器"
                        },
                        caption: {
                            en: "Figure 2 · HRV and EEG instrumentation",
                            zh: "图 2 · HRV 与 EEG 实验设备",
                            ja: "図 2 · HRV・EEG 計測機器"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/ahs-2026-figure-4-eeg-results.jpg",
                        alt: {
                            en: "EEG pre-post and change-score results across electrode sites",
                            zh: "不同电极位置的 EEG 前后测及变化值结果",
                            ja: "各電極部位における EEG の事前事後および変化量の結果"
                        },
                        caption: {
                            en: "Figure 4 · EEG pre/post and change-score results",
                            zh: "图 4 · EEG 前后测与变化值结果",
                            ja: "図 4 · EEG の事前事後・変化量結果"
                        },
                        fit: "contain"
                    }
                ],
                paper: "https://dl.acm.org/doi/10.1145/3795011.3795053",
                caseStudy: "https://web-publications.vercel.app/publications/bioadaptive-vr-attention-restoration/",
                tags: ["Virtual Reality","Multimodal Interaction","AI-Driven","AHs 2026"]
            }
        ]
    },
    {
        id: "theses",
        title: { en: "Theses", zh: "学位论文", ja: "学位論文" },
        icon: "graduation",
        items: [
            {
                slug: "embodied-avatars-generative-ai-vr-thesis",
                title: "The Role of Embodied Avatars and Generative AI in Self Learning VR Classroom",
                authors: {
                    en: "HuiShan Lai",
                    zh: "HuiShan Lai",
                    ja: "HuiShan Lai"
                },
                conference: {
                    en: "Master's Thesis · University of Aizu · September 2025",
                    zh: "硕士论文 · 会津大学 · 2025年9月",
                    ja: "修士論文 · 会津大学 · 2025年9月"
                },
                description: {
                    en: "This master's thesis examines how VR, generative AI, and an embodied teaching avatar shape immersion, enjoyment, comprehension, and cognitive load in self-directed calculus learning.",
                    zh: "本硕士论文研究虚拟现实、生成式 AI 与具身教学虚拟人如何影响自主微积分学习中的沉浸感、愉悦度、理解度与认知负荷。",
                    ja: "本修士論文では、VR、生成 AI、具現化された教育アバターが、自律的な微積分学習における没入感、楽しさ、理解度、認知負荷に与える影響を検討しました。"
                },
                details: {
                    en: "The work combines short calculus videos, quizzes, speech interaction, a generative AI assistant, and an optional animated avatar in a Meta Quest 3 classroom. A two-participant pilot informed the final design, followed by a counterbalanced within-subject study with 18 participants across desktop video, VR with a text-based AI assistant, and VR with an embodied AI assistant. Both VR conditions produced significantly higher immersion and enjoyment than desktop learning. The study found no statistically significant differences in comprehension, cognitive load, effort, or frustration, and no reliable rating-scale advantage of the avatar over the text-based VR assistant.",
                    zh: "该研究在 Meta Quest 3 虚拟教室中整合了微积分短视频、测验、语音交互、生成式 AI 助手与可选的动画虚拟人。两名参与者的预实验用于改进最终设计，随后对 18 名参与者开展了平衡顺序的被试内研究，比较桌面视频学习、配有文本 AI 助手的 VR，以及配有具身 AI 助手的 VR。两种 VR 条件的沉浸感与愉悦度均显著高于桌面学习；但在理解度、认知负荷、投入程度和挫败感方面未发现显著差异，具身虚拟人相较文本 VR 助手也没有表现出可靠的量表评分优势。",
                    ja: "本研究は、Meta Quest 3 の仮想教室に短い微積分動画、クイズ、音声対話、生成 AI アシスタント、任意表示のアニメーションアバターを統合しました。2名のパイロット調査をもとに最終設計を改善し、その後18名を対象に、デスクトップ動画、テキスト型 AI アシスタント付き VR、具現化 AI アシスタント付き VRを比較する順序調整済みの被験者内実験を行いました。両 VR 条件はデスクトップ学習より没入感と楽しさが有意に高かった一方、理解度、認知負荷、努力、フラストレーションには有意差がなく、アバターもテキスト型 VR アシスタントに対して評価尺度上の明確な優位性を示しませんでした。"
                },
                status: "thesis",
                detailImage: "/images/projects/embodied-ai-vr-thesis-cover.jpg",
                detailImageAlt: {
                    en: "Side-by-side views of the text-panel and embodied-avatar modes in the self-learning VR classroom",
                    zh: "自主学习 VR 教室中文本面板模式与具身虚拟人模式的并列画面",
                    ja: "自己学習 VR 教室におけるテキストパネル方式と具現化アバター方式の比較画面"
                },
                detailImageFit: "contain",
                github: "https://github.com/huiishan99/uoa-research-unity-master-thesis",
                paper: "https://web-publications.vercel.app/paper/embodied-avatars-generative-ai-vr-thesis.pdf",
                caseStudy: "https://web-publications.vercel.app/publications/embodied-avatars-generative-ai-vr-thesis/",
                tags: ["Virtual Reality", "Generative AI", "Embodied Avatar"]
            },
            {
                slug: "quadrotor-uav-digital-twin-thesis",
                title: {
                    en: "Design and Implementation of a Digital Twin System for Quadrotor UAV Formation Flight",
                    zh: "四旋翼无人机编队飞行数字孪生系统的设计与实现",
                    ja: "クアッドローター UAV 編隊飛行デジタルツインシステムの設計と実装"
                },
                authors: {
                    en: "HuiShan Lai",
                    zh: "HuiShan Lai",
                    ja: "HuiShan Lai"
                },
                conference: {
                    en: "Bachelor's Thesis · Northwestern Polytechnical University · July 2022",
                    zh: "本科毕业论文 · 西北工业大学 · 2022年7月",
                    ja: "学士論文 · 西北工業大学 · 2022年7月"
                },
                description: {
                    en: "An undergraduate thesis developing an Unreal Engine and AirSim digital twin for quadrotor formation control, remote interaction, and flight-data collection.",
                    zh: "本论文开发了基于 Unreal Engine 与 AirSim 的四旋翼无人机编队数字孪生系统，支持编队控制、远程交互与飞行数据采集。",
                    ja: "Unreal Engine と AirSim を用いて、クアッドローター UAV の編隊制御、遠隔操作、飛行データ収集に対応するデジタルツインを開発した学士論文です。"
                },
                details: {
                    en: "This undergraduate thesis develops a digital-twin environment for quadrotor UAV formation flight using Unreal Engine 4 and Microsoft AirSim. It combines multi-UAV generation, controller and Python API input, remote PX4/QGroundControl communication, sensor recording, and a shared flight-data store. Functional testing covered formation generation, multiple viewpoints, environmental controls, database export, and Windows–Linux interaction. The prototype also documented its limits: rendering performance fell with large formations, occasional API disconnects disrupted follower aircraft, and the controller remained a simplified follow-and-avoidance design.",
                    zh: "本论文使用 Unreal Engine 4 与 Microsoft AirSim 构建面向四旋翼无人机编队飞行的数字孪生环境，整合多机生成、手柄与 Python API 输入、PX4/QGroundControl 远程通信、传感器记录及共享飞行数据存储。功能测试覆盖编队生成、多视角观察、环境控制、数据库导出与 Windows–Linux 交互，同时也记录了原型限制：大规模编队会降低渲染性能，偶发 API 断连会影响跟随机，编队控制器仍是简化的跟随与避障实现。",
                    ja: "本学士論文では、Unreal Engine 4 と Microsoft AirSim を用い、クアッドローター UAV の編隊飛行を対象とするデジタルツイン環境を構築しました。複数 UAV の生成、コントローラーと Python API の入力、PX4/QGroundControl の遠隔通信、センサーデータ記録、共有飛行データ保存を統合しています。機能試験では編隊生成、複数視点、環境制御、データベース出力、Windows–Linux 間の連携を確認しました。一方、大規模編隊での描画負荷、API 切断による追従機への影響、簡易的な追従・回避制御という限界も記録しています。"
                },
                status: "bachelor-thesis",
                detailImages: [
                    {
                        src: "/images/projects/nwpu-uav-digital-twin-cover.jpg",
                        alt: {
                            en: "Twenty-five quadrotor UAVs generated in the AirSim digital-twin environment with three onboard sensor views",
                            zh: "AirSim 数字孪生环境中生成的 25 架四旋翼无人机及三个机载传感器视角",
                            ja: "AirSim デジタルツイン環境に生成された25機のクアッドローター UAV と3つの機載センサー視点"
                        },
                        caption: {
                            en: "25-UAV scale test in the Unreal Engine and AirSim environment",
                            zh: "Unreal Engine 与 AirSim 环境中的 25 架无人机规模测试",
                            ja: "Unreal Engine・AirSim 環境における25機規模のテスト"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/nwpu-uav-digital-twin-architecture.jpg",
                        alt: {
                            en: "System architecture connecting the UAV, controller, simulator, physics, sensors, rendering, environment, and data collection",
                            zh: "连接无人机、控制器、仿真器、物理、传感器、渲染、环境与数据采集模块的系统架构",
                            ja: "UAV、制御器、シミュレーター、物理、センサー、描画、環境、データ収集を接続するシステム構成"
                        },
                        caption: {
                            en: "Digital-twin system architecture",
                            zh: "数字孪生系统架构",
                            ja: "デジタルツインのシステム構成"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/nwpu-uav-digital-twin-formation.jpg",
                        alt: {
                            en: "Three simulated quadrotor UAVs aligned in formation on a sports field",
                            zh: "运动场上编队排列的三架仿真四旋翼无人机",
                            ja: "グラウンド上で編隊を組む3機のシミュレーション UAV"
                        },
                        caption: {
                            en: "Three-UAV formation generated in AirSim",
                            zh: "AirSim 中生成的三机编队",
                            ja: "AirSim で生成した3機編隊"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/nwpu-uav-digital-twin-data.png",
                        alt: {
                            en: "Recorded AirSim data table with vehicle names, positions, quaternions, and image references",
                            zh: "包含飞行器名称、位置、四元数与图像引用的 AirSim 数据记录表",
                            ja: "機体名、位置、クォータニオン、画像参照を含む AirSim の記録データ表"
                        },
                        caption: {
                            en: "Shared flight-data table and captured-image references",
                            zh: "共享飞行数据表与采集图像引用",
                            ja: "共有飛行データ表と撮影画像の参照"
                        },
                        fit: "contain"
                    },
                    {
                        src: "/images/projects/nwpu-uav-digital-twin-remote.png",
                        alt: {
                            en: "Remote communication test with AirSim on Windows and PX4 plus QGroundControl on Ubuntu",
                            zh: "Windows 上运行 AirSim、Ubuntu 上运行 PX4 与 QGroundControl 的远程通信测试",
                            ja: "Windows 上の AirSim と Ubuntu 上の PX4・QGroundControl を接続した遠隔通信テスト"
                        },
                        caption: {
                            en: "Windows host and Ubuntu client remote-control test",
                            zh: "Windows 主机与 Ubuntu 客户端远程控制测试",
                            ja: "Windows ホストと Ubuntu クライアントによる遠隔制御テスト"
                        },
                        fit: "contain"
                    }
                ],
                github: "https://github.com/huiishan99/nwpu-undergraduate-thesis",
                paper: "https://web-publications.vercel.app/paper/quadrotor-uav-formation-digital-twin-thesis.pdf",
                caseStudy: "https://web-publications.vercel.app/publications/quadrotor-uav-formation-digital-twin-thesis/",
                tags: ["Digital Twin", "UAV", "Unreal Engine", "AirSim", "PX4"]
            }
        ]
    },
    // 添加新类别示例：
    // {
    //   id: "publications",
    //   title: "Publications",
    //   icon: "📄",
    //   items: [
    //     {
    //       title: "论文标题",
    //       description: "论文摘要...",
    //       website: "https://doi.org/xxx",  // 论文链接
    //       image: "/images/projects/paper-preview.jpg",  // 预览图
    //       tags: ["HCI", "VR", "2024"]
    //     }
    //   ]
    // }
];
