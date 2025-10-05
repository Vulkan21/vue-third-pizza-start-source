<template>
  <div>
    <div class="layout__title">
      <h1 class="title title--big">История заказов</h1>
    </div>

    
    <div v-if="orders.length === 0" class="sheet order-empty">
      <p>У вас пока нет заказов</p>
      <router-link :to="{ name: 'home' }" class="button">
        Создать первый заказ
      </router-link>
    </div>

    
    <template v-else>
      <section 
        v-for="order in orders" 
        :key="order.id" 
        class="sheet order"
      >
        <div class="order__wrapper">
          <div class="order__number">
            <b>Заказ #{{ order.id }}</b>
          </div>

          <div class="order__sum">
            <span>Сумма заказа: {{ order.total }} ₽</span>
          </div>

          <div class="order__button">
            <button 
              type="button" 
              class="button button--border"
              @click="deleteOrder(order.id)"
            >
              Удалить
            </button>
          </div>
          
          <div class="order__button">
            <button 
              type="button" 
              class="button"
              @click="repeatOrder(order.id)"
            >
              Повторить
            </button>
          </div>
        </div>

        <ul class="order__list">
          <li 
            v-for="item in order.items" 
            :key="item.id"
            class="order__item"
          >
            <div class="product">
              <img 
                src="@/assets/img/product.svg" 
                class="product__img" 
                width="56" 
                height="56" 
                :alt="item.name"
              />
              <div class="product__text">
                <h2>{{ item.name }}</h2>
                <ul v-if="item.details">
                  <li>{{ item.details.size }}, {{ item.details.dough }}</li>
                  <li>Соус: {{ item.details.sauce }}</li>
                  <li>Начинка: {{ item.details.ingredients }}</li>
                </ul>
                <p v-else>
                  {{ item.description }}
                </p>
              </div>
            </div>

            <p class="order__price">
              {{ item.quantity > 1 ? `${item.quantity}×` : '' }}{{ item.price }} ₽
            </p>
          </li>
        </ul>

        
        <ul v-if="order.additional?.length" class="order__additional">
          <li v-for="item in order.additional" :key="item.id">
            <img 
              :src="item.image" 
              width="20" 
              height="30" 
              :alt="item.name"
            />
            <p>
              <span>{{ item.name }}</span>
              <b>{{ item.price }} ₽</b>
            </p>
          </li>
        </ul>

        <p v-if="order.address" class="order__address">
          Адрес доставки: {{ order.address }}
        </p>
      </section>
    </template>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore, useCartStore } from '@/stores'

export default {
  name: 'OrdersView',
  setup() {
    const router = useRouter()
    
    const profileStore = useProfileStore()
    const cartStore = useCartStore()
    
    onMounted(async () => {
      if (!profileStore.isAuthenticated) {
        await profileStore.login({
          name: 'Василий Ложкин',
          phone: '+7 999-999-99-99',
          email: 'vasily@example.com'
        })
      }
      
      await profileStore.loadOrderHistory()
    })
    
    const orders = computed(() => {
      if (profileStore.orderHistory.length === 0) {
        return [
          {
            id: '11199929',
            total: 1564,
            address: profileStore.defaultDeliveryAddress?.formatted || 'Тест (или если адрес новый - писать целиком)',
            items: [
              {
                id: 1,
                name: 'Капричоза',
                price: 782,
                quantity: 1,
                details: {
                  size: '30 см',
                  dough: 'на тонком тесте',
                  sauce: 'томатный',
                  ingredients: 'грибы, лук, ветчина, пармезан, ананас, бекон, блю чиз'
                }
              },
              {
                id: 2,
                name: 'Моя любимая',
                price: 782,
                quantity: 2,
                details: {
                  size: '30 см',
                  dough: 'на тонком тесте',
                  sauce: 'томатный',
                  ingredients: 'грибы, лук, ветчина, пармезан, ананас'
                }
              }
            ],
            additional: [
              {
                id: 1,
                name: 'Coca-Cola 0,5 литра',
                image: '@/assets/img/cola.svg',
                price: 56
              },
              {
                id: 2,
                name: 'Острый соус',
                image: '@/assets/img/sauce.svg',
                price: 30
              },
              {
                id: 3,
                name: 'Картошка из печи',
                image: '@/assets/img/potato.svg',
                price: 170
              }
            ]
          },
          {
            id: '11199930',
            total: 1200,
            address: profileStore.defaultDeliveryAddress?.formatted || 'Невский пр., д. 15, кв. 42',
            items: [
              {
                id: 3,
                name: 'Маргарита',
                price: 650,
                quantity: 1,
                description: '30 см, на тонком тесте. Соус: томатный. Начинка: грибы, лук, ветчина, пармезан, ананас'
              },
              {
                id: 4,
                name: 'Пепперони',
                price: 720,
                quantity: 1,
                description: '30 см, на тонком тесте. Соус: томатный. Начинка: пепперони, моцарелла'
              }
            ],
            additional: []
          }
        ]
      }
      
      return profileStore.orderHistory.map(order => ({
        id: order.id,
        total: order.totalAmount || 0,
        address: order.deliveryAddress?.formatted || 'Адрес не указан',
        items: order.pizzas?.map(pizza => ({
          id: pizza.id || Date.now(),
          name: pizza.name,
          price: pizza.price || 0,
          quantity: pizza.quantity || 1,
          details: pizza.details || {
            size: pizza.size || 'Не указан',
            dough: pizza.dough || 'Не указано',
            sauce: pizza.sauce || 'Не указан',
            ingredients: pizza.ingredients || 'Не указаны'
          }
        })) || [],
        additional: order.misc?.map(miscItem => ({
          id: miscItem.id,
          name: miscItem.name,
          image: miscItem.image,
          price: miscItem.price
        })) || []
      }))
    })
    
    const deleteOrder = async (orderId) => {
      if (confirm('Вы уверены, что хотите удалить заказ?')) {
        try {
          const orderIndex = profileStore.orderHistory.findIndex(order => order.id === orderId)
          if (orderIndex !== -1) {
            profileStore.orderHistory.splice(orderIndex, 1)
            console.log(`Заказ #${orderId} удален`)
          }
        } catch (error) {
          console.error('Ошибка удаления заказа:', error)
          alert('Ошибка при удалении заказа')
        }
      }
    }
    
    const repeatOrder = async (orderId) => {
      try {
        const order = orders.value.find(order => order.id === orderId)
        if (!order) {
          throw new Error('Заказ не найден')
        }
        
        cartStore.clearCart()
        
        order.items.forEach(item => {
          const cartItem = {
            id: `repeat-${Date.now()}-${Math.random()}`,
            name: item.name,
            type: 'pizza',
            price: item.price,
            quantity: item.quantity,
            ...item.details
          }
          cartStore.addItem(cartItem)
        })
        
        order.additional.forEach(item => {
          cartStore.addMiscItem(item.id)
        })
        
        cartStore.saveToStorage()
        
        console.log('Повтор заказа:', order)
        alert(`Заказ #${orderId} добавлен в корзину!`)
        router.push({ name: 'cart' })
        
      } catch (error) {
        console.error('Ошибка повтора заказа:', error)
        alert('Ошибка при повторе заказа: ' + error.message)
      }
    }
    
    return {
      orders,
      deleteOrder,
      repeatOrder
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-typography";

.layout__title {
  margin-bottom: 30px;
}

.order-empty {
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

.order {
  margin-bottom: 30px;
  padding: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.order__wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(ds-colors.$purple-400, 0.2);
}

.order__number {
  font-size: 18px;
  font-weight: 700;
  line-height: 21px;
  flex: 1;
  
  b {
    color: ds-colors.$black;
  }
}

.order__sum {
  font-size: 16px;
  font-weight: 400;
  line-height: 19px;
  color: ds-colors.$purple-800;
  
  span {
    display: block;
  }
}

.order__button {
  flex-shrink: 0;
  
  .button {
    padding: 8px 16px;
    min-width: 100px;
  }
}

.order__list {
  list-style: none;
  margin: 0 0 20px 0;
  padding: 0;
  
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.order__price {
  font-size: 16px;
  font-weight: 700;
  line-height: 19px;
  margin: 0;
  flex-shrink: 0;
  color: ds-colors.$black;
}

.order__additional {
  list-style: none;
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid rgba(ds-colors.$purple-400, 0.2);
  
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  
  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  p {
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    span {
      color: ds-colors.$black;
    }
    
    b {
      color: ds-colors.$green-500;
    }
  }
}

.order__address {
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  margin: 20px 0 0 0;
  padding-top: 16px;
  border-top: 1px solid rgba(ds-colors.$purple-400, 0.2);
  color: ds-colors.$purple-800;
}

@media (max-width: 768px) {
  .order__wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .order__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order__additional {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
