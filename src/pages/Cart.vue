<template>
  <div class="cart-page">
    <!-- 顶部返回+标题 -->
    <div class="cart-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2 class="cart-title">我的购物车</h2>
    </div>

    <!-- 购物车表头 -->
    <div class="cart-table-header">
      <div class="col-check"><input type="checkbox" class="all-check" @change="checkAll" v-model="isAllChecked">全选</div>
      <div class="col-goods">商品</div>
      <div class="col-price">单价</div>
      <div class="col-count">数量</div>
      <div class="col-opt">操作</div>
    </div>

    <!-- 购物车商品列表（绑定Pinia仓库的goodsList） -->
    <div class="cart-list">
      <!-- 单个商品项（循环渲染仓库里的商品） -->
      <div class="cart-item" v-for="goods in cartStore.goodsList" :key="goods.id">
        <div class="col-check"><input type="checkbox" v-model="checkedGoodsIds" :value="goods.id"></div>
        <div class="col-goods">
          <img :src="goods.img" alt="商品图" class="goods-img">
          <div class="goods-name">{{ goods.name }}</div>
        </div>
        <div class="col-price">¥{{ goods.price }}</div>
        <div class="col-count">
          <button class="count-btn" @click="changeCount(goods.id, -1)" :disabled="goods.count <= 1">-</button>
          <span class="count-num">{{ goods.count }}</span>
          <button class="count-btn" @click="changeCount(goods.id, 1)">+</button>
        </div>
        <div class="col-opt">
          <button class="del-btn" @click="deleteGoods(goods.id)">删除</button>
        </div>
      </div>

      <!-- 空购物车提示（仓库无商品时显示） -->
      <div class="empty-cart" v-if="cartStore.goodsList.length === 0">
        <img src="/assets/empty-cart.png" alt="空购物车" class="empty-img">
        <div class="empty-text">购物车空空如也～快去挑选商品吧～</div>
        <button class="go-shop-btn" @click="$router.push('/')">去购物</button>
      </div>
    </div>

    <!-- 底部结算栏 -->
    <div class="cart-footer" v-if="cartStore.goodsList.length > 0">
      <div class="select-total">
        已选商品：<span class="selected-count">{{ checkedGoodsIds.length }}</span> 件
      </div>
      <div class="total-price">
        合计：<span class="price-num">¥{{ calculateTotalPrice().toFixed(2) }}</span>
      </div>
      <button class="settle-btn" :disabled="checkedGoodsIds.length === 0" @click="goToCheckout">去结算</button>
    </div>
  </div>
</template>

<script setup>
// 1. 导入核心依赖（路径务必和项目一致）
import { useCartStore } from '../store/cart.js'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '../data/user.js'

// 2. 初始化核心实例
const cartStore = useCartStore()
const router = useRouter()
const currentUser = ref(null)
const checkedGoodsIds = ref([])

// 3. 页面挂载：核心修复（仅加载一次，不重复触发响应式）
onMounted(() => {
  // 1. 获取当前登录用户（必做：匹配用户专属购物车）
  currentUser.value = getCurrentUser()
  
  // 2. 兜底加载购物车（仅仓库为空时加载，避免覆盖已有数据）
  if (cartStore.goodsList.length === 0) {
    cartStore.loadUserCart()
  }

  // 3. 监听用户状态变化：切换用户时重新加载购物车
  watch(currentUser, (newUser) => {
    if (newUser) {
      cartStore.loadUserCart()
    }
  }, { immediate: true })

  // 4. 监听购物车数据变化：仅监听，不手动patch（靠Pinia原生响应式）
  watch(
    () => cartStore.goodsList,
    (newList) => {
      console.log('购物车数据更新：', newList) // 调试用，可删除
    },
    { deep: true }
  )
})

// 4. 全选逻辑（简化，无冗余）
const isAllChecked = computed({
  get() {
    return cartStore.goodsList.length > 0 && checkedGoodsIds.value.length === cartStore.goodsList.length
  },
  set(val) {
    checkedGoodsIds.value = val ? cartStore.goodsList.map(item => item.id) : []
  }
})
const checkAll = () => {} 

// 5. 修改数量：仅调用仓库方法，不手动patch（靠cart.js自动同步）
const changeCount = (id, num) => {
  const goods = cartStore.goodsList.find(item => item.id === id)
  if (!goods) return

  const newCount = Math.max(1, goods.count + num)
  cartStore.updateGoodsCount(id, newCount) // 仓库内部已处理存储+响应式
  ElMessage.success("商品数量修改成功！")
}

// 6. 删除商品：仅调用仓库方法，自动同步本地+响应式
const deleteGoods = (id) => {
  cartStore.deleteGoods(id) // 仓库内部已处理存储+响应式
  checkedGoodsIds.value = checkedGoodsIds.value.filter(itemId => itemId !== id)
  ElMessage.success("商品已从购物车移除！")
}

// 7. 计算选中商品总价（兼容边界）
const calculateTotalPrice = () => {
  return cartStore.goodsList
    .filter(item => checkedGoodsIds.value.includes(item.id))
    .reduce((sum, item) => sum + item.price * (item.count || 1), 0)
}

// 8. 跳转结算页：登录校验+选中校验
const goToCheckout = () => {
  if (!currentUser.value) {
    ElMessage.warning('请先登录后再结算～')
    router.push('/login')
    return
  }
  if (checkedGoodsIds.value.length === 0) {
    ElMessage.warning('请选择要结算的商品～')
    return
  }
  router.push({
    path: '/checkout',
    query: { selectedIds: checkedGoodsIds.value.join(',') }
  })
}
</script>

<style scoped>
/* 页面容器 */
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部返回+标题 */
.cart-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
}
.cart-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

/* 购物车表头 */
.cart-table-header {
  display: flex;
  height: 40px;
  line-height: 40px;
  background: #f5f5f5;
  border-radius: 4px 4px 0 0;
  padding: 0 20px;
  font-size: 14px;
  color: #666;
}
.col-check {
  width: 80px;
}
.col-goods {
  flex: 1;
}
.col-price {
  width: 120px;
  text-align: center;
}
.col-count {
  width: 150px;
  text-align: center;
}
.col-opt {
  width: 100px;
  text-align: center;
}

/* 购物车列表 */
.cart-list {
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 4px 4px;
  padding: 20px;
}

/* 单个商品项 */
.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}
.cart-item:last-child {
  border-bottom: none;
}
.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}
.goods-name {
  font-size: 14px;
  color: #333;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.count-btn {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
.count-btn:disabled {
  color: #999;
  cursor: not-allowed;
}
.count-num {
  margin: 0 10px;
  font-size: 14px;
}
.del-btn {
  background: #ff4400;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.del-btn:hover {
  background: #ff6622;
}

/* 空购物车 */
.empty-cart {
  text-align: center;
  padding: 50px 0;
}
.empty-img {
  width: 120px;
  height: 120px;
  opacity: 0.5;
  margin-bottom: 20px;
}
.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}
.go-shop-btn {
  width: 120px;
  height: 40px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.go-shop-btn:hover {
  background: #ff8800;
}

/* 底部结算栏 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  line-height: 60px;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 0 20px;
  margin-top: 20px;
}
.selected-count {
  color: #ff6700;
  font-weight: 700;
}
.total-price {
  font-size: 16px;
}
.price-num {
  font-size: 20px;
  color: #ff6700;
  font-weight: 700;
  margin-left: 5px;
}
.settle-btn {
  width: 120px;
  height: 40px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.settle-btn:disabled {
  background: #ffb088;
  cursor: not-allowed;
}
.settle-btn:hover:not(:disabled) {
  background: #ff8800;
}
</style>