<template>
  <div v-if="userState.loggedIn && userState.admin">
    <div v-if="requests.length > 0">
      <h1>{{ requests.length }} request(s) to approve</h1>
      <div v-for="request in requests">
        <DeveloperRequest
          v-if="dataRetrieved"
          :username="request.request.username"
          :email="request.request.email"
          :request="request.request.request"
          :id="request.id"
          :companies="companies"
          @request-acknowledged="removeRequest"
        />
      </div>
    </div>
    <div v-else>
      <h1>There are no pending developer requests</h1>
    </div>
  </div>
  <div v-else>
    <h1>You do not have access to this site</h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { userState } from '@/UserData'
import DeveloperRequest from '@/components/DeveloperRequest.vue'

const requests = ref([])
const backendUrl = import.meta.env.VITE_BACKEND_URL
const companies = ref([])
const dataRetrieved = ref(false)

async function getRequests() {
  if (userState.loggedIn && userState.admin) {
    try {
      const response = await axios.get(`${backendUrl}/developer/requests`)
      console.log(response.data)
      let id = 0
      response.data.requests.forEach((request) => {
        requests.value.push({ id: id, request: request })
        id += 1
      })
    } catch (error) {
      console.error('Error getting developer requests: ', error)
      console.log(error?.response?.data.message)
    }
  } else {
    console.log('User cannot access this page')
  }
}

function removeRequest(requestId) {
  let newList = []
  requests.value.forEach((request) => {
    if (request.id !== requestId) {
      newList.push(request)
    }
  })
  requests.value = newList
}

async function getAllCompanies() {
  try {
    const companyResponse = await axios.get(`${backendUrl}/companies`)
    // companies.value = companyResponse.data.companies
    console.log(companies.value)
    companyResponse.data.companies.forEach((company) => {
      companies.value.push(company.name)
    })
    dataRetrieved.value = true
  } catch (error) {
    console.log(`Failure to retireve company data`)
  }
}

function goToMainPage() {
  console.log('Switching page')
  window.location.href = '/main'
  console.log('Switched page')
}

onMounted(() => {
  getRequests()
  getAllCompanies()
})
</script>

<style scoped>
input {
  margin: 10px;
}

hr {
  color: solid black;
  width: 75%;
  height: 10px;
  border-radius: 10px;
  border-color: black;
}

.center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  background-color: black;
  padding: 20px 20px 20px 20px;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h3 {
  margin: 0;
  width: 120px;
  text-align: left;
}

.horizontal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

button {
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  width: 25vw;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
