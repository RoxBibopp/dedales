<template>
  <div>
    <!-- Modal de victoire -->
    <div v-if="winner" class="win">
      <div class="winmodal">{{ winner }} a gagné !</div>
    </div>
    <!-- Modal de choix de direction -->
    <div v-if="showDirection" class="win">
      <div class="winmodal chooseModal">
        <div class="txt">Choisissez une direction :</div>
        <div class="arrows">
          <div @click="turnLeft"><</div>
          <div @click="turnRight">></div>
        </div>
      </div>
    </div>
    <!-- Composant de dé -->
    <Dice v-if="showDice"
      @closeDice="closeDice"
      @closeDiceAndMove="closeDiceAndMove"
    />
    <!-- Echiquier -->
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
            wall: isWall(rowIndex, colIndex),
            locked: isLockedWall(rowIndex, colIndex),
            goal: isGoal(rowIndex, colIndex),
            rotate: isRotateCase(rowIndex, colIndex),
            double: isDoubleCase(rowIndex, colIndex),
            entry: isEntryPoint(rowIndex, colIndex),
            exit: isExit(rowIndex, colIndex)
          }"
        ></div>
      </div>
      <!-- Affichage des pions pour chaque joueur -->
      <Pawn
        v-for="(pawn, index) in playersPositions"
        :key="'pawn-' + index"
        :pawnPosition="pawn"
        :color="playersColors[index]"
      />
    </div>
    <!-- Cartes jouables du joueur courant -->
    <div>
      <PlayCard
        v-for="(card, index) in currentCards"
        class="playCard"
        :card-value="card"
        :player="playerTurn + 1"
        @usecard="useCard"
        :style="{ left: 860 + (index * 150) + 'px' }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import Pawn from './Pawn.vue';
import PlayCard from './PlayCard.vue';
import Dice from '../components/Dice.vue';
import { defineEmits, defineExpose } from 'vue';

const route = useRoute();
const playersCount = parseInt(route.query.players) || 2; 

const emit = defineEmits(["rotate", "countCards"]);

const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));

const playersPositions = ref(
  Array.from({ length: playersCount }, (_, i) => ({
    row: Math.floor((gridSize - 1) * i / (playersCount - 1 || 1)),
    col: 0
  }))
);

const playersGoals = Array.from({ length: playersCount }, (_, i) => ({
  row: Math.floor((gridSize - 1) * i / (playersCount - 1 || 1)),
  col: gridSize - 1
}));

const baseColors = ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];
const playersColors = Array.from({ length: playersCount }, (_, i) => baseColors[i % baseColors.length]);

const winner = ref(null)
const cardDirections = ['N', 'E', 'S', 'W'];
const playerTurn = ref(0);

const deck = [
  { type: 'N' },
  { type: 'N' }, 
  { type: 'N' },
  { type: 'N' },
  { type: 'E' },
  { type: 'E' },
  { type: 'E' },
  { type: 'E' },
  { type: 'S' },
  { type: 'S' },
  { type: 'S' },
  { type: 'S' },
  { type: 'W' },
  { type: 'W' },
  { type: 'W' },
  { type: 'W' },
  { type: 'special',
    text: 'Volez une carte à un adversaire de votre choix',
    action: () => stealCard()
  },
  { type: 'special',
    text: 'Volez une carte à un adversaire de votre choix',
    action: () => stealCard()
  }, 
  { type: 'special',
    text: 'Volez une carte à un adversaire de votre choix',
    action: () => stealCard()
  }, 
  { 
    type: 'special',
    text: 'Cette carte dit fromage dans la console',
    action: () => console.log("fromage"),
  }, 
];
const drawCards = () => {
  return [...Array(3)].map(() => deck[Math.floor(Math.random() * deck.length)]);
};
const playersCards = ref(Array.from({ length: playersCount }, () => drawCards()));
let currentCards = ref(playersCards.value[playerTurn.value]);

const showDirection = ref(false);
const showDice = ref(false);

// const stealCard = () => {
//   if (playerTurn.value == 1) {
//     cardsPlayer1.value.push(cardsPlayer2.value.splice(0, 1)[0])
//   } else {
//     cardsPlayer2.value.push(cardsPlayer1.value.splice(0, 1)[0])
//   }
// }
const rotateCompassCase = ref([
  { row : 1, col: 15 },
  { row : 2, col: 2 },
  { row : 2, col: 17 },
  { row : 3, col: 7 },
  { row : 3, col: 12 },
  { row : 6, col: 15 },
  { row : 7, col: 2 },
  { row : 11, col: 2 },
  { row : 11, col: 9 },
  { row : 11, col: 18 },
  { row : 14, col: 4 },
  { row : 15, col: 10 },
  { row : 17, col: 2 },
  { row : 17, col: 15 },
])

const doubleRotateCompassCase = ref([
  { row : 3, col: 3 },
  { row : 4, col: 15 },
  { row : 8, col: 9 },
  { row : 12, col: 13 },
  { row : 16, col: 5 },
  { row : 17, col: 13 },
])

const walls = ref([
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 6 },
  { row: 1, col: 9 }, { row: 1, col: 10 }, { row: 1, col: 13 },
  { row: 1, col: 17 }, { row: 1, col: 18 }, 
  { row: 2, col: 1 },{ row: 2, col: 7 }, { row: 2, col: 12 }, 
  { row: 2, col: 18 },
  { row: 3, col: 1 }, { row: 3, col: 4 },{ row: 3, col: 8 },
  { row: 3, col: 11 }, { row: 3, col: 15 }, { row: 3, col:18 },
  { row: 4, col: 4 }, { row: 4, col: 16 },
  { row: 5, col: 1 },{ row: 5, col: 6 }, { row: 5, col: 7 },
  { row: 5, col: 8 }, { row: 5, col: 11 }, { row: 5, col: 12 },
  { row: 5, col: 13 },  { row: 5, col: 18 },
  { row: 6, col: 1 },{ row: 6, col: 2 }, { row: 6, col: 5 },
  { row: 6, col: 14 }, { row: 6, col: 17 }, { row: 6, col: 18 },
  { row: 7, col: 7 },{ row: 7, col: 8 }, { row: 7, col: 11 },
  { row: 7, col: 12 },
  { row: 8, col: 3 },{ row: 8, col: 7 }, { row: 8, col: 12 },
  { row: 8, col: 16 },
  { row: 9, col: 1 },{ row: 9, col: 4 }, { row: 9, col: 15 },
  { row: 9, col: 18 },
  { row: 10, col: 1 },{ row: 10, col: 4 }, { row: 10, col: 15 },
  { row: 10, col: 18 },
  { row: 11, col: 3 },{ row: 11, col: 7 }, { row: 11, col: 12 },
  { row: 11, col: 16 },
  { row: 12, col: 7 },{ row: 12, col: 8 }, { row: 12, col: 11 },
  { row: 12, col: 12 },
  { row: 13, col: 1 },{ row: 13, col: 2 }, { row: 13, col: 5 },
  { row: 13, col: 14 }, { row: 13, col: 17 }, { row: 13, col: 18 },
  { row: 14, col: 1 },{ row: 14, col: 6 }, { row: 14, col: 7 },
  { row: 14, col: 8 }, { row: 14, col: 11 }, { row: 14, col: 12 },
  { row: 14, col: 13 },  { row: 14, col: 18 },
  { row: 15, col: 4 }, { row: 15, col: 16 },
  { row: 16, col: 1 }, { row: 16, col: 4 },{ row: 16, col: 8 },
  { row: 16, col: 11 }, { row: 16, col: 15 }, { row: 16, col:18 },
  { row: 17, col: 1 },{ row: 17, col: 7 }, { row: 17, col: 12 }, 
  { row: 17, col: 18 },
  { row: 18, col: 1 }, { row: 18, col: 2 }, { row: 18, col: 6 },
  { row: 18, col: 9 }, { row: 18, col: 10 }, { row: 18, col: 13 },
  { row: 18, col: 17 }, { row: 18, col: 18 },
]);
const entryTeleport = ref([
  { row : 5, col: 2 },
  { row : 5, col: 17 },
  { row : 14, col: 2 },
  { row : 18, col: 19 },
])

const exits = [
  { row: 5, col: 5 },
  { row: 14, col: 5 },
  { row: 5, col: 14 },
  { row: 14, col: 14 },
  { row: 18, col: 8 },
  { row: 1, col: 11 }
];

const lockedWalls = ref([]);

const isWall = (row, col) => walls.value.some(w => w.row === row && w.col === col);
const isLockedWall = (row, col) => lockedWalls.value.some(w => w.row === row && w.col === col);

const isGoal = (row, col) => {
  const goal = playersGoals[playerTurn.value];
  return row === goal.row && col === goal.col;
};
const isRotateCase = (row, col) => rotateCompassCase.value.some(c => c.row === row && c.col === col);
const isDoubleCase = (row, col) => doubleRotateCompassCase.value.some(c => c.row === row && c.col === col);
const isEntryPoint = (row, col) => entryTeleport.value.some(p => p.row === row && p.col === col);
const isExit = (row, col) => exits.some(e => e.row === row && e.col === col);

const movePawn = (pawn, rowChange, colChange) => {
  const newRow = pawn.row + rowChange;
  const newCol = pawn.col + colChange;

  // Condition de victoire pour le joueur courant
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
  // Retire la carte jouée du jeu du joueur courant
  currentCards.value.splice(currentCards.value.indexOf(cardValue), 1);
  emit("countCards", playersCards.value.map(cards => cards.length));
};
const endTurn = () => {
  const currentDeck = playersCards.value[playerTurn.value];
  while (currentDeck.length < 3 && deck.length > 0) {
    currentDeck.push(deck[Math.floor(Math.random() * deck.length)]);
  }
  playerTurn.value = (playerTurn.value + 1) % playersCount;
  currentCards.value = playersCards.value[playerTurn.value];
  emit("countCards", playersCards.value.map(cards => cards.length));
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
  // Sélectionne une sortie selon la valeur fournie
  const findExit = exits[v - 1];
  if (findExit) {
    // Par exemple, on repositionne le pion avant de le déplacer vers la sortie
    currentPawn.row = 0;
    currentPawn.col = 0;
    movePawn(currentPawn, findExit.row, findExit.col);
  }
};
const stealCard = () => {
  // On choisit le prochain adversaire (parmi les autres joueurs)
  const target = (playerTurn.value + 1) % playersCount;
  if (playersCards.value[target].length > 0) {
    playersCards.value[playerTurn.value].push(playersCards.value[target].splice(0, 1)[0]);
  }
};
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
</style>
