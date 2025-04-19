<template>
  <div class="review">
    <div class="horizontal-container">
      <h4>
        <!-- <p>{{ userData }}</p> -->
        <a :href="`${frontendUrl}/profile/Developer/${commentInfo?.dev_id.username}`">{{
          commentInfo?.dev_id.username
        }}</a>
      </h4>
      <ProfilePicture :small="true" :image="image" />
    </div>
    <p>{{ commentInfo?.comment }}</p>
    <div class="horizontal-container">
      <div>
        <button
          :disabled="isDisabled"
          @click="reviewReact(1)"
          :class="{ liked: isLiked }"
          class="like-dislike-btn"
        >
          <img src="../../assets/like_icon.png" alt="Like" class="like-dislike" />
        </button>
        <label :class="{ liked: isLiked }"> Likes: {{ likes }} </label>

        <button
          :disabled="isDisabled"
          @click="reviewReact(-1)"
          :class="{ disliked: isDisliked }"
          class="like-dislike-btn"
        >
          <img src="../../assets/dislike_icon.png" alt="Dislike" class="like-dislike" />
        </button>
        <label :class="{ disliked: isDisliked }"> Dislikes: {{ dislikes }} </label>
      </div>
      <div>
        <p>
          <span style="width: 60px; display: inline-block">Created: </span>
          {{ dayjs(commentInfo.created).format('DD/MM/YYYY HH:mm:ss') }}
        </p>
        <p v-if="commentInfo.edited !== 0">
          <span style="width: 60px; display: inline-block">Edited: </span>
          {{ dayjs(commentInfo.edited).format('DD/MM/YYYY HH:mm:ss') }}
        </p>
      </div>
      <!-- <label>reaction: {{ reaction }}</label>
      <label>{{ hasReacted }}</label> -->
      <!-- {{ userData }} -->
      <!-- {{ commentInfo.comment_id }} -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { userState } from '@/UserData'
import ProfilePicture from '../ProfilePicture.vue'
import dayjs from 'dayjs'

const props = defineProps({
  commentInfo: Object,
  reaction: Number,
  reactedPrior: Boolean,
  image: String,
})

const likes = ref(props.commentInfo.likes || 0)
const dislikes = ref(props.commentInfo.dislikes || 0)
const isLiked = ref(props.reaction == 1)
const isDisliked = ref(props.reaction == -1)
const reaction = ref(props.reaction)
const hasReacted = ref(props.reactedPrior)
const reactionUpdated = ref(false)
const route = useRoute()
const gameId = route.params.id
const isDisabled = ref(false)
const backendUrl = import.meta.env.VITE_BACKEND_URL
const frontendUrl = import.meta.env.VITE_FRONTEND_URL
const handleButton = () => {
  isDisabled.value = true // Disable button
  setTimeout(() => {
    isDisabled.value = false // Enable after 1 second
  }, 600)
}

function reviewReact(reaction) {
  if (!userState.developer && userState.loggedIn) {
    console.log('Updating reaction: ', reaction)
    if (reaction == 1) {
      likeReview()
    } else {
      dislikeReview()
    }
  }
}

function likeReview() {
  handleButton()
  if (isDisliked.value) {
    isLiked.value = true
    isDisliked.value = false
    updateReaction(1, likes.value + 1, dislikes.value - 1)
  } else if (isLiked.value) {
    isLiked.value = false
    updateReaction(0, likes.value - 1, dislikes.value)
  } else {
    isLiked.value = true
    updateReaction(1, likes.value + 1, dislikes.value)
  }
}

function dislikeReview() {
  handleButton()
  if (isLiked.value) {
    isDisliked.value = true
    isLiked.value = false
    updateReaction(-1, likes.value - 1, dislikes.value + 1)
  } else if (isDisliked.value) {
    isDisliked.value = false
    updateReaction(0, likes.value, dislikes.value - 1)
  } else {
    isDisliked.value = true
    updateReaction(-1, likes.value, dislikes.value + 1)
  }
}

async function updateReaction(newReaction, newLikes, newDislikes) {
  try {
    console.log(newReaction)
    console.log(props.commentInfo.comment_id)
    const response = await axios.post(
      `
      ${backendUrl}/game/${gameId}/comment/reaction/update`,
      {
        reaction: newReaction,
        newLikes,
        newDislikes,
        userState,
        reactedPrior: hasReacted.value,
        commentId: props.commentInfo.comment_id,
      },
    )
    reaction.value = newReaction
    likes.value = newLikes
    dislikes.value = newDislikes
    hasReacted.value = true
    console.log(response)
  } catch (error) {
    console.error('Reaction Get Failure ', error)
  }
}
</script>

<style scoped>
.review {
  border: 1px solid green;
  background-color: rgb(206, 255, 133);
  /* min-width: 75%; */
  min-width: 75%;
  height: max-content;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}
.like-dislike {
  width: 25px;
  height: 25px;
}

button {
  padding: 5px 10px;
  border: none;
  background-color: #ffffff00;
  color: #000000;
  font-size: 16px;
  transition: all 0.3s ease;
}

.like-dislike-btn {
  cursor: pointer;
}

img {
  filter: hue-rotate(180deg) brightness(1.2);
}

.liked {
  color: blue;
  /* font-weight: bold; */
}

.disliked {
  color: red;
  /* font-weight: bold; */
}

.horizontal-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
</style>
