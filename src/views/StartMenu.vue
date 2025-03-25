<template>
  <div class="lobby-view">
    <div class="create-room">
      <h2 @click="showCreateRoom = true" class="joinCreate">Créer une salle</h2>
      <div v-if="showCreateRoom">
        <label>Nombre de joueurs :</label>
        <select v-model="expectedPlayers">
          <option :value="2">2 Joueurs</option>
          <option :value="3">3 Joueurs</option>
          <option :value="4">4 Joueurs</option>
        </select>
        <label>Votre nom :</label>
        <input v-model="organizerName" placeholder="Nom de l'organisateur" />
        <label>Votre couleur :</label>
        <ColorSelect v-model="organizerColor" :colors="baseColors" />
        <button @click="createRoom">Créer la salle</button>
        <div v-if="createdRoomCode" class="room-code">
          <p>Salle créée : <strong>{{ createdRoomCode }}</strong></p>
        </div>
      </div>
    </div>

    <div class="join-room">
      <h2 @click="showJoinRoom = true" class="joinCreate">Rejoindre une salle</h2>
      <div v-if="showJoinRoom">
        <label>Code de la salle :</label>
        <input v-model="joinRoomCode" placeholder="Entrez le code" />
        <label>Votre nom :</label>
        <input v-model="playerName" placeholder="Votre nom" />
        <label>Votre couleur :</label>
        <ColorSelect v-model="playerColor" :colors="baseColors" />
        <button @click="joinRoom">Rejoindre la salle</button>
      </div>
    </div>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import socket from '@/socket';
import ColorSelect from '../components/ColorSelect.vue';

const router = useRouter();
const showCreateRoom = ref(false);
const showJoinRoom = ref(false);

const baseColors = ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];

const expectedPlayers = ref(2);
const organizerName = ref('');
const organizerColor = ref(baseColors[0]);

const joinRoomCode = ref('');
const playerName = ref('');
const playerColor = ref(baseColors[1]);

const createdRoomCode = ref('');
const errorMessage = ref('');

const createRoom = () => {
  socket.emit('createRoom', {
    expectedPlayers: expectedPlayers.value,
    organizerName: organizerName.value,
    organizerColor: organizerColor.value
  });
};

const joinRoom = () => {
  socket.emit('joinRoom', {
    roomCode: joinRoomCode.value,
    playerName: playerName.value,
    playerColor: playerColor.value
  });
};

// Dès que le serveur envoie une mise à jour, on redirige vers le lobby de salle
socket.on('updateGameState', (state) => {
  // On suppose que state contient bien la propriété roomCode
  if (state.roomCode) {
    // On redirige vers la vue du lobby en passant le roomCode
    router.push({
      name: 'roomlobby',
      query: {
        roomCode: state.roomCode
      }
    });
  }
});

socket.on('roomCreated', (data) => {
  createdRoomCode.value = data.roomCode;
});

socket.on('errorMessage', (data) => {
  errorMessage.value = data.message;
});

// Ici, on ne redirige plus directement vers "game", le lobby gère la redirection ultérieure
</script>

<style scoped>
.lobby-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
}
.create-room, .join-room {
  border: 1px solid #ccc;
  padding: 20px;
  margin: 20px;
  width: 300px;
  border-radius: 5px;
}
label {
  display: block;
  margin-top: 10px;
}
input, select {
  width: 100%;
  padding: 5px;
  margin-top: 5px;
}
button {
  margin-top: 15px;
  padding: 10px 20px;
  cursor: pointer;
}
.error {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
.room-code {
  margin-top: 15px;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}
.joinCreate:hover {
  cursor: pointer;
}
</style>
