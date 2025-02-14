<template>
  <div class="review">
    <h4>{{ reviewInfo?.username }}</h4>
    <p>{{ reviewInfo?.review_content }}</p>
    <div class="horizontal-container">
      <div>
        <button
          :disabled="isDisabled"
          @click="likeReview"
          :class="{ liked: isLiked }"
          class="like-dislike-btn"
        >
          <img src="../../assets/like_icon.png" alt="Like" class="like-dislike" />
        </button>
        <label :class="{ liked: isLiked }"> Likes: {{ likes }} </label>

        <button
          :disabled="isDisabled"
          @click="dislikeReview"
          :class="{ disliked: isDisliked }"
          class="like-dislike-btn"
        >
          <img src="../../assets/dislike_icon.png" alt="Dislike" class="like-dislike" />
        </button>
        <label :class="{ disliked: isDisliked }"> Dislikes: {{ dislikes }} </label>
      </div>
      <label>Rating Given: {{ rating }}</label>
      <!-- <label>reaction: {{ reaction }}</label>
      <label>{{ hasReacted }}</label> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { userState } from '@/UserData'

const props = defineProps({
  reviewInfo: Object,
  rating: Number,
  reaction: Number,
  reactedPrior: Boolean,
})

const likes = ref(props.reviewInfo.likes)
const dislikes = ref(props.reviewInfo.dislikes)
const isLiked = ref(props.reaction == 1)
const isDisliked = ref(props.reaction == -1)
const reaction = ref(props.reaction)
const hasReacted = ref(props.reactedPrior)
const reactionUpdated = ref(false)
const route = useRoute()
const gameId = route.params.id
const isDisabled = ref(false)
const handleButton = () => {
  isDisabled.value = true // Disable button
  setTimeout(() => {
    isDisabled.value = false // Enable after 1 second
  }, 600)
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

async function updateReaction(reaction, newLikes, newDislikes) {
  try {
    const response = await axios.post(`http://localhost:5000/game/${gameId}/reaction/update`, {
      reaction,
      newLikes,
      newDislikes,
      userState,
      reactedPrior: hasReacted.value,
      reviewId: props.reviewInfo.review_id,
    })
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
  border: 1px solid blue;
  background-color: azure;
  width: 50%;
  height: max-content;
  padding: 10px;
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
