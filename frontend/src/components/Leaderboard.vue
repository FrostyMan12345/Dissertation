<template>
  <div class="horizontal-container">
    {{ leaderboardLength.va }}
    <table v-if="leaderboardLength > 0" width="80%">
      <thead>
        <tr>
          <th><h3>Ranking</h3></th>
          <th><h3>Game</h3></th>
          <th><h3>Cover</h3></th>
          <th><h3>Rating</h3></th>
          <th><h3>Hours Played</h3></th>
          <th><h3>Records</h3></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(game, index) in paginatedLeaderboard" :key="index">
          <td>
            <h3>{{ index + 1 + (leaderboardPage - 1) * itemsPerPage }}</h3>
          </td>
          <td>
            <h3>
              <a
                style="color: white; text-decoration: none"
                :href="`http://localhost:5173/game/${game.id}`"
                >{{ game.name }}</a
              >
            </h3>
          </td>
          <td>
            <img
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.cover?.image_id}.jpg`"
              alt="Game Cover"
              class="game-image"
              crossorigin="anonymous"
            />
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
            <h3
              v-if="rankingValue === 'Most Popular'"
              style="font-weight: bold; text-align: center"
            >
              {{ game.records_made || 0 }}
            </h3>
            <h3 v-else style="text-align: center">{{ game.records_made || 0 }}</h3>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- {{ rankingValue }} -->
    <div class="vertical-sticky-container">
      <CriteriaSelector
        :rankValue="rankingValue"
        class="shadowed"
        @change-ranking="changeCriteria"
      />
      <vue-awesome-paginate
        v-if="leaderboardLength > 0"
        :total-items="leaderboardLength"
        :items-per-page="itemsPerPage"
        :max-pages-shown="3"
        v-model="leaderboardPage"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import axios from 'axios'
import CriteriaSelector from './CriteriaSelector.vue'

const leaderboardPage = ref(1)
const itemsPerPage = 500
const startItem = ref(500 * leaderboardPage.value)
const rankingValue = ref(sessionStorage.getItem('rankingCriteria') || 'Rating')
const leaderboard = reactive([])
const leaderboardLength = ref(0)
const changeCriteria = (criteria) => {
  rankingValue.value = criteria
  location.reload()
}
const paginatedLeaderboard = computed(() => {
  const startIndex = (leaderboardPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return leaderboard.value.slice(startIndex, endIndex)
})

async function getCompleteLeaderboard() {
  try {
    var urlCriteria = ''
    console.log(rankingValue.value)
    if (rankingValue.value === 'Rating') {
      urlCriteria = 'average_rating'
    } else if (rankingValue.value === 'Play Time') {
      urlCriteria = 'average_hours_played'
    } else if (rankingValue.value === 'Most Popular') {
      urlCriteria = 'records_made'
    }
    const leaderboardResponse = await axios.get(`http://localhost:5000/leaderboard/${urlCriteria}`)
    console.log(leaderboardResponse.data.leaderboard)
    leaderboard.value = leaderboardResponse.data.leaderboard
    leaderboardLength.value = leaderboard.value.length
  } catch (error) {
    console.log(`Leaderboard Get Failure: ${error}`)
  }
}

onMounted(() => {
  getCompleteLeaderboard()
})
</script>

<style scoped>
table {
  width: 80%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border: 1px solid rgb(255, 255, 255);
  background-color: gray;
  color: white;
  position: sticky;
}

th {
  color: white;
  background-color: rgb(90, 90, 90);
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.shadowed {
  background: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.vertical-sticky-container {
  position: sticky;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: 20px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 100;
  width: 20%;
  row-gap: 10px;
}
</style>
