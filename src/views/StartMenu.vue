<template>
  <div>
    <h1>Choisissez le nombre de joueurs</h1>
    <select v-model="playersCount">
      <option :value="2">2 Joueurs</option>
      <option :value="3">3 Joueurs</option>
      <option :value="4">4 Joueurs</option>
    </select>
    <button @click="startGame">Démarrer la partie</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const playersCount = ref(2);

const startGame = () => {
  router.push({ name: 'game', query: { players: playersCount.value } });
};
</script>

