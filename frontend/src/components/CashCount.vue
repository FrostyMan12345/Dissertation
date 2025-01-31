<template>
  <div>
    <div class="horizontal-container" v-for="currency in currencies" :key="currency.value">
      <button class="subtract-btn" @click="subtractCurrency(currency.value)">
        - {{ currency.label }}
      </button>
      <button class="add-btn" @click="addCurrency(currency.value)">+ {{ currency.label }}</button>
      <h3>
        Number: {{ currency.count }} | Total:
        {{
          currency.value * currency.count >= 100
            ? '£' + (currency.value * currency.count) / 100
            : currency.value * currency.count + 'p'
        }}
      </h3>
      <button class="reset-btn" @click="resetCurrency(currency.value)">Reset</button>
    </div>

    <!-- Display the Total -->
    <div class="horizontal-container total-display">
      <h2>Total: £{{ total }}</h2>
      <button style="width: 75px" class="reset-btn total-reset" @click="resetAll">Reset All</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

// Define reactive currency data
const currencies = reactive([
  { value: 1, label: '1p', count: 0 },
  { value: 2, label: '2p', count: 0 },
  { value: 5, label: '5p', count: 0 },
  { value: 10, label: '10p', count: 0 },
  { value: 20, label: '20p', count: 0 },
  { value: 50, label: '50p', count: 0 },
  { value: 100, label: '£1', count: 0 },
  { value: 200, label: '£2', count: 0 },
  { value: 500, label: '£5', count: 0 },
  { value: 1000, label: '£10', count: 0 },
  { value: 2000, label: '£20', count: 0 },
  { value: 5000, label: '£50', count: 0 },
])

// Functions to manage currency counts
function addCurrency(value) {
  const currency = currencies.find((c) => c.value === value)
  if (currency) currency.count++
}

function subtractCurrency(value) {
  const currency = currencies.find((c) => c.value === value)
  if (currency && currency.count > 0) currency.count--
}

function resetCurrency(value) {
  const currency = currencies.find((c) => c.value === value)
  if (currency) currency.count = 0
}

function resetAll() {
  currencies.forEach((currency) => (currency.count = 0))
}

// Compute the total dynamically
const total = computed(() => {
  return currencies.reduce((sum, currency) => sum + currency.value * currency.count, 0) / 100 // Convert to pounds
})
</script>

<style>
.horizontal-container {
  gap: 10px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.total-display {
  margin-top: 20px;
}

.total-display h2 {
  font-weight: bold;
  color: #007bff;
}

.add-btn,
.subtract-btn,
.reset-btn,
.total-reset {
  border-radius: 8px;
  width: 70px;
  color: white;
  border: 1px solid;
}

.add-btn {
  background-color: blue;
  border-color: blue;
}

.subtract-btn {
  background-color: red;
  border-color: red;
}

.reset-btn,
.total-reset {
  background-color: gray;
  border-color: gray;
}
</style>
