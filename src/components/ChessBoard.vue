<template>
  <div class="home">
    <div v-if="gameState.winner" class="win">
      <div class="winmodal">{{ gameState.winner }} a gagné !</div>
    </div>

    <div class="chessboard">
      <div v-for="(row, rowIndex) in grid" :key="'row-' + rowIndex" class="row">
        <div
          v-for="(cell, colIndex) in row"
          :key="'cell-' + rowIndex + '-' + colIndex"
          class="cell">
        </div>
      </div>
      <Pawn
        v-for="(player, socketId) in gameState.players"
        :key="socketId"
        :pawnPosition="player.position"
        :color="player.color"
      />
    </div>
    <div class="hand">
      <h3>Ma main ({{ myHand.length }} cartes)</h3>
      <div 
        class="playCard"
        v-for="(card, index) in myHand" 
        :key="index"
        @click="playCard(index)"
        style="cursor: pointer; border:1px solid #333; padding:5px; margin:5px;">
        {{ card.type }}
      </div>
    </div>
    <div v-if="isMyTurn" class="controls">
      <button @click="endTurn">Finir le tour</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import socket from '@/socket'; 
import Pawn from './Pawn.vue';

const route = useRoute();
const playersCount = parseInt(route.query.players) || 2;
const namesQuery = route.query.names;
const namesArr = namesQuery ? namesQuery.split(',') : [];
const colorsQuery = route.query.colors;
const colorsArr = colorsQuery ? colorsQuery.split(',') : [];

const gameId = 'game1';

const gameState = ref({
  deck: 0,
  discardPile: 0,
  players: {}, 
  playerOrder: [],
  playerTurn: 0,
  winner: null
});

const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));

const myHand = computed(() => {
  return gameState.value.players[socket.id]?.hand || [];
});


const isMyTurn = computed(() => {
  if (!gameState.value.playerOrder.length) return false;
  return gameState.value.playerOrder[gameState.value.playerTurn] === socket.id;
});

onMounted(() => {
  socket.emit('joinGame', { 
    gameId, 
    playersCount, 
    names: namesArr, 
    colors: colorsArr 
  });
});

socket.on('updateGameState', (state) => {
  console.log('État du jeu mis à jour', state);
  gameState.value = state;
});

function playCard(index) {
  if (!isMyTurn.value) {
    alert("Ce n'est pas votre tour !");
    return;
  }
  socket.emit('playerAction', { 
    gameId, 
    action: 'useCard', 
    payload: { index } 
  });
}

function endTurn() {
  if (!isMyTurn.value) return;
  socket.emit('playerAction', { 
    gameId, 
    action: 'endTurn', 
    payload: {} 
  });
}
</script>

<style scoped>
.home {
  font-family: Arial, sans-serif;
  padding: 20px;
}
.chessboard {
  display: grid;
  grid-template-rows: repeat(20, 40px);
  grid-template-columns: repeat(20, 40px);
  gap: 1px;
  position: relative;
  margin-bottom: 20px;
}
.cell {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
.hand {
  margin-bottom: 20px;
}
.playCard {
  display: inline-block;
}
.controls {
  margin-top: 20px;
}
.win {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.winmodal {
  background: white;
  padding: 20px;
  border-radius: 4px;
}
</style>
