// Projects & Publications Data
// 以后添加新项目只需编辑这个文件
import type { LocalizedString } from '../i18n/config';

export interface ProjectItem {
    title: LocalizedString;
    description: LocalizedString;
    details?: LocalizedString;
    authors?: LocalizedString;
    conference?: LocalizedString;
    tags?: LocalizedString[];
    status?: ProjectStatus;
    featuredLabel?: LocalizedString;
    // 可选字段
    github?: string;        // GitHub 链接
    paper?: string;         // ACM / IEEE / DOI 等官方论文页
    caseStudy?: string;     // 自己网站上的项目或论文介绍页
    website?: string;       // 网站/演示链接
    image?: string;         // 预览图路径 (放在 public/images/projects/)
    detailImage?: string;   // 详情弹窗图片；不设置时可回退到预览图
    detailImageAlt?: LocalizedString;
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
    | "private"
    | "archive";

export const projectCategories: ProjectCategory[] = [
    {
        id: "vr",
        title: { en: "VR/XR Projects", zh: "VR/XR 项目", ja: "VR/XR プロジェクト" },
        icon: "vr",
        items: [
            {
                title: "VR Car Scene Prototype",
                description: {
                    en: "Unity VR car-scene prototype built during my ALPS ALPINE internship for Meta Quest testing.",
                    zh: "在 ALPS ALPINE 实习期间制作的 Unity VR 汽车场景原型，用于 Meta Quest 测试。",
                    ja: "ALPS ALPINE のインターン中に制作した Unity VR 車載シーンのプロトタイプ。Meta Quest でのテスト向けに開発しました。"
                },
                details: {
                    en: "This internship prototype explored how a Unity-built automotive VR scene could be prepared and checked on Meta Quest hardware. The public record focuses on the development context and device-validation workflow; internal assets, product requirements, and company implementation details are intentionally omitted.",
                    zh: "这个实习原型探索了如何将 Unity 构建的汽车 VR 场景部署到 Meta Quest 硬件上并进行检查。公开介绍仅保留开发背景与设备验证流程；内部资源、产品需求和公司实现细节均有意省略。",
                    ja: "このインターンシップ用プロトタイプでは、Unity で構築した車載 VR シーンを Meta Quest 実機へ展開し、確認する流れを検討しました。公開情報は開発背景とデバイス検証の範囲に限定し、社内アセット、製品要件、実装詳細は意図的に省略しています。"
                },
                featured: true,
                tags: ["Unity", "VR", "Meta Quest"]
            },
            {
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
                title: "Mamba Project",
                description: {
                    en: "University of Aizu CFS03 Unity VR project using an Oculus/XR scene and human anatomy model assets.",
                    zh: "会津大学 CFS03 Unity VR 项目，使用 Oculus/XR 场景和人体解剖模型资源。",
                    ja: "会津大学 CFS03 の Unity VR プロジェクト。Oculus/XR シーンと人体解剖モデルアセットを使用しています。"
                },
                github: "https://github.com/huiishan99/uoa-cfs03-manba-project",
                tags: ["Unity", "C#", "VR", "Oculus"]
            },
            {
                title: "Master Project",
                description: {
                    en: "Unity VR classroom research prototype with an embodied avatar, speech services, and a Python backend.",
                    zh: "Unity VR 教室研究原型，包含具身头像、语音服务和 Python 后端。",
                    ja: "身体化アバター、音声サービス、Python バックエンドを備えた Unity VR 教室研究プロトタイプ。"
                },
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                tags: ["Unity", "C#", "Python", "VR"]
            },
        ]
    },
    {
        id: "unity",
        title: { en: "Unity Projects", zh: "Unity 项目", ja: "Unity プロジェクト" },
        icon: "cube",
        items: [
            {
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
                title: "2D Platformer",
                description: {
                    en: "Unity 2D platformer practice project; the repository is not currently public.",
                    zh: "Unity 2D 平台跳跃练习项目；仓库目前未公开。",
                    ja: "Unity の 2D プラットフォーマー練習プロジェクト。リポジトリは現在非公開です。"
                },
                github: "",
                tags: ["Unity", "C#", "2D"]
            },
            {
                title: "2D Shooter Game",
                description: {
                    en: "Unity 2D spaceship shooter with enemies, projectiles, level scenes, score UI, and menu flow.",
                    zh: "Unity 2D 太空射击游戏，包含敌人、子弹、关卡场景、分数 UI 和菜单流程。",
                    ja: "敵、弾、レベルシーン、スコア UI、メニュー導線を備えた Unity 2D 宇宙船シューティングゲーム。"
                },
                github: "https://github.com/huiishan99/unity-2d-shooter-game",
                website: "https://huiishan99.itch.io/2d-shooter",
                tags: ["Unity", "C#", "2D", "Game UI"]
            },
            {
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
                title: "SHAN-VERSE",
                description: {
                    en: "My personal portfolio and blog built with Astro, MDX, custom styling, sitemap, and project data tooling.",
                    zh: "我的个人作品集与博客网站，使用 Astro、MDX、自定义样式、站点地图和项目数据工具构建。",
                    ja: "Astro、MDX、カスタムスタイル、サイトマップ、プロジェクトデータ用ツールで構築した個人ポートフォリオ兼ブログサイト。"
                },
                details: {
                    en: "SHAN-VERSE is the living system behind this portfolio: an Astro and MDX static site with multilingual routes, structured project and timeline data, custom visual components, and build-time validation. It is also where I gradually publish research status, personal records, and technical writing while keeping private work appropriately abstract.",
                    zh: "SHAN-VERSE 是这份个人作品集背后的持续演进系统：它以 Astro 与 MDX 构建，包含多语言路由、结构化项目与时间线数据、自定义视觉组件和构建期验证。这里也用于逐步公开研究状态、个人记录与技术写作，同时对尚未公开的工作保持适当抽象。",
                    ja: "SHAN-VERSE は、このポートフォリオを支える継続的に発展するシステムです。Astro と MDX を基盤に、多言語ルート、構造化されたプロジェクト／タイムラインデータ、独自のビジュアルコンポーネント、ビルド時検証を備えています。未公開の研究を適切に抽象化しながら、研究状況、個人記録、技術記事を段階的に公開する場所でもあります。"
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
                title: "Math-Note",
                description: {
                    en: "AI math canvas app with a React/Vite frontend and FastAPI backend that sends drawn equations to Gemini.",
                    zh: "AI 数学画布应用，React/Vite 前端与 FastAPI 后端会将手写公式发送给 Gemini 进行处理。",
                    ja: "React/Vite フロントエンドと FastAPI バックエンドを持つ AI 数学キャンバスアプリ。描いた数式を Gemini に送信します。"
                },
                github: "https://github.com/huiishan99/web-math-note",
                website: "https://math-notes-clone.vercel.app/",
                tags: ["React", "Vite", "TypeScript", "FastAPI", "Gemini"]
            },
            {
                title: "Yumemi Test",
                description: {
                    en: "Yumemi frontend test SPA that visualizes Japanese prefecture population trends with charts and filters.",
                    zh: "Yumemi 前端测试 SPA，用图表和筛选器可视化日本都道府县人口趋势。",
                    ja: "都道府県別の人口推移をチャートとフィルターで可視化する Yumemi フロントエンド試験用 SPA。"
                },
                github: "https://github.com/huiishan99/web-yumemi-test",
                website: "https://web-yumemi-test.vercel.app/",
                tags: ["React", "Vite", "TypeScript", "Highcharts", "Vitest"]
            },
            {
                title: "Weather App",
                description: {
                    en: "Static weather lookup app using OpenWeather data, city search, and weather-specific UI illustrations.",
                    zh: "静态天气查询应用，使用 OpenWeather 数据、城市搜索和对应天气的 UI 插图。",
                    ja: "OpenWeather のデータ、都市検索、天気に応じた UI イラストを使った静的な天気検索アプリ。"
                },
                github: "https://github.com/huiishan99/web-weather-app",
                website: "https://js-weather-app-nine-wine.vercel.app",
                tags: ["HTML", "CSS", "JavaScript", "OpenWeather API"]
            },
            {
                title: "Falling Sand",
                description: {
                    en: "Interactive falling-sand sandbox with p5-style rendering, material rules, draggable controls, and pause/step tools.",
                    zh: "交互式 falling-sand 沙盒，包含 p5 风格渲染、材料规则、可拖拽控制和暂停/单步工具。",
                    ja: "p5 風レンダリング、素材ルール、ドラッグ可能なコントロール、一時停止/ステップ機能を備えたインタラクティブな falling-sand サンドボックス。"
                },
                github: "https://github.com/huiishan99/web-falling-sand",
                website: "https://huiishan99.github.io/web-falling-sand/",
                tags: ["JavaScript", "p5.js", "Vite"]
            },
            {
                title: "Dark Light Toggle",
                description: {
                    en: "Small HTML, CSS, and JavaScript UI experiment for an animated dark/light mode toggle.",
                    zh: "用 HTML、CSS 和 JavaScript 制作的暗色/亮色模式切换动画小实验。",
                    ja: "HTML、CSS、JavaScript で作った、ダーク/ライトモード切り替えアニメーションの小さな UI 実験。"
                },
                github: "https://github.com/huiishan99/web-dark-light-toggle",
                website: "https://huiishan99.github.io/web-dark-light-toggle/",
                tags: ["HTML", "CSS", "JavaScript"]
            },
            {
                title: "DreamLight",
                description: {
                    en: "Static promotional site for a BitSummit 2024 light-show and drone game concept.",
                    zh: "为 BitSummit 2024 灯光秀与无人机游戏概念制作的静态宣传网站。",
                    ja: "BitSummit 2024 向けのライトショーとドローンゲーム構想のために制作した静的プロモーションサイト。"
                },
                github: "https://github.com/huiishan99/web-dreamlight",
                website: "https://web-dreamlight.vercel.app/",
                tags: ["HTML", "SCSS", "JavaScript"]
            },
            {
                title: "Hexo Page",
                description: {
                    en: "Hexo blog deployment experiment on Vercel for testing static blog generation and theme structure.",
                    zh: "部署在 Vercel 上的 Hexo 博客实验，用于测试静态博客生成和主题结构。",
                    ja: "静的ブログ生成とテーマ構造を試すために Vercel にデプロイした Hexo ブログ実験。"
                },
                github: "",
                website: "https://hexo-six-green.vercel.app/",
                tags: ["Hexo", "JavaScript"]
            },
            {
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
                title: "Silver Game",
                description: {
                    en: "Hackathon frontend for an elderly-focused social platform with realtime multimodal emotion analysis.",
                    zh: "面向老年人社交平台的黑客松前端，包含实时多模态情绪分析。",
                    ja: "高齢者向けソーシャルプラットフォームのハッカソン用フロントエンド。リアルタイムのマルチモーダル感情分析を備えています。"
                },
                github: "https://github.com/huiishan99/web-ai-in-action-frontend",
                website: "https://web-ai-in-action-frontend.vercel.app",
                tags: ["Next.js", "React", "TypeScript", "FastAPI", "PyTorch"]
            },
            {
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
                title: "Human Activity Pattern Processing",
                description: {
                    en: "University of Aizu ITA09 coursework with Python scripts and Jupyter notebooks for activity-pattern processing.",
                    zh: "会津大学 ITA09 课程项目，使用 Python 脚本和 Jupyter Notebook 处理活动模式数据。",
                    ja: "会津大学 ITA09 の授業課題。Python スクリプトと Jupyter Notebook を用いて活動パターン処理を行いました。"
                },
                github: "https://github.com/huiishan99/uoa-human-activity-pattern-processing",
                tags: ["Python", "Jupyter Notebook", "Machine Learning"]
            },
            {
                title: "Advanced Robotics",
                description: {
                    en: "University of Aizu ITC03A Advanced Robotics coursework implemented mainly with MATLAB scripts.",
                    zh: "会津大学 ITC03A Advanced Robotics 课程项目，主要使用 MATLAB 脚本实现。",
                    ja: "会津大学 ITC03A Advanced Robotics の授業課題。主に MATLAB スクリプトで実装しました。"
                },
                github: "https://github.com/huiishan99/uoa-advanced-robotics",
                tags: ["MATLAB", "Robotics"]
            },
            {
                title: "Biosignal Processing and Data Mining",
                description: {
                    en: "University of Aizu ITA25 coursework with MATLAB assignments for biosignal processing and data mining.",
                    zh: "会津大学 ITA25 课程项目，包含用于生物信号处理与数据挖掘的 MATLAB 作业。",
                    ja: "会津大学 ITA25 の授業課題。生体信号処理とデータマイニングのための MATLAB 課題を含みます。"
                },
                github: "https://github.com/huiishan99/uoa-biosignal-processing-and-data-mining",
                tags: ["MATLAB", "Biosignal Processing", "Data Mining"]
            },
            {
                title: "Applied Statistics",
                description: {
                    en: "University of Aizu CSC03F applied statistics coursework notes and assignment records.",
                    zh: "会津大学 CSC03F 应用统计课程笔记与作业记录。",
                    ja: "会津大学 CSC03F 応用統計の授業ノートと課題記録。"
                },
                github: "https://github.com/huiishan99/uoa-applied-statistics",
                tags: ["Statistics", "Coursework"]
            },
            {
                title: "Software Engineering",
                description: {
                    en: "University of Aizu SEC01F software engineering coursework notes and assignment records.",
                    zh: "会津大学 SEC01F 软件工程课程笔记与作业记录。",
                    ja: "会津大学 SEC01F ソフトウェア工学の授業ノートと課題記録。"
                },
                github: "https://github.com/huiishan99/uoa-software-engineering",
                tags: ["Software Engineering", "Coursework"]
            },
            {
                title: "NWPU Undergraduate Thesis",
                description: {
                    en: "Undergraduate thesis records for a quadrotor UAV formation digital-twin system using AirSim/PX4 references.",
                    zh: "本科毕业论文记录，主题为参考 AirSim/PX4 的四旋翼无人机编队数字孪生系统。",
                    ja: "AirSim/PX4 を参考にしたクアッドローター UAV 編隊デジタルツインシステムに関する卒業論文記録。"
                },
                github: "https://github.com/huiishan99/nwpu-undergraduate-thesis",
                tags: ["Digital Twin", "UAV", "AirSim", "PX4"]
            }

        ]
    },
    {
        id: "other",
        title: { en: "Other Project", zh: "其他项目", ja: "その他のプロジェクト" },
        icon: "folder",
        items: [
            {
                title: "Tetris Clone",
                description: {
                    en: "Native Windows C++ Tetris clone with scoring, hold piece, ghost preview, levels, and best-score tracking.",
                    zh: "原生 Windows C++ 俄罗斯方块克隆，包含计分、保留方块、幽灵预览、等级和最高分记录。",
                    ja: "スコア、ホールド、ゴーストプレビュー、レベル、ベストスコア記録を備えたネイティブ Windows C++ のテトリスクローン。"
                },
                github: "https://github.com/huiishan99/cpp-tetris-game",
                tags: ["C++", "Win32", "Game Dev"]
            },
            {
                title: "OpenGL Practice",
                description: {
                    en: "OpenGL learning project covering windows, triangles, buffers, shaders, textures, and basic 3D rendering.",
                    zh: "OpenGL 学习项目，覆盖窗口、三角形、缓冲区、着色器、纹理和基础 3D 渲染。",
                    ja: "ウィンドウ、三角形、バッファ、シェーダー、テクスチャ、基本的な 3D レンダリングを扱う OpenGL 学習プロジェクト。"
                },
                github: "https://github.com/huiishan99/opengl-vector-graphic",
                tags: ["C++", "OpenGL", "GLFW"]
            },
            {
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
                title: "PTA Practice",
                description: {
                    en: "PTA online judge practice record; the repository is not currently public.",
                    zh: "PTA 在线评测练习记录；仓库目前未公开。",
                    ja: "PTA オンラインジャッジの練習記録。リポジトリは現在非公開です。"
                },
                github: "",
                tags: ["C#", "OJ"]
            },
            {
                title: "Paiza Practice",
                description: {
                    en: "Paiza online judge practice record; the repository is not currently public.",
                    zh: "Paiza 在线评测练习记录；仓库目前未公开。",
                    ja: "Paiza オンラインジャッジの練習記録。リポジトリは現在非公開です。"
                },
                github: "",
                tags: ["C#", "OJ"]
            },
            {
                title: "Rockfall Game",
                description: {
                    en: "Pygame avoidance game with data collection, Random Forest training, and AI-controlled play mode.",
                    zh: "Pygame 躲避类游戏，包含数据收集、随机森林训练和 AI 控制游玩模式。",
                    ja: "データ収集、ランダムフォレスト学習、AI 操作モードを備えた Pygame の回避ゲーム。"
                },
                github: "https://github.com/huiishan99/python-rockfall-game",
                tags: ["Python", "Pygame", "scikit-learn"]
            },
            {
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
                featured: true,
                featuredLabel: {
                    en: "Presentation Award",
                    zh: "Presentation Award",
                    ja: "Presentation Award"
                },
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                paper: "https://doi.org/10.1109/GEM66882.2025.11155841",
                tags: ["AI-driven Education", "Virtual Reality", "Embodied Avatar","IEEE GEM 2025"]
            },
            {
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
                github: "https://github.com/huiishan99/vibe-sec-experiment",
                paper: "https://link.springer.com/chapter/10.1007/978-981-95-9284-5_27",
                tags: ["Large Language Models","Software Security","Vibe Coding","ISPEC 2025"]
            },
            {
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
                paper: "https://dl.acm.org/doi/10.1145/3795011.3795053",
                tags: ["Virtual Reality","Multimodal Interaction","AI-Driven","AHs 2026"]
            },
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
