import { reactive, watch } from 'vue'

export class UserData {
  constructor() {
    const savedData = JSON.parse(sessionStorage.getItem('userState'))
    if (savedData) {
      console.log('indeed ', savedData)
      this.loggedIn = savedData.loggedIn
      this.username = savedData.username
      this.userId = savedData.userId
      this.admin = savedData.admin
      this.developer = savedData.developer
      this.userType = savedData?.userType
      this.profilePicture = savedData?.profilePicture
      this.favouriteGames = savedData?.favouriteGames
    } else {
      this.loggedIn = false
      this.username = ''
      this.userId = ''
      this.admin = false
      this.developer = false
      this.userType = null
      this.profilePicture = null
      this.favouriteGames = {}
    }
  }

  loginUser(userId, username, fileName, favouriteGames) {
    this.loggedIn = true
    this.username = username
    this.userType = 'User'
    this.admin = false
    this.developer = false
    this.favouriteGames = favouriteGames
    this.setId(userId)
    this.setImage(fileName)
  }

  loginAdmin(userId, username, fileName, favouriteGames) {
    this.loggedIn = true
    this.username = username
    this.admin = true
    this.developer = false
    this.userType = 'Admin'
    this.favouriteGames = favouriteGames
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
    this.favouriteGames = {}
    this.setImage(null)
  }

  setImage(name) {
    console.log(name)
    this.profilePicture = name
    this.saveState()
  }

  setFavoruiteGames(games) {
    this.favouriteGames = games
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
