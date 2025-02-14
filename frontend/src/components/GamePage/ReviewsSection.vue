<template>
  <h1>Reviews and Comments</h1>
  <div v-for="played in playedBy" :key="index">
    <div v-if="played?.review">
      <!-- <h1>{{ played?.review.review_id }}</h1>
      <h1>{{ reacted }}</h1>
      <h1>{{ reacted[played?.review.review_id] == undefined }}</h1> -->
      <Review
        v-if="reacted[played?.review.review_id] != undefine"
        :reviewInfo="played?.review"
        :rating="played?.rating"
        :reaction="reacted[played?.review.review_id]"
        :reactedPrior="true"
        class="article"
      />
      <Review
        v-else
        :reviewInfo="played?.review"
        :rating="played?.rating"
        :reaction="0"
        :reactedPrior="false"
        class="article"
      />
    </div>
  </div>
</template>

<script setup>
import { userState } from '@/UserData'
import { onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Review from './Review.vue'

const props = defineProps({
  playedBy: Array,
  devComments: Array,
})

const route = useRoute()
const gameId = route.params.id
const reacted = reactive({})

async function getReacted() {
  if (!userState.loggedIn) {
    return
  }
  console.log(`UserId: ${userState.userId}`)
  try {
    const response = await axios.get(`http://localhost:5000/game/${gameId}/reaction/get`, {
      params: {
        userId: userState.userId,
      },
    })
    Object.assign(reacted, response.data.reviews)
    console.log(reacted)
    if (!reacted['bvdsuhovcb']) {
      console.log('AHHHHHHHHHHHHHHHHHHHH')
    }
  } catch (error) {
    console.error('Reaction Get Failure ', error)
  }
}

onMounted(() => {
  getReacted()
})
</script>

<style scoped>
.article {
  gap: 10px;
}
</style>
