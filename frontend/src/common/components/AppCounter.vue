<template>
  <div :class="['app-counter', `app-counter--${variant}`]">
    <button
      type="button"
      class="app-counter__button app-counter__button--minus"
      :disabled="disabled || value <= min"
      @click="decrement"
    >
      <span class="visually-hidden">Меньше</span>
    </button>

    <input
      type="text"
      :name="name"
      class="app-counter__input"
      :value="displayValue"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur"
    />

    <button
      type="button"
      class="app-counter__button app-counter__button--plus"
      :disabled="disabled || value >= max"
      @click="increment"
    >
      <span class="visually-hidden">Больше</span>
    </button>
  </div>
</template>

<script>
export default {
  name: "AppCounter",
  props: {
    /**
     * Текущее значение
     */
    value: {
      type: Number,
      default: 0,
    },
    /**
     * Минимальное значение
     */
    min: {
      type: Number,
      default: 0,
    },
    /**
     * Максимальное значение
     */
    max: {
      type: Number,
      default: 100,
    },
    /**
     * Шаг изменения
     */
    step: {
      type: Number,
      default: 1,
    },
    /**
     * Имя для поля ввода
     */
    name: {
      type: String,
      default: "counter",
    },
    /**
     * Вариант стиля
     */
    variant: {
      type: String,
      default: "default",
      validator: (value) => ["default", "orange"].includes(value),
    },
    /**
     * Отключить счетчик
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:value", "change"],
  data() {
    return {
      inputValue: this.value.toString(),
    };
  },
  computed: {
    displayValue() {
      return this.inputValue;
    },
  },
  watch: {
    value(newValue) {
      this.inputValue = newValue.toString();
    },
  },
  methods: {
    increment() {
      const newValue = Math.min(this.value + this.step, this.max);
      this.updateValue(newValue);
    },

    decrement() {
      const newValue = Math.max(this.value - this.step, this.min);
      this.updateValue(newValue);
    },

    handleInput(event) {
      this.inputValue = event.target.value;
    },

    handleBlur() {
      const numericValue = parseInt(this.inputValue, 10);

      if (isNaN(numericValue)) {
        // Возвращаем к предыдущему значению
        this.inputValue = this.value.toString();
        return;
      }

      const clampedValue = Math.max(this.min, Math.min(this.max, numericValue));
      this.updateValue(clampedValue);
    },

    updateValue(newValue) {
      if (newValue !== this.value) {
        this.$emit("update:value", newValue);
        this.$emit("change", newValue);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// Design System Colors
$white: #ffffff;
$black: #000000;

$orange-100: #ff842b;
$orange-200: #ff6b00;
$orange-300: #ed6300;

$green-400: #48d618;
$green-500: #41b619;
$green-600: #38a413;

$purple-100: #f2eef5;
$purple-200: #f6ebff;
$purple-300: #ebdcf7;

// Design System Shadows
$shadow-regular: 0 0 0 2px rgba($green-500, 0.6);

// Typography Mixins
@mixin r-s14-h16 {
  font-size: 14px;
  font-weight: 400;
  font-style: normal;
  line-height: 16px;
}

// Center Mixins
@mixin p_center-all {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.app-counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 54px;

  &--orange {
    .app-counter__button--plus {
      background-color: $orange-200;

      &:hover:not(:active):not(:disabled) {
        background-color: $orange-100;
      }

      &:active:not(:disabled) {
        background-color: $orange-300;
      }
    }
  }
}

.app-counter__button {
  $size_icon: 50%;

  position: relative;
  display: block;

  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;

  cursor: pointer;
  transition: 0.3s;

  border: none;
  border-radius: 50%;
  outline: none;

  &--minus {
    background-color: $purple-100;

    &::before {
      @include p_center-all;

      width: $size_icon;
      height: 2px;

      content: "";

      border-radius: 2px;
      background-color: $black;
    }

    &:hover:not(:active):not(:disabled) {
      background-color: $purple-200;
    }

    &:active:not(:disabled) {
      background-color: $purple-300;
    }

    &:focus:not(:disabled) {
      box-shadow: $shadow-regular;
    }

    &:disabled {
      cursor: default;

      &::before {
        opacity: 0.1;
      }
    }
  }

  &--plus {
    background-color: $green-500;

    &::before {
      @include p_center-all;

      width: $size_icon;
      height: 2px;

      content: "";

      border-radius: 2px;
      background-color: $white;
    }

    &::after {
      @include p_center-all;

      width: $size_icon;
      height: 2px;

      content: "";
      transform: translate(-50%, -50%) rotate(90deg);

      border-radius: 2px;
      background-color: $white;
    }

    &:hover:not(:active):not(:disabled) {
      background-color: $green-400;
    }

    &:active:not(:disabled) {
      background-color: $green-600;
    }

    &:focus:not(:disabled) {
      box-shadow: $shadow-regular;
    }

    &:disabled {
      cursor: default;
      opacity: 0.3;
    }
  }
}

.app-counter__input {
  @include r-s14-h16;

  box-sizing: border-box;
  width: 22px;
  margin: 0;
  padding: 0 3px;

  text-align: center;

  color: $black;
  border: none;
  border-radius: 10px;
  outline: none;
  background-color: transparent;

  &:focus {
    box-shadow: inset $shadow-regular;
  }

  &:disabled {
    opacity: 0.5;
  }
}

// Visually hidden
.visually-hidden {
  position: absolute;

  overflow: hidden;
  clip: rect(0 0 0 0);

  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;

  white-space: nowrap;

  border: 0;

  clip-path: inset(100%);
}
</style>
