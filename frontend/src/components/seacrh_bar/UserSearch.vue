<template>
  <div class="search-container">
    <input
      type="search"
      v-model="input"
      placeholder="Search for a user"
      @focus="searchIsFocused = true"
      @blur="handleBlur"
      @input="search"
      class="search-bar"
    />
    <div v-if="searchIsFocused" class="search-results">
      <div v-for="profile in filteredUsers" :key="game">
        <button class="search-result" @click="goToProfile(profile.username)">
          <div class="horizontal-container">
            <ProfilePicture :image="profile.image" />
            <p>{{ profile.username }}</p>
            <!-- <img
              :src="`https://images.igdb.com/igdb/image/upload/t_micro/${game.imageId}.jpg`"
              alt="Game Cover"
              class="game-image"
            /> -->
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
import ProfilePicture from '../ProfilePicture.vue'

const input = ref('')
const searchIsFocused = ref(false)
const userList = ref([])
const filteredUsers = ref([])
const adminList = ref([])

async function filteredSearch() {
  try {
    const response = await axios
      .get('http://localhost:5000/search/users', {
        params: { query: input.value },
      })
      .catch((error) => {
        console.error('Error during Axios request:', error)
      })
    console.log(response.data)
    userList.value = response.data.results
    adminList.value = response.data.admins
    console.log(adminList.value)
    filteredUsers.value = userList.value
    console.log(
      `adminList: ${userList.value}, filteredUsers: ${filteredUsers.value}, response: ${response.data}`,
    )
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

async function search() {
  if (input.value.length >= 4) {
    console.log('Seacrh Started')
    await filteredSearch()
  } else {
    console.log(`Not enough characters, ${input.value}`)
    filteredUsers.value = userList.value
  }
}

function handleBlur() {
  setTimeout(() => {
    if (!document.querySelector('.search-container:hover')) {
      searchIsFocused.value = false
    }
  }, 10)
}

function goToProfile(username) {
  var isAdmin = false
  adminList.value.forEach((admin) => {
    if (admin.username === username) {
      isAdmin = true
      window.location.href = `/profile/Admin/${username}`
      return
    }
  })
  if (!isAdmin) {
    window.location.href = `/profile/User/${username}`
  }
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
