<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
        @click.self="$emit('close')"
      >
        <div class="bg-white shadow-xl w-80">
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

          <!-- Features -->
          <div class="p-2 max-h-64 overflow-y-auto">
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
import { useChaosMode, type ChaosConfig, type ChaosIntensity } from '../composables/useChaosMode'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
  apply: []
}>()

const { chaosConfig } = useChaosMode()

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
]
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
