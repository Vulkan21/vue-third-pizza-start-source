import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    // Данные пользователя
    user: {
      id: null,
      name: '',
      phone: '',
      email: '',
      avatar: null
    },

    // Адреса доставки
    addresses: [],
    
    // Выбранный адрес для текущего заказа
    selectedAddress: null,

    // История заказов
    orderHistory: [],

    // Состояние аутентификации
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Данные для оформления заказа (гостевой режим)
    guestOrderData: {
      name: '',
      phone: '',
      email: '',
      comment: ''
    }
  }),

  getters: {
    // Получить полное имя пользователя
    fullUserInfo: (state) => {
      if (!state.isAuthenticated) return null
      return {
        name: state.user.name,
        phone: state.user.phone,
        email: state.user.email
      }
    },

    // Получить основной адрес
    primaryAddress: (state) => {
      return state.addresses.find(addr => addr.isPrimary) || state.addresses[0] || null
    },

    // Получить адрес по ID
    getAddressById: (state) => (id) => {
      return state.addresses.find(addr => addr.id === id)
    },

    // Получить активные заказы
    activeOrders: (state) => {
      return state.orderHistory.filter(order => 
        ['pending', 'preparing', 'delivering'].includes(order.status)
      )
    },

    // Получить завершенные заказы
    completedOrders: (state) => {
      return state.orderHistory.filter(order => 
        ['delivered', 'cancelled'].includes(order.status)
      )
    },

    // Проверить заполнены ли обязательные поля для гостевого заказа
    isGuestOrderDataValid: (state) => {
      return state.guestOrderData.name.trim() !== '' && 
             state.guestOrderData.phone.trim() !== ''
    },

    // Получить данные для оформления заказа (авторизованный или гостевой режим)
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
    }
  },

  actions: {
    // Аутентификация пользователя
    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await authAPI.login(credentials)
        
        // Временная заглушка
        this.user = {
          id: 1,
          name: credentials.name || 'Тестовый пользователь',
          phone: credentials.phone || '+7 (999) 123-45-67',
          email: credentials.email || 'test@example.com',
          avatar: null
        }
        
        this.isAuthenticated = true
        
        // Загружаем данные пользователя
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

    // Выход из системы
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

    // Обновить данные профиля
    async updateProfile(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await profileAPI.update(userData)
        
        this.user = { ...this.user, ...userData }
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка обновления профиля:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Загрузить адреса пользователя
    async loadAddresses() {
      if (!this.isAuthenticated) return
      
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await addressAPI.getAll()
        
        // Временная заглушка
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

    // Добавить новый адрес
    async addAddress(addressData) {
      this.isLoading = true
      this.error = null
      
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await addressAPI.create(addressData)
        
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

    // Обновить адрес
    async updateAddress(addressId, addressData) {
      this.isLoading = true
      this.error = null
      
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await addressAPI.update(addressId, addressData)
        
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

    // Удалить адрес
    async deleteAddress(addressId) {
      this.isLoading = true
      this.error = null
      
      try {
        // TODO: Заменить на реальный API вызов
        // await addressAPI.delete(addressId)
        
        const index = this.addresses.findIndex(addr => addr.id === addressId)
        if (index !== -1) {
          this.addresses.splice(index, 1)
        }
        
        // Если удален выбранный адрес, сбрасываем выбор
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

    // Выбрать адрес для доставки
    selectAddress(addressId) {
      this.selectedAddress = addressId
    },

    // Загрузить историю заказов
    async loadOrderHistory() {
      if (!this.isAuthenticated) return
      
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await ordersAPI.getHistory()
        
        // Временная заглушка
        this.orderHistory = []
        
      } catch (error) {
        console.error('Ошибка загрузки истории заказов:', error)
      }
    },

    // Обновить данные гостевого заказа
    updateGuestOrderData(data) {
      this.guestOrderData = { ...this.guestOrderData, ...data }
    },

    // Сбросить данные гостевого заказа
    resetGuestOrderData() {
      this.guestOrderData = {
        name: '',
        phone: '',
        email: '',
        comment: ''
      }
    },

    // Добавить заказ в историю
    addOrderToHistory(order) {
      this.orderHistory.unshift(order)
    },

    // Обновить статус заказа
    updateOrderStatus(orderId, status) {
      const order = this.orderHistory.find(o => o.id === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()
      }
    }
  }
})

