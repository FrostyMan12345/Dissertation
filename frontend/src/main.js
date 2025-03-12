import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import VueAwesomePaginate from 'vue-awesome-paginate'
import 'vue-awesome-paginate/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import vue3StarRatings from 'vue3-star-ratings'

const app = createApp(App)

app.use(router)
app.use(VueAwesomePaginate)
app.component('vue3-star-ratings', vue3StarRatings)
app.mount('#app')
