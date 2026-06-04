// Timeline Data - 以后添加新事件只需编辑这个文件
// 按年份倒序排列，每年的事件按月份倒序排列

type LocalizedString = string | {
  en: string;
  zh?: string;
  ja?: string;
};

export type TimelineEventWeight = 'major' | 'standard' | 'note';
export type TimelineEventCategory = 'research' | 'career' | 'education' | 'life' | 'travel' | 'project' | 'award';

export interface TimelineEvent {
  month: LocalizedString;
  title: LocalizedString;
  description: LocalizedString;
  weight?: TimelineEventWeight;
  category?: TimelineEventCategory;
  date?: string;
  datePrecision?: 'day' | 'month';
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
        month: { en: "May", zh: "五月", ja: "5月" },
        title: {
          en: "ICICS 2026 Short Paper Acceptance",
          zh: "ICICS 2026 短论文接收",
          ja: "ICICS 2026 ショートペーパー採択"
        },
        weight: "major",
        category: "research",
        date: "2026-05-01",
        description: {
          en: "Received the acceptance notification for a short paper at ICICS 2026.",
          zh: "收到 ICICS 2026 短论文被接收的通知。",
          ja: "ICICS 2026 のショートペーパー採択通知を受け取りました。"
        }
      },
      {
        month: { en: "May", zh: "五月", ja: "5月" },
        title: {
          en: "First Personal Car",
          zh: "人生第一辆自己的车",
          ja: "人生初の自分の車"
        },
        weight: "major",
        category: "life",
        date: "2026-05-23",
        description: {
          en: "Got my first personal car, a used Honda Freed series vehicle.",
          zh: "拿到人生第一辆自己的车，是一辆二手的本田 Freed 系列车型。",
          ja: "人生で初めて自分の車を手に入れました。中古の Honda Freed シリーズの車です。"
        }
      },
      {
        month: { en: "May", zh: "五月", ja: "5月" },
        title: {
          en: "Department BBQ on Company Softball Day",
          zh: "公司垒球大会同日的部门 BBQ",
          ja: "ソフトボール大会当日の部署BBQ"
        },
        weight: "standard",
        category: "career",
        date: "2026-05-30",
        description: {
          en: "Joined the department BBQ, which was held on the same day as the company softball tournament. I did not participate in softball.",
          zh: "参加了部门 BBQ。这个活动和公司的ソフトボール大会同日举办，但我并没有参加 softball。",
          ja: "会社のソフトボール大会と同日に開催された部署BBQに参加しました。ソフトボールには参加していません。"
        }
      },
      {
        month: { en: "May", zh: "五月", ja: "5月" },
        title: {
          en: "Department Welcome Party",
          zh: "部门欢迎会",
          ja: "部署の歓迎会"
        },
        weight: "standard",
        category: "career",
        date: "2026-05-22",
        description: {
          en: "The department held a welcome party for me after I joined the assigned team.",
          zh: "配属后，部门为我举办了欢迎会。",
          ja: "配属後、部署で歓迎会を開いていただきました。"
        }
      },
      {
        month: { en: "April", zh: "四月", ja: "4月" },
        title: {
          en: "First Day at Iwaki Development Center",
          zh: "磐城开发中心配属初日",
          ja: "いわき開発センター配属初日"
        },
        weight: "major",
        category: "career",
        date: "2026-04-27",
        description: {
          en: "Completed the Tokyo Head Office training on April 23, returned to Iwaki on April 24, and started the first day at the assigned workplace, Iwaki Development Center, as a new employee.",
          zh: "4 月 23 日结束东京本社研修，4 月 24 日回到配属地磐城，并于 4 月 27 日作为新人在磐城开发中心开始配属后的第一天工作。",
          ja: "4月23日に東京本社での研修を終え、4月24日に配属地のいわきへ戻り、4月27日に新人としていわき開発センターで配属初日を迎えました。"
        }
      },
      {
        month: { en: "April", zh: "四月", ja: "4月" },
        title: {
          en: "Alps Alpine Tokyo Head Office Training",
          zh: "Alps Alpine 东京本社研修",
          ja: "Alps Alpine 東京本社研修"
        },
        weight: "standard",
        category: "career",
        date: "2026-04-01",
        description: {
          en: "Started new-employee training at the Alps Alpine Tokyo Head Office.",
          zh: "开始在 Alps Alpine 东京本社参加新人研修。",
          ja: "Alps Alpine 東京本社で新人研修を開始しました。"
        }
      },
      {
        month: { en: "March", zh: "三月", ja: "3月" },
        title: {
          en: "Tokyo Trip Before Training",
          zh: "研修前前往东京",
          ja: "研修前に東京へ移動"
        },
        weight: "standard",
        category: "travel",
        date: "2026-03-31",
        description: {
          en: "Traveled to Tokyo ahead of the new-employee training at Alps Alpine.",
          zh: "在 Alps Alpine 新人研修开始前前往东京。",
          ja: "Alps Alpine の新人研修に向けて東京へ移動しました。"
        }
      },
      {
        month: { en: "March", zh: "三月", ja: "3月" },
        title: {
          en: "Japanese AT Driver's License",
          zh: "取得日本 AT 驾照",
          ja: "日本のAT限定運転免許取得"
        },
        weight: "major",
        category: "life",
        date: "2026-03-30",
        description: {
          en: "Officially obtained a Japanese automatic-transmission driver's license.",
          zh: "正式取得日本自动挡（AT）驾驶执照。",
          ja: "日本のAT限定運転免許を正式に取得しました。"
        }
      },
      {
        month: { en: "January", zh: "一月", ja: "1月" },
        title: {
          en: "Driving School Intensive Camp Completion",
          zh: "完成驾校集训",
          ja: "運転免許合宿の修了"
        },
        weight: "standard",
        category: "life",
        description: {
          en: "Completed a two-week intensive driving school camp at Chuetsu Driving School and successfully obtained the provisional driving license.",
          zh: "在中越驾校完成为期两周的集训，并顺利取得临时驾驶执照。",
          ja: "中越自動車学校で2週間の短期合宿を修了し、仮免許を取得しました。"
        }
      },
      {
        month: { en: "January", zh: "一月", ja: "1月" },
        title: {
          en: "AHs 2026 Paper Acceptance",
          zh: "AHs 2026 论文接收",
          ja: "AHs 2026 論文採択"
        },
        weight: "major",
        category: "research",
        description: {
          en: "A research paper was accepted by Augmented Humans 2026, with me as the second author.",
          zh: "一篇研究论文被 Augmented Humans 2026 接收，我为第二作者。",
          ja: "研究論文が Augmented Humans 2026 に採択され、私は第二著者として参加しました。"
        }
      }
    ]
  },
  {
    year: 2025,
    events: [
      {
        month: { en: "December", zh: "十二月", ja: "12月" },
        title: { en: "Return to Japan after Travel", zh: "旅行后返回日本", ja: "旅行後に日本へ帰国" },
        weight: "standard",
        category: "travel",
        description: {
          en: "Returned to Japan via Osaka after completing long-term travel and finally arrived back in Aizuwakamatsu.",
          zh: "结束长期旅行后经大阪返回日本，最终回到会津若松。",
          ja: "長期旅行を終え、大阪経由で日本に戻り、最終的に会津若松へ帰ってきました。"
        }
      }
      ,
      {
        month: { en: "October", zh: "十月", ja: "10月" },
        title: { en: "Extended China Travel", zh: "中国长途旅行", ja: "中国での長期旅行" },
        weight: "standard",
        category: "travel",
        description: {
          en: "Traveled in China for over one month with my partner, visiting Tianjin, Beijing, Harbin, Shuangyashan, Qingdao, Hong Kong, Shenzhen, Guangzhou, Foshan, Zhuhai, Macau, and Shanghai.",
          zh: "和伴侣在中国旅行一个多月，途经天津、北京、哈尔滨、双鸭山、青岛、香港、深圳、广州、佛山、珠海、澳门和上海。",
          ja: "パートナーと1か月以上中国を旅行し、天津、北京、ハルビン、双鴨山、青島、香港、深圳、広州、仏山、珠海、マカオ、上海を訪れました。"
        }
      }
      ,
      {
        month: { en: "October", zh: "十月", ja: "10月" },
        title: { en: "Alps Alpine Official Job Offer", zh: "收到 Alps Alpine 正式录用通知", ja: "Alps Alpine の正式内定" },
        weight: "major",
        category: "career",
        description: {
          en: "Participated in the Alps Alpine job-offer holders meeting and received the official employment offer.",
          zh: "参加 Alps Alpine 内定者会议，并收到正式录用通知。",
          ja: "Alps Alpine の内定者懇親会に参加し、正式な内定を受け取りました。"
        }
      }
      ,
      {
        month: { en: "September", zh: "九月", ja: "9月" },
        title: { en: "Early Graduation from The University of Aizu", zh: "从会津大学提前毕业", ja: "会津大学を早期修了" },
        weight: "major",
        category: "education",
        description: {
          en: "Graduated six months earlier than scheduled after completing all coursework and meeting the graduation requirements through external paper publications.",
          zh: "完成所有课程，并通过校外论文发表满足毕业要求，比原计划提前六个月毕业。",
          ja: "すべての授業を修了し、外部論文発表によって修了要件を満たしたため、予定より6か月早く修了しました。"
        }
      }
      ,
      {
        month: { en: "September", zh: "九月", ja: "9月" },
        title: { en: "ISPEC 2025 Full Paper Acceptance", zh: "ISPEC 2025 完整论文接收", ja: "ISPEC 2025 フルペーパー採択" },
        weight: "major",
        category: "research",
        description: {
          en: "A full paper was accepted by ISPEC 2025, with me as the second author.",
          zh: "一篇完整论文被 ISPEC 2025 接收，我为第二作者。",
          ja: "フルペーパーが ISPEC 2025 に採択され、私は第二著者として参加しました。"
        }
      }
      ,
      {
        month: { en: "August", zh: "八月", ja: "8月" },
        title: { en: "Master's Thesis Presentation and Recognition", zh: "硕士论文发表与认可", ja: "修士論文発表と評価" },
        weight: "major",
        category: "research",
        description: {
          en: "The master's thesis received positive evaluations from other professors. Prof. Watanobe described it as excellent, and Prof. Pyshkin stated that the thesis was equivalent to doctoral-level work.",
          zh: "硕士论文获得其他教授的积极评价。Watanobe 教授评价其为 excellent，Pyshkin 教授认为论文达到了博士水平。",
          ja: "修士論文は複数の教授から高い評価を受けました。Watanobe 教授からは excellent と評され、Pyshkin 教授からは博士レベルに相当すると評価されました。"
        }
      }
      ,
      {
        month: { en: "July", zh: "七月", ja: "7月" },
        title: { en: "IEEE GEM 2025 Conference Participation", zh: "参加 IEEE GEM 2025", ja: "IEEE GEM 2025 参加" },
        weight: "standard",
        category: "research",
        description: {
          en: "Attended IEEE GEM 2025 conference in Kaohsiung, Taiwan.",
          zh: "前往台湾高雄参加 IEEE GEM 2025 会议。",
          ja: "台湾・高雄で開催された IEEE GEM 2025 に参加しました。"
        }
      },
      {
        month: { en: "May", zh: "五月", ja: "5月" },
        title: { en: "IEEE GEM Full Paper Acceptance", zh: "IEEE GEM 完整论文接收", ja: "IEEE GEM フルペーパー採択" },
        weight: "major",
        category: "research",
        description: {
          en: "A full paper was accepted by IEEE GEM 2025, with me as the first author.",
          zh: "一篇完整论文被 IEEE GEM 2025 接收，我为第一作者。",
          ja: "フルペーパーが IEEE GEM 2025 に採択され、私は第一著者として参加しました。"
        }
      },
      {
        month: { en: "January", zh: "一月", ja: "1月" },
        title: { en: "Alps Alpine Informal Job Offer", zh: "收到 Alps Alpine 非正式内定", ja: "Alps Alpine から口頭内定" },
        weight: "major",
        category: "career",
        description: {
          en: "Received an informal (verbal) job offer from Alps Alpine Corporation.",
          zh: "收到 Alps Alpine Corporation 的非正式（口头）内定。",
          ja: "Alps Alpine Corporation から非公式（口頭）の内定を受けました。"
        }
      }

    ]
  },
  {
    year: 2024,
    events: [
      {
        month: "October",
        title: { en: "JPHACKS Hackathon Participation", zh: "参加 JPHACKS 黑客松", ja: "JPHACKS ハッカソン参加" },
        weight: "standard",
        category: "project",
        description: {
          en: "Participated in the JPHACKS hackathon at the Sendai venue, where our team project received the third-highest number of votes at the venue.",
          zh: "参加 JPHACKS 仙台会场黑客松，团队项目获得该会场第三高票数。",
          ja: "仙台会場で開催された JPHACKS ハッカソンに参加し、チームプロジェクトは会場内で3番目に多い票を獲得しました。"
        }
      },
      {
        month: "September",
        title: { en: "Alps Alpine Corporation Internship", zh: "Alps Alpine 实习", ja: "Alps Alpine インターンシップ" },
        weight: "standard",
        category: "career",
        description: {
          en: "Participated in a two weeks internship at Alps Alpine Corporation. During this period, mainly developed a VR car scene prototype with Unity.",
          zh: "参加 Alps Alpine Corporation 为期两周的实习，期间主要使用 Unity 开发 VR 汽车场景原型。",
          ja: "Alps Alpine Corporation の2週間インターンシップに参加し、主に Unity を用いた VR 車載シーンプロトタイプを開発しました。"
        }
      },
      {
        month: "August",
        title: { en: "Alps Alpine Workshop", zh: "Alps Alpine 工作坊", ja: "Alps Alpine ワークショップ" },
        weight: "standard",
        category: "career",
        description: {
          en: "Participated in a workshop organized by Alps Alpine Corporation under the recommendation of the supervisor, where the group won first grade and I received an internship opportunity.",
          zh: "在导师推荐下参加 Alps Alpine Corporation 举办的工作坊，小组获得第一名，我也因此获得实习机会。",
          ja: "指導教員の推薦で Alps Alpine Corporation 主催のワークショップに参加し、グループで1位を獲得。その後インターンシップの機会を得ました。"
        }
      },
      {
        month: "April",
        title: { en: "University of Aizu Enrollment", zh: "入学会津大学", ja: "会津大学入学" },
        weight: "major",
        category: "education",
        description: {
          en: "Enrolled in The University of Aizu. Pursuing a master's degree in Graduate Department of Computer and Information Systems. The university is part of Top Global University Project in Japan.",
          zh: "入学会津大学，在计算机与信息系统研究科攻读硕士学位。会津大学是日本 Top Global University Project 成员校。",
          ja: "会津大学に入学し、コンピュータ・情報システム研究科で修士課程を開始しました。会津大学は日本の Top Global University Project の一校です。"
        }
      },
      {
        month: "March",
        title: { en: "ABK College Graduation and Relocation", zh: "ABK 毕业并搬家", ja: "ABK 卒業と引っ越し" },
        weight: "standard",
        category: "education",
        description: {
          en: "Graduated from ABK College. Moved to Aizuwakamatsu, a city in Fukushima.",
          zh: "从 ABK College 毕业，并搬到福岛县会津若松市。",
          ja: "ABK College を卒業し、福島県会津若松市へ引っ越しました。"
        }
      },
      {
        month: "February",
        title: { en: "Hamazushi Job End", zh: "结束滨寿司兼职", ja: "はま寿司のアルバイト終了" },
        weight: "note",
        category: "career",
        description: {
          en: "Ended the part-time job at Hamasushi.",
          zh: "结束在滨寿司的兼职工作。",
          ja: "はま寿司でのアルバイトを終了しました。"
        }
      },
      {
        month: "January",
        title: { en: "CoCo ICHIBANYA Job End", zh: "结束 CoCo ICHIBANYA 兼职", ja: "CoCo ICHIBANYA のアルバイト終了" },
        weight: "note",
        category: "career",
        description: {
          en: "Ended the part-time job at Curry House CoCo ICHIBANYA.",
          zh: "结束在 Curry House CoCo ICHIBANYA 的兼职工作。",
          ja: "カレーハウス CoCo ICHIBANYA でのアルバイトを終了しました。"
        }
      }
    ]
  },
  {
    year: 2023,
    events: [
      {
        month: "March",
        title: { en: "Hamazushi Part-time Job", zh: "开始滨寿司兼职", ja: "はま寿司のアルバイト開始" },
        weight: "note",
        category: "career",
        description: {
          en: "Started the second part-time job at Hamazushi.",
          zh: "开始第二份兼职，在滨寿司工作。",
          ja: "2つ目のアルバイトとして、はま寿司で働き始めました。"
        }
      }
    ]
  },
  {
    year: 2022,
    events: [
      {
        month: "December",
        title: { en: "CoCo ICHIBANYA Part-time Job", zh: "开始 CoCo ICHIBANYA 兼职", ja: "CoCo ICHIBANYA のアルバイト開始" },
        weight: "note",
        category: "career",
        description: {
          en: "Started a part-time job at Curry House CoCo ICHIBANYA.",
          zh: "开始在 Curry House CoCo ICHIBANYA 做兼职。",
          ja: "カレーハウス CoCo ICHIBANYA でアルバイトを始めました。"
        }
      },
      {
        month: "October",
        title: { en: "Arrival in Japan", zh: "抵达日本", ja: "日本到着" },
        weight: "major",
        category: "life",
        description: {
          en: "Arrived in Tokyo, Japan. Enrolled in ABK College. A Japanese Language School in Tokyo, in order to learn Japanese.",
          zh: "抵达日本东京，入学东京的日语学校 ABK College 学习日语。",
          ja: "日本・東京に到着し、日本語を学ぶために東京の日本語学校 ABK College に入学しました。"
        }
      },
      {
        month: "June",
        title: { en: "Northwestern Polytechnical University Graduation", zh: "西北工业大学毕业", ja: "西北工業大学卒業" },
        weight: "major",
        category: "education",
        description: {
          en: "Graduated from Northwestern Polytechnical University with bachelor degree in engineering. Began studying basic Japanese at Mikasano Academic Centre in preparation for studying in Japan.",
          zh: "从西北工业大学获得工学学士学位毕业，并在 Mikasano Academic Centre 开始学习基础日语，为赴日留学做准备。",
          ja: "西北工業大学を卒業し、工学学士を取得しました。日本留学に向けて Mikasano Academic Centre で基礎日本語の学習を始めました。"
        }
      },
      {
        month: "January",
        title: { en: "UEA Internship Completion", zh: "完成 UEA 实习", ja: "UEA インターン修了" },
        weight: "standard",
        category: "career",
        description: {
          en: "Completed the internship in University Enterprises Alliance (UEA) internship programme.",
          zh: "完成 University Enterprises Alliance（UEA）实习项目。",
          ja: "University Enterprises Alliance（UEA）のインターンシッププログラムを修了しました。"
        }
      }
    ]
  },
  {
    year: 2021,
    events: [
      {
        month: "November",
        title: { en: "UEA Internship Program", zh: "开始 UEA 实习", ja: "UEA インターン開始" },
        weight: "standard",
        category: "career",
        description: {
          en: "Started the internship in University Enterprises Alliance (UEA) internship programme. Co-developed by China Campus Network and Alibaba GDT Team.",
          zh: "开始 University Enterprises Alliance（UEA）实习项目，该项目由 China Campus Network 与 Alibaba GDT Team 共同开发。",
          ja: "China Campus Network と Alibaba GDT Team が共同開発した University Enterprises Alliance（UEA）インターンシッププログラムを開始しました。"
        }
      }
    ]
  },
  {
    year: 2020,
    events: [
      {
        month: "August",
        title: { en: "Competition Awards", zh: "竞赛获奖", ja: "コンテスト受賞" },
        weight: "major",
        category: "award",
        description: {
          en: "Won the provincial second prize of China National College Student Innovation, Originality and Entrepreneurship Challenge. Won the school second prize of China International College Student Internet+ Innovation and Entrepreneurship Competition.",
          zh: "获得中国大学生创新、创意及创业挑战赛省级二等奖，以及中国国际大学生“互联网+”创新创业大赛校级二等奖。",
          ja: "中国大学生 Innovation, Originality and Entrepreneurship Challenge の省級二等賞、および中国国際大学生 Internet+ Innovation and Entrepreneurship Competition の学内二等賞を受賞しました。"
        }
      },
      {
        month: "July",
        title: { en: "A-Project Team Formation", zh: "组建 A-Project 团队", ja: "A-Project チーム結成" },
        weight: "standard",
        category: "project",
        description: {
          en: "Formed a team with friends which call A-Project. Started a project called ACGN Project. Mainly engaged in ACG self-media content production.",
          zh: "与朋友组建名为 A-Project 的团队，并启动 ACGN Project，主要从事 ACG 自媒体内容制作。",
          ja: "友人たちと A-Project というチームを結成し、ACGN Project を開始しました。主に ACG 系セルフメディアコンテンツ制作に取り組みました。"
        }
      }
    ]
  },
  {
    year: 2018,
    events: [
      {
        month: "October",
        title: { en: "University Activities", zh: "大学社团活动", ja: "大学での活動" },
        weight: "note",
        category: "life",
        description: {
          en: "Become a member of the NPU Students Association Union in Northwestern Polytechnical University. Become a member of the school chinese debate team in Northwestern Polytechnical University.",
          zh: "成为西北工业大学学生社团联合会成员，并加入学校中文辩论队。",
          ja: "西北工業大学の学生団体連合会に参加し、大学の中国語ディベートチームのメンバーになりました。"
        }
      },
      {
        month: "September",
        title: { en: "Northwestern Polytechnical University Enrollment", zh: "入学西北工业大学", ja: "西北工業大学入学" },
        weight: "major",
        category: "education",
        description: {
          en: "Enrolled in Northwestern Polytechnical University. Majoring in E-commerce in the School of Computer Science. The university is part of Project 985, Project 211, and the Double First-Class Construction in China. Won the first level scholarship of the NPU President Scholarship included tuition fee, accommodation fee, and living allowances.",
          zh: "入学西北工业大学计算机学院电子商务专业。学校属于中国 985 工程、211 工程和“双一流”建设高校。获得西北工业大学校长奖学金一等奖，包含学费、住宿费减免和生活补贴。",
          ja: "西北工業大学に入学し、コンピュータ学院の電子商取引を専攻しました。同大学は中国の 985 工程、211 工程、双一流建設に含まれる大学です。授業料・宿舎費免除と生活補助を含む NPU President Scholarship の一等奨学金を受賞しました。"
        }
      },
      {
        month: "August",
        title: { en: "IFP Graduation", zh: "IFP 结业", ja: "IFP 修了" },
        weight: "standard",
        category: "education",
        description: {
          en: "Graduated from the International Foundation Program (IFP) of Northwestern Polytechnical University with an average score of over 90 points (full score is 100).",
          zh: "从西北工业大学 International Foundation Program（IFP）结业，平均成绩超过 90 分（满分 100）。",
          ja: "西北工業大学の International Foundation Program（IFP）を修了し、平均点は90点以上（100点満点）でした。"
        }
      },
      {
        month: "March",
        title: { en: "Arrival in Xian and IFP Enrollment", zh: "抵达西安并入读 IFP", ja: "西安到着と IFP 入学" },
        weight: "major",
        category: "education",
        description: {
          en: "Arrived in Xian, the capital of Shaanxi Province in China. Began studying in the International Foundation Programme (IFP) in Northwestern Polytechnical University.",
          zh: "抵达中国陕西省省会西安，开始就读西北工业大学 International Foundation Programme（IFP）。",
          ja: "中国・陝西省の省都である西安に到着し、西北工業大学の International Foundation Programme（IFP）で学び始めました。"
        }
      }
    ]
  },
  {
    year: 2017,
    events: [
      {
        month: "December",
        title: { en: "Beaufort Middle School Graduation", zh: "Beaufort Middle School 毕业", ja: "Beaufort Middle School 卒業" },
        weight: "standard",
        category: "education",
        description: {
          en: "Graduated from Beaufort Middle School.",
          zh: "从 Beaufort Middle School 毕业。",
          ja: "Beaufort Middle School を卒業しました。"
        }
      }
    ]
  },
  {
    year: 2015,
    events: [
      {
        month: "June",
        title: { en: "Transfer to Beaufort Middle School", zh: "转学至 Beaufort Middle School", ja: "Beaufort Middle School へ転校" },
        weight: "standard",
        category: "education",
        description: {
          en: "Transferred to Beaufort Middle School. A private secondary school in Beaufort.",
          zh: "转学至 Beaufort Middle School，一所位于 Beaufort 的私立中学。",
          ja: "Beaufort にある私立中等学校、Beaufort Middle School へ転校しました。"
        }
      }
    ]
  },
  {
    year: 2012,
    events: [
      {
        month: "February",
        title: { en: "Transfer to Yu Yuan Secondary School", zh: "转学至育源中学", ja: "Yu Yuan Secondary School へ転校" },
        weight: "standard",
        category: "education",
        description: {
          en: "Transferred to Yu Yuan Secondary School. A private secondary school in Sandakan.",
          zh: "转学至育源中学，一所位于山打根的私立中学。",
          ja: "サンダカンにある私立中等学校、Yu Yuan Secondary School へ転校しました。"
        }
      },
      {
        month: "January",
        title: { en: "St Cecilia Convent Secondary School Enrollment", zh: "入读 St Cecilia Convent Secondary School", ja: "St Cecilia Convent Secondary School 入学" },
        weight: "standard",
        category: "education",
        description: {
          en: "Enrolled St Cecilia Convent Secondary School. A national secondary school in Sandakan.",
          zh: "入读 St Cecilia Convent Secondary School，一所位于山打根的国立中学。",
          ja: "サンダカンにある国立中等学校、St Cecilia Convent Secondary School に入学しました。"
        }
      }
    ]
  },
  {
    year: 2011,
    events: [
      {
        month: "November",
        title: { en: "SJK(C) Tai Tong Graduation", zh: "大同小学毕业", ja: "SJK(C) Tai Tong 卒業" },
        weight: "standard",
        category: "education",
        description: {
          en: "Graduated from SJK(C) Tai Tong.",
          zh: "从 SJK(C) Tai Tong 大同小学毕业。",
          ja: "SJK(C) Tai Tong を卒業しました。"
        }
      }
    ]
  },
  {
    year: 2006,
    events: [
      {
        month: "January",
        title: { en: "Primary School Enrollment", zh: "入读小学", ja: "小学校入学" },
        weight: "standard",
        category: "education",
        description: {
          en: "Enrolled in SJK(C) Tai Tong. A primary school in Sandakan.",
          zh: "入读山打根的 SJK(C) Tai Tong 大同小学。",
          ja: "サンダカンにある小学校、SJK(C) Tai Tong に入学しました。"
        }
      }
    ]
  },
  {
    year: 1999,
    events: [
      {
        month: "June",
        title: { en: "Birth", zh: "出生", ja: "誕生" },
        weight: "major",
        category: "life",
        description: {
          en: "Born in Sandakan. The 2nd largest city in Sabah state of Malaysia.",
          zh: "出生于马来西亚沙巴州第二大城市山打根。",
          ja: "マレーシア・サバ州で2番目に大きい都市、サンダカンで生まれました。"
        }
      }
    ]
  }
];
