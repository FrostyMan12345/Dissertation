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
const hasPlayed = ref(false)
const logging = ref(false)
const popup = ref(false)

async function getGameData() {
  try {
    const response = await axios.get(`http://localhost:5000/game/${gameId}/data`)
    const gameInfo = response.data
    Object.assign(game, Game.gameFromObject(gameInfo))
    console.log(game)
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}

async function logGameData() {
  try {
    const response = await axios.post(`http://localhost:5000/game/${gameId}/log`, {
      userState,
      rating: 42,
      timesPlayed: 2,
      hoursPlayed: 3,
      // review: {
      //   username: userState.username,
      //   review_content: 'Indeed',
      //   likes: 0,
      //   dislikes: 0,
      //   created: 'now',
      //   edited: false,
      //   reactions: [],
      //   review_id: '',
      // },
      game,
    })
    const gameInfo = response.data
    console.log(gameInfo)
  } catch (error) {
    console.error(error)
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
  <button @click="activateModal" v-if="userState.loggedIn">{{ userState }}</button>
  <button v-else>INDEED</button>
  <ReviewsSection :playedBy="game.playedBy" :dev-comments="game?.comments" />
  <ReviewMaker :modalActive="popup" :game="game" @modal-exit="closeModal" />
</template>
