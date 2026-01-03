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
  `Hi! Nice to meet you. I'm originally from the vibrant city of 
   <span class="highlight">Sandakan, Sabah in Malaysia</span> — home to the 
   enchanting Rafflesia flowers, intriguing proboscis monkeys, and majestic orangutans.`,
  `Now, I'm immersing myself in the world of Computer and Information Systems 
   as a <span class="highlight">Master's student at University of Aizu</span> in Japan.`
];

// ============================================
// 右侧个人卡片
// ============================================
export const profile = {
  name: "Lai HuiShan",
  initials: "HS",           // 头像占位符显示的文字
  title: "Game Developer & Researcher",
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
  degree: string;
  period: string;
  logo?: string;            // 可选：学校 logo 路径
}

export const education: EducationItem[] = [
  {
    school: "University of Aizu",
    location: "Aizu-Wakamatsu, Japan",
    degree: "Master's in Computer and Information Systems",
    period: "2024 - Present",
    logo: "/images/logo-uoa.png"
  },
  {
    school: "Northwestern Polytechnical University",
    location: "Xi'an, China",
    degree: "Bachelor's in E-Commerce Engineering",
    period: "2019 - 2023",
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
    company: "Alibaba GDT Network",
    role: "Student Internship",
    period: "3 months",
    logo: "/images/logo-gdt.png"
  },
  {
    company: "University of Aizu",
    role: "Teaching Assistant - MATLAB",
    period: "5 months",
    logo: "/images/logo-uoa.png"
  }
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
    name: "Languages",
    skills: ["C#", "Python", "JavaScript", "TypeScript", "Java"]
  },
  {
    name: "Game Development",
    skills: ["Unity", "VR/XR", "Meta Quest"]
  },
  {
    name: "Web & Tools",
    skills: ["Git", "React", "Node.js", "MATLAB"]
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
  { name: "Chinese (Mandarin)", level: "Native" },
  { name: "English", level: "Fluent" },
  { name: "Japanese", level: "Intermediate" },
  { name: "Malay", level: "Native" }
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
    items: ["The Legend of Zelda: Breath of the Wild", "Baldur's Gate 3", "Stardew Valley"]
  },
  {
    name: "Movies",
    icon: "film",
    items: ["Coco", "Flipped","Howl's Moving Castle","The Truman Show","Interstellar"]
  },
  {
    name: "Drama & Anime",
    icon: "layers",
    items: ["Love, Death & Robots","Cyberpunk: Edgerunners","The Queen's Gambit", "Gin Tama"]
  },
  {
    name: "Books",
    icon: "book",
    items: ["A Thousand Splendid Suns"]
  },
  {
    name: "Music",
    icon: "music",
    items: ["Bohemian Rhapsody", "Lemon"]
  },
  {
    name: "Foods",
    icon: "coffee",
    items: ["Ramen", "Sushi"]
  },
  {
    name: "Hobbies",
    icon: "sparkle",
    items: ["Traveling", "Reading"]
  },
  {
    name: "Interests",
    icon: "lightbulb",
    items: ["Analytical psychology", "Existentialism","Cosmology"]
  }
  // 添加更多分类：
  // {
  //   name: "Others",
  //   icon: "star",
  //   items: ["..."]
  // }
];
