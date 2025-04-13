<template>
  <h3 v-if="!playedBy.some((played) => played?.review) && devComments.length === 0">
    There are no reviews or comments
  </h3>
  <h1 v-else>Reviews and Comments</h1>
  <div v-for="comment in devComments">
    <DeveloperComment
      v-if="commentsReacted[comment?.comment_id] != undefined"
      :commentInfo="comment"
      :reaction="commentsReacted[comment?.comment_id]"
      :reactedPrior="true"
      :image="comment.dev_id?.image"
    />
    <DeveloperComment
      v-else
      :commentInfo="comment"
      :reaction="0"
      :reactedPrior="false"
      :image="comment.dev_id?.image"
    />
    <!-- {{ comment.comment_id }}
    {{ commentsReacted }}
    {{ commentsReacted[comment?.comment_id] != undefined }}
    {{ commentsReacted[comment?.comment_id] }} -->
  </div>

  <div v-if="playedBy.some((played) => played?.review)">
    <div v-for="played in playedBy" :key="index">
      <div v-if="played?.review">
        <!-- <h1>{{ played?.review.review_id }}</h1>
      <h1>{{ reacted }}</h1>
      <h1>{{ reacted[played?.review.review_id] == undefined }}</h1> -->
        <!-- <h1>{{ played.user_id?.image }}</h1> -->
        <!-- <h1>{{ played.user_id?._id }}</h1> -->
        <Review
          v-if="reviewsReacted[played?.review.review_id] != undefined"
          :reviewInfo="played?.review"
          :rating="played?.rating"
          :reaction="reviewsReacted[played?.review.review_id]"
          :reactedPrior="true"
          :image="played.user_id?.image"
          :userData="played"
          class="article"
        />
        <Review
          v-else
          :reviewInfo="played?.review"
          :rating="played?.rating"
          :reaction="0"
          :reactedPrior="false"
          :image="played.user_id?.image"
          :userData="played"
          class="article"
        />
        <hr />
      </div>
    </div>
  </div>
</template>

<script setup>
import { userState } from '@/UserData'
import { onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Review from './Review.vue'
import DeveloperComment from './DeveloperComment.vue'

const props = defineProps({
  playedBy: Array,
  devComments: Array,
})

const route = useRoute()
const gameId = route.params.id
const reviewsReacted = reactive({})
const commentsReacted = reactive({})

async function getReacted() {
  if (!userState.loggedIn || userState.developer) {
    return
  }
  console.log(`UserId: ${userState.userId}`)
  try {
    const reviewResponse = await axios.get(
      `http://localhost:5000/game/${gameId}/record/reaction/get`,
      {
        params: {
          userId: userState.userId,
        },
      },
    )
    const commentResponse = await axios.get(
      `http://localhost:5000/game/${gameId}/comment/reaction/get`,
      {
        params: {
          userId: userState.userId,
        },
      },
    )
    Object.assign(reviewsReacted, reviewResponse.data.reviews)
    Object.assign(commentsReacted, commentResponse.data.comments)
    console.log(commentResponse.data.comments)
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

hr {
  height: 1px;
  color: rgba(255, 255, 255, 0);
  padding: 0px;
  gap: 1px;
}
</style>
