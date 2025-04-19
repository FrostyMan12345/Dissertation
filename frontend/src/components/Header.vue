<template>
  <header>
    <button @click="goToMainPage"><h1>GameRecords</h1></button>

    <GameSearch />
    <UserSearch />
    <div style="display: flex; align-items: center">
      <button
        class="normal-button"
        v-if="userState.loggedIn && userState.admin"
        @click="goToRequests"
      >
        Requests
      </button>
      <button v-if="userState.loggedIn" @click="goToProfilePage">
        <ProfilePicture :header="true" />
      </button>
      <button v-else @click="goToLoginPage">
        <ProfilePicture :header="true" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import router from '@/router'
import GameSearch from './search_bar/GameSearch.vue'
import UserSearch from './search_bar/UserSearch.vue'
import ProfilePicture from './ProfilePicture.vue'
import { userState } from '@/UserData'

function goToProfilePage() {
  window.location.href = `/profile/${userState.userType}/${userState.username}`
}

function goToLoginPage() {
  router.push('/login')
}

function goToRequests() {
  router.push('/developer/requests')
}

function goToMainPage() {
  router.push('/main')
}
</script>

<style scoped>
header {
  display: flex;
  width: 100%;
  background-color: #21adcd2c;
  border-bottom: 1px solid blue;
  padding: 10px 20px;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-direction: row;
  box-shadow: black;
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
  color: #0011ff;
  font-size: 16px;
}
</style>
