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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import socket from '@/socket';

const organizerName = ref('');
const organizerColor = ref('');
const expectedPlayers = ref(3);  // Par exemple, 3 joueurs

const roomCode = ref('');
const playerName = ref('');
const playerColor = ref('');
const errorMessage = ref('');

const router = useRouter();

// Fonction pour créer la salle
const createRoom = () => {
  socket.emit('createRoom', {
    expectedPlayers: expectedPlayers.value,
    organizerName: organizerName.value,
    organizerColor: organizerColor.value
  });
};

// Fonction pour rejoindre la salle
const joinRoom = () => {
  socket.emit('joinRoom', {
    roomCode: roomCode.value,
    playerName: playerName.value,
    playerColor: playerColor.value
  });
};

// Attacher le listener dès le montage pour être sûr de ne rien manquer
onMounted(() => {
  socket.on('roomCreated', (data) => {
    console.log('Salle créée :', data.roomCode);
    roomCode.value = data.roomCode;  // Mémorise le roomCode
  });

  socket.on('startGame', (state) => {
    console.log('startGame reçu, état:', state);
    // Prépare la redirection avec les données du serveur
    const names = Object.values(state.players).map(player => player.name);
    const colors = Object.values(state.players).map(player => player.color);
    router.push({
      name: 'game',
      query: {
        roomCode: data?.roomCode || roomCode.value, // Si roomCreated a été reçu
        players: state.expectedPlayers,
        names: names.join(','),
        colors: colors.join(',')
      }
    });
  });

  socket.on('errorMessage', (data) => {
    errorMessage.value = data.message;
  });
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
