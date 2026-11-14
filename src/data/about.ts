// About Page Data
// 编辑这个文件来更新 About 页面的所有内容
import type { LocalizedString } from '../i18n/config';

// ============================================
// 页面标题和简介
// ============================================
export const pageHeader = {
  title: {
    en: "About Me",
    zh: "关于我",
    ja: "私について"
  },
  subtitle: {
    en: "The story behind the code",
    zh: "代码背后的故事",
    ja: "コードの背後にある物語"
  }
};

// 简介段落 - 支持 HTML 标签如 <span class="highlight">
export const intro = [
  {
    en: `For a long time, I lived with the belief that life had no inherent meaning and that everything we know would eventually fade into nothing.
  It drove me to <span class="highlight">live for myself</span> and to explore this world as an adventurer who seeks to experience every possibility.`,
    zh: `很长一段时间以来，我一直认为生命没有内在意义，我们所知的一切最终都会消逝于虚无。这种想法驱使我为自己而活，像个冒险家一样探索这个世界，渴望体验每一种可能性。`,
    ja: `長い間、私は人生には本来的な意味はなく、私たちが知っていることはすべていずれ虚無へと消え去るという考えを持って生きてきました。その考えが、私自身のために生き、あらゆる可能性を体験しようとする冒険家としてこの世界を探求する原動力となったのです。`
  },
  {
    en: `Coming to Japan on my own was the moment I finally let go of my past. I found a way to heal the wounds of my childhood and rediscovered the <span class="highlight">capacity to love</span>. On that day, the questions I had been asking the world for years finally found their peace.`,
    zh: `独自来到日本的那一刻，我终于放下了过去。我找到了治愈童年创伤的方法，也重新找回了爱的能力。在那一天，我多年来一直追问世界的那些问题，终于得到了解答。`,
    ja: `一人で日本に来たことで、私はついに過去を手放すことができました。幼少期の心の傷を癒す方法を見つけ、愛する力を取り戻しました。その日、私が長年世界に問い続けてきた疑問に、ようやく答えを得ました。`
  },
  {
    en: `I no longer seek faith in things I cannot see because I have found truth in what I have lived. As Carl Jung once said: <span class="highlight">"I don't need to believe; I know."</span>`,
    zh: `我不再对看不见的事物寻求信仰，因为我已在亲身经历中找到了真理。正如卡尔·荣格所说：<span class="highlight">“我不需要相信；我知道。”</span>`,
    ja: `私はもはや目に見えないものに信仰を求めることはありません。なぜなら、自分の経験の中に真実を見出したからです。カール・ユングがかつて言ったように、<span class="highlight">「信じる必要はない。私は知っているのだ。」</span>`
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
    zh: "开发者 & 研究者",
    ja: "開発者 & 研究者"
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
  website: string;
  location: LocalizedString;
  description?: LocalizedString;  // 可选：简短描述
  degree: LocalizedString;
  period: LocalizedString;
  logo?: string;            // 可选：学校 logo 路径
}

export const education: EducationItem[] = [
  {
    school: { en: "University of Aizu", zh: "会津大学", ja: "会津大学" },
    website: "https://u-aizu.ac.jp/en/",
    location: { en: "Aizu-Wakamatsu, Japan", zh: "日本会津若松", ja: "日本・会津若松" },
    description: {
      en: "Graduated early with Grade A after completing all program and research requirements. Research focused on virtual reality (VR) and embodied AI avatars for self-learning in educational contexts. First-author paper published at IEEE GEM 2025, and a co-authored paper related to large language model–based software security published at ISPEC 2025.",
      zh: "在完成所有课程和研究要求后，以 A 等级提前毕业。研究重点是教育场景中用于自主学习的虚拟现实（VR）和具身 AI 头像。第一作者论文发表于 IEEE GEM 2025，一篇与基于大语言模型的软件安全相关的共同作者论文发表于 ISPEC 2025。",
      ja: "すべてのプログラムおよび研究要件を完了した後、Grade A で早期卒業しました。研究は、教育の文脈における自己学習のための仮想現実（VR）と身体化 AI アバターに焦点を当てました。第一著者論文は IEEE GEM 2025 で発表され、大規模言語モデルベースのソフトウェアセキュリティに関連する共著論文は ISPEC 2025 で発表されました。"
    },
    degree: {
      en: "Master of Science - Computer Science and Engineering",
      zh: "理学硕士 - 计算机科学与工程",
      ja: "修士（理学）- コンピュータ理工学"
    },
    period: { en: "Apr 2024 - Sep 2025", zh: "2024年4月 - 2025年9月", ja: "2024年4月 - 2025年9月" },
    logo: "/images/logo-uoa.png"
  },
  {
    school: "ABK College",
    website: "https://www.abk.ac.jp/",
    location: { en: "Tokyo, Japan", zh: "日本东京", ja: "日本・東京" },
    description: {
      en: "Japanese language program completed as preparation for graduate studies in Japan. Built friendships with students from Thailand, Vietnam, Myanmar, Mongolia, India, Ukraine, and France, broadening my international perspective, while working two part-time jobs in Japan.",
      zh: "作为在日本读研究生的准备，完成了日语课程。在日本做两份兼职的同时，与来自泰国、越南、缅甸、蒙古、印度、乌克兰和法国的学生建立了友谊，拓宽了我的国际视野。",
      ja: "日本で大学院に進学する準備として、日本語プログラムを修了しました。日本で2つのアルバイトをしながら、タイ、ベトナム、ミャンマー、モンゴル、インド、ウクライナ、フランスの学生たちと友情を築き、国際的な視野を広げました。"
    },
    degree: {
      en: "Certificate of Completion - Japanese Language Program",
      zh: "结业证书 - 日语课程",
      ja: "修了証 - 日本語課程"
    },
    period: { en: "Oct 2022 - Mar 2024", zh: "2022年10月 - 2024年3月", ja: "2022年10月 - 2024年3月" },
    logo: "/images/logo-abk.png"
  },
  {
    school: { en: "Northwestern Polytechnical University", zh: "西北工业大学", ja: "西北工業大学" },
    website: "https://en.nwpu.edu.cn/",
    location: { en: "Xi'an, China", zh: "中国西安", ja: "中国・西安" },
    description:{
      en: "Completed a Bachelor’s degree under the School of Computer Science with a thesis grade of 88/100. Undergraduate thesis focused on the simulation and control of formation flight UAV systems. Actively involved in student activities as a member of the Student Organizations Council and the university’s Chinese Debate Team.",
      zh: "在计算机学院完成学士学位，毕业论文成绩为 88/100。本科论文重点研究编队飞行 UAV 系统的仿真与控制。作为学生社团联合会成员和大学中文辩论队成员，积极参与学生活动。",
      ja: "コンピュータサイエンス学院で学士号を取得し、卒業論文の成績は 88/100 でした。学部論文は、編隊飛行 UAV システムのシミュレーションと制御に焦点を当てました。学生団体連合会と大学の中国語ディベートチームのメンバーとして、学生活動に積極的に参加しました。"
    },
    degree: {
      en: "Bachelor of Engineering - Electronic Commerce",
      zh: "工学学士 - 电子商务",
      ja: "工学学士 - 電子商取引"
    },
    period: { en: "Sep 2018 - Jun 2022", zh: "2018年9月 - 2022年6月", ja: "2018年9月 - 2022年6月" },
    logo: "/images/logo-nwpu.png"
  }
];

// ============================================
// 工作/实习经历
// ============================================
export interface ExperienceItem {
  company: LocalizedString;
  website: string;
  role: LocalizedString;
  description?: LocalizedString;     // 可选：简短描述
  period: LocalizedString;
  logo?: string;            // 可选：公司 logo 路径
}

export const experience: ExperienceItem[] = [
  {
    company: { en: "ALPS ALPINE", zh: "阿尔卑斯阿尔派", ja: "アルプスアルパイン" },
    website: "https://www.alpsalpine.com/e/",
    role: { en: "Software System Engineer", zh: "软件系统工程师", ja: "ソフトウェアシステムエンジニア" },
    period: { en: "Apr 2026 – Present", zh: "2026年4月 – 至今", ja: "2026年4月 – 現在" },
    logo: "/images/logo-alps.png",
    description: {
      en: "Work on software proof-of-concept (PoC) development for international automotive projects, using IBM Rhapsody and an MBTDD development process. The work involves embedded software and LIN/CAN in-vehicle communication.",
      zh: "参与国际汽车行业相关的软件概念验证（PoC）开发。以 IBM Rhapsody 为主要开发工具，按照 MBTDD 流程推进开发工作，涉及嵌入式软件及 LIN、CAN 等车载通信技术。",
      ja: "自動車分野の国際的な開発プロジェクトで、ソフトウェアの概念実証（PoC）に携わっています。IBM Rhapsody を主な開発ツールとして、MBTDD プロセスに沿って、組込みソフトウェアや LIN・CAN などの車載通信に関わる開発業務に取り組んでいます。"
    }
  },
  {
    company: { en: "ALPS ALPINE", zh: "阿尔卑斯阿尔派", ja: "アルプスアルパイン" },
    website: "https://www.alpsalpine.com/e/",
    role: { en: "Engineer Internship", zh: "工程师实习生", ja: "エンジニアインターン" },
    period: { en: "Sep 2024", zh: "2024年9月", ja: "2024年9月" },
    logo: "/images/logo-alps.png",
    description: {
      en: "Developed a futuristic car HMI prototype using Unity. Built an autonomous driving scenario set on a U.S. highway with experimental next-generation HMI concepts. The prototype was designed for exhibition at CES 2025.",
      zh: "使用 Unity 开发了一个未来汽车 HMI 原型。构建了一个设置在美国高速公路上的自动驾驶场景，并包含实验性的下一代 HMI 概念。该原型是为 CES 2025 展示而设计的。",
      ja: "Unity を使用して、未来的な車の HMI プロトタイプを開発しました。実験的な次世代 HMI コンセプトを備えた、米国の高速道路を舞台にした自動運転シナリオを構築しました。このプロトタイプは CES 2025 での展示用に設計されました。"
    }
  },
  {
    company: { en: "University of Aizu", zh: "会津大学", ja: "会津大学" },
    website: "https://u-aizu.ac.jp/en/",
    role: { en: "Part Time - Teaching Assistant", zh: "兼职 - 助教", ja: "アルバイト - ティーチングアシスタント" },
    period: { en: "Oct 2024 – Sep 2025", zh: "2024年10月 – 2025年9月", ja: "2024年10月 – 2025年9月" },
    logo: "/images/logo-uoa.png",
    description: {
      en: "Assisted professors in supervising undergraduate students. Supported academic reports using MATLAB and Wolfram (2024), and guided VR application development using Unity (2025). Independently prepared and delivered one lecture session on VR development.",
      zh: "协助教授监督本科生。支持使用 MATLAB 和 Wolfram 的学术报告（2024），并指导使用 Unity 的 VR 应用开发（2025）。独立准备并讲授了一节关于 VR 开发的课程。",
      ja: "教授が学部生を指導する際の補助をしました。MATLAB と Wolfram を使用した学術レポートを支援し（2024）、Unity を使用した VR アプリケーション開発を指導しました（2025）。VR 開発に関する1回の講義を独自に準備し、実施しました。"
    }
  },
  {
    company: { en: "Alibaba GDT Network", zh: "阿里巴巴 GDT 网络", ja: "アリババ GDT ネットワーク" },
    website: "https://ali-home.alibaba.com/en-us/",
    role: { en: "Student Internship", zh: "学生实习", ja: "学生インターン" },
    period: { en: "Nov 2021 – Jan 2022", zh: "2021年11月 – 2022年1月", ja: "2021年11月 – 2022年1月" },
    logo: "/images/logo-gdt.png",
    description: {
      en: "Worked on technical marketing operations. Conducted target user analysis and e-commerce marketing planning using Joyoung blender products as a case study, focusing on data-driven advertising strategies.",
      zh: "从事技术营销运营工作。以九阳搅拌机产品为案例，进行了目标用户分析和电子商务营销规划，重点关注数据驱动的广告策略。",
      ja: "テクニカルマーケティングオペレーションに取り組みました。Joyoung のブレンダー製品をケーススタディとして使用し、データ駆動型の広告戦略に焦点を当てて、ターゲットユーザー分析と e コマースマーケティング計画を行いました。"
    }
  },
  {
    company: { en: "Hamazushi", zh: "滨寿司", ja: "はま寿司" },
    website: "https://www.hamazushi.com/",
    role: { en: "Part Time - Kitchen Staff", zh: "兼职 - 厨房员工", ja: "アルバイト - キッチンスタッフ" },
    period: { en: "Mar 2023 – Feb 2024", zh: "2023年3月 – 2024年2月", ja: "2023年3月 – 2024年2月" },
    logo: "/images/logo-hamazushi.png",
    description: {
      en: "Worked in the kitchen preparing sushi, including nigiri, rolls, and gunkan. Assisted with dessert preparation, cleaning, and general kitchen operations. Averaged 16 working hours per week.",
      zh: "在厨房工作，准备寿司，包括握寿司、卷寿司和军舰寿司。协助甜点准备、清洁和一般厨房运营。平均每周工作 16 小时。",
      ja: "キッチンで働き、握り、巻き、軍艦を含む寿司を準備しました。デザートの準備、清掃、一般的なキッチン業務を補助しました。平均して週16時間働きました。"
    }
  },
  {
    company: { en: "CoCo Ichibanya Curry House", zh: "CoCo壹番屋", ja: "カレーハウスCoCo壱番屋" },
    website: "https://www.ichibanya.co.jp/?lang=en",
    role: { en: "Part Time - Food Server", zh: "兼职 - 餐厅服务", ja: "アルバイト - ホールスタッフ" },
    period: { en: "Dec 2022 – Jan 2024", zh: "2022年12月 – 2024年1月", ja: "2022年12月 – 2024年1月" },
    logo: "/images/logo-coco-ichibanya.png",
    description: {
      en: "Handled food preparation support, cleaning, cashier duties, order taking, and meal serving. Responsible for opening and closing tasks, including cash handling. Averaged 10 working hours per week.",
      zh: "处理备餐支持、清洁、收银职责、点单和上餐。负责开店和闭店任务，包括现金处理。平均每周工作 10 小时。",
      ja: "調理準備のサポート、清掃、レジ業務、注文受付、食事の提供を担当しました。現金取り扱いを含む開店・閉店作業も担当しました。平均して週10時間働きました。"
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
    title: { en: "Presentation Award", zh: "Presentation Award", ja: "Presentation Award" },
    issuer: { en: "IEEE GEM 2025", zh: "IEEE GEM 2025", ja: "IEEE GEM 2025" },
    description: "",
    period: { en: "Jul 2025", zh: "2025年7月", ja: "2025年7月" },
    logo: ""
  },
  {
    title: {
      en: "Sensory Design Thinking Workshop — Team First Grade",
      zh: "Sensory Design Thinking Workshop — Team First Grade",
      ja: "Sensory Design Thinking Workshop — Team First Grade"
    },
    issuer: {
      en: "ALPS ALPINE and University of Aizu",
      zh: "阿尔卑斯阿尔派与会津大学",
      ja: "アルプスアルパイン・会津大学"
    },
    description: {
      en: "Our team received First Grade recognition at the Sensory Design Thinking Workshop. As a result, I was selected as one of four participants, from a group of more than 20, to receive an internship opportunity at ALPS ALPINE.",
      zh: "团队在 Sensory Design Thinking Workshop 中获得 First Grade 表彰；我也因此从20多名参与者中脱颖而出，成为4名获得 ALPS ALPINE 实习机会的人之一。",
      ja: "チームは Sensory Design Thinking Workshop で First Grade の評価を受け、その成果を受けて20名超の参加者のうち4名に選ばれ、ALPS ALPINE のインターンシップ機会を得ました。"
    },
    period: { en: "Aug 2024", zh: "2024年8月", ja: "2024年8月" },
    logo: ""
  },
  {
    title: {
      en: "Second Prize (School Trials) in China College Students' ·Internet+· Innovation and Entrepreneurship Competition",
      zh: "中国国际大学生“互联网+”创新创业大赛校级二等奖",
      ja: "中国国際大学生「インターネット＋」イノベーション・起業コンテスト 学内予選二等賞"
    },
    issuer: { en: "Ministry of Education, China", zh: "中国教育部", ja: "中国教育部" },
    description: "",
    period: { en: "Jan 2021", zh: "2021年1月", ja: "2021年1月" },
    logo: ""
  },
  {
    title: {
      en: "Second Prize (Provincial Trials) in China National Undergraduate ·Innovation, Creativity and Entrepreneurship· Challenge",
      zh: "中国大学生创新、创意及创业挑战赛省级二等奖",
      ja: "中国大学生イノベーション・創意・起業チャレンジ 省予選二等賞"
    },
    issuer: { en: "Ministry of Education, China", zh: "中国教育部", ja: "中国教育部" },
    description: "",
    period: { en: "Oct 2020", zh: "2020年10月", ja: "2020年10月" },
    logo: ""
  },
  {
    title: { en: "NPU President Scholarship", zh: "西北工业大学校长奖学金", ja: "西北工業大学学長奨学金" },
    issuer: { en: "Northwestern Polytechnical University", zh: "西北工业大学", ja: "西北工業大学" },
    description: {
      en: "First-Level Scholarship Winner (2018) - Exempted from tuition and accommodation fees; provided living allowance of 1,500 RMB/month for 12 months.",
      zh: "2018年一等奖：免除学费和住宿费，并连续12个月每月提供1,500元人民币生活补助。",
      ja: "2018年度一等奨学金：授業料・寮費免除に加え、12か月間、月額1,500人民元の生活費を支給。"
    },
    period: { en: "Sep 2018", zh: "2018年9月", ja: "2018年9月" },
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
  items: InterestItem[];          // 具体内容
}

export type InterestItem = LocalizedString | {
  /** Stable identity when the display title or collection role changes. */
  id?: string;
  kind?: 'work' | 'person' | 'group' | 'studio' | 'topic' | 'series';
  /** Owner-confirmed visual emphasis only; omitted means no preference boost. */
  sizeBoost?: 0 | 1 | 2 | 3;
  title: LocalizedString;
  artist?: LocalizedString;
  wikiPage?: string;
  externalUrl?: string;
  audioSrc?: string;
  previewProvider?: "itunes";
  itunesCountry?: string;
  itunesTerm?: LocalizedString;
}

export const interests: InterestCategory[] = [
  {
    name: { en: "Games", zh: "游戏", ja: "ゲーム" },
    icon: "gamepad",
    items: [
      { title: { en: "The Legend of Zelda: Breath of the Wild", zh: "塞尔达传说 旷野之息", ja: "ゼルダの伝説 ブレス オブ ザ ワイルド" }, wikiPage: "The Legend of Zelda: Breath of the Wild" },
      { title: { en: "Baldur's Gate 3", zh: "博德之门3", ja: "バルダーズ・ゲート3" }, wikiPage: "Baldur's Gate 3" },
      { title: { en: "Stardew Valley", zh: "星露谷物语", ja: "Stardew Valley" }, wikiPage: "Stardew Valley" },
      { title: { en: "Persona 5", zh: "女神异闻录5", ja: "ペルソナ5" }, wikiPage: "Persona 5" },
      { title: { en: "Crusader Kings III", zh: "十字军之王 III", ja: "クルセイダーキングス Ⅲ" }, wikiPage: "Crusader Kings III" },
      { title: { en: "Cyberpunk 2077", zh: "赛博朋克2077", ja: "サイバーパンク2077" }, wikiPage: "Cyberpunk 2077" },
      { title: { en: "Disco Elysium: The Final Cut", zh: "极乐迪斯科：最终剪辑版", ja: "ディスコ エリジウム ザ ファイナル カット" }, wikiPage: "Disco Elysium" },
      { title: { en: "Uncharted Waters: New Horizons", zh: "大航海时代II", ja: "大航海時代II" }, wikiPage: "Uncharted Waters: New Horizons" },
      { title: { en: "Resident Evil 4", zh: "生化危机4", ja: "バイオハザード4" }, wikiPage: "Resident Evil 4" },
      { id: "games-resident-evil-series", kind: "series", title: { en: "Resident Evil series", zh: "生化危机系列", ja: "バイオハザード シリーズ" }, wikiPage: "Resident Evil" },
      { id: "games-resident-evil-2-1998", title: { en: "Resident Evil 2", zh: "生化危机2", ja: "バイオハザード2" }, wikiPage: "Resident Evil 2" },
      { id: "games-resident-evil-village", title: { en: "Resident Evil Village", zh: "生化危机：村庄", ja: "バイオハザード ヴィレッジ" }, wikiPage: "Resident Evil Village" },
      { id: "games-resident-evil-requiem", title: { en: "Resident Evil Requiem", zh: "生化危机：安魂曲", ja: "バイオハザード レクイエム" }, wikiPage: "Resident Evil Requiem" },
      { id: "games-nobunagas-ambition-sphere-of-influence", title: { en: "Nobunaga's Ambition: Sphere of Influence (XIV)", zh: "信长之野望14：创造", ja: "信長の野望・創造" }, externalUrl: "https://store.steampowered.com/app/392470/" },
      { id: "games-taiko-risshiden-v", title: { en: "Taikō Risshiden V", zh: "太阁立志传V", ja: "太閤立志伝V" }, wikiPage: "Taikou Risshiden V" },
      { id: "games-assassins-creed-series", kind: "series", title: { en: "Assassin's Creed series", zh: "刺客信条系列", ja: "アサシン クリード シリーズ" }, wikiPage: "Assassin's Creed" },
      { id: "games-assassins-creed-ii", title: { en: "Assassin's Creed II", zh: "刺客信条II", ja: "アサシン クリード II" }, wikiPage: "Assassin's Creed II" },
      { id: "games-assassins-creed-brotherhood", title: { en: "Assassin's Creed: Brotherhood", zh: "刺客信条：兄弟会", ja: "アサシン クリード ブラザーフッド" }, wikiPage: "Assassin's Creed: Brotherhood" },
      { id: "games-assassins-creed-revelations", title: { en: "Assassin's Creed: Revelations", zh: "刺客信条：启示录", ja: "アサシン クリード リベレーション" }, wikiPage: "Assassin's Creed: Revelations" },
      { id: "games-yakuza-0", title: { en: "Yakuza 0", zh: "如龙0", ja: "龍が如く0 誓いの場所" }, wikiPage: "Yakuza 0" },
      { title: { en: "The Legend of Sword and Fairy 4", zh: "仙剑奇侠传四", ja: "仙剣奇侠伝四" }, wikiPage: "The Legend of Sword and Fairy 4" }
    ]
  },
  {
    name: { en: "Movies", zh: "电影", ja: "映画" },
    icon: "film",
    items: [
      { title: { en: "Coco", zh: "寻梦环游记", ja: "リメンバー・ミー" }, wikiPage: "Coco (2017 film)" },
      { title: { en: "Ratatouille", zh: "料理鼠王", ja: "レミーのおいしいレストラン" }, wikiPage: "Ratatouille (film)" },
      { id: "movies-disney", kind: "studio", title: { en: "Disney", zh: "迪士尼", ja: "ディズニー" }, wikiPage: "The Walt Disney Company" },
      { title: { en: "Flipped", zh: "怦然心动", ja: "Flipped" }, wikiPage: "Flipped (2010 film)" },
      { title: { en: "Howl's Moving Castle", zh: "哈尔的移动城堡", ja: "ハウルの動く城" }, wikiPage: "Howl's Moving Castle (film)" },
      { title: { en: "The Truman Show", zh: "楚门的世界", ja: "トゥルーマン・ショー" }, wikiPage: "The Truman Show" },
      { title: { en: "Interstellar", zh: "星际穿越", ja: "インターステラー" }, wikiPage: "Interstellar (film)" },
      { id: "movies-the-lord-of-the-rings", kind: "series", title: { en: "The Lord of the Rings series", zh: "指环王系列", ja: "ロード・オブ・ザ・リング シリーズ" }, wikiPage: "The Lord of the Rings (film series)" },
      { id: "movies-the-fellowship-of-the-ring", title: { en: "The Lord of the Rings: The Fellowship of the Ring", zh: "指环王：护戒使者", ja: "ロード・オブ・ザ・リング" }, wikiPage: "The Lord of the Rings: The Fellowship of the Ring" },
      { id: "movies-the-two-towers", title: { en: "The Lord of the Rings: The Two Towers", zh: "指环王：双塔奇兵", ja: "ロード・オブ・ザ・リング／二つの塔" }, wikiPage: "The Lord of the Rings: The Two Towers" },
      { id: "movies-the-return-of-the-king", title: { en: "The Lord of the Rings: The Return of the King", zh: "指环王：王者归来", ja: "ロード・オブ・ザ・リング／王の帰還" }, wikiPage: "The Lord of the Rings: The Return of the King" },
      { id: "movies-spider-man-2002", title: { en: "Spider-Man", zh: "蜘蛛侠", ja: "スパイダーマン" }, wikiPage: "Spider-Man (2002 film)" },
      { id: "movies-ben-hur-1959", title: { en: "Ben-Hur", zh: "宾虚", ja: "ベン・ハー" }, wikiPage: "Ben-Hur (1959 film)" },
      { title: { en: "The Reluctant Fundamentalist", zh: "拉合尔茶馆的陌生人", ja: "ミッシング・ポイント" }, wikiPage: "The Reluctant Fundamentalist (film)" },
      { title: { en: "Maharaja", zh: "因果报应", ja: "Maharaja" }, wikiPage: "Maharaja (2024 film)" },
      { id: "movies-3-idiots-2009", title: { en: "3 Idiots", zh: "三傻大闹宝莱坞", ja: "きっと、うまくいく" }, wikiPage: "3 Idiots" },
      { id: "movies-the-pursuit-of-happyness-2006", title: { en: "The Pursuit of Happyness", zh: "当幸福来敲门", ja: "幸せのちから" }, wikiPage: "The Pursuit of Happyness" },
      { id: "movies-how-to-train-your-dragon-2010", title: { en: "How to Train Your Dragon", zh: "驯龙高手", ja: "ヒックとドラゴン" }, wikiPage: "How to Train Your Dragon (2010 film)" },
      { id: "movies-project-hail-mary-2026", title: { en: "Project Hail Mary", zh: "挽救计划", ja: "プロジェクト・ヘイル・メアリー" }, wikiPage: "Project Hail Mary (film)" },
      { id: "movies-titanic-1997", title: { en: "Titanic", zh: "泰坦尼克号", ja: "タイタニック" }, wikiPage: "Titanic (1997 film)" },
      { id: "movies-a-beautiful-mind-2001", title: { en: "A Beautiful Mind", zh: "美丽心灵", ja: "ビューティフル・マインド" }, wikiPage: "A Beautiful Mind (film)" },
      { id: "movies-inception-2010", title: { en: "Inception", zh: "盗梦空间", ja: "インセプション" }, wikiPage: "Inception" },
      { id: "movies-life-of-pi-2012", title: { en: "Life of Pi", zh: "少年派的奇幻漂流", ja: "ライフ・オブ・パイ／トラと漂流した227日" }, wikiPage: "Life of Pi (film)" },
      { id: "movies-gone-with-the-wind-1939", title: { en: "Gone with the Wind", zh: "乱世佳人", ja: "風と共に去りぬ" }, wikiPage: "Gone with the Wind (film)" },
      { id: "movies-leon-the-professional-1994", title: { en: "Léon: The Professional", zh: "这个杀手不太冷", ja: "レオン" }, wikiPage: "Léon: The Professional" },
      { id: "movies-the-devil-wears-prada-2006", title: { en: "The Devil Wears Prada", zh: "穿普拉达的女王", ja: "プラダを着た悪魔" }, wikiPage: "The Devil Wears Prada (film)" },
      { id: "movies-indiana-jones-series", kind: "series", title: { en: "Indiana Jones series", zh: "夺宝奇兵系列", ja: "インディ・ジョーンズ シリーズ" }, wikiPage: "Indiana Jones" },
      { id: "movies-raiders-of-the-lost-ark-1981", title: { en: "Raiders of the Lost Ark", zh: "夺宝奇兵", ja: "レイダース／失われたアーク《聖櫃》" }, wikiPage: "Raiders of the Lost Ark" },
      { id: "movies-indiana-jones-and-the-temple-of-doom-1984", title: { en: "Indiana Jones and the Temple of Doom", zh: "夺宝奇兵：魔宫传奇", ja: "インディ・ジョーンズ／魔宮の伝説" }, wikiPage: "Indiana Jones and the Temple of Doom" },
      { id: "movies-indiana-jones-and-the-last-crusade-1989", title: { en: "Indiana Jones and the Last Crusade", zh: "夺宝奇兵：圣战奇兵", ja: "インディ・ジョーンズ／最後の聖戦" }, wikiPage: "Indiana Jones and the Last Crusade" },
      { id: "movies-indiana-jones-and-the-kingdom-of-the-crystal-skull-2008", title: { en: "Indiana Jones and the Kingdom of the Crystal Skull", zh: "夺宝奇兵：水晶头骨王国", ja: "インディ・ジョーンズ／クリスタル・スカルの王国" }, wikiPage: "Indiana Jones and the Kingdom of the Crystal Skull" },
      { id: "movies-indiana-jones-and-the-dial-of-destiny-2023", title: { en: "Indiana Jones and the Dial of Destiny", zh: "夺宝奇兵：命运转盘", ja: "インディ・ジョーンズと運命のダイヤル" }, wikiPage: "Indiana Jones and the Dial of Destiny" },
      { id: "movies-the-mummy-series", kind: "series", title: { en: "The Mummy series", zh: "木乃伊系列", ja: "ハムナプトラ シリーズ" }, wikiPage: "The Mummy (franchise)" },
      { id: "movies-the-mummy-1999", title: { en: "The Mummy", zh: "木乃伊", ja: "ハムナプトラ／失われた砂漠の都" }, wikiPage: "The Mummy (1999 film)" },
      { id: "movies-the-mummy-returns-2001", title: { en: "The Mummy Returns", zh: "木乃伊归来", ja: "ハムナプトラ2／黄金のピラミッド" }, wikiPage: "The Mummy Returns" },
      { id: "movies-the-mummy-tomb-of-the-dragon-emperor-2008", title: { en: "The Mummy: Tomb of the Dragon Emperor", zh: "木乃伊：龙帝之墓", ja: "ハムナプトラ3／呪われた皇帝の秘宝" }, wikiPage: "The Mummy: Tomb of the Dragon Emperor" },
      { id: "movies-terminator-series", kind: "series", title: { en: "Terminator series", zh: "终结者系列", ja: "ターミネーター シリーズ" }, wikiPage: "Terminator (franchise)" },
      { id: "movies-the-terminator-1984", title: { en: "The Terminator", zh: "终结者", ja: "ターミネーター" }, wikiPage: "The Terminator" },
      { id: "movies-terminator-2-judgment-day-1991", title: { en: "Terminator 2: Judgment Day", zh: "终结者2：审判日", ja: "ターミネーター2" }, wikiPage: "Terminator 2: Judgment Day" },
      { id: "movies-terminator-3-rise-of-the-machines-2003", title: { en: "Terminator 3: Rise of the Machines", zh: "终结者3：机器觉醒", ja: "ターミネーター3" }, wikiPage: "Terminator 3: Rise of the Machines" },
      { id: "movies-terminator-salvation-2009", title: { en: "Terminator Salvation", zh: "终结者：救世主", ja: "ターミネーター4" }, wikiPage: "Terminator Salvation" },
      { id: "movies-terminator-genisys-2015", title: { en: "Terminator Genisys", zh: "终结者：创世纪", ja: "ターミネーター：新起動／ジェニシス" }, wikiPage: "Terminator Genisys" },
      { id: "movies-harry-potter-series", kind: "series", title: { en: "Harry Potter series", zh: "哈利·波特系列", ja: "ハリー・ポッター シリーズ" }, wikiPage: "Harry Potter (film series)" },
      { id: "movies-harry-potter-and-the-philosophers-stone-2001", title: { en: "Harry Potter and the Philosopher's Stone", zh: "哈利·波特与魔法石", ja: "ハリー・ポッターと賢者の石" }, wikiPage: "Harry Potter and the Philosopher's Stone (film)" },
      { id: "movies-harry-potter-and-the-chamber-of-secrets-2002", title: { en: "Harry Potter and the Chamber of Secrets", zh: "哈利·波特与密室", ja: "ハリー・ポッターと秘密の部屋" }, wikiPage: "Harry Potter and the Chamber of Secrets (film)" },
      { id: "movies-harry-potter-and-the-prisoner-of-azkaban-2004", title: { en: "Harry Potter and the Prisoner of Azkaban", zh: "哈利·波特与阿兹卡班的囚徒", ja: "ハリー・ポッターとアズカバンの囚人" }, wikiPage: "Harry Potter and the Prisoner of Azkaban (film)" },
      { id: "movies-harry-potter-and-the-goblet-of-fire-2005", title: { en: "Harry Potter and the Goblet of Fire", zh: "哈利·波特与火焰杯", ja: "ハリー・ポッターと炎のゴブレット" }, wikiPage: "Harry Potter and the Goblet of Fire (film)" },
      { id: "movies-harry-potter-and-the-order-of-the-phoenix-2007", title: { en: "Harry Potter and the Order of the Phoenix", zh: "哈利·波特与凤凰社", ja: "ハリー・ポッターと不死鳥の騎士団" }, wikiPage: "Harry Potter and the Order of the Phoenix (film)" },
      { id: "movies-harry-potter-and-the-half-blood-prince-2009", title: { en: "Harry Potter and the Half-Blood Prince", zh: "哈利·波特与混血王子", ja: "ハリー・ポッターと謎のプリンス" }, wikiPage: "Harry Potter and the Half-Blood Prince (film)" },
      { id: "movies-harry-potter-and-the-deathly-hallows-part-1-2010", title: { en: "Harry Potter and the Deathly Hallows – Part 1", zh: "哈利·波特与死亡圣器（上）", ja: "ハリー・ポッターと死の秘宝 PART1" }, wikiPage: "Harry Potter and the Deathly Hallows – Part 1" },
      { id: "movies-harry-potter-and-the-deathly-hallows-part-2-2011", title: { en: "Harry Potter and the Deathly Hallows – Part 2", zh: "哈利·波特与死亡圣器（下）", ja: "ハリー・ポッターと死の秘宝 PART2" }, wikiPage: "Harry Potter and the Deathly Hallows – Part 2" }
    ]
  },
  {
    name: { en: "Drama & Anime", zh: "剧集与动画", ja: "ドラマ・アニメ" },
    icon: "layers",
    items: [
      { title: { en: "Love, Death & Robots", zh: "爱，死亡和机器人", ja: "ラブ、デス&ロボット" }, wikiPage: "Love, Death & Robots" },
      { title: { en: "Cyberpunk: Edgerunners", zh: "赛博朋克：边缘行者", ja: "サイバーパンク エッジランナーズ" }, wikiPage: "Cyberpunk: Edgerunners" },
      { title: { en: "The Queen's Gambit", zh: "后翼弃兵", ja: "クイーンズ・ギャンビット" }, wikiPage: "The Queen's Gambit (miniseries)" },
      { title: { en: "Gin Tama", zh: "银魂", ja: "銀魂" }, wikiPage: "Gin Tama" },
      { title: { en: "Doraemon", zh: "哆啦A梦", ja: "ドラえもん" }, wikiPage: "Doraemon" }
    ]
  },
  {
    name: { en: "Books", zh: "书", ja: "本" },
    icon: "book",
    items: [
      { title: { en: "Les Misérables", zh: "悲惨世界", ja: "レ・ミゼラブル" }, wikiPage: "Les Misérables" },
      { title: { en: "A Thousand Splendid Suns", zh: "灿烂千阳", ja: "千の輝く太陽" }, wikiPage: "A Thousand Splendid Suns" },
      { title: { en: "To Live", zh: "活着", ja: "活きる" }, wikiPage: "To Live (novel)" },
      { title: { en: "Tristan and Iseult", zh: "特里斯坦与伊索尔德", ja: "トリスタンとイゾルデ" }, wikiPage: "Tristan and Iseult" },
      { id: "books-kinder-und-hausmarchen", title: { en: "Grimms' Fairy Tales", zh: "格林童话", ja: "グリム童話" }, wikiPage: "Grimms' Fairy Tales" }
    ]
  },
  {
    name: { en: "Music", zh: "音乐", ja: "音楽" },
    icon: "music",
    items: [
      { title: { en: "Bohemian Rhapsody", zh: "波西米亚狂想曲", ja: "ボヘミアン・ラプソディ" }, artist: "Queen", wikiPage: "Bohemian Rhapsody", previewProvider: "itunes", itunesCountry: "JP", itunesTerm: "Bohemian Rhapsody Queen" },
      { title: { en: "We Are the Champions", zh: "我们是冠军", ja: "伝説のチャンピオン" }, artist: "Queen", wikiPage: "We Are the Champions", previewProvider: "itunes", itunesCountry: "JP", itunesTerm: "We Are the Champions Queen" },
      { id: "music-another-one-bites-the-dust", title: "Another One Bites the Dust", artist: "Queen", wikiPage: "Another One Bites the Dust", previewProvider: "itunes", itunesCountry: "JP", itunesTerm: "Another One Bites the Dust Queen" },
      { id: "music-fujii-kaze", kind: "person", title: { en: "Fujii Kaze", zh: "藤井风", ja: "藤井風" }, wikiPage: "Fujii Kaze" },
      { id: "music-matsuri", title: { en: "Matsuri", zh: "まつり", ja: "まつり" }, artist: "Fujii Kaze", wikiPage: "Matsuri (song)", previewProvider: "itunes", itunesCountry: "JP", itunesTerm: "まつり 藤井風" },
      { id: "music-kirari", title: { en: "Kirari", zh: "きらり", ja: "きらり" }, artist: "Fujii Kaze", externalUrl: "https://fujiikaze.com/music/kirari/", previewProvider: "itunes", itunesCountry: "JP", itunesTerm: "きらり 藤井風" },
      { title: "Lemon", artist: "Kenshi Yonezu", wikiPage: "Lemon (Kenshi Yonezu song)", previewProvider: "itunes", itunesCountry: "JP" }
    ]
  },
  {
    name: { en: "Foods", zh: "食物", ja: "食べ物" },
    icon: "coffee",
    items: [
      { en: "Ramen", zh: "拉面", ja: "ラーメン" },
      { en: "Sushi", zh: "寿司", ja: "寿司" },
      { en: "Hot pot", zh: "火锅", ja: "火鍋" },
      { id: "foods-jiro-ramen", kind: "topic", title: { en: "Jiro-style ramen", zh: "二郎系拉面", ja: "二郎系ラーメン" }, wikiPage: "Ramen Jiro" },
      { id: "foods-otoro", kind: "topic", title: { en: "Otoro", zh: "金枪鱼大腹", ja: "大トロ" }, wikiPage: "Toro (sushi)" },
      { id: "foods-yakiniku", kind: "topic", title: { en: "Yakiniku", zh: "烧肉", ja: "焼肉" }, wikiPage: "Yakiniku" },
      { id: "foods-wagyu", kind: "topic", title: { en: "Wagyu", zh: "和牛", ja: "和牛" }, wikiPage: "Wagyu" },
      { id: "foods-beef-tongue", kind: "topic", title: { en: "Beef tongue", zh: "牛舌", ja: "牛タン" }, wikiPage: "Beef tongue" }
    ]
  },
  {
    name: { en: "Interests Topics", zh: "感兴趣的话题", ja: "関心のあるテーマ" },
    icon: "lightbulb",
    items: [
      { en: "Analytical psychology", zh: "分析心理学", ja: "分析心理学" },
      { id: "topics-carl-jung", kind: "person", title: { en: "Carl Jung", zh: "卡尔·荣格", ja: "カール・ユング" }, wikiPage: "Carl Jung" },
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
