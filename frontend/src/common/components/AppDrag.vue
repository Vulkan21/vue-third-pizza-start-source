<template>
  <div
    :class="['app-drag', { 'app-drag--dragging': isDragging }]"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @drag="handleDrag"
    @dragend="handleDragEnd"
  >
    <slot :is-dragging="isDragging" />
  </div>
</template>

<script>
export default {
  name: "AppDrag",
  props: {
    /**
     * Данные для передачи при перетаскивании
     */
    data: {
      type: [Object, String, Number],
      default: null,
    },
    /**
     * Можно ли перетаскивать элемент
     */
    draggable: {
      type: Boolean,
      default: true,
    },
    /**
     * Тип данных для drag and drop
     */
    dataType: {
      type: String,
      default: "text/plain",
    },
  },
  emits: ["dragstart", "drag", "dragend"],
  data() {
    return {
      isDragging: false,
    };
  },
  methods: {
    handleDragStart(event) {
      if (!this.draggable) return;

      this.isDragging = true;

      // Устанавливаем данные для передачи
      if (this.data !== null) {
        const dataString =
          typeof this.data === "string" ? this.data : JSON.stringify(this.data);
        event.dataTransfer.setData(this.dataType, dataString);
      }

      // Настраиваем эффект перетаскивания
      event.dataTransfer.effectAllowed = "move";

      this.$emit("dragstart", {
        event,
        data: this.data,
      });
    },

    handleDrag(event) {
      this.$emit("drag", {
        event,
        data: this.data,
      });
    },

    handleDragEnd(event) {
      this.isDragging = false;

      this.$emit("dragend", {
        event,
        data: this.data,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.app-drag {
  cursor: grab;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  &--dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.02);
  }
}
</style>
