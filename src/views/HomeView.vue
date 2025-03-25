<template>
  <div class="home">
    <ChessBoard :gameState="gameState" @rotateCompass="handleRotateCompass" ref="chessRef" />
    
    <div class="boussole">
      <img src="../assets/boussol.png" :style="{ transform: 'rotate(' + compassDeg + 'deg)' }" alt="Boussole">

      <div class="deck-stats">
        <p>Deck : {{ deckCount }} carte<span v-if="deckCount !== 1">s</span></p>
        <p>Défausse : {{ discardCount }} carte<span v-if="discardCount !== 1">s</span></p>
      </div>
      
      <div v-for="(player, index) in orderedPlayers" :key="index" class="player">
        <div class="nameColor">
          <div class="name">{{ player.name }} :</div>
          <div class="color" :style="{ backgroundColor: player.color }"></div>
        </div>
        <div class="cards">
          <div 
            v-for="(card, idx) in player.hand" 
            :key="idx" 
            class="card" 
            :style="{ backgroundColor: player.color }">
          </div>
        </div>
      </div>
      <div v-if="isMyTurn" @click="triggerEndTurn" class="end-turn">Finir le tour</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

import { useRoute } from 'vue-router';
import ChessBoard from '@/components/ChessBoard.vue';
import socket from '@/socket';

const route = useRoute();
const playersCount = parseInt(route.query.players) || 2;
const namesQuery = route.query.names;
const namesArr = namesQuery ? namesQuery.split(',') : [];
const colorsQuery = route.query.colors;
const colorsArr = colorsQuery ? colorsQuery.split(',') : [];

const gameId = route.query.roomCode;

const deckCount = ref(0);
const discardCount = ref(0);
const players = ref([]);

const chessRef = ref(null);
const deg = ref(0);

const gameState = ref({
  deck: 0,
  discardPile: 0,
  players: {},
  playerOrder: [],
  playerTurn: 0,
  winner: null,
  cardDirections: ['N', 'E', 'S', 'W']
});
const compassDeg = computed(() => {
  return gameState.value.rotationCount * 90;
});

const orderedPlayers = computed(() => {
  const ordered = [];
  const state = gameState.value;
  if (state.playerOrder && state.players) {
    state.playerOrder.forEach(id => {
      if (state.players[id]) {
        ordered.push(state.players[id]);
      }
    });
  }
  return ordered;
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
  console.log("UPDATE GAME STATE: ", gameState.value.players);
  deckCount.value = state.deck.length !== undefined ? state.deck.length : state.deck;
  discardCount.value = state.discardPile.length !== undefined ? state.discardPile.length : state.discard;
  gameState.value = state;
});

const isMyTurn = computed(() => {
  if (!gameState.value.playerOrder || gameState.value.playerOrder.length === 0) return false;
  return gameState.value.playerOrder[gameState.value.playerTurn] === socket.id;
});

const triggerEndTurn = () => {
  if (chessRef.value) {
    socket.emit('playerAction', { 
      gameId, 
      action: 'endTurn', 
      payload: {} 
    });
  }
};

const handleRotateCompass = (data) => {
  socket.emit('rotateCompass', { gameId, clockwise: data.clockwise });
};
</script>

<style lang="scss">
.home {
  display: flex;
  
  .boussole {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 50px;
    border: 1px solid rgb(172, 172, 172);
    margin-left: 100px;
    
    button {
      margin-top: 100px;
    }
  }
  
  img {
    height: 200px;
    transform-origin: center;
    transition: 0.5s;
  }
  
  .end-turn {
    background-color: white;
    border: 1px solid black;
    padding: 10px 40px;
    margin-top: 40px;
    transition: 0.2s;
    
    &:hover {
      cursor: pointer;
      transform: translateY(-2px);
      box-shadow: 0px 2px 14px -4px rgba(0, 0, 0, 0.5);
    }
  }
  
  .player {
    width: 100%;
    margin-top: 40px;
    text-align: left;
    
    .nameColor {
      display: flex;
      align-items: center;
      
      .name {
        font-weight: bold;
      }
      .color {
        height: 15px;
        width: 15px;
        margin-left: 15px;
        border-radius: 50%;
      }
    }
    
    .cards {
      margin-top: 20px;
      display: flex;
      
      .card {
        margin-right: 5px;
        height: 35px;
        width: 20px;
        border: 2px solid white;
        box-shadow: 0px 0px 14px -4px rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>
