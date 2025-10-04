import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    // Товары в корзине
    items: [
      // { id: string, type: 'pizza' | 'misc', name: string, price: number, quantity: number, ... }
    ],
    
    // Дополнительные товары (согласно Misc model) 
    misc: [
      // { id: number, name: string, image: string, price: number }
    ],
    
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

    // Получить товары по типу
    getPizzaItems: (state) => state.items.filter(item => item.type === 'pizza'),
    getMiscItems: (state) => state.items.filter(item => item.type === 'misc'),

    cartItems: (state) => state.items
  },

  actions: {
    // Загрузить дополнительные товары
    async loadMisc() {
      try {
        const response = await fetch('/api/misc')
        if (response.ok) {
          this.misc = await response.json()
        }
      } catch (error) {
        console.error('Ошибка загрузки дополнительных товаров:', error)
        // Fallback данные
        this.misc = [
          { id: 1, name: 'Cola-Cola 0,5 литра', image: '/public/img/cola.svg', price: 56 },
          { id: 2, name: 'Острый соус', image: '/public/img/sauce.svg', price: 10 },
          { id: 3, name: 'Картошка из печи', image: '/public/img/potato.svg', price: 170 }
        ]
      }
    },

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

