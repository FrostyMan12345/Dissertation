<template>
  <div class="horizontal-container">
    <Leaderboard />
  </div>
</template>

<script setup>
import Leaderboard from '@/components/Leaderboard.vue'
</script>

<style scoped>
.horizontal-container {
  display: flex;
  /* justify-content: center; */
  align-items: flex-start;
  gap: 20px;
}
</style>
