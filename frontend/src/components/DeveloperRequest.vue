<template>
  <div class="request">
    <div class="text-content">
      <h5 style="white-space: nowrap">Email: {{ email }}</h5>
      <h5 style="white-space: nowrap">Username: {{ username }}</h5>
      <h6>Message:</h6>
      <p>{{ request }}</p>
    </div>
    <div class="selection">
      {{ selectedCompanies }}
      <Multiselect
        v-model="selectedCompanies"
        :options="companies"
        :searchable="true"
        :limit="20"
        mode="tags"
      />
    </div>
    <input v-model="rejectionReasoning" type="textarea" placeholder="Rejection reasoning" />
    <div class="button-container">
      <button class="accept-button" @click="verifyAccount(1)">Verify</button>
      <button class="reject-button" @click="verifyAccount(-1)">Deny</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import axios from 'axios'
import { userState } from '@/UserData'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
  username: { type: String },
  email: { type: String },
  request: { type: String, default: '' },
  id: { type: Number },
  companies: { type: [Object], default: [] },
})

const emit = defineEmits(['request-acknowledged'])
const id = ref(props.id)
const selectedCompanies = ref([])
const rejectionReasoning = ref('')
const backendUrl = import.meta.env.VITE_BACKEND_URL

async function verifyAccount(verified) {
  try {
    const verifyResponse = await axios.post(
      `${backendUrl}/validations/${props.username}/developer/${verified}`,
      {
        email: props.email,
        selectedCompanies: selectedCompanies.value,
        adminResponse: rejectionReasoning.value,
      },
    )
    console.log(verifyResponse.data)
    emit('request-acknowledged', id.value)
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.request {
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  border: 1px solid green;
  background-color: rgb(242, 255, 171);
  min-width: 50%;
  max-width: 80%;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  margin: 10px;
  position: relative;
}
/* 
.text-content {
  flex-grow: 1;
} */

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-self: flex-end;
}

.accept-button:hover {
  background-color: green;
}

.reject-button:hover {
  background-color: red;
}

.selection {
  width: 50%; /* Adjust this as needed */
  align-self: flex-start; /* Align to the left */
}

input[type='text'] {
  border: solid 0px rgba(0, 0, 255, 0) !important;
  background-color: rgba(0, 0, 255, 0) !important;
}

input[type='textarea'] {
  width: 50%;
}

.multiselect-tags-search {
  border: 1px solid rgba(0, 0, 255, 0) !important;
  background-color: rgba(0, 0, 255, 0) !important;
  font-size: 14px !important;
}
</style>
