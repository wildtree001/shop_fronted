<template>
  <div class="login-page">
    <div class="login-box">
      <h3 class="title">用户登录</h3>
      <!-- 登录账号 -->
      <div class="input-item">
        <label>登录账号：</label>
        <input 
          v-model="username" 
          type="text" 
          placeholder="请输入注册的账号"
          class="input"
        >
      </div>
      <!-- 登录密码 -->
      <div class="input-item">
        <label>登录密码：</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="请输入登录密码"
          class="input"
        >
      </div>
      <!-- 登录按钮 -->
      <button class="btn" @click="handleLogin">登录</button>
      <!-- 跳转注册 -->
      <div class="tip">
        没有账号？<span class="link" @click="$router.push('/register')">去注册</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { loginUser } from '../data/user.js'; // 适配pages目录路径
import { useRouter } from 'vue-router';

// 响应式数据
const username = ref('');
const password = ref('');
const router = useRouter();

// 登录逻辑
const handleLogin = () => {
  // 校验输入
  if (!username.value.trim() || !password.value.trim()) {
    ElMessage.warning('用户名和密码不能为空！');
    return;
  }
 

  // 调用登录方法
  const res = loginUser(username.value, password.value);
  ElMessage[res.success ? 'success' : 'error'](res.msg);
  
  // 登录成功 → 1秒后跳首页（核心：跳转并显示昵称）
  if (res.success) {
    setTimeout(() => {
      router.push('/'); // 跳转到首页
      cartStore.loadUserCart();
    }, 1000);
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0 20px;
}
.login-box {
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