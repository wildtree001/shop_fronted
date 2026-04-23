<template>
  <div class="profile-page">
    <div class="profile-header">
      <button class="back-btn" @click="$router.push('/')">← 返回首页</button>
      <h2 class="page-title">个人中心</h2>
    </div>

    <div v-if="!userProfile" class="no-login">
      <p>请先登录后查看个人中心</p>
      <button class="login-btn" @click="$router.push('/login')">去登录</button>
    </div>

    <div v-else class="profile-content">
      <div class="user-card">
        <div class="user-avatar">
          <span class="avatar-text">{{ currentUser?.nickname?.charAt(0) || '用' }}</span>
        </div>
        <div class="user-info">
          <h3 class="nickname">{{ currentUser?.nickname }}</h3>
          <div class="member-level" :style="{ color: memberLevelInfo.color }">
            <span class="level-icon">{{ getLevelIcon(userProfile.memberLevel) }}</span>
            <span class="level-name">{{ memberLevelInfo.name }}会员</span>
          </div>
        </div>
        <div class="points-info">
          <div class="points-item">
            <span class="points-value">{{ userProfile.points }}</span>
            <span class="points-label">积分</span>
          </div>
          <div class="points-item">
            <span class="points-value">{{ userProfile.totalSpent.toFixed(0) }}</span>
            <span class="points-label">累计消费(元)</span>
          </div>
        </div>
      </div>

      <div class="member-progress-card">
        <h4 class="card-title">会员等级进度</h4>
        <div class="progress-info">
          <span class="current-level">{{ memberLevelInfo.name }}</span>
          <span class="exp-info">
            当前经验值：{{ userProfile.memberLevelExp }}
            <span v-if="nextLevelInfo">
              / 下一等级需 {{ nextLevelInfo.minExp }}
            </span>
          </span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercent + '%', background: memberLevelInfo.color }"
            ></div>
          </div>
          <div class="level-markers">
            <span 
              v-for="(level, key) in MEMBER_LEVELS" 
              :key="key"
              class="level-marker"
              :class="{ active: userProfile.memberLevelExp >= level.minExp }"
            >
              {{ level.name }}
            </span>
          </div>
        </div>
        <div class="member-benefits">
          <h5>当前等级权益：</h5>
          <div class="benefit-list">
            <span class="benefit-item">
              🎁 购物折扣：{{ (memberLevelInfo.discount * 10).toFixed(0) }}折
            </span>
            <span class="benefit-item">
              ⭐ 积分倍率：{{ memberLevelInfo.pointsMultiplier }}倍
            </span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <div class="action-item" @click="activeTab = 'badges'">
          <span class="action-icon">🏆</span>
          <span class="action-text">成就徽章</span>
          <span class="action-count">{{ userProfile.badges.length }}/{{ Object.keys(BADGE_DEFINITIONS).length }}</span>
        </div>
        <div class="action-item" @click="activeTab = 'mall'">
          <span class="action-icon">🛍️</span>
          <span class="action-text">积分商城</span>
          <span class="action-count">{{ userProfile.points }}积分</span>
        </div>
        <div class="action-item" @click="activeTab = 'coupons'">
          <span class="action-icon">🎫</span>
          <span class="action-text">我的券包</span>
          <span class="action-count">{{ userProfile.coupons.length }}张</span>
        </div>
        <div class="action-item" @click="activeTab = 'dashboard'">
          <span class="action-icon">📊</span>
          <span class="action-text">数据大屏</span>
          <span class="action-count">查看</span>
        </div>
        <div class="action-item" @click="activeTab = 'orders'">
          <span class="action-icon">📋</span>
          <span class="action-text">订单记录</span>
          <span class="action-count">{{ userProfile.orders.length }}笔</span>
        </div>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'badges'" class="badges-section">
          <h4 class="section-title">成就徽章</h4>
          <div class="badges-grid">
            <div 
              v-for="(badge, key) in BADGE_DEFINITIONS" 
              :key="key"
              class="badge-card"
              :class="{ locked: !isBadgeUnlocked(badge.id) }"
            >
              <div class="badge-icon" :style="getBadgeStyle(badge)">
                <span v-if="isBadgeUnlocked(badge.id)">{{ badge.icon }}</span>
                <span v-else>🔒</span>
              </div>
              <div class="badge-info">
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-desc">{{ badge.description }}</span>
                <span class="badge-rarity" :style="getRarityStyle(badge.rarity)">
                  {{ RARITY_INFO[badge.rarity].name }}
                </span>
              </div>
              <div v-if="isBadgeUnlocked(badge.id)" class="unlock-time">
                解锁于：{{ formatBadgeUnlockTime(badge.id) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'mall'" class="mall-section">
          <h4 class="section-title">积分商城</h4>
          <div class="mall-header">
            <span class="current-points">当前积分：<strong>{{ userProfile.points }}</strong></span>
          </div>
          <div class="coupons-grid">
            <div 
              v-for="coupon in COUPON_DEFINITIONS" 
              :key="coupon.id"
              class="coupon-card"
            >
              <div class="coupon-left">
                <span class="coupon-icon">{{ coupon.icon }}</span>
                <span class="coupon-value">¥{{ coupon.discountAmount }}</span>
              </div>
              <div class="coupon-middle">
                <span class="coupon-name">{{ coupon.name }}</span>
                <span class="coupon-desc">{{ coupon.description }}</span>
                <span class="coupon-valid">有效期{{ coupon.validDays }}天</span>
              </div>
              <div class="coupon-right">
                <button 
                  class="exchange-btn" 
                  :disabled="userProfile.points < coupon.pointsCost"
                  @click="exchangeCoupon(coupon)"
                >
                  {{ coupon.pointsCost }}积分兑换
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'coupons'" class="coupons-section">
          <h4 class="section-title">我的券包</h4>
          <div v-if="userProfile.coupons.length === 0" class="empty-tip">
            暂无可用优惠券，快去积分商城兑换吧～
          </div>
          <div v-else class="my-coupons-grid">
            <div 
              v-for="(coupon, index) in userProfile.coupons" 
              :key="index"
              class="my-coupon-card"
            >
              <div class="my-coupon-left">
                <span class="my-coupon-value">¥{{ coupon.discountAmount }}</span>
                <span class="my-coupon-name">{{ coupon.name }}</span>
              </div>
              <div class="my-coupon-right">
                <span class="my-coupon-desc">{{ coupon.description }}</span>
                <span class="my-coupon-valid">有效期至：{{ formatDate(coupon.validUntil) }}</span>
                <span class="my-coupon-status">未使用</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'dashboard'" class="dashboard-section">
          <h4 class="section-title">数据大屏</h4>
          <div class="dashboard-stats">
            <div class="stat-card">
              <span class="stat-value">{{ userProfile.shoppingStats.totalOrders }}</span>
              <span class="stat-label">总订单数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ userProfile.shoppingStats.totalGoods }}</span>
              <span class="stat-label">购买商品数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ userProfile.totalSpent.toFixed(0) }}</span>
              <span class="stat-label">累计消费(元)</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ userProfile.badges.length }}</span>
              <span class="stat-label">获得徽章数</span>
            </div>
          </div>
          
          <div class="charts-container">
            <div class="chart-card">
              <h5>消费趋势图</h5>
              <div ref="trendChartRef" class="chart"></div>
            </div>
            <div class="chart-card">
              <h5>商品类目占比</h5>
              <div ref="categoryChartRef" class="chart"></div>
            </div>
            <div class="chart-card full-width">
              <h5>购物时段热力图</h5>
              <div ref="heatmapChartRef" class="chart heatmap-chart"></div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'orders'" class="orders-section">
          <h4 class="section-title">订单记录</h4>
          <div v-if="userProfile.orders.length === 0" class="empty-tip">
            暂无订单记录，快去购物吧～
          </div>
          <div v-else class="orders-list">
            <div 
              v-for="order in sortedOrders" 
              :key="order.orderId"
              class="order-card"
            >
              <div class="order-header">
                <span class="order-id">订单号：{{ order.orderId }}</span>
                <span class="order-time">{{ formatDate(order.orderTime) }}</span>
                <span class="order-status">已完成</span>
              </div>
              <div class="order-goods">
                <div 
                  v-for="goods in order.goods" 
                  :key="goods.id"
                  class="order-goods-item"
                >
                  <img :src="goods.img" :alt="goods.name" class="goods-img">
                  <div class="goods-info">
                    <span class="goods-name">{{ goods.name }}</span>
                    <span class="goods-spec">数量：{{ goods.count }} | 单价：¥{{ goods.price }}</span>
                  </div>
                </div>
              </div>
              <div class="order-footer">
                <div class="order-amount">
                  <span>原价：¥{{ order.originalAmount.toFixed(2) }}</span>
                  <span v-if="order.discountAmount > 0">优惠：-¥{{ order.discountAmount.toFixed(2) }}</span>
                  <span class="paid-amount">实付：¥{{ order.paidAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { getCurrentUser } from '../data/user.js';
import { 
  getOrCreateUserProfile, 
  updateUserProfile,
  MEMBER_LEVELS,
  BADGE_DEFINITIONS,
  RARITY_INFO,
  COUPON_DEFINITIONS
} from '../data/userProfile.js';

const router = useRouter();
const currentUser = ref(null);
const userProfile = ref(null);
const activeTab = ref('badges');

const trendChartRef = ref(null);
const categoryChartRef = ref(null);
const heatmapChartRef = ref(null);

let trendChart = null;
let categoryChart = null;
let heatmapChart = null;

const memberLevelInfo = computed(() => {
  if (!userProfile.value) return MEMBER_LEVELS.bronze;
  return MEMBER_LEVELS[userProfile.value.memberLevel] || MEMBER_LEVELS.bronze;
});

const nextLevelInfo = computed(() => {
  if (!userProfile.value) return null;
  const levels = ['bronze', 'silver', 'gold', 'diamond'];
  const currentIndex = levels.indexOf(userProfile.value.memberLevel);
  if (currentIndex < levels.length - 1) {
    return MEMBER_LEVELS[levels[currentIndex + 1]];
  }
  return null;
});

const progressPercent = computed(() => {
  if (!userProfile.value || !nextLevelInfo.value) return 100;
  const currentExp = userProfile.value.memberLevelExp;
  const currentLevelMin = memberLevelInfo.value.minExp;
  const nextLevelMin = nextLevelInfo.value.minExp;
  
  if (currentExp >= nextLevelMin) return 100;
  const progress = ((currentExp - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
  return Math.min(Math.max(progress, 0), 100);
});

const sortedOrders = computed(() => {
  if (!userProfile.value) return [];
  return [...userProfile.value.orders].sort((a, b) => 
    new Date(b.orderTime) - new Date(a.orderTime)
  );
});

onMounted(() => {
  currentUser.value = getCurrentUser();
  if (currentUser.value) {
    userProfile.value = getOrCreateUserProfile();
  }
});

watch(activeTab, (newTab) => {
  if (newTab === 'dashboard') {
    nextTick(() => {
      initCharts();
    });
  }
});

const getLevelIcon = (level) => {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    diamond: '💎'
  };
  return icons[level] || '🥉';
};

const isBadgeUnlocked = (badgeId) => {
  if (!userProfile.value) return false;
  return userProfile.value.badges.some(b => b.id === badgeId);
};

const getBadgeStyle = (badge) => {
  const rarity = RARITY_INFO[badge.rarity];
  return {
    background: isBadgeUnlocked(badge.id) ? rarity.bgColor : '#f0f0f0',
    borderColor: isBadgeUnlocked(badge.id) ? rarity.color : '#ccc'
  };
};

const getRarityStyle = (rarity) => {
  const info = RARITY_INFO[rarity];
  return {
    color: info.color,
    background: info.bgColor
  };
};

const formatBadgeUnlockTime = (badgeId) => {
  if (!userProfile.value) return '';
  const badge = userProfile.value.badges.find(b => b.id === badgeId);
  if (!badge || !badge.unlockedAt) return '';
  return formatDate(badge.unlockedAt);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const exchangeCoupon = (coupon) => {
  if (!userProfile.value) return;
  if (userProfile.value.points < coupon.pointsCost) {
    ElMessage.warning('积分不足！');
    return;
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + coupon.validDays);

  const newCoupon = {
    ...coupon,
    redeemedAt: new Date().toISOString(),
    validUntil: validUntil.toISOString(),
    isUsed: false
  };

  userProfile.value.points -= coupon.pointsCost;
  userProfile.value.coupons.push(newCoupon);
  userProfile.value.redeemedCoupons.push(newCoupon);

  updateUserProfile(userProfile.value);
  ElMessage.success(`成功兑换【${coupon.name}】！`);
};

const initCharts = () => {
  if (!trendChartRef.value || !userProfile.value) return;

  if (trendChart) trendChart.dispose();
  if (categoryChart) categoryChart.dispose();
  if (heatmapChart) heatmapChart.dispose();

  trendChart = echarts.init(trendChartRef.value);
  categoryChart = echarts.init(categoryChartRef.value);
  heatmapChart = echarts.init(heatmapChartRef.value);

  const orders = userProfile.value.orders;
  
  const monthlyData = {};
  orders.forEach(order => {
    const date = new Date(order.orderTime);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = (monthlyData[key] || 0) + order.paidAmount;
  });

  const months = Object.keys(monthlyData).sort();
  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months.length > 0 ? months : ['暂无数据'],
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '金额(元)' },
    series: [{
      data: months.length > 0 ? months.map(m => monthlyData[m].toFixed(2)) : [0],
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#ff6700' }
    }]
  };
  trendChart.setOption(trendOption);

  const categorySpent = userProfile.value.shoppingStats.categorySpent;
  const categoryData = Object.entries(categorySpent).map(([name, value]) => ({
    name,
    value: value.toFixed(2)
  }));

  const categoryOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n¥{c}' },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: categoryData.length > 0 ? categoryData : [{ name: '暂无数据', value: 1 }]
    }]
  };
  categoryChart.setOption(categoryOption);

  const hourDist = userProfile.value.shoppingStats.hourDistribution;
  const dayDist = userProfile.value.shoppingStats.dailyDistribution;
  
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  const heatmapData = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const count = (hourDist[hour] || 0) + (day === new Date().getDay() ? 1 : 0);
      heatmapData.push([hour, day, count > 0 ? count : 0]);
    }
  }

  const heatmapOption = {
    tooltip: {
      position: 'top',
      formatter: (params) => `${days[params.data[1]]} ${hours[params.data[0]]}<br/>订单数: ${params.data[2]}`
    },
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] }
    },
    series: [{
      name: '购物时段',
      type: 'heatmap',
      data: heatmapData,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  };
  heatmapChart.setOption(heatmapOption);

  window.addEventListener('resize', () => {
    trendChart?.resize();
    categoryChart?.resize();
    heatmapChart?.resize();
  });
};
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 15px;
  color: #666;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.no-login {
  text-align: center;
  padding: 100px 20px;
  color: #999;
}

.login-btn {
  margin-top: 20px;
  padding: 12px 40px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 20px;
  color: #fff;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.avatar-text {
  font-size: 36px;
  font-weight: 700;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.member-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-icon {
  font-size: 20px;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
}

.points-info {
  display: flex;
  gap: 40px;
}

.points-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.points-value {
  font-size: 28px;
  font-weight: 700;
}

.points-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

.member-progress-card {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.current-level {
  font-size: 16px;
  font-weight: 600;
  color: #ff6700;
}

.exp-info {
  font-size: 14px;
  color: #666;
}

.progress-bar-container {
  margin-bottom: 15px;
}

.progress-bar {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.level-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.level-marker {
  font-size: 12px;
  color: #999;
}

.level-marker.active {
  color: #ff6700;
  font-weight: 600;
}

.member-benefits {
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.member-benefits h5 {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.benefit-list {
  display: flex;
  gap: 20px;
}

.benefit-item {
  padding: 8px 16px;
  background: #fff8f0;
  border-radius: 6px;
  color: #ff6700;
  font-size: 14px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.action-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.action-count {
  font-size: 12px;
  color: #999;
}

.tab-content {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s;
}

.badge-card.locked {
  opacity: 0.6;
}

.badge-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border-radius: 50%;
  border: 2px solid;
  margin-bottom: 12px;
}

.badge-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.badge-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.badge-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.badge-rarity {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.unlock-time {
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

.mall-header {
  margin-bottom: 20px;
}

.current-points {
  font-size: 16px;
  color: #666;
}

.current-points strong {
  color: #ff6700;
  font-size: 20px;
}

.coupons-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.coupon-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffe0e0;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 20px;
  border-right: 2px dashed #ffcccc;
  min-width: 100px;
}

.coupon-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.coupon-value {
  font-size: 28px;
  font-weight: 700;
  color: #ff4d4f;
}

.coupon-middle {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.coupon-desc {
  font-size: 14px;
  color: #666;
}

.coupon-valid {
  font-size: 12px;
  color: #999;
}

.coupon-right {
  display: flex;
  align-items: center;
}

.exchange-btn {
  padding: 12px 24px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.exchange-btn:hover:not(:disabled) {
  background: #ff8800;
}

.exchange-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.my-coupons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.my-coupon-card {
  display: flex;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffe0e0;
  border-radius: 12px;
  overflow: hidden;
}

.my-coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4d4f 100%);
  color: #fff;
  min-width: 100px;
}

.my-coupon-value {
  font-size: 32px;
  font-weight: 700;
}

.my-coupon-name {
  font-size: 12px;
  margin-top: 4px;
}

.my-coupon-right {
  flex: 1;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.my-coupon-desc {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.my-coupon-valid {
  font-size: 12px;
  color: #999;
}

.my-coupon-status {
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: #fafafa;
  padding: 20px;
  border-radius: 12px;
}

.chart-card.full-width {
  grid-column: span 2;
}

.chart-card h5 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.chart {
  height: 300px;
  width: 100%;
}

.heatmap-chart {
  height: 400px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-size: 14px;
  color: #666;
}

.order-time {
  font-size: 14px;
  color: #999;
}

.order-status {
  margin-left: auto;
  padding: 4px 12px;
  background: #f6ffed;
  color: #52c41a;
  border-radius: 4px;
  font-size: 12px;
}

.order-goods {
  padding: 15px 20px;
}

.order-goods-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-goods-item:last-child {
  border-bottom: none;
}

.order-goods-item .goods-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 15px;
}

.order-goods-item .goods-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-goods-item .goods-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-goods-item .goods-spec {
  font-size: 12px;
  color: #999;
}

.order-footer {
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid #eee;
}

.order-amount {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
}

.order-amount span {
  font-size: 14px;
  color: #666;
}

.order-amount .paid-amount {
  font-size: 16px;
  font-weight: 700;
  color: #ff6700;
}

@media (max-width: 767px) {
  .user-card {
    flex-direction: column;
    text-align: center;
  }

  .user-avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .points-info {
    margin-top: 20px;
    gap: 30px;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .coupon-card {
    flex-direction: column;
    text-align: center;
  }

  .coupon-left {
    border-right: none;
    border-bottom: 2px dashed #ffcccc;
    padding-right: 0;
    padding-bottom: 15px;
    min-width: auto;
  }

  .coupon-middle {
    padding: 15px 0;
  }

  .my-coupons-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart-card.full-width {
    grid-column: span 1;
  }

  .order-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .order-status {
    margin-left: 0;
  }
}
</style>
