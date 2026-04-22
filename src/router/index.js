// src/router/index.js 完整代码（最终版）
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Cart from '../pages/Cart.vue';
import Register from '../pages/Register.vue'; // 保留原有注册页
import Login from '../pages/Login.vue';
import Checkout from '../pages/Checkout.vue';
import Pay from '../pages/Pay.vue'; // 新增支付页（关键）
import GoodsDetail from '../pages/GoodsDetail.vue';
import UserCenter from '../pages/UserCenter.vue'; // 个人中心
import OrderDetail from '../pages/OrderDetail.vue'; // 订单详情
import Review from '../pages/Review.vue'; // 评价页面

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/register', name: 'Register', component: Register }, // 注册页路由
  { path: '/login', name: 'Login', component: Login },
  { path: '/checkout', name: 'Checkout', component: Checkout }, // 结算页
  { path: '/pay', name: 'Pay', component: Pay }, // 支付页
  { path: '/goods/:id', name: 'GoodsDetail', component: GoodsDetail },
  { path: '/user-center', name: 'UserCenter', component: UserCenter }, // 个人中心
  { path: '/order-detail/:orderNo', name: 'OrderDetail', component: OrderDetail }, // 订单详情
  { path: '/review', name: 'Review', component: Review } // 评价页面
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;