<template>
  <div class="home">
    <ChessBoard @rotate="rotateCompass"/>
    <div class="boussole">
      <img src="../assets/boussol.png" :style="{'transform': 'rotate('+ deg +'deg)'}"alt="">
    </div>
  </div>
</template>

<script setup>
  import{ref} from 'vue';
  import ChessBoard from '@/components/ChessBoard.vue';
  const deg = ref(0);
  const rotateCompass = (r) => {
    console.log(r)
    deg.value += r;
  }
</script>

<style lang="scss">
  .home {
    display: flex;

    img {
      height: 200px;
      margin-left: 100px;
      transform-origin: center;
      transition: .5s;
    }
  }
</style>