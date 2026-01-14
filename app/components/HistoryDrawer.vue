<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ t('invoiceHistory') }}</h2>
            <p class="text-sm text-gray-500">{{ invoiceHistory.length }} {{ t('savedInvoices') }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            :aria-label="t('closeHistory')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="px-6 py-3 border-b border-gray-100">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('searchInvoices')"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <!-- Invoice List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Empty State -->
          <div v-if="invoiceHistory.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center">
            <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-medium text-gray-900 mb-1">{{ t('noInvoicesSaved') }}</h3>
            <p class="text-sm text-gray-500">{{ t('saveFirstInvoice') }}</p>
          </div>

          <!-- Invoice Items -->
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="savedInvoice in filteredInvoices"
              :key="savedInvoice.id"
              class="group px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              @click="handleLoad(savedInvoice)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-base font-semibold text-gray-900 truncate">
                      {{ savedInvoice.invoice.number }}
                    </span>
                    <span class="text-base font-medium text-primary-600 tabular-nums">
                      {{ currency }}{{ savedInvoice.totalAmount.toFixed(2) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 truncate mb-1">
                    {{ savedInvoice.customerName }}
                  </p>
                  <div class="flex items-center gap-2 text-xs text-gray-400">
                    <span>{{ formatDate(savedInvoice.savedAt) }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{{ savedInvoice.invoice.items.length }} items</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="handleDuplicate(savedInvoice)"
                    class="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
                    :title="t('duplicate')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    @click.stop="handleDelete(savedInvoice.id)"
                    class="p-2 rounded-lg hover:bg-red-100 transition-colors text-gray-500 hover:text-red-600"
                    :title="t('deleteInvoice')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-if="searchQuery && filteredInvoices.length === 0" class="p-8 text-center">
              <p class="text-sm text-gray-500">No invoices match "{{ searchQuery }}"</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInvoice, type SavedInvoice } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'
import { useToast } from '../composables/useToast'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  invoiceHistory,
  currency,
  loadInvoice,
  duplicateInvoice,
  deleteInvoiceFromHistory,
  formatDate
} = useInvoice()
const { t } = useTranslations()
const { success } = useToast()

const searchQuery = ref('')

const filteredInvoices = computed(() => {
  if (!searchQuery.value.trim()) {
    return invoiceHistory.value
  }

  const query = searchQuery.value.toLowerCase()
  return invoiceHistory.value.filter(inv =>
    inv.invoice.number.toLowerCase().includes(query) ||
    inv.customerName.toLowerCase().includes(query)
  )
})

const handleLoad = (savedInvoice: SavedInvoice) => {
  loadInvoice(savedInvoice)
  success(t.value('invoiceLoaded'))
  emit('close')
}

const handleDuplicate = (savedInvoice: SavedInvoice) => {
  duplicateInvoice(savedInvoice)
  success(t.value('invoiceDuplicated'))
  emit('close')
}

const handleDelete = (id: string) => {
  if (confirm(t.value('confirmDeleteInvoice'))) {
    deleteInvoiceFromHistory(id)
    success(t.value('invoiceDeleted'))
  }
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

.slide-enter-active {
  transition: transform 0.3s ease-out;
}

.slide-leave-active {
  transition: transform 0.2s ease-in;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
