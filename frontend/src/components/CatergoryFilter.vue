<template>
  <!-- {{ advancedFilters }}
  {{ ratingRange }}
  {{ revisitRange }}
  {{ recordsRange }}
  {{ hoursRange }} -->
  <div class="criteria-container">
    <h4>Advanced Filter:</h4>
    <Multiselect
      v-model="genreFilter"
      mode="tags"
      style="margin-bottom: 10px"
      :options="genres.map((genre) => genre.name)"
    />
    <!-- <select style="gap: 10px" v-model="genreFilter" multiple>
      <option disabled value="">Select one</option>
      <option>None</option>
      <option v-for="genre in genres">
        {{ genre.name }}
      </option>
    </select> -->
    <!-- {{ genreFilter }}no -->

    <Slider id="ratings" v-model="ratingRange" :min="0" :max="5" :step="-1" :showTooltip="'drag'" />
    <label for="ratings">Ratings: {{ ratingRange[0] }} - {{ ratingRange[1] }}</label>

    <Slider
      id="hoursPlayed"
      v-model="hoursRange"
      :min="0"
      :max="maxHours"
      :step="-1"
      :showTooltip="'drag'"
    />
    <label for="hoursPlayed">Hours Played: {{ hoursRange[0] }} - {{ hoursRange[1] }}</label>

    <Slider
      id="revists"
      v-model="revisitRange"
      :min="0"
      :max="maxRevisits"
      :step="-1"
      :showTooltip="'drag'"
    />
    <label for="revists">Revisits: {{ revisitRange[0] }} - {{ revisitRange[1] }}</label>

    <Slider id="records" v-model="recordRange" :min="0" :max="maxRecords" :showTooltip="'drag'" />
    <label for="records">Records: {{ recordRange[0] }} - {{ recordRange[1] }}</label>
    <hr />
    <button
      class="normal-button"
      style="justify-self: center; align-self: centre"
      @click="setupAdvancedFilter"
    >
      Apply Filter
    </button>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, onMounted } from 'vue'
import Slider from '@vueform/slider'
import '@vueform/slider/themes/default.css'
import genres from '@/GenreList'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
  maxHours: { type: Number },
  maxRecords: { type: Number },
  maxRevisits: { type: Number },
  initialFilters: {
    type: {
      genres: { type: [String], default: [] },
      ratingRange: { type: [Number], defualt: [0, 5] },
      revisitRange: [Number],
      recordRange: [Number],
      hoursRange: [Number],
    },
  },
})
const emit = defineEmits(['update-leaderboard'])
const advancedFilters = ref(JSON.parse(sessionStorage.getItem('advancedFilters')) || {})
const currentCriteria = ref(props.rankValue)
const chosenCriteria = ref('')
console.log(advancedFilters)
const ratingRange = ref([
  advancedFilters.value?.ratingRange?.[0] ?? 0,
  advancedFilters.value?.ratingRange?.[1] ?? 5,
])
const recordRange = ref([
  advancedFilters.value?.recordRange?.[0] ?? 0,
  advancedFilters.value?.recordRange?.[1] ?? props.maxRecords,
])
const hoursRange = ref([
  advancedFilters.value?.hoursRange?.[0] ?? 0,
  advancedFilters.value?.hoursRange?.[1] ?? props.maxHours,
])
const revisitRange = ref([
  advancedFilters.value?.revisitRange?.[0] ?? 0,
  advancedFilters.value?.revisitRange?.[1] ?? props.maxRevisits,
])
const genreFilter = ref(advancedFilters.value?.genres ?? [])

function setupAdvancedFilter() {
  const filterData = {}
  const toSave = {}
  if (genreFilter.value != []) {
    filterData['genres.name'] = { $in: genreFilter.value }
    toSave.genres = genreFilter.value
  }
  if (!(hoursRange.value[0] == 0 && hoursRange.value[1] == props.maxHours)) {
    filterData.average_hours_played = { $gte: hoursRange.value[0], $lte: hoursRange.value[1] }
    toSave.hoursRange = hoursRange.value
  }
  if (!(recordRange.value[0] == 0 && recordRange.value[1] == props.maxRecords)) {
    filterData.records_made = { $gte: recordRange.value[0], $lte: recordRange.value[1] }
    toSave.recordRange = recordRange.value
  }
  if (!(ratingRange.value[0] == 0 && ratingRange.value[1] == 5)) {
    filterData.average_rating = { $gte: ratingRange.value[0], $lte: ratingRange.value[1] }
    toSave.ratingRange = ratingRange.value
  }
  if (!(revisitRange.value[0] == 0 && revisitRange.value[1] == props.maxRevisits)) {
    filterData.average_times_played = { $gte: revisitRange.value[0], $lte: revisitRange.value[1] }
    toSave.revisitRange = revisitRange.value
  }
  if (Object.entries(filterData).length == 0) {
    return
  } else {
    console.log(toSave)
    sessionStorage.setItem('advancedFilters', JSON.stringify(toSave))
    emit('update-leaderboard', filterData)
  }
}

// onMounted(() => {
//   chosenCriteria.value = currentCriteria.value
// })
</script>

<style scoped>
.criteria-container {
  border: 1px solid blue;
  background-color: aliceblue;
  width: max-content;
  height: max-content;
  padding: 10px 10px 10px 10px;
  display: flex;
  flex-direction: column;
}

.horizontal-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>
