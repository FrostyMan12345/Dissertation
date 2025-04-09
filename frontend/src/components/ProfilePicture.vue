<template>
  <div v-if="header">
    <img
      v-if="
        userState.loggedIn &&
        userState.profilePicture !== undefined &&
        userState.profilePicture !== null &&
        userState.profilePicture !== ''
      "
      class="profilePicture"
      :src="`http://localhost:5000/uploads/${userState.profilePicture}`"
    />
    <img v-else class="profilePicture" src="../assets/profile_icon.png" />
  </div>
  <div v-else-if="small">
    <img
      v-if="image !== undefined && image !== '' && image !== null"
      class="profilePicture"
      :src="`http://localhost:5000/uploads/${image}`"
    />
    <img v-else class="profilePicture" src="../assets/profile_icon.png" />
  </div>
  <div v-else>
    <img
      v-if="image !== undefined && image !== '' && image !== null"
      class="profilePicture"
      style="width: 100px; height: 100px"
      :src="`http://localhost:5000/uploads/${image}`"
    />
    <img
      v-else
      class="profilePicture"
      style="width: 100px; height: 100px"
      src="../assets/profile_icon.png"
    />
  </div>
  <!-- <h1>
    {{
      userState.loggedIn &&
      userState.profilePicture != undefined &&
      userState.profilePicture != null
    }}
  </h1>
  <h1>{{ image === undefined }}</h1> -->
</template>

<script setup>
import { userState } from '@/UserData'

const props = defineProps({
  image: String,
  small: { type: Boolean, default: false },
  header: { type: Boolean, default: false },
})
</script>

<style scoped></style>
