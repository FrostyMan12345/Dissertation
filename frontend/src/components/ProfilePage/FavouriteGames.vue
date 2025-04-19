<template>
  <div v-if="Object.values(favouriteGames).slice(0, 3).length > 0">
    <h2>Favourite Games</h2>
    <!-- {{ Object.values(favouriteGames).slice(0, 3) }} -->

    <table>
      <thead>
        <tr>
          <th><h4>Ranking</h4></th>
          <th><h4>Game</h4></th>
          <th><h4>Cover</h4></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="isUser"
          v-for="(game, index) in Object.values(favouriteGames).slice(0, 3) || []"
          :key="index"
        >
          <td>
            <h4>{{ index + 1 }}</h4>
          </td>
          <td>
            <h3 v-if="game.name !== 'Not Selected'">
              <a
                style="color: blue; text-decoration: none; text-align: start"
                :href="`http://localhost:5173/game/${game.id}`"
                >{{ game.name }}</a
              >
            </h3>
            <h3 v-else>Not Selected</h3>
          </td>
          <td>
            <img
              v-if="game.name !== 'Not Selected'"
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.cover?.image_id}.jpg`"
            />
            <h6 v-else style="text-align: center">Unavailable</h6>
          </td>
        </tr>
        <tr
          v-else
          v-for="(game, index2) in Object.values(props.favouriteGames).slice(0, 3) || []"
          :key="index2"
        >
          <td>
            <h4>{{ index2 + 1 }}</h4>
          </td>
          <td>
            <h4>{{ game?.name }}</h4>
          </td>
          <td>
            <img
              v-if="game?.cover != null"
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game?.cover?.image_id}.jpg`"
            />
            <h4 v-else style="text-align: center">Cover Unavailable</h4>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { userState } from '@/UserData'

const props = defineProps({
  isUser: Boolean,
  favouriteGames: Object,
})
</script>

<style scoped></style>
