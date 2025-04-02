<template>
  <div v-if="modalActive" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <h1>Log your experience</h1>
        <div class="horizontal-container">
          <h3>Rating:</h3>
          <vue3-star-ratings v-model="rating" />
          <h3>({{ rating }})</h3>
        </div>
        <div class="horizontal-container">
          <h3>Times Played:</h3>
          <input placeholder="Number of playthroughs" v-model="timesPlayed" />
        </div>
        <div class="horizontal-container">
          <h3>Hours Played:</h3>
          <input placeholder="Hours Played" v-model="hoursPlayed" />
        </div>
        <div class="horizontal-container">
          <h3 for="checkbox">Would you like to write a review?</h3>
          <input type="checkbox" id="checkbox" v-model="makeReview" />
        </div>
        <textarea
          style="width: 100%"
          v-if="makeReview"
          v-model="reviewContent"
          placeholder="Write your review"
        ></textarea>
        <div class="modal-footer">
          <div v-if="makeReview && reviewContent.length < 25">
            <p class="error-message">Review is too short</p>
          </div>
          <div v-else-if="makeReview && reviewContent.length > 250">
            <p class="error-message">Review is too long</p>
          </div>
          <div v-else>
            <button v-if="!edit" @click.stop="logGameData">Submit</button>
            <button v-else @click.stop="editGameData">Submit</button>
          </div>
        </div>
        <!-- <p>{{ reviewContent }}</p> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, toRaw, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { userState } from '@/UserData'
import axios from 'axios'

const props = defineProps({
  modalActive: Boolean,
  game: Object,
  review: Object,
  edit: Boolean,
  rating: Number,
  hoursPlayed: Number,
  timesPlayed: Number,
})

const cleanedGame = JSON.parse(JSON.stringify(toRaw(props.game)))
const emit = defineEmits(['modal-exit'])
const rating = ref(props.rating || 0)
const target = ref(null)
const makeReview = ref(props.review?.review_content || false)
const reviewContent = ref(props.review.value?.review_content || '')
const review = computed(() => props.review?.review_content !== '')
const hoursPlayed = ref(props.hoursPlayed || 0)
const timesPlayed = ref(props.timesPlayed || 0)
const reactions = ref(props.review.reactions)
const route = useRoute()
const gameId = route.params.id

onClickOutside(target, () => emit('modal-exit'))

async function logGameData() {
  try {
    var response = {}
    console.log(userState)
    console.log(makeReview.value)
    if (rating.value > 5) {
      rating.value = 5
    } else if (rating.value < 0) {
      rating.value = 0
    }

    if (review.value && makeReview.value) {
      response = await axios.post(`http://localhost:5000/game/${gameId}/record/make`, {
        userState,
        rating: rating.value,
        timesPlayed: timesPlayed.value,
        hoursPlayed: hoursPlayed.value,
        review: {
          username: userState.username,
          review_content: reviewContent.value,
          likes: 0,
          dislikes: 0,
          created: Date.now(),
          edited: false,
          review_id: '',
          reactions: [],
        },
        game: props.game,
      })
    } else {
      response = await axios.post(`http://localhost:5000/game/${gameId}/record/make`, {
        userState,
        rating: rating.value,
        timesPlayed: timesPlayed.value,
        hoursPlayed: hoursPlayed.value,
        game: props.game,
      })
    }
    const updateResponse = await axios.post(`http://localhost:5000/game/${gameId}/update`)

    const gameInfo = response.data
    console.log(gameInfo)
    emit('modal-exit')
    location.reload()
  } catch (error) {
    console.error(error)
  }
}

async function editGameData() {
  try {
    var response = {}
    console.log(props?.review?.value?.likes)
    console.log(props?.review)
    if (rating.value > 5) {
      rating.value = 5
    } else if (rating.value < 0) {
      rating.value = 0
    }

    if (review.value && makeReview.value) {
      response = await axios.post(`http://localhost:5000/game/${gameId}/record/edit`, {
        userState,
        rating: rating.value,
        timesPlayed: timesPlayed.value,
        hoursPlayed: hoursPlayed.value,
        review: {
          username: userState.username,
          review_content: reviewContent.value,
          likes: props?.review?.value?.likes || 0,
          dislikes: props?.review?.value?.dislikes || 0,
          created: Date.now(),
          edited: true,
          review_id: props?.review?.value?.review_id || -1,
          reactions: props?.review?.value?.reactions || [],
        },
        game: props.game,
      })
    } else {
      response = await axios.post(`http://localhost:5000/game/${gameId}/record/edit`, {
        userState,
        rating: rating.value,
        timesPlayed: timesPlayed.value,
        hoursPlayed: hoursPlayed.value,
        game: props.game,
      })
    }

    const gameInfo = response.data
    console.log(gameInfo)
    const updateResponse = await axios.post(`http://localhost:5000/game/${gameId}/update`)
    emit('modal-exit')

    location.reload()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-container {
  width: 75%;
  height: 50%;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>
