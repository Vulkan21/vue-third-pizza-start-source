import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [
    ],
    
    misc: [
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

    getPizzaItems: (state) => state.items.filter(item => item.type === 'pizza'),
    getMiscItems: (state) => state.items.filter(item => item.type === 'misc'),

    cartItems: (state) => state.items,

    pizzaTotalAmount: (state) => {
      return state.items
        .filter(item => item.type === 'pizza')
        .reduce((total, item) => total + (item.price * item.quantity), 0)
    },

    miscTotalAmount: (state) => {
      return state.items
        .filter(item => item.type === 'misc')
        .reduce((total, item) => total + (item.price * item.quantity), 0)
    },

    pizzaItemsCount: (state) => {
      return state.items
        .filter(item => item.type === 'pizza')
        .reduce((total, item) => total + item.quantity, 0)
    },

    miscItemsCount: (state) => {
      return state.items
        .filter(item => item.type === 'misc')
        .reduce((total, item) => total + item.quantity, 0)
    },

    mostExpensiveItem: (state) => {
      if (state.items.length === 0) return null
      return state.items.reduce((max, item) => 
        item.price > max.price ? item : max, state.items[0]
      )
    },

    cheapestItem: (state) => {
      if (state.items.length === 0) return null
      return state.items.reduce((min, item) => 
        item.price < min.price ? item : min, state.items[0]
      )
    },

    averageItemPrice: (state) => {
      if (state.items.length === 0) return 0
      const total = state.items.reduce((sum, item) => sum + item.price, 0)
      return Math.round(total / state.items.length)
    },

    itemsSortedByPrice: (state) => {
      return [...state.items].sort((a, b) => b.price - a.price)
    },

    hasItemById: (state) => (id) => {
      return state.items.some(item => item.id === id)
    },

    getItemById: (state) => (id) => {
      return state.items.find(item => item.id === id)
    },

    uniqueItemsCount: (state) => state.items.length,

    exceedsAmount: (state) => (amount) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0) > amount
    },

    formattedTotal: (state) => {
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      return `${total} ₽`
    },

    itemsGroupedByType: (state) => {
      const pizza = state.items.filter(item => item.type === 'pizza')
      const misc = state.items.filter(item => item.type === 'misc')
      
      return {
        pizza: {
          items: pizza,
          count: pizza.reduce((total, item) => total + item.quantity, 0),
          totalAmount: pizza.reduce((total, item) => total + (item.price * item.quantity), 0)
        },
        misc: {
          items: misc,
          count: misc.reduce((total, item) => total + item.quantity, 0),
          totalAmount: misc.reduce((total, item) => total + (item.price * item.quantity), 0)
        }
      }
    }
  },

  actions: {
    async loadMisc() {
      try {
        const response = await fetch('/api/misc')
        if (response.ok) {
          this.misc = await response.json()
        }
      } catch (error) {
        console.error('Ошибка загрузки дополнительных товаров:', error)
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

    getItemQuantity(itemId) {
      const item = this.items.find(item => item.id === itemId)
      return item ? item.quantity : 0
    },

    hasItem(itemId) {
      return this.items.some(item => item.id === itemId)
    }
  }
})

