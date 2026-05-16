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
                description: "First Unity AR Foundation prototype for detecting reference images and placing interactive 3D content in an augmented reality scene.",
                github: "https://github.com/huiishan99/unity-ar-image-tracking",
                tags: ["Unity", "AR"]
            },
            {
                title: "Mamba Project",
                description: "Unity VR project for the University of Aizu CFS03 Creative Factor Seminar, built around an Oculus/XR scene and human anatomy model assets.",
                github: "https://github.com/huiishan99/uoa-cfs03-manba-project",
                tags: ["Unity", "VR"]
            },
            {
                title: "Master Project",
                description: "Unity VR prototype connected to my master's research workflow, focused on experimenting with immersive learning interactions.",
                tags: ["Unity", "VR"]
            },
        ]
    },
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
                github: "",
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
                description: "Full-stack AI math note prototype with a React/Vite frontend and FastAPI backend that analyzes handwritten or drawn math images with Gemini.",
                github: "https://github.com/huiishan99/web-math-note",
                website: "https://math-notes-clone.vercel.app/",
                tags: ["Vite", "React", "TypeScript"]
            },
            {
                title: "Yumemi Test",
                description: "React + Vite SPA for the Yumemi frontend coding test, visualizing Japanese prefecture population trends with Highcharts, API data, theme switching, and tests.",
                github: "https://github.com/huiishan99/web-yumemi-test",
                website: "https://web-yumemi-test.vercel.app/",
                tags: ["TypeScript"]
            },
            {
                title: "Falling Sand",
                description: "Interactive falling-sand sandbox built with p5.js and Vite, featuring modular material simulation, draggable controls, pause/step tools, tests, and GitHub Pages deployment.",
                github: "https://github.com/huiishan99/web-falling-sand",
                website: "https://huiishan99.github.io/web-falling-sand/",
                tags: ["JavaScript"]
            },
            {
                title: "Dark Light Toggle",
                description: "Small HTML, CSS, and JavaScript UI experiment implementing a dark/light mode toggle with a custom animated switch.",
                github: "https://github.com/huiishan99/web-dark-light-toggle",
                website: "https://huiishan99.github.io/web-dark-light-toggle/",
                tags: ["JavaScript"]
            },
            {
                title: "DreamLight",
                description: "Static promotional site for a BitSummit 2024 light-show and drone game concept, presenting the project idea, team, and contact information.",
                github: "https://github.com/huiishan99/web-dreamlight",
                website: "https://web-dreamlight.vercel.app/",
                tags: ["HTML", "CSS"]
            },
            {
                title: "Hexo Page",
                description: "Default Hexo 5 blog deployment experiment on Vercel, used to test static blog generation, archives, RSS, and theme structure.",
                github: "",
                website: "https://hexo-six-green.vercel.app/",
                tags: ["Hexo", "JavaScript"]
            },
            {
                title: "Notion Resume",
                description: "Minimal Notion-based personal page and resume hub for organizing thoughts, projects, and resources.",
                github: "https://github.com/huiishan99/web-notion-resume",
                website: "",
                tags: ["Notion", "CV"]
            }
        ]
    },
    {
        id: "school",
        title: "School Project",
        icon: "graduation",
        items: [
            {
                title: "The Role of Embodied Avatars and Generative AI in Self Learning VR Classroom",
                description: "The unity project of my master's thesis at University of Aizu, including the python backend code.",
                featured: true,
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                tags: ["Master's Thesis", "Unity", "C#", "Python"]
            },
            {
                title: "Human Activity Pattern Processing",
                description: "This repo contains the assignments for the University of Aizu's (ITA09) Human Activity Pattern Processing course.",
                github: "https://github.com/huiishan99/uoa-human-activity-pattern-processing",
                tags: ["Python", "Machine Learning"]
            },
            {
                title: "Advanced Robotics",
                description: "This repo contains the assignments for the University of Aizu's (ITC03A) Advanced Robotics course.",
                github: "https://github.com/huiishan99/uoa-advanced-robotics",
                tags: ["MATLAB", "Robotics"]
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
            },
            {
                title: "C# Exercises",
                description: "C# project.",
                github: "https://github.com/huiishan99/csharp-exercises",
                tags: ["C#"]
            },
            {
                title: "C# Snake Game",
                description: "C# project.",
                github: "https://github.com/huiishan99/csharp-snake-game",
                tags: ["C#"]
            },
            {
                title: "Beecrowd Practice",
                description: "OJ project.",
                github: "https://github.com/huiishan99/oj-beecrowd",
                tags: ["C#"]
            },
            {
                title: "PTA Practice",
                description: "OJ project.",
                github: "",
                tags: ["C#"]
            },
            {
                title: "Paiza Practice",
                description: "OJ project.",
                github: "",
                tags: ["C#"]
            },
            {
                title: "Rockfall Game",
                description: "Python project.",
                github: "https://github.com/huiishan99/python-rockfall-game",
                tags: ["Python"]
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
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                website: "https://doi.org/10.1109/GEM66882.2025.11155841",
                tags: ["AI-driven Education", "Virtual Reality", "Embodied Avatar","IEEE GEM 2025"]
            },
            {
                title: "Assessing the Security of Vibe Coding: Baseline vs. Security-Oriented Prompts in LLM Code Generation",
                description: "Large Language Models (LLMs) are increasingly used in software development through so-called “vibe coding,” where developers specify tasks in natural language and rely on the model to produce executable code. While this paradigm lowers barriers to entry and accelerates prototyping, it raises concerns about security. Prior studies show that a substantial fraction of AI-generated code contains exploitable vulnerabilities, and functional correctness does not guarantee safety. This paper investigates whether security-oriented prompting improves the security of LLM-generated code. We design ten representative Python tasks inspired by OWASP Top 10 and CWE categories, and evaluate outputs from an open-source 20B-parameter model using static analysis (Bandit) and lightweight runtime probes.",
                github: "https://github.com/huiishan99/vibe-sec-experiment",
                website: "",
                tags: ["Large Language Models","Software Security","Vibe Coding","ISPEC 2025"]
            },
            {
                title: "Enhancing VR Mandala Drawing and Natural Immersion for Attention Restoration with AI-Driven Bioadaptive Multimodal Interaction",
                description: "Digital attention fatigue is a pervasive challenge, yet most virtual reality (VR) interventions for restoration rely on passive nature exposure that lacks responsiveness to the user's internal state. Integrating Attention Restoration Theory (ART) with physiological computing, we propose a bioadaptive VR system that combines active mandala drawing within a 360° nature scene, using real-time heart rate variability (HRV) to modulate visual fog, ambient music, and haptic feedback. In a within-subject pilot study (N=11), we compared an AI-driven bioadaptive multimodal condition (AI) against an otherwise identical VR condition without bioadaptive multimodal feedback (NF), using behavioral (Oddball task), neural (EEG), autonomic (HRV), and subjective measures.",
                website: "",
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
