<template>
  <div :class="{ specialCtn: isSpecial(cardValue.type) }" class="cardContainer" @click="useCard" :style="{
    backgroundColor: color,
    color: 'white'
  }">
    <div v-if="isSpecial(cardValue.type)" class="img">IMAGE</div>
    <div class="value" :class="{ special: isSpecial(cardValue.type) }">
      {{ checkType(cardValue) }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  cardValue: {
    type: Object,  // on s'assure ici que c'est bien un objet
    required: true,
  },
  player: {
    type: Number,
    required: true
  },
  // Nouvelle prop pour la couleur choisie par le joueur
  color: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["usecard"]);

const checkType = (c) => {
  return c.type !== "special" ? c.type : c.text;
};

const isSpecial = (c) => c === 'special';

const useCard = () => {
  emit("usecard", props.cardValue);
};
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
  cursor: pointer;
}
.cardContainer:hover .value {
  color: rgb(64, 238, 6);
}
.value {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
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
