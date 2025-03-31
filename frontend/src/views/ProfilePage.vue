<template>
  <div class="horizontal-container">
    <ProfilePicture :image="profileImage" />
    <h1>{{ username }}</h1>
  </div>
  <input
    v-if="userState.username == username && userState.userType == userType"
    type="file"
    @change="fileSelect"
  />
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
      <tr v-for="(game, index) in reccomendations" :key="index">
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ProfilePicture from '@/components/ProfilePicture.vue'
import { userState } from '@/UserData'

const fileInput = ref(null)
const maxFileSize = 3 * 1024 * 1024
const route = useRoute()
const username = route.params.username
const userType = route.params.userType
const profileImage = ref('')
const userId = ref(0)
const reccomendations = ref([])
const recommendationsLength = ref(0)
const score = ref([])

function fileSelect() {
  const fileSelected = event.target.files[0]
  if (fileSelected) {
    if (fileSelected.type.startsWith('image/')) {
      if (fileSelected.size < maxFileSize) {
        fileInput.value = fileSelected
        uploadFile()
      } else {
        console.log('File too large')
      }
    } else {
      fileInput.value = null
      console.log('Please select a valid image file (JPG, PNG, GIF, etc.)')
    }
  }
}

async function uploadFile() {
  const formData = new FormData()
  formData.append('fileToUpload', fileInput.value)
  try {
    const response = await axios.post(
      `http://localhost:5000/user/${userState.userType}/${userState.userId}/update-image`,
      formData,
      userState.image,
    )
    console.log(response.data.image)
    userState.setImage(response.data.image)
  } catch (error) {
    console.log(`Failure ${error}`)
  }
}

async function getUserData() {
  try {
    console.log(userType, username)
    const response = await axios.get(`http://localhost:5000/get/${userType}/${username}`)
    console.log(response.data)
    userId.value = response.data.user._id
    // console.log()
    profileImage.value = response.data.user.image
    console.log(profileImage.value)
    console.log(userId.value)
  } catch (error) {
    console.log(error)
  }
}

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
  getUserData()
  getRecommendations()
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
</style>
