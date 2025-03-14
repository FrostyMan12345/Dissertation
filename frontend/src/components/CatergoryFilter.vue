<template>
  <div class="criteria-container">
    <form @submit.prevent="changeCriteria">
      <h4>Ranking By:</h4>
      <h5 id="pAnswer">{{ currentCriteria }}</h5>
      <input type="radio" v-model="chosenCriteria" id="rating" name="criteria" value="Rating" />
      <label for="rating" margin-left="10px">Rating</label><br />
      <input
        type="radio"
        v-model="chosenCriteria"
        id="most popular"
        name="criteria"
        value="Most Popular"
      />
      <label for="most popular" margin-left="10px">Most Popular</label><br />
      <input
        type="radio"
        v-model="chosenCriteria"
        id="play time"
        name="criteria"
        value="Play Time"
      />
      <label for="play time" margin-left="10px">Play Time</label><br />
      <button type="submit">Change Criteria</button>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, onMounted } from 'vue'

const props = defineProps({
  rankValue: String,
})

var currentCriteria = ref(props.rankValue)
var chosenCriteria = ref('')

function changeCriteria() {
  sessionStorage.setItem('rankingCriteria', chosenCriteria.value)
  currentCriteria.value = chosenCriteria.value
  emit('change-ranking', currentCriteria.value)
}

const emit = defineEmits(['change-ranking'])

onMounted(() => {
  chosenCriteria.value = currentCriteria.value
})
</script>

<style scoped>
.criteria-container {
  border: 1px solid blue;
  background-color: aliceblue;
  width: max-content;
  height: max-content;
  padding: 10px 10px 10px 10px;
}
button {
  color: rgb(0, 0, 0);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0);
  border: solid 1px blue;
  padding: 5px;
}

button:hover {
  background-color: rgb(0, 187, 255);
}
</style>
