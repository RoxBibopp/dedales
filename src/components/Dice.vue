<template>
  <div class="dice-container">
    <!-- Si c'est le joueur actif -->
    <div v-if="active">
      <div v-if="!roll" class="dice-container">
        <div class="question">Lancer les dés ?</div>
        <div>
          <button class="btn" @click="yes" :disabled="rolling">OUI</button>
          <button class="btn" @click="no" :disabled="rolling">NON</button>
        </div>
      </div>
      <div v-if="roll" class="dice-container">
        <div class="dice">{{ localDiceValue }}</div>
        <button v-if="!rolling" @click="rollDice" :disabled="rolling">Lancer le dé</button>
      </div>
    </div>
    <!-- Pour les joueurs non-actifs : on affiche la valeur reçue depuis le serveur -->
    <div v-else>
      <div class="question">
        <div class="dice">{{ serverDiceValue }}</div>
        <div class="question">L'adversaire lance les dés...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import socket from '@/socket';

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  },
  serverDiceValue: {
    type: Number,
    default: 1
  },
  gameId: {
    type: String,
    required: true
  }
});
const emit = defineEmits(["closeDice", "closeDiceAndMove"]);

const localDiceValue = ref(1);
const rolling = ref(false);
const roll = ref(false);

watch(
  () => props.serverDiceValue,
  (newVal) => {
    localDiceValue.value = newVal;
  }
);

const rollDice = () => {
  if (rolling.value) return;
  rolling.value = true;
  
  let counter = 0;
  const interval = setInterval(() => {
    localDiceValue.value = Math.floor(Math.random() * 6) + 1;
    counter++;
    socket.emit('diceRolling', { gameId: props.gameId, diceValue: localDiceValue.value });
    if (counter > 40) {
      clearInterval(interval);
      localDiceValue.value = Math.floor(Math.random() * 6) + 1;
    }
  }, 30);
  
  setTimeout(() => {
    emit("closeDiceAndMove", { gameId: props.gameId, diceValue: localDiceValue.value });
  }, 2000);
};

const yes = () => {
  roll.value = true;
};
const no = () => {
  emit("closeDice");
};
</script>

<style scoped>
.dice-container {
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 99;
  top: 0;
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
  padding: 10px 40px;
  margin-top: 40px;
  transition: 0.2s;
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
