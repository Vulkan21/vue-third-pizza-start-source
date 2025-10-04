import { defineStore } from 'pinia'

export const usePizzaStore = defineStore('pizza', {
  state: () => ({
    // Конфигурация пиццы в конструкторе
    currentPizza: {
      name: '',
      sizeId: null,
      doughId: null,
      sauceId: null,
      ingredients: [], // { ingredientId: number, quantity: number }
      price: 0
    },

    // Доступные опции для конструктора из API
    sizes: [
      // { id: number, name: string, image: string, multiplier: number }
    ],
    doughs: [
      // { id: number, name: string, image: string, description: string, price: number }
    ],
    sauces: [
      // { id: number, name: string, price: number }
    ],
    ingredients: [
      // { id: number, name: string, image: string, price: number }
    ],

    // Готовые пиццы (меню)
    pizzas: [
      // { id: number, name: string, image: string, ingredients: PizzaIngredient[] }
    ],
    
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
      return state.currentPizza.ingredients.some(ing => ing.ingredientId === ingredientId)
    },

    // Получить количество выбранного ингредиента
    getIngredientQuantity: (state) => (ingredientId) => {
      const ingredient = state.currentPizza.ingredients.find(ing => ing.ingredientId === ingredientId)
      return ingredient ? ingredient.quantity : 0
    },

    // Проверить готовность пиццы к добавлению в корзину
    isPizzaReady: (state) => {
      return state.currentPizza.name && 
             state.currentPizza.sizeId && 
             state.currentPizza.doughId && 
             state.currentPizza.sauceId
    },

    // Получить полное описание текущей пиццы
    currentPizzaDescription: (state) => {
      const size = state.sizes.find(s => s.id === state.currentPizza.sizeId)
      const dough = state.doughs.find(d => d.id === state.currentPizza.doughId)
      const sauce = state.sauces.find(s => s.id === state.currentPizza.sauceId)
      
      return {
        name: state.currentPizza.name,
        size: size?.name || '',
        dough: dough?.name || '',
        sauce: sauce?.name || '',
        ingredients: state.currentPizza.ingredients.map(ing => {
          const ingredient = state.ingredients.find(i => i.id === ing.ingredientId)
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
        // Загружаем данные с реальных API эндпоинтов
        const [sizesRes, doughsRes, saucesRes, ingredientsRes] = await Promise.all([
          fetch('/api/sizes'),
          fetch('/api/dough'), 
          fetch('/api/sauces'),
          fetch('/api/ingredients')
        ])

        if (!sizesRes.ok || !doughsRes.ok || !saucesRes.ok || !ingredientsRes.ok) {
          throw new Error('Ошибка загрузки данных конструктора')
        }

        this.sizes = await sizesRes.json()
        this.doughs = await doughsRes.json() 
        this.sauces = await saucesRes.json()
        this.ingredients = await ingredientsRes.json()
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка загрузки данных конструктора:', error)
        
        // Fallback данные для разработки
        this.sizes = [
          { id: 1, name: '23 см', image: '/public/img/diameter.svg', multiplier: 1 },
          { id: 2, name: '32 см', image: '/public/img/diameter.svg', multiplier: 2 },
          { id: 3, name: '45 см', image: '/public/img/diameter.svg', multiplier: 3 }
        ]
        
        this.doughs = [
          { id: 1, name: 'Тонкое', image: '/public/img/dough-light.svg', description: 'Из твердых сортов пшеницы', price: 300 },
          { id: 2, name: 'Толстое', image: '/public/img/dough-large.svg', description: 'Из твердых сортов пшеницы', price: 300 }
        ]
        
        this.sauces = [
          { id: 1, name: 'Томатный', price: 50 },
          { id: 2, name: 'Сливочный', price: 50 }
        ]
        
        this.ingredients = [
          { id: 1, name: 'Чеддер', image: '/public/img/filling/cheddar.svg', price: 42 },
          { id: 2, name: 'Грибы', image: '/public/img/filling/mushrooms.svg', price: 33 }
        ]
      } finally {
        this.loading = false
      }
    },

    // Загрузить готовые пиццы
    async loadPizzas() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/pizzas')
        if (!response.ok) {
          throw new Error('Ошибка загрузки пицц')
        }
        this.pizzas = await response.json()
        
      } catch (error) {
        this.error = error.message
        console.error('Ошибка загрузки пицц:', error)
        this.pizzas = []
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
      this.currentPizza.sizeId = sizeId
      this.calculatePrice()
    },

    // Выбрать тесто
    selectDough(doughId) {
      this.currentPizza.doughId = doughId
      this.calculatePrice()
    },

    // Выбрать соус
    selectSauce(sauceId) {
      this.currentPizza.sauceId = sauceId
      this.calculatePrice()
    },

    // Добавить ингредиент
    addIngredient(ingredientId, quantity = 1) {
      const existingIngredient = this.currentPizza.ingredients.find(ing => ing.ingredientId === ingredientId)
      
      if (existingIngredient) {
        existingIngredient.quantity += quantity
      } else {
        this.currentPizza.ingredients.push({
          ingredientId: ingredientId,
          quantity: quantity
        })
      }
      
      this.calculatePrice()
    },

    // Удалить ингредиент
    removeIngredient(ingredientId) {
      const index = this.currentPizza.ingredients.findIndex(ing => ing.ingredientId === ingredientId)
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
      
      const ingredient = this.currentPizza.ingredients.find(ing => ing.ingredientId === ingredientId)
      if (ingredient) {
        ingredient.quantity = quantity
        this.calculatePrice()
      }
    },

    // Рассчитать цену пиццы
    calculatePrice() {
      let basePrice = 0
      
      // Базовая цена от теста
      if (this.currentPizza.doughId) {
        const dough = this.getDoughById(this.currentPizza.doughId)
        if (dough) {
          basePrice += dough.price
        }
      }
      
      // Добавляем стоимость соуса
      if (this.currentPizza.sauceId) {
        const sauce = this.getSauceById(this.currentPizza.sauceId)
        if (sauce) {
          basePrice += sauce.price
        }
      }
      
      // Добавляем стоимость ингредиентов
      this.currentPizza.ingredients.forEach(ing => {
        const ingredient = this.getIngredientById(ing.ingredientId)
        if (ingredient) {
          basePrice += ingredient.price * ing.quantity
        }
      })
      
      // Применяем множитель размера
      if (this.currentPizza.sizeId) {
        const size = this.getSizeById(this.currentPizza.sizeId)
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
        sizeId: null,
        doughId: null,
        sauceId: null,
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

