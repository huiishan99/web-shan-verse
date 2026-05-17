// About Page Data
// 编辑这个文件来更新 About 页面的所有内容

type LocalizedString = string | {
  en: string;
  zh?: string;
  ja?: string;
};

// ============================================
// 页面标题和简介
// ============================================
export const pageHeader = {
  title: {
    en: "About Me",
    zh: "关于我",
    ja: "自己紹介"
  },
  subtitle: {
    en: "The story behind the code",
    zh: "代码背后的故事",
    ja: "コードの背景にある物語"
  }
};

// 简介段落 - 支持 HTML 标签如 <span class="highlight">
export const intro = [
  {
    en: `For a long time, I lived with the belief that life had no inherent meaning and that everything we know would eventually fade into nothing.
  It drove me to <span class="highlight">live for myself</span> and to explore this world as an adventurer who seeks to experience every possibility.`,
    zh: `很长一段时间里，我都相信人生并没有天然的意义，我们所知的一切终将归于虚无。也正因为如此，我开始学着 <span class="highlight">为自己而活</span>，像一个冒险者一样去体验世界里尽可能多的可能性。`,
    ja: `長い間、人生には最初から決まった意味などなく、私たちが知っているものもいつかは消えていくのだと思っていました。だからこそ、私は <span class="highlight">自分のために生きる</span> ことを選び、あらゆる可能性を経験する冒険者のように世界を歩き始めました。`
  },
  {
    en: `Coming to Japan on my own was the moment I finally let go of my past. I found a way to heal the wounds of my childhood and rediscovered the <span class="highlight">capacity to love</span>. On that day, the questions I had been asking the world for years finally found their peace.`,
    zh: `独自来到日本，是我终于放下过去的时刻。我找到了修复童年伤口的方式，也重新找回了 <span class="highlight">去爱人的能力</span>。那一天，我多年来向世界追问的问题，终于安静了下来。`,
    ja: `一人で日本に来たことは、過去を手放す大きな転機でした。幼い頃の傷を癒やす方法を見つけ、もう一度 <span class="highlight">愛する力</span> を取り戻しました。その日、長い間世界に問い続けてきた疑問は、ようやく静かになりました。`
  },
  {
    en: `I no longer seek faith in things I cannot see because I have found truth in what I have lived. As Carl Jung once said: <span class="highlight">"I don't need to believe; I know."</span>`,
    zh: `我不再向看不见的事物索要信仰，因为我已经在真实经历过的人生里找到了答案。正如荣格所说：<span class="highlight">“我不需要相信；我知道。”</span>`,
    ja: `もう、見えないものに信仰を求める必要はありません。自分が生きてきた経験の中に、確かな真実を見つけたからです。カール・ユングの言葉を借りるなら、<span class="highlight">「私は信じる必要はない。私は知っている。」</span>`
  }
];

// ============================================
// 右侧个人卡片
// ============================================
export const profile = {
  name: "Lai HuiShan",
  initials: "HS",           // 头像占位符显示的文字
  title: {
    en: "Developer & Researcher",
    zh: "开发者与研究者",
    ja: "開発者・研究者"
  },
  avatar: "/images/bio-photo.jpg",               // 头像图片路径，留空则显示 initials
  
  // 社交链接 - 添加或删除都很容易
  links: [
    { name: "GitHub", url: "https://github.com/huiishan99", icon: "github" },
    { name: "LinkedIn", url: "https://linkedin.com/in/laihuishan/", icon: "linkedin" },
    { name: "Instagram", url: "https://instagram.com/huii.shan.9/", icon: "instagram" },
    // 添加更多链接示例：
    // { name: "YouTube", url: "https://youtube.com/@xxx", icon: "link" },
    // { name: "Twitter", url: "https://twitter.com/xxx", icon: "twitter" },
  ]
};

// ============================================
// 教育经历
// ============================================
export interface EducationItem {
  school: LocalizedString;
  location: LocalizedString;
  description?: LocalizedString;  // 可选：简短描述
  degree: LocalizedString;
  period: LocalizedString;
  logo?: string;            // 可选：学校 logo 路径
}

export const education: EducationItem[] = [
  {
    school: "University of Aizu",
    location: { en: "Aizu-Wakamatsu, Japan", zh: "日本会津若松", ja: "日本・会津若松" },
    description: {
      en: "Graduated early with Grade A after completing all program and research requirements. Research focused on virtual reality (VR) and embodied AI avatars for self-learning in educational contexts. First-author paper published at IEEE GEM 2025, and a co-authored paper related to large language model–based software security published at ISPEC 2025.",
      zh: "完成所有课程与研究要求后以 A 级成绩提前毕业。研究方向聚焦教育场景中的虚拟现实（VR）与具身 AI 头像辅助自学。第一作者论文发表于 IEEE GEM 2025，另有一篇关于大语言模型软件安全的共同作者论文发表于 ISPEC 2025。",
      ja: "すべての課程および研究要件を修了し、成績 A で早期修了。研究テーマは、教育場面における自学習支援のための VR と身体化 AI アバター。第一著者論文が IEEE GEM 2025 に採択され、大規模言語モデルに基づくソフトウェアセキュリティに関する共著論文が ISPEC 2025 に採択されました。"
    },
    degree: {
      en: "Master of Science - Computer Science and Engineering",
      zh: "理学硕士 - 计算机科学与工程",
      ja: "修士（理学）- コンピュータ理工学"
    },
    period: "Apr 2024 - Sep 2025",
    logo: "/images/logo-uoa.png"
  },
  {
    school: "ABK College",
    location: { en: "Tokyo, Japan", zh: "日本东京", ja: "日本・東京" },
    description: {
      en: "Japanese language program completed as preparation for graduate studies in Japan. Built friendships with students from Thailand, Vietnam, Myanmar, Mongolia, India, Ukraine, and France, broadening my international perspective, while working two part-time jobs in Japan.",
      zh: "为了赴日读研完成日语课程。在日本一边打两份兼职，一边与来自泰国、越南、缅甸、蒙古、印度、乌克兰和法国的同学建立友谊，也拓宽了自己的国际视野。",
      ja: "日本で大学院に進学する準備として日本語課程を修了。日本で二つのアルバイトをしながら、タイ、ベトナム、ミャンマー、モンゴル、インド、ウクライナ、フランスから来た学生たちと交流し、国際的な視野を広げました。"
    },
    degree: {
      en: "Certificate of Completion - Japanese Language Program",
      zh: "结业证书 - 日语课程",
      ja: "修了証 - 日本語課程"
    },
    period: "Oct 2022 - Mar 2024",
    logo: ""
  },
  {
    school: "Northwestern Polytechnical University",
    location: { en: "Xi'an, China", zh: "中国西安", ja: "中国・西安" },
    description:{
      en: "Completed a Bachelor’s degree under the School of Computer Science with a thesis grade of 88/100. Undergraduate thesis focused on the simulation and control of formation flight UAV systems. Actively involved in student activities as a member of the Student Organizations Council and the university’s Chinese Debate Team.",
      zh: "本科就读于计算机学院，毕业论文成绩 88/100。毕业论文聚焦四旋翼无人机编队飞行系统的仿真与控制。大学期间积极参与学生组织，曾任学生社团联合会成员及校中文辩论队成员。",
      ja: "コンピュータ学院で学士課程を修了し、卒業論文の成績は 88/100。卒業研究では、クアッドローター UAV 編隊飛行システムのシミュレーションと制御に取り組みました。在学中は学生団体連合会および大学の中国語ディベートチームにも参加しました。"
    },
    degree: {
      en: "Bachelor of Engineering - Electronic Commerce",
      zh: "工学学士 - 电子商务",
      ja: "工学学士 - 電子商取引"
    },
    period: "Sep 2018 - Jun 2022",
    logo: "/images/logo-nwpu.png"
  }
];

// ============================================
// 工作/实习经历
// ============================================
export interface ExperienceItem {
  company: LocalizedString;
  role: LocalizedString;
  description?: LocalizedString;     // 可选：简短描述
  period: LocalizedString;
  logo?: string;            // 可选：公司 logo 路径
}

export const experience: ExperienceItem[] = [
  {
    company: "ALPS ALPINE",
    role: { en: "Engineer (New Graduate)", zh: "工程师（新卒）", ja: "エンジニア（新卒）" },
    period: { en: "Current", zh: "现在", ja: "現在" },
    logo: "/images/logo-alps.png",
    description: {
      en: "Currently working as a new graduate engineer in the Development & Design Division, 4th Software Engineering Department (開発設計部第４ソフト技術部). The team focuses on embedded software development with PoC-style prototyping. I am learning the department's development workflow and strengthening my embedded software engineering fundamentals through daily project work.",
      zh: "目前作为新卒工程师在开发设计部第四软件技术部工作。团队主要负责嵌入式软件开发与 PoC 风格原型验证。我正在日常项目中学习部门开发流程，并夯实嵌入式软件工程基础。",
      ja: "現在、開発設計部第4ソフト技術部で新卒エンジニアとして勤務しています。チームは組込みソフトウェア開発と PoC 型のプロトタイピングを中心に担当しています。日々の業務を通じて部署の開発フローを学び、組込みソフトウェアエンジニアリングの基礎を強化しています。"
    }
  },
  {
    company: "ALPS ALPINE",
    role: { en: "Engineer Internship", zh: "工程师实习", ja: "エンジニアインターン" },
    period: { en: "2 weeks", zh: "2 周", ja: "2週間" },
    logo: "/images/logo-alps.png",
    description: {
      en: "Developed a VR-based futuristic car HMI prototype using Unity. Built an autonomous driving scenario set on a U.S. highway with experimental next-generation HMI concepts. The prototype was designed for exhibition at CES 2025.",
      zh: "使用 Unity 开发基于 VR 的未来汽车 HMI 原型。构建了以美国高速公路为背景的自动驾驶场景，并加入实验性的下一代 HMI 概念。该原型用于 CES 2025 展示。",
      ja: "Unity を用いて、VR ベースの未来型車載 HMI プロトタイプを開発しました。米国の高速道路を舞台にした自動運転シナリオと、実験的な次世代 HMI コンセプトを実装しました。このプロトタイプは CES 2025 展示向けに制作されました。"
    }
  },
  {
    company: "University of Aizu",
    role: { en: "Part Time - Teaching Assistant", zh: "兼职 - 助教", ja: "アルバイト - ティーチングアシスタント" },
    period: { en: "1 year", zh: "1 年", ja: "1年" },
    logo: "/images/logo-uoa.png",
    description: {
      en: "Assisted professors in supervising undergraduate students. Supported academic reports using MATLAB and Wolfram (2024), and guided VR application development using Unity (2025). Independently prepared and delivered one lecture session on VR development.",
      zh: "协助教授指导本科生。2024 年支持学生使用 MATLAB 和 Wolfram 完成学术报告，2025 年指导 Unity VR 应用开发。曾独立准备并讲授一节 VR 开发课程。",
      ja: "教授の学部生指導を補助しました。2024年は MATLAB と Wolfram を用いたレポート作成を支援し、2025年は Unity による VR アプリ開発を指導しました。VR 開発に関する講義を1回、独自に準備して実施しました。"
    }
  },
  {
    company: "Alibaba GDT Network",
    role: { en: "Student Internship", zh: "学生实习", ja: "学生インターン" },
    period: { en: "3 months", zh: "3 个月", ja: "3か月" },
    logo: "/images/logo-gdt.png",
    description: {
      en: "Worked on technical marketing operations. Conducted target user analysis and e-commerce marketing planning using Joyoung blender products as a case study, focusing on data-driven advertising strategies.",
      zh: "参与技术营销运营工作。以九阳破壁机产品为案例进行目标用户分析与电商营销策划，重点关注数据驱动的广告策略。",
      ja: "テクニカルマーケティング業務に携わりました。Joyoung のブレンダー製品を事例として、ターゲットユーザー分析と EC マーケティング企画を行い、データドリブンな広告戦略に取り組みました。"
    }
  },
  {
    company: "Hamazushi",
    role: { en: "Part Time - Kitchen Staff", zh: "兼职 - 厨房员工", ja: "アルバイト - キッチンスタッフ" },
    period: { en: "1 year", zh: "1 年", ja: "1年" },
    logo: "/images/logo-uoa.png",
    description: {
      en: "Worked in the kitchen preparing sushi, including nigiri, rolls, and gunkan. Assisted with dessert preparation, cleaning, and general kitchen operations. Averaged 16 working hours per week.",
      zh: "在厨房负责制作寿司，包括握寿司、卷物和军舰寿司，同时协助甜品准备、清洁与厨房日常运营。平均每周工作 16 小时。",
      ja: "キッチンで握り、巻物、軍艦などの寿司を準備し、デザート準備、清掃、一般的なキッチン業務も担当しました。週平均16時間勤務しました。"
    }
  },
  {
    company: "Coco Ichibanya Curry House",
    role: { en: "Part Time - Food Server", zh: "兼职 - 餐厅服务", ja: "アルバイト - ホールスタッフ" },
    period: { en: "1 year 2 months", zh: "1 年 2 个月", ja: "1年2か月" },
    logo: "/images/logo-uoa.png",
    description: {
      en: "Handled food preparation support, cleaning, cashier duties, order taking, and meal serving. Responsible for opening and closing tasks, including cash handling. Averaged 10 working hours per week.",
      zh: "负责备餐支持、清洁、收银、点单与上餐，也承担开店和闭店任务，包括现金处理。平均每周工作 10 小时。",
      ja: "調理補助、清掃、レジ、注文対応、配膳を担当しました。現金管理を含む開店・閉店作業も行い、週平均10時間勤務しました。"
    }
  }
];


// ============================================
// 奖状
// ============================================
export interface AwardsItem {
  title: LocalizedString;
  issuer: LocalizedString;
  description?: LocalizedString;     // 可选：简短描述
  period: LocalizedString;
  logo?: string;            // 可选：公司 logo 路径
}

export const awards: AwardsItem[] = [
  {
    title: "Presentation Award",
    issuer: "IEEE GEM 2025",
    description: "",
    period: "Jul 2025",
    logo: ""
  },
  {
    title: "Second Prize (School trails) in China College Students' ·Internet+· Innovation and Entrepreneurship Competition",
    issuer: "Ministry of Education, China",
    description: "",
    period: "Jan 2021",
    logo: ""
  },
  {
    title: "Second prize (Provincial trials) in China National Undergraduate ·Innovation, Creativity and Entrepreneurship· Challenge",
    issuer: "Ministry of Education, China",
    description: "",
    period: "Oct 2020",
    logo: ""
  },
  {
    title: "Consolation Prize in Dekad Bahasa 2.0 (2020) Dubbing Competition",
    issuer: "Association of Malaysian Students in Shaanxi (AMSISX) and Association of Malaysian Students in Hubei (AMSIH)",
    description: "",
    period: "Jan 2020",
    logo: ""
  },
  {
    title: "NPU President Scholarship",
    issuer: "Northwestern Polytechnical University",
    description: "First-Level Scholarship Winner (2018) - Exempted from tuition and accommodation fees; provided living allowance of 1,500 RMB/month for 12 months.",
    period: "Sep 2018",
    logo: ""
  },
];


// ============================================
// 技能
// ============================================
export interface SkillCategory {
  name: LocalizedString;
  skills: LocalizedString[];
}

export const skills: SkillCategory[] = [
  {
    name: { en: "Programming Languages", zh: "编程语言", ja: "プログラミング言語" },
    skills: ["C", "C#", "C++","Python", "JavaScript", "TypeScript", "Java" ,"Matlab"]
  },
  {
    name: { en: "Tools", zh: "工具", ja: "ツール" },
    skills: ["Unity","VS Code", "Git / GitHub", "Linux", "Docker", "Powershell","MongoDB"]
  },
  {
    name: { en: "Web Tech", zh: "Web 技术", ja: "Web 技術" },
    skills: ["React", "Next.js", "Node.js", "Flask","FastAPI","tailwindcss"]
  }
  // 添加更多分类：
  // {
  //   name: "Design",
  //   skills: ["Figma", "Photoshop"]
  // }
];

// ============================================
// 语言能力
// ============================================
export interface LanguageItem {
  name: LocalizedString;
  level: LocalizedString;            // Native, Fluent, Intermediate, Basic
}

export const languages: LanguageItem[] = [
  { name: { en: "Mandarin", zh: "普通话", ja: "中国語（標準語）" }, level: { en: "Native", zh: "母语", ja: "ネイティブ" } },
  { name: { en: "Cantonese", zh: "粤语", ja: "広東語" }, level: { en: "Native", zh: "母语", ja: "ネイティブ" } },
  { name: { en: "Hakka", zh: "客家话", ja: "客家語" }, level: { en: "Native", zh: "母语", ja: "ネイティブ" } },
  { name: { en: "English", zh: "英语", ja: "英語" }, level: { en: "Fluent", zh: "流利", ja: "流暢" } },
  { name: { en: "Japanese", zh: "日语", ja: "日本語" }, level: { en: "Intermediate", zh: "中级", ja: "中級" } },
  { name: { en: "Malay", zh: "马来语", ja: "マレー語" }, level: { en: "Intermediate", zh: "中级", ja: "中級" } }
];

// ============================================
// 兴趣爱好 (Beyond Code)
// ============================================
export interface InterestCategory {
  name: LocalizedString;             // 分类名称
  icon: string;             // 图标名称 (参考 Icon.astro)
  items: LocalizedString[];          // 具体内容
}

export const interests: InterestCategory[] = [
  {
    name: { en: "Games", zh: "游戏", ja: "ゲーム" },
    icon: "gamepad",
    items: ["The Legend of Zelda: Breath of the Wild", "Baldur's Gate 3", "Stardew Valley","Persona 5","Crusader Kings III","Cyberpunk 2077","Disco Elysium: The Final Cut","Uncharted Waters: New Horizons","Resident Evil 4","The Legend of Sword and Fairy 4"]
  },
  {
    name: { en: "Movies", zh: "电影", ja: "映画" },
    icon: "film",
    items: ["Coco", "Flipped","Howl's Moving Castle","The Truman Show","Interstellar","The Lord of the Rings","The Reluctant Fundamentalist","Maharaja"]
  },
  {
    name: { en: "Drama & Anime", zh: "剧集与动画", ja: "ドラマ・アニメ" },
    icon: "layers",
    items: ["Love, Death & Robots","Cyberpunk: Edgerunners","The Queen's Gambit", "Gin Tama", "Doraemon"]
  },
  {
    name: { en: "Books", zh: "书", ja: "本" },
    icon: "book",
    items: ["Les Misérables","A Thousand Splendid Suns","To Live","Tristan and Iseult","Kinder- und Hausmärchen"]
  },
  {
    name: { en: "Music", zh: "音乐", ja: "音楽" },
    icon: "music",
    items: ["Bohemian Rhapsody","We Are the Champions", "Lemon"]
  },
  {
    name: { en: "Foods", zh: "食物", ja: "食べ物" },
    icon: "coffee",
    items: [
      { en: "Ramen", zh: "拉面", ja: "ラーメン" },
      { en: "Sushi", zh: "寿司", ja: "寿司" },
      { en: "Hot pot", zh: "火锅", ja: "火鍋" }
    ]
  },
  {
    name: { en: "Hobbies", zh: "爱好", ja: "趣味" },
    icon: "sparkle",
    items: [
      { en: "Traveling", zh: "旅行", ja: "旅行" },
      { en: "Reading", zh: "阅读", ja: "読書" },
      { en: "Gaming", zh: "游戏", ja: "ゲーム" },
      { en: "Board gaming", zh: "桌游", ja: "ボードゲーム" }
    ]
  },
  {
    name: { en: "Interests Topics", zh: "感兴趣的话题", ja: "関心のあるテーマ" },
    icon: "lightbulb",
    items: [
      { en: "Analytical psychology", zh: "分析心理学", ja: "分析心理学" },
      { en: "Existentialism", zh: "存在主义", ja: "実存主義" },
      { en: "Cosmology", zh: "宇宙学", ja: "宇宙論" },
      { en: "Socionics", zh: "社会人格学", ja: "ソシオニクス" }
    ]
  }
  // 添加更多分类：
  // {
  //   name: "Others",
  //   icon: "star",
  //   items: ["..."]
  // }
];
