<template>
  <div :class="{specialCtn: isSpecial(cardValue.type)}" class="cardContainer" @click="useCard" :style="{
    backgroundColor: (player == 1 ? 'purple' : 'orange'),
    color: (player == 1? 'white' : 'white')
  }">
    <div v-if="isSpecial(cardValue.type)" class="img">IMAGE</div>
    <div class="value" :class="{special: isSpecial(cardValue.type)}">
      {{ checkType(cardValue) }}
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
  const checkType = (c) => {
    if (c.type != "special") {
      return c.type
    } else {
      return c.text
    }
  }
  const isSpecial = (c) => {
    if (c === 'special') return true;
  }
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
  .specialCtn {
    align-items: space-between;
    justify-content: space-between;
    flex-direction: column;
  }
  .special {
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    width: 100%;
    height: 60%;
    color: black;
  }
</style>