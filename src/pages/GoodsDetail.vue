<template>
  <div class="goods-detail-page">
    <!-- 顶部导航（带Logo+返回按钮） -->
    <header class="detail-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <div class="logo-container">
        <img src="/assets/logo.png" alt="康康商城Logo" class="logo-img">
        <h2 class="logo-text">商品详情</h2>
      </div>
      <div class="empty"></div> <!-- 占位 -->
    </header>

    <!-- 商品详情主体 -->
    <div class="detail-content" v-if="goods">
      <!-- 商品图片展示 -->
      <div class="goods-banner">
        <img :src="goods.img" :alt="goods.name" class="banner-img">
      </div>

      <!-- 商品基本信息 -->
      <div class="goods-info">
        <h1 class="goods-name">{{ goods.name }}</h1>
        <div class="goods-price">¥{{ goods.price }}.00</div>
        <div class="goods-category">分类：{{ goods.category }}</div>
        <div class="goods-stock">库存：{{ goods.stock }}件</div>
        <div class="goods-desc">
          <h3>商品描述</h3>
          <p>{{ goods.desc || '暂无商品描述' }}</p>
        </div>

        <!-- 评分统计 -->
        <div class="rating-section" v-if="reviews.length > 0">
          <h3>评分统计</h3>
          <div class="rating-summary">
            <span class="avg-rating">{{ avgRating > 0 ? avgRating : '暂无' }}</span>
            <span class="rating-stars">
              <span 
                v-for="i in 5" 
                :key="i"
                :class="{ active: i <= avgRating }"
              >★</span>
            </span>
            <span class="review-count">({{ reviews.length }}条评价)</span>
          </div>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-section">
          <h3>用户评价</h3>
          <div v-if="reviews.length === 0" class="empty-reviews">
            暂无评价，快来抢首评吧！
          </div>
          <div v-else class="reviews-list">
            <div class="review-item" v-for="review in reviews" :key="review.id">
              <div class="review-header">
                <div class="user-info">
                  <span class="nickname">{{ review.nickname }}</span>
                  <span class="review-rating">
                    <span 
                      v-for="i in 5" 
                      :key="i"
                      :class="{ active: i <= review.rating }"
                    >★</span>
                  </span>
                </div>
                <div class="review-time">{{ formatTime(review.createTime) }}</div>
              </div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加入购物车按钮（复用登录校验逻辑） -->
      <div class="action-btn">
        <button 
          class="add-cart-btn" 
          @click="addToCart(goods)"
          :class="{ disabled: !currentUser }"
          :disabled="!currentUser"
        >
          {{ currentUser ? '加入购物车' : '请先登录' }}
        </button>
      </div>
    </div>

    <!-- 商品不存在提示 -->
    <div class="empty-tip" v-else>
      该商品不存在或已下架～
      <button class="go-home-btn" @click="$router.push('/')">返回首页</button>
    </div>

    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { goodsList } from '../data/goods.js'; // 导入商品列表
import { useCartStore } from '../store/cart.js'; // 购物车仓库
import { getCurrentUser } from '../data/user.js'; // 用户登录状态
import { says } from '../data/says.js'; // 导入商品说法列表
import { getReviewsByGoodsId, getAverageRating } from '../data/review.js'; // 导入评价相关函数

// 初始化数据
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const goods = ref(null); // 当前商品详情
const currentUser = ref(null); // 当前登录用户
const reviews = ref([]); // 评价列表
const avgRating = ref(0); // 平均评分

// 页面加载时获取商品详情
onMounted(() => {
  // 获取登录状态
  currentUser.value = getCurrentUser();
  // 获取路由参数中的商品ID
  const goodsId = Number(route.params.id);
  // 根据ID查找商品
  const targetGoods = goodsList.find(item => item.id === goodsId);
  if (targetGoods) {
    goods.value = targetGoods;
    // 加载评价数据
    reviews.value = getReviewsByGoodsId(goodsId);
    avgRating.value = getAverageRating(goodsId);
  }
});

// 加入购物车方法（和首页逻辑一致）
const addToCart = (goodsItem) => {
  if (!currentUser.value) {
    ElMessage.warning("请先登录后再加入购物车～");
    router.push('/login');
    return;
  }
  cartStore.addGoods(goodsItem);
  cartStore.loadUserCart();
  cartStore.$patch({});
  ElMessage.success(`已将【${goodsItem.name}】加入购物车`);
};

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleString('zh-CN');
};
</script>

<style scoped>
.goods-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 10px;
  background: #fff;
}

/* 顶部导航 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #333;
  flex-shrink: 0;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 4px;
}
.logo-text {
  font-size: 20px;
  color: #ff6700;
  font-weight: 700;
  margin: 0;
}
.empty {
  flex-grow: 1;
}

/* 商品详情主体 */
.detail-content {
  padding: 0 10px;
}
.goods-banner {
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
}
.banner-img {
  width: 100%;
  max-width: 600px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 商品信息 */
.goods-info {
  margin-bottom: 30px;
}
.goods-name {
  font-size: 24px;
  color: #333;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.4;
}
.goods-price {
  font-size: 28px;
  color: #ff6700;
  font-weight: 700;
  margin-bottom: 10px;
}
.goods-category, .goods-stock {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}
.goods-desc {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}
.goods-desc h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}
.goods-desc p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* 评分统计 */
.rating-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.rating-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avg-rating {
  font-size: 24px;
  font-weight: 700;
  color: #ff6700;
}

.rating-stars {
  font-size: 18px;
}

.rating-stars span {
  color: #ddd;
}

.rating-stars span.active {
  color: #ffc107;
}

.review-count {
  font-size: 14px;
  color: #999;
}

/* 评价列表 */
.reviews-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.reviews-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.empty-reviews {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-header .user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-header .nickname {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.review-header .review-rating {
  font-size: 14px;
}

.review-header .review-rating span {
  color: #ddd;
}

.review-header .review-rating span.active {
  color: #ffc107;
}

.review-header .review-time {
  font-size: 12px;
  color: #999;
}

.review-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 操作按钮 */
.action-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 99;
}
.add-cart-btn {
  width: 100%;
  height: 50px;
  background: #ff6700;
  color: #fff;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-cart-btn.disabled {
  background: #ccc !important;
  cursor: not-allowed;
}
.add-cart-btn:hover:not(.disabled) {
  background: #ff8800;
}

/* 空提示 */
.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 18px;
}
.go-home-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .logo-img {
    width: 28px;
    height: 28px;
  }
  .logo-text {
    font-size: 16px;
  }
  .goods-name {
    font-size: 20px;
  }
  .goods-price {
    font-size: 24px;
  }
  .goods-category, .goods-stock {
    font-size: 14px;
  }
  .goods-desc p {
    font-size: 14px;
  }
  .add-cart-btn {
    height: 44px;
    font-size: 16px;
  }
}
</style>