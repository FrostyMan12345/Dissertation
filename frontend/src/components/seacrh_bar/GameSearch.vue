<template>
  <div class="search-container">
    <input
      type="search"
      v-model="input"
      placeholder="Search for a game"
      @focus="searchIsFocused = true"
      @blur="handleBlur"
      @input="search"
      class="search-bar"
    />
    <div v-if="searchIsFocused" class="search-results">
      <div v-for="game in filteredGames" :key="game">
        <button class="search-result" @click="goToGame(game.id)">
          <div class="horizontal-container">
            <img
              :src="`https://images.igdb.com/igdb/image/upload/t_micro/${game.imageId}.jpg`"
              alt="Game Cover"
              class="game-image"
            />
            <p>{{ game.name }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import router from '@/router'

const input = ref('')
const searchIsFocused = ref(false)
const gamesList = ref([])
const filteredGames = ref([])

async function filteredSearch() {
  try {
    const response = await axios
      .get('http://localhost:5000/search/games', {
        params: { query: input.value },
      })
      .catch((error) => {
        console.error('Error during Axios request:', error)
      })
    console.log(response.data)
    gamesList.value = response.data
    filteredGames.value = gamesList.value
    console.log(
      `gamesList: ${gamesList.value}, filteredGames: ${filteredGames.value}, response: ${response.data}`,
    )
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}

async function search() {
  if (input.value.length > 3) {
    console.log('Seacrh Started')
    await filteredSearch()
  } else {
    console.log(`Not enough characters, ${input.value}`)
    filteredGames.value = gamesList.value
  }
}

function handleBlur() {
  setTimeout(() => {
    if (!document.querySelector('.search-container:hover')) {
      searchIsFocused.value = false
    }
  }, 10)
}

function goToGame(id) {
  window.location.href = `/game/${id}`
}
</script>

<style scoped>
.horizontal-container {
  justify-content: space-between;
}

.search-container {
  position: relative;
  display: inline-block;
  width: 400px;
}

.search-bar {
  width: 100%;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.search-result {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  width: 100%;
  height: inherit;
}

.search-result:last-cdhild {
  border-bottom: none;
}

.search-result:hover {
  background-color: aliceblue;
}

button {
  padding: 5px 10px;
  border: none;
  background-color: #ffffff00;
  color: #000000;
  font-size: 16px;
  text-align: left;
}

.search-button {
  width: inherit;
  height: inherit;
}
</style>
