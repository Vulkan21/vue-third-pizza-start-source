<template>
  <form @submit.prevent="handleSubmit" class="layout-form">
    <main class="content cart">
      <div class="container">
        <div class="cart__title">
          <h1 class="title title--big">Корзина</h1>
        </div>

        <!-- Empty cart state -->
        <div v-if="cartItems.length === 0" class="sheet cart__empty">
          <p>В корзине нет ни одного товара</p>
          <router-link :to="{ name: 'home' }" class="button">
            Перейти к конструктору
          </router-link>
        </div>

        <!-- Cart items -->
        <ul v-else class="cart-list sheet">
          <li 
            v-for="item in cartItems" 
            :key="item.id" 
            class="cart-list__item"
          >
            <div class="product cart-list__product">
              <img 
                src="@/assets/img/product.svg" 
                class="product__img" 
                width="56" 
                height="56" 
                :alt="item.name"
              />
              <div class="product__text">
                <h2>{{ item.name }}</h2>
                <ul>
                  <li>{{ item.size }}, {{ item.dough }}</li>
                  <li>Соус: {{ item.sauce }}</li>
                  <li>Начинка: {{ item.ingredients }}</li>
                </ul>
              </div>
            </div>

            <div class="counter cart-list__counter">
              <AppCounter
                v-model="item.quantity"
                :min="1"
                :orange-style="true"
                @change="updateItemQuantity(item.id, $event)"
              />
            </div>

            <div class="cart-list__price">
              <b>{{ item.price * item.quantity }} ₽</b>
            </div>

            <div class="cart-list__button">
              <button type="button" class="cart-list__edit" @click="editItem(item.id)">
                Изменить
              </button>
            </div>
          </li>
        </ul>

        <!-- Additional items -->
        <div v-if="additionalItems.length > 0" class="cart__additional">
          <ul class="additional-list">
            <li 
              v-for="item in additionalItems" 
              :key="item.id"
              class="additional-list__item sheet"
            >
              <p class="additional-list__description">
                <img 
                  :src="item.image" 
                  width="39" 
                  height="60" 
                  :alt="item.name"
                />
                <span>{{ item.name }}</span>
              </p>

              <div class="additional-list__wrapper">
                <div class="counter additional-list__counter">
                  <AppCounter
                    v-model="item.quantity"
                    :min="0"
                    :orange-style="true"
                    @change="updateAdditionalItem(item.id, $event)"
                  />
                </div>

                <div class="additional-list__price">
                  <b>× {{ item.price }} ₽</b>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Order form -->
        <div v-if="cartItems.length > 0" class="cart__form">
          <div class="cart-form">
            <label class="cart-form__select">
              <span class="cart-form__label">Получение заказа:</span>
              <select v-model="orderForm.deliveryType" class="select">
                <option value="pickup">Заберу сам</option>
                <option value="new-address">Новый адрес</option>
                <option value="home">Дом</option>
              </select>
            </label>

            <label class="input input--big-label">
              <span>Контактный телефон:</span>
              <input 
                v-model="orderForm.phone"
                type="tel" 
                placeholder="+7 999-999-99-99"
                required
              />
            </label>

            <div v-if="orderForm.deliveryType === 'new-address'" class="cart-form__address">
              <span class="cart-form__label">Новый адрес:</span>

              <div class="cart-form__input">
                <label class="input">
                  <span>Улица*</span>
                  <input v-model="orderForm.street" type="text" required />
                </label>
              </div>

              <div class="cart-form__input cart-form__input--small">
                <label class="input">
                  <span>Дом*</span>
                  <input v-model="orderForm.house" type="text" required />
                </label>
              </div>

              <div class="cart-form__input cart-form__input--small">
                <label class="input">
                  <span>Квартира</span>
                  <input v-model="orderForm.apartment" type="text" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer with order total -->
    <section v-if="cartItems.length > 0" class="footer">
      <div class="footer__more">
        <router-link :to="{ name: 'home' }" class="button button--border button--arrow">
          Хочу еще одну
        </router-link>
      </div>
      
      <p class="footer__text">
        Перейти к конструктору<br />
        чтоб собрать ещё одну пиццу
      </p>
      
      <div class="footer__price">
        <b>Итого: {{ totalPrice }} ₽</b>
      </div>

      <div class="footer__submit">
        <button type="submit" class="button">Оформить заказ</button>
      </div>
    </section>
  </form>
</template>

<script>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppCounter } from '@/common/components'

export default {
  name: 'CartView',
  components: {
    AppCounter
  },
  setup() {
    const router = useRouter()
    
    // Mock data
    const cartItems = ref([
      {
        id: 1,
        name: 'Капричоза',
        size: '30 см',
        dough: 'тонкое тесто',
        sauce: 'томатный',
        ingredients: 'грибы, лук, ветчина, пармезан, ананас',
        price: 782,
        quantity: 1
      },
      {
        id: 2,
        name: 'Любимая пицца',
        size: '30 см',
        dough: 'тонкое тесто',
        sauce: 'томатный',
        ingredients: 'грибы, лук, ветчина, пармезан, ананас, бекон, блю чиз',
        price: 782,
        quantity: 2
      }
    ])
    
    const additionalItems = ref([
      {
        id: 1,
        name: 'Coca-Cola 0,5 литра',
        image: '@/assets/img/cola.svg',
        price: 56,
        quantity: 2
      },
      {
        id: 2,
        name: 'Острый соус',
        image: '@/assets/img/sauce.svg',
        price: 30,
        quantity: 2
      }
    ])
    
    const orderForm = reactive({
      deliveryType: 'pickup',
      phone: '',
      street: '',
      house: '',
      apartment: ''
    })
    
    // Computed
    const totalPrice = computed(() => {
      const itemsTotal = cartItems.value.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      
      const additionalTotal = additionalItems.value.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      
      return itemsTotal + additionalTotal
    })
    
    // Methods
    const updateItemQuantity = (itemId, quantity) => {
      const item = cartItems.value.find(item => item.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    }
    
    const updateAdditionalItem = (itemId, quantity) => {
      const item = additionalItems.value.find(item => item.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    }
    
    const editItem = (itemId) => {
      // Redirect to constructor with item data for editing
      router.push({ name: 'home', query: { edit: itemId } })
    }
    
    const handleSubmit = () => {
      console.log('Order submitted:', {
        items: cartItems.value,
        additional: additionalItems.value.filter(item => item.quantity > 0),
        form: orderForm,
        total: totalPrice.value
      })
      
      alert(`Заказ оформлен на сумму ${totalPrice.value} ₽!`)
      
      // Clear cart and redirect
      cartItems.value = []
      additionalItems.value.forEach(item => item.quantity = 0)
      router.push({ name: 'home' })
    }
    
    return {
      cartItems,
      additionalItems,
      orderForm,
      totalPrice,
      updateItemQuantity,
      updateAdditionalItem,
      editItem,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
// Design System
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-typography";

.layout-form {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 30px 0;
}

.container {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart__title {
  margin-bottom: 30px;
}

.cart__empty {
  text-align: center;
  padding: 60px 40px;
  
  p {
    @include ds-typography.r-s18-h21;
    margin-bottom: 30px;
    color: ds-colors.$purple-800;
  }
}

.cart-list {
  list-style: none;
  margin: 0;
  padding: 20px;
  
  &__item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
    border-bottom: 1px solid rgba(ds-colors.$purple-400, 0.2);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  &__product {
    flex: 1;
  }
  
  &__counter {
    flex-shrink: 0;
  }
  
  &__price {
    @include ds-typography.b-s18-h21;
    flex-shrink: 0;
    min-width: 80px;
    text-align: right;
  }
  
  &__button {
    flex-shrink: 0;
  }
  
  &__edit {
    @include ds-typography.r-s14-h16;
    background: none;
    border: none;
    color: ds-colors.$green-500;
    cursor: pointer;
    text-decoration: underline;
    
    &:hover {
      color: ds-colors.$green-400;
    }
  }
}

.cart__additional {
  margin-top: 30px;
}

.additional-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &__item {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  
  &__description {
    @include ds-typography.r-s16-h19;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }
  
  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  &__price {
    @include ds-typography.b-s16-h19;
    margin: 0;
  }
}

.cart__form {
  margin-top: 30px;
}

.cart-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  &__select {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  &__label {
    @include ds-typography.r-s16-h19;
    color: ds-colors.$black;
  }
  
  &__address {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-top: 16px;
    
    .cart-form__label {
      grid-column: 1 / -1;
      margin-bottom: 12px;
    }
  }
  
  &__input {
    display: block;
  }
}

.footer {
  background-color: ds-colors.$green-500;
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  
  &__more {
    flex-shrink: 0;
  }
  
  &__text {
    @include ds-typography.r-s14-h16;
    color: ds-colors.$white;
    margin: 0;
    text-align: center;
  }
  
  &__price {
    @include ds-typography.b-s24-h28;
    color: ds-colors.$white;
    margin: 0;
  }
  
  &__submit {
    flex-shrink: 0;
  }
}

// Responsive
@media (max-width: 768px) {
  .cart-list__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .cart-form__address {
    grid-template-columns: 1fr;
  }
  
  .footer {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
