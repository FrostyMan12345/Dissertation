<template>
  <h1>jchdevbc</h1>
  <ProfilePicture />

  <input type="file" @change="fileSelect">Update Image</input>
  <!-- <img :src="'http://localhost:5000/Uploads/20211201_195000.jpg'"> -->
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ProfilePicture from '@/components/ProfilePicture.vue'
import { userState } from '@/UserData';

const fileInput = ref(null)
const maxFileSize = 3 * 1024 * 1024;
const route = useRoute()
const gameId = route.params.username
const userType = route.params.userType

function fileSelect() {
  const fileSelected = event.target.files[0]; 
  if (fileSelected) {
    if (fileSelected.type.startsWith("image/")) {
      if(fileSelected.size < maxFileSize){
        fileInput.value = fileSelected;
        uploadFile()
      } else {
        console.log("File too large")
      }
    } else {
      fileInput.value = null;
      console.log("Please select a valid image file (JPG, PNG, GIF, etc.)");
    }
  }

}

async function uploadFile() {
  // console.log("aaaaaaaaaaaaa", fileInput, fileInput.value)
  const formData = new FormData();
  formData.append("fileToUpload", fileInput.value);

  try {
    // console.log(userState.userType, userState.username);
    const response = await axios.post(`http://localhost:5000/get/${userState.userType}/${userState.username}`);
  console.log(response.data.image)
  userState.setImage(response.data.image)
} catch (error) {
  console.log(`Failure ${error}`)
}
}

async function getUserData() {

}
</script>

<style scoped></style>
