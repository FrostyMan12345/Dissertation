<template>
  <h2>Ratings Given</h2>
  <div class="horizontal-container">
    <VueUiSparkline :dataset="dataset" :config="lineConfig" />
    <h3>Average Rating: {{ average }}</h3>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { VueUiSparkline } from 'vue-data-ui'

const props = defineProps({
  dataset: [Object],
  average: Number,
})

const lineConfig = reactive({
  type: 'line',
  downsample: { threshold: 500 },
  style: {
    backgroundColor: '#FFFFFF05',
    fontFamily: 'inherit',
    chartWidth: 290,
    scaleMin: null,
    scaleMax: null,
    padding: { top: 12, right: 0, bottom: 3, left: 0 },
    animation: { show: true, animationFrames: 360 },
    line: { color: '#5f8bee', strokeWidth: 3, smooth: true },
    bar: { borderRadius: 3, color: '#5f8bee' },
    zeroLine: { color: '#505050', strokeWidth: 1 },
    plot: { show: true, radius: 4, stroke: '#FFFFFF', strokeWidth: 1 },
    verticalIndicator: { show: true, strokeWidth: 1.5, color: '#5f8bee', strokeDasharray: 3 },
    dataLabel: {
      show: true,
      offsetX: 0,
      offsetY: 0,
      position: 'left',
      fontSize: 48,
      bold: true,
      color: '#CCCCCC',
      roundingValue: 1,
      valueType: 'latest',
      prefix: '',
      suffix: ' Games',
    },
    title: {
      show: true,
      textAlign: 'left',
      color: '#000000',
      fontSize: 16,
      bold: true,
      text: 'Rating',
    },
    tooltip: {
      show: false,
      fontSize: 14,
      color: '#CCCCCC',
      backgroundColor: '#1A1A1A',
      offsetY: 0,
      borderWidth: 0,
      borderColor: '#3A3A3A',
      borderRadius: 2,
      backgroundOpacity: 100,
    },
    area: { show: true, useGradient: true, opacity: 30, color: '#5f8bee' },
  },
})
</script>

<style scoped>
.horizontal-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>
