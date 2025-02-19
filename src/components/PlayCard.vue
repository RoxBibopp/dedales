<template>
  <div class="cardContainer" @click="useCard" :style="{
    backgroundColor: (player == 1 ? 'purple' : 'orange'),
    color: (player == 1? 'white' : 'white')
  }">
    <div class="value">
      {{ cardValue }}
    </div>
  </div>
</template>

<script setup>
  import { defineProps } from 'vue';
  import { defineEmits } from "vue";

  const props = defineProps({
    cardValue: {
      type: String,
      required: true,
    },
    player: {
      type: Number
    }
  });
  const emit = defineEmits(["usecard"]);

  const useCard = () => {
    emit("usecard", props.cardValue)
  }


</script>

<style scoped>
  .cardContainer {
    height: 200px;
    width: 130px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0px 0px 14px -4px rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cardContainer:hover .value {
    color: rgb(64, 238, 6);
  }
  .value {
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-size: 70px;
  }
</style>