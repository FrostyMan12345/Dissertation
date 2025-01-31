<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <div class="app-wrapper">
    <Header />
    <div class="main">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100vw;
  height: 100vh;
}

.main {
  width: 100%;
  flex-grow: 1;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
