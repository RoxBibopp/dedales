<template>
  <div class="home">
    <div v-if="gameState.winner" class="win">
      <div class="winmodal">{{ gameState.winner }} a gagné !</div>
    </div>
    <div v-if="gameState.showDice">
      <Dice
        :active="isMyTurn"
        :gameId="gameId"
        :serverDiceValue="gameState.diceValue"
        @closeDice="handleCloseDice"
        @closeDiceAndMove="handleCloseDiceAndMove"
      />
    </div>
    <div v-if="gameState.showStealModal && isMyStealer" class="modal-rotation">
      <div class="modal-content">
        <h3>Choisissez un joueur pour voler une carte</h3>
        <ul>
          <li v-for="(p, index) in stealCandidates" :key="index" @click="confirmSteal(p.socketId)" class="listitem">
            <div class="color-preview" :style="{ backgroundColor: p.color }"></div>
            {{ p.name }} ({{ p.handCount }} cartes)
          </li>
        </ul>
        <button @click="cancelSteal">Annuler</button>
      </div>
    </div>
    <!-- Pour les autres joueurs, affiche un message -->
    <div v-if="gameState.showStealModal && !isMyStealer" class="modal-rotation">
      <div class="modal-content">
        <h3>L'adversaire choisit un joueur pour voler une carte</h3>
      </div>
    </div>
    <div class="chessboard">
      <div v-for="(row, rowIndex) in grid" :key="'row-' + rowIndex" class="row">
        <div
          v-for="(cell, colIndex) in row"
          :key="'cell-' + rowIndex + '-' + colIndex"
          class="cell"
          :class="{
            goal: isGoal(colIndex, rowIndex),
            wall: isWall(colIndex, rowIndex),
            locked: isLockedWall(colIndex, rowIndex),
            rotate: isRotateCase(colIndex, rowIndex),
            double: isDoubleCase(colIndex, rowIndex),
            entry: isEntryPoint(colIndex, rowIndex),
            exit1: isExit1(colIndex, rowIndex),
            exit2: isExit2(colIndex, rowIndex),
            exit3: isExit3(colIndex, rowIndex),
            exit4: isExit4(colIndex, rowIndex),
            exit5: isExit5(colIndex, rowIndex),
            exit6: isExit6(colIndex, rowIndex)
          }"
          :style="getGoalStyle(colIndex, rowIndex)"
        ></div>
      </div>
      <Pawn
        v-for="(player, socketId) in gameState.players"
        :key="socketId"
        :pawnPosition="player.position"
        :color="player.color"
      />
    </div>
    <div class="hand">
      <PlayCard
        v-for="(card, index) in myHand"
        class="playCard"
        :id="'card-' + index"
        :key="index"
        :card-value="card"
        :player="playerTurn + 1"
        :style="{ left: 860 + (index * 150) + 'px' }"
        :color="myColor"
        @usecard="playCard(index, card)"
      />
    </div>
    <div v-if="gameState.showDirection && isMyTurn" class="modal-rotation">
      <div class="modal-content">
        <div class="txt">Choisissez une direction :</div>
        <div class="arrows">
          <div @click="chooseRotation(false)"><</div>
          <div @click="chooseRotation(true)">></div>
        </div>
      </div>
    </div>
    <div v-if="gameState.showDirection && !isMyTurn" class="modal-rotation">
      <div class="modal-content">
        <div class="txt">L'adversaire choisit une direction</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useRoute } from 'vue-router';
import socket from '@/socket'; 
import Pawn from './Pawn.vue';
import PlayCard from './PlayCard.vue';
import Dice from './Dice.vue';
import { 
  wallsData as localWallsData,
  rotateCompassData as localRotateCompassData,
  doubleRotateCompassData as localDoubleRotateCompassData,
  entryTeleportData as localEntryTeleportData 
} from '@/constants/config';

const route = useRoute();
const playersCount = parseInt(route.query.players) || 2;
const namesArr = route.query.names ? route.query.names.split(',') : [];
const colorsArr = route.query.colors ? route.query.colors.split(',') : [];
const playerTurn = computed(() => gameState.value.playerTurn);
const myColor = computed(() => {
  return gameState.value.players[socket.id]?.color || 'gray';
});
const props = defineProps({
  gameState: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['rotateCompass']);
const gameId = route.query.roomCode;

const gameState = ref({
  deck: 0,
  discardPile: 0,
  players: {}, 
  playerOrder: [],
  playerTurn: 0,
  winner: null,
  wallsData: localWallsData,
  rotateCompassData: localRotateCompassData,
  doubleRotateCompassData: localDoubleRotateCompassData,
  entryTeleportData: localEntryTeleportData,
  playersGoals: []
});

const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));

const isWall = (col, row) => {
  const walls = gameState.value.wallsData || localWallsData;
  return walls.some(w => w.row === row && w.col === col);
};


const isLockedWall = (col, row) => {
  const locked = gameState.value.lockedWalls || [];
  return locked.some(w => w.row === row && w.col === col);
};

const isGoal = (col, row) => {
  const goals = gameState.value.playersGoals || [];
  return goals.some(goal => goal.row === row && goal.col === col);
};

const isRotateCase = (col, row) => {
  const rotates = gameState.value.rotateCompassData || localRotateCompassData;
  return rotates.some(c => c.row === row && c.col === col);
};

const isDoubleCase = (col, row) => {
  const doubles = gameState.value.doubleRotateCompassData || localDoubleRotateCompassData;
  return doubles.some(c => c.row === row && c.col === col);
};

const isEntryPoint = (col, row) => {
  const entries = gameState.value.entryTeleportData || localEntryTeleportData;
  return entries.some(p => p.row === row && p.col === col);
};

const exits = {
  1: { row: 5, col: 5 },
  2: { row: 14, col: 5 },
  3: { row: 5, col: 14 },
  4: { row: 14, col: 14 },
  5: { row: 18, col: 12 },
  6: { row: 1, col: 7 }
};
const isExit1 = (col, row) => exits[1].row === row && exits[1].col === col;
const isExit2 = (col, row) => exits[2].row === row && exits[2].col === col;
const isExit3 = (col, row) => exits[3].row === row && exits[3].col === col;
const isExit4 = (col, row) => exits[4].row === row && exits[4].col === col;
const isExit5 = (col, row) => exits[5].row === row && exits[5].col === col;
const isExit6 = (col, row) => exits[6].row === row && exits[6].col === col;

function getGoalStyle(col, row) {
  const goals = gameState.value.playersGoals || [];
  const goalIndex = goals.findIndex(goal => goal.row === row && goal.col === col);
  if (goalIndex !== -1) {
    const playersColors = colorsArr.length ? colorsArr : ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];
    return { backgroundColor: playersColors[goalIndex] };
  }
  return {};
}
function chooseRotation(clockwise) {
  emit('rotateCompass', { clockwise });
}

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
  gameState.value = state;
});

function playCard(index, cardValue) {
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

const handleCloseDice = () => {
  socket.emit('diceAction', { gameId, action: "closeDice" })
}

const handleCloseDiceAndMove = (data) => {
  socket.emit('closeDiceAndMove', data)
}

const isMyStealer = computed(() => {
  return props.gameState.stealer === socket.id;
});

const stealCandidates = computed(() => {
  const candidates = [];
  for (const id in props.gameState.players) {
    if (id !== socket.id) {
      const player = props.gameState.players[id];
      candidates.push({ 
        socketId: id,
        name: player.name,
        color: player.color,
        handCount: player.hand ? player.hand.length : 0
      });
    }
  }
  return candidates;
});
const confirmSteal = (targetSocketId) => {
  socket.emit('confirmSteal', { gameId, targetSocketId });
};

const cancelSteal = () => {
  socket.emit('cancelSteal', { gameId });
};

socket.on('moveImpossible', (data) => {
  const { index, message } = data;
  const cardElement = document.getElementById('card-' + index);
  if (cardElement) {
    cardElement.classList.add('wrongCard');
    setTimeout(() => {
      cardElement.classList.remove('wrongCard');
    }, 500);
  }
});
</script>

<style scoped>
.color-preview {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  margin-right: 10px;
}
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
.row {
  display: contents;
}
.cell {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
.wall {
  background: #d8af98bd;
  background-size: 400%;
}
.locked {
  background-size: 430% !important;
  background: url('../assets/wall.jpg');
}
.goal {
  background-color: pink;
}
.rotate {
  background-color: #e7e7e7;
  position: relative;
  display: flex;
  align-items: center;
}
.rotate::after {
  content: "+1";
  position: absolute;
  top: 50%;
  left: 50%;
  font-weight: 900;
  font-size: 20px;
  transform: translate(-50%, -50%);
  font-family: sans-serif;
  text-align: center;
}
.double {
  background-color: #e7e7e7;
  position: relative;
  display: flex;
  align-items: center;
}
.double::after {
  content: "+2";
  position: absolute;
  top: 50%;
  left: 50%;
  font-weight: 900;
  font-size: 20px;
  transform: translate(-50%, -50%);
  font-family: sans-serif;
  text-align: center;
}
.hand {
  margin-bottom: 20px;
}
.playCard {
  user-select: none;
  position: absolute;
  bottom: 10px;
  left: 20%;
  border: 7px solid rgb(255, 255, 255);
  transition: .3s;
}
.playCard:hover {
  cursor: pointer;
  bottom: 30px;
  border: 7px solid rgb(64, 238, 6);
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

.modal-rotation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.408);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}
.modal-content {
  background-color: white;
  height: 30%;
  width: 30%;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modal-content .txt {
  margin-bottom: 20px;
  font-size: 18px;
  text-align: center;
}
.modal-content .arrows {
  display: flex;
  justify-content: space-around;
  width: 60%;
}
.modal-content .arrows div {
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
  transition: font-size 0.2s;
}
.modal-content .arrows div:hover {
  font-size: 44px;
}
.listitem {
  list-style-type: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: .2s;
  margin-bottom: 20px;
}
.listitem:hover {
  transform: scale(1.05);
}
.entry {
  background: url('../assets/door.png');
  background-size: contain;
}
.exit1 {
  background: url('../assets/d1.png');
  background-size: contain;
}
.exit2 {
  background: url('../assets/d2.png');
  background-size: contain;
}
.exit3 {
  background: url('../assets/d3.png');
  background-size: contain;
}
.exit4 {
  background: url('../assets/d4.jpg');
  background-size: contain;
}
.exit5 {
  background: url('../assets/d5.jpg');
  background-size: contain;
}
.exit6 {
  background: url('../assets/d6.jpg');
  background-size: contain;
}
.wrongCard {
  animation: wrong 0.5s linear;
  border: 7px solid red !important;
  color: red !important;
}
@keyframes wrong {
  0%   { transform: translateX(0); }
  10%  { transform: translateX(10px); }
  20%  { transform: translateX(-10px); }
  30%  { transform: translateX(10px); }
  40%  { transform: translateX(-10px); }
  50%  { transform: translateX(10px); }
  60%  { transform: translateX(-10px); }
  70%  { transform: translateX(10px); }
  80%  { transform: translateX(-10px); }
  90%  { transform: translateX(10px); }
  100% { transform: translateX(0); }
}
</style>
