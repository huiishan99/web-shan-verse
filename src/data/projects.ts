// Projects & Publications Data
// 以后添加新项目只需编辑这个文件

export interface ProjectItem {
  title: string;
  description: string;
  tags?: string[];
  // 可选字段
  github?: string;        // GitHub 链接
  website?: string;       // 网站/演示链接
  image?: string;         // 预览图路径 (放在 public/images/projects/)
  featured?: boolean;     // 是否为精选项目
}

export interface ProjectCategory {
  id: string;             // 用于 HTML id 锚点
  title: string;          // 显示的标题
  icon: string;           // 图标名称: 'gamepad' | 'vr' | 'globe' | 'file' | 'gear'
  items: ProjectItem[];
}

export const projectCategories: ProjectCategory[] = [
  {
    id: "unity",
    title: "Unity Projects",
    icon: "gamepad",
    items: [
      {
        title: "Solar System",
        description: "Interactive 3D solar system simulation with realistic planetary orbits and physics.",
        github: "https://github.com/huiishan99/unity-solar-system",
        tags: ["Unity", "C#", "3D", "Physics"]
      },
      {
        title: "2D Platformer",
        description: "Classic side-scrolling platformer with smooth controls and level progression.",
        github: "https://github.com/huiishan99/unity-2d-platformer",
        tags: ["Unity", "C#", "2D", "Game Dev"]
      },
      {
        title: "2D Shooter Game",
        description: "Fast-paced 2D shooter with enemy AI and power-up systems.",
        github: "https://github.com/huiishan99/unity-2d-shooter-game",
        tags: ["Unity", "C#", "AI"]
      },
      {
        title: "Kitchen Chaos",
        description: "Cooking simulation game with time management and order fulfillment mechanics.",
        github: "https://github.com/huiishan99/unity-kitchen-chaos",
        tags: ["Unity", "C#", "Simulation"]
      }
    ]
  },
  {
    id: "vr",
    title: "VR/XR Projects",
    icon: "vr",
    items: [
      {
        title: "VR Car Scene Prototype",
        description: "VR car scene prototype developed during ALPS ALPINE internship using Unity and Meta Quest.",
        featured: true,
        tags: ["Unity", "VR", "Meta Quest"]
      }
    ]
  },
  {
    id: "web",
    title: "Web Projects",
    icon: "globe",
    items: [
      {
        title: "SHAN-VERSE",
        description: "This personal website - built with Astro, featuring a unique steampunk aesthetic.",
        github: "https://github.com/huiishan99/web-blog",
        website: "https://shan-verse.com",
        tags: ["Astro", "TypeScript", "CSS"]
      }
    ]
  },
  {
    id: "publications",
    title: "Publications",
    icon: "publication",
    items: [
      {
        title: "Your Paper Title Here",
        description: "Add your publication abstract or description here.",
        website: "https://doi.org/xxx",
        tags: ["Research", "2024"]
      }
    ]
  }
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
