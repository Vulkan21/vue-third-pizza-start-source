<template>
  <main class="pizza-constructor">
    <form @submit.prevent="handleOrderSubmit">
      <div class="content__wrapper">
        <h1 class="title title--big">Конструктор пиццы</h1>

        
        <div class="content__dough">
          <DoughStep
            :selected-dough-id="pizzaState.selectedDough?.id"
            @dough-changed="handleDoughChange"
          />
        </div>

        
        <div class="content__diameter">
          <SizeStep
            :selected-size-id="pizzaState.selectedSize?.id"
            @size-changed="handleSizeChange"
          />
        </div>

        
        <div class="content__ingredients">
          <div class="sheet">
            <h2 class="title title--small sheet__title">
              Выберите ингредиенты
            </h2>

            <div class="sheet__content ingredients">
              
              <SauceStep
                :selected-sauce-id="pizzaState.selectedSauce?.id"
                @sauce-changed="handleSauceChange"
              />

              
              <IngredientsStep
                :selected-ingredients="pizzaState.selectedIngredients"
                @ingredients-changed="handleIngredientsChange"
                @ingredient-dragged="handleIngredientDragged"
              />
            </div>
          </div>
        </div>

        
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

    
    <div v-if="isDraggingIngredient" class="drag-notification">
      <p>💫 Перетащите ингредиент на пиццу для добавления</p>
    </div>

    
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
import { computed, ref, watch, onMounted } from "vue";
import {
  DoughStep,
  SizeStep,
  SauceStep,
  IngredientsStep,
  PizzaCanvas,
} from "@/modules/constructor";
import { usePizzaStore, useCartStore, useDataStore } from "@/stores";

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
    const pizzaStore = usePizzaStore();
    const cartStore = useCartStore();
    const dataStore = useDataStore();

    const isDraggingIngredient = ref(false);
    const showDebugInfo = ref(import.meta.env.DEV);

    onMounted(async () => {
      await pizzaStore.loadConstructorData();
    });

    const totalPrice = computed(() => pizzaStore.currentPizza.price);
    const canOrder = computed(() => pizzaStore.isPizzaReady);
    const allIngredients = computed(() => pizzaStore.ingredients);

    const ingredientsList = computed(() => {
      return pizzaStore.selectedIngredientsDetails
        .map(ing => `${ing.name} x${ing.quantity}`)
        .join(", ") || "без ингредиентов";
    });

    const orderSummary = computed(() => {
      return {
        name: pizzaStore.currentPizza.name,
        selectedDough: pizzaStore.getDoughById(pizzaStore.currentPizza.doughId),
        selectedSize: pizzaStore.getSizeById(pizzaStore.currentPizza.sizeId),
        selectedSauce: pizzaStore.getSauceById(pizzaStore.currentPizza.sauceId),
        selectedIngredients: pizzaStore.currentPizza.ingredients,
        totalPrice: totalPrice.value,
        ingredientsList: ingredientsList.value,
        canOrder: canOrder.value,
      };
    });

    const debugInfo = computed(() => {
      const dough = pizzaStore.getDoughById(pizzaStore.currentPizza.doughId);
      const size = pizzaStore.getSizeById(pizzaStore.currentPizza.sizeId);
      const sauce = pizzaStore.getSauceById(pizzaStore.currentPizza.sauceId);
      
      return {
        doughInfo: dough ? `${dough.name} (${dough.price}₽)` : "не выбрано",
        sizeInfo: size ? `${size.name} (${size.multiplier}x)` : "не выбрано",
        sauceInfo: sauce ? `${sauce.name} (${sauce.price}₽)` : "не выбрано",
        ingredientsInfo: pizzaStore.selectedIngredientsDetails.length > 0 
          ? ingredientsList.value
          : "не выбраны",
      };
    });

    const handleDoughChange = (dough) => {
      pizzaStore.selectDough(dough.id);
      console.log("🥖 Выбрано тесто:", dough);
    };

    const handleSizeChange = (size) => {
      pizzaStore.selectSize(size.id);
      console.log("📏 Выбран размер:", size);
    };

    const handleSauceChange = (sauce) => {
      pizzaStore.selectSauce(sauce.id);
      console.log("🥫 Выбран соус:", sauce);
    };

    const handleIngredientsChange = (ingredients) => {
      Object.entries(ingredients).forEach(([ingredientId, quantity]) => {
        if (quantity > 0) {
          pizzaStore.setIngredientQuantity(parseInt(ingredientId), quantity);
        } else {
          pizzaStore.removeIngredient(parseInt(ingredientId));
        }
      });
      console.log("🧀 Изменены ингредиенты:", ingredients);
    };

    const handlePizzaNameChange = (changes) => {
      if (changes.pizzaName !== undefined) {
        pizzaStore.setPizzaName(changes.pizzaName);
      }
      if (changes.selectedIngredients) {
        handleIngredientsChange(changes.selectedIngredients);
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

      try {
        const pizzaForCart = pizzaStore.getPizzaForCart();
        
        cartStore.addItem(pizzaForCart);

        alert(`🍕 Пицца "${pizzaForCart.name}" добавлена в корзину!
        
📋 Детали:
━━━━━━━━━━━━━━━━━━━━
🥖 Тесто: ${pizzaForCart.dough}
📏 Размер: ${pizzaForCart.size}
🥫 Соус: ${pizzaForCart.sauce}
🧀 Ингредиенты: ${pizzaForCart.ingredientsText}
💰 Цена: ${pizzaForCart.price} ₽
━━━━━━━━━━━━━━━━━━━━`);

        pizzaStore.resetPizza();
      } catch (error) {
        console.error("Ошибка при добавлении в корзину:", error);
        alert("❌ Ошибка при добавлении в корзину: " + error.message);
      }
    };

    const showValidationError = () => {
      const validation = pizzaStore.validatePizza();
      
      alert(`❌ Заполните обязательные поля:
${validation.errors.map((field) => `• ${field}`).join("\n")}`);
    };

    const resetPizzaState = () => {
      pizzaStore.resetPizza();
      console.log("🔄 Состояние пиццы сброшено");
    };

    watch(
      () => pizzaStore.currentPizza,
      (newState) => {
        console.log("📊 Состояние пиццы обновлено:", {
          name: newState.name,
          totalPrice: totalPrice.value,
          canOrder: canOrder.value,
        });
      },
      { deep: true },
    );

    const pizzaState = computed(() => ({
      name: pizzaStore.currentPizza.name,
      selectedDough: pizzaStore.getDoughById(pizzaStore.currentPizza.doughId),
      selectedSize: pizzaStore.getSizeById(pizzaStore.currentPizza.sizeId),
      selectedSauce: pizzaStore.getSauceById(pizzaStore.currentPizza.sauceId),
      selectedIngredients: pizzaStore.currentPizza.ingredients.reduce((acc, ing) => {
        acc[ing.ingredientId] = ing.quantity;
        return acc;
      }, {}),
    }));

    return {
      pizzaState,
      isDraggingIngredient,
      allIngredients,
      showDebugInfo,

      totalPrice,
      canOrder,
      ingredientsList,
      orderSummary,
      debugInfo,

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


.ingredients {
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 20px;
}

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
