<script setup>
import GameInfo from '@/components/GamePage/GameInfo.vue'
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { Game } from '../Game'
import ReviewsSection from '@/components/GamePage/ReviewsSection.vue'
import { userState } from '@/UserData'
import ReviewMaker from '@/components/GamePage/ReviewMaker.vue'

const game = reactive(new Game())
const imageID = ref(0)
const route = useRoute()
const gameId = route.params.id
const hasLogged = ref(false)
const popup = ref(false)

async function getGameData() {
  try {
    const response = await axios.get(`http://localhost:5000/game/${gameId}/data`)
    const gameInfo = response.data
    Object.assign(game, Game.gameFromObject(gameInfo))
    console.log(game)
    const hasLoggedResponse = await axios.get(`http://localhost:5000/game/${gameId}/log/check`, {
      params: {
        userId: userState.userId,
      },
    })
    console.log(hasLoggedResponse.data)
    const logGet = await axios.get(`http://localhost:5000/game/${gameId}/log/get`, {
      params: {
        userId: userState.userId,
      },
    })
    console.log(logGet.data)
    hasLogged.value = hasLoggedResponse.data.logged
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}

function activateModal() {
  console.log('toggle Modal')
  popup.value = true
}

function closeModal() {
  popup.value = false
}

onMounted(() => {
  getGameData()
})
</script>

<template>
  <GameInfo :game="game" :image-id="imageID" />
  <div v-if="!hasLogged">
    <button @click="activateModal" v-if="userState.loggedIn">Log {{ userState }}</button>
    <p v-else>Log in to log your experience</p>
  </div>
  <div v-else>
    <button @click="activateModal" v-if="userState.loggedIn">Edit your experience</button>
  </div>
  <ReviewsSection :playedBy="game.playedBy" :dev-comments="game?.comments" />
  <ReviewMaker :modalActive="popup" :game="game" @modal-exit="closeModal" />
</template>
