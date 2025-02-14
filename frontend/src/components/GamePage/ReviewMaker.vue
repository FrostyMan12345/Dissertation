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
          <input type="checkbox" id="checkbox" v-model="review" />
        </div>
        <textarea
          style="width: 100%"
          v-if="review"
          v-model="reviewContent"
          placeholde="Write your review"
        ></textarea>
        <div class="modal-footer">
          <div>
            <button @click.stop="logGameData">Submit</button>
          </div>
        </div>
        <p>{{ review }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, toRaw } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { userState } from '@/UserData'
import axios from 'axios'

const props = defineProps({
  modalActive: Boolean,
  game: Object,
})

const cleanedGame = JSON.parse(JSON.stringify(toRaw(props.game)))
const emit = defineEmits(['modal-exit'])
const rating = ref(0)
const target = ref(null)
const reviewContent = ref('')
const review = ref(false)
const hoursPlayed = ref(0)
const timesPlayed = ref(0)
const route = useRoute()
const gameId = route.params.id

onClickOutside(target, () => emit('modal-exit'))

async function logGameData() {
  console.log(dateObj)
  try {
    var response = {}
    console.log(userState)

    if (review.value) {
      response = await axios.post(`http://localhost:5000/game/${gameId}/log`, {
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
      response = await axios.post(`http://localhost:5000/game/${gameId}/log`, {
        userState,
        rating: rating.value,
        timesPlayed: timesPlayed.value,
        hoursPlayed: hoursPlayed.value,
        game: props.game,
      })
    }

    const gameInfo = response.data
    console.log(gameInfo)
    emit('modal-exit')
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
