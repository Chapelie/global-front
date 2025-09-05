<template>
  <div class="signature-pad-container">
    <div class="signature-header">
      <h3 class="signature-title">
        {{ title }}
      </h3>
      <p class="signature-description">
        {{ description }}
      </p>
    </div>
    
    <div class="signature-canvas-container">
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="signature-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="stopDrawing"
      ></canvas>
    </div>
    
    <div class="signature-controls">
      <div class="controls-row">
        <label class="control-item">
          <input
            type="color"
            v-model="strokeColor"
            class="color-input"
          />
          <span class="control-label">Couleur</span>
        </label>
        
        <label class="control-item">
          <input
            type="range"
            v-model="strokeWidth"
            min="1"
            max="10"
            class="range-input"
          />
          <span class="control-label">Épaisseur</span>
        </label>
      </div>
      
      <div class="button-group">
        <button
          @click="clearCanvas"
          class="btn btn-secondary"
        >
          Effacer
        </button>
        
        <button
          @click="undo"
          :disabled="!canUndo"
          class="btn btn-primary"
          :class="{ 'btn-disabled': !canUndo }"
        >
          Annuler
        </button>
        
        <button
          @click="saveSignature"
          :disabled="!hasSignature"
          class="btn btn-success"
          :class="{ 'btn-disabled': !hasSignature }"
        >
          Valider la signature
        </button>
      </div>
    </div>
    
    <div v-if="signatureData" class="signature-preview">
      <h4 class="preview-title">Aperçu de la signature :</h4>
      <img :src="signatureData" alt="Signature" class="preview-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

interface Props {
  title?: string
  description?: string
  canvasWidth?: number
  canvasHeight?: number
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Signature électronique',
  description: 'Signez dans la zone ci-dessous en utilisant votre souris ou votre doigt',
  canvasWidth: 400,
  canvasHeight: 200,
  required: true
})

const emit = defineEmits<{
  signature: [signatureData: string]
  clear: []
}>()

const canvasRef = ref<HTMLCanvasElement>()
const canvas = ref<CanvasRenderingContext2D>()
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const strokeColor = ref('#000000')
const strokeWidth = ref(3)
const signatureData = ref('')
const undoStack = ref<string[]>([])
const canUndo = ref(false)
const hasSignature = ref(false)

// Initialisation du canvas
onMounted(() => {
  if (canvasRef.value) {
    canvas.value = canvasRef.value.getContext('2d')!
    setupCanvas()
  }
})

const setupCanvas = () => {
  if (!canvas.value) return
  
  canvas.value.fillStyle = '#ffffff'
  canvas.value.fillRect(0, 0, props.canvasWidth, props.canvasHeight)
  canvas.value.strokeStyle = strokeColor.value
  canvas.value.lineWidth = strokeWidth.value
  canvas.value.lineCap = 'round'
  canvas.value.lineJoin = 'round'
}

// Gestion des événements de dessin
const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true
  const rect = canvasRef.value!.getBoundingClientRect()
  lastX.value = e.clientX - rect.left
  lastY.value = e.clientY - rect.top
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !canvas.value) return
  
  const rect = canvasRef.value!.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  
  canvas.value.beginPath()
  canvas.value.moveTo(lastX.value, lastY.value)
  canvas.value.lineTo(currentX, currentY)
  canvas.value.stroke()
  
  lastX.value = currentX
  lastY.value = currentY
}

const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    saveToUndoStack()
    hasSignature.value = true
  }
}

// Gestion du tactile
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvasRef.value!.getBoundingClientRect()
  lastX.value = touch.clientX - rect.left
  lastY.value = touch.clientY - rect.top
  isDrawing.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  if (!isDrawing.value || !canvas.value) return
  
  const touch = e.touches[0]
  const rect = canvasRef.value!.getBoundingClientRect()
  const currentX = touch.clientX - rect.left
  const currentY = touch.clientY - rect.top
  
  canvas.value.beginPath()
  canvas.value.moveTo(lastX.value, lastY.value)
  canvas.value.lineTo(currentX, currentY)
  canvas.value.stroke()
  
  lastX.value = currentX
  lastY.value = currentY
}

// Gestion de l'historique
const saveToUndoStack = () => {
  if (canvasRef.value) {
    const imageData = canvasRef.value.toDataURL()
    undoStack.value.push(imageData)
    canUndo.value = undoStack.value.length > 0
  }
}

const undo = () => {
  if (undoStack.value.length > 0) {
    undoStack.value.pop()
    if (undoStack.value.length > 0) {
      loadFromImageData(undoStack.value[undoStack.value.length - 1])
    } else {
      setupCanvas()
      hasSignature.value = false
    }
    canUndo.value = undoStack.value.length > 0
  }
}

const loadFromImageData = (imageData: string) => {
  const img = new Image()
  img.onload = () => {
    if (canvas.value && canvasRef.value) {
      canvas.value.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
      canvas.value.drawImage(img, 0, 0)
    }
  }
  img.src = imageData
}

// Contrôles
const clearCanvas = () => {
  if (canvas.value) {
    canvas.value.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
    setupCanvas()
    undoStack.value = []
    canUndo.value = false
    hasSignature.value = false
    signatureData.value = ''
    emit('clear')
  }
}

const saveSignature = () => {
  if (canvasRef.value && hasSignature.value) {
    signatureData.value = canvasRef.value.toDataURL('image/png')
    emit('signature', signatureData.value)
  }
}

// Surveiller les changements de couleur et d'épaisseur
watch([strokeColor, strokeWidth], () => {
  if (canvas.value) {
    canvas.value.strokeStyle = strokeColor.value
    canvas.value.lineWidth = strokeWidth.value
  }
})
</script>

<style scoped>
.signature-pad-container {
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.signature-header {
  margin-bottom: 1rem;
}

.signature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.signature-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.signature-canvas-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.signature-canvas {
  border: 2px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: crosshair;
  background-color: #ffffff;
  touch-action: none;
}

.signature-controls {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-item {
  display: flex;
  align-items: center;
}

.color-input {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}

.control-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.range-input {
  width: 5rem;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  appearance: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background-color: #f97316;
  border-radius: 50%;
  cursor: pointer;
}

.range-input::-moz-range-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background-color: #f97316;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: none;
  cursor: pointer;
}

.btn:hover:not(.btn-disabled) {
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6b7280;
  color: #ffffff;
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: #4b5563;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: #2563eb;
}

.btn-success {
  background-color: #10b981;
  color: #ffffff;
}

.btn-success:hover:not(.btn-disabled) {
  background-color: #059669;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-disabled:hover {
  transform: none;
}

.signature-preview {
  margin-top: 1rem;
  text-align: center;
}

.preview-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.preview-image {
  max-width: 20rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .signature-pad-container {
    padding: 1rem;
  }
  
  .controls-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .button-group {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

