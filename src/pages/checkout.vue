<template>
  <div class="checkout-page">
    <!--页面标题 + 返回按钮 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/cart')">← 返回购物车</button>
      <div class="page-title">订单结算</div>
    </div>

    <!-- 收货地址选择区 -->
    <div class="address-section">
      <div class="section-title">收货地址</div>
      <!-- 地址列表 -->
      <div class="address-list">
        <div 
          class="address-item" 
          v-for="addr in addressList" 
          :key="addr.id"
          :class="{ active: selectedAddress.id === addr.id }"
          @click="selectedAddress = addr"
        >
          <div class="address-header">
            <span class="username">{{ addr.username }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <span class="default-tag" v-if="addr.isDefault">默认</span>
          </div>
          <div class="address-detail">{{ addr.province }} {{ addr.city }} {{ addr.detail }}</div>
        </div>
      </div>
      <div v-if="addressList.length === 0" class="empty-address">
        暂无收货地址，请先添加地址
      </div>
      <!-- 新增地址按钮 -->
      <div class="add-address-btn" @click="$router.push({ path: '/user-center', query: { tab: 'address' } })">
        + 管理收货地址
      </div>
    </div>

    <div class="goods-section">
      <div class="section-title">商品清单</div>
      <div class="goods-list">
        <!-- 购物车商品列表 -->
        <div class="goods-item" v-for="goods in cartStore.goodsList" :key="goods.id">
          <img class="goods-img" :src="goods.img" :alt="goods.name">
          <div class="goods-info">
            <div class="goods-name">{{ goods.name }}</div>
            <div class="goods-price">¥{{ goods.price }}.00</div>
          </div>
          <div class="goods-count">x{{ goods.count }}</div>
        </div>
        <!-- 空购物车提示 -->
        <div class="empty-cart" v-if="cartStore.goodsList.length === 0">
          购物车为空，无法结算～
          <span class="go-cart-btn" @click="$router.push('/cart')">去加购</span>
        </div>
      </div>
    </div>

    <div class="amount-section">
      <div class="amount-item">
        <span>商品总价：</span>
        <span class="price">¥{{ cartStore.totalPrice }}.00</span>
      </div>
      <div class="amount-item">
        <span>优惠金额：</span>
        <span class="discount">¥0.00</span>
      </div>
      <div class="amount-item total">
        <span>实付金额：</span>
        <span class="total-price">¥{{ cartStore.totalPrice }}.00</span>
      </div>
    </div>

    <div class="btn-section">
      <button 
        class="submit-btn" 
        @click="submitOrder"
        :disabled="cartStore.goodsList.length === 0 || !currentUser"
      >
        提交订单
      </button>
      <button 
        class="pay-btn" 
        @click="goToPay"
        :disabled="cartStore.goodsList.length === 0 || !currentUser || !isOrderSubmitted"
      >
        去支付
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';

import { useCartStore } from '../store/cart.js';
import { getCurrentUser } from '../data/user.js';
import { getUserAddresses } from '../data/address.js';

const cartStore = useCartStore();
const router = useRouter();
const route = useRoute(); // 新增：获取路由参数
const currentUser = ref(null); // 当前登录用户
const isOrderSubmitted = ref(false); // 标记是否已提交订单

const addressList = ref([]); // 地址列表
const selectedAddress = ref({}); // 选中的地址

onMounted(() => {
  // 检查登录状态
  currentUser.value = getCurrentUser();
  if (!currentUser.value) {
    ElMessage.warning('请先登录后再结算～');
    router.push('/login');
    return;
  }
  // 加载地址数据
  addressList.value = getUserAddresses();
  if (addressList.value.length > 0) {
    // 默认选中第一个地址，优先选中默认地址
    const defaultAddr = addressList.value.find(a => a.isDefault) || addressList.value[0];
    selectedAddress.value = { ...defaultAddr };
  }
  // 加载购物车数据
  cartStore.loadUserCart();
  // 检查购物车是否为空
  if (cartStore.goodsList.length === 0) {
    ElMessage.info('购物车为空，无法结算～');
  }
});

const submitOrder = () => {
  // 二次校验
  if (!currentUser.value) {
    ElMessage.warning('请先登录！');
    router.push('/login');
    return;
  }
  if (cartStore.goodsList.length === 0) {
    ElMessage.warning('购物车为空，无法提交订单！');
    return;
  }
  if (!selectedAddress.value || !selectedAddress.value.id) {
    ElMessage.warning('请先选择或添加收货地址！');
    return;
  }

  // 模拟提交订单（实际项目对接后端接口，生成订单号）
  ElMessage.success(`订单提交成功！收货地址：${selectedAddress.value.detail}`);
  isOrderSubmitted.value = true; // 标记订单已提交，启用支付按钮
};

const goToPay = () => {
  // 收集要支付的商品ID
  const selectedIds = cartStore.goodsList.map(goods => goods.id).join(',');
  // 跳转到支付页，传递商品ID和地址ID
  router.push({
    path: '/pay',
    query: {
      selectedIds: selectedIds,
      addressId: selectedAddress.value.id // 传递选中的地址ID（支付页可展示）
    }
  });
};
</script>

<style scoped>
.checkout-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
  font-size: 14px;
  color: #333;
}
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  color: #666;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 15px 0 10px;
}

/* 收货地址样式 */
.address-section {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.address-list {
  margin-bottom: 10px;
}
.address-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.address-item.active {
  border-color: #ff6700;
  background: #fff8f0;
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
.default-tag {
  background: #ff6700;
  color: #fff;
  font-size: 12px;
  padding: 2px 5px;
  border-radius: 3px;
}
.address-detail {
  color: #666;
  line-height: 1.4;
}
.add-address-btn {
  text-align: center;
  color: #ff6700;
  padding: 8px;
  border: 1px dashed #ff6700;
  border-radius: 4px;
  cursor: pointer;
}

.empty-address {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

/* 商品清单样式 */
.goods-section {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}
.goods-info {
  flex: 1;
}
.goods-name {
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-price {
  color: #ff6700;
  font-weight: 600;
}
.goods-count {
  color: #666;
}
.empty-cart {
  text-align: center;
  padding: 30px 0;
  color: #999;
}
.go-cart-btn {
  color: #ff6700;
  cursor: pointer;
  margin-left: 5px;
}

/* 金额结算样式 */
.amount-section {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.amount-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.amount-item.total {
  font-weight: 700;
  font-size: 16px;
  border-bottom: none;
  margin-top: 5px;
}
.price {
  color: #333;
}
.discount {
  color: #ff6700;
}
.total-price {
  color: #ff6700;
  font-size: 18px;
}

/* 按钮区样式 */
.btn-section {
  display: flex;
  gap: 15px;
  text-align: center;
}
.submit-btn, .pay-btn {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
}
.submit-btn {
  background: #ff6700;
  color: #fff;
}
.pay-btn {
  background: #0088ff;
  color: #fff;
}
.submit-btn:disabled, .pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.submit-btn:hover:not(:disabled) {
  background: #ff8800;
}
.pay-btn:hover:not(:disabled) {
  background: #0066cc;
}

/* 手机端适配 */
@media (max-width: 767px) {
  .goods-img {
    width: 60px;
    height: 60px;
  }
  .submit-btn, .pay-btn {
    height: 44px;
    font-size: 15px;
  }
  .amount-item.total {
    font-size: 15px;
  }
  .total-price {
    font-size: 17px;
  }
}
</style>