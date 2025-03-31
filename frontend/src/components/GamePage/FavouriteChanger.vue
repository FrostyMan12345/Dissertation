<template>
  <div v-if="modalActive" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <h1>Add {{ game.gameTitle }} to your favouirte games?</h1>
        <p>Choose a slot to place this game in:</p>
        {{ game._id }}
        <div class="vertical-container">
          <button class="favourite-changer" @click="changeFavourite(0)">
            <p>1. {{ userState.favouriteGames.first?.name }}</p>
            <img
              v-if="userState.favouriteGames.first?.cover?.image_id !== undefined"
              :src="`https://images.igdb.com/igdb/image/upload/t_micro/${userState.favouriteGames.first?.cover?.image_id}.jpg`"
              alt="Game Cover"
              class="game-image"
              crossorigin="anonymous"
            />
          </button>
          <button class="favourite-changer" @click="changeFavourite(1)">
            <p>2. {{ userState.favouriteGames.second?.name }}</p>
            <img
              v-if="userState.favouriteGames.second?.cover?.image_id"
              :src="`https://images.igdb.com/igdb/image/upload/t_micro/${userState.favouriteGames.second?.cover?.image_id}.jpg`"
              alt="Game Cover"
              class="game-image"
              crossorigin="anonymous"
            />
          </button>
          <button class="favourite-changer" @click="changeFavourite(2)">
            <p>3. {{ userState.favouriteGames.third?.name }}</p>
            <img
              v-if="userState.favouriteGames.third?.cover?.image_id"
              :src="`https://images.igdb.com/igdb/image/upload/t_micro/${userState.favouriteGames.third?.cover?.image_id}.jpg`"
              alt="Game Cover"
              class="game-image"
              crossorigin="anonymous"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, toRaw, computed, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { userState } from '@/UserData'
import axios from 'axios'

const props = defineProps({
  modalActive: Boolean,
  game: Object,
})

const cleanedGame = JSON.parse(JSON.stringify(toRaw(props.game)))
const emit = defineEmits(['modal-exit'])
const target = ref(null)
const route = useRoute()
const gameId = route.params.id

onClickOutside(target, () => emit('modal-exit'))

async function changeFavourite(index) {
  console.log(
    `http://localhost:5000/set/${userState.userType}/${userState.username}/favourites/${props.game._id}/${index}`,
  )
  try {
    const favoruiteChangeRequest = await axios.post(
      `http://localhost:5000/set/${userState.userType}/${userState.username}/favourites/${props.game._id}/${index}`,
      userState,
    )
    console.log(favoruiteChangeRequest.data)
    userState.setFavoruiteGames(favoruiteChangeRequest.data.favourites)
  } catch (error) {
    console.log(error)
  }
}

// onMounted(() => {
//   getFavouriteGames()
// })
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-container {
  width: 75%;
  height: 50%;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.vertical-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  gap: 20px;
}

.favourite-changer {
}

button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  justify-items: center;
  color: rgb(0, 0, 0);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0);
  border: solid 1px blue;
  padding: 5px;
  gap: 10px;
}

button:hover {
  background-color: rgb(0, 187, 255);
}
</style>
