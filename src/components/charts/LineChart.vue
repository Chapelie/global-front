<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  data: Array<{
    [key: string]: any
  }>
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor?: string
    borderWidth?: number
    fill?: boolean
    tension?: number
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
    type: 'line',
    data: {
      labels: props.labels,
      datasets: props.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          grid: {
            color: '#f3f4f6'
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

