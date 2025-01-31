<template>
  <h1>{{ title }}</h1>
  <div class="horizontal-container">
    <div class="game-info">
      <p>{{ description }}</p>
      <hr />
      <p>{{ developers }}</p>
      <hr />
      <p>{{ genres.toString() }}</p>
    </div>
    <div class="game-metrics">
      <img src=https://images.igdb.com/igdb/image/upload/t_720p/co93cr.jpg alt="Test" class="game-image" />
      <hr />
      <h7>Rating: {{ rating }}</h7>
      <hr />
      <h7>Average Time Played: {{ timePlayed }} hours</h7>
    </div>
  </div>
</template>

<script setup>
const title = '<Game Title>'
const description =
  "According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible. Yellow, black. Yellow, black. Yellow, black. Yellow, black. Ooh, black and yellow! Let's shake it up a little."
const genres = ['action', 'fps', 'visual novel']
const developers = 'Small Indie Company'
const rating = 3
const coverID = 424251
const timePlayed = 150

// function getImage(imageID) {
//   try {

//   }
//   return `https://images.igdb.com/igdb/image/upload/t_720p/${imageID}.jpg`
// }

// getImage('co93cr')

</script>

<style scoped>
.horizontal-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
}

.game-image {
  max-width: 300px;
  max-height: 400px;
}

.game-metrics {
  border: 1px solid blue;
  padding: 10px;
}

.game-info {
  border: 1px solid blue;
  background-color: azure;
  padding: 10px;
}

hr {
  width: 100%;
  color: blue;
}
</style>
