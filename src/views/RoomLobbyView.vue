<template>
  <div class="room-lobby">
    <h1>Salle {{ roomCode }}</h1>
    <p>Partie de {{ roomName }} - {{ currentPlayers }} / {{ gameState.expectedPlayers }} joueurs</p>
    <ul>
      <li v-for="(player, id) in gameState.players" :key="id">
        {{ player.name }} ({{ player.color }})
      </li>
    </ul>
    <div v-if="isCreator">
      <button @click="startGame">Lancer la partie</button>
    </div>
    <div v-else>
      <p>Attente du chef pour démarrer la partie...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import socket from '@/socket';

const router = useRouter();
const route = useRoute();

// On récupère le roomCode depuis la query
const roomCode = ref(route.query.roomCode || '');
const gameState = ref({ players: {}, expectedPlayers: 0, roomCode: roomCode.value });
const roomName = ref(''); // Vous pouvez définir ici un nom de partie si désiré

// Nombre de joueurs actuels
const currentPlayers = computed(() => Object.keys(gameState.value.players).length);

// Vérifier si l'utilisateur est le créateur (premier dans playerOrder)
const isCreator = computed(() => {
  return gameState.value.playerOrder && gameState.value.playerOrder[0] === socket.id;
});

// Émettre un update pour rejoindre la salle (si nécessaire)
onMounted(() => {
  // Vous pouvez émettre un join ici si vous ne l'avez pas déjà fait
  // Par exemple, vous pouvez rediriger ici en fonction de la query, mais normalement le join est déjà fait via HomeLobby.
  
  socket.on('updateGameState', (state) => {
    console.log('updateGameState (RoomLobby) reçu :', state);
    gameState.value = state;
    if (state.roomCode) {
      roomCode.value = state.roomCode;
    }
  });
  
  socket.on('startGame', (state) => {
    console.log('startGame (RoomLobby) reçu, état :', state);
    // Désactive les listeners pour éviter qu'ils ne déclenchent d'autres mises à jour
    socket.off('updateGameState');
    socket.off('startGame');
    
    const names = Object.values(state.players).map(player => player.name);
    const colors = Object.values(state.players).map(player => player.color);
    router.push({
      name: 'game',
      query: {
        roomCode: state.roomCode,
        players: state.expectedPlayers,
        names: names.join(','),
        colors: colors.join(',')
      }
    });
  });
  
  socket.on('errorMessage', (data) => {
    console.log('errorMessage (RoomLobby) reçu :', data);
  });

  socket.emit('getState', { roomCode: roomCode.value });
});

// Fonction pour démarrer la partie (pour le créateur)
const startGame = () => {
  socket.emit('startGame', { gameId: roomCode.value });
};
</script>

<style scoped>
.room-lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.room-lobby ul {
  list-style: none;
  padding: 0;
}
.room-lobby li {
  margin: 5px 0;
}
button {
  margin-top: 20px;
  padding: 10px 20px;
}
</style>
