<template>
  <div class="vertical-container">
    <h1>{{ game?.gameTitle || 'Unknown Game' }}</h1>
    <div class="horizontal-container">
      <div style="min-width: 75%">
        <div class="vertical-container">
          <div class="game-info" style="margin-bottom: 10px">
            <p v-if="game.description == 'No description available'">{{ game.summary }}</p>
            <p v-else>{{ game.description }}</p>
            <hr />
            <p>
              Developers: {{ game?.companies['developers']?.join(', ') || 'Unknown Developers' }}
            </p>
            <p>
              Publishers: {{ game?.companies['publishers']?.join(', ') || 'Unknown Publishers' }}
            </p>
            <hr />
            <p>Genres: {{ game?.genres?.join(', ') || 'Unknown Genres' }}</p>
            <p>Themes: {{ game?.themes?.join(', ') || 'Unknown Themes' }}</p>
            <p>Keywords: {{ game?.keywords?.join(', ') || 'Unknown Keywords' }}</p>
            <hr />
            <p>Platforms: {{ game?.platforms?.join(', ') || 'Unknown Platforms' }}</p>
            <p>Ports: {{ game?.ports?.join(', ') || 'None' }}</p>
            <p>Expanded Games: {{ game?.expandedGames?.join(', ') || 'None' }}</p>
          </div>
          <ReviewsSection :playedBy="game.playedBy" :dev-comments="game.comments" />
        </div>
      </div>
      <div class="vertical-container-2">
        <div class="game-metrics">
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.imageId}.jpg`"
            alt="Game Cover"
            class="game-image"
          />
          <hr />
          <div class="metric-display">
            <p style="text-align: center">
              <strong>Average Rating:</strong> {{ game?.rating ?? 'N/A' }}
            </p>
            <vue3-star-ratings v-model="rating" />
          </div>
          <hr />
          <p style="text-align: center">
            <strong>Average Hours Played:</strong> {{ game?.hoursPlayed ?? 'Unknown' }} hours
          </p>
          <hr />
          <p style="text-align: center">
            <strong>Average Revisits:</strong> {{ game?.timesPlayed ?? 'Unknown' }} times
          </p>
          <hr />
          <p style="text-align: center">
            <strong>Records Created:</strong> {{ game?.recordsMade ?? 'Unknown' }}
          </p>
        </div>
        <div class="record-comment-button" v-if="!hasLogged">
          <button
            class="normal-button"
            style="min-width: 100%"
            @click="emit('make-record')"
            v-if="userState.loggedIn && !userState.developer"
          >
            + Create a Record
          </button>
          <button
            class="normal-button"
            @click="emit('make-record')"
            v-else-if="userState.loggedIn && userState.developer && canComment"
          >
            + Create a Comment
          </button>
          <p v-else-if="userState.loggedIn && userState.developer && !canComment">
            You cannot comment on this game
          </p>
          <p v-else>Log in to create a record</p>
        </div>
        <div class="record-comment-button" v-else>
          <button
            class="normal-button"
            style="min-width: 100%"
            @click="emit('edit-record')"
            v-if="userState.loggedIn && !userState.developer"
          >
            Edit your Record
          </button>
          <button
            class="normal-button"
            style="min-width: 100%"
            @click="emit('edit-record')"
            v-if="userState.loggedIn && userState.developer && canComment"
          >
            Edit your comment
          </button>
          <button
            v-if="userState.loggedIn"
            style="min-width: 100%"
            class="normal-button"
            @click="emit('change-favourite')"
          >
            Favourite
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import { userState } from '@/UserData'
import ReviewsSection from './ReviewsSection.vue'

const props = defineProps({
  game: Object,
  hasLogged: Boolean,
  canComment: Boolean,
})

const rating = props.game?.rating
const emit = defineEmits(['make-record', 'edit-record'])
</script>

<style scoped>
.horizontal-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
}

.vertical-container {
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
}

.vertical-container-2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.game-image {
  max-width: 100%;
  max-height: 100%;
}

.game-metrics {
  border: 1px solid blue;
  padding: 10px;
  min-width: 100%;
  min-height: 400px;
  border-radius: 10px;
}

.game-info {
  border: 1px solid blue;
  background-color: azure;
  padding: 10px;
  min-width: 100%;
  border-radius: 10px;
}

hr {
  width: 100%;
  color: blue;
}

.record-comment-button {
  min-width: 100%;
  max-width: 100%;
}

.metric-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
