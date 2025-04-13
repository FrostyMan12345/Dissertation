<template>
  <button @click="bazinga">Toast</button>
</template>

<script setup>
import Review from './GamePage/Review.vue'
import DeveloperComment from './GamePage/DeveloperComment.vue'
import GameInfo from './GamePage/GameInfo.vue'
import CashCount from './CashCount.vue'
import Login from '../views/Login.vue'
import CatergoryFilter from './CatergoryFilter.vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const test = CatergoryFilter

function bazinga() {
  toast('bazinga', {
    position: 'bottom-right',
    theme: 'colored',
    type: 'info',
    autoClose: 1500,
  })
}
</script>

<style scoped></style>
