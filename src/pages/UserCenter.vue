<template>
  <div class="user-center-page">
    <header class="header">
      <button class="back-btn" @click="$router.push('/')">← 返回首页</button>
      <h2 class="page-title">个人中心</h2>
    </header>

    <div class="content-container">
      <div class="tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          用户信息
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'orders' }"
          @click="activeTab = 'orders'"
        >
          订单记录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'address' }"
          @click="activeTab = 'address'"
        >
          收货地址
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'"
        >
          重置密码
        </div>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'profile'" class="profile-section">
          <div class="section-title">基本信息</div>
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ currentUser?.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前昵称：</span>
            <span class="value">{{ currentUser?.nickname }}</span>
          </div>
          <div class="info-item edit-item">
            <span class="label">修改昵称：</span>
            <input 
              v-model="newNickname" 
              type="text" 
              placeholder="请输入新昵称"
              class="input"
            >
            <button class="btn" @click="handleUpdateNickname">保存</button>
          </div>
        </div>

        <div v-if="activeTab === 'orders'" class="orders-section">
          <div class="section-title">订单记录</div>
          <div v-if="orderList.length === 0" class="empty-tip">
            暂无订单记录
          </div>
          <div v-else class="order-list">
            <div 
              class="order-item" 
              v-for="order in orderList" 
              :key="order.orderNo"
              @click="goToOrderDetail(order.orderNo)"
            >
              <div class="order-header">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-status">已支付</span>
              </div>
              <div class="order-goods">
                <div 
                  class="goods-mini" 
                  v-for="goods in order.goodsList.slice(0, 3)" 
                  :key="goods.id"
                >
                  <img :src="goods.img" :alt="goods.name" class="goods-img">
                  <div class="goods-info">
                    <div class="goods-name">{{ goods.name }}</div>
                    <div class="goods-price">¥{{ goods.price }} x{{ goods.count }}</div>
                  </div>
                </div>
                <div v-if="order.goodsList.length > 3" class="more-goods">
                  等{{ order.goodsList.length }}件商品
                </div>
              </div>
              <div class="order-footer">
                <span class="order-time">{{ formatTime(order.createTime) }}</span>
                <span class="order-total">订单金额：¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'address'" class="address-section">
          <div class="section-header">
            <span class="section-title">收货地址</span>
            <button class="add-btn" @click="showAddModal = true">+ 新增地址</button>
          </div>
          <div v-if="addressList.length === 0" class="empty-tip">
            暂无收货地址
          </div>
          <div v-else class="address-list">
            <div 
              class="address-item" 
              v-for="addr in addressList" 
              :key="addr.id"
              :class="{ active: addr.isDefault }"
            >
              <div class="address-header">
                <span class="username">{{ addr.username }}</span>
                <span class="phone">{{ addr.phone }}</span>
                <span class="default-tag" v-if="addr.isDefault">默认</span>
              </div>
              <div class="address-detail">
                {{ addr.province }} {{ addr.city }} {{ addr.detail }}
              </div>
              <div class="address-actions">
                <button 
                  class="action-btn default-btn" 
                  v-if="!addr.isDefault"
                  @click="handleSetDefault(addr.id)"
                >
                  设为默认
                </button>
                <button class="action-btn edit-btn" @click="handleEditAddress(addr)">
                  编辑
                </button>
                <button class="action-btn delete-btn" @click="handleDeleteAddress(addr.id)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'password'" class="password-section">
          <div class="section-title">重置密码</div>
          <div class="form-item">
            <label class="label">原密码：</label>
            <input 
              v-model="oldPassword" 
              type="password" 
              placeholder="请输入原密码"
              class="input"
            >
          </div>
          <div class="form-item">
            <label class="label">新密码：</label>
            <input 
              v-model="newPassword" 
              type="password" 
              placeholder="请输入新密码（至少6位）"
              class="input"
            >
          </div>
          <div class="form-item">
            <label class="label">确认新密码：</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码"
              class="input"
            >
          </div>
          <button class="submit-btn" @click="handleResetPassword">确认修改</button>
        </div>
      </div>
    </div>

    <div class="modal-mask" v-if="showAddModal || showEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ showEditModal ? '编辑地址' : '新增地址' }}</span>
          <button class="close-btn" @click="closeAddressModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label class="label">收货人：</label>
            <input v-model="addressForm.username" type="text" placeholder="请输入收货人姓名" class="input">
          </div>
          <div class="form-item">
            <label class="label">联系电话：</label>
            <input v-model="addressForm.phone" type="text" placeholder="请输入联系电话" class="input">
          </div>
          <div class="form-item">
            <label class="label">省份/地区：</label>
            <input v-model="addressForm.province" type="text" placeholder="请输入省份/地区" class="input">
          </div>
          <div class="form-item">
            <label class="label">城市：</label>
            <input v-model="addressForm.city" type="text" placeholder="请输入城市" class="input">
          </div>
          <div class="form-item">
            <label class="label">详细地址：</label>
            <textarea v-model="addressForm.detail" placeholder="请输入详细地址" class="textarea"></textarea>
          </div>
          <div class="form-item checkbox-item">
            <input type="checkbox" v-model="addressForm.isDefault" id="default-check">
            <label for="default-check">设为默认地址</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeAddressModal">取消</button>
          <button class="confirm-btn" @click="handleSaveAddress">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCurrentUser, updateUserNickname, resetPassword } from '../data/user.js';
import { getUserOrders } from '../data/order.js';
import { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../data/address.js';

const router = useRouter();
const activeTab = ref('profile');
const currentUser = ref(null);
const orderList = ref([]);
const addressList = ref([]);

const newNickname = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const showAddModal = ref(false);
const showEditModal = ref(false);
const editingAddressId = ref(null);
const addressForm = ref({
  username: '',
  phone: '',
  province: '',
  city: '',
  detail: '',
  isDefault: false
});

onMounted(() => {
  currentUser.value = getCurrentUser();
  if (!currentUser.value) {
    ElMessage.warning('请先登录！');
    router.push('/login');
    return;
  }
  loadData();
});

const loadData = () => {
  orderList.value = getUserOrders();
  addressList.value = getUserAddresses();
};

const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleString('zh-CN');
};

const goToOrderDetail = (orderNo) => {
  router.push(`/order-detail/${orderNo}`);
};

const handleUpdateNickname = () => {
  if (!newNickname.value.trim()) {
    ElMessage.warning('昵称不能为空！');
    return;
  }
  const res = updateUserNickname(newNickname.value.trim());
  ElMessage[res.success ? 'success' : 'error'](res.msg);
  if (res.success) {
    currentUser.value = res.user;
    newNickname.value = '';
  }
};

const handleResetPassword = () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    ElMessage.warning('请填写完整信息！');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    ElMessage.warning('两次输入的新密码不一致！');
    return;
  }
  const res = resetPassword(oldPassword.value, newPassword.value);
  ElMessage[res.success ? 'success' : 'error'](res.msg);
  if (res.success) {
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  }
};

const handleEditAddress = (addr) => {
  editingAddressId.value = addr.id;
  addressForm.value = {
    username: addr.username,
    phone: addr.phone,
    province: addr.province,
    city: addr.city,
    detail: addr.detail,
    isDefault: addr.isDefault
  };
  showEditModal.value = true;
};

const closeAddressModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingAddressId.value = null;
  addressForm.value = {
    username: '',
    phone: '',
    province: '',
    city: '',
    detail: '',
    isDefault: false
  };
};

const handleSaveAddress = () => {
  if (!addressForm.value.username || !addressForm.value.phone || !addressForm.value.detail) {
    ElMessage.warning('请填写完整地址信息！');
    return;
  }
  let res;
  if (showEditModal.value) {
    res = updateAddress(editingAddressId.value, addressForm.value);
  } else {
    res = addAddress(addressForm.value);
  }
  ElMessage[res.success ? 'success' : 'error'](res.msg);
  if (res.success) {
    closeAddressModal();
    addressList.value = getUserAddresses();
  }
};

const handleDeleteAddress = (id) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const res = deleteAddress(id);
    ElMessage[res.success ? 'success' : 'error'](res.msg);
    if (res.success) {
      addressList.value = getUserAddresses();
    }
  }).catch(() => {});
};

const handleSetDefault = (id) => {
  const res = setDefaultAddress(id);
  ElMessage[res.success ? 'success' : 'error'](res.msg);
  if (res.success) {
    addressList.value = getUserAddresses();
  }
};
</script>

<style scoped>
.user-center-page {
  max-width: 1200px;
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

.content-container {
  display: flex;
  gap: 20px;
}

.tabs {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 0;
}

.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #ff6700;
}

.tab-item.active {
  color: #ff6700;
  background: #fff8f0;
  border-left-color: #ff6700;
  font-weight: 600;
}

.tab-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.profile-section .info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 15px;
}

.profile-section .info-item .label {
  width: 100px;
  color: #666;
}

.profile-section .info-item .value {
  color: #333;
  font-weight: 500;
}

.profile-section .edit-item {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.profile-section .input {
  flex: 1;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  margin: 0 10px;
}

.profile-section .input:focus {
  border-color: #ff6700;
}

.profile-section .btn {
  padding: 0 20px;
  height: 40px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.orders-section .empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.order-item:hover {
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 14px;
  color: #52c41a;
  font-weight: 500;
}

.order-goods {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.goods-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  background: #f9f9f9;
  border-radius: 4px;
}

.goods-mini .goods-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.goods-mini .goods-name {
  font-size: 13px;
  color: #333;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-mini .goods-price {
  font-size: 12px;
  color: #ff6700;
}

.more-goods {
  font-size: 13px;
  color: #666;
  align-self: center;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.order-time {
  font-size: 13px;
  color: #999;
}

.order-total {
  font-size: 15px;
  font-weight: 600;
  color: #ff6700;
}

.address-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.address-section .add-btn {
  padding: 8px 20px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.address-section .empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s;
}

.address-item.active {
  border-color: #ff6700;
  background: #fff8f0;
}

.address-item .address-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.address-item .username {
  font-weight: 600;
  color: #333;
}

.address-item .phone {
  color: #666;
  font-size: 14px;
}

.address-item .default-tag {
  background: #ff6700;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}

.address-item .address-detail {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.address-item .address-actions {
  display: flex;
  gap: 10px;
}

.address-item .action-btn {
  padding: 5px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.address-item .default-btn:hover {
  border-color: #ff6700;
  color: #ff6700;
}

.address-item .edit-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.address-item .delete-btn:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.password-section .form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.password-section .label {
  width: 100px;
  font-size: 15px;
  color: #666;
}

.password-section .input {
  flex: 1;
  max-width: 300px;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.password-section .input:focus {
  border-color: #ff6700;
}

.password-section .submit-btn {
  margin-left: 100px;
  padding: 0 40px;
  height: 44px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

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
  z-index: 1000;
}

.modal-content {
  width: 500px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.modal-body .form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.modal-body .label {
  width: 80px;
  font-size: 14px;
  color: #666;
}

.modal-body .input {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.modal-body .input:focus {
  border-color: #ff6700;
}

.modal-body .textarea {
  flex: 1;
  height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  resize: none;
}

.modal-body .textarea:focus {
  border-color: #ff6700;
}

.modal-body .checkbox-item {
  margin-left: 80px;
  align-items: center;
  gap: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.modal-footer .cancel-btn,
.modal-footer .confirm-btn {
  padding: 8px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.modal-footer .cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.modal-footer .confirm-btn {
  background: #ff6700;
  color: #fff;
  border: none;
}

@media (max-width: 767px) {
  .user-center-page {
    padding: 10px;
  }

  .content-container {
    flex-direction: column;
  }

  .tabs {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding: 0;
  }

  .tab-item {
    padding: 12px 15px;
    white-space: nowrap;
    border-left: none;
    border-bottom: 2px solid transparent;
  }

  .tab-item.active {
    border-left: none;
    border-bottom-color: #ff6700;
  }

  .modal-content {
    width: 90%;
    max-width: 400px;
  }
}
</style>
