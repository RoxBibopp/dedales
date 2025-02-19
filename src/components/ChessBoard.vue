<template>
  <div>
    <div v-if="winner" class="win">
      <div class="winmodal">{{ winner }} a gagné !</div>
    </div>
    <div v-if="showDirection" class="win">
      <div class="winmodal chooseModal">
        <div class="txt">choisissez une direction :</div>
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
         :class="
            { 
              wall: isWall(colIndex, rowIndex),
              locked: isLockedWall(colIndex, rowIndex),
              goal1: isGoal1(colIndex, rowIndex),
              goal2: isGoal2(colIndex, rowIndex),
              rotate: isRotateCase(colIndex, rowIndex),
              double: isDoubleCase(colIndex, rowIndex),
              entry: isEntryPoint(colIndex, rowIndex),
              exit1: isExit1(colIndex, rowIndex),
              exit2: isExit2(colIndex, rowIndex),
              exit3: isExit3(colIndex, rowIndex),
              exit4: isExit4(colIndex, rowIndex),
              exit5: isExit5(colIndex, rowIndex),
              exit6: isExit6(colIndex, rowIndex),
            }"
        ></div>
      </div>
      <Pawn :pawnPosition="pawnPosition1" :color="'purple'"/>
      <Pawn :pawnPosition="pawnPosition2" :color="'orange'"/>
    </div>
    <div>
      <PlayCard
        v-for="(card, index) in currentCards"
        class="playCard"
        :card-value="card"
        :player="playerTurn"
        @usecard="useCard"
        :style="{'left': 120 + (index * 150) +'px'}"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Pawn from './Pawn.vue';
import { defineEmits } from "vue";
import PlayCard from './PlayCard.vue';
import Dice from '../components/Dice.vue'

const emit = defineEmits(["rotate", "countCards"]);
const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
const pawnPosition1 = ref({ row: 0, col: 0 });
const pawnPosition2 = ref({ row: gridSize - 1, col: gridSize - 1 });
const goal1 = { row: gridSize - 1, col: gridSize - 1 };
const goal2 = { row: 0, col: 0 };
const winner = ref(null)
const cardDirections = ['N', 'E', 'S', 'W'];
const playerTurn = ref(1);
const deck = ['N', 'E', 'S', 'W', 'N', 'E', 'S', 'W', 'N', 'E', 'S', 'W'];
const cardsPlayer1 = ref(drawCards());
const cardsPlayer2 = ref(drawCards());
const currentCards = ref(cardsPlayer1.value);
const showDirection = ref(false);
const showDice = ref(false);
function drawCards() {
  return [...Array(3)].map(() => deck[Math.floor(Math.random() * deck.length)]);
}

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
  { row : 0, col: 1 },
  { row : 5, col: 17 },
  { row : 14, col: 2 },
  { row : 14, col: 17 },
])

const exit1 = reactive({ row : 5, col: 5 });
const exit2 = reactive({ row : 14, col: 5 });
const exit3 = reactive({ row : 5, col: 14 });
const exit4 = reactive({ row : 14, col: 14 });
const exit5 = reactive({ row : 18, col: 8 });
const exit6 = reactive({ row : 1, col: 11 });

const lockedWalls = ref([]);

const isWall = (row, col) => {
  return walls.value.some(wall => wall.row === row && wall.col === col);
};

const isLockedWall = (row, col) => {
  return lockedWalls.value.some(wall => wall.row === row && wall.col === col);
};

const isGoal1 = (row, col) => {
  return row === goal1.row && col === goal1.col;
};

const isGoal2 = (row, col) => {
  return row === goal2.row && col === goal2.col;
};

const isRotateCase = (row, col) => {
  return rotateCompassCase.value.some(rotatecase => rotatecase.row === row && rotatecase.col === col);
}
const isDoubleCase = (row, col) => {
  return doubleRotateCompassCase.value.some(rotatecase => rotatecase.row === row && rotatecase.col === col);
}

const isEntryPoint = (row, col) => {
  return entryTeleport.value.some(point => point.row === row && point.col === col);
}
const isExit1 = (row, col) => {
  return (exit1.row === row && exit1.col === col);
}
const isExit2 = (row, col) => {
  return (exit2.row === row && exit2.col === col);
}
const isExit3 = (row, col) => {
  return (exit3.row === row && exit3.col === col);
}
const isExit4 = (row, col) => {
  return (exit4.row === row && exit4.col === col);
}
const isExit5 = (row, col) => {
  return (exit5.row === row && exit5.col === col);
}
const isExit6 = (row, col) => {
  return (exit6.row === row && exit6.col === col);
}
const movePawn = (pawn, rowChange, colChange) => {
  const newRow = pawn.row + rowChange;
  const newCol = pawn.col + colChange;

  if (newRow === goal1.row && newCol === goal1.col && playerTurn.value === 1) {
    winner.value = "Joueur 1";
  }
  if (newRow === goal2.row && newCol === goal2.col && playerTurn.value === 2) {
    winner.value = "Joueur 2";
  }
  const wallIndex = walls.value.findIndex(wall => wall.row === newRow && wall.col === newCol);
  const rotateIndex = rotateCompassCase.value.findIndex(r => r.row === newRow && r.col === newCol);
  const doubleIndex = doubleRotateCompassCase.value.findIndex(r => r.row === newRow && r.col === newCol);
  const entryIndex = entryTeleport.value.findIndex(r => r.row === newRow && r.col === newCol );
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
  
  const currentPawn = playerTurn.value === 1 ? pawnPosition1.value : pawnPosition2.value;
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
  handleCardMovement(cardValue);
  currentCards.value.splice(currentCards.value.indexOf(cardValue), 1);

  emit("countCards", {player1 : cardsPlayer1.value.length, player2 :cardsPlayer2.value.length })
};

const endTurn = () => {
  const currentDeck = playerTurn.value === 1 ? cardsPlayer1 : cardsPlayer2;
  while (currentDeck.value.length < 3 && deck.length > 0) {
    currentDeck.value.push(deck[Math.floor(Math.random() * deck.length)]);
  }
  playerTurn.value = playerTurn.value === 1 ? 2 : 1;
  currentCards.value = playerTurn.value === 1 ? cardsPlayer1.value : cardsPlayer2.value;
  emit("countCards", {player1 : cardsPlayer1.value.length, player2 :cardsPlayer2.value.length })
};
defineExpose({ endTurn });

const turnRight = () => {
  rotateCompass(true)
  showDirection.value = false;
}

const turnLeft = () => {
  rotateCompass(false)
  showDirection.value = false;
}

const rotateCompass = (clockwise) => {
  clockwise ?
    cardDirections.unshift(cardDirections.pop()) :
    cardDirections.push(cardDirections.shift());
  emit("rotate", (clockwise ? 1 : -1) * 90);
};

const closeDice = () => {
  showDice.value = false;
}

const closeDiceAndMove = (v) => {
  showDice.value = false;
  const currentPawn = playerTurn.value === 1 ? pawnPosition1.value : pawnPosition2.value;
  const findExit = eval("exit" + v);
  movePawn(currentPawn, findExit.row, findExit.col -1);
}
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
