<template>
  <div class="landing-page">
    <div class="left-landing">
      <div>
        <h1>Welcome To GameRecords</h1>
        <h3>The all-in-one website for reviewing and ranking your favourite games!</h3>
        <h3>Login and create some records to get personalised recommednations</h3>
      </div>
    </div>
    <div class="right-landing">
      <div class="container">
        <h3>Login and create some records to recieve personalised recommendtaions</h3>
        <button class="normal-button" @click="goToLogin">Login/Register</button>
      </div>
      <div class="container">
        <h3>View the community rankings</h3>
        <button class="normal-button" @click="goToLeaderboard">See The Rankings</button>
      </div>
    </div>
  </div>
</template>

<script setup>
function goToLogin() {
  window.location.href = '/login'
}

function goToLeaderboard() {
  window.location.href = '/main'
}
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.left-landing {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 50%;
  text-align: center;
  /* height: 1vw; */
}

.right-landing {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 50%;
  background-color: rgba(0, 42, 255, 0.301);
  border: solid 1px blue;
  /* height: 1vw; */
}

button {
  width: 50%;
  height: 75px;
  font-size: 30px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

h1 {
  color: rgb(0, 4, 255);
}
</style>
