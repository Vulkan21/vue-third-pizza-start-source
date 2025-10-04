import { defineStore } from 'pinia'

export const usePizzaStore = defineStore('pizza', {
  state: () => ({
    // Конфигурация пиццы в конструкторе
    currentPizza: {
      name: '',
      size: null,
      dough: null,
      sauce: null,
      ingredients: [],
      price: 0
    },

    // Доступные опции для конструктора
    sizes: [],
    doughs: [],
    sauces: [],
    ingredients: [],

    // Готовые пиццы (меню)
    pizzas: [],
    
    // Состояние загрузки
    loading: false,
    error: null
  }),

  getters: {
    // Получить размер пиццы по ID
    getSizeById: (state) => (id) => {
      return state.sizes.find(size => size.id === id)
    },

    // Получить тесто по ID
    getDoughById: (state) => (id) => {
      return state.doughs.find(dough => dough.id === id)
    },

    // Получить соус по ID
    getSauceById: (state) => (id) => {
      return state.sauces.find(sauce => sauce.id === id)
    },

    // Получить ингредиент по ID
    getIngredientById: (state) => (id) => {
      return state.ingredients.find(ingredient => ingredient.id === id)
    },

    // Проверить выбран ли ингредиент
    isIngredientSelected: (state) => (ingredientId) => {
      return state.currentPizza.ingredients.some(ing => ing.id === ingredientId)
    },

    // Получить количество выбранного ингредиента
    getIngredientQuantity: (state) => (ingredientId) => {
      const ingredient = state.currentPizza.ingredients.find(ing => ing.id === ingredientId)
      return ingredient ? ingredient.quantity : 0
    },

    // Проверить готовность пиццы к добавлению в корзину
    isPizzaReady: (state) => {
      return state.currentPizza.name && 
             state.currentPizza.size && 
             state.currentPizza.dough && 
             state.currentPizza.sauce
    },

    // Получить полное описание текущей пиццы
    currentPizzaDescription: (state) => {
      const size = state.sizes.find(s => s.id === state.currentPizza.size)
      const dough = state.doughs.find(d => d.id === state.currentPizza.dough)
      const sauce = state.sauces.find(s => s.id === state.currentPizza.sauce)
      
      return {
        name: state.currentPizza.name,
        size: size?.name || '',
        dough: dough?.name || '',
        sauce: sauce?.name || '',
        ingredients: state.currentPizza.ingredients.map(ing => {
          const ingredient = state.ingredients.find(i => i.id === ing.id)
          return `${ingredient?.name} (${ing.quantity})`
        }).join(', '),
        price: state.currentPizza.price
      }
    }
  },

  actions: {
    // Загрузить данные для конструктора
    async loadConstructorData() {
      this.loading = true
      this.error = null
      
      try {
        // Здесь должны быть API вызовы для загрузки данных
        // Пока используем заглушки
        
        // TODO: Заменить на реальные API вызовы
        this.sizes = [
          { id: 1, name: 'Маленькая', multiplier: 0.8 },
          { id: 2, name: 'Средняя', multiplier: 1.0 },
          { id: 3, name: 'Большая', multiplier: 1.2 }
        ]
        
        this.doughs = [
          { id: 1, name: 'Тонкое', price: 0 },
          { id: 2, name: 'Толстое', price: 50 }
        ]
        
        this.sauces = [
          { id: 1, name: 'Томатный', price: 0 },
          { id: 2, name: 'Сливочный', price: 30 },
          { id: 3, name: 'Барбекю', price: 40 }
        ]
        
        this.ingredients = [
          { id: 1, name: 'Моцарелла', price: 79 },
          { id: 2, name: 'Ветчина', price: 42 },
          { id: 3, name: 'Грибы', price: 33 },
          { id: 4, name: 'Помидоры', price: 35 }
        ]
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка загрузки данных конструктора:', error)
      } finally {
        this.loading = false
      }
    },

    // Загрузить готовые пиццы
    async loadPizzas() {
      this.loading = true
      this.error = null
      
      try {
        // TODO: Заменить на реальный API вызов
        this.pizzas = []
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка загрузки пицц:', error)
      } finally {
        this.loading = false
      }
    },

    // Установить имя пиццы
    setPizzaName(name) {
      this.currentPizza.name = name
      this.calculatePrice()
    },

    // Выбрать размер
    selectSize(sizeId) {
      this.currentPizza.size = sizeId
      this.calculatePrice()
    },

    // Выбрать тесто
    selectDough(doughId) {
      this.currentPizza.dough = doughId
      this.calculatePrice()
    },

    // Выбрать соус
    selectSauce(sauceId) {
      this.currentPizza.sauce = sauceId
      this.calculatePrice()
    },

    // Добавить ингредиент
    addIngredient(ingredientId, quantity = 1) {
      const existingIngredient = this.currentPizza.ingredients.find(ing => ing.id === ingredientId)
      
      if (existingIngredient) {
        existingIngredient.quantity += quantity
      } else {
        this.currentPizza.ingredients.push({
          id: ingredientId,
          quantity: quantity
        })
      }
      
      this.calculatePrice()
    },

    // Удалить ингредиент
    removeIngredient(ingredientId) {
      const index = this.currentPizza.ingredients.findIndex(ing => ing.id === ingredientId)
      if (index !== -1) {
        this.currentPizza.ingredients.splice(index, 1)
        this.calculatePrice()
      }
    },

    // Обновить количество ингредиента
    updateIngredientQuantity(ingredientId, quantity) {
      if (quantity <= 0) {
        this.removeIngredient(ingredientId)
        return
      }
      
      const ingredient = this.currentPizza.ingredients.find(ing => ing.id === ingredientId)
      if (ingredient) {
        ingredient.quantity = quantity
        this.calculatePrice()
      }
    },

    // Рассчитать цену пиццы
    calculatePrice() {
      let basePrice = 300 // Базовая цена пиццы
      
      // Добавляем стоимость теста
      if (this.currentPizza.dough) {
        const dough = this.getDoughById(this.currentPizza.dough)
        if (dough) {
          basePrice += dough.price
        }
      }
      
      // Добавляем стоимость соуса
      if (this.currentPizza.sauce) {
        const sauce = this.getSauceById(this.currentPizza.sauce)
        if (sauce) {
          basePrice += sauce.price
        }
      }
      
      // Добавляем стоимость ингредиентов
      this.currentPizza.ingredients.forEach(ing => {
        const ingredient = this.getIngredientById(ing.id)
        if (ingredient) {
          basePrice += ingredient.price * ing.quantity
        }
      })
      
      // Применяем множитель размера
      if (this.currentPizza.size) {
        const size = this.getSizeById(this.currentPizza.size)
        if (size) {
          basePrice *= size.multiplier
        }
      }
      
      this.currentPizza.price = Math.round(basePrice)
    },

    // Сбросить конструктор
    resetPizza() {
      this.currentPizza = {
        name: '',
        size: null,
        dough: null,
        sauce: null,
        ingredients: [],
        price: 0
      }
    },

    // Получить готовую пиццу для добавления в корзину
    getPizzaForCart() {
      if (!this.isPizzaReady) {
        throw new Error('Пицца не готова к добавлению в корзину')
      }
      
      const description = this.currentPizzaDescription
      
      return {
        id: Date.now() + Math.random(), // Временный ID
        name: description.name,
        size: description.size,
        dough: description.dough,
        sauce: description.sauce,
        ingredients: description.ingredients,
        price: this.currentPizza.price,
        type: 'custom' // Указываем что это кастомная пицца
      }
    }
  }
})

