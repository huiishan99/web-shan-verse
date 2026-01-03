// Current Status Data
// 编辑这个文件来更新首页的 Current Status 卡片
// 更新后刷新页面即可看到变化

export interface StatusItem {
  icon: string;      // Icon 组件的图标名称
  text: string;      // 显示文字
}

export const currentStatus = {
  // 状态标题 - 可以改成其他如 "Current Mood", "Life Status" 等
  title: "Current Status",
  
  // 主要状态标签 - 用于快速表达当前状态
  // 可选值建议：Celebrating | Traveling | Working | Gaming 
  //            Learning | Vacation | Resting | Busy
  badge: "Fresh Graduate",
  
  // 状态列表 - 添加/删除/修改都很容易
  items: [
    { icon: "briefcase", text: "Vacation" },
    { icon: "map", text: "Aizu-Wakamatsu, Japan" },
    { icon: "gamepad", text: "VR/XR Development" },
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
