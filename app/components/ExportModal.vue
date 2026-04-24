<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Modal -->
        <Transition name="scale">
          <div
            v-if="isOpen"
            class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <!-- Header -->
            <div class="px-6 py-5 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ t('exportAs') }}</h2>
                  <p class="text-sm text-gray-500 mt-0.5">Choose your preferred format</p>
                </div>
                <button
                  @click="$emit('close')"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                  :aria-label="t('closeExport')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Export Options -->
            <div class="p-6 space-y-3">
              <!-- PDF -->
              <button
                @click="handleExport('pdf')"
                :disabled="isExporting"
                class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <span class="text-base font-medium text-gray-900 block">PDF</span>
                  <span class="text-sm text-gray-500">{{ t('pdfDescription') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">Recommended</span>
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <!-- PNG -->
              <button
                @click="handleExport('png')"
                :disabled="isExporting"
                class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                  <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <span class="text-base font-medium text-gray-900 block">PNG (image)</span>
                  <span class="text-sm text-gray-500">Rasterized image of page 1</span>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Excel -->
              <button
                @click="handleExport('excel')"
                :disabled="isExporting"
                class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <span class="text-base font-medium text-gray-900 block">Excel (.xlsx)</span>
                  <span class="text-sm text-gray-500">{{ t('excelDescription') }}</span>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- CSV -->
              <button
                @click="handleExport('csv')"
                :disabled="isExporting"
                class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-200 transition-colors">
                  <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <span class="text-base font-medium text-gray-900 block">CSV</span>
                  <span class="text-sm text-gray-500">{{ t('csvDescription') }}</span>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- JSON -->
              <button
                @click="handleExport('json')"
                :disabled="isExporting"
                class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 transition-colors">
                  <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <span class="text-base font-medium text-gray-900 block">JSON</span>
                  <span class="text-sm text-gray-500">{{ t('jsonDescription') }}</span>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Invoice: {{ invoiceNumber }}</span>
                <span>Total: {{ currency }}{{ total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useInvoice } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'
import { useToast } from '../composables/useToast'

const props = defineProps<{
  isOpen: boolean
  isExporting: boolean
}>()

const emit = defineEmits<{
  close: []
  export: [format: 'pdf' | 'png' | 'excel' | 'csv' | 'json']
}>()

const { invoice, currency, total } = useInvoice()
const { t } = useTranslations()

const invoiceNumber = computed(() => invoice.value.number || 'No number')

const handleExport = (format: 'pdf' | 'png' | 'excel' | 'csv' | 'json') => {
  emit('export', format)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  transition: all 0.3s ease-out;
}

.scale-leave-active {
  transition: all 0.2s ease-in;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
