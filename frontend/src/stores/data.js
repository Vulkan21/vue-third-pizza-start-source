import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
  state: () => ({
    // Глобальные данные приложения
    appConfig: {
      currency: 'RUB',
      currencySymbol: '₽',
      deliveryPrice: 300,
      freeDeliveryThreshold: 999,
      orderProcessingTime: '30-60 минут'
    },

    // Состояние загрузки для разных частей приложения
    loading: {
      ingredients: false,
      sizes: false,
      doughs: false,
      sauces: false,
      pizzas: false,
      global: false
    },

    // Ошибки для разных частей приложения
    errors: {
      ingredients: null,
      sizes: null,
      doughs: null,
      sauces: null,
      pizzas: null,
      global: null
    },

    // Кеш для API данных
    cache: {
      ingredients: {
        data: [],
        lastUpdated: null,
        ttl: 5 * 60 * 1000 // 5 минут
      },
      sizes: {
        data: [],
        lastUpdated: null,
        ttl: 10 * 60 * 1000 // 10 минут
      },
      doughs: {
        data: [],
        lastUpdated: null,
        ttl: 10 * 60 * 1000 // 10 минут
      },
      sauces: {
        data: [],
        lastUpdated: null,
        ttl: 10 * 60 * 1000 // 10 минут
      },
      pizzas: {
        data: [],
        lastUpdated: null,
        ttl: 5 * 60 * 1000 // 5 минут
      }
    },

    // Настройки приложения
    settings: {
      notifications: true,
      theme: 'light',
      language: 'ru'
    },

    // Статистика и аналитика
    analytics: {
      pageViews: {},
      userActions: []
    }
  }),

  getters: {
    // Проверить истек ли кеш для определенного типа данных
    isCacheExpired: (state) => (type) => {
      const cache = state.cache[type]
      if (!cache || !cache.lastUpdated) return true
      
      const now = Date.now()
      return (now - cache.lastUpdated) > cache.ttl
    },

    // Получить данные из кеша
    getCachedData: (state) => (type) => {
      const cache = state.cache[type]
      return cache ? cache.data : []
    },

    // Проверить загружаются ли какие-либо данные
    isAnyLoading: (state) => {
      return Object.values(state.loading).some(loading => loading)
    },

    // Получить все активные ошибки
    activeErrors: (state) => {
      return Object.entries(state.errors)
        .filter(([_, error]) => error !== null)
        .reduce((acc, [key, error]) => {
          acc[key] = error
          return acc
        }, {})
    },

    // Получить настройки с значениями по умолчанию
    appSettings: (state) => {
      return {
        notifications: state.settings.notifications ?? true,
        theme: state.settings.theme ?? 'light',
        language: state.settings.language ?? 'ru'
      }
    },

    // Форматировать цену с валютой
    formatPrice: (state) => (price) => {
      return `${price} ${state.appConfig.currencySymbol}`
    },

    // Проверить нужна ли бесплатная доставка
    isFreeDelivery: (state) => (orderAmount) => {
      return orderAmount >= state.appConfig.freeDeliveryThreshold
    },

    // Рассчитать общую стоимость заказа с доставкой
    calculateTotalWithDelivery: (state) => (orderAmount) => {
      const deliveryPrice = orderAmount >= state.appConfig.freeDeliveryThreshold 
        ? 0 
        : state.appConfig.deliveryPrice
      
      return orderAmount + deliveryPrice
    }
  },

  actions: {
    // Установить состояние загрузки
    setLoading(type, isLoading) {
      if (this.loading.hasOwnProperty(type)) {
        this.loading[type] = isLoading
      }
    },

    // Установить ошибку
    setError(type, error) {
      if (this.errors.hasOwnProperty(type)) {
        this.errors[type] = error
      }
    },

    // Очистить ошибку
    clearError(type) {
      if (this.errors.hasOwnProperty(type)) {
        this.errors[type] = null
      }
    },

    // Очистить все ошибки
    clearAllErrors() {
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = null
      })
    },

    // Кешировать данные
    cacheData(type, data) {
      if (this.cache.hasOwnProperty(type)) {
        this.cache[type] = {
          ...this.cache[type],
          data: data,
          lastUpdated: Date.now()
        }
      }
    },

    // Очистить кеш для определенного типа
    clearCache(type) {
      if (this.cache.hasOwnProperty(type)) {
        this.cache[type] = {
          ...this.cache[type],
          data: [],
          lastUpdated: null
        }
      }
    },

    // Очистить весь кеш
    clearAllCache() {
      Object.keys(this.cache).forEach(key => {
        this.clearCache(key)
      })
    },

    // Загрузить данные с проверкой кеша
    async loadDataWithCache(type, apiCall) {
      // Проверяем кеш
      if (!this.isCacheExpired(type)) {
        return this.getCachedData(type)
      }

      this.setLoading(type, true)
      this.clearError(type)

      try {
        const data = await apiCall()
        this.cacheData(type, data)
        return data
      } catch (error) {
        this.setError(type, error.message)
        console.error(`Ошибка загрузки ${type}:`, error)
        
        // Возвращаем кешированные данные если есть
        return this.getCachedData(type)
      } finally {
        this.setLoading(type, false)
      }
    },

    // Обновить настройки приложения
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem('app-settings', JSON.stringify(this.settings))
      } catch (error) {
        console.error('Ошибка сохранения настроек:', error)
      }
    },

    // Загрузить настройки из localStorage
    loadSettings() {
      try {
        const savedSettings = localStorage.getItem('app-settings')
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          this.settings = { ...this.settings, ...parsedSettings }
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error)
      }
    },

    // Записать событие аналитики
    trackEvent(event, data = {}) {
      const eventData = {
        id: Date.now(),
        event,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      }
      
      this.analytics.userActions.push(eventData)
      
      // Ограничиваем количество событий в памяти
      if (this.analytics.userActions.length > 100) {
        this.analytics.userActions = this.analytics.userActions.slice(-50)
      }
    },

    // Отследить просмотр страницы
    trackPageView(path) {
      if (!this.analytics.pageViews[path]) {
        this.analytics.pageViews[path] = 0
      }
      this.analytics.pageViews[path]++
      
      this.trackEvent('page_view', { path })
    },

    // Установить глобальную загрузку
    setGlobalLoading(isLoading) {
      this.loading.global = isLoading
    },

    // Установить глобальную ошибку
    setGlobalError(error) {
      this.errors.global = error
    },

    // Обновить конфигурацию приложения
    updateAppConfig(config) {
      this.appConfig = { ...this.appConfig, ...config }
    },

    // Инициализация store
    async initialize() {
      try {
        this.setGlobalLoading(true)
        
        // Загружаем настройки
        this.loadSettings()
        
        // Здесь можно загрузить другие начальные данные
        // await this.loadInitialData()
        
      } catch (error) {
        this.setGlobalError(error.message)
        console.error('Ошибка инициализации приложения:', error)
      } finally {
        this.setGlobalLoading(false)
      }
    },

    // Сброс всех данных (при выходе пользователя)
    reset() {
      this.clearAllCache()
      this.clearAllErrors()
      
      // Сбрасываем загрузки
      Object.keys(this.loading).forEach(key => {
        this.loading[key] = false
      })
      
      // Очищаем аналитику
      this.analytics = {
        pageViews: {},
        userActions: []
      }
    }
  }
})

