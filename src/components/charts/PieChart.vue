<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300
})

const canvasRef = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const createChart = () => {
  if (!canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Détruire le graphique existant s'il y en a un
  if (chart) {
    chart.destroy()
  }

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: props.data.map(item => item.label),
      datasets: [{
        data: props.data.map(item => item.value),
        backgroundColor: props.data.map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right' as const
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  createChart()
}, { deep: true })
</script>

<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

