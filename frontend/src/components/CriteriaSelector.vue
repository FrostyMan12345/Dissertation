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
        id="most played"
        name="criteria"
        value="Most Played"
      />
      <label for="most played" margin-left="10px">Most Played</label><br />
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
import { ref } from 'vue'

var currentCriteria = ref('Rating')
var chosenCriteria = ref('')

function checkValue() {
  alert(`Current Criteria: ${currentCriteria.value}, Chosen Criteria: ${chosenCriteria.value}`)
}

function changeCriteria() {
  currentCriteria.value = chosenCriteria.value
}
</script>

<style scoped>
.criteria-container {
  border: 1px solid blue;
  background-color: aliceblue;
  width: max-content;
  height: max-content;
  padding: 10px 10px 10px 10px;
}
</style>
