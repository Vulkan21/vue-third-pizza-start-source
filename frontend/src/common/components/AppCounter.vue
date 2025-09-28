<template>
  <div class="counter">
    <button 
      type="button" 
      class="counter__button counter__button--minus"
      :disabled="isMinusDisabled"
      @click="decrement"
    >
      <span class="visually-hidden">{{ minusLabel || 'Меньше' }}</span>
    </button>
    
    <input 
      type="text" 
      :name="name"
      class="counter__input" 
      :value="displayValue"
      :readonly="readonly"
      @input="handleInput"
      @blur="handleBlur"
    />
    
    <button 
      type="button" 
      class="counter__button counter__button--plus"
      :class="{ 'counter__button--orange': orangeStyle }"
      :disabled="isPlusDisabled"
      @click="increment"
    >
      <span class="visually-hidden">{{ plusLabel || 'Больше' }}</span>
    </button>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {
  name: 'AppCounter',
  props: {
    // Основное значение счетчика
    modelValue: {
      type: Number,
      default: 0
    },
    
    // Минимальное значение
    min: {
      type: Number,
      default: 0
    },
    
    // Максимальное значение
    max: {
      type: Number,
      default: Infinity
    },
    
    // Шаг изменения значения
    step: {
      type: Number,
      default: 1
    },
    
    // Имя поля для формы
    name: {
      type: String,
      default: 'counter'
    },
    
    // Доступно ли редактирование поля ввода
    readonly: {
      type: Boolean,
      default: false
    },
    
    // Использовать ли оранжевый стиль для кнопки плюс
    orangeStyle: {
      type: Boolean,
      default: false
    },
    
    // Кастомные лейблы для accessibility
    minusLabel: {
      type: String,
      default: ''
    },
    
    plusLabel: {
      type: String,
      default: ''
    }
  },
  
  emits: ['update:modelValue', 'change'],
  
  setup(props, { emit }) {
    const internalValue = ref(props.modelValue)
    
    // Отслеживаем изменения внешнего значения
    watch(() => props.modelValue, (newValue) => {
      internalValue.value = newValue
    })
    
    // Вычисляемые свойства для состояния кнопок
    const isMinusDisabled = computed(() => {
      return internalValue.value <= props.min
    })
    
    const isPlusDisabled = computed(() => {
      return internalValue.value >= props.max
    })
    
    // Отображаемое значение (с валидацией)
    const displayValue = computed(() => {
      return Math.max(props.min, Math.min(props.max, internalValue.value))
    })
    
    // Функция для валидации и нормализации значения
    const normalizeValue = (value) => {
      const numValue = typeof value === 'number' ? value : parseInt(value, 10)
      
      if (isNaN(numValue)) {
        return internalValue.value
      }
      
      return Math.max(props.min, Math.min(props.max, numValue))
    }
    
    // Обновление значения
    const updateValue = (newValue) => {
      const normalizedValue = normalizeValue(newValue)
      
      if (normalizedValue !== internalValue.value) {
        internalValue.value = normalizedValue
        emit('update:modelValue', normalizedValue)
        emit('change', normalizedValue)
      }
    }
    
    // Увеличение значения
    const increment = () => {
      if (!isPlusDisabled.value) {
        updateValue(internalValue.value + props.step)
      }
    }
    
    // Уменьшение значения
    const decrement = () => {
      if (!isMinusDisabled.value) {
        updateValue(internalValue.value - props.step)
      }
    }
    
    // Обработка ввода в поле
    const handleInput = (event) => {
      if (!props.readonly) {
        const value = event.target.value
        updateValue(value)
      }
    }
    
    // Обработка потери фокуса (дополнительная валидация)
    const handleBlur = (event) => {
      if (!props.readonly) {
        // Обновляем отображаемое значение до нормализованного
        event.target.value = displayValue.value
      }
    }
    
    return {
      displayValue,
      isMinusDisabled,
      isPlusDisabled,
      increment,
      decrement,
      handleInput,
      handleBlur
    }
  }
}
</script>

<style lang="scss" scoped>
// Стили теперь подключены глобально через common-components.scss
// Никаких дополнительных стилей здесь не требуется
</style>