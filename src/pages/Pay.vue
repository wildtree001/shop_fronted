<template>
  <div class="pay-page">
    <!-- 顶部返回+标题 -->
    <div class="pay-header">
      <button class="back-btn" @click="$router.push('/checkout')">← 返回结算页</button>
      <h2 class="pay-title">订单支付</h2>
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

      <!-- 订单总价 -->
      <div class="order-total">
        <span class="total-label">订单总价：</span>
        <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
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
        <button class="pay-btn" @click="handlePay" :disabled="!payPassword || payPassword.length !== 6">
          确认支付
        </button>
      </div>
    </div>

    <!-- 支付结果弹窗 -->
    <div class="modal-mask" v-if="showModal">
      <div class="modal-content">
        <img :src="payResult.icon" alt="结果图标" class="result-icon">
        <div class="result-text">{{ payResult.text }}</div>
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

// 2. 初始化实例
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

// 3. 响应式变量
const selectedPayMethod = ref('wechat') // 选中的支付方式
const payPassword = ref('') // 支付密码
const showModal = ref(false) // 支付结果弹窗
const payResult = ref({ type: '', text: '', icon: '' }) // 支付结果

// 4. 地址数据（和结算页保持一致）
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
const currentAddress = ref({}) // 当前选中的地址

// 5. 支付方式列表（本地图标兜底，避免网络失效）
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
  // 1. 获取结算页传递的参数
  const selectedIds = route.query.selectedIds?.split(',') || []
  const addressId = Number(route.query.addressId) || 1 // 默认地址ID

  // 2. 校验商品参数
  if (selectedIds.length === 0) {
    ElMessage.warning('未选择支付商品，返回结算页')
    router.push('/checkout')
    return
  }

  // 3. 匹配待支付商品
  payGoodsList.value = cartStore.goodsList.filter(goods => selectedIds.includes(goods.id.toString()))
  if (payGoodsList.value.length === 0) {
    ElMessage.warning('商品已失效，返回结算页')
    router.push('/checkout')
    return
  }

  // 4. 匹配收货地址
  currentAddress.value = addressList.value.find(item => item.id === addressId) || addressList.value[0]
})

// 7. 计算订单总价
const totalPrice = computed(() => {
  return payGoodsList.value.reduce((sum, item) => sum + item.price * item.count, 0)
})

// 8. 处理支付逻辑
const handlePay = () => {
  // 模拟支付验证（密码123456）
  if (payPassword.value !== '123456') {
    payResult.value = {
      type: 'fail',
      text: '支付失败！支付密码错误（正确密码：123456）',
      icon: 'https://img.icons8.com/fluency/48/ff0000/error.png'
    }
    showModal.value = true
    return
  }

  // 支付成功：删除购物车中已支付的商品
  const payGoodsIds = payGoodsList.value.map(item => item.id)
  cartStore.goodsList = cartStore.goodsList.filter(goods => !payGoodsIds.includes(goods.id))
  
  // 更新支付结果
  payResult.value = {
    type: 'success',
    text: '支付成功！感谢您的购买',
    icon: 'https://img.icons8.com/fluency/48/00ff00/checkmark.png'
  }
  showModal.value = true
}

// 9. 处理弹窗关闭
const handleModalClose = () => {
  showModal.value = false
  if (payResult.value.type === 'success') {
    // 支付成功返回首页
    router.push('/')
  } else {
    // 支付失败清空密码
    payPassword.value = ''
    console.log('密码错误');
    
  }
}
</script>

<style scoped>
/* 页面容器 */
.pay-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部返回+标题 */
.pay-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  color: #666;
}
.pay-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

/* 收货地址样式 */
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

/* 订单信息区 */
.order-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}
.order-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 商品清单 */
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

/* 支付方式 */
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
  gap: 20px;
}
.method-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
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

/* 订单总价 */
.order-total {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #eee;
}
.total-label {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}
.total-price {
  font-size: 20px;
  color: #ff6700;
  font-weight: 700;
}

/* 支付操作区 */
.pay-actions {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.password-input {
  margin-bottom: 20px;
}
.password-input label {
  font-size: 14px;
  color: #333;
  margin-right: 10px;
}
.password-input input {
  width: 200px;
  height: 36px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0 10px;
  outline: none;
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
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: none;
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
}
.pay-btn {
  background: #ff6700;
  color: #fff;
}
.pay-btn:disabled {
  background: #ffb088;
  cursor: not-allowed;
}

/* 弹窗遮罩 */
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
  z-index: 999;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  width: 300px;
}
.result-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
}
.result-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}
.result-btn {
  width: 150px;
  height: 40px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 手机端适配 */
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
}
</style>