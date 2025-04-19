<template>
  <table style="width: 100%">
    <thead>
      <tr>
        <th><h3>Ranking</h3></th>
        <th><h3>Game</h3></th>
        <th><h3>Cover</h3></th>
        <th><h3>Rating</h3></th>
        <th><h3>Hours Played</h3></th>
        <th><h3>Revisits</h3></th>
        <th><h3>Records</h3></th>
        <!-- <th><h3>Score</h3></th> -->
      </tr>
    </thead>
    <tbody>
      <tr v-for="(game, index) in recommendations" :key="index">
        <td>
          <h3>{{ index + 1 }}</h3>
        </td>
        <td>
          <h3>
            <a
              style="color: blue; text-decoration: none; text-align: start"
              :href="`http://localhost:5173/game/${game.id}`"
              >{{ game.name }}</a
            >
          </h3>
        </td>
        <td v-if="game.cover">
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.cover?.image_id}.jpg`"
            alt="Game Cover"
            class="game-image"
            crossorigin="anonymous"
          />
        </td>
        <td v-else>
          <h6 style="text-align: center">Unavailable</h6>
        </td>
        <td>
          <h3 style="text-align: center">{{ game.average_rating || 0 }}/5</h3>
        </td>
        <td>
          <h3 style="text-align: center">{{ game.average_hours_played || 0 }}</h3>
        </td>
        <td>
          <h3 style="text-align: center">{{ game.average_times_played || 0 }}</h3>
        </td>
        <td>
          <h3 style="text-align: center">{{ game.records_made || 0 }}</h3>
        </td>
        <!-- <td>
          <h3 style="text-align: center">{{ score[index] || 0 }}</h3>
        </td> -->
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { onMounted, ref, reactive, defineProps } from 'vue'

const props = defineProps({
  recommendations: { type: [Object], default: [] },
})

const recommendations = props.recommendations.map((rec) => rec.game)
const score = props.recommendations.map((rec) => rec.finalScore)
</script>

<style scoped></style>
