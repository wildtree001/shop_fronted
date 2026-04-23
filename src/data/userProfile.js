const getUserData = (username) => {
  const data = localStorage.getItem(`userProfile_${username}`);
  return data ? JSON.parse(data) : null;
};

const saveUserData = (username, data) => {
  localStorage.setItem(`userProfile_${username}`, JSON.stringify(data));
};

const getCurrentUsername = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    return JSON.parse(user).username;
  }
  return null;
};

const createDefaultUserProfile = (username) => {
  return {
    username: username,
    totalSpent: 0,
    points: 0,
    memberLevel: 'bronze',
    memberLevelExp: 0,
    badges: [],
    orders: [],
    coupons: [],
    redeemedCoupons: [],
    pointsHistory: [],
    shoppingStats: {
      totalOrders: 0,
      totalGoods: 0,
      categorySpent: {},
      hourDistribution: {},
      dailyDistribution: {}
    }
  };
};

export const getOrCreateUserProfile = () => {
  const username = getCurrentUsername();
  if (!username) return null;
  
  let profile = getUserData(username);
  if (!profile) {
    profile = createDefaultUserProfile(username);
    saveUserData(username, profile);
  }
  if (!profile.pointsHistory) {
    profile.pointsHistory = [];
  }
  return profile;
};

export const updateUserProfile = (profile) => {
  const username = getCurrentUsername();
  if (!username || !profile) return false;
  
  saveUserData(username, profile);
  return true;
};

export const POINTS_HISTORY_TYPES = {
  earn: {
    name: '获得积分',
    icon: '➕',
    color: '#52c41a'
  },
  spend: {
    name: '消费积分',
    icon: '➖',
    color: '#ff4d4f'
  }
};

export const createPointsHistory = (type, amount, description, relatedId = null) => {
  return {
    id: 'PH' + Date.now() + Math.random().toString(36).substr(2, 9),
    type: type,
    amount: amount,
    description: description,
    relatedId: relatedId,
    createdAt: new Date().toISOString()
  };
};

export const MEMBER_LEVELS = {
  bronze: {
    name: '青铜',
    minExp: 0,
    maxExp: 10000,
    discount: 1,
    pointsMultiplier: 1,
    color: '#CD7F32'
  },
  silver: {
    name: '白银',
    minExp: 10000,
    maxExp: 20000,
    discount: 0.9,
    pointsMultiplier: 2,
    color: '#C0C0C0'
  },
  gold: {
    name: '黄金',
    minExp: 20000,
    maxExp: 30000,
    discount: 0.8,
    pointsMultiplier: 3,
    color: '#FFD700'
  },
  diamond: {
    name: '钻石',
    minExp: 30000,
    maxExp: Infinity,
    discount: 0.7,
    pointsMultiplier: 4,
    color: '#00CED1'
  }
};

export const BADGE_DEFINITIONS = {
  first_order: {
    id: 'first_order',
    name: '初次购物',
    description: '完成第一笔订单',
    rarity: 'common',
    icon: '🛒',
    condition: (profile) => profile.orders.length >= 1
  },
  five_orders: {
    id: 'five_orders',
    name: '购物达人',
    description: '完成5笔订单',
    rarity: 'common',
    icon: '⭐',
    condition: (profile) => profile.orders.length >= 5
  },
  ten_orders: {
    id: 'ten_orders',
    name: '资深买家',
    description: '完成10笔订单',
    rarity: 'rare',
    icon: '🌟',
    condition: (profile) => profile.orders.length >= 10
  },
  spent_5000: {
    id: 'spent_5000',
    name: '小资生活',
    description: '累计消费满5000元',
    rarity: 'common',
    icon: '💰',
    condition: (profile) => profile.totalSpent >= 5000
  },
  spent_10000: {
    id: 'spent_10000',
    name: '万元户',
    description: '累计消费满10000元',
    rarity: 'rare',
    icon: '💎',
    condition: (profile) => profile.totalSpent >= 10000
  },
  spent_30000: {
    id: 'spent_30000',
    name: '钻石会员',
    description: '累计消费满30000元',
    rarity: 'legendary',
    icon: '👑',
    condition: (profile) => profile.totalSpent >= 30000
  },
  bought_phone: {
    id: 'bought_phone',
    name: '手机爱好者',
    description: '购买过手机类商品',
    rarity: 'common',
    icon: '📱',
    condition: (profile) => {
      return profile.orders.some(order => 
        order.goods.some(g => g.category === '手机')
      );
    }
  },
  bought_computer: {
    id: 'bought_computer',
    name: '数码达人',
    description: '购买过电脑类商品',
    rarity: 'rare',
    icon: '💻',
    condition: (profile) => {
      return profile.orders.some(order => 
        order.goods.some(g => g.category === '电脑')
      );
    }
  },
  member_silver: {
    id: 'member_silver',
    name: '白银会员',
    description: '升级为白银会员',
    rarity: 'common',
    icon: '🥈',
    condition: (profile) => profile.memberLevelExp >= 10000
  },
  member_gold: {
    id: 'member_gold',
    name: '黄金会员',
    description: '升级为黄金会员',
    rarity: 'rare',
    icon: '🥇',
    condition: (profile) => profile.memberLevelExp >= 20000
  },
  member_diamond: {
    id: 'member_diamond',
    name: '钻石会员',
    description: '升级为钻石会员',
    rarity: 'legendary',
    icon: '💠',
    condition: (profile) => profile.memberLevelExp >= 30000
  }
};

export const RARITY_INFO = {
  common: { name: '普通', color: '#909399', bgColor: '#f4f4f5' },
  rare: { name: '稀有', color: '#409eff', bgColor: '#ecf5ff' },
  legendary: { name: '传说', color: '#e6a23c', bgColor: '#fdf6ec' }
};

export const COUPON_DEFINITIONS = [
  {
    id: 'coupon_10_100',
    name: '10元代金券',
    type: 'voucher',
    description: '满100元可用',
    pointsCost: 500,
    discountAmount: 10,
    minOrderAmount: 100,
    validDays: 30,
    icon: '🎫'
  },
  {
    id: 'coupon_30_200',
    name: '30元代金券',
    type: 'voucher',
    description: '满200元可用',
    pointsCost: 1000,
    discountAmount: 30,
    minOrderAmount: 200,
    validDays: 30,
    icon: '🎫'
  },
  {
    id: 'coupon_50_500',
    name: '50元代金券',
    type: 'voucher',
    description: '满500元可用',
    pointsCost: 2000,
    discountAmount: 50,
    minOrderAmount: 500,
    validDays: 30,
    icon: '🎫'
  },
  {
    id: 'gift_100',
    name: '100元礼品券',
    type: 'gift',
    description: '无门槛使用',
    pointsCost: 8000,
    discountAmount: 100,
    minOrderAmount: 0,
    validDays: 60,
    icon: '🎁'
  },
  {
    id: 'gift_200',
    name: '200元礼品券',
    type: 'gift',
    description: '无门槛使用',
    pointsCost: 15000,
    discountAmount: 200,
    minOrderAmount: 0,
    validDays: 60,
    icon: '🎁'
  }
];

export const COUPON_TYPE_INFO = {
  voucher: {
    name: '代金券',
    icon: '🎫',
    color: '#1890ff'
  },
  gift: {
    name: '礼品券',
    icon: '🎁',
    color: '#52c41a'
  }
};

export const calculateMemberLevel = (totalExp) => {
  const roundedExp = Math.round(totalExp * 100) / 100;
  if (roundedExp >= MEMBER_LEVELS.diamond.minExp) return 'diamond';
  if (roundedExp >= MEMBER_LEVELS.gold.minExp) return 'gold';
  if (roundedExp >= MEMBER_LEVELS.silver.minExp) return 'silver';
  return 'bronze';
};

export const calculateDiscountPrice = (originalPrice, memberLevel) => {
  const level = MEMBER_LEVELS[memberLevel] || MEMBER_LEVELS.bronze;
  return Math.round(originalPrice * level.discount * 100) / 100;
};

export const calculateEarnedPoints = (spentAmount, memberLevel) => {
  const level = MEMBER_LEVELS[memberLevel] || MEMBER_LEVELS.bronze;
  return Math.floor(spentAmount * level.pointsMultiplier);
};

export const checkBadgeUnlocks = (profile) => {
  const unlockedBadges = [];
  const currentBadgeIds = profile.badges.map(b => b.id);
  
  for (const [key, badge] of Object.entries(BADGE_DEFINITIONS)) {
    if (!currentBadgeIds.includes(badge.id) && badge.condition(profile)) {
      unlockedBadges.push({
        ...badge,
        unlockedAt: new Date().toISOString()
      });
    }
  }
  
  return unlockedBadges;
};

export const createOrder = (goods, address, totalAmount, discountAmount, paidAmount) => {
  const now = new Date();
  return {
    orderId: 'ORD' + now.getTime(),
    orderTime: now.toISOString(),
    goods: goods.map(g => ({
      id: g.id,
      name: g.name,
      price: g.price,
      count: g.count,
      category: g.category,
      img: g.img
    })),
    address: address,
    originalAmount: totalAmount,
    discountAmount: discountAmount,
    paidAmount: paidAmount,
    status: 'completed'
  };
};

export const updateShoppingStats = (stats, order) => {
  const newStats = { ...stats };
  const orderDate = new Date(order.orderTime);
  const hour = orderDate.getHours();
  const day = orderDate.getDay();
  
  newStats.totalOrders += 1;
  newStats.totalGoods += order.goods.reduce((sum, g) => sum + g.count, 0);
  
  order.goods.forEach(goods => {
    const category = goods.category || '其他';
    newStats.categorySpent[category] = (newStats.categorySpent[category] || 0) + goods.price * goods.count;
  });
  
  newStats.hourDistribution[hour] = (newStats.hourDistribution[hour] || 0) + 1;
  newStats.dailyDistribution[day] = (newStats.dailyDistribution[day] || 0) + 1;
  
  return newStats;
};

export const formatExp = (exp) => {
  return Math.round(exp * 100) / 100;
};
