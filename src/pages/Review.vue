<template>
  <div class="review-page">
    <header class="header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h2 class="page-title">商品评价</h2>
    </header>

    <div v-if="goodsName" class="review-container">
      <div class="goods-info-section">
        <div class="section-title">评价商品</div>
        <div class="goods-card">
          <div class="goods-icon">📦</div>
          <div class="goods-detail">
            <div class="goods-name">{{ goodsName }}</div>
            <div class="goods-desc">订单号：{{ orderNo }}</div>
          </div>
        </div>
      </div>

      <div class="rating-section">
        <div class="section-title">商品评分</div>
        <div class="rating-stars">
          <div 
            class="star" 
            v-for="i in 5" 
            :key="i"
            :class="{ active: i <= rating }"
            @click="rating = i"
          >
            ★
          </div>
          <span class="rating-text">{{ getRatingText() }}</span>
        </div>
      </div>

      <div class="content-section">
        <div class="section-title">评价内容</div>
        <textarea 
          v-model="reviewContent" 
          placeholder="请分享您对该商品的使用体验（至少5个字）"
          class="review-textarea"
          :maxlength="500"
        ></textarea>
        <div class="char-count">{{ reviewContent.length }}/500</div>
      </div>

      <div class="tags-section">
        <div class="section-title">快捷标签（可选）</div>
        <div class="tags-list">
          <div 
            class="tag-item" 
            v-for="tag in tags" 
            :key="tag"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button 
          class="submit-btn" 
          @click="handleSubmit"
          :disabled="isSubmitting || !canSubmit"
        >
          {{ isSubmitting ? '提交中...' : '提交评价' }}
        </button>
      </div>
    </div>

    <div v-else class="empty-tip">
      <div class="empty-icon">📝</div>
      <div class="empty-text">参数错误，请从订单详情页进入评价</div>
      <button class="go-back-btn" @click="$router.push('/user-center')">返回个人中心</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { createReview } from '../data/review.js';
import { markGoodsReviewed } from '../data/order.js';
import { getCurrentUser } from '../data/user.js';

const route = useRoute();
const router = useRouter();

const orderNo = ref('');
const goodsId = ref(null);
const goodsName = ref('');
const rating = ref(5);
const reviewContent = ref('');
const selectedTags = ref([]);
const isSubmitting = ref(false);

const tags = [
  '质量很好',
  '物流很快',
  '性价比高',
  '外观好看',
  '使用方便',
  '服务态度好'
];

const canSubmit = computed(() => {
  return rating.value >= 1 && reviewContent.value.trim().length >= 5;
});

onMounted(() => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    ElMessage.warning('请先登录！');
    router.push('/login');
    return;
  }

  const { orderNo: no, goodsId: id, goodsName: name } = route.query;
  if (!no || !id || !name) {
    ElMessage.warning('参数错误！');
    return;
  }

  orderNo.value = no;
  goodsId.value = Number(id);
  goodsName.value = name;
});

const getRatingText = () => {
  const texts = ['', '非常差', '差', '一般', '好', '非常好'];
  return texts[rating.value] || '';
};

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};

const handleSubmit = () => {
  if (rating.value < 1) {
    ElMessage.warning('请选择评分！');
    return;
  }
  if (reviewContent.value.trim().length < 5) {
    ElMessage.warning('评价内容至少需要5个字！');
    return;
  }

  isSubmitting.value = true;

  let content = reviewContent.value.trim();
  if (selectedTags.value.length > 0) {
    content += `\n\n【标签】${selectedTags.value.join('、')}`;
  }

  setTimeout(() => {
    const reviewResult = createReview(
      orderNo.value,
      goodsId.value,
      goodsName.value,
      rating.value,
      content
    );

    if (reviewResult.success) {
      const orderResult = markGoodsReviewed(orderNo.value, goodsId.value);
      if (orderResult.success) {
        ElMessage.success('评价提交成功！');
        router.push('/user-center');
      } else {
        ElMessage.error(orderResult.msg);
      }
    } else {
      ElMessage.error(reviewResult.msg);
    }
    isSubmitting.value = false;
  }, 500);
};
</script>

<style scoped>
.review-page {
  max-width: 600px;
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

.review-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.goods-info-section,
.rating-section,
.content-section,
.tags-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.goods-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.goods-icon {
  font-size: 40px;
}

.goods-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.goods-desc {
  font-size: 13px;
  color: #999;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star {
  font-size: 32px;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
}

.star:hover {
  color: #ffc107;
}

.star.active {
  color: #ffc107;
}

.rating-text {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}

.review-textarea {
  width: 100%;
  height: 150px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  transition: border-color 0.2s;
}

.review-textarea:focus {
  border-color: #ff6700;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  border-color: #ff6700;
  color: #ff6700;
}

.tag-item.active {
  background: #fff8f0;
  border-color: #ff6700;
  color: #ff6700;
}

.submit-section {
  padding: 10px 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #ff8800;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.go-back-btn {
  padding: 10px 30px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 767px) {
  .review-page {
    padding: 10px;
  }

  .star {
    font-size: 28px;
  }

  .tags-list {
    gap: 8px;
  }

  .tag-item {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
