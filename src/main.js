import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 导入cart.js里的持久化插件
import { piniaPersistPlugin } from './store/cart'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// 创建Pinia实例并注册插件
const pinia = createPinia()
pinia.use(piniaPersistPlugin)

// 创建Vue应用
const app = createApp(App)
app.use(pinia)       // 注册Pinia
app.use(router)      // 注册路由
app.use(ElementPlus) // 注册Element Plus
app.mount('#app')    // 挂载到页面