// About Page Data
// 编辑这个文件来更新 About 页面的所有内容

// ============================================
// 页面标题和简介
// ============================================
export const pageHeader = {
  title: "About Me",
  subtitle: "The story behind the code"
};

// 简介段落 - 支持 HTML 标签如 <span class="highlight">
export const intro = [
  `For a long time, I lived with the belief that life had no inherent meaning and that everything we know would eventually fade into nothing. 
  It drove me to <span class="highlight">live for myself</span> and to explore this world as an adventurer who seeks to experience every possibility.`,
  `Coming to Japan on my own was the moment I finally let go of my past. I found a way to heal the wounds of my childhood and rediscovered the <span class="highlight">capacity to love</span>. On that day, the questions I had been asking the world for years finally found their peace.`,
  `I no longer seek faith in things I cannot see because I have found truth in what I have lived. As Carl Jung once said: <span class="highlight">"I don't need to believe; I know."</span>`
];

// ============================================
// 右侧个人卡片
// ============================================
export const profile = {
  name: "Lai HuiShan",
  initials: "HS",           // 头像占位符显示的文字
  title: "Developer & Researcher",
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
  school: string;
  location: string;
  description?: string;  // 可选：简短描述
  degree: string;
  period: string;
  logo?: string;            // 可选：学校 logo 路径
}

export const education: EducationItem[] = [
  {
    school: "University of Aizu",
    location: "Aizu-Wakamatsu, Japan",
    description: "Graduated early with Grade A after completing all program and research requirements. Research focused on virtual reality (VR) and embodied AI avatars for self-learning in educational contexts. First-author paper published at IEEE GEM 2025, and a co-authored paper related to large language model–based software security published at ISPEC 2025.",
    degree: "Master of Science - Computer Science and Engineering",
    period: "Apr 2024 - Sep 2025",
    logo: "/images/logo-uoa.png"
  },
  {
    school: "ABK College",
    location: "Tokyo, Japan",
    description: "Japanese language program completed as preparation for graduate studies in Japan. Built friendships with students from Thailand, Vietnam, Myanmar, Mongolia, India, Ukraine, and France, broadening my international perspective, while working two part-time jobs in Japan.",
    degree: "Certificate of Completion - Japanese Language Program",
    period: "Oct 2022 - Mar 2024",
    logo: ""
  },
  {
    school: "Northwestern Polytechnical University",
    location: "Xi'an, China",
    description:"Completed a Bachelor’s degree under the School of Computer Science with a thesis grade of 88/100. Undergraduate thesis focused on the simulation and control of formation flight UAV systems. Actively involved in student activities as a member of the Student Organizations Council and the university’s Chinese Debate Team.",
    degree: "Bachelor of Engineering - Electronic Commerce",
    period: "Sep 2018 - Jun 2022",
    logo: "/images/logo-nwpu.png"
  }
];

// ============================================
// 工作/实习经历
// ============================================
export interface ExperienceItem {
  company: string;
  role: string;
  description?: string;     // 可选：简短描述
  period: string;
  logo?: string;            // 可选：公司 logo 路径
}

export const experience: ExperienceItem[] = [
  {
    company: "ALPS ALPINE",
    role: "Engineer Internship",
    description: "Developed VR car scene prototype with Unity",
    period: "2 weeks",
    logo: "/images/logo-alps.png"
  },
  {
    company: "University of Aizu",
    role: "Part Time - Teaching Assistant",
    period: "1 year",
    logo: "/images/logo-uoa.png"
  },
  {
    company: "Alibaba GDT Network",
    role: "Student Internship",
    period: "3 months",
    logo: "/images/logo-gdt.png"
  },
  {
    company: "Hamazushi",
    role: "Part Time - Kitchen Staff",
    period: "1 year",
    logo: "/images/logo-uoa.png"
  },
  {
    company: "Coco Ichibanya Curry House",
    role: "Part Time - Food Server",
    period: "1 year 2 months",
    logo: "/images/logo-uoa.png"
  }
];

// ============================================
// 奖状
// ============================================
export interface AwardsItem {
  title: string;
  issuer: string;
  description?: string;     // 可选：简短描述
  period: string;
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
];


// ============================================
// 技能
// ============================================
export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skills: SkillCategory[] = [
  {
    name: "Programming Languages",
    skills: ["C", "C#", "C++","Python", "JavaScript", "TypeScript", "Java" ,"Matlab"]
  },
  {
    name: "Tools",
    skills: ["Unity", "Git / GitHub", "Docker", "Powershell","MongoDB"]
  },
  {
    name: "Web Tech",
    skills: ["React", "Next.js", "Node.js", "Flask"]
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
  name: string;
  level: string;            // Native, Fluent, Intermediate, Basic
}

export const languages: LanguageItem[] = [
  { name: "Mandarin", level: "Native" },
  { name: "Cantonese", level: "Native" },
  { name: "Hakka", level: "Native" },
  { name: "English", level: "Fluent" },
  { name: "Japanese", level: "Intermediate" },
  { name: "Malay", level: "Intermediate" }
];

// ============================================
// 兴趣爱好 (Beyond Code)
// ============================================
export interface InterestCategory {
  name: string;             // 分类名称
  icon: string;             // 图标名称 (参考 Icon.astro)
  items: string[];          // 具体内容
}

export const interests: InterestCategory[] = [
  {
    name: "Games",
    icon: "gamepad",
    items: ["The Legend of Zelda: Breath of the Wild", "Baldur's Gate 3", "Stardew Valley","Persona 5","Crusader Kings III","Cyberpunk 2077","Disco Elysium: The Final Cut","Uncharted Waters: New Horizons","Resident Evil 4","The Legend of Sword and Fairy 4"]
  },
  {
    name: "Movies",
    icon: "film",
    items: ["Coco", "Flipped","Howl's Moving Castle","The Truman Show","Interstellar","The Lord of the Rings"]
  },
  {
    name: "Drama & Anime",
    icon: "layers",
    items: ["Love, Death & Robots","Cyberpunk: Edgerunners","The Queen's Gambit", "Gin Tama"]
  },
  {
    name: "Books",
    icon: "book",
    items: ["Les Misérables","A Thousand Splendid Suns","To Live"]
  },
  {
    name: "Music",
    icon: "music",
    items: ["Bohemian Rhapsody","We Are the Champions", "Lemon"]
  },
  {
    name: "Foods",
    icon: "coffee",
    items: ["Ramen", "Sushi","Hot pot"]
  },
  {
    name: "Hobbies",
    icon: "sparkle",
    items: ["Traveling", "Reading","Gaming","Board gaming"]
  },
  {
    name: "Interests Topics",
    icon: "lightbulb",
    items: ["Analytical psychology", "Existentialism","Cosmology","Socionics"]
  }
  // 添加更多分类：
  // {
  //   name: "Others",
  //   icon: "star",
  //   items: ["..."]
  // }
];
