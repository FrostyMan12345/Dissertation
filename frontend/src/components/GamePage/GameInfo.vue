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
      <div class="game-metrics">
        <img
          :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.imageId}.jpg`"
          alt="Game Cover"
          class="game-image"
        />
        <hr />
        <p><strong>Rating:</strong> {{ game?.ratings ?? 'N/A' }}</p>
        <hr />
        <p><strong>Average Time Played:</strong> {{ game?.timePlayed ?? 'Unknown' }} hours</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  game: Object,
})

const imageUrl = 'https://images.igdb.com/igdb/image/upload/t_720p/'
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
