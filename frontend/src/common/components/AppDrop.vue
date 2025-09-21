<template>
  <div
    :class="[
      'app-drop',
      {
        'app-drop--over': isDragOver,
        'app-drop--valid': isDragOver && isValidDrop,
      },
    ]"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <slot :is-drag-over="isDragOver" :is-valid-drop="isValidDrop" />
  </div>
</template>

<script>
export default {
  name: "AppDrop",
  props: {
    /**
     * Разрешенные типы данных для drop
     */
    acceptedTypes: {
      type: Array,
      default: () => ["text/plain"],
    },
    /**
     * Функция валидации для проверки возможности drop
     */
    validator: {
      type: Function,
      default: () => true,
    },
    /**
     * Отключить drop зону
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["dragenter", "dragleave", "drop", "invalid-drop"],
  data() {
    return {
      isDragOver: false,
      isValidDrop: false,
    };
  },
  methods: {
    handleDragOver(event) {
      if (this.disabled) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },

    handleDragEnter(event) {
      if (this.disabled) return;

      event.preventDefault();
      this.isDragOver = true;

      // Проверяем, можем ли мы принять этот тип данных
      this.isValidDrop = this.acceptedTypes.some((type) =>
        event.dataTransfer.types.includes(type),
      );

      this.$emit("dragenter", {
        event,
        isValid: this.isValidDrop,
      });
    },

    handleDragLeave(event) {
      if (this.disabled) return;

      // Проверяем, что мы действительно покидаем drop зону
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragOver = false;
        this.isValidDrop = false;

        this.$emit("dragleave", { event });
      }
    },

    handleDrop(event) {
      if (this.disabled) return;

      event.preventDefault();
      this.isDragOver = false;
      this.isValidDrop = false;

      // Получаем данные из первого подходящего типа
      let data = null;
      let dataType = null;

      for (const type of this.acceptedTypes) {
        if (event.dataTransfer.types.includes(type)) {
          data = event.dataTransfer.getData(type);
          dataType = type;
          break;
        }
      }

      // Парсим JSON если это не строка
      if (data && dataType === "application/json") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.warn("Failed to parse JSON data:", e);
        }
      }

      // Проверяем валидность через пользовательский валидатор
      const isValid = this.validator(data, event);

      if (isValid) {
        this.$emit("drop", {
          event,
          data,
          dataType,
        });
      } else {
        this.$emit("invalid-drop", {
          event,
          data,
          dataType,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.app-drop {
  position: relative;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;

  &--over {
    background-color: rgba(65, 182, 25, 0.1);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px dashed #41b619;
      border-radius: 8px;
      pointer-events: none;
    }
  }

  &--valid {
    background-color: rgba(65, 182, 25, 0.2);

    &::before {
      border-color: #38a413;
      border-style: solid;
    }
  }
}
</style>
