import { getCurrentUser } from './user.js';

const getReviews = () => {
  const reviews = localStorage.getItem('goodsReviews');
  return reviews ? JSON.parse(reviews) : [];
};

const saveReviews = (reviews) => {
  localStorage.setItem('goodsReviews', JSON.stringify(reviews));
};

export const createReview = (orderNo, goodsId, goodsName, rating, content) => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, msg: '请先登录！' };
  }

  const reviews = getReviews();
  const newReview = {
    id: reviews.length + 1,
    orderNo: orderNo,
    goodsId: goodsId,
    goodsName: goodsName,
    username: user.username,
    nickname: user.nickname || user.username,
    rating: rating,
    content: content,
    createTime: new Date().toISOString()
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  return { success: true, msg: '评价成功！', review: newReview };
};

export const getReviewsByGoodsId = (goodsId) => {
  const reviews = getReviews();
  return reviews.filter(review => review.goodsId === goodsId);
};

export const getReviewsByUser = () => {
  const user = getCurrentUser();
  if (!user) return [];
  const reviews = getReviews();
  return reviews.filter(review => review.username === user.username);
};

export const getAverageRating = (goodsId) => {
  const reviews = getReviewsByGoodsId(goodsId);
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};
