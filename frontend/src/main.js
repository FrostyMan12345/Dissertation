import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import vue3StarRatings from 'vue3-star-ratings'

const app = createApp(App)

app.use(router)
app.component('vue3-star-ratings', vue3StarRatings)
app.mount('#app')
