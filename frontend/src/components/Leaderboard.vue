<template>
  <div class="horizontal-container">
    <table v-if="!leaderboardLoading" width="80%">
      <thead>
        <tr>
          <th><h3>Ranking</h3></th>
          <th><h3>Game</h3></th>
          <th><h3>Cover</h3></th>
          <th><h3>Rating</h3></th>
          <th><h3>Hours Played</h3></th>
          <th><h3>Revists</h3></th>
          <th><h3>Records</h3></th>
        </tr>
      </thead>
      <tbody v-if="!searchedLeaderboard">
        <tr v-for="(game, index) in paginatedLeaderboard" :key="index">
          <td>
            <h3>{{ index + 1 + (leaderboardPage - 1) * itemsPerPage }}</h3>
          </td>
          <td>
            <h3>
              <a
                style="color: blue; text-decoration: none; text-align: start"
                :href="`http://localhost:5173/game/${game.id}`"
                >{{ game.name }}</a
              >
            </h3>
          </td>
          <td v-if="game.cover">
            <img
              v-show="imagesLoaded[index]"
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.cover?.image_id}.jpg`"
              alt="Game Cover"
              class="game-image"
              crossorigin="anonymous"
              @load="imagesLoaded[index] = true"
            />
            <h3 v-if="!imagesLoaded[index]" style="text-align: center">Loading Image</h3>
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
            <h3 v-if="rankingValue === 'Revisits'" style="font-weight: bold; text-align: center">
              {{ game.average_times_played || 0 }}
            </h3>
            <h3 v-else style="text-align: center">{{ game.average_times_played || 0 }}</h3>
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
      <tbody v-else>
        <tr v-for="game in paginatedSearchedLeaderboard" :key="index">
          <td>
            <h3>{{ game.index + 1 }}</h3>
          </td>
          <!-- {{
            game
          }} -->
          <td>
            <h3>
              <a
                style="color: blue; text-decoration: none; text-align: start"
                :href="`http://localhost:5173/game/${game.game.id}`"
                >{{ game.game.name }}</a
              >
            </h3>
          </td>
          <td v-if="game.game.cover">
            <img
              v-show="imagesLoaded[index]"
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.game.cover?.image_id}.jpg`"
              alt="Game Cover"
              class="game-image"
              crossorigin="anonymous"
              @load="imagesLoaded[index] = true"
            />
            <h3 v-if="!imagesLoaded[index]" style="text-align: center">Loading Image</h3>
          </td>
          <td v-else>
            <h6 style="text-align: center">Unavailable</h6>
          </td>
          <td>
            <h3 v-if="rankingValue === 'Rating'" style="font-weight: bold; text-align: center">
              {{ game.game.average_rating || 0 }}/5
            </h3>
            <h3 v-else style="text-align: center">{{ game.game.average_rating || 0 }}/5</h3>
          </td>
          <td>
            <h3 v-if="rankingValue === 'Time PLayed'" style="font-weight: bold; text-align: center">
              {{ game.game.average_hours_played || 0 }}
            </h3>
            <h3 v-else style="text-align: center">{{ game.game.average_hours_played || 0 }}</h3>
          </td>
          <td>
            <h3 v-if="rankingValue === 'Revisits'" style="font-weight: bold; text-align: center">
              {{ game.average_times_played || 0 }}
            </h3>
            <h3 v-else style="text-align: center">{{ game.average_times_played || 0 }}</h3>
          </td>
          <td>
            <h3
              v-if="rankingValue === 'Most Popular'"
              style="font-weight: bold; text-align: center"
            >
              {{ game.game.records_made || 0 }}
            </h3>
            <h3 v-else style="text-align: center">{{ game.game.records_made || 0 }}</h3>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else style="align-self: center; justify-self: center" class="horizontal-container">
      <h3 for="loading">Leaderboard Loading</h3>
      <img src="../assets/loading.gif" alt="Loading..." class="loading-icon" id="loading" />
    </div>

    <!-- {{ rankingValue }} -->
    <div class="vertical-sticky-container">
      <LeaderboardSearch
        v-if="!leaderboardLoading"
        :gameList="leaderboard"
        @change-leaderboard="updateLeaderboard"
      />
      <CriteriaSelector
        v-if="!leaderboardLoading"
        class="shadowed"
        @change-ranking="changeCriteria"
      />
      <CatergoryFilter
        v-if="!leaderboardLoading"
        :maxHours="maxHoursValue"
        :maxRevisits="maxRevisitsValue"
        :maxRecords="maxRecordsValue"
        @update-leaderboard="getFilteredLeaderboard"
        class="shadowed"
      />
      <vue-awesome-paginate
        v-if="!leaderboardLoading && !searchedLeaderboard"
        :total-items="leaderboardLength"
        :items-per-page="itemsPerPage"
        :max-pages-shown="3"
        v-model="leaderboardPage"
      />
      <vue-awesome-paginate
        v-else-if="!leaderboardLoading && searchedLeaderboard"
        :total-items="searchItems.length"
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
import CatergoryFilter from './CatergoryFilter.vue'
import LeaderboardSearch from './search_bar/LeaderboardSearch.vue'

const leaderboardPage = ref(1)
const itemsPerPage = 500
const startItem = ref(500 * leaderboardPage.value)
const rankingValue = ref(sessionStorage.getItem('rankingCriteria') || 'Rating')
const leaderboard = ref([])
const leaderboardLength = ref(0)
const imagesLoaded = ref([])
const searchedLeaderboard = ref(false)
const searchItems = ref([])
const maxHoursValue = ref(0)
const maxRevisitsValue = ref(0)
const maxRecordsValue = ref(0)
const leaderboardLoading = ref(true)
const completeLeaderboard = ref([])
const changeCriteria = (criteria) => {
  rankingValue.value = criteria
  location.reload()
}
const paginatedLeaderboard = computed(() => {
  const startIndex = (leaderboardPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const slicedLeaderboard = leaderboard.value.slice(startIndex, endIndex)
  imagesLoaded.value = new Array(slicedLeaderboard.length).fill(false)
  return leaderboard.value.slice(startIndex, endIndex)
})
const paginatedSearchedLeaderboard = computed(() => {
  const startIndex = (leaderboardPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const slicedLeaderboard = searchItems.value.slice(startIndex, endIndex)
  imagesLoaded.value = new Array(slicedLeaderboard.length).fill(false)
  return searchItems.value.slice(startIndex, endIndex)
})

function updateLeaderboard(newBoard) {
  leaderboardPage.value = 1
  if (newBoard.length == 0) {
    searchedLeaderboard.value = false
  } else {
    leaderboardLoading.value = true
    let newList = []
    newBoard.forEach((game) => {
      newList.push({
        game: game,
        index: leaderboard.value.findIndex((game2) => game2.name === game.name),
      })
    })
    newList.sort((a, b) => a.index - b.index)
    searchItems.value = newList
    console.log(searchItems.value)
    leaderboardLoading.value = false
    searchedLeaderboard.value = true
  }
}

async function getFilteredLeaderboard(filters) {
  try {
    leaderboardLoading.value = true
    leaderboardPage.value = 1
    var urlCriteria = 'average_rating'
    console.log(rankingValue.value)
    if (rankingValue.value === 'Rating') {
      urlCriteria = 'average_rating'
    } else if (rankingValue.value === 'Play Time') {
      urlCriteria = 'average_hours_played'
    } else if (rankingValue.value === 'Most Popular') {
      urlCriteria = 'records_made'
    }
    const leaderboardResponse = await axios.get(
      `http://localhost:5000/leaderboard/${urlCriteria}`,
      { params: filters },
    )
    console.log(leaderboardResponse.data.leaderboard)
    leaderboard.value = leaderboardResponse.data.leaderboard
    leaderboardLength.value = leaderboard.value.length
    leaderboardLoading.value = false
  } catch (error) {
    console.log(`Leaderboard Get Failure: ${error}`)
  }
}

async function getCompleteLeaderboard() {
  try {
    leaderboardLoading.value = true
    leaderboardPage.value = 1
    var urlCriteria = 'average_rating'
    console.log(rankingValue.value)
    if (rankingValue.value === 'Rating') {
      urlCriteria = 'average_rating'
    } else if (rankingValue.value === 'Play Time') {
      urlCriteria = 'average_hours_played'
    } else if (rankingValue.value === 'Most Popular') {
      urlCriteria = 'records_made'
    }
    const leaderboardResponse = await axios.get(
      `http://localhost:5000/leaderboard/${urlCriteria}`,
      { params: {} },
    )
    leaderboard.value = leaderboardResponse.data.leaderboard

    maxHoursValue.value = leaderboard.value.reduce((max, game) => {
      const hours =
        typeof game.average_hours_played === 'number' ? game.average_hours_played : -Infinity
      return Math.max(max, hours)
    }, -Infinity)

    maxRecordsValue.value = leaderboard.value.reduce((max, game) => {
      const records = typeof game.records_made === 'number' ? game.records_made : -Infinity
      return Math.max(max, records)
    }, -Infinity)

    maxRevisitsValue.value = leaderboard.value.reduce((max, game) => {
      const revisits =
        typeof game.average_times_played === 'number' ? game.average_times_played : -Infinity
      return Math.max(max, revisits)
    }, -Infinity)
    leaderboardLength.value = leaderboard.value.length
    leaderboardLoading.value = false
  } catch (error) {
    console.log(`Leaderboard Get Failure: ${error}`)
  }
}

onMounted(() => {
  getCompleteLeaderboard()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  align-items: flex-start;
  top: 20px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 100;
  width: 217px;
  row-gap: 10px;
  margin-left: 50px;
}

.loading-icon {
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}
</style>
