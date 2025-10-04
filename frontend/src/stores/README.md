# Pinia Stores

Этот проект использует [Pinia](https://pinia.vuejs.org/) для управления состоянием. Stores разделены по функциональности:

## Структура stores

### 🛒 Cart Store (`useCartStore`)
Управление корзиной покупок:
- Добавление/удаление товаров
- Изменение количества
- Подсчет общей стоимости
- Очистка корзины

**Основные методы:**
- `addItem(item)` - добавить товар в корзину
- `removeItem(itemId)` - удалить товар из корзины
- `updateItemQuantity(itemId, quantity)` - изменить количество товара
- `clearCart()` - очистить корзину

**Getters:**
- `cartItemsCount` - общее количество товаров
- `totalAmount` - общая стоимость
- `isEmpty` - проверка пустоты корзины

### 🍕 Pizza Store (`usePizzaStore`)  
Управление конструктором пиццы и каталогом:
- Конфигурация текущей пиццы (размер, тесто, соус, ингредиенты)
- Каталог готовых пицц
- Расчет стоимости
- Данные конструктора (размеры, тесто, соусы, ингредиенты)

**Основные методы:**
- `selectSize(sizeId)` - выбрать размер
- `selectDough(doughId)` - выбрать тесто  
- `selectSauce(sauceId)` - выбрать соус
- `addIngredient(ingredientId, quantity)` - добавить ингредиент
- `getPizzaForCart()` - получить готовую пиццу для корзины
- `resetPizza()` - сбросить конструктор

**Getters:**
- `isPizzaReady` - готовность пиццы к добавлению в корзину
- `currentPizzaDescription` - полное описание текущей пиццы
- `isIngredientSelected(id)` - проверка выбора ингредиента

### 👤 Profile Store (`useProfileStore`) 
Управление профилем пользователя:
- Данные пользователя
- Аутентификация
- Адреса доставки
- История заказов
- Гостевые заказы

**Основные методы:**
- `login(credentials)` - авторизация
- `logout()` - выход
- `updateProfile(userData)` - обновление профиля
- `addAddress(addressData)` - добавить адрес
- `selectAddress(addressId)` - выбрать адрес для доставки
- `updateGuestOrderData(data)` - данные гостевого заказа

**Getters:**
- `isAuthenticated` - статус авторизации
- `primaryAddress` - основной адрес
- `orderContactData` - данные для заказа (авторизованный/гость)

### 📊 Data Store (`useDataStore`)
Общие данные приложения:
- Глобальная конфигурация
- Кеширование API данных
- Управление загрузкой и ошибками
- Настройки приложения
- Аналитика

**Основные методы:**
- `setLoading(type, isLoading)` - управление загрузкой
- `setError(type, error)` - управление ошибками
- `loadDataWithCache(type, apiCall)` - загрузка с кешированием
- `trackEvent(event, data)` - аналитика
- `updateSettings(settings)` - обновление настроек

**Getters:**
- `formatPrice(price)` - форматирование цены
- `isFreeDelivery(amount)` - проверка бесплатной доставки
- `isAnyLoading` - есть ли активные загрузки

## Использование в компонентах

```vue
<script setup>
import { useCartStore, usePizzaStore, useProfileStore, useDataStore } from '@/stores'

// Инициализация stores
const cartStore = useCartStore()  
const pizzaStore = usePizzaStore()
const profileStore = useProfileStore()
const dataStore = useDataStore()

// Использование реактивных данных
const cartItems = computed(() => cartStore.cartItems)
const totalPrice = computed(() => cartStore.totalAmount)
const isAuthenticated = computed(() => profileStore.isAuthenticated)

// Вызов действий
const addToCart = () => {
  const pizza = pizzaStore.getPizzaForCart()
  cartStore.addItem(pizza)
}
</script>
```

## Импорт stores

### Отдельные stores:
```js
import { useCartStore } from '@/stores/cart'
import { usePizzaStore } from '@/stores/pizza'
```

### Все stores сразу:
```js  
import { useCartStore, usePizzaStore, useProfileStore, useDataStore } from '@/stores'
```

## Рекомендации

1. **Используйте computed для реактивности** - оборачивайте геттеры в computed() для автоматического обновления UI
2. **Не вызывайте actions в геттерах** - только чистые вычисления
3. **Группируйте связанные действия** - например, загрузка данных и установка состояния загрузки
4. **Используйте TypeScript** - для лучшей типизации можно добавить интерфейсы для состояния stores

## Структура файлов

```
src/stores/
├── index.js      # Экспорт всех stores  
├── cart.js       # Корзина
├── pizza.js      # Пицца и конструктор
├── profile.js    # Профиль пользователя
└── data.js       # Общие данные
```

