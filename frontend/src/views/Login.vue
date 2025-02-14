<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { userState } from '@/UserData'

const login = ref(true)
const loginType = ref('user')

async function accountLogin(username, password) {
  try {
    const response = await axios.get('http://localhost:5000/login/' + loginType.value, {
      params: {
        username,
        password,
      },
    })
    console.log(response.data)
    console.log(response.data.userId)
    const id = response.data.userId
    switch (loginType.value) {
      case 'user':
        userState.loginUser(id)
        break
      case 'admin':
        userState.loginAdmin(id)
        break
      case 'developer':
        userState.loginDeveloper(id)
        break
    }
    console.log(userState)
  } catch (error) {
    console.error('Error logging in:', error)
    console.log(error.response.data.message)
  }
}

async function accountRegister(username, password) {
  try {
    const response = await axios.post('http://localhost:5000/register/' + loginType.value, {
      username,
      password,
    })
    console.log(response.data)
    const id = response.data.userId
    switch (loginType.value) {
      case 'user':
        userState.loginUser(id)
        break
      case 'admin':
        userState.loginAdmin(id)
        break
      case 'developer':
        userState.loginDeveloper(id)
        break
    }
    console.log(userState)
  } catch (error) {
    console.error('Error registering account:', error)
    console.log(error.response.data.message)
  }
}

function toggleLogin() {
  login.value = !login.value
}

function changeLoginType(type) {
  loginType.value = type
}
</script>

<template>
  <div class="container">
    <h1 v-if="login">
      {{ String(loginType).charAt(0).toUpperCase() + String(loginType).slice(1) }} Login
    </h1>
    <h1 v-else>
      {{ String(loginType).charAt(0).toUpperCase() + String(loginType).slice(1) }} Register
    </h1>

    <hr />

    <div class="horizontal-container">
      <h3>Username:</h3>
      <input type="text" v-model="username" placeholder="Username" />
    </div>
    <div class="horizontal-container">
      <h3>Password:</h3>
      <input type="text" v-model="password" placeholder="Password" />
    </div>

    <button v-if="login" @click="accountLogin(username, password)">Sign In</button>
    <button v-else @click="accountRegister(username, password)">Register New Account</button>

    <hr />

    <button v-if="login" @click="toggleLogin">Register New Account</button>
    <button v-else @click="toggleLogin">Sign In</button>
    <div class="horizontal-container" style="max-width: 25vw">
      <button @click="changeLoginType('user')">User</button>
      <button @click="changeLoginType('admin')">Admin</button>
      <button @click="changeLoginType('developer')">Developer</button>
    </div>
  </div>
</template>

<style scoped>
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

input {
  margin: 10px;
  border: 1px solid black;
  background-color: rgb(60, 60, 60);
  color: white;
  padding: 10px;
  border-radius: 8px;
  width: 50vw;
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
  color: white;
  background-color: rgb(60, 60, 60);
  border: 1px solid black;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  width: 25vw;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
