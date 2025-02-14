<template>
  <header>
    <button @click="goToHomePage">
      <img src="../assets/home_icon.png" alt="Home" class="header-button" />
    </button>
    <h3>My App Header</h3>
    <button @click="goToProfilePage">
      <img src="../assets/profile_icon.png" alt="Profile" class="header-button" />
    </button>
  </header>
  <GameSearch />
</template>

<script setup>
import { ref } from 'vue'
import router from '@/router'
import GameSearch from './GamePage/GameSearch.vue'

function goToProfilePage() {
  router.replace('/login')
}

function goToHomePage() {
  router.replace('/main')
}
</script>

<style scoped>
header {
  display: flex;
  width: 100%;
  background-color: #21adcd00;
  border: 1px solid blue;
  padding: 10px 20px;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-direction: row;
}

h3 {
  margin: 0;
}

.header-button {
  width: 50px;
  height: 50px;
  justify-self: left;
}

button {
  padding: 5px 10px;
  border: none;
  background-color: #ffffff00;
  color: #000000;
  font-size: 16px;
}
</style>
