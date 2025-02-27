<template>
  <div class="lobby">
    <h1>Lobby</h1>
    <div class="create">
      <h2>Créer une salle</h2>
      <input v-model="organizerName" placeholder="Votre nom" />
      <input v-model="organizerColor" placeholder="Votre couleur (ex: blue)" />
      <input v-model.number="expectedPlayers" placeholder="Nombre de joueurs" type="number" />
      <button @click="createRoom">Créer la salle</button>
    </div>
    <div class="join">
      <h2>Rejoindre une salle</h2>
      <input v-model="roomCode" placeholder="Code de la salle" />
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

const organizerName = ref('');
const organizerColor = ref('');
const expectedPlayers = ref(2);

const roomCode = ref('');
const playerName = ref('');
const playerColor = ref('');
const errorMessage = ref('');

const router = useRouter();

// Créer une salle
const createRoom = () => {
  socket.emit('createRoom', {
    expectedPlayers: expectedPlayers.value,
    organizerName: organizerName.value,
    organizerColor: organizerColor.value
  });
};

// Écouter l'événement roomCreated pour récupérer le code de salle
socket.on('roomCreated', (data) => {
  // On peut rediriger vers la vue de lobby en passant le code de salle
  router.push({ name: 'Lobby', query: { roomCode: data.roomCode } });
});

// Rejoindre une salle
const joinRoom = () => {
  socket.emit('joinRoom', {
    roomCode: roomCode.value,
    playerName: playerName.value,
    playerColor: playerColor.value
  });
};

// Écouter d'éventuels messages d'erreur
socket.on('errorMessage', (data) => {
  errorMessage.value = data.message;
});
</script>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create, .join {
  margin: 20px;
}
.error {
  color: red;
  font-weight: bold;
}
</style>
