<template>
  <main class="pizza-constructor">
    <form @submit.prevent="handleOrderSubmit">
      <div class="content__wrapper">
        <h1 class="title title--big">Конструктор пиццы</h1>

        <!-- Шаг 1: Выбор теста -->
        <div class="content__dough">
          <DoughStep
            :selected-dough-id="pizzaState.selectedDough?.id"
            @dough-changed="handleDoughChange"
          />
        </div>

        <!-- Шаг 2: Выбор размера -->
        <div class="content__diameter">
          <SizeStep
            :selected-size-id="pizzaState.selectedSize?.id"
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
                :selected-sauce-id="pizzaState.selectedSauce?.id"
                @sauce-changed="handleSauceChange"
              />

              <!-- Выбор ингредиентов с drag-and-drop -->
              <IngredientsStep
                :selected-ingredients="pizzaState.selectedIngredients"
                @ingredients-changed="handleIngredientsChange"
                @ingredient-dragged="handleIngredientDragged"
              />
            </div>
          </div>
        </div>

        <!-- Шаг 4: Отображение пиццы и оформление заказа -->
        <div class="content__pizza">
          <PizzaCanvas
            :selected-dough="pizzaState.selectedDough"
            :selected-size="pizzaState.selectedSize"
            :selected-sauce="pizzaState.selectedSauce"
            :selected-ingredients="pizzaState.selectedIngredients"
            :all-ingredients="allIngredients"
            @pizza-changed="handlePizzaNameChange"
            @order-pizza="handleOrderFromCanvas"
          />
        </div>
      </div>
    </form>

    <!-- Уведомление о drag-and-drop -->
    <div v-if="isDraggingIngredient" class="drag-notification">
      <p>💫 Перетащите ингредиент на пиццу для добавления</p>
    </div>

    <!-- Debug панель (только в development) -->
    <div v-if="showDebugInfo" class="debug-panel">
      <h3>🔍 Debug Info</h3>
      <p><strong>Тесто:</strong> {{ debugInfo.doughInfo }}</p>
      <p><strong>Размер:</strong> {{ debugInfo.sizeInfo }}</p>
      <p><strong>Соус:</strong> {{ debugInfo.sauceInfo }}</p>
      <p><strong>Ингредиенты:</strong> {{ debugInfo.ingredientsInfo }}</p>
      <p><strong>Цена:</strong> {{ totalPrice }} ₽</p>
      <p><strong>Готов к заказу:</strong> {{ canOrder ? "✅" : "❌" }}</p>
    </div>
  </main>
</template>

<script>
import { reactive, computed, ref, watch } from "vue";
import {
  DoughStep,
  SizeStep,
  SauceStep,
  IngredientsStep,
  PizzaCanvas,
} from "@/modules/constructor";
import ingredientsData from "@/mocks/ingredients.json";

export default {
  name: "HomeView",
  components: {
    DoughStep,
    SizeStep,
    SauceStep,
    IngredientsStep,
    PizzaCanvas,
  },
  setup() {
    // Реактивное состояние пиццы
    const pizzaState = reactive({
      name: "",
      selectedDough: null,
      selectedSize: null,
      selectedSauce: null,
      selectedIngredients: {},
    });

    // Дополнительное реактивное состояние
    const isDraggingIngredient = ref(false);
    const allIngredients = ref(ingredientsData);
    const showDebugInfo = ref(import.meta.env.DEV);

    // Computed свойства для расчетов
    const totalPrice = computed(() => {
      let price = 0;

      // Базовая цена компонентов
      if (pizzaState.selectedDough)
        price += pizzaState.selectedDough.price || 0;
      if (pizzaState.selectedSize) price += pizzaState.selectedSize.price || 0;
      if (pizzaState.selectedSauce)
        price += pizzaState.selectedSauce.price || 0;

      // Цена ингредиентов
      Object.entries(pizzaState.selectedIngredients).forEach(
        ([ingredientId, count]) => {
          const ingredient = allIngredients.value.find(
            (ing) => ing.id == ingredientId,
          );
          if (ingredient && count > 0) {
            price += (ingredient.price || 0) * count;
          }
        },
      );

      return price;
    });

    const canOrder = computed(() => {
      return (
        pizzaState.name?.trim().length > 0 &&
        pizzaState.selectedDough &&
        pizzaState.selectedSize &&
        pizzaState.selectedSauce
      );
    });

    const ingredientsList = computed(() => {
      const ingredients = [];

      Object.entries(pizzaState.selectedIngredients).forEach(
        ([ingredientId, count]) => {
          const ingredient = allIngredients.value.find(
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
    });

    const orderSummary = computed(() => {
      return {
        name: pizzaState.name,
        selectedDough: pizzaState.selectedDough,
        selectedSize: pizzaState.selectedSize,
        selectedSauce: pizzaState.selectedSauce,
        selectedIngredients: { ...pizzaState.selectedIngredients },
        totalPrice: totalPrice.value,
        ingredientsList: ingredientsList.value,
        canOrder: canOrder.value,
      };
    });

    // Debug info computed
    const debugInfo = computed(() => {
      return {
        doughInfo: pizzaState.selectedDough
          ? `${pizzaState.selectedDough.name} (${pizzaState.selectedDough.price}₽)`
          : "не выбрано",
        sizeInfo: pizzaState.selectedSize
          ? `${pizzaState.selectedSize.name} (${pizzaState.selectedSize.price}₽)`
          : "не выбрано",
        sauceInfo: pizzaState.selectedSauce
          ? `${pizzaState.selectedSauce.name} (${pizzaState.selectedSauce.price}₽)`
          : "не выбрано",
        ingredientsInfo:
          Object.keys(pizzaState.selectedIngredients).length > 0
            ? ingredientsList.value
            : "не выбраны",
      };
    });

    // Методы обработки изменений компонентов
    const handleDoughChange = (dough) => {
      pizzaState.selectedDough = dough;
      console.log("🥖 Выбрано тесто:", dough);
    };

    const handleSizeChange = (size) => {
      pizzaState.selectedSize = size;
      console.log("📏 Выбран размер:", size);
    };

    const handleSauceChange = (sauce) => {
      pizzaState.selectedSauce = sauce;
      console.log("🥫 Выбран соус:", sauce);
    };

    const handleIngredientsChange = (ingredients) => {
      pizzaState.selectedIngredients = ingredients;
      console.log("🧀 Изменены ингредиенты:", ingredients);
    };

    const handlePizzaNameChange = (changes) => {
      if (changes.pizzaName !== undefined) {
        pizzaState.name = changes.pizzaName;
      }
      if (changes.selectedIngredients) {
        pizzaState.selectedIngredients = changes.selectedIngredients;
      }
    };

    const handleIngredientDragged = (event) => {
      isDraggingIngredient.value = event.type === "dragstart";

      if (event.type === "dragstart") {
        console.log("🎯 Начато перетаскивание:", event.ingredient.name);
      } else if (event.type === "dragend") {
        console.log("🎯 Завершено перетаскивание:", event.ingredient.name);
      }
    };

    const handleOrderFromCanvas = (orderData) => {
      processOrder(orderData);
    };

    const handleOrderSubmit = () => {
      if (canOrder.value) {
        processOrder(orderSummary.value);
      } else {
        showValidationError();
      }
    };

    const processOrder = (order) => {
      console.log("🍕 Обработка заказа:", order);

      // Показываем уведомление об успешном заказе
      alert(`🍕 Заказ "${order.name}" оформлен!
      
📋 Детали заказа:
━━━━━━━━━━━━━━━━━━━━
🥖 Тесто: ${order.selectedDough?.name || "не выбрано"}
📏 Размер: ${order.selectedSize?.name || "не выбрано"}
🥫 Соус: ${order.selectedSauce?.name || "не выбрано"}
🧀 Ингредиенты: ${order.ingredientsList}
💰 Итого: ${order.totalPrice} ₽
━━━━━━━━━━━━━━━━━━━━`);

      // Сброс формы после заказа
      resetPizzaState();
    };

    const showValidationError = () => {
      const errors = [];

      if (!pizzaState.name?.trim()) errors.push("Название пиццы");
      if (!pizzaState.selectedDough) errors.push("Тесто");
      if (!pizzaState.selectedSize) errors.push("Размер");
      if (!pizzaState.selectedSauce) errors.push("Соус");

      alert(`❌ Заполните обязательные поля:
${errors.map((field) => `• ${field}`).join("\n")}`);
    };

    const resetPizzaState = () => {
      pizzaState.name = "";
      pizzaState.selectedDough = null;
      pizzaState.selectedSize = null;
      pizzaState.selectedSauce = null;
      pizzaState.selectedIngredients = {};

      console.log("🔄 Состояние пиццы сброшено");
    };

    // Наблюдение за изменениями состояния (для отладки)
    watch(
      () => pizzaState,
      (newState) => {
        console.log("📊 Состояние пиццы обновлено:", {
          name: newState.name,
          totalPrice: totalPrice.value,
          canOrder: canOrder.value,
        });
      },
      { deep: true },
    );

    return {
      // Реактивное состояние
      pizzaState,
      isDraggingIngredient,
      allIngredients,
      showDebugInfo,

      // Computed свойства
      totalPrice,
      canOrder,
      ingredientsList,
      orderSummary,
      debugInfo,

      // Методы
      handleDoughChange,
      handleSizeChange,
      handleSauceChange,
      handleIngredientsChange,
      handlePizzaNameChange,
      handleIngredientDragged,
      handleOrderFromCanvas,
      handleOrderSubmit,
      processOrder,
      resetPizzaState,
    };
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

// Removed duplicate styles - now using common-components.scss

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

// Debug panel
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;

  padding: 16px;
  background: rgba($black, 0.9);
  color: $white;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  max-width: 300px;

  h3 {
    margin: 0 0 8px 0;
    color: #4caf50;
  }

  p {
    margin: 4px 0;
    line-height: 1.4;
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

  .debug-panel {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 20px;
    width: 90%;
  }
}
</style>
