<template>
  <div class="review">
    <h4>{{ username }}</h4>
    <p>{{ review }}</p>
    <div class="horizontal-container">
      <div>
        <button @click="likeReview" :class="{ liked: isLiked }" class="like-dislike-btn">
          <img src="../assets/like_icon.png" alt="Like" class="like-dislike" />
        </button>
        <label :class="{ liked: isLiked }"> Likes: {{ likes }} </label>

        <button @click="dislikeReview" :class="{ disliked: isDisliked }" class="like-dislike-btn">
          <img src="../assets/dislike_icon.png" alt="Dislike" class="like-dislike" />
        </button>
        <label :class="{ disliked: isDisliked }"> Dislikes: {{ dislikes }} </label>
      </div>
      <label>Rating Given: {{ rating }}</label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = 'FrostyMan12345'
const review =
  "According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible. Yellow, black. Yellow, black. Yellow, black. Yellow, black. Ooh, black and yellow! Let's shake it up a little."
const likes = ref(0)
const dislikes = ref(0)
const isLiked = ref(false)
const isDisliked = ref(false)
const rating = 0

function likeReview() {
  if (isDisliked.value) {
    likes.value++
    isLiked.value = true
    isDisliked.value = false
    dislikes.value--
  } else if (isLiked.value) {
    likes.value--
    isLiked.value = false
  } else {
    isLiked.value = true
    likes.value++
  }
}

function dislikeReview() {
  if (isLiked.value) {
    dislikes.value++
    isDisliked.value = true
    isLiked.value = false
    likes.value--
  } else if (isDisliked.value) {
    dislikes.value--
    isDisliked.value = false
  } else {
    isDisliked.value = true
    dislikes.value++
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
