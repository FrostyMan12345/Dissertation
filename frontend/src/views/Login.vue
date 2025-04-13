<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { userState } from '@/UserData'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const login = ref(true)
const loginType = ref('user')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const email = ref('')
const requests = ref('')
const backendUrl = import.meta.env.VITE_BACKEND_URL

function validateCredentials(username, password) {
  try {
    if (username.length >= 5 && password.length <= 12) {
      if (password.length >= 8 && password.length <= 20) {
        return 'Valid'
      } else {
        return 'Password must be between 8 and 20 characters long'
      }
    } else {
      return 'Username must be between 5 and 12 characters long'
    }
  } catch (error) {
    return 'Invalid credentials'
  }
}

async function accountLogin(username, password) {
  try {
    const response = await axios.get(`${backendUrl}/login/${loginType.value}`, {
      params: {
        username,
        password,
      },
    })
    console.log(response.data)
    const id = response.data.userId
    const imageName = response.data.image
    const favouriteGames = response.data.favouriteGames
    const companies = response.data.companies
    console.log(companies)
    switch (loginType.value) {
      case 'user':
        userState.loginUser(id, username, imageName, favouriteGames)
        goToMainPage()
        toast('Login Success', {
          position: 'bottom-right',
          theme: 'colored',
          type: 'success',
          autoClose: 1500,
        })
        break
      case 'admin':
        userState.loginAdmin(id, username, imageName, favouriteGames)
        goToMainPage()
        toast('Login Success', {
          position: 'bottom-right',
          theme: 'colored',
          type: 'success',
          autoClose: 1500,
        })
        break
      case 'developer':
        userState.loginDeveloper(id, username, imageName, companies)
        goToMainPage()
        toast('Login Success', {
          position: 'bottom-right',
          theme: 'colored',
          type: 'success',
          autoClose: 1500,
        })
        break
      default:
        console.error('Faulty Login Type')
    }
    console.log(userState)
  } catch (error) {
    console.error('Error logging in:', error)
    console.log(error.response.data.message)
    toast(error.response.data.message, {
      position: 'bottom-right',
      theme: 'colored',
      type: 'error',
      autoClose: 1500,
    })
  }
}

async function accountRegister(username, password, passwordConfirm, email, requests) {
  const validCredentials = validateCredentials(username, password)
  console.log(validCredentials)
  if (validCredentials === 'Valid') {
    if (password === passwordConfirm) {
      try {
        console.log(requests)
        const response = await axios.post(`${backendUrl}/register/${loginType.value}`, {
          username: username,
          password: password,
          email: email,
          request: requests,
        })
        console.log(response.data)
        const id = response.data.userId
        console.log(loginType.value)
        switch (loginType.value) {
          case 'user':
            userState.loginUser(id, username, null)
            goToMainPage()
            toast('Register Success', {
              position: 'bottom-right',
              theme: 'colored',
              type: 'success',
              autoClose: 1500,
            })
            break
          case 'admin':
            userState.loginAdmin(id, username, null)
            goToMainPage()
            toast('Register Success', {
              position: 'bottom-right',
              theme: 'colored',
              type: 'success',
              autoClose: 1500,
            })
            break
          case 'developer':
            // userState.loginDeveloper(id, username, undefined)
            // goToMainPage()
            toast('Register Request Sent', {
              position: 'bottom-right',
              theme: 'colored',
              type: 'info',
              autoClose: 1500,
            })
            break
          default:
            console.error('Faulty Register Type')
            return
        }
        console.log(userState)
      } catch (error) {
        console.error('Error registering account:', error)
        console.log(error?.response?.data.message)
        toast(error?.response?.data.message, {
          position: 'bottom-right',
          theme: 'colored',
          type: 'error',
          autoClose: 1500,
        })
      }
    } else {
      console.log('Passwords do not match')
      toast('Passwords do not match', {
        position: 'bottom-right',
        theme: 'colored',
        type: 'error',
        autoClose: 1500,
      })
    }
  } else {
    toast(validCredentials, {
      position: 'bottom-right',
      theme: 'colored',
      type: 'error',
      autoClose: 1500,
    })
  }
}

function toggleLogin() {
  login.value = !login.value
  if (loginType.value === 'admin' && !login.value) {
    changeLoginType('user')
    toast('Cannot regitser as an admin', {
      position: 'bottom-right',
      theme: 'colored',
      type: 'info',
      autoClose: 1500,
    })
  }
}

function changeLoginType(type) {
  console.log(type)
  loginType.value = type
  console.log(loginType.value)
}

function goToMainPage() {
  console.log('Switching page')
  window.location.href = '/main'
  console.log('Switched page')
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

    <div v-if="!login && loginType === 'developer'" class="horizontal-container">
      <h3>Email:</h3>
      <input type="text" v-model="email" placeholder="Email Address" />
    </div>
    <div class="horizontal-container">
      <h3>Username:</h3>
      <input type="text" v-model="username" placeholder="Username" />
    </div>
    <div class="horizontal-container">
      <h3>Password:</h3>
      <input type="password" v-model="password" placeholder="Password" />
    </div>
    <div v-if="!login" class="horizontal-container">
      <h3>Confirm Password:</h3>
      <input type="password" v-model="passwordConfirm" placeholder="Confirm Password" />
    </div>
    <div v-if="!login && loginType === 'developer'" class="horizontal-container">
      <h3>Requests:</h3>
      <input
        type="textarea"
        v-model="requests"
        placeholder="Which companies you wish to represent?"
      />
    </div>

    <button
      class="normal-button"
      v-if="login"
      @click="accountLogin(username.trim(), password.trim())"
    >
      Sign In
    </button>
    <button
      class="normal-button"
      v-else-if="!login"
      @click="
        accountRegister(
          username.trim(),
          password.trim(),
          passwordConfirm.trim(),
          email.trim(),
          requests.trim(),
        )
      "
    >
      Register New Account
    </button>

    <hr />

    <button class="normal-button" v-if="login" @click="toggleLogin">Register New Account</button>
    <button class="normal-button" v-else @click="toggleLogin">Sign In</button>
    <div class="horizontal-container" style="max-width: 25vw">
      <button class="normal-button" @click="changeLoginType('user')">User</button>
      <button v-if="login" class="normal-button" @click="changeLoginType('admin')">Admin</button>
      <button class="normal-button" @click="changeLoginType('developer')">Developer</button>
    </div>
  </div>
</template>

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

input[type='textarea'] {
  border: 1px solid blue;
  background-color: white;
  color: black;
  padding: 10px;
  border-radius: 8px;
  width: 50vw;
}
</style>
