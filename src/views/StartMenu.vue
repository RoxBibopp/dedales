<template>
  <div>
    <h1>Choisissez le nombre de joueurs</h1>
    <select v-model="playersCount">
      <option :value="2">2 Joueurs</option>
      <option :value="3">3 Joueurs</option>
      <option :value="4">4 Joueurs</option>
    </select>
    <div v-for="(player, index) in playersSettings" :key="index" style="margin: 10px 0;">
      <label>Nom du joueur {{ index + 1 }} :</label>
      <input v-model="player.name" placeholder="Entrez le nom" />
      <label>Couleur :</label>
      <ColorSelect v-model="player.color" :colors="baseColors" />
    </div>
    <button @click="startGame">Démarrer la partie</button>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ColorSelect from '../components/ColorSelect.vue';

const router = useRouter();
const playersCount = ref(2);
const baseColors = ['purple', 'orange', 'blue', 'green', 'red', 'yellow'];

const playersSettings = ref([
  { name: '', color: baseColors[0] },
  { name: '', color: baseColors[1] }
]);

watch(playersCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    for (let i = oldCount; i < newCount; i++) {
      playersSettings.value.push({
        name: '',
        color: baseColors[i % baseColors.length]
      });
    }
  } else if (newCount < oldCount) {
    playersSettings.value.splice(newCount);
  }
});

const startGame = () => {
  const names = playersSettings.value.map((player, index) => player.name || `Joueur ${index + 1}`);
  const colors = playersSettings.value.map(player => player.color);
  router.push({
    name: 'game',
    query: {
      players: playersCount.value,
      names: names.join(','),
      colors: colors.join(',')
    }
  });
};
</script>

<style scoped>
.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 10px;
  border: 1px solid #ccc;
  border-radius: 50%;
}
</style>
