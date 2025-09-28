<template>
  <div>
    <div class="layout__title">
      <h1 class="title title--big">История заказов</h1>
    </div>

    <!-- Empty state -->
    <div v-if="orders.length === 0" class="sheet order-empty">
      <p>У вас пока нет заказов</p>
      <router-link :to="{ name: 'home' }" class="button">
        Создать первый заказ
      </router-link>
    </div>

    <!-- Orders list -->
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

        <!-- Additional items -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'OrdersView',
  setup() {
    const router = useRouter()
    
    // Mock orders data
    const orders = ref([
      {
        id: '11199929',
        total: 1564,
        address: 'Тест (или если адрес новый - писать целиком)',
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
        address: 'Невский пр., д. 15, кв. 42',
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
    ])
    
    // Methods
    const deleteOrder = (orderId) => {
      if (confirm('Вы уверены, что хотите удалить заказ?')) {
        const index = orders.value.findIndex(order => order.id === orderId)
        if (index !== -1) {
          orders.value.splice(index, 1)
          console.log(`Заказ #${orderId} удален`)
        }
      }
    }
    
    const repeatOrder = (orderId) => {
      const order = orders.value.find(order => order.id === orderId)
      if (order) {
        console.log('Повтор заказа:', order)
        alert(`Заказ #${orderId} добавлен в корзину!`)
        router.push({ name: 'cart' })
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
// Design System
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-typography";

.layout__title {
  margin-bottom: 30px;
}

.order-empty {
  text-align: center;
  padding: 60px 40px;
  
  p {
    @include ds-typography.r-s18-h21;
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
  @include ds-typography.b-s18-h21;
  flex: 1;
  
  b {
    color: ds-colors.$black;
  }
}

.order__sum {
  @include ds-typography.r-s16-h19;
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
  @include ds-typography.b-s16-h19;
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
    @include ds-typography.r-s14-h16;
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
  @include ds-typography.r-s14-h16;
  margin: 20px 0 0 0;
  padding-top: 16px;
  border-top: 1px solid rgba(ds-colors.$purple-400, 0.2);
  color: ds-colors.$purple-800;
}

// Responsive
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
