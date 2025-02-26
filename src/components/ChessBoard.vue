<template>
  <div class="home">
    <!-- Affichage du gagnant -->
    <div v-if="gameState.winner" class="win">
      <div class="winmodal">{{ gameState.winner }} a gagné !</div>
    </div>

    <!-- Plateau de jeu -->
    <div class="chessboard">
      <div v-for="(row, rowIndex) in grid" :key="'row-' + rowIndex" class="row">
        <div
          v-for="(cell, colIndex) in row"
          :key="'cell-' + rowIndex + '-' + colIndex"
          class="cell"
          :class="{
            goal: isGoal(colIndex, rowIndex),
            wall: isWall(rowIndex, colIndex),
            locked: isLockedWall(rowIndex, colIndex),
            rotate: isRotateCase(rowIndex, colIndex),
            double: isDoubleCase(rowIndex, colIndex),
            entry: isEntryPoint(rowIndex, colIndex),
            exit1: isExit1(rowIndex, colIndex),
            exit2: isExit2(rowIndex, colIndex),
            exit3: isExit3(rowIndex, colIndex),
            exit4: isExit4(rowIndex, colIndex),
            exit5: isExit5(rowIndex, colIndex),
            exit6: isExit6(rowIndex, colIndex)
          }"
          :style="getGoalStyle(colIndex, rowIndex)"
        ></div>
      </div>
      <!-- Affichage des pions pour chaque joueur -->
      <Pawn
        v-for="(player, socketId) in gameState.players"
        :key="socketId"
        :pawnPosition="player.position"
        :color="player.color"
      />
    </div>

    <!-- Affichage de la main du joueur connecté -->
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

    <!-- Bouton pour finir le tour (affiché uniquement si c'est votre tour) -->
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
// Importez également vos données terrain locales (pour le fallback ou le rendu initial)
import { wallsData, rotateCompassData, doubleRotateCompassData, entryTeleportData } from '@/constants/config';

// Récupération des paramètres depuis l'URL
const route = useRoute();
const playersCount = parseInt(route.query.players) || 2;
const namesArr = route.query.names ? route.query.names.split(',') : [];
const colorsArr = route.query.colors ? route.query.colors.split(',') : [];

// Identifiant de la partie (fixé ici, à adapter selon vos besoins)
const gameId = 'game1';

// État complet du jeu synchronisé depuis le serveur
const gameState = ref({
  deck: 0,
  discardPile: 0,
  players: {}, 
  playerOrder: [],
  playerTurn: 0,
  winner: null,
  // Ces propriétés seront ajoutées par le serveur lors de l'émission updateGameState
  wallsData: wallsData,
  rotateCompassData: rotateCompassData,
  doubleRotateCompassData: doubleRotateCompassData,
  entryTeleportData: entryTeleportData,
  playersGoals: [] // Si géré côté serveur
});

// Grille pour le plateau (20x20)
const gridSize = 20;
const grid = ref(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));

// Couleurs des joueurs (si non envoyé par le serveur, on utilise ces valeurs locales)
const baseColors = ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];
const playersColors = colorsArr.length
  ? colorsArr
  : Array.from({ length: playersCount }, (_, i) => baseColors[i % baseColors.length]);

// Variable locale pour verrouiller les murs (si nécessaire, ce comportement peut être géré côté serveur)
const lockedWalls = ref([]);

// Fonctions de vérification du terrain
function isGoal(col, row) {
  const goals = gameState.value.playersGoals || [];
  return goals.some(goal => goal.row === row && goal.col === col);
}
function isWall(row, col) {
  // Utilise les murs envoyés par le serveur, sinon le fallback local
  const walls = gameState.value.wallsData || wallsData;
  return walls.some(w => w.row === row && w.col === col);
}
function isLockedWall(row, col) {
  return lockedWalls.value.some(w => w.row === row && w.col === col);
}
function isRotateCase(row, col) {
  const rotates = gameState.value.rotateCompassData || rotateCompassData;
  return rotates.some(c => c.row === row && c.col === col);
}
function isDoubleCase(row, col) {
  const doubles = gameState.value.doubleRotateCompassData || doubleRotateCompassData;
  return doubles.some(c => c.row === row && c.col === col);
}
function isEntryPoint(row, col) {
  const entries = gameState.value.entryTeleportData || entryTeleportData;
  return entries.some(p => p.row === row && p.col === col);
}
// Définition statique des sorties (les mêmes qu'avant)
const exit1 = { row: 5, col: 5 };
const exit2 = { row: 14, col: 5 };
const exit3 = { row: 5, col: 14 };
const exit4 = { row: 14, col: 14 };
const exit5 = { row: 18, col: 8 };
const exit6 = { row: 1, col: 11 };
function isExit1(row, col) { return exit1.row === row && exit1.col === col; }
function isExit2(row, col) { return exit2.row === row && exit2.col === col; }
function isExit3(row, col) { return exit3.row === row && exit3.col === col; }
function isExit4(row, col) { return exit4.row === row && exit4.col === col; }
function isExit5(row, col) { return exit5.row === row && exit5.col === col; }
function isExit6(row, col) { return exit6.row === row && exit6.col === col; }

function getGoalStyle(col, row) {
  const goals = gameState.value.playersGoals || [];
  const goalIndex = goals.findIndex(goal => goal.row === row && goal.col === col);
  if (goalIndex !== -1) {
    return { backgroundColor: playersColors[goalIndex] };
  }
  return {};
}

// Détermine la main du joueur connecté en se basant sur socket.id
const myHand = computed(() => {
  return gameState.value.players[socket.id]?.hand || [];
});

// Détermine si c'est le tour du joueur connecté
const isMyTurn = computed(() => {
  if (!gameState.value.playerOrder.length) return false;
  return gameState.value.playerOrder[gameState.value.playerTurn] === socket.id;
});

// Connexion et rejoindre la partie
onMounted(() => {
  socket.emit('joinGame', { 
    gameId, 
    playersCount, 
    names: namesArr, 
    colors: colorsArr 
  });
});

// Mise à jour de l'état du jeu depuis le serveur
socket.on('updateGameState', (state) => {
  console.log('État du jeu mis à jour', state);
  gameState.value = state;
});

// Envoi d'une action "useCard" au serveur
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

// Envoi de l'action "endTurn" au serveur
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
.row {
  display: contents;
}
.cell {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
/* Exemples de styles selon les classes */
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
/* Autres styles identiques à votre version d'origine */
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
