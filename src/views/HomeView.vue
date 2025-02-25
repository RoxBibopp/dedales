<template>
  <div class="home">
    <ChessBoard 
      @rotate="rotateCompass"
      @count-cards="changeCards"
      @deck-stats="updateDeckStats"
      ref="chessRef"/>
    <div class="boussole">
      <img src="../assets/boussol.png" :style="{ transform: 'rotate(' + deg + 'deg)' }" alt="Boussole">
      <div class="deck-stats">
        <p>Deck : {{ deckCount }} carte<span v-if="deckCount !== 1">s</span></p>
        <p>Défausse : {{ discardCount }} carte<span v-if="discardCount !== 1">s</span></p>
      </div>
      <div v-for="(player, index) in players" :key="index" class="player">
        <div class="nameColor">
          <div class="name">{{ player.name }} :</div>
          <div class="color" :style="{ backgroundColor: player.color }"></div>
        </div>
        <div class="cards">
          <div v-for="(card, idx) in player.cards" :key="idx" class="card" :style="{ backgroundColor: player.color }"></div>
        </div>
      </div>
      
      <div @click="triggerEndTurn" class="end-turn">Finir le tour</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChessBoard from '@/components/ChessBoard.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const playersCount = parseInt(route.query.players) || 2;
const namesQuery = route.query.names;
const namesArr = namesQuery ? namesQuery.split(',') : [];

const colorsQuery = route.query.colors;
const colorsArr = colorsQuery ? colorsQuery.split(',') : [];

const baseColors = ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];
const deckCount = ref(0);
const discardCount = ref(0);
const players = ref(
  Array.from({ length: playersCount }, (_, i) => ({
    name: namesArr[i] || `Joueur ${i + 1}`,
    color: colorsArr[i] || baseColors[i % baseColors.length],
    cards: Array(3).fill(0)
  }))
);

const chessRef = ref(null);
const deg = ref(0);

const triggerEndTurn = () => {
  if (chessRef.value) {
    chessRef.value.endTurn();
  }
};

const rotateCompass = (r) => {
  deg.value += r;
};

const changeCards = (playersCards) => {
  players.value = players.value.map((player, index) => ({
    ...player,
    cards: Array(playersCards[index]).fill(0)
  }));
};

const updateDeckStats = (stats) => {
  deckCount.value = stats.deck;
  discardCount.value = stats.discard;
}
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
