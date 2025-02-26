<template>
  <div class="home">
    <!-- Le composant ChessBoard reste présent pour afficher le plateau et éventuellement les animations -->
    <ChessBoard @rotate="rotateCompass" ref="chessRef"/>
    
    <div class="boussole">
      <img src="../assets/boussol.png" :style="{ transform: 'rotate(' + deg + 'deg)' }" alt="Boussole">

      <!-- Affichage des statistiques du deck et de la défausse reçues du serveur -->
      <div class="deck-stats">
        <p>Deck : {{ deckCount }} carte<span v-if="deckCount !== 1">s</span></p>
        <p>Défausse : {{ discardCount }} carte<span v-if="discardCount !== 1">s</span></p>
      </div>
      
      <!-- Affichage de la liste des joueurs et de leur main (état reçu du serveur) -->
      <div v-for="(player, index) in players" :key="index" class="player">
        <div class="nameColor">
          <div class="name">{{ player.name }} :</div>
          <div class="color" :style="{ backgroundColor: player.color }"></div>
        </div>
        <div class="cards">
          <!-- On affiche ici les cartes de la main du joueur -->
          <div 
            v-for="(card, idx) in player.hand" 
            :key="idx" 
            class="card" 
            :style="{ backgroundColor: player.color }">
            {{ card.type }}
          </div>
        </div>
      </div>
      
      <!-- Bouton pour finir le tour -->
      <div @click="triggerEndTurn" class="end-turn">Finir le tour</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ChessBoard from '@/components/ChessBoard.vue';
import socket from '@/socket';  // Assurez-vous d'avoir créé ce module avec socket.io-client

// Récupérer les paramètres depuis l'URL
const route = useRoute();
const playersCount = parseInt(route.query.players) || 2;
const namesQuery = route.query.names;
const namesArr = namesQuery ? namesQuery.split(',') : [];
const colorsQuery = route.query.colors;
const colorsArr = colorsQuery ? colorsQuery.split(',') : [];

// Pour cet exemple, on fixe le gameId à "game1" (vous pouvez l'adapter)
const gameId = 'game1';

// Références réactives pour les statistiques du jeu reçues du serveur
const deckCount = ref(0);
const discardCount = ref(0);
const players = ref([]); // La liste des joueurs sera mise à jour depuis l'état du serveur

// Autres références pour l'affichage (par exemple, la boussole)
const chessRef = ref(null);
const deg = ref(0);

// Lors du montage, rejoindre la partie en envoyant les informations au serveur
onMounted(() => {
  socket.emit('joinGame', { 
    gameId, 
    playersCount, 
    names: namesArr, 
    colors: colorsArr 
  });
});

// Écouter l'événement "updateGameState" envoyé par le serveur
socket.on('updateGameState', (state) => {
  console.log('État du jeu reçu', state);
  deckCount.value = state.deck.length !== undefined ? state.deck.length : state.deck;
  discardCount.value = state.discardPile.length !== undefined ? state.discardPile.length : state.discard;
  // Mettre à jour la liste des joueurs à partir de l'objet state.players
  // On transforme l'objet en tableau pour une itération plus simple dans le template
  players.value = Object.values(state.players);
});

// Fonction pour envoyer l'action "endTurn" au serveur
const triggerEndTurn = () => {
  if (chessRef.value) {
    // Plutôt que d'appeler une méthode locale, on envoie l'action au serveur
    socket.emit('playerAction', { 
      gameId, 
      action: 'endTurn', 
      payload: {} 
    });
  }
};

// Exemple simple de rotation de la boussole (pour l'affichage)
const rotateCompass = (r) => {
  deg.value += r;
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
