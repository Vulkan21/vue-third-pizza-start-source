// Импортируем компоненты
import AppDrag from "./AppDrag.vue";
import AppDrop from "./AppDrop.vue";
import AppButton from "./AppButton.vue";
import AppCounter from "./AppCounter.vue";
import AppRadio from "./AppRadio.vue";
import AppInput from "./AppInput.vue";
import DoughSelector from "./DoughSelector.vue";
import SizeSelector from "./SizeSelector.vue";
import IngredientSelector from "./IngredientSelector.vue";

// Экспортируем компоненты
export {
  AppDrag,
  AppDrop,
  AppButton,
  AppCounter,
  AppRadio,
  AppInput,
  DoughSelector,
  SizeSelector,
  IngredientSelector,
};

// Функция для глобальной регистрации всех компонентов
export function registerGlobalComponents(app) {
  // Drag and Drop компоненты
  app.component("AppDrag", AppDrag);
  app.component("AppDrop", AppDrop);

  // Базовые UI компоненты
  app.component("AppButton", AppButton);
  app.component("AppCounter", AppCounter);
  app.component("AppRadio", AppRadio);
  app.component("AppInput", AppInput);

  // Специализированные компоненты
  app.component("DoughSelector", DoughSelector);
  app.component("SizeSelector", SizeSelector);
  app.component("IngredientSelector", IngredientSelector);
}

// Объект со всеми компонентами для удобства
export const CommonComponents = {
  AppDrag,
  AppDrop,
  AppButton,
  AppCounter,
  AppRadio,
  AppInput,
  DoughSelector,
  SizeSelector,
  IngredientSelector,
};

export default CommonComponents;
