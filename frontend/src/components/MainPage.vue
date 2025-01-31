<template>
  <div class="horizontal-container">
    <Leaderboard />
    <CriteriaSelector style="margin-top: 20px" />
  </div>
</template>

<script setup>
import CriteriaSelector from './CriteriaSelector.vue'
import Leaderboard from './Leaderboard.vue'
</script>

<style scoped>
.horizontal-container {
  display: flex;
  /* justify-content: center; */
  align-items: flex-start;
  gap: 20px;
}
</style>
