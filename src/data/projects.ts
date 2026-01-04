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
                tags: ["Unity", "VR"]
            },
            {
                title: "AR Image tracking",
                description: "",
                tags: ["Unity", "AR"]
            },
            {
                title: "Master Project",
                description: "",
                tags: ["Unity", "VR"]
            },
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
            },
            {
                title: "Notion Next Chinese Blog",
                description: "My other personal website.",
                github: "https://github.com/huiishan99/web-notion-next",
                website: "https://notion-next-huiishan99.vercel.app/",
                tags: ["NotionNext", "Notion"]
            },
            {
                title: "Math-Note",
                description: "",
                github: "https://github.com/huiishan99/web-math-note",
                website: "https://math-notes-clone.vercel.app/",
                tags: ["Vite", "React", "TypeScript"]
            },
            {
                title: "Yumemi Test",
                description: "",
                github: "https://github.com/huiishan99/web-yumemi-test",
                website: "https://web-yumemi-test.vercel.app/",
                tags: ["TypeScript"]
            },
            {
                title: "Falling Sand",
                description: "",
                github: "https://github.com/huiishan99/web-falling-sand",
                website: "https://huiishan99.github.io/web-falling-sand/",
                tags: ["JavaScript"]
            },
            {
                title: "Dark Light Toggle",
                description: "",
                github: "https://github.com/huiishan99/web-dark-light-toggle",
                website: "https://huiishan99.github.io/web-dark-light-toggle/",
                tags: ["JavaScript"]
            },
            {
                title: "DreamLight",
                description: "",
                github: "https://github.com/huiishan99/web-dreamlight",
                website: "https://web-dreamlight.vercel.app/",
                tags: ["HTML", "CSS"]
            }
        ]
    },
    {
        id: "publications",
        title: "Publications",
        icon: "publication",
        items: [
            {
                title: "VR Math Bridge: Bridging Interactivity in Online Education with AI and VR",
                description: "We present VR Math Bridge, a virtual reality (VR)-based application designed to enhance calculus education by combining immersive virtual environments with artificial intelligence (AI)-driven teaching assistance. VR Math Bridge creates a virtual classroom where students interact with Khan Academy videos and a 3D AI assistant that provides real-time, personalized feedback to their questions. This system leverages a floating panel for chapter selection, a virtual blackboard for video playback, and Cognitive 3D for analyzing user engagement. To demonstrate the system’s capabilities, we developed a prototype on Quest 3, focusing on derivatives as the initial test topic. We conducted a preliminary subjective evaluation (n=2) of the prototype to collect early insights for future user study evaluation.",
                featured: true,
                website: "https://doi.org/10.1109/GEM66882.2025.11155841",
                tags: ["AI-driven Education", "VR", "Embodied Agent","IEEE GEM 2025"]
            },
            {
                title: "Assessing the Security of Vibe Coding: Baseline vs. Security-Oriented Prompts in LLM Code Generation",
                description: "Large Language Models (LLMs) are increasingly used in software development through so-called “vibe coding,” where developers specify tasks in natural language and rely on the model to produce executable code. While this paradigm lowers barriers to entry and accelerates prototyping, it raises concerns about security. Prior studies show that a substantial fraction of AI-generated code contains exploitable vulnerabilities, and functional correctness does not guarantee safety. This paper investigates whether security-oriented prompting improves the security of LLM-generated code. We design ten representative Python tasks inspired by OWASP Top 10 and CWE categories, and evaluate outputs from an open-source 20B-parameter model using static analysis (Bandit) and lightweight runtime probes.",
                website: "",
                tags: ["Large Language Models","Vibe coding","Software security","ISPEC 2025"]
            },
            {
                title: "The Role of Embodied Avatars and Generative AI in Self Learning VR Classroom",
                description: "",
                tags: ["Master's thesis"]
            }
        ]
    },
    {
        id: "school",
        title: "School Project",
        icon: "graduation",
        items: [
            {
                title: "Human Activity Pattern Processing",
                description: "This repo contains the assignments for the University of Aizu's (ITA09) Human Activity Pattern Processing course.",
                github: "https://github.com/huiishan99/uoa-human-activity-pattern-processing",
                tags: ["Python"]
            }
        ]
    },
    {
        id: "other",
        title: "Other Project",
        icon: "menu",
        items: [
            {
                title: "Tetris Clone",
                description: "A tetris-clone game build with raylib-cpp.",
                github: "https://github.com/huiishan99/cpp-tetris-game",
                tags: ["tetris"]
            },
            {
                title: "OpenGL Practice",
                description: "OpenGL project.",
                github: "https://github.com/huiishan99/opengl-vector-graphic",
                tags: ["OpenGL"]
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
