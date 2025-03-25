<template>
  <div class="color-select" @click="toggleDropdown">
    <span class="color-preview" :style="{ backgroundColor: modelValue }"></span>
    <div v-if="open" class="dropdown">
      <div
        v-for="color in colors"
        :key="color"
        class="dropdown-item"
        @click.stop="selectColor(color)"
      >
        <span class="color-preview" :style="{ backgroundColor: color }"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  modelValue: { type: String, default: '' },
  colors: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

const open = ref(false);

const toggleDropdown = () => {
  open.value = !open.value;
};

const selectColor = (color) => {
  emit('update:modelValue', color);
  open.value = false;
};

watch(
  () => props.modelValue,
  (newVal) => {

  }
);
</script>

<style scoped>
.color-select {
  border: 1px solid #ccc;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  user-select: none;
}
.color-text {
  margin-left: 8px;
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  width: 100%;
  z-index: 10;
}
.dropdown-item {
  padding: 4px 8px;
  display: flex;
  align-items: center;
}
.dropdown-item:hover {
  background: #f0f0f0;
}
.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ccc;
}
</style>
