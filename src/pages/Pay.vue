<template>
  <div class="pay-page">
    <!-- 顶部返回+标题 -->
    <div class="pay-header">
      <button class="back-btn" @click="$router.push('/checkout')">← 返回结算页</button>
      <h2 class="pay-title">订单支付</h2>
    </div>

    <!-- 会员权益提示 -->
    <div v-if="userProfile" class="member-benefit-card">
      <div class="member-info">
        <span class="level-icon">{{ getLevelIcon(userProfile.memberLevel) }}</span>
        <span class="level-name">{{ memberLevelInfo.name }}会员</span>
        <span class="benefit-tag">享{{ (memberLevelInfo.discount * 10).toFixed(0) }}折优惠</span>
        <span class="benefit-tag">积分{{ memberLevelInfo.pointsMultiplier }}倍</span>
      </div>
      <div class="points-info">
        <span>当前积分：{{ userProfile.points }}</span>
      </div>
    </div>

    <!-- 收货地址展示区 -->
    <div class="address-section">
      <div class="section-title">收货地址</div>
      <div class="address-card">
        <div class="address-header">
          <span class="username">{{ currentAddress.username }}</span>
          <span class="phone">{{ currentAddress.phone }}</span>
        </div>
        <div class="address-detail">{{ currentAddress.province }} {{ currentAddress.city }} {{ currentAddress.detail }}</div>
      </div>
    </div>

    <!-- 订单信息区 -->
    <div class="order-info">
      <h3 class="order-title">待支付商品</h3>
      <!-- 商品清单 -->
      <div class="goods-list">
        <div class="goods-item" v-for="goods in payGoodsList" :key="goods.id">
          <img :src="goods.img" alt="商品图" class="goods-img">
          <div class="goods-info">
            <div class="goods-name">{{ goods.name }}</div>
            <div class="goods-price">单价：¥{{ goods.price }}</div>
            <div class="goods-count">数量：{{ goods.count }}</div>
          </div>
          <div class="goods-total">¥{{ (goods.price * goods.count).toFixed(2) }}</div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="pay-method">
        <h3 class="method-title">支付方式</h3>
        <div class="method-list">
          <div 
            class="method-item" 
            v-for="method in payMethods" 
            :key="method.value"
            :class="{ active: selectedPayMethod === method.value }"
            @click="selectedPayMethod = method.value"
          >
            <img :src="method.icon" alt="支付图标" class="method-icon">
            <span class="method-name">{{ method.label }}</span>
          </div>
        </div>
      </div>

      <!-- 优惠券选择 -->
      <div v-if="availableCoupons.length > 0" class="coupon-section">
        <h3 class="method-title">选择优惠券</h3>
        <div class="coupon-list">
          <div 
            class="coupon-item" 
            :class="{ active: selectedCouponIndex === -1 }"
            @click="selectedCouponIndex = -1"
          >
            <span class="no-coupon">不使用优惠券</span>
          </div>
          <div 
            v-for="(coupon, index) in availableCoupons" 
            :key="index"
            class="coupon-item"
            :class="{ active: selectedCouponIndex === index, disabled: !isCouponApplicable(coupon) }"
            @click="isCouponApplicable(coupon) && (selectedCouponIndex = index)"
          >
            <div class="coupon-value">¥{{ coupon.discountAmount }}</div>
            <div class="coupon-desc">
              <span class="coupon-name">{{ coupon.name }}</span>
              <span class="coupon-condition">{{ coupon.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单总价 -->
      <div class="order-total-section">
        <div class="total-row">
          <span class="total-label">商品总价：</span>
          <span class="total-value">¥{{ originalPrice.toFixed(2) }}</span>
        </div>
        <div v-if="memberDiscount > 0" class="total-row discount">
          <span class="total-label">会员折扣：</span>
          <span class="total-value">-¥{{ memberDiscount.toFixed(2) }}</span>
        </div>
        <div v-if="couponDiscount > 0" class="total-row discount">
          <span class="total-label">优惠券优惠：</span>
          <span class="total-value">-¥{{ couponDiscount.toFixed(2) }}</span>
        </div>
        <div class="total-row final">
          <span class="total-label">实付金额：</span>
          <span class="total-price">¥{{ finalPrice.toFixed(2) }}</span>
        </div>
        <div v-if="userProfile" class="points-earn">
          <span>本次购买将获得 <strong>{{ earnedPoints }}</strong> 积分</span>
        </div>
      </div>
    </div>

    <!-- 支付操作区 -->
    <div class="pay-actions">
      <div class="password-input">
        <label>支付密码：</label>
        <input 
          v-model="payPassword" 
          type="password" 
          placeholder="请输入6位支付密码"
          maxlength="6"
        >
      </div>
      <div class="btn-group">
        <button class="cancel-btn" @click="$router.push('/checkout')">取消支付</button>
        <button class="pay-btn" @click="handlePay" :disabled="!payPassword || payPassword.length !== 6 || isPaying">
          {{ isPaying ? '支付中...' : '确认支付' }}
        </button>
      </div>
    </div>

    <!-- 支付结果弹窗 -->
    <div class="modal-mask" v-if="showModal">
      <div class="modal-content">
        <img :src="payResult.icon" alt="结果图标" class="result-icon">
        <div class="result-text">{{ payResult.text }}</div>
        <div v-if="payResult.type === 'success' && newBadges.length > 0" class="new-badges">
          <p>🎉 恭喜解锁新成就！</p>
          <div class="badge-list">
            <div v-for="badge in newBadges" :key="badge.id" class="new-badge-item">
              <span class="badge-icon">{{ badge.icon }}</span>
              <span class="badge-name">{{ badge.name }}</span>
              <span class="badge-rarity" :style="getRarityStyle(badge.rarity)">{{ RARITY_INFO[badge.rarity].name }}</span>
            </div>
          </div>
        </div>
        <button class="result-btn" @click="handleModalClose">
          {{ payResult.type === 'success' ? '返回首页' : '重新支付' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. 导入核心依赖
import { useCartStore } from '../store/cart.js'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  getOrCreateUserProfile, 
  updateUserProfile,
  MEMBER_LEVELS,
  RARITY_INFO,
  calculateMemberLevel,
  calculateDiscountPrice,
  calculateEarnedPoints,
  checkBadgeUnlocks,
  createOrder,
  updateShoppingStats
} from '../data/userProfile.js'

// 2. 初始化实例
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

// 3. 响应式变量
const selectedPayMethod = ref('wechat')
const payPassword = ref('')
const showModal = ref(false)
const payResult = ref({ type: '', text: '', icon: '' })
const isPaying = ref(false)
const userProfile = ref(null)
const selectedCouponIndex = ref(-1)
const newBadges = ref([])

// 4. 地址数据
const addressList = ref([
  {
    id: 1,
    username: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    detail: '朝阳区某某小区1号楼1单元101'
  },
  {
    id: 2,
    username: '张三',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    detail: '浦东新区某某路888号'
  }
])
const currentAddress = ref({})

// 5. 支付方式列表
const payMethods = ref([
  {
    label: '微信支付',
    value: 'wechat',
    icon: 'https://img.icons8.com/fluency/48/000000/wechat.png'
  },
  {
    label: '支付宝',
    value: 'alipay',
    icon: 'https://img.icons8.com/fluency/48/000000/alipay.png'
  },
  {
    label: '银行卡支付',
    value: 'bank',
    icon: 'https://img.icons8.com/fluency/48/000000/credit-card.png'
  }
])

// 6. 待支付商品列表
const payGoodsList = ref([])

onMounted(() => {
  userProfile.value = getOrCreateUserProfile()
  
  const selectedIds = route.query.selectedIds?.split(',') || []
  const addressId = Number(route.query.addressId) || 1

  if (selectedIds.length === 0) {
    ElMessage.warning('未选择支付商品，返回结算页')
    router.push('/checkout')
    return
  }

  payGoodsList.value = cartStore.goodsList.filter(goods => selectedIds.includes(goods.id.toString()))
  if (payGoodsList.value.length === 0) {
    ElMessage.warning('商品已失效，返回结算页')
    router.push('/checkout')
    return
  }

  currentAddress.value = addressList.value.find(item => item.id === addressId) || addressList.value[0]
})

// 7. 计算相关
const memberLevelInfo = computed(() => {
  if (!userProfile.value) return MEMBER_LEVELS.bronze
  return MEMBER_LEVELS[userProfile.value.memberLevel] || MEMBER_LEVELS.bronze
})

const availableCoupons = computed(() => {
  if (!userProfile.value) return []
  return userProfile.value.coupons.filter(c => !c.isUsed)
})

const selectedCoupon = computed(() => {
  if (selectedCouponIndex.value < 0 || !availableCoupons.value[selectedCouponIndex.value]) {
    return null
  }
  return availableCoupons.value[selectedCouponIndex.value]
})

const originalPrice = computed(() => {
  return payGoodsList.value.reduce((sum, item) => sum + item.price * item.count, 0)
})

const memberDiscount = computed(() => {
  if (!userProfile.value) return 0
  const discounted = calculateDiscountPrice(originalPrice.value, userProfile.value.memberLevel)
  return originalPrice.value - discounted
})

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (originalPrice.value - memberDiscount.value >= selectedCoupon.value.minOrderAmount) {
    return selectedCoupon.value.discountAmount
  }
  return 0
})

const finalPrice = computed(() => {
  return Math.max(0, originalPrice.value - memberDiscount.value - couponDiscount.value)
})

const earnedPoints = computed(() => {
  if (!userProfile.value) return 0
  return calculateEarnedPoints(finalPrice.value, userProfile.value.memberLevel)
})

const isCouponApplicable = (coupon) => {
  const priceAfterMemberDiscount = originalPrice.value - memberDiscount.value
  return priceAfterMemberDiscount >= coupon.minOrderAmount
}

const getLevelIcon = (level) => {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    diamond: '💎'
  };
  return icons[level] || '🥉';
}

const getRarityStyle = (rarity) => {
  const info = RARITY_INFO[rarity];
  return {
    color: info.color,
    background: info.bgColor
  };
}

// 8. 处理支付逻辑
const handlePay = () => {
  if (payPassword.value !== '123456') {
    payResult.value = {
      type: 'fail',
      text: '支付失败！支付密码错误（正确密码：123456）',
      icon: 'https://img.icons8.com/fluency/48/ff0000/error.png'
    }
    showModal.value = true
    return
  }

  isPaying.value = true

  setTimeout(() => {
    if (userProfile.value) {
      const order = createOrder(
        payGoodsList.value,
        currentAddress.value,
        originalPrice.value,
        memberDiscount.value + couponDiscount.value,
        finalPrice.value
      )

      userProfile.value.orders.push(order)
      userProfile.value.totalSpent += finalPrice.value
      userProfile.value.points += earnedPoints.value
      userProfile.value.memberLevelExp += finalPrice.value
      userProfile.value.memberLevel = calculateMemberLevel(userProfile.value.memberLevelExp)
      userProfile.value.shoppingStats = updateShoppingStats(userProfile.value.shoppingStats, order)

      if (selectedCoupon.value) {
        const couponIndex = userProfile.value.coupons.findIndex(c => 
          c.redeemedAt === selectedCoupon.value.redeemedAt && !c.isUsed
        )
        if (couponIndex >= 0) {
          userProfile.value.coupons[couponIndex].isUsed = true
          userProfile.value.coupons[couponIndex].usedAt = new Date().toISOString()
        }
      }

      newBadges.value = checkBadgeUnlocks(userProfile.value)
      if (newBadges.value.length > 0) {
        userProfile.value.badges.push(...newBadges.value)
      }

      updateUserProfile(userProfile.value)
    }

    const payGoodsIds = payGoodsList.value.map(item => item.id)
    cartStore.goodsList = cartStore.goodsList.filter(goods => !payGoodsIds.includes(goods.id))

    isPaying.value = false
    
    let successText = '支付成功！感谢您的购买'
    if (newBadges.value.length > 0) {
      successText += `\n🎉 解锁了 ${newBadges.value.length} 个新成就！`
    }
    
    payResult.value = {
      type: 'success',
      text: successText,
      icon: 'https://img.icons8.com/fluency/48/00ff00/checkmark.png'
    }
    showModal.value = true
  }, 1000)
}

// 9. 处理弹窗关闭
const handleModalClose = () => {
  showModal.value = false
  if (payResult.value.type === 'success') {
    router.push('/')
  } else {
    payPassword.value = ''
  }
}
</script>

<style scoped>
.pay-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.pay-header {
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

.pay-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.member-benefit-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.level-icon {
  font-size: 24px;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
}

.benefit-tag {
  padding: 4px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  font-size: 13px;
}

.points-info {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.9;
}

.address-section {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.address-card {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
}

.address-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.username {
  font-weight: 600;
}

.phone {
  color: #666;
}

.address-detail {
  color: #666;
  line-height: 1.4;
}

.order-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.order-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.goods-list {
  margin-bottom: 20px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price, .goods-count {
  font-size: 12px;
  color: #999;
  margin-bottom: 3px;
}

.goods-total {
  font-size: 14px;
  color: #ff6700;
  font-weight: 700;
}

.pay-method {
  margin-bottom: 20px;
}

.method-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.method-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-item.active {
  border-color: #ff6700;
  background: #fff8f0;
}

.method-icon {
  width: 24px;
  height: 24px;
}

.method-name {
  font-size: 14px;
  color: #333;
}

.coupon-section {
  margin-bottom: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.coupon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.coupon-item.active {
  border-color: #ff6700;
  background: #fff8f0;
  box-shadow: 0 2px 8px rgba(255,103,0,0.2);
}

.coupon-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-coupon {
  font-size: 14px;
  color: #666;
}

.coupon-value {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
  margin-right: 12px;
  padding-right: 12px;
  border-right: 2px dashed #ffcccc;
}

.coupon-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.coupon-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.coupon-condition {
  font-size: 12px;
  color: #999;
}

.order-total-section {
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.total-row.discount {
  color: #52c41a;
}

.total-row.final {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.total-label {
  font-size: 15px;
  color: #666;
  margin-right: 10px;
}

.total-value {
  font-size: 15px;
  color: #333;
}

.total-price {
  font-size: 22px;
  color: #ff6700;
  font-weight: 700;
}

.points-earn {
  text-align: right;
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.points-earn strong {
  color: #ff6700;
  font-size: 16px;
}

.pay-actions {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.password-input {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-input label {
  font-size: 15px;
  color: #333;
  margin-right: 10px;
}

.password-input input {
  width: 200px;
  height: 40px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0 15px;
  outline: none;
  font-size: 16px;
  letter-spacing: 4px;
}

.password-input input:focus {
  border-color: #ff6700;
}

.btn-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.cancel-btn, .pay-btn {
  width: 150px;
  height: 44px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  border: none;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.pay-btn {
  background: #ff6700;
  color: #fff;
  font-weight: 600;
}

.pay-btn:hover:not(:disabled) {
  background: #ff8800;
}

.pay-btn:disabled {
  background: #ffb088;
  cursor: not-allowed;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  width: 360px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.result-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 15px;
}

.result-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.6;
  white-space: pre-line;
}

.new-badges {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff8f0;
  border-radius: 8px;
}

.new-badges p {
  font-size: 14px;
  color: #ff6700;
  margin-bottom: 10px;
  font-weight: 600;
}

.badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.new-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  min-width: 80px;
}

.new-badge-item .badge-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.new-badge-item .badge-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
}

.new-badge-item .badge-rarity {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.result-btn {
  width: 150px;
  height: 44px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.3s;
}

.result-btn:hover {
  background: #ff8800;
}

@media (max-width: 767px) {
  .method-list {
    flex-wrap: wrap;
  }
  
  .method-item {
    flex: 1;
    min-width: 100px;
  }
  
  .btn-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .cancel-btn, .pay-btn {
    width: 100%;
  }
  
  .password-input {
    flex-direction: column;
    gap: 10px;
  }
  
  .coupon-list {
    flex-direction: column;
  }
  
  .member-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
