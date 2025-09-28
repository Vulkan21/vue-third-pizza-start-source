// Export all common components
export { default as AppCounter } from './AppCounter.vue'
export { default as AppButton } from './AppButton.vue'
export { default as AppDrag } from './AppDrag.vue'
export { default as AppDrop } from './AppDrop.vue'
export { default as AppInput } from './AppInput.vue'
export { default as AppRadio } from './AppRadio.vue'
export { default as DoughSelector } from './DoughSelector.vue'
export { default as IngredientSelector } from './IngredientSelector.vue'
export { default as SizeSelector } from './SizeSelector.vue'

// Function to register global components
export function registerGlobalComponents(app) {
  // Если нужно зарегистрировать компоненты глобально, раскомментируйте строки ниже:
  // app.component('AppCounter', AppCounter)
  // app.component('AppButton', AppButton)
  // app.component('AppInput', AppInput)
  // app.component('AppRadio', AppRadio)
}