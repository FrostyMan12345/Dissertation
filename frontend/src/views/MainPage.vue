<template>
  <div class="horizontal-container">
    <Leaderboard />
  </div>
</template>

<script setup>
import Leaderboard from '@/components/Leaderboard.vue'
document.title = 'Rankings - GameRecords'
</script>

<style scoped>
.horizontal-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}
</style>
