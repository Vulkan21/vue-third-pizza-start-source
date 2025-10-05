<template>
  <form @submit.prevent="handleSubmit" class="layout-form">
    <main class="content cart">
      <div class="container">
        <div class="cart__title">
          <h1 class="title title--big">Корзина</h1>
        </div>

        
        <div v-if="cartItems.length === 0" class="sheet cart__empty">
          <p>В корзине нет ни одного товара</p>
          <router-link :to="{ name: 'home' }" class="button">
            Перейти к конструктору
          </router-link>
        </div>

        
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppCounter } from '@/common/components'
import { useCartStore, useProfileStore, useDataStore } from '@/stores'

export default {
  name: 'CartView',
  components: {
    AppCounter
  },
  setup() {
    const router = useRouter()
    
    const cartStore = useCartStore()
    const profileStore = useProfileStore() 
    const dataStore = useDataStore()
    
    onMounted(async () => {
      await cartStore.loadMisc()
      cartStore.loadFromStorage()
    })
    
    const cartItems = computed(() => cartStore.getPizzaItems)
    const additionalItems = computed(() => {
      return cartStore.misc.map(miscItem => {
        const inCart = cartStore.findMiscInCart(miscItem.id)
        return {
          ...miscItem,
          quantity: inCart ? inCart.quantity : 0
        }
      }).filter(item => item.quantity > 0)
    })
    
    const totalPrice = computed(() => cartStore.totalAmount)
    
    const orderForm = computed({
      get: () => {
        if (profileStore.isAuthenticated) {
          return {
            deliveryType: profileStore.selectedAddressId ? 'address' : 'pickup',
            phone: profileStore.user.phone,
            street: '',
            house: '',
            apartment: ''
          }
        } else {
          return {
            deliveryType: 'pickup',
            phone: profileStore.guestOrderData.phone,
            street: profileStore.guestOrderData.street || '',
            house: profileStore.guestOrderData.house || '',
            apartment: profileStore.guestOrderData.apartment || ''
          }
        }
      },
      set: (value) => {
        if (!profileStore.isAuthenticated) {
          profileStore.updateGuestOrderData({
            phone: value.phone,
            street: value.street,
            house: value.house,
            apartment: value.apartment
          })
        }
      }
    })
    
    const updateItemQuantity = (itemId, quantity) => {
      cartStore.updateItemQuantity(itemId, quantity)
      cartStore.saveToStorage()
    }
    
    const updateAdditionalItem = (itemId, quantity) => {
      if (quantity > 0) {
        if (!cartStore.hasMiscItem(itemId)) {
          cartStore.addMiscItem(itemId, quantity)
        } else {
          const cartItem = cartStore.findMiscInCart(itemId)
          if (cartItem) {
            cartStore.updateMiscQuantity(cartItem.id, quantity)
          }
        }
      } else {
        cartStore.removeAllMiscById(itemId)
      }
      cartStore.saveToStorage()
    }
    
    const editItem = (itemId) => {
      router.push({ name: 'home', query: { edit: itemId } })
    }
    
    const handleSubmit = async () => {
      try {
        if (cartStore.isEmpty) {
          alert('Корзина пуста!')
          return
        }
        
        if (!profileStore.canPlaceOrder) {
          alert('Заполните контактные данные!')
          return
        }
        
        const orderData = {
          ...cartStore.exportForOrder(),
          contactData: profileStore.orderContactData,
          deliveryAddress: profileStore.selectedAddress || orderForm.value,
          timestamp: new Date().toISOString()
        }
        
        console.log('Order submitted:', orderData)
        
        alert(`Заказ оформлен на сумму ${totalPrice.value} ₽!
        
📋 Детали заказа:
━━━━━━━━━━━━━━━━━━━━━━━━━
🍕 Пицц: ${cartStore.pizzaItemsCount} шт.
🥤 Дополнительно: ${cartStore.miscItemsCount} шт.
📞 Телефон: ${orderData.contactData.phone}
💰 Итого: ${orderData.totalAmount} ₽
━━━━━━━━━━━━━━━━━━━━━━━━━`)
        
        if (profileStore.isAuthenticated) {
          profileStore.addOrderToHistory({
            id: Date.now().toString(),
            ...orderData,
            status: 'pending'
          })
        }
        
        cartStore.clearCart()
        cartStore.saveToStorage()
        
        if (!profileStore.isAuthenticated) {
          profileStore.resetGuestOrderData()
        }
        
        router.push({ name: 'home' })
        
      } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        alert('Ошибка при оформлении заказа. Попробуйте еще раз.')
      }
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
    font-size: 18px;
    font-weight: 400;
    line-height: 21px;
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
    font-size: 18px;
    font-weight: 700;
    line-height: 21px;
    flex-shrink: 0;
    min-width: 80px;
    text-align: right;
  }
  
  &__button {
    flex-shrink: 0;
  }
  
  &__edit {
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
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
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
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
    font-size: 16px;
    font-weight: 700;
    line-height: 19px;
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
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
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
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    color: ds-colors.$white;
    margin: 0;
    text-align: center;
  }
  
  &__price {
    font-size: 24px;
    font-weight: 700;
    line-height: 28px;
    color: ds-colors.$white;
    margin: 0;
  }
  
  &__submit {
    flex-shrink: 0;
  }
}

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
