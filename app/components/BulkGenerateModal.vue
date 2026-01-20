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
            <span class="text-sm font-medium">Bulk Generate</span>
            <button @click="$emit('close')" class="text-stone-400 hover:text-stone-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 space-y-4">
            <!-- Count -->
            <div>
              <div class="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Number of Invoices</div>
              <div class="flex gap-1">
                <button
                  v-for="count in countOptions"
                  :key="count"
                  @click="options.count = count"
                  :class="[
                    'flex-1 py-2 text-sm font-medium transition-colors',
                    options.count === count
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:bg-stone-100'
                  ]"
                >
                  {{ count }}
                </button>
              </div>
            </div>

            <!-- Prefix -->
            <div>
              <div class="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Invoice Number Prefix</div>
              <input
                v-model="options.prefix"
                type="text"
                placeholder="TEST-"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border border-stone-200 focus:border-stone-900 focus:ring-0 px-3 py-2"
              />
              <div class="text-[10px] text-stone-400 mt-1">
                Preview: {{ options.prefix }}001, {{ options.prefix }}002, ...
              </div>
            </div>

            <!-- Date Range -->
            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="options.useDateRange"
                  class="w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <span class="text-sm text-stone-700">Spread across date range</span>
              </label>

              <div v-if="options.useDateRange" class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">Start Date</label>
                  <input
                    v-model="options.startDate"
                    type="date"
                    class="w-full text-sm text-stone-900 border border-stone-200 focus:border-stone-900 focus:ring-0 px-2 py-1.5"
                  />
                </div>
                <div>
                  <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">End Date</label>
                  <input
                    v-model="options.endDate"
                    type="date"
                    class="w-full text-sm text-stone-900 border border-stone-200 focus:border-stone-900 focus:ring-0 px-2 py-1.5"
                  />
                </div>
              </div>
            </div>

            <!-- Chaos Settings Note -->
            <div class="bg-stone-50 p-3 text-xs text-stone-500">
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Uses current Chaos Mode settings. Configure chaos features before generating.</span>
              </div>
            </div>
          </div>

          <!-- Progress -->
          <div v-if="isGenerating" class="px-4 pb-4">
            <div class="bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                class="bg-stone-900 h-full transition-all duration-150"
                :style="{ width: `${(progress.current / progress.total) * 100}%` }"
              />
            </div>
            <div class="text-xs text-stone-500 mt-1 text-center">
              Generating {{ progress.current }} of {{ progress.total }}...
            </div>
          </div>

          <!-- Footer -->
          <div class="p-3 border-t border-stone-100 flex gap-2">
            <button
              @click="$emit('close')"
              :disabled="isGenerating"
              class="flex-1 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="handleGenerate"
              :disabled="isGenerating || !options.prefix"
              class="flex-1 py-2 text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg v-if="isGenerating" class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ isGenerating ? 'Generating...' : `Generate ${options.count} Invoices` }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useBulkGeneration } from '../composables/useBulkGeneration'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  generated: [count: number]
}>()

const { isGenerating, progress, generateBulkInvoices } = useBulkGeneration()

const countOptions = [5, 10, 25, 50, 100]

// Get dates for default range (last 6 months)
const today = new Date()
const sixMonthsAgo = new Date(today)
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

const options = reactive({
  count: 10,
  prefix: 'TEST-',
  useDateRange: false,
  startDate: sixMonthsAgo.toISOString().split('T')[0],
  endDate: today.toISOString().split('T')[0],
})

const handleGenerate = async () => {
  const invoices = await generateBulkInvoices(options)
  emit('generated', invoices.length)
  emit('close')
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
