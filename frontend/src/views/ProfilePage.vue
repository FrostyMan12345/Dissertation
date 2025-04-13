<template>
  <div class="horizontal-container">
    <label
      v-if="userState.username == username && userState.userType == userType"
      class="profile-upload"
    >
      <input type="file" @change="fileSelect" accept="image/*" hidden />
      <ProfilePicture :image="profileImage" class="profile-picture" />
    </label>
    <div v-else>
      <ProfilePicture v-if="dataRetrieved" :image="profileImage" class="profile-picture" />
    </div>
    <h1>{{ username }}</h1>
  </div>
  <div>
    <div
      v-if="userType !== 'Developer'"
      class="horizontal-container"
      style="align-items: flex-start; justify-content: flex-start"
    >
      <div
        v-if="dataRetrieved"
        style="width: 100%; display: flex; justify-content: center; flex-direction: column"
      >
        <div class="horizontal-container">
          <button
            class="normal-button"
            @click="updateDataAndConfig(genreData, 'Genre', 'Games Played', false)"
          >
            Genre
          </button>
          <button
            class="normal-button"
            @click="updateDataAndConfig(themeData, 'Themes', 'Games Played', false)"
          >
            Theme
          </button>
          <button
            class="normal-button"
            @click="updateDataAndConfig(genrePlayTimeData, 'Genres', 'Time Played (hours)', true)"
          >
            Genre Play Time
          </button>
          <button
            class="normal-button"
            @click="updateDataAndConfig(themePlayTimeData, 'Themes', 'Time Played (hours)', true)"
          >
            Theme Play Time
          </button>
          <button
            class="normal-button"
            @click="updateDataAndConfig(gameTimeData, 'All Games', 'Time Played (hours)', true)"
          >
            Game Play Time
          </button>
          <!-- <button @click="dataset = keywordData">Keywords</button> -->
        </div>
        <!-- {{ dataset }}
      {{ averageRating }} -->
        <!-- {{ dataset }} -->
        <div v-if="dataset.length !== 0">
          <VueUiVerticalBar
            v-if="dataRetrieved"
            style="background-color: rgb(0, 0, 0, 0); color: black"
            :dataset="dataset"
            :config="barConfig"
          />
          <RatingsDisplay v-if="dataRetrieved" :dataset="ratingData" :average="averageRating" />
        </div>
        <div v-else>
          <h3>User has not made any records</h3>
        </div>
      </div>
      <FavouriteGames
        style="width: 100%"
        :isUser="userState.username == username && userState.userType == userType"
        :favouriteGames="favouriteGames"
      />
    </div>
    <div v-else>
      <h3>Developer Account Representing:</h3>
      <h3 v-for="company in companies">- {{ company }}</h3>
    </div>
    <div v-if="username === userState.username && !userState.developer">
      <div style="align-items: center; justify-content: center; gap: 10px 10px">
        <input type="checkbox" v-model="showRecommendations" id="recommendations" />
        <label style="margin " for="recommendations">Show Game recommendations</label>
      </div>
      <RecommendationsDisplay v-if="showRecommendations" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ProfilePicture from '@/components/ProfilePicture.vue'
import { userState } from '@/UserData'
import FavouriteGames from '@/components/ProfilePage/FavouriteGames.vue'
import { VueUiDonut, VueUiSparkline, VueUiVerticalBar } from 'vue-data-ui'
import RatingsDisplay from '@/components/ProfilePage/RatingsDisplay.vue'
import 'vue-data-ui/style.css'
import RecommendationsDisplay from '@/components/ProfilePage/RecommendationsDisplay.vue'

const fileInput = ref(null)
const maxFileSize = 3 * 1024 * 1024
const route = useRoute()
const username = route.params.username
const userType = route.params.userType
const profileImage = ref('')
const userId = ref(0)
const gameRecords = ref([])
const genreData = ref([])
const themeData = ref([])
const gameTimeData = ref([])
const themePlayTimeData = ref([])
const genrePlayTimeData = ref([])
const ratingData = ref([])
const averageRating = ref(0)
const dataRetrieved = ref(false)
const updatingImage = ref(false)
const dataset = ref([])
const favouriteGames = ref({})
const companies = ref([])
const showRecommendations = ref(false)
const chartTitle = ref('Genres')
const chartSubtitle = ref('')
const config = reactive({
  type: 'classic',
  responsive: false,
  useBlurOnHover: false,
  useCssAnimation: true,
  style: {
    fontFamily: 'inherit',
    chart: {
      useGradient: true,
      gradientIntensity: 40,
      backgroundColor: '#FFFFFF',
      color: '#CCCCCC',
      layout: {
        labels: {
          dataLabels: {
            show: true,
            useLabelSlots: false,
            hideUnderValue: 3,
            prefix: '',
            suffix: '',
          },
          value: { rounding: 0, show: false },
          percentage: { color: '#CCCCCC', bold: true, fontSize: 10, rounding: 2 },
          name: { color: '#CCCCCC', bold: false, fontSize: 10 },
          hollow: {
            show: true,
            total: {
              show: true,
            },
            average: {
              show: true,
            },
          },
        },
        donut: { strokeWidth: 55, borderWidth: 2, useShadow: false, shadowColor: '#1A1A1A' },
      },
      comments: { show: false, showInTooltip: true, width: 100, offsetX: 0, offsetY: 0 },
      legend: {
        show: false,
      },
      title: {
        show: false,
        text: 'Hello',
        color: '#00000',
        fontSize: 20,
        bold: true,
        textAlign: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        subtitle: { show: true, color: '#CCCCCC', text: 'Hello', fontSize: 16, bold: false },
      },
      tooltip: {
        show: false,
      },
    },
  },
  table: {
    show: false,
  },
  userOptions: {
    show: false,
    // showOnChartHover: false,
    // keepStateOnChartLeave: true,
    // position: 'right',
    // buttons: {
    //   tooltip: true,
    //   pdf: true,
    //   img: true,
    //   csv: true,
    //   table: true,
    //   labels: true,
    //   fullscreen: true,
    //   annotator: true,
    // },
  },
})
const barConfig = reactive({
  responsive: false,
  useCssAnimation: true,
  style: {
    fontFamily: 'inherit',
    chart: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      layout: {
        bars: {
          sort: 'desc',
          useStroke: false,
          strokeWidth: 2,
          height: 32,
          gap: 6,
          borderRadius: 4,
          offsetX: 64,
          paddingRight: 0,
          useGradient: true,
          gradientIntensity: 20,
          fillOpacity: 10,
          underlayerColor: '#FFFFFF',
          dataLabels: {
            color: '#000000',
            bold: true,
            fontSize: 12,
            value: { show: true, roundingValue: 0, prefix: '', suffix: '' },
            percentage: { show: true, roundingPercentage: 0 },
            offsetX: 0,
          },
          nameLabels: { show: true, color: '#000000', bold: false, fontSize: 10, offsetX: 0 },
          parentLabels: { show: true, color: '#000000', bold: false, fontSize: 10, offsetX: 0 },
        },
        highlighter: { color: '#000000', opacity: 5 },
        separators: { show: true, color: '#343434', strokeWidth: 1 },
      },
      title: {
        text: 'Genres',
        color: '#000000',
        fontSize: 20,
        bold: true,
        textAlign: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        subtitle: { color: '#A1A1A1', text: 'Games Played', fontSize: 16, bold: false },
      },
      legend: {
        position: 'top',
        show: false,
        fontSize: 14,
        color: '#000000',
        bold: true,
        roundingValue: 0,
        backgroundColor: '#1A1A1A',
        roundingPercentage: 0,
        prefix: '',
        suffix: '',
      },
      tooltip: {
        show: false,
        backgroundColor: '#1A1A1A',
        color: '#000000',
        fontSize: 14,
        showValue: true,
        showPercentage: true,
        roundingValue: 0,
        roundingPercentage: 0,
        prefix: '',
        suffix: '',
        customFormat: null,
        borderRadius: 4,
        borderColor: '#3A3A3A',
        borderWidth: 1,
        backgroundOpacity: 50,
        position: 'center',
        offsetY: 24,
      },
    },
  },
  userOptions: {
    show: false,
    showOnChartHover: false,
    keepStateOnChartLeave: true,
    position: 'right',
    buttons: {
      tooltip: true,
      pdf: true,
      img: true,
      csv: true,
      table: true,
      sort: true,
      fullscreen: true,
      annotator: true,
    },
    buttonTitles: {
      open: 'Open options',
      close: 'Close options',
      tooltip: 'Toggle tooltip',
      pdf: 'Download PDF',
      csv: 'Download CSV',
      img: 'Download PNG',
      table: 'Toggle table',
      sort: 'Toggle sort',
      fullscreen: 'Toggle fullscreen',
      annotator: 'Toggle annotator',
    },
  },
  table: {
    show: false,
    responsiveBreakpoint: 400,
    th: { backgroundColor: '#ffffff', color: '#CCCCCC', outline: 'none' },
    td: {
      backgroundColor: '#FFFFFF',
      color: '#CCCCCC',
      outline: 'none',
      roundingValue: 0,
      roundingPercentage: 0,
      prefix: '',
      suffix: '',
    },
  },
  translations: {
    parentName: 'Serie',
    childName: 'Child',
    value: 'value',
    percentageToTotal: '%/total',
    percentageToSerie: '%/serie',
  },
})

function updateDataAndConfig(newDataset, title, subtitle, showValues) {
  dataset.value = newDataset
  barConfig.style.chart.title.text = title
  barConfig.style.chart.title.subtitle.text = subtitle
  barConfig.style.chart.layout.bars.dataLabels.percentage.show = showValues
}

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
  updatingImage.value = true
  const formData = new FormData()
  formData.append('fileToUpload', fileInput.value)
  formData.append('oldFile', userState.profilePicture)
  console.log(userState.profilePicture)
  try {
    const response = await axios.post(
      `http://localhost:5000/user/${userState.userType}/${userState.userId}/update-image`,
      formData,
    )
    console.log(response.data.image)
    userState.setImage(response.data.image)
    profileImage.value = response.data.image
  } catch (error) {
    console.log(`Failure ${error}`)
  }
  updatingImage.value = false
}

async function getUserData() {
  try {
    console.log(userType, username)
    const response = await axios.get(`http://localhost:5000/get/${userType}/${username}`)
    console.log('bvjuevbuhdsdbvefhv hfvbvljh fbeduv sa')
    console.log(response.data)
    userId.value = response.data.user._id
    profileImage.value = response.data.user.image
    gameRecords.value = response.data.user?.games_played
    const favourites = response.data.user?.favourite_games
    companies.value = response.data.user?.companies
    console.log(response.data.user.image)
    parseFavouriteGames(favourites)
    parseGameAnalytics(gameRecords.value)
  } catch (error) {
    console.log(error)
  }
}

function parseFavouriteGames(favourites) {
  if (userType !== 'Developer') {
    console.log(favourites)
    if (favourites.first == null) {
      favourites.first = { name: 'Not Selected', cover: null }
    }
    if (favourites.second == null) {
      favourites.second = { name: 'Not Selected', cover: null }
    }
    if (favourites.third == null) {
      favourites.third = { name: 'Not Selected', cover: null }
    }
    console.log('bazinga')
    favouriteGames.value = favourites
  } else {
    favouriteGames.value = []
  }
  console.log(favouriteGames)
}

function parseGameAnalytics(gameData) {
  const genreCount = {}
  const genrePlayTime = {}
  const themeCount = {}
  const themePlayTime = {}
  const ratingCount = {}
  let totalRating = 0
  const keywordCount = {}
  // console.log(gameData)
  if (userType !== 'Developer') {
    gameData.forEach((game) => {
      game.game_id.genres.forEach((genre) => {
        genreCount[genre.name] = (genreCount[genre.name] || 0) + 1
        genrePlayTime[genre.name] = (genrePlayTime[genre.name] || 0) + game.hours_played
      })
      game.game_id.themes.forEach((theme) => {
        themeCount[theme.name] = (themeCount[theme.name] || 0) + 1
        themePlayTime[theme.name] = (themePlayTime[theme.name] || 0) + game.hours_played
      })
      game.game_id.keywords.forEach((keyword) => {
        keywordCount[keyword.name] = (keywordCount[keyword.name] || 0) + 1
      })
      gameTimeData.value.push({ name: game.game_id.name, value: game.hours_played })
      ratingCount[game.rating] = (ratingCount[game.rating] || 0) + 1
      totalRating = totalRating + game.rating
    })
    averageRating.value = totalRating / gameData.length

    // Object.entries(genreCount).forEach(([genre, count]) => {
    //   genreData.value.push({ name: genre, values: [count] })
    // })
    // Object.entries(themeCount).forEach(([theme, count]) => {
    //   themeData.value.push({ name: theme, values: [count] })
    // })
    // Object.entries(genrePlayTime).forEach(([genre, hours]) => {
    //   genrePlayTimeData.value.push({ name: genre, values: [hours] })
    // })
    // Object.entries(themePlayTime).forEach(([theme, hours]) => {
    //   themePlayTimeData.value.push({ name: theme, values: [hours] })
    // })
    Object.entries(genreCount).forEach(([genre, count]) => {
      genreData.value.push({ name: genre, value: count })
    })
    Object.entries(themeCount).forEach(([theme, count]) => {
      themeData.value.push({ name: theme, value: count })
    })
    Object.entries(genrePlayTime).forEach(([genre, hours]) => {
      genrePlayTimeData.value.push({ name: genre, value: hours })
    })
    Object.entries(themePlayTime).forEach(([theme, hours]) => {
      themePlayTimeData.value.push({ name: theme, value: hours })
    })
    // console.log(ratingCount)
    for (var count = 0; count < 5; count = count + 0.1) {
      // console.log(parseFloat(count.toFixed(1)))
      ratingData.value.push({
        period: `${count.toFixed(1)} Stars`,
        value: ratingCount[parseFloat(count.toFixed(1))] || 0,
      })
    }
    // console.log(ratingData.value)
    Object.entries(ratingCount).forEach((rating, count) => {})
    dataset.value = genreData.value
  } else {
    dataset.value = []
  }
  // console.log(dataset.value)
  dataRetrieved.value = true
}

onMounted(() => {
  getUserData()
})
</script>

<style scoped>
.horizontal-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.profile-upload {
  display: inline-block;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

.profile-upload:hover .profile-picture {
  opacity: 0.7;
}

input[type='checkbox'] {
  width: 20px;
  height: 20px;
  justify-self: center;
  justify-content: space-around;
  align-self: center;
}
/* .profile-picture {
  width: 100px;
  height: 100px;
} */
</style>
