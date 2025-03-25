<template>
  <div class="home-lobby">
    <h1>Bienvenue</h1>
    <div class="options">
      <button @click="mode = 'create'">Créer une salle</button>
      <button @click="mode = 'join'">Rejoindre une salle</button>
    </div>
    <div v-if="mode === 'create'" class="create">
      <h2>Créer une salle</h2>
      <input v-model="organizerName" placeholder="Votre nom" />
      <input v-model="organizerColor" placeholder="Votre couleur (ex: blue)" />
      <input v-model.number="expectedPlayers" placeholder="Nombre de joueurs" type="number" />
      <button @click="createRoom">Créer</button>
    </div>
    <div v-else-if="mode === 'join'" class="join">
      <h2>Rejoindre une salle</h2>
      <input v-model="roomCodeInput" placeholder="Code de la salle" />
      <input v-model="playerName" placeholder="Votre nom" />
      <input v-model="playerColor" placeholder="Votre couleur" />
      <button @click="joinRoom">Rejoindre</button>
    </div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import socket from '@/socket';
import { useRouter } from 'vue-router';

const mode = ref(null); // "create" ou "join"
const organizerName = ref('');
const organizerColor = ref('');
const expectedPlayers = ref(3);

const roomCodeInput = ref('');
const playerName = ref('');
const playerColor = ref('');
const errorMessage = ref('');

const router = useRouter();

// Créer une salle
const createRoom = () => {
  errorMessage.value = '';
  socket.emit('createRoom', {
    expectedPlayers: expectedPlayers.value,
    organizerName: organizerName.value,
    organizerColor: organizerColor.value
  });
};

// Rejoindre une salle
const joinRoom = () => {
  errorMessage.value = '';
  console.log('joinRoom appelé avec', roomCodeInput.value, playerName.value, playerColor.value);
  socket.emit('joinRoom', {
    roomCode: roomCodeInput.value,
    playerName: playerName.value,
    playerColor: playerColor.value
  });
};

// Listener commun pour récupérer l'état de la salle
socket.on('updateGameState', (state) => {
  console.log('updateGameState reçu :', state);
  // On redirige vers le lobby de salle dès qu'on reçoit un roomCode
  if (state.roomCode) {
    router.push({ name: 'roomLobby', query: { roomCode: state.roomCode } });
  }
});

socket.on('errorMessage', (data) => {
  errorMessage.value = data.message;
});
</script>

<style scoped>
.home-lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.options button {
  margin: 10px;
  padding: 10px 20px;
}
.create, .join {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 5px;
}
.error {
  color: red;
  margin-top: 20px;
}
</style>
