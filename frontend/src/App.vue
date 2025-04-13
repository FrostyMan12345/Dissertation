<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <div class="app-wrapper">
    <Header />
    <div class="main">
      <RouterView />
      <a class="link" href="http://www.freepik.com">Background Designed by starline / Freepik</a>
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background-image: url('./assets/23790.jpg');
  background-size: cover;
  width: 100vw;
  height: 100vh;
}

.main {
  width: 100%;
  flex-grow: 1;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0);
  /* transition: background-color 0.5 ease; */
}

.link {
  position: fixed;
  bottom: 10px;
  left: 10px;
  font-size: 12px;
  color: #888;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 8px;
  border-radius: 6px;
  z-index: 999;
}
</style>
