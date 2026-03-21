// src/data/goods.js
// 商品列表（每个商品带分类标签，和顶部分类对应，补充desc字段适配详情页）
export const goodsList = [
  { 
    id: 1, 
    name: "小米17 骁龙8Gen3 徕卡拍照 5G手机", 
    price: 4499, 
    category: "手机", 
    img: "/assets/goods/phone14.jpg",
    count: 1,
    // 补充商品描述（详情页展示）
    desc: "小米17搭载骁龙8Gen3旗舰芯片，徕卡专业影像系统，6.78英寸2K OLED直屏，5400mAh大电池+120W快充，支持5G全网通，MIUI 15系统流畅体验。"
  },
  { 
    id: 2, 
    name: "华为FreeBuds Pro3 无线蓝牙耳机", 
    price: 1499, 
    category: "耳机", 
    img: "/assets/goods/earphone.jpg",
    count: 1,
    desc: "华为FreeBuds Pro3采用星闪技术，降噪深度达47dB，超高清音质，续航长达30小时，支持无线充电，适配华为/安卓/苹果全设备。"
  },
  { 
    id: 3, 
    name: "小米平板6 11.2英寸 骁龙8+ 平板电脑", 
    price: 2499, 
    category: "平板", 
    img: "/assets/goods/pad6.jpg",
    count: 1,
    desc: "小米平板6搭载骁龙8+处理器，11.2英寸2.8K 144Hz高刷屏，8800mAh大电池，33W快充，MIUI Pad系统，支持键盘/手写笔扩展。"
  },
  { 
    id: 4, 
    name: "小米笔记本Pro 14 锐龙版 轻薄本", 
    price: 4999, 
    category: "电脑", 
    img: "/assets/goods/laptop.jpg",
    count: 1,
    desc: "小米笔记本Pro 14锐龙版搭载AMD锐龙7 7840HS处理器，14英寸2.8K 120Hz OLED屏，16GB+1TB大存储，轻薄机身仅1.3kg，长续航设计。"
  },
  // { 
  //   id: 5, 
  //   name: "小米充电宝20000mAh 快充版", 
  //   price: 199, 
  //   category: "配件", 
  //   img: "/assets/goods/charger.jpg",
  //   count: 1,
  //   desc: "小米充电宝20000mAh快充版，支持22.5W MAX快充，兼容苹果/安卓设备，数显电量，轻薄便携，可上飞机。"
  // }
];

export const categoryList = ["全部", "手机", "电脑", "平板", "耳机", "配件"];