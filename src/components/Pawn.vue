<template>
  <div
    class="pawn"
    :style="{
      top: `${pawnPosition.row * 40}px`,
      left: `${pawnPosition.col * 41}px`
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
});

</script>

<style scoped>
.pawn {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: red; /* Couleur du pion */
  border-radius: 50%; /* Pion circulaire */
}
</style>
