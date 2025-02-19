<template>
  <div
    class="pawn"
    :style="{
      top: `${pawnPosition.row * 40}px`,
      left: `${pawnPosition.col * 41}px`,
      backgroundColor: `${color}`
    }"
  ></div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  pawnPosition: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    required: true,
  }
});

</script>

<style scoped>
.pawn {
  position: absolute;
  width: 40px;
  height: 40px;
  transition: .5s;
  border-radius: 50%;
}
</style>
