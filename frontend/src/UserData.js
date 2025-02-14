import { reactive, watch } from 'vue'

export class UserData {
  constructor() {
    const savedData = JSON.parse(sessionStorage.getItem('userState'))
    if (savedData) {
      this.loggedIn = savedData.loggedIn
      this.username = savedData.username
      this.userId = savedData.userId
      this.admin = savedData.admin
      this.developer = savedData.developer
    } else {
      this.loggedIn = false
      this.username = 'FrostyMan123'
      this.userId = ''
      this.admin = false
      this.developer = false
    }
  }

  loginUser(userId) {
    this.loggedIn = true
    this.setId(userId)
  }

  loginAdmin(userId) {
    this.loggedIn = true
    this.admin = true
    this.setId(userId)
  }

  loginDeveloper(userId) {
    this.loggedIn = true
    this.developer = true
    this.setId(userId)
  }

  setId(userId) {
    this.userId = userId
    this.saveState()
  }

  saveState() {
    sessionStorage.setItem('userState', JSON.stringify(this))
  }

  logout() {
    sessionStorage.removeItem('userState')
    this.loggedIn = false
    this.userId = ''
    this.admin = false
    this.developer = false
  }
}

export const userState = reactive(new UserData())

// Watch for changes and persist state automatically
watch(
  userState,
  () => {
    userState.saveState()
  },
  { deep: true },
)
