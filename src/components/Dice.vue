<template>
  <div v-if="!roll"class="dice-container">
    <div class="question">Lancer les dés ?</div>
    <div>
      <button class="btn" @click="yes" :disabled="rolling">OUI</button>
      <button class="btn" @click="no" :disabled="rolling">NON</button>
    </div>
  </div>
  <div v-if="roll"class="dice-container">
    <div class="dice">{{ diceValue }}</div>
    <button @click="rollDice" :disabled="rolling">Lancer le dé</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineEmits } from "vue";

const diceValue = ref(1)
const rolling = ref(false)
const roll = ref(false)

const emit = defineEmits(["closeDice", "closeDiceAndMove"]);

const rollDice = () => {
  if (rolling.value) return
  rolling.value = true

  let counter = 0
  const interval = setInterval(() => {
    diceValue.value = Math.floor(Math.random() * 6) + 1
    counter++
    if (counter > 40) {
      clearInterval(interval)
      diceValue.value = Math.floor(Math.random() * 6) + 1
      rolling.value = false
    }
  }, 30) 
  setTimeout(() => {
    emit("closeDiceAndMove", diceValue.value)
  }, 2000);
}

const yes = () => {
  roll.value = !roll.value;
}
const no = () => {
  emit("closeDice");
}
</script>

<style lang="scss" scoped>
.dice-container {
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 99;
  top:0;
  left: 0;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.dice {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid black;
  border-radius: 8px;
  background: white;
  transition: transform 0.1s ease-in-out;
}

button {
  background-color: white;
  border: 1px solid black;
  padding:  10px 40px;
  margin-top: 40px;
  transition: .2s;
}
button:hover {
  cursor: pointer;
  transform: translateY(-2px);
  box-shadow: 0px 2px 14px -4px rgba(0,0,0,0.5);
}
button:disabled {
  opacity: 0;
  cursor: not-allowed;
}
.question {
  background-color: white;
  padding: 30px;

}
.btn {
  margin: 20px;
}
</style>
