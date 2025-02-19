<template>
  <header>
    <button @click="goToHomePage">
      <img src="../assets/home_icon.png" alt="Home" class="header-button" />
    </button>
    <h3>{{ userState }}</h3>
    <button v-if="userState.loggedIn" @click="goToProfilePage">
      <ProfilePicture :header="true" />
    </button>
    <button v-else @click="goToLoginPage">
      <ProfilePicture :header="true" />
    </button>
  </header>
  <GameSearch />
</template>

<script setup>
import { ref } from 'vue'
import router from '@/router'
import GameSearch from './GamePage/GameSearch.vue'
import ProfilePicture from './ProfilePicture.vue'
import { userState } from '@/UserData'

function goToProfilePage() {
  router.push(`/profile/${userState.userType}/${userState.username}`)
}

function goToLoginPage() {
  router.push('/login')
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
