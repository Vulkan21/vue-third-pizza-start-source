<template>
  <PizzaConstructor @pizza-ordered="handlePizzaOrder" />
</template>

<script>
import PizzaConstructor from "@/modules/constructor/PizzaConstructor.vue";

export default {
  name: "HomeView",
  components: {
    PizzaConstructor,
  },
  methods: {
    handlePizzaOrder(orderData) {
      console.log("🍕 Заказ получен:", orderData);

      // Здесь можно добавить логику отправки заказа на сервер
      // Например:
      // await this.$api.orders.create(orderData)

      // Пример обработки заказа
      this.processOrder(orderData);
    },

    processOrder(order) {
      // Симуляция обработки заказа
      console.log(`
📋 Обработка заказа:
━━━━━━━━━━━━━━━━━━━━
🍕 ${order.name}
📏 ${order.selectedSize?.name}
🥖 ${order.selectedDough?.name}
🥫 ${order.selectedSauce?.name}
🧀 ${order.ingredientsList}
💰 ${order.totalPrice} ₽
━━━━━━━━━━━━━━━━━━━━
      `);

      // Здесь можно добавить:
      // - Сохранение в localStorage
      // - Отправку аналитики
      // - Редирект на страницу оплаты
      // - Добавление в корзину
    },
  },
};
</script>

<style scoped>
/* Стили для HomeView не нужны - все стили в PizzaConstructor */
</style>
