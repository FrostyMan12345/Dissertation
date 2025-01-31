<script setup>
import { ref } from 'vue'

var startItem = ref(50)
var endItem = ref(100)
const gameList = [
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
  'Chess',
  'Monopoly',
  'Scrabble',
  'Risk',
]
</script>

<template>
  <div class="container">
    <table>
      <thead>
        <tr>
          <th width="100px">Ranking</th>
          <th>Game</th>
          <th width="150px">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(game, index) in gameList.slice(startItem, endItem)" :key="index">
          <td>{{ index + 1 + startItem }}</td>
          <td>{{ game }}</td>
          <td>0</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border: 1px solid rgb(255, 255, 255);
  background-color: gray;
  color: white;
}

th {
  color: white;
  background-color: rgb(90, 90, 90);
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
