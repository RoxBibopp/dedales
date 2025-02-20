<template>
  <div class="home">
    <ChessBoard @rotate="rotateCompass" @count-cards="changeCards" ref="chessRef"/>
    <div class="boussole">
      <img src="../assets/boussol.png" :style="{'transform': 'rotate('+ deg +'deg)'}"alt="">
      
      <div class="player">
        <div class="nameColor">
          <div class="name">Joueur 1 :</div>
          <div class="color"></div>
        </div>
        <div class="cards">
          <div v-for="cards in cardsPlayer1" class="card"></div>
        </div>
      </div>
      <div class="player">
        <div class="nameColor">
          <div class="name">Joueur 2 :</div>
          <div class="color2"></div>
        </div>
        <div class="cards">
          <div v-for="cards in cardsPlayer2"  class="card2"></div>
        </div>
      </div>
      <div @click="triggerEndTurn" class="end-turn">Finir le tour</div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import ChessBoard from '@/components/ChessBoard.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const playersCount = parseInt(route.query.players) || 2;

  const chessRef = ref(null);
  const cardsPlayer1 = ref(3)
  const cardsPlayer2 = ref(3);
  const triggerEndTurn = () => {
    if ( chessRef.value ) {
      chessRef.value.endTurn();
    }
  }
  const deg = ref(0);
  const rotateCompass = (r) => {
    deg.value += r;
  }
  const changeCards = (players) => {
    cardsPlayer1.value = players.player1
    cardsPlayer2.value = players.player2
  }
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
      transition: .5s;
    }
    .end-turn {
      background-color: white;
      border: 1px solid black;
      padding:  10px 40px;
      margin-top: 40px;
      transition: .2s;
    }
    .end-turn:hover {
      cursor: pointer;
      transform: translateY(-2px);
      box-shadow: 0px 2px 14px -4px rgba(0,0,0,0.5);
    }
    .player {
      width: 100%;
      margin-top: 40px;
      text-align: left;  
      .nameColor {        
        display: flex;
        align-items: center;
      }
      .color {
        height: 15px;
        width: 15px;
        background-color: purple;
        margin-left: 15px;
        border-radius: 50%;
      }
      .color2 {
        height: 15px;
        width: 15px;
        background-color: orange;
        margin-left: 15px;
        border-radius: 50%;
      }
      .cards {
        margin-top: 20px;
        display: flex;
        .card {
          margin-right: 5px;
          height: 35px;
          width: 20px;
          background-color: purple;
          border: 2px solid white;
          box-shadow: 0px 0px 14px -4px rgba(0,0,0,0.5);
        }
        .card2{
          margin-right: 5px;
          height: 35px;
          width: 20px;
          background-color: orange;
          border: 2px solid white;
          box-shadow: 0px 0px 14px -4px rgba(0,0,0,0.5);
        }
      }
    }
  }
</style>