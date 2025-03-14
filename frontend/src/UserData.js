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
      this.userType = savedData?.userType
      this.profilePicture = savedData?.profilePicture
    } else {
      this.loggedIn = false
      this.username = ''
      this.userId = ''
      this.admin = false
      this.developer = false
      this.userType = null
      this.profilePicture = null
    }
  }

  loginUser(userId, username, fileName) {
    this.loggedIn = true
    this.username = username
    this.userType = 'User'
    this.admin = false
    this.developer = false
    this.setId(userId)
    this.setImage(fileName)
  }

  loginAdmin(userId, username, fileName) {
    this.loggedIn = true
    this.username = username
    this.admin = true
    this.developer = false
    this.userType = 'Admin'
    this.setId(userId)
    this.setImage(fileName)
  }

  loginDeveloper(userId, username, fileName) {
    this.loggedIn = true
    this.username = username
    this.developer = true
    this.admin = false
    this.userType = 'Developer'
    this.setId(userId)
    this.setImage(fileName)
  }

  setId(userId) {
    this.userId = userId
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
    this.username = ''
  }

  setImage(name) {
    console.log(name)
    this.profilePicture = name
    this.saveState()
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
