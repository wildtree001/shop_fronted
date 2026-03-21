<template>
  <div class="register-page">
    <div class="register-box">
      <h3 class="title">用户注册</h3>
      <!-- 登录账号 -->
      <div class="input-item">
        <label>登录账号：</label>
        <input 
          v-model="username" 
          type="text" 
          placeholder="请设置登录用的账号"
          class="input"
        >
      </div>
      <!-- 登录密码 -->
      <div class="input-item">
        <label>登录密码：</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="请设置登录用的密码"
          class="input"
        >
      </div>
      <!-- 新增：用户昵称（显示用） -->
      <div class="input-item">
        <label>你的名字：</label>
        <input 
          v-model="nickname" 
          type="text" 
          placeholder="请输入想显示的名字（如：张三）"
          class="input"
        >
      </div>
      <!-- 注册按钮 -->
      <button class="btn" @click="handleRegister">注册</button>
      <!-- 跳转登录 -->
      <div class="tip">
        已有账号？<span class="link" @click="$router.push('/login')">去登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { registerUser } from '../data/user.js'; // 适配pages目录路径
import { useRouter } from 'vue-router';

// 响应式数据（新增nickname）
const username = ref('');
const password = ref('');
const nickname = ref(''); // 用户昵称
const router = useRouter();

// 注册逻辑
const handleRegister = () => {
  // 全字段校验
  if (!username.value.trim()) {
    ElMessage.warning('登录账号不能为空！');
    return;
  }
  if (!password.value.trim()) {
    ElMessage.warning('登录密码不能为空！');
    return;
  }
  if (!nickname.value.trim()) {
    ElMessage.warning('你的名字不能为空！');
    return;
  }

  // 调用注册方法
  const res = registerUser(username.value, password.value, nickname.value);
  ElMessage[res.success ? 'success' : 'error'](res.msg);
  
  // 注册成功 → 1秒后跳登录页
  if (res.success) {
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0 20px;
}
.register-box {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}
.input-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.input-item label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}
.input {
  height: 44px;
  padding: 0 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}
.input::placeholder {
  color: #999;
}
.btn {
  width: 100%;
  height: 44px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 15px;
  transition: background 0.2s;
}
.btn:hover {
  background: #ff8800;
}
.tip {
  text-align: center;
  font-size: 14px;
  color: #666;
}
.link {
  color: #ff6700;
  cursor: pointer;
}
</style>