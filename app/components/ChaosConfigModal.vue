<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
        @click.self="$emit('close')"
      >
        <div class="bg-white shadow-xl w-96">
          <!-- Header -->
          <div class="p-4 border-b border-stone-200 flex items-center justify-between">
            <span class="text-sm font-medium">Chaos Mode</span>
            <button @click="$emit('close')" class="text-stone-400 hover:text-stone-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Intensity -->
          <div class="p-4 border-b border-stone-100">
            <div class="text-[10px] uppercase tracking-wider text-stone-400 mb-3">Intensity</div>
            <div class="flex gap-1">
              <button
                v-for="level in intensityLevels"
                :key="level.value"
                @click="chaosConfig.intensity = level.value"
                :class="[
                  'flex-1 py-2 text-xs font-medium transition-colors',
                  chaosConfig.intensity === level.value
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                ]"
              >
                {{ level.label }}
              </button>
            </div>
          </div>

          <!-- Features section header -->
          <div class="px-4 pt-3 pb-1 flex items-center justify-between">
            <div class="text-[10px] uppercase tracking-wider text-stone-400">Features</div>
            <button
              @click="toggleAll"
              class="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
            >
              {{ allSelected ? 'Deselect all' : 'Select all' }}
            </button>
          </div>

          <!-- Features list with scroll indicator -->
          <div class="relative">
            <div
              ref="scrollContainer"
              @scroll="updateScrollState"
              class="px-2 pb-2 max-h-96 overflow-y-auto"
            >
              <label
                v-for="feature in features"
                :key="feature.key"
                class="flex items-center gap-3 px-2 py-2 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  v-model="chaosConfig[feature.key]"
                  class="w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500 focus:ring-offset-0"
                />
                <div class="flex-1 min-w-0">
                  <span class="text-sm text-stone-700 block">{{ feature.label }}</span>
                  <span class="text-[10px] text-stone-400 block truncate">{{ feature.description }}</span>
                </div>
              </label>
            </div>
            <!-- Scroll fade indicator -->
            <div
              v-if="canScrollDown"
              class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"
            />
          </div>

          <!-- Footer -->
          <div class="p-3 border-t border-stone-100 flex gap-2">
            <button
              @click="$emit('close')"
              class="flex-1 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="$emit('apply')"
              class="flex-1 py-2 text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              Unleash Chaos
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChaosMode, type ChaosConfig, type ChaosIntensity } from '../composables/useChaosMode'

const props = defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
  apply: []
}>()

const { chaosConfig } = useChaosMode()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollDown = ref(false)

const updateScrollState = () => {
  if (scrollContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 10
  }
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    updateScrollState()
  }
})

onMounted(() => {
  updateScrollState()
})

const intensityLevels: { value: ChaosIntensity; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'extreme', label: 'Extreme' },
]

const features: { key: keyof Omit<ChaosConfig, 'intensity'>; label: string; description: string }[] = [
  { key: 'enableTaxChaos', label: 'Crazy Taxes', description: 'Negative, >100%, weird decimals' },
  { key: 'enableNegativeAmounts', label: 'Negative Amounts', description: 'Negative quantities and prices' },
  { key: 'enableTotalMismatch', label: 'Mismatched Totals', description: 'Totals that don\'t add up' },
  { key: 'enableEmojiInjection', label: 'Emoji Injection', description: 'Random emojis everywhere' },
  { key: 'enableDateChaos', label: 'Date Chaos', description: 'Due dates before invoice dates' },
  { key: 'enableInvalidEmails', label: 'Invalid Emails', description: 'Broken email formats' },
  { key: 'enableCrazyInvoiceNumbers', label: 'Crazy Invoice Numbers', description: 'SQL injection, special chars' },
  { key: 'enableBadScanEffect', label: 'Bad Scan Effect', description: 'Randomized gradient overlay on PDF' },
  { key: 'enableNulByteInjection', label: 'NUL Byte Injection', description: 'Inserts \\0 bytes into text fields (OCR pipeline torture test)' },
]

const allSelected = computed(() => features.every(f => chaosConfig.value[f.key]))

const toggleAll = () => {
  const newValue = !allSelected.value
  features.forEach(f => {
    chaosConfig.value[f.key] = newValue
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
