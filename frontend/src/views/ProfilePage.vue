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

onMounted(() => {
  getUserData()
})
</script>

<style scoped></style>
