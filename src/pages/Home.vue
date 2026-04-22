<template>
  <div class="home-page">
    <header class="header">
      <div class="header__left">
        <div class="logo-container">
          <img src="/assets/logo.png" alt="康康商城Logo" class="logo-img">
          <h2 class="logo-text">康康商城</h2>
        </div>
      </div>
      <div class="header__middle">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            class="search-input" 
            type="text" 
            placeholder="搜索商品"
            @keyup.enter="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
      </div>
      <div class="header__right">
        <div v-if="currentUser" class="user-info">
          <span class="nickname">欢迎：{{ currentUser.nickname }}</span>
          <span class="header__btn center-btn" @click="$router.push('/user-center')">个人中心</span>
          <span class="header__btn logout-btn" @click="handleLogout">退出登录</span>
        </div>
        <span v-else class="header__btn" @click="$router.push('/login')">登录</span>
        <span class="header__btn" @click="$router.push('/cart')">购物车({{ cartStore.totalCount }})</span>
      </div>
    </header>

    <nav class="category-nav">
      <div 
        class="category-item" 
        v-for="category in categoryList" 
        :key="category"
        :class="{ active: currentCategory === category }"
        @click="currentCategory = category"
      >
        {{ category }}
      </div>
    </nav>

    <section class="goods-section">
      <h3 class="goods-title">热门商品</h3>
      <div v-if="filterGoodsList.length === 0" class="empty-tip">
        未找到相关商品，请换个关键词试试～
      </div>
      <div class="goods-grid" v-else>
        <div 
          class="goods-card" 
          v-for="goods in filterGoodsList" 
          :key="goods.id"
        >
          <!-- 商品图片：点击跳转到详情页 -->
          <router-link :to="`/goods/${goods.id}`" class="goods-img-link">
            <img class="goods-img" :src="goods.img" :alt="goods.name">
          </router-link>
          <!-- 商品名称：点击跳转到详情页 -->
          <router-link :to="`/goods/${goods.id}`" class="goods-name-link">
            <div class="goods-name">{{ goods.name }}</div>
          </router-link>
          <div class="goods-price">¥{{ goods.price }}.00</div>
          <div 
            class="add-cart-btn" 
            @click="addToCart(goods)"
            :class="{ disabled: !currentUser }"
            :disabled="!currentUser"
          >
            {{ currentUser ? '加入购物车' : '请先登录' }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { useCartStore } from '../store/cart.js';
import { goodsList, categoryList } from '../data/goods.js';
import { ref, computed, onMounted, watch } from 'vue';
import { getCurrentUser, logoutUser } from '../data/user.js';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const currentCategory = ref("全部");
const searchKeyword = ref("");
const currentUser = ref(null);
const router = useRouter();

onMounted(() => {
  currentUser.value = getCurrentUser();
  cartStore.loadUserCart();
  
  watch(currentUser, (newUser) => {
    if(newUser){
      cartStore.loadUserCart();
    }else{
      cartStore.clearCartMemoryOnly();
    }
  }, { immediate: true, deep: true });

  watch(
    () => cartStore.goodsList,
    () => {
      cartStore.$patch({});
    },
    { deep: true }
  );
});

const filterGoodsList = computed(() => {
  let filteredByCategory = goodsList;
  if (currentCategory.value !== "全部") {
    filteredByCategory = goodsList.filter(item => item.category === currentCategory.value);
  }
  if (searchKeyword.value.trim() !== "") {
    const keyword = searchKeyword.value.trim().toLowerCase();
    filteredByCategory = filteredByCategory.filter(item => 
      item.name.toLowerCase().includes(keyword)
    );
  }
  return filteredByCategory;
});

const handleSearch = () => {
  if (searchKeyword.value.trim() === "") {
    ElMessage.warning("请输入要搜索的商品关键词～");
    return;
  }
  ElMessage.info(`正在搜索：${searchKeyword.value}`);
};

const addToCart = (goods) => {
  if (!currentUser.value) { 
    ElMessage.warning("请先登录后再加入购物车～");
    router.push('/login');
    return;
  }
  cartStore.addGoods(goods);
  cartStore.loadUserCart();
  cartStore.$patch({});
  ElMessage.success(`已将【${goods.name}】加入购物车`);
};

const handleLogout = () => {
  logoutUser();
  currentUser.value = null;
  cartStore.clearCartMemoryOnly();
  ElMessage.success("退出登录成功！");
};
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}
.logo-text {
  color: #ff6700;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nickname {
  font-size: 14px;
  color: #333;
  margin-right: 5px;
}
.logout-btn {
  color: #ff6700 !important;
}
.add-cart-btn.disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

.home-page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 5px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
  background: #fff;
  padding: 10px;
  border-bottom: 1px solid #eee;
  border-radius: 4px 4px 0 0;
  flex-wrap: wrap;
  gap: 10px;
}
.header__left {
  flex-shrink: 0;
}
.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
}
.search-input {
  flex: 1;
  height: 36px;
  border: 1px solid #eee;
  border-radius: 18px 0 0 18px;
  padding: 0 15px;
  outline: none;
  color: #333;
}
.search-input::placeholder {
  color: #999;
}
.search-btn {
  height: 36px;
  padding: 0 20px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 0 18px 18px 0;
  cursor: pointer;
  transition: background 0.2s;
}
.search-btn:hover {
  background: #ff8800;
}
.header__right {
  display: flex;
  gap: 15px;
  font-size: 14px;
  align-items: center;
}
.header__btn {
  cursor: pointer;
}
.header__btn:last-child {
  color: #ff6700;
}
.category-nav {
  display: flex;
  align-items: center;
  height: 45px;
  background: #f5f5f5;
  padding: 0 10px;
  margin-bottom: 15px;
  border-radius: 0 0 4px 4px;
  overflow-x: auto;
  white-space: nowrap;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.category-nav::-webkit-scrollbar {
  display: none;
}
.category-item {
  font-size: 15px;
  color: #333;
  margin: 0 12px;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-block;
}
.category-item.active {
  color: #ff6700;
  font-weight: 700;
}
.category-item:hover {
  color: #ff6700;
}
.goods-section {
  padding: 0 10px;
}
.goods-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  border-left: 4px solid #ff6700;
  padding-left: 10px;
  margin-bottom: 15px;
}
.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
.goods-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}
.goods-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}

/* 新增：详情页链接样式（核心） */
.goods-img-link {
  display: block; /* 让链接包裹整个图片 */
  text-decoration: none; /* 去掉链接下划线 */
}
.goods-name-link {
  text-decoration: none; /* 名称链接去掉下划线 */
  color: inherit; /* 继承原有文字颜色 */
}
/* 名称悬浮变色 */
.goods-name-link:hover .goods-name {
  color: #ff6700;
}
/* 图片悬浮缩放效果 */
.goods-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: transform 0.2s ease; /* 平滑缩放 */
}
.goods-img-link:hover .goods-img {
  transform: scale(1.02); /* 悬浮放大1.02倍 */
}

.goods-name {
  font-size: 14px;
  color: #333;
  height: 40px;
  overflow: hidden;
  margin-bottom: 8px;
  line-height: 1.4;
  transition: color 0.2s ease; /* 颜色过渡 */
}
.goods-price {
  font-size: 18px;
  color: #ff6700;
  font-weight: 700;
  margin-bottom: 10px;
}
.add-cart-btn {
  width: 100%;
  height: 40px;
  background: #ff6700;
  color: #fff;
  line-height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}
.add-cart-btn:hover {
  background: #ff8800;
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
  .goods-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .goods-img {
    height: 180px;
  }
  .goods-name {
    font-size: 13px;
    height: 36px;
  }
  .goods-price {
    font-size: 17px;
  }
  .add-cart-btn {
    height: 44px;
    line-height: 44px;
    font-size: 15px;
  }
  .search-btn {
    padding: 0 15px;
  }
  .nickname {
    font-size: 12px;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .goods-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>