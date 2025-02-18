<template>
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
        :class="{ wall: isWall(colIndex, rowIndex), locked: isLockedWall(colIndex, rowIndex) }"
      ></div>
    </div>
    <Pawn :pawnPosition="pawnPosition1" />

  </div>
  <PlayCard
    v-for="card, index in cards"
    class="playCard"
    :card-value="card"
    @usecard="useCard"
    :style="{'left': 120 + (index * 150) +'px'}"
  />
</template>

<script setup>
import { ref } from 'vue';
import Pawn from './Pawn.vue';
import { defineEmits } from "vue";
import PlayCard from './PlayCard.vue';

const cards = ref(['N', 'E', 'S', 'W']);
const emit = defineEmits(["rotate"]);
const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
const pawnPosition1 = ref({ row: 0, col: 0 });
const cardDirections = ['N', 'E', 'S', 'W'];

const walls = ref([
  { row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 },
  { row: 7, col: 8 }, { row: 8, col: 8 }, { row: 9, col: 8 },
  { row: 1, col: 10}, { row: 1, col: 11}, { row: 1, col: 12}, { row: 1, col: 13 }
]);

const lockedWalls = ref([]);

const isWall = (row, col) => {
  return walls.value.some(wall => wall.row === row && wall.col === col);
};

const isLockedWall = (row, col) => {
  return lockedWalls.value.some(wall => wall.row === row && wall.col === col);
};

const movePawn = (pawn, rowChange, colChange) => {
  const newRow = pawn.row + rowChange;
  const newCol = pawn.col + colChange;
  
  const wallIndex = walls.value.findIndex(wall => wall.row === newRow && wall.col === newCol);
  
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
  const index = cardDirections.indexOf(direction)
  console.log(index)
  switch (index) {
    case 0:
      movePawn(pawnPosition1.value, -1, 0); 
      break;
    case 1:
      movePawn(pawnPosition1.value, 0, 1);
      break;
    case 2:
      movePawn(pawnPosition1.value, 1, 0);
      break;
    case 3:
      movePawn(pawnPosition1.value, 0, -1);
      break;
  }
};

const useCard = (cardValue) => {
  handleCardMovement(cardValue);
}

const rotateCompass = (clockwise) => {
  clockwise ?
    cardDirections.unshift(cardDirections.pop()) :
    cardDirections.push(cardDirections.shift());
  emit("rotate", (clockwise ? 1 : -1) * 90);
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

.playCard {
  user-select: none;
  position: absolute;
  bottom: 10px;
  left: 20%;
  border: 1px solid rgb(255, 255, 255);
  transition: .3s;
}
.playCard:hover {
  cursor: pointer;
  bottom: 30px;
  border: 1px solid rgb(141, 141, 255);
}
</style>
