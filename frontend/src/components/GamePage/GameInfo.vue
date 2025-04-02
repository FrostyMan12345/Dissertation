<template>
  <div class="vertical-container">
    <h1>{{ game?.gameTitle || 'Unknown Game' }}</h1>
    <div class="horizontal-container">
      <div class="game-info">
        <p v-if="game.description == 'No description available'">{{ game.summary }}</p>
        <p v-else>{{ game.description }}</p>
        <hr />
        <p>Developers: {{ game?.companies['developers']?.join(', ') || 'Unknown Developers' }}</p>
        <p>Publishers: {{ game?.companies['publishers']?.join(', ') || 'Unknown Publishers' }}</p>
        <hr />
        <p>Genres: {{ game?.genres?.join(', ') || 'Unknown Genres' }}</p>
        <p>Themes: {{ game?.themes?.join(', ') || 'Unknown Themes' }}</p>
        <p>Keywords: {{ game?.keywords?.join(', ') || 'Unknown Keywords' }}</p>
        <hr />
        <p>Platforms: {{ game?.platforms?.join(', ') || 'Unknown Platforms' }}</p>
        <p>Ports: {{ game?.ports?.join(', ') || 'None' }}</p>
        <p>Expanded Games: {{ game?.expandedGames?.join(', ') || 'None' }}</p>
      </div>
      <div class="vertical-container-2">
        <div class="game-metrics">
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.imageId}.jpg`"
            alt="Game Cover"
            class="game-image"
          />
          <hr />
          <p><strong>Average Rating:</strong> {{ game?.rating ?? 'N/A' }}</p>
          <vue3-star-ratings v-model="rating" />
          <hr />
          <p><strong>Average Hours Played:</strong> {{ game?.hoursPlayed ?? 'Unknown' }} hours</p>
          <hr />
          <p><strong>Average Times Played:</strong> {{ game?.timesPlayed ?? 'Unknown' }} times</p>
          <hr />
          <p><strong>Records Created:</strong> {{ game?.recordsMade ?? 'Unknown' }}</p>
        </div>
        <div v-if="!hasLogged">
          <button @click="emit('make-record')" v-if="userState.loggedIn">+ Create a Record</button>
          <p v-else>Log in to log your experience</p>
        </div>
        <div v-else>
          <button @click="emit('edit-record')" v-if="userState.loggedIn">Edit your Record</button>
        </div>

        <button @click="emit('change-favourite')">Favourite</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import { userState } from '@/UserData'

const props = defineProps({
  game: Object,
  hasLogged: Boolean,
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
  min-width: 15%;
  min-height: 400px;
}

.game-info {
  border: 1px solid blue;
  background-color: azure;
  padding: 10px;
  min-width: 75%;
}

hr {
  width: 100%;
  color: blue;
}
</style>
