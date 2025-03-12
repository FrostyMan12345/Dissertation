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
const hasLogged = ref(null)
const loggedRating = ref(0)
const loggedReview = reactive({})
const loggedTimesPlayed = ref(0)
const loggedHoursPlayed = ref(0)
const popup = ref(false)
const editing = ref(false)

async function getGameData() {
  try {
    const response = await axios.get(`http://localhost:5000/game/${gameId}/data`)
    const gameInfo = response.data
    Object.assign(game, Game.gameFromObject(gameInfo))
    console.log(game)
    const hasLoggedResponse = await axios.get(`http://localhost:5000/game/${gameId}/record/check`, {
      params: {
        userId: userState.userId,
      },
    })
    const logGet = await axios.get(`http://localhost:5000/game/${gameId}/record/get`, {
      params: {
        userId: userState.userId,
      },
    })
    // console.log(logGet.data.logData[0])
    loggedReview.value = logGet.data.logData[0]?.review
    loggedHoursPlayed.value = logGet.data.logData[0].hours_played
    loggedTimesPlayed.value = logGet.data.logData[0].times_played
    loggedRating.value = logGet.data.logData[0].rating
    hasLogged.value = hasLoggedResponse.data.logged
  } catch (error) {
    console.error('Error fetching game and log data:', error)
    hasLogged.value = false
  }
}

function activateRecordModal() {
  console.log('toggle Modal')
  editing.value = false
  popup.value = true
}

function activateEditModal() {
  console.log('toggle Modal')
  editing.value = true
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
  <GameInfo
    v-if="hasLogged !== null"
    :game="game"
    :hasLogged="hasLogged"
    :image-id="imageID"
    @make-record="activateRecordModal"
    @edit-record="activateEditModal"
  />

  <ReviewsSection :playedBy="game.playedBy" :dev-comments="game?.comments" />
  <ReviewMaker
    v-if="hasLogged !== null"
    :modalActive="popup"
    :edit="editing"
    :review="loggedReview"
    :rating="loggedRating"
    :timesPlayed="loggedTimesPlayed"
    :hoursPlayed="loggedHoursPlayed"
    :game="game"
    @modal-exit="closeModal"
  />
  <!-- {{ loggedReview }} {{ loggedRating }} {{ loggedHoursPlayed }} {{ loggedTimesPlayed }} -->
</template>

<style scoped></style>
