<script setup>
import { ref } from 'vue'

const login = ref(true)
const developer = ref(false)

function accountLogin(username, password) {}

function accountRegister(username, password) {
  // MongoClient.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  // .then(client => {
  //   console.log("Connected to MongoDB");

  //   // Access the database and collections
  //   const db = client.db("Third_Year_Project");
  //   const collection = db.collection("Users");

  //   // Perform database operations
  //   collection.find({}).toArray((err, data) => {
  //     if (err) throw err;
  //     console.log(data);
  //   });

  //   // Close the connection after use
  //   client.close();
  // })
  // .catch(err => {
  //   console.error("Error connecting to MongoDB:", err);
  // });
  console.log(process.env.MONGODB_DATABASE)
}

function toggleLogin() {
  login.value = !login.value
}

function toggleDeveloper() {
  developer.value = !developer.value
}
</script>

<template>
  <div class="container">
    <h1 v-if="login">Login</h1>
    <h1 v-else>Register</h1>

    <hr />

    <div class="horizontal-container">
      <h3>Username:</h3>
      <input type="text" v-model="username" placeholder="Username" />
    </div>
    <div class="horizontal-container">
      <h3>Password:</h3>
      <input type="text" v-model="password" placeholder="Password" />
    </div>

    <button v-if="login" @click="accountLogin(username, password)">Login</button>
    <button v-else @click="accountRegister(username, password)">Register</button>

    <hr />

    <button v-if="login" @click="toggleLogin">Register</button>
    <button v-else @click="toggleLogin">Login</button>
    <button v-if="!developer" @click="toggleDeveloper">Developer?</button>
    <button v-else @click="toggleDeveloper">Not Developer?</button>
  </div>
</template>

<style scoped>
hr {
  color: solid black;
  width: 75%;
  height: 10px;
  border-radius: 10px;
  border-color: black;
}

.center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  background-color: black;
  padding: 20px 20px 20px 20px;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

input {
  margin: 10px;
  border: 1px solid black;
  background-color: rgb(60, 60, 60);
  color: white;
  padding: 10px;
  border-radius: 8px;
  width: 50vw;
}

h3 {
  margin: 0;
  width: 120px;
  text-align: left;
}

.horizontal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

button {
  color: white;
  background-color: rgb(60, 60, 60);
  border: 1px solid black;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  width: 25vw;
  margin-top: 25px;
}
</style>
