// Timeline Data - 以后添加新事件只需编辑这个文件
// 按年份倒序排列，每年的事件按月份倒序排列

export interface TimelineEvent {
  month: string;
  title: string;
  description: string;
}

export interface TimelineYear {
  year: number;
  events: TimelineEvent[];
}

export const timelineData: TimelineYear[] = [
  {
    year: 2026,
    events: [
      {
        month: "January",
        title: "Driving School Intensive Camp Completion",
        description: "Completed a two-week intensive driving school camp at Chuetsu Driving School and successfully obtained the provisional driving license."
      },
      {
        month: "January",
        title: "AHs 2026 Paper Acceptance",
        description: "A research paper was accepted by Augmented Humans 2026, with me as the second author."
      }
    ]
  },
  {
    year: 2025,
    events: [
      {
        month: "December",
        title: "Return to Japan after Travel",
        description: "Returned to Japan via Osaka after completing long-term travel and finally arrived back in Aizuwakamatsu."
      }
      ,
      {
        month: "October",
        title: "Extended China Travel",
        description: "Traveled in China for over one month with my partner, visiting Tianjin, Beijing, Harbin, Shuangyashan, Qingdao, Hong Kong, Shenzhen, Guangzhou, Foshan, Zhuhai, Macau, and Shanghai."
      }
      ,
      {
        month: "October",
        title: "Alps Alpine Official Job Offer",
        description: "Participated in the Alps Alpine job-offer holders meeting and received the official employment offer."
      }
      ,
      {
        month: "September",
        title: "Early Graduation from The University of Aizu",
        description: "Graduated six months earlier than scheduled after completing all coursework and meeting the graduation requirements through external paper publications."
      }
      ,
      {
        month: "September",
        title: "ISPEC 2025 Full Paper Acceptance",
        description: "A full paper was accepted by ISPEC 2025, with me as the second author."
      }
      ,
      {
        month: "August",
        title: "Master's Thesis Presentation and Recognition",
        description: "The master's thesis received positive evaluations from other professors. Prof. Watanobe described it as excellent, and Prof. Pyshkin stated that the thesis was equivalent to doctoral-level work."
      }
      ,
      {
        month: "July",
        title: "IEEE GEM 2025 Conference Participation",
        description: "Attended IEEE GEM 2025 conference in Kaohsiung, Taiwan."
      },
      {
        month: "May",
        title: "IEEE GEM Full Paper Acceptance",
        description: "A full paper was accepted by IEEE GEM 2025, with me as the first author."
      },
      {
        month: "January",
        title: "Alps Alpine Informal Job Offer",
        description: "Received an informal (verbal) job offer from Alps Alpine Corporation."
      }

    ]
  },
  {
    year: 2024,
    events: [
      {
        month: "October",
        title: "JPHACKS Hackathon Participation",
        description: "Participated in the JPHACKS hackathon at the Sendai venue, where our team project received the third-highest number of votes at the venue."
      },
      {
        month: "September",
        title: "Alps Alpine Corporation Internship",
        description: "Participated in a two weeks internship at Alps Alpine Corporation. During this period, mainly developed a VR car scene prototype with Unity."
      },
      {
        month: "August",
        title: "Alps Alpine Workshop",
        description: "Participated in a workshop organized by Alps Alpine Corporation under the recommendation of the supervisor, where the group won first grade and I received an internship opportunity."
      },
      {
        month: "April",
        title: "University of Aizu Enrollment",
        description: "Enrolled in The University of Aizu. Pursuing a master's degree in Graduate Department of Computer and Information Systems. The university is part of Top Global University Project in Japan."
      },
      {
        month: "March",
        title: "ABK College Graduation and Relocation",
        description: "Graduated from ABK College. Moved to Aizuwakamatsu, a city in Fukushima."
      },
      {
        month: "February",
        title: "Hamazushi Job End",
        description: "Ended the part-time job at Hamasushi."
      },
      {
        month: "January",
        title: "CoCo ICHIBANYA Job End",
        description: "Ended the part-time job at Curry House CoCo ICHIBANYA."
      }
    ]
  },
  {
    year: 2023,
    events: [
      {
        month: "March",
        title: "Hamazushi Part-time Job",
        description: "Started the second part-time job at Hamazushi."
      }
    ]
  },
  {
    year: 2022,
    events: [
      {
        month: "December",
        title: "CoCo ICHIBANYA Part-time Job",
        description: "Started a part-time job at Curry House CoCo ICHIBANYA."
      },
      {
        month: "October",
        title: "Arrival in Japan",
        description: "Arrived in Tokyo, Japan. Enrolled in ABK College. A Japanese Language School in Tokyo, in order to learn Japanese."
      },
      {
        month: "June",
        title: "Northwestern Polytechnical University Graduation",
        description: "Graduated from Northwestern Polytechnical University with bachelor degree in engineering. Began studying basic Japanese at Mikasano Academic Centre in preparation for studying in Japan."
      },
      {
        month: "January",
        title: "UEA Internship Completion",
        description: "Completed the internship in University Enterprises Alliance (UEA) internship programme."
      }
    ]
  },
  {
    year: 2021,
    events: [
      {
        month: "November",
        title: "UEA Internship Program",
        description: "Started the internship in University Enterprises Alliance (UEA) internship programme. Co-developed by China Campus Network and Alibaba GDT Team."
      }
    ]
  },
  {
    year: 2020,
    events: [
      {
        month: "August",
        title: "Competition Awards",
        description: "Won the provincial second prize of China National College Student Innovation, Originality and Entrepreneurship Challenge. Won the school second prize of China International College Student Internet+ Innovation and Entrepreneurship Competition."
      },
      {
        month: "July",
        title: "A-Project Team Formation",
        description: "Formed a team with friends which call A-Project. Started a project called ACGN Project. Mainly engaged in ACG self-media content production."
      }
    ]
  },
  {
    year: 2018,
    events: [
      {
        month: "October",
        title: "University Activities",
        description: "Become a member of the NPU Students Association Union in Northwestern Polytechnical University. Become a member of the school chinese debate team in Northwestern Polytechnical University."
      },
      {
        month: "September",
        title: "Northwestern Polytechnical University Enrollment",
        description: "Enrolled in Northwestern Polytechnical University. Majoring in E-commerce in the School of Computer Science. The university is part of Project 985, Project 211, and the Double First-Class Construction in China. Won the first level scholarship of the NPU President Scholarship included tuition fee, accommodation fee, and living allowances."
      },
      {
        month: "August",
        title: "IFP Graduation",
        description: "Graduated from the International Foundation Program (IFP) of Northwestern Polytechnical University with an average score of over 90 points (full score is 100)."
      },
      {
        month: "March",
        title: "Arrival in Xian and IFP Enrollment",
        description: "Arrived in Xian, the capital of Shaanxi Province in China. Began studying in the International Foundation Programme (IFP) in Northwestern Polytechnical University."
      }
    ]
  },
  {
    year: 2017,
    events: [
      {
        month: "December",
        title: "Beaufort Middle School Graduation",
        description: "Graduated from Beaufort Middle School."
      }
    ]
  },
  {
    year: 2015,
    events: [
      {
        month: "June",
        title: "Transfer to Beaufort Middle School",
        description: "Transferred to Beaufort Middle School. A private secondary school in Beaufort."
      }
    ]
  },
  {
    year: 2012,
    events: [
      {
        month: "February",
        title: "Transfer to Yu Yuan Secondary School",
        description: "Transferred to Yu Yuan Secondary School. A private secondary school in Sandakan."
      },
      {
        month: "January",
        title: "St Cecilia Convent Secondary School Enrollment",
        description: "Enrolled St Cecilia Convent Secondary School. A national secondary school in Sandakan."
      }
    ]
  },
  {
    year: 2011,
    events: [
      {
        month: "November",
        title: "SJK(C) Tai Tong Graduation",
        description: "Graduated from SJK(C) Tai Tong."
      }
    ]
  },
  {
    year: 2006,
    events: [
      {
        month: "January",
        title: "Primary School Enrollment",
        description: "Enrolled in SJK(C) Tai Tong. A primary school in Sandakan."
      }
    ]
  },
  {
    year: 1999,
    events: [
      {
        month: "June",
        title: "Birth",
        description: "Born in Sandakan. The 2nd largest city in Sabah state of Malaysia."
      }
    ]
  }
];
