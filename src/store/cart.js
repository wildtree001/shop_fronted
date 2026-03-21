// src/store/cart.js
import { defineStore } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { getCurrentUser } from '../data/user.js'

const customPersist = {
  getItem: (key) => {
    const user = getCurrentUser()
    const realKey = user ? `${key}_${user.username}` : key
    const value = localStorage.getItem(realKey)
    try {
      // 兼容两种格式：插件自动存的是{ goodsList: [] }，避免解析失败
      const parsed = value ? JSON.parse(value) : {}
      return parsed.goodsList ? parsed : { goodsList: [] }
    } catch (e) {
      console.warn('购物车数据解析失败，重置为空', e)
      return { goodsList: [] }
    }
  },
  setItem: (key, value) => {
    const user = getCurrentUser()
    const realKey = user ? `${key}_${user.username}` : key
    // 仅由Pinia插件统一存储，避免手动重复操作
    localStorage.setItem(realKey, JSON.stringify(value))
  },
  removeItem: (key) => {
    const user = getCurrentUser()
    const realKey = user ? `${key}_${user.username}` : key
    localStorage.removeItem(realKey)
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    goodsList: []
  }),
  persist: {
    storage: customPersist,
    paths: ['goodsList'],
    restore: true // 插件自动恢复数据，无需手动load
  },
  actions: {
    // 仅清空内存（退出登录时用）
    clearCartMemoryOnly() {
      this.goodsList = []
    },
    // 清空本地+内存（主动清空购物车时用）
    clearCart() {
      this.goodsList = []
      // 插件会自动同步到本地，无需手动setItem
    },
    loadUserCart() {
      const user = getCurrentUser()
      const realKey = user ? `cart_${user.username}` : 'cart'
      const value = localStorage.getItem(realKey)
      
      try {
        const data = value ? JSON.parse(value) : { goodsList: [] }
        // 只有仓库为空时才兜底加载，避免覆盖已有数据
        if (this.goodsList.length === 0) {
          this.goodsList = data.goodsList || []
        }
      } catch (e) {
        this.clearCartMemoryOnly()
        console.warn('加载购物车失败', e)
      }
    },
    addGoods(goods) {
      if (!goods || !goods.id || !goods.name) {
        console.error('加购失败：商品数据不完整！', goods)
        return
      }
      const newGoods = { ...goods, count: goods.count || 1 }
      const exist = this.goodsList.find(item => item.id === newGoods.id)
      
      if (exist) {
        exist.count++
      } else {
        this.goodsList.push(newGoods)
      }
      // 删掉手动setItem和冗余的$patch，靠插件自动持久化
    },
    deleteGoods(id) {
      if (!id) {
        console.error('删除失败：商品ID不能为空！')
        return
      }
      this.goodsList = this.goodsList.filter(item => item.id !== id)
      // 删掉手动setItem和冗余的$patch
    },
    updateGoodsCount(id, count) {
      const goods = this.goodsList.find(item => item.id === id)
      if (goods) {
        goods.count = Math.max(1, count)
      }
      // 删掉手动setItem和冗余的$patch
    }
  },
  getters: {
    totalCount() {
      return this.goodsList.reduce((sum, item) => sum + (item.count || 1), 0)
    },
    totalPrice() {
      return this.goodsList.reduce((sum, item) => sum + item.price * (item.count || 1), 0)
    }
  }
})

// 导出插件（main.js中注册）
export const piniaPersistPlugin = createPersistedState()