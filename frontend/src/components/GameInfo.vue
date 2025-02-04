<template>
  <h1>{{ title }}</h1>
  <div class="horizontal-container">
    <div class="game-info">
      <p>{{ description }}</p>
      <hr />
      <p>{{ developers }}</p>
      <hr />
      <p>{{ genres.toString() }}</p>
    </div>
    <div class="game-metrics">
      <img
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${imageID}.jpg`"
        alt="Test"
        class="game-image"
      />
      <hr />
      <h7>Rating: {{ rating }}</h7>
      <hr />
      <h7>Average Time Played: {{ timePlayed }} hours</h7>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const title = ref('')
const description = ref('')
const genres = ref([])
const developers = ref('')
const rating = 3
const coverID = ref(0)
const imageID = ref(0)
const platforms = ref([])
const timePlayed = 150
const route = useRoute()
const gameId = route.params.id
const imageUrl = ref('https://images.igdb.com/igdb/image/upload/t_720p/')

async function getGameData() {
  try {
    const response = await axios
      .get('http://localhost:5000/gamedata', {
        params: { id: gameId },
      })
      .catch((error) => {
        console.error('Error during Axios request:', error)
      })
    const gameInfo = response.data
    title.value = gameInfo.name
    coverID.value = gameInfo.cover
    description.value = gameInfo.summary
    platforms.value = gameInfo.platforms
    console.log(`coverid: ${coverID.value}`)
    getImage(coverID.value)
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}

onMounted(() => {
  getGameData()
})

async function getImage(coverID) {
  try {
    console.log(`coverID: ${coverID}`)
    const response = await axios
      .get('http://localhost:5000/imagefetch', {
        params: { coverID: coverID },
      })
      .catch((error) => {
        console.error('Error during Axios request:', error)
      })
    console.log(`Response: ${response.data}`)
    console.log(`Response: ${response.data.id}`)
    imageID.value = response.data.id
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}
</script>

<style scoped>
.horizontal-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
}

.game-image {
  max-width: 300px;
  max-height: 400px;
  min-width: 300px;
  min-height: 400px;
}

.game-metrics {
  border: 1px solid blue;
  padding: 10px;
}

.game-info {
  border: 1px solid blue;
  background-color: azure;
  padding: 10px;
}

hr {
  width: 100%;
  color: blue;
}
</style>
