import { getCurrentUser } from './user.js';

const getOrders = () => {
  const user = getCurrentUser();
  if (!user) return [];
  const orders = localStorage.getItem(`orders_${user.username}`);
  return orders ? JSON.parse(orders) : [];
};

const saveOrders = (orders) => {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(`orders_${user.username}`, JSON.stringify(orders));
};

const generateOrderNo = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

export const createOrder = (goodsList, address, payMethod) => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, msg: '请先登录！' };
  }

  const orders = getOrders();
  const orderNo = generateOrderNo();
  const totalAmount = goodsList.reduce((sum, item) => sum + item.price * item.count, 0);

  const newOrder = {
    id: orders.length + 1,
    orderNo: orderNo,
    username: user.username,
    goodsList: goodsList.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      count: item.count,
      hasReviewed: false
    })),
    address: { ...address },
    payMethod: payMethod,
    totalAmount: totalAmount,
    status: 'paid',
    createTime: new Date().toISOString()
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  return { success: true, msg: '订单创建成功！', order: newOrder };
};

export const getUserOrders = () => {
  return getOrders();
};

export const getOrderByNo = (orderNo) => {
  const orders = getOrders();
  return orders.find(order => order.orderNo === orderNo) || null;
};

export const markGoodsReviewed = (orderNo, goodsId) => {
  const orders = getOrders();
  const order = orders.find(o => o.orderNo === orderNo);
  if (order) {
    const goods = order.goodsList.find(g => g.id === goodsId);
    if (goods) {
      goods.hasReviewed = true;
      saveOrders(orders);
      return { success: true, msg: '标记已评价成功！' };
    }
  }
  return { success: false, msg: '订单或商品不存在！' };
};
