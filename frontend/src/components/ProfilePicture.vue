<template>
  <div v-if="header">
    <img
      v-if="userState.loggedIn && userState.profilePicture !== undefined"
      class="profilePicture"
      :src="`http://localhost:5000/Uploads/${userState.profilePicture}`"
    />
    <img v-else class="profilePicture" src="../assets/profile_icon.png" />
  </div>
  <div v-else>
    <img v-if="image" class="profilePicture" :src="`http://localhost:5000/Uploads/${image}`" />
    <img v-else class="profilePicture" src="../assets/profile_icon.png" />
  </div>
  <!-- <h1>{{ image }}</h1> -->
</template>

<script setup>
import { userState } from '@/UserData'

const props = defineProps({
  image: String,
  header: { type: Boolean, default: false },
})
</script>

<style scoped></style>
