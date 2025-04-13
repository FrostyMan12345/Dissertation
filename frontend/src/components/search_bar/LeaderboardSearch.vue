<template>
  <div class="search-container">
    <input
      type="search"
      v-model="input"
      placeholder="Search for a game"
      style="width: 100%"
      @focus="searchIsFocused = true"
      @blur="handleBlur"
      @input="search(input)"
      class="search-bar"
    />
    <p>Enter at least 3 character to search</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import router from '@/router'
import { debounce } from 'lodash'

const input = ref('')
const searchIsFocused = ref(false)
const filteredGames = ref([])
const emit = defineEmits([`change-leaderboard`])

async function filteredSearch() {
  try {
    const response = await axios
      .get('http://localhost:5000/search/games', {
        params: { query: input.value, limit: 0, sort: 0 },
      })
      .catch((error) => {
        console.error('Error during Axios request:', error)
      })
    console.log(response.data)
    filteredGames.value = response.data
    console.log(filteredGames.value)
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}

const search = debounce(async () => {
  if (input.value.length >= 3) {
    console.log('Search Started')
    await filteredSearch()
  } else {
    console.log(`Not enough characters, ${input.value}`)
    filteredGames.value = []
  }
  emit('change-leaderboard', filteredGames.value)
}, 500)

function handleBlur() {
  setTimeout(() => {
    if (!document.querySelector('.search-container:hover')) {
      searchIsFocused.value = false
    }
  }, 10)
}
</script>

<style scoped>
.horizontal-container {
  justify-content: space-between;
}

.search-container {
  position: relative;
  display: inline-block;
  width: 250px;
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
