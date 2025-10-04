import { defineStore } from 'pinia'

export const usePizzaStore = defineStore('pizza', {
  state: () => ({
    currentPizza: {
      name: '',
      sizeId: null,
      doughId: null,
      sauceId: null,
      ingredients: [], // { ingredientId: number, quantity: number }
      price: 0
    },

    sizes: [
    ],
    doughs: [
    ],
    sauces: [
    ],
    ingredients: [
    ],

    pizzas: [
    ],
    
    loading: false,
    error: null
  }),

  getters: {
    getSizeById: (state) => (id) => {
      return state.sizes.find(size => size.id === id)
    },

    getDoughById: (state) => (id) => {
      return state.doughs.find(dough => dough.id === id)
    },

    getSauceById: (state) => (id) => {
      return state.sauces.find(sauce => sauce.id === id)
    },

    getIngredientById: (state) => (id) => {
      return state.ingredients.find(ingredient => ingredient.id === id)
    },

    isIngredientSelected: (state) => (ingredientId) => {
      return state.currentPizza.ingredients.some(ing => ing.ingredientId === ingredientId)
    },

    getIngredientQuantity: (state) => (ingredientId) => {
      const ingredient = state.currentPizza.ingredients.find(ing => ing.ingredientId === ingredientId)
      return ingredient ? ingredient.quantity : 0
    },

    isPizzaReady: (state) => {
      return state.currentPizza.name && 
             state.currentPizza.sizeId && 
             state.currentPizza.doughId && 
             state.currentPizza.sauceId
    },

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
    },

    basePizzaPrice: (state) => {
      let basePrice = 0
      
      if (state.currentPizza.doughId) {
        const dough = state.doughs.find(d => d.id === state.currentPizza.doughId)
        if (dough) basePrice += dough.price
      }
      
      if (state.currentPizza.sauceId) {
        const sauce = state.sauces.find(s => s.id === state.currentPizza.sauceId)
        if (sauce) basePrice += sauce.price
      }
      
      state.currentPizza.ingredients.forEach(ing => {
        const ingredient = state.ingredients.find(i => i.id === ing.ingredientId)
        if (ingredient) basePrice += ingredient.price * ing.quantity
      })
      
      return basePrice
    },

    sizeMultiplier: (state) => {
      if (!state.currentPizza.sizeId) return 1
      const size = state.sizes.find(s => s.id === state.currentPizza.sizeId)
      return size?.multiplier || 1
    },

    totalIngredientsCount: (state) => {
      return state.currentPizza.ingredients.reduce((total, ing) => total + ing.quantity, 0)
    },

    ingredientsPrice: (state) => {
      return state.currentPizza.ingredients.reduce((total, ing) => {
        const ingredient = state.ingredients.find(i => i.id === ing.ingredientId)
        return total + (ingredient ? ingredient.price * ing.quantity : 0)
      }, 0)
    },

    hasMinimalComponents: (state) => {
      return !!(state.currentPizza.sizeId && state.currentPizza.doughId && state.currentPizza.sauceId)
    },

    pizzaCompletionPercent: (state) => {
      let completedSteps = 0
      const totalSteps = 4 // name, size, dough, sauce
      
      if (state.currentPizza.name) completedSteps++
      if (state.currentPizza.sizeId) completedSteps++  
      if (state.currentPizza.doughId) completedSteps++
      if (state.currentPizza.sauceId) completedSteps++
      
      return Math.round((completedSteps / totalSteps) * 100)
    },

    selectedIngredientsDetails: (state) => {
      return state.currentPizza.ingredients.map(ing => {
        const ingredient = state.ingredients.find(i => i.id === ing.ingredientId)
        return {
          id: ing.ingredientId,
          name: ingredient?.name || 'Неизвестный ингредиент',
          image: ingredient?.image || '',
          price: ingredient?.price || 0,
          quantity: ing.quantity,
          totalPrice: (ingredient?.price || 0) * ing.quantity
        }
      })
    },

    mostExpensiveIngredients: (state) => {
      return [...state.ingredients]
        .sort((a, b) => b.price - a.price)
        .slice(0, 3)
    },

    hasMenuPizzas: (state) => state.pizzas.length > 0
  },

  actions: {
    async loadConstructorData() {
      this.loading = true
      this.error = null
      
      try {
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

    setPizzaName(name) {
      this.currentPizza.name = name
      this.calculatePrice()
    },

    selectSize(sizeId) {
      this.currentPizza.sizeId = sizeId
      this.calculatePrice()
    },

    selectDough(doughId) {
      this.currentPizza.doughId = doughId
      this.calculatePrice()
    },

    selectSauce(sauceId) {
      this.currentPizza.sauceId = sauceId
      this.calculatePrice()
    },

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

    removeIngredient(ingredientId) {
      const index = this.currentPizza.ingredients.findIndex(ing => ing.ingredientId === ingredientId)
      if (index !== -1) {
        this.currentPizza.ingredients.splice(index, 1)
        this.calculatePrice()
      }
    },

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

    calculatePrice() {
      let basePrice = 0
      
      if (this.currentPizza.doughId) {
        const dough = this.getDoughById(this.currentPizza.doughId)
        if (dough) {
          basePrice += dough.price
        }
      }
      
      if (this.currentPizza.sauceId) {
        const sauce = this.getSauceById(this.currentPizza.sauceId)
        if (sauce) {
          basePrice += sauce.price
        }
      }
      
      this.currentPizza.ingredients.forEach(ing => {
        const ingredient = this.getIngredientById(ing.ingredientId)
        if (ingredient) {
          basePrice += ingredient.price * ing.quantity
        }
      })
      
      if (this.currentPizza.sizeId) {
        const size = this.getSizeById(this.currentPizza.sizeId)
        if (size) {
          basePrice *= size.multiplier
        }
      }
      
      this.currentPizza.price = Math.round(basePrice)
    },

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

    getPizzaForCart() {
      if (!this.isPizzaReady) {
        throw new Error('Пицца не готова к добавлению в корзину')
      }
      
      const description = this.currentPizzaDescription
      
      return {
        name: description.name,
        size: description.size,
        dough: description.dough,
        sauce: description.sauce,
        ingredients: description.ingredients,
        price: this.currentPizza.price,
      }
    }
  }
})

