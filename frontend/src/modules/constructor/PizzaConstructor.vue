<template>
  <main class="pizza-constructor">
    <form @submit.prevent="handleOrder">
      <div class="content__wrapper">
        <h1 class="title title--big">Конструктор пиццы</h1>

        <!-- Шаг 1: Выбор теста -->
        <div class="content__dough">
          <DoughStep
            :selected-dough-id="pizza.selectedDough?.id"
            @dough-changed="handleDoughChange"
          />
        </div>

        <!-- Шаг 2: Выбор размера -->
        <div class="content__diameter">
          <SizeStep
            :selected-size-id="pizza.selectedSize?.id"
            @size-changed="handleSizeChange"
          />
        </div>

        <!-- Шаг 3: Выбор соуса и ингредиентов -->
        <div class="content__ingredients">
          <div class="sheet">
            <h2 class="title title--small sheet__title">
              Выберите ингредиенты
            </h2>

            <div class="sheet__content ingredients">
              <!-- Выбор соуса -->
              <SauceStep
                :selected-sauce-id="pizza.selectedSauce?.id"
                @sauce-changed="handleSauceChange"
              />

              <!-- Выбор ингредиентов с drag-and-drop -->
              <IngredientsStep
                :selected-ingredients="pizza.selectedIngredients"
                @ingredients-changed="handleIngredientsChange"
                @ingredient-dragged="handleIngredientDragged"
              />
            </div>
          </div>
        </div>

        <!-- Шаг 4: Отображение пиццы и оформление заказа -->
        <div class="content__pizza">
          <PizzaCanvas
            :selected-dough="pizza.selectedDough"
            :selected-size="pizza.selectedSize"
            :selected-sauce="pizza.selectedSauce"
            :selected-ingredients="pizza.selectedIngredients"
            :all-ingredients="allIngredients"
            @pizza-changed="handlePizzaChange"
            @order-pizza="handleOrder"
          />
        </div>
      </div>
    </form>

    <!-- Уведомление о drag-and-drop -->
    <div v-if="isDragging" class="drag-notification">
      <p>💫 Перетащите ингредиент на пиццу для добавления</p>
    </div>
  </main>
</template>

<script>
import DoughStep from "./DoughStep.vue";
import SizeStep from "./SizeStep.vue";
import SauceStep from "./SauceStep.vue";
import IngredientsStep from "./IngredientsStep.vue";
import PizzaCanvas from "./PizzaCanvas.vue";

import ingredientsData from "@/mocks/ingredients.json";

export default {
  name: "PizzaConstructor",
  components: {
    DoughStep,
    SizeStep,
    SauceStep,
    IngredientsStep,
    PizzaCanvas,
  },
  emits: ["pizza-ordered"],
  data() {
    return {
      allIngredients: ingredientsData,
      isDragging: false,
      pizza: {
        name: "",
        selectedDough: null,
        selectedSize: null,
        selectedSauce: null,
        selectedIngredients: {},
      },
    };
  },
  computed: {
    totalPrice() {
      let price = 0;

      if (this.pizza.selectedDough)
        price += this.pizza.selectedDough.price || 0;
      if (this.pizza.selectedSize) price += this.pizza.selectedSize.price || 0;
      if (this.pizza.selectedSauce)
        price += this.pizza.selectedSauce.price || 0;

      // Цена ингредиентов
      Object.entries(this.pizza.selectedIngredients).forEach(
        ([ingredientId, count]) => {
          const ingredient = this.allIngredients.find(
            (ing) => ing.id == ingredientId,
          );
          if (ingredient && count > 0) {
            price += (ingredient.price || 0) * count;
          }
        },
      );

      return price;
    },

    pizzaSummary() {
      return {
        ...this.pizza,
        totalPrice: this.totalPrice,
        ingredientsList: this.getIngredientsText(),
      };
    },
  },
  methods: {
    handleDoughChange(dough) {
      this.pizza.selectedDough = dough;
      this.logPizzaChange("Изменено тесто", dough);
    },

    handleSizeChange(size) {
      this.pizza.selectedSize = size;
      this.logPizzaChange("Изменен размер", size);
    },

    handleSauceChange(sauce) {
      this.pizza.selectedSauce = sauce;
      this.logPizzaChange("Изменен соус", sauce);
    },

    handleIngredientsChange(ingredients) {
      this.pizza.selectedIngredients = ingredients;
      this.logPizzaChange("Изменены ингредиенты", ingredients);
    },

    handlePizzaChange(changes) {
      Object.assign(this.pizza, changes);
    },

    handleIngredientDragged(event) {
      this.isDragging = event.type === "dragstart";
    },

    handleOrder(orderData = null) {
      const order = orderData || this.pizzaSummary;

      // Проверяем, что заказ можно оформить
      if (!this.canOrder()) {
        this.showOrderError();
        return;
      }

      // Эмитируем событие заказа
      this.$emit("pizza-ordered", order);

      // Показываем уведомление
      this.showOrderSuccess(order);

      // Сбрасываем конструктор
      this.resetConstructor();
    },

    canOrder() {
      return (
        this.pizza.name?.trim().length > 0 &&
        this.pizza.selectedDough &&
        this.pizza.selectedSize &&
        this.pizza.selectedSauce
      );
    },

    showOrderSuccess(order) {
      alert(`🍕 Заказ оформлен!
      
Пицца: ${order.name}
Тесто: ${order.selectedDough.name}
Размер: ${order.selectedSize.name}
Соус: ${order.selectedSauce.name}
Ингредиенты: ${order.ingredientsList}

Итого: ${order.totalPrice} ₽`);
    },

    showOrderError() {
      alert(
        "❌ Заполните все обязательные поля:\n- Название пиццы\n- Тесто\n- Размер\n- Соус",
      );
    },

    resetConstructor() {
      this.pizza = {
        name: "",
        selectedDough: null,
        selectedSize: null,
        selectedSauce: null,
        selectedIngredients: {},
      };
    },

    getIngredientsText() {
      const ingredients = [];

      Object.entries(this.pizza.selectedIngredients).forEach(
        ([ingredientId, count]) => {
          const ingredient = this.allIngredients.find(
            (ing) => ing.id == ingredientId,
          );
          if (ingredient && count > 0) {
            ingredients.push(`${ingredient.name} x${count}`);
          }
        },
      );

      return ingredients.length > 0
        ? ingredients.join(", ")
        : "без ингредиентов";
    },

    logPizzaChange(action, data) {
      console.log(`🍕 ${action}:`, data);
      console.log("Текущая пицца:", this.pizzaSummary);
    },
  },
};
</script>

<style lang="scss" scoped>
// Design System Colors
$white: #ffffff;
$black: #000000;
$green-500: #41b619;

.pizza-constructor {
  padding-top: 20px;
}

.content__wrapper {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  width: 920px;
  margin: 0 auto;
  padding-right: 2.12%;
  padding-bottom: 30px;
  padding-left: 2.12%;
}

.content__dough {
  width: 527px;
  margin-top: 15px;
  margin-right: auto;
  margin-bottom: 15px;
}

.content__diameter {
  width: 373px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.content__ingredients {
  width: 527px;
  margin-top: 15px;
  margin-right: auto;
  margin-bottom: 15px;
}

.content__pizza {
  width: 373px;
  margin-top: 15px;
  margin-bottom: 15px;
}

// Title styles
.title {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  color: $black;

  &--big {
    font-size: 36px;
    font-weight: 700;
    line-height: 42px;
  }

  &--small {
    font-size: 18px;
    font-weight: 700;
    line-height: 21px;
  }
}

// Sheet styles
.sheet {
  padding-top: 15px;
  border-radius: 8px;
  background-color: $white;
  box-shadow:
    0 4px 8px rgba($black, 0.04),
    0 0 2px rgba($black, 0.06),
    0 0 1px rgba($black, 0.04);
}

.sheet__title {
  padding-right: 18px;
  padding-left: 18px;
}

.sheet__content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  margin-top: 8px;
  padding-top: 18px;
  padding-right: 18px;
  padding-left: 18px;

  border-top: 1px solid rgba($green-500, 0.1);
}

.ingredients {
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 20px;
}

// Drag notification
.drag-notification {
  position: fixed;
  top: 20px;
  right: 20px;

  padding: 12px 20px;
  background: rgba($green-500, 0.95);
  color: $white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba($black, 0.15);

  z-index: 1000;

  animation: slideInRight 0.3s ease;

  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

// Responsive design
@media (max-width: 920px) {
  .content__wrapper {
    width: 100%;
    flex-direction: column;
    align-items: center;
  }

  .content__dough,
  .content__ingredients {
    width: 90%;
    margin-right: 0;
  }

  .content__diameter,
  .content__pizza {
    width: 90%;
  }
}
</style>
