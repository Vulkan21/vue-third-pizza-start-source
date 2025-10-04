import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    user: {
      id: null,
      name: '',
      email: '',
      phone: '',
      avatar: null
    },

    addresses: [
    ],
    
    selectedAddressId: null,

    orderHistory: [
    ],

    isAuthenticated: false,
    isLoading: false,
    error: null,

    guestOrderData: {
      name: '',
      phone: '',
      email: '',
      comment: ''
    }
  }),

  getters: {
    fullUserInfo: (state) => {
      if (!state.isAuthenticated) return null
      return {
        name: state.user.name,
        phone: state.user.phone,
        email: state.user.email
      }
    },

    primaryAddress: (state) => {
      return state.addresses.find(addr => addr.isPrimary) || state.addresses[0] || null
    },

    selectedAddress: (state) => {
      return state.addresses.find(addr => addr.id === state.selectedAddressId) || null
    },

    getAddressById: (state) => (id) => {
      return state.addresses.find(addr => addr.id === id)
    },

    activeOrders: (state) => {
      return state.orderHistory.filter(order => 
        ['pending', 'preparing', 'delivering'].includes(order.status)
      )
    },

    completedOrders: (state) => {
      return state.orderHistory.filter(order => 
        ['delivered', 'cancelled'].includes(order.status)
      )
    },

    isGuestOrderDataValid: (state) => {
      return state.guestOrderData.name.trim() !== '' && 
             state.guestOrderData.phone.trim() !== ''
    },

    orderContactData: (state) => {
      if (state.isAuthenticated) {
        return {
          name: state.user.name,
          phone: state.user.phone,
          email: state.user.email
        }
      } else {
        return state.guestOrderData
      }
    },

    fullUserProfile: (state) => {
      if (!state.isAuthenticated) return null
      return {
        ...state.user,
        addressesCount: state.addresses.length,
        hasAvatar: !!state.user.avatar,
        hasPhone: !!state.user.phone,
        ordersCount: state.orderHistory.length
      }
    },

    formattedPhone: (state) => {
      const phone = state.isAuthenticated ? state.user.phone : state.guestOrderData.phone
      if (!phone) return ''
      
      const cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone.length === 11 && cleanPhone.startsWith('7')) {
        return `+7 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7, 9)}-${cleanPhone.slice(9, 11)}`
      }
      return phone
    },

    userInitials: (state) => {
      if (!state.isAuthenticated || !state.user.name) return ''
      const names = state.user.name.split(' ')
      return names.map(name => name.charAt(0).toUpperCase()).join('')
    },

    defaultDeliveryAddress: (state) => {
      const address = state.addresses.find(addr => addr.isPrimary) || state.addresses[0]
      if (!address) return null
      
      return {
        ...address,
        formatted: `${address.street}, ${address.building}${address.flat ? `, кв. ${address.flat}` : ''}`,
        shortFormatted: `${address.street}, ${address.building}`
      }
    },

    formattedAddresses: (state) => {
      return state.addresses.map(address => ({
        ...address,
        formatted: `${address.street}, ${address.building}${address.flat ? `, кв. ${address.flat}` : ''}`,
        shortFormatted: `${address.street}, ${address.building}`,
        isSelected: address.id === state.selectedAddressId
      }))
    },

    orderStats: (state) => {
      return {
        total: state.orderHistory.length,
        active: state.orderHistory.filter(order => 
          ['pending', 'preparing', 'delivering'].includes(order.status)
        ).length,
        completed: state.orderHistory.filter(order => 
          ['delivered'].includes(order.status)
        ).length,
        cancelled: state.orderHistory.filter(order => 
          ['cancelled'].includes(order.status)
        ).length
      }
    },

    lastOrder: (state) => {
      if (state.orderHistory.length === 0) return null
      return state.orderHistory.reduce((latest, order) => 
        new Date(order.createdAt || 0) > new Date(latest.createdAt || 0) ? order : latest,
        state.orderHistory[0]
      )
    },

    isProfileComplete: (state) => {
      if (!state.isAuthenticated) return false
      return !!(state.user.name && state.user.phone && state.user.email)
    },

    hasActiveOrders: (state) => {
      return state.orderHistory.some(order => 
        ['pending', 'preparing', 'delivering'].includes(order.status)
      )
    },

    totalSpent: (state) => {
      return state.orderHistory
        .filter(order => order.status === 'delivered')
        .reduce((total, order) => total + (order.totalAmount || 0), 0)
    },

    canPlaceOrder: (state) => {
      if (state.isAuthenticated) {
        return state.isProfileComplete && state.addresses.length > 0
      } else {
        return state.guestOrderData.name && state.guestOrderData.phone
      }
    }
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        
        this.user = {
          id: 1,
          name: credentials.name || 'Тестовый пользователь',
          phone: credentials.phone || '+7 (999) 123-45-67',
          email: credentials.email || 'test@example.com',
          avatar: null
        }
        
        this.isAuthenticated = true
        
        await Promise.all([
          this.loadAddresses(),
          this.loadOrderHistory()
        ])
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка авторизации:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = {
        id: null,
        name: '',
        phone: '',
        email: '',
        avatar: null
      }
      this.addresses = []
      this.selectedAddress = null
      this.orderHistory = []
      this.isAuthenticated = false
      this.error = null
    },

    async updateProfile(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        
        this.user = { ...this.user, ...userData }
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка обновления профиля:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadAddresses() {
      if (!this.isAuthenticated) return
      
      try {
        
        this.addresses = [
          {
            id: 1,
            street: 'ул. Примерная',
            building: '123',
            apartment: '45',
            floor: '5',
            comment: 'Код домофона: 1234',
            isPrimary: true
          }
        ]
        
      } catch (error) {
        console.error('Ошибка загрузки адресов:', error)
      }
    },

    async addAddress(addressData) {
      this.isLoading = true
      this.error = null
      
      try {
        
        const newAddress = {
          id: Date.now(),
          ...addressData,
          isPrimary: this.addresses.length === 0
        }
        
        this.addresses.push(newAddress)
        
        return newAddress
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка добавления адреса:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateAddress(addressId, addressData) {
      this.isLoading = true
      this.error = null
      
      try {
        
        const index = this.addresses.findIndex(addr => addr.id === addressId)
        if (index !== -1) {
          this.addresses[index] = { ...this.addresses[index], ...addressData }
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка обновления адреса:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteAddress(addressId) {
      this.isLoading = true
      this.error = null
      
      try {
        
        const index = this.addresses.findIndex(addr => addr.id === addressId)
        if (index !== -1) {
          this.addresses.splice(index, 1)
        }
        
        if (this.selectedAddress === addressId) {
          this.selectedAddress = null
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка удаления адреса:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    selectAddress(addressId) {
      this.selectedAddressId = addressId
    },

    async loadOrderHistory() {
      if (!this.isAuthenticated) return
      
      try {
        
        this.orderHistory = []
        
      } catch (error) {
        console.error('Ошибка загрузки истории заказов:', error)
      }
    },

    updateGuestOrderData(data) {
      this.guestOrderData = { ...this.guestOrderData, ...data }
    },

    resetGuestOrderData() {
      this.guestOrderData = {
        name: '',
        phone: '',
        email: '',
        comment: ''
      }
    },

    addOrderToHistory(order) {
      this.orderHistory.unshift(order)
    },

    updateOrderStatus(orderId, status) {
      const order = this.orderHistory.find(o => o.id === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()
      }
    }
  }
})

