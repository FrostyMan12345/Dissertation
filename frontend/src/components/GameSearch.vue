<template>
  <div class="search-container">
    <input
      type="search"
      v-model="input"
      placeholder="Search for a game"
      @focus="searchIsFocused = true"
      @blur="handleBlur"
      class="search-bar"
    />
    <div v-if="searchIsFocused" class="search-results">
      <div v-for="game in filteredList().slice(0, 10)" :key="game">
        <button class="search-result" @click="alertButton">
          <p>{{ game }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('')
const searchIsFocused = ref(false)
const gamesList = ['Xenoblade', 'Overwatch', 'Fortnite', 'Hades', 'Among us', 'Bellend']

function filteredList() {
  return gamesList.filter((game) => game.toLowerCase().includes(input.value.toLowerCase()))
}

function handleBlur() {
  setTimeout(() => {
    if (!document.querySelector('.search-container:hover')) {
      searchIsFocused.value = false
    }
  }, 10) // Add a slight delay of 100ms
}

function alertButton() {
  alert('Button Pressed')
}
</script>

<style scoped>
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
  max-height: 150px;
  overflow-y: auto;
}

.search-result {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  width: 400px;
  height: inherit;
}

.search-result:last-child {
  border-bottom: none; /* Remove the bottom border from the last result */
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
