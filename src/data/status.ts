// Current Status Data
// 编辑这个文件来更新首页的 Current Status 卡片
// 更新后刷新页面即可看到变化

export interface StatusItem {
  icon: string;      // Icon 组件的图标名称
  text: string | { en: string; zh?: string; ja?: string };      // 显示文字
  url?: string;      // 可选的链接 URL
}

export const currentStatus = {
  // 状态标题 - 可以改成其他如 "Current Mood", "Life Status" 等
  title: {
    en: "Current Status",
    zh: "当前状态",
    ja: "現在のステータス"
  },
  
  // 主要状态标签 - 用于快速表达当前状态
  // 可选值建议：Celebrating | Traveling | Working | Gaming 
  //            Learning | Vacation | Resting | Busy
  badge: {
    en: "New Employee",
    zh: "新入职员工",
    ja: "新卒エンジニア"
  },
  
  // 状态列表 - 添加/删除/修改都很容易
  items: [
    { icon: "briefcase", text: "Alps Alpine Co., Ltd", url: "https://www.alpsalpine.com" },
    { icon: "map", text: { en: "Iwaki, Japan", zh: "日本磐城市", ja: "日本・いわき市" }, url: "https://www.google.com/maps/place/Iwaki" },
    { icon: "gamepad", text: { en: "Embedded Software Development", zh: "嵌入式软件开发", ja: "組込みソフトウェア開発" } },
  ] as StatusItem[]
};

// ============================================
// 状态示例参考 (复制粘贴修改即可)
// ============================================

/*
// 工作中状态
export const currentStatus = {
  title: "Current Status",
  badge: "💼 Working",
  items: [
    { icon: "briefcase", text: "Software Engineer @ Company" },
    { icon: "map", text: "Tokyo, Japan" },
    { icon: "code", text: "Building cool stuff" },
  ]
};

// 旅行状态  
export const currentStatus = {
  title: "Current Status",
  badge: "✈️ Traveling",
  items: [
    { icon: "map", text: "Exploring Europe" },
    { icon: "camera", text: "Capturing memories" },
    { icon: "coffee", text: "Trying local cafes" },
  ]
};

// 休息状态
export const currentStatus = {
  title: "Current Status", 
  badge: "🏖️ On Vacation",
  items: [
    { icon: "sun", text: "Recharging batteries" },
    { icon: "book", text: "Reading & Relaxing" },
    { icon: "gamepad", text: "Playing games" },
  ]
};
*/
