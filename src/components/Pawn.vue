<template>
  <div v-if="pawnPosition" class="pawn" :style="pawnStyle"></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  pawnPosition: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    required: true
  }
});

const cellSize = 41;

const pawnStyle = computed(() => ({
  position: 'absolute',
  top: props.pawnPosition.row * cellSize + 'px',
  left: props.pawnPosition.col * cellSize + 'px',
  backgroundColor: props.color,
  width: 40 + 'px',
  height: 40 + 'px'
}));
</script>

<style scoped>
.pawn {
  border-radius: 50%;
  transition: .5s;
}
</style>
