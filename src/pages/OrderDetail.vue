<template>
  <div class="order-detail-page">
    <header class="header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h2 class="page-title">订单详情</h2>
    </header>

    <div v-if="order" class="detail-container">
      <div class="order-status-section">
        <div class="status-icon">✓</div>
        <div class="status-info">
          <div class="status-text">支付成功</div>
          <div class="status-desc">感谢您的购买，订单已支付成功</div>
        </div>
      </div>

      <div class="address-section">
        <div class="section-title">收货地址</div>
        <div class="address-card">
          <div class="address-header">
            <span class="username">{{ order.address.username }}</span>
            <span class="phone">{{ order.address.phone }}</span>
          </div>
          <div class="address-detail">
            {{ order.address.province }} {{ order.address.city }} {{ order.address.detail }}
          </div>
        </div>
      </div>

      <div class="goods-section">
        <div class="section-title">商品清单</div>
        <div class="goods-list">
          <div 
            class="goods-item" 
            v-for="goods in order.goodsList" 
            :key="goods.id"
          >
            <div class="goods-info-row">
              <router-link :to="`/goods/${goods.id}`" class="goods-link">
                <img :src="goods.img" :alt="goods.name" class="goods-img">
              </router-link>
              <div class="goods-info">
                <router-link :to="`/goods/${goods.id}`" class="goods-name-link">
                  <div class="goods-name">{{ goods.name }}</div>
                </router-link>
                <div class="goods-price">¥{{ goods.price }}</div>
                <div class="goods-count">x{{ goods.count }}</div>
              </div>
              <div class="goods-subtotal">
                ¥{{ (goods.price * goods.count).toFixed(2) }}
              </div>
            </div>
            <div class="goods-action" v-if="!goods.hasReviewed">
              <button 
                class="review-btn" 
                @click="goToReview(order.orderNo, goods)"
              >
                去评价
              </button>
            </div>
            <div class="goods-action" v-else>
              <span class="reviewed-tag">已评价</span>
            </div>
          </div>
        </div>
      </div>

      <div class="order-info-section">
        <div class="section-title">订单信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span class="value">{{ formatTime(order.createTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ getPayMethodText(order.payMethod) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态：</span>
            <span class="value status-paid">已支付</span>
          </div>
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-item">
          <span class="label">商品总价：</span>
          <span class="value">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span class="label">优惠金额：</span>
          <span class="value discount">¥0.00</span>
        </div>
        <div class="amount-item total">
          <span class="label">实付金额：</span>
          <span class="value total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="action-section">
        <button class="continue-btn" @click="$router.push('/')">继续购物</button>
        <button class="center-btn" @click="$router.push('/user-center')">查看我的订单</button>
      </div>
    </div>

    <div v-else class="empty-tip">
      <div class="empty-icon">📦</div>
      <div class="empty-text">订单不存在或已被删除</div>
      <button class="go-home-btn" @click="$router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getOrderByNo } from '../data/order.js';
import { getCurrentUser } from '../data/user.js';

const route = useRoute();
const router = useRouter();
const order = ref(null);

onMounted(() => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    ElMessage.warning('请先登录！');
    router.push('/login');
    return;
  }

  const orderNo = route.params.orderNo;
  if (!orderNo) {
    ElMessage.warning('订单号不存在！');
    router.push('/user-center');
    return;
  }

  order.value = getOrderByNo(orderNo);
  if (!order.value) {
    ElMessage.warning('订单不存在！');
    router.push('/user-center');
  }
});

const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleString('zh-CN');
};

const getPayMethodText = (method) => {
  const methodMap = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'bank': '银行卡支付'
  };
  return methodMap[method] || method;
};

const goToReview = (orderNo, goods) => {
  router.push({
    path: '/review',
    query: {
      orderNo: orderNo,
      goodsId: goods.id,
      goodsName: goods.name
    }
  });
};
</script>

<style scoped>
.order-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  margin-right: 15px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-status-section {
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #52c41a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.status-text {
  font-size: 20px;
  font-weight: 700;
  color: #52c41a;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 14px;
  color: #999;
}

.address-section,
.goods-section,
.order-info-section,
.amount-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.address-card {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.address-card .address-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.address-card .username {
  font-weight: 600;
  color: #333;
}

.address-card .phone {
  color: #666;
  font-size: 14px;
}

.address-card .address-detail {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.goods-item {
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-info-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.goods-link {
  text-decoration: none;
}

.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name-link {
  text-decoration: none;
  color: inherit;
}

.goods-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-name:hover {
  color: #ff6700;
}

.goods-price {
  font-size: 14px;
  color: #ff6700;
  font-weight: 600;
}

.goods-count {
  font-size: 13px;
  color: #999;
  margin-top: 3px;
}

.goods-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  min-width: 100px;
  text-align: right;
}

.goods-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #f5f5f5;
}

.review-btn {
  padding: 6px 18px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.review-btn:hover {
  background: #ff8800;
}

.reviewed-tag {
  padding: 6px 18px;
  background: #f5f5f5;
  color: #999;
  border-radius: 4px;
  font-size: 14px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-item .label {
  width: 100px;
  color: #666;
}

.info-item .value {
  color: #333;
}

.info-item .status-paid {
  color: #52c41a;
  font-weight: 500;
}

.amount-section {
  padding: 15px 20px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.amount-item .label {
  color: #666;
}

.amount-item .value {
  color: #333;
}

.amount-item .discount {
  color: #ff6700;
}

.amount-item.total {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #f5f5f5;
}

.amount-item.total .label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.amount-item.total .total-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff6700;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.continue-btn,
.center-btn {
  padding: 12px 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.continue-btn {
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.continue-btn:hover {
  border-color: #ff6700;
  color: #ff6700;
}

.center-btn {
  background: #ff6700;
  color: #fff;
  border: none;
}

.center-btn:hover {
  background: #ff8800;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  background: #fff;
  border-radius: 8px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.go-home-btn {
  padding: 10px 30px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 767px) {
  .order-detail-page {
    padding: 10px;
  }

  .order-status-section {
    padding: 15px;
  }

  .status-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .status-text {
    font-size: 16px;
  }

  .goods-img {
    width: 60px;
    height: 60px;
  }

  .goods-name {
    font-size: 13px;
  }

  .goods-subtotal {
    min-width: 80px;
  }

  .action-section {
    flex-direction: column;
  }

  .continue-btn,
  .center-btn {
    width: 100%;
    padding: 12px;
  }
}
</style>
