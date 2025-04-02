<template>
  <table>
    <thead>
      <tr>
        <th><h3>Ranking</h3></th>
        <th><h3>Game</h3></th>
        <th><h3>Cover</h3></th>
        <th><h3>Rating</h3></th>
        <th><h3>Hours Played</h3></th>
        <th><h3>Records</h3></th>
        <th><h3>Final Score</h3></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(game, index) in recommendations" :key="index">
        <td>
          <h3>{{ index + 1 }}</h3>
        </td>
        <td>
          <h3>
            <a
              style="color: white; text-decoration: none; text-align: start"
              :href="`http://localhost:5173/game/${game.id}`"
              >{{ game.name }}</a
            >
          </h3>
        </td>
        <td v-if="game.cover">
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.cover?.image_id}.jpg`"
            alt="Game Cover"
            class="game-image"
            crossorigin="anonymous"
          />
        </td>
        <td v-else>
          <h6 style="text-align: center">Unavailable</h6>
        </td>
        <td>
          <h3 v-if="rankingValue === 'Rating'" style="font-weight: bold; text-align: center">
            {{ game.average_rating || 0 }}/5
          </h3>
          <h3 v-else style="text-align: center">{{ game.average_rating || 0 }}/5</h3>
        </td>
        <td>
          <h3 v-if="rankingValue === 'Time PLayed'" style="font-weight: bold; text-align: center">
            {{ game.average_hours_played || 0 }}
          </h3>
          <h3 v-else style="text-align: center">{{ game.average_hours_played || 0 }}</h3>
        </td>
        <td>
          <h3 v-if="rankingValue === 'Most Popular'" style="font-weight: bold; text-align: center">
            {{ game.records_made || 0 }}
          </h3>
          <h3 v-else style="text-align: center">{{ game.records_made || 0 }}</h3>
        </td>
        <td>
          <h3>
            {{ score[index] }}
          </h3>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { userState } from '@/UserData'

const route = useRoute()
const username = route.params.username
const userType = route.params.userType
const recommendations = ref([])
const score = ref([])

async function getRecommendations() {
  try {
    const userRecommendations = await axios.get(
      `http://localhost:5000/get/${userType}/${username}/recommendations`,
    )
    console.log(userRecommendations.data)
    reccomendations.value = userRecommendations.data.recommendations.map((rec) => rec.game)
    score.value = userRecommendations.data.recommendations.map((rec) => rec.finalScore)
  } catch (error) {
    console.log(`Error getting recommendations ${error}`)
  }
}

onMounted(() => {
  getRecommendations()
})
</script>

<style scoped></style>
