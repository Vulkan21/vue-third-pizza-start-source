import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalPrice: 0
  }),

  getters: {
    cartItemsCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    totalAmount: (state) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },

    isEmpty: (state) => state.items.length === 0,

    cartItems: (state) => state.items
  },

  actions: {
    addItem(item) {
      const existingItem = this.items.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        this.updateItemQuantity(item.id, existingItem.quantity + 1)
      } else {
        this.items.push({
          ...item,
          quantity: 1
        })
      }
      
      this.calculateTotal()
    },

    removeItem(itemId) {
      const index = this.items.findIndex(item => item.id === itemId)
      if (index !== -1) {
        this.items.splice(index, 1)
        this.calculateTotal()
      }
    },

    updateItemQuantity(itemId, quantity) {
      const item = this.items.find(item => item.id === itemId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(itemId)
        } else {
          item.quantity = quantity
          this.calculateTotal()
        }
      }
    },

    clearCart() {
      this.items = []
      this.totalPrice = 0
    },

    calculateTotal() {
      this.totalPrice = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },

    // Получить количество конкретного товара в корзине
    getItemQuantity(itemId) {
      const item = this.items.find(item => item.id === itemId)
      return item ? item.quantity : 0
    },

    // Проверить есть ли товар в корзине
    hasItem(itemId) {
      return this.items.some(item => item.id === itemId)
    }
  }
})

