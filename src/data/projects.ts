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
                description: "Unity VR car-scene prototype built during my ALPS ALPINE internship for Meta Quest testing.",
                featured: true,
                tags: ["Unity", "VR", "Meta Quest"]
            },
            {
                title: "AR Image tracking",
                description: "Unity AR image-tracking practice project that places and controls 3D dragon assets in an AR scene.",
                github: "https://github.com/huiishan99/unity-ar-image-tracking",
                tags: ["Unity", "C#", "AR Foundation"]
            },
            {
                title: "Mamba Project",
                description: "University of Aizu CFS03 Unity VR project using an Oculus/XR scene and human anatomy model assets.",
                github: "https://github.com/huiishan99/uoa-cfs03-manba-project",
                tags: ["Unity", "C#", "VR", "Oculus"]
            },
            {
                title: "Master Project",
                description: "Unity VR classroom research prototype with an embodied avatar, speech services, and a Python backend.",
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                tags: ["Unity", "C#", "Python", "VR"]
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
                description: "Unity practice scene simulating the rotation and revolution of the Sun, Earth, and Moon.",
                github: "https://github.com/huiishan99/unity-solar-system",
                tags: ["Unity", "C#", "3D"]
            },
            {
                title: "2D Platformer",
                description: "Unity 2D platformer practice project; the repository is not currently public.",
                github: "",
                tags: ["Unity", "C#", "2D"]
            },
            {
                title: "2D Shooter Game",
                description: "Unity 2D spaceship shooter with enemies, projectiles, level scenes, score UI, and menu flow.",
                github: "https://github.com/huiishan99/unity-2d-shooter-game",
                website: "https://huiishan99.itch.io/2d-shooter",
                tags: ["Unity", "C#", "2D", "Game UI"]
            },
            {
                title: "Kitchen Chaos",
                description: "Overcooked-style Unity cooking practice project with counters, ingredients, cutting recipes, and player input.",
                github: "https://github.com/huiishan99/unity-kitchen-chaos",
                tags: ["Unity", "C#", "Input System"]
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
                description: "My personal portfolio and blog built with Astro, MDX, custom styling, sitemap, and project data tooling.",
                github: "https://github.com/huiishan99/web-blog",
                website: "https://shan-verse.com",
                tags: ["Astro", "MDX", "TypeScript", "CSS"]
            },
            {
                title: "Notion Next Chinese Blog",
                description: "Forked NotionNext deployment for a Notion-powered blog using Next.js and the Notion API.",
                github: "https://github.com/huiishan99/web-notion-next",
                website: "https://notion-next-huiishan99.vercel.app/",
                tags: ["Next.js", "Notion API", "JavaScript"]
            },
            {
                title: "Math-Note",
                description: "AI math canvas app with a React/Vite frontend and FastAPI backend that sends drawn equations to Gemini.",
                github: "https://github.com/huiishan99/web-math-note",
                website: "https://math-notes-clone.vercel.app/",
                tags: ["React", "Vite", "TypeScript", "FastAPI", "Gemini"]
            },
            {
                title: "Yumemi Test",
                description: "Yumemi frontend test SPA that visualizes Japanese prefecture population trends with charts and filters.",
                github: "https://github.com/huiishan99/web-yumemi-test",
                website: "https://web-yumemi-test.vercel.app/",
                tags: ["React", "Vite", "TypeScript", "Highcharts", "Vitest"]
            },
            {
                title: "Weather App",
                description: "Static weather lookup app using OpenWeather data, city search, and weather-specific UI illustrations.",
                github: "https://github.com/huiishan99/web-weather-app",
                website: "https://js-weather-app-nine-wine.vercel.app",
                tags: ["HTML", "CSS", "JavaScript", "OpenWeather API"]
            },
            {
                title: "Falling Sand",
                description: "Interactive falling-sand sandbox with p5-style rendering, material rules, draggable controls, and pause/step tools.",
                github: "https://github.com/huiishan99/web-falling-sand",
                website: "https://huiishan99.github.io/web-falling-sand/",
                tags: ["JavaScript", "p5.js", "Vite"]
            },
            {
                title: "Dark Light Toggle",
                description: "Small HTML, CSS, and JavaScript UI experiment for an animated dark/light mode toggle.",
                github: "https://github.com/huiishan99/web-dark-light-toggle",
                website: "https://huiishan99.github.io/web-dark-light-toggle/",
                tags: ["HTML", "CSS", "JavaScript"]
            },
            {
                title: "DreamLight",
                description: "Static promotional site for a BitSummit 2024 light-show and drone game concept.",
                github: "https://github.com/huiishan99/web-dreamlight",
                website: "https://web-dreamlight.vercel.app/",
                tags: ["HTML", "SCSS", "JavaScript"]
            },
            {
                title: "Hexo Page",
                description: "Hexo blog deployment experiment on Vercel for testing static blog generation and theme structure.",
                github: "",
                website: "https://hexo-six-green.vercel.app/",
                tags: ["Hexo", "JavaScript"]
            },
            {
                title: "Notion Resume",
                description: "Minimal Notion-based personal page and resume hub linking to my public Notion home.",
                github: "https://github.com/huiishan99/web-notion-resume",
                website: "",
                tags: ["Notion", "CV"]
            },
            {
                title: "Silver Game",
                description: "Hackathon frontend for an elderly-focused social platform with realtime multimodal emotion analysis.",
                github: "https://github.com/huiishan99/web-ai-in-action-frontend",
                website: "https://web-ai-in-action-frontend.vercel.app",
                tags: ["Next.js", "React", "TypeScript", "FastAPI", "PyTorch"]
            },
            {
                title: "AI-ImageForge",
                description: "Streamlit AI image-generation app with Hugging Face models, style prompts, and GPU detection.",
                github: "https://github.com/huiishan99/web-genAI",
                tags: ["Python", "Streamlit", "Hugging Face", "Diffusers"]
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
                description: "Unity 2022.3 master's thesis project with VR classroom scenes, Convai avatar components, speech services, and a Python backend.",
                featured: true,
                github: "https://github.com/huiishan99/uoa-master-research-unity",
                tags: ["Master's Thesis", "Unity", "C#", "Python", "VR"]
            },
            {
                title: "Human Activity Pattern Processing",
                description: "University of Aizu ITA09 coursework with Python scripts and Jupyter notebooks for activity-pattern processing.",
                github: "https://github.com/huiishan99/uoa-human-activity-pattern-processing",
                tags: ["Python", "Jupyter Notebook", "Machine Learning"]
            },
            {
                title: "Advanced Robotics",
                description: "University of Aizu ITC03A Advanced Robotics coursework implemented mainly with MATLAB scripts.",
                github: "https://github.com/huiishan99/uoa-advanced-robotics",
                tags: ["MATLAB", "Robotics"]
            },
            {
                title: "Biosignal Processing and Data Mining",
                description: "University of Aizu ITA25 coursework with MATLAB assignments for biosignal processing and data mining.",
                github: "https://github.com/huiishan99/uoa-biosignal-processing-and-data-mining",
                tags: ["MATLAB", "Biosignal Processing", "Data Mining"]
            },
            {
                title: "Applied Statistics",
                description: "University of Aizu CSC03F applied statistics coursework notes and assignment records.",
                github: "https://github.com/huiishan99/uoa-applied-statistics",
                tags: ["Statistics", "Coursework"]
            },
            {
                title: "Software Engineering",
                description: "University of Aizu SEC01F software engineering coursework notes and assignment records.",
                github: "https://github.com/huiishan99/uoa-software-engineering",
                tags: ["Software Engineering", "Coursework"]
            },
            {
                title: "NWPU Undergraduate Thesis",
                description: "Undergraduate thesis records for a quadrotor UAV formation digital-twin system using AirSim/PX4 references.",
                github: "https://github.com/huiishan99/nwpu-undergraduate-thesis",
                tags: ["Digital Twin", "UAV", "AirSim", "PX4"]
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
                description: "Native Windows C++ Tetris clone with scoring, hold piece, ghost preview, levels, and best-score tracking.",
                github: "https://github.com/huiishan99/cpp-tetris-game",
                tags: ["C++", "Win32", "Game Dev"]
            },
            {
                title: "OpenGL Practice",
                description: "OpenGL learning project covering windows, triangles, buffers, shaders, textures, and basic 3D rendering.",
                github: "https://github.com/huiishan99/opengl-vector-graphic",
                tags: ["C++", "OpenGL", "GLFW"]
            },
            {
                title: "C# Exercises",
                description: "Collection of C#/.NET practice projects, including console, WPF, MVC, and Azure-style samples.",
                github: "https://github.com/huiishan99/csharp-exercises",
                tags: ["C#", ".NET", "WPF"]
            },
            {
                title: "C# Snake Game",
                description: "Classic Windows C# Snake game with keyboard controls and a simple desktop executable.",
                github: "https://github.com/huiishan99/csharp-snake-game",
                tags: ["C#", ".NET Framework", "WinForms"]
            },
            {
                title: "Beecrowd Practice",
                description: "C# solutions archive for Beecrowd online judge problems, organized by problem number.",
                github: "https://github.com/huiishan99/oj-beecrowd",
                tags: ["C#", ".NET", "OJ"]
            },
            {
                title: "PTA Practice",
                description: "PTA online judge practice record; the repository is not currently public.",
                github: "",
                tags: ["C#", "OJ"]
            },
            {
                title: "Paiza Practice",
                description: "Paiza online judge practice record; the repository is not currently public.",
                github: "",
                tags: ["C#", "OJ"]
            },
            {
                title: "Rockfall Game",
                description: "Pygame avoidance game with data collection, Random Forest training, and AI-controlled play mode.",
                github: "https://github.com/huiishan99/python-rockfall-game",
                tags: ["Python", "Pygame", "scikit-learn"]
            },
            {
                title: "Go 11 Projects",
                description: "Go learning repo following a project-based course, including a web server, CRUD API, MySQL app, and Slack bots.",
                github: "https://github.com/huiishan99/go-11-projects",
                tags: ["Go", "API", "MySQL", "Slack Bot"]
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
