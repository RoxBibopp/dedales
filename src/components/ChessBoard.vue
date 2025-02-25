<template>
  <div>
    <div v-if="winner" class="win">
      <div class="winmodal">{{ winner }} a gagné !</div>
    </div>
    <div v-if="showDirection" class="win">
      <div class="winmodal chooseModal">
        <div class="txt">Choisissez une direction :</div>
        <div class="arrows">
          <div @click="turnLeft"><</div>
          <div @click="turnRight">></div>
        </div>
      </div>
    </div>
    <Dice v-if="showDice"
      @closeDice="closeDice"
      @closeDiceAndMove="closeDiceAndMove"
    />
    <div v-if="showStealModal" class="modal">
      <div class="modal-content">
        <h3>Choisissez un joueur pour voler une carte</h3>
        <ul>
          <li v-for="(p, index) in stealCandidates" :key="index" @click="confirmSteal(index)">
            <span class="color-preview" :style="{ backgroundColor: p.color }"></span>
            {{ p.name }} ({{ playersCards[p.absoluteIndex].length }} cartes)
          </li>
        </ul>
        <button @click="cancelSteal">Annuler</button>
      </div>
    </div>
    <div
      class="chessboard"
      @keydown="handleKeydown"
      tabindex="0"
    >
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
        v-for="(pawn, index) in playersPositions"
        :key="'pawn-' + index"
        :pawnPosition="pawn"
        :color="playersColors[index]"
      />
    </div>
    <div>
      <PlayCard
        v-for="(card, index) in currentCards"
        class="playCard"
        :card-value="card"
        :player="playerTurn + 1"
        @usecard="useCard"
        :style="{ left: 860 + (index * 150) + 'px' }"
        :color="playersColors[playerTurn]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Pawn from './Pawn.vue';
import PlayCard from './PlayCard.vue';
import Dice from '../components/Dice.vue';
import { defineEmits, defineExpose } from 'vue';
import { 
  wallsData,
  rotateCompassData,
  doubleRotateCompassData,
  entryTeleportData
} from '@/constants/config';

const route = useRoute();
const playersCount = parseInt(route.query.players) || 2; 

const namesQuery = route.query.names;
const namesArr = namesQuery ? namesQuery.split(',') : [];

const players = computed(() => {
  return Array.from({ length: playersCount }, (_, i) => ({
    name: namesArr[i] || `Joueur ${i + 1}`,
    color: playersColors[i]
  }));
});

const colorsQuery = route.query.colors;
const colorsArr = colorsQuery ? colorsQuery.split(',') : [];

const emit = defineEmits(["rotate", "countCards", "deck-stats"]);

const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));

let positions, goals;

if (playersCount === 2) {
  positions = [
    { row: 0, col: 0 },
    { row: gridSize - 1, col: gridSize - 1 }
  ];
  goals = [
    { row: gridSize - 1, col: gridSize - 1 },
    { row: 0, col: 0 },
  ];
} else if (playersCount === 3) {
  positions = [
    { row: 0, col: 0 },
    { row: gridSize - 1, col: gridSize - 1 },
    { row: 0, col: gridSize - 1 }
  ];
  goals = [
    { row: gridSize - 1, col: gridSize - 1 },
    { row: 0, col: 0 },
    { row: gridSize - 1, col: 0 }
  ];
} else if (playersCount === 4) {
  positions = [
    { row: 0, col: 0 },
    { row: gridSize - 1, col: gridSize - 1 },
    { row: 0, col: gridSize - 1 },
    { row: gridSize - 1, col: 0 }
  ];
  goals = [
    { row: gridSize - 1, col: gridSize - 1 },
    { row: 0, col: 0 },
    { row: gridSize - 1, col: 0 },
    { row: 0, col: gridSize - 1 }
  ];
} else {
  positions = Array.from({ length: playersCount }, (_, i) => ({
    row: Math.floor((gridSize - 1) * i / (playersCount - 1 || 1)),
    col: 0
  }));
  goals = Array.from({ length: playersCount }, (_, i) => ({
    row: Math.floor((gridSize - 1) * i / (playersCount - 1 || 1)),
    col: gridSize - 1
  }));
}

const playersPositions = ref(positions);
const playersGoals = goals;
const baseColors = ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];
const playersColors = colorsArr.length
  ? colorsArr
  : Array.from({ length: playersCount }, (_, i) => baseColors[i % baseColors.length]);

const winner = ref(null)
const cardDirections = ['N', 'E', 'S', 'W'];
const playerTurn = ref(0);

const initialDeck = [
  { type: 'N' },
  { type: 'N' },
  { type: 'N' },
  { type: 'N' },
  { type: 'N' },
  { type: 'N' },
  { type: 'E' },
  { type: 'E' },
  { type: 'E' },
  { type: 'E' },
  { type: 'E' },
  { type: 'E' },
  { type: 'S' },
  { type: 'S' },
  { type: 'S' },
  { type: 'S' },
  { type: 'S' },
  { type: 'S' },
  { type: 'W' },
  { type: 'W' },
  { type: 'W' },
  { type: 'W' },
  { type: 'W' },
  { type: 'W' },
  { type: 'special', text: 'Volez une carte à un adversaire de votre choix', action: () => initiateSteal() },
  { type: 'special', text: 'Volez une carte à un adversaire de votre choix', action: () => initiateSteal() },
  { type: 'special', text: 'Volez une carte à un adversaire de votre choix', action: () => initiateSteal() },
  { type: 'special', text: 'Tournez la boussole d\'un quart de tour', action: () => initiateCompassTurn() },
  { type: 'special', text: 'Tournez la boussole d\'un quart de tour', action: () => initiateCompassTurn() },
  { type: 'special', text: 'Tournez la boussole d\'un quart de tour', action: () => initiateCompassTurn() },
  { type: 'special', text: 'Tournez la boussole d\'un tour complet', action: () => initiateCompassFullTurn() },
  { type: 'special', text: 'Tournez la boussole d\'un tour complet', action: () => initiateCompassFullTurn() },
  { type: 'special', text: 'Tournez la boussole d\'un tour complet', action: () => initiateCompassFullTurn() }
];

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const deck = ref(shuffle([...initialDeck]));
const discardPile = ref([]);

const drawOneCard = () => {
  if ( deck.value.length === 0) {
    if ( discardPile.value.length === 0) {
      return null
    }
    deck.value = shuffle(discardPile.value)
    discardPile.value = []; 
  }
  return deck.value.pop();
}

const drawCards = () => {
  const cards = [];
  for (let i = 0; i < 3; i++) {
    const card = drawOneCard();
    if ( card ) {
      cards.push(card);
    }
  }
  return cards;
};
const playersCards = ref(Array.from({ length: playersCount }, () => drawCards()));
let currentCards = ref(playersCards.value[playerTurn.value]);

const showDirection = ref(false);
const showDice = ref(false);
const showStealModal = ref(false);

const initiateSteal = () => {
  showStealModal.value = true;
};
const stealCandidates = computed(() => {
  const candidates = [];
  for (let i = 0; i < playersCount; i++) {
    if (i !== playerTurn.value) {
      candidates.push({ ...players.value[i], absoluteIndex: i });
    }
  }
  return candidates;
});

const confirmSteal = (relativeIndex) => {
  const candidate = stealCandidates.value[relativeIndex];
  const targetIndex = candidate.absoluteIndex;
  if (playersCards.value[targetIndex].length > 0) {
    playersCards.value[playerTurn.value].push(
      playersCards.value[targetIndex].splice(0, 1)[0]
    );
  }
  showStealModal.value = false;
  emit("countCards", playersCards.value.map(cards => cards.length));
};
const cancelSteal = () => {
  showStealModal.value = false;
};

const rotateCompassCase = ref(rotateCompassData)

const doubleRotateCompassCase = ref(doubleRotateCompassData)

const entryTeleport = ref(entryTeleportData);

const exit1 = reactive({ row: 5, col: 5 });
const exit2 = reactive({ row: 14, col: 5 });
const exit3 = reactive({ row: 5, col: 14 });
const exit4 = reactive({ row: 14, col: 14 });
const exit5 = reactive({ row: 18, col: 8 });
const exit6 = reactive({ row: 1, col: 11 });

const walls = ref(wallsData)
const lockedWalls = ref([]);

const isWall = (row, col) => {
  return walls.value.some(wall => wall.row === row && wall.col === col);
};

const isLockedWall = (row, col) => {
  return lockedWalls.value.some(wall => wall.row === row && wall.col === col);
};

const isGoal = (row, col) => {
  return playersGoals.some(goal => goal.row === row && goal.col === col);
};
const isRotateCase = (row, col) => rotateCompassCase.value.some(c => c.row === row && c.col === col);
const isDoubleCase = (row, col) => doubleRotateCompassCase.value.some(c => c.row === row && c.col === col);
const isEntryPoint = (row, col) => entryTeleport.value.some(p => p.row === row && p.col === col);
const isExit1 = (row, col) => (exit1.row === row && exit1.col === col);
const isExit2 = (row, col) => (exit2.row === row && exit2.col === col);
const isExit3 = (row, col) => (exit3.row === row && exit3.col === col);
const isExit4 = (row, col) => (exit4.row === row && exit4.col === col);
const isExit5 = (row, col) => (exit5.row === row && exit5.col === col);
const isExit6 = (row, col) => (exit6.row === row && exit6.col === col);

const movePawn = (pawn, rowChange, colChange) => {
  const newRow = pawn.row + rowChange;
  const newCol = pawn.col + colChange;

  const goal = playersGoals[playerTurn.value];
  if (newRow === goal.row && newCol === goal.col) {
    winner.value = "Joueur " + (playerTurn.value + 1);
  }

  const wallIndex = walls.value.findIndex(w => w.row === newRow && w.col === newCol);
  const rotateIndex = rotateCompassCase.value.findIndex(r => r.row === newRow && r.col === newCol);
  const doubleIndex = doubleRotateCompassCase.value.findIndex(r => r.row === newRow && r.col === newCol);
  const entryIndex = entryTeleport.value.findIndex(p => p.row === newRow && p.col === newCol);

  if (doubleIndex !== -1) {
    rotateCompass(true);
    rotateCompass(true);
  }
  if (entryIndex !== -1) {
    showDice.value = true;
  }
  if (rotateIndex !== -1) {
    showDirection.value = true;
  }
  if (wallIndex !== -1) {
    if (!isLockedWall(newRow, newCol)) {
      lockedWalls.value.push({ row: newRow, col: newCol });
      pawn.row = newRow;
      pawn.col = newCol;
      return;
    }
  }
  if (
    newRow >= 0 && newRow < gridSize &&
    newCol >= 0 && newCol < gridSize &&
    !isLockedWall(newRow, newCol)
  ) {
    pawn.row = newRow;
    pawn.col = newCol;
  }
};

const handleKeydown = (event) => {
  switch(event.keyCode) {
    case 37: 
      rotateCompass(false);
      break;
    case 39:
      rotateCompass(true);
      break;
  }
};

const handleCardMovement = (direction) => {
  const index = cardDirections.indexOf(direction);
  if (index === -1) return;
  
  const currentPawn = playersPositions.value[playerTurn.value];
  switch (index) {
    case 0:
      movePawn(currentPawn, -1, 0);
      break;
    case 1:
      movePawn(currentPawn, 0, 1);
      break;
    case 2:
      movePawn(currentPawn, 1, 0);
      break;
    case 3:
      movePawn(currentPawn, 0, -1);
      break;
  }
};

const useCard = (cardValue) => {
  if (cardValue.type === 'special') {
    cardValue.action();
  } else {
    handleCardMovement(cardValue.type);
  }
  const index = currentCards.value.indexOf(cardValue);
  if (index !== -1) {
    currentCards.value.splice(index, 1);
    discardPile.value.push(cardValue);
  } 
  emit("countCards", playersCards.value.map(cards => cards.length));
  updateDeckStats();
};

const endTurn = () => {
  const currentDeck = playersCards.value[playerTurn.value];
  while (currentDeck.length < 3 ) {
    const card = drawOneCard();
    if (card) {
      currentDeck.push(card);
    } else {
      break;
    }
  }
  playerTurn.value = (playerTurn.value + 1) % playersCount;
  currentCards.value = playersCards.value[playerTurn.value];
  emit("countCards", playersCards.value.map(cards => cards.length));
  updateDeckStats();
};
defineExpose({ endTurn });

const turnRight = () => {
  rotateCompass(true);
  showDirection.value = false;
};
const turnLeft = () => {
  rotateCompass(false);
  showDirection.value = false;
};
const rotateCompass = (clockwise) => {
  if (clockwise) {
    cardDirections.unshift(cardDirections.pop());
  } else {
    cardDirections.push(cardDirections.shift());
  }
  emit("rotate", (clockwise ? 1 : -1) * 90);
};
const closeDice = () => {
  showDice.value = false;
};
const closeDiceAndMove = (v) => {
  showDice.value = false;
  const currentPawn = playersPositions.value[playerTurn.value];
  const findExit = eval("exit" + v);
  if (findExit) {
    currentPawn.row = 0;
    currentPawn.col = 0;
    movePawn(currentPawn, findExit.row, findExit.col);
  }
};


const getGoalStyle = (row, col) => {
  const goalIndex = playersGoals.findIndex(goal => goal.row === row && goal.col === col);
  if (goalIndex !== -1) {
    return { backgroundColor: playersColors[goalIndex] };
  }
  return {};
};

const initiateCompassTurn = () => {
  showDirection.value = true;
};
const initiateCompassFullTurn = () => {
  rotateCompass(true);
  rotateCompass(true);
}

const updateDeckStats = () => {
  emit("deck-stats", { deck: deck.value.length, discard: discardPile.value.length });
};
onMounted(() => {
  updateDeckStats();
});
</script>

<style scoped>
.chessboard {
  display: grid;
  grid-template-rows: repeat(20, 40px);
  grid-template-columns: repeat(20, 40px);
  gap: 1px;
  position: relative;
  outline: none;
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
.end-turn {
  position: absolute;
  right : 22%;
  top: 30%;
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
.goal1 {
  background-color: purple;
}
.goal2 {
  background-color: orange;
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
.win {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.408);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;

  .winmodal {
    background-color: white;
    height: 20%;
    width: 30%;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

}
.chooseModal {
  flex-direction: column;

  .txt {
    height: 32%;
    display: flex;
    align-items: center;
  }
  .arrows {
    display: flex;
    width: 50%;
    justify-content: space-between;
    height: 68%;
    div {
      font-size: 40px;
      font-weight: 900;
      transition: .2s;
    }

    div:hover {
      cursor: pointer;
      font-size: 44px;
    }
  }
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
/* Styles pour la modale de vol */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.modal-content ul {
  list-style: none;
  padding: 0;
}

.modal-content li {
  cursor: pointer;
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
  border-radius: 50%;
  margin-right: 10px;
}

</style>
