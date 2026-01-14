<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('items') }}</h2>
        <span v-if="items.length > 0" class="text-xs text-gray-400">({{ items.length }})</span>
      </div>
      <button
        @click="addItem"
        class="h-8 px-3 text-xs text-white rounded-lg flex items-center gap-1.5 transition-all font-medium bg-primary-600 hover:bg-primary-700 shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>{{ t('addItem') }}</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-gray-900 mb-1">{{ t('noItemsYet') }}</h3>
      <p class="text-xs text-gray-500 mb-4">{{ t('addFirstItem') }}</p>
      <button
        @click="addItem"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ t('addItem') }}
      </button>
    </div>

    <!-- Items Table -->
    <div v-else class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <!-- Table Header -->
      <div class="grid grid-cols-[auto_1fr_70px_80px_60px_80px_40px] gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide bg-gray-50 text-gray-500 border-b border-gray-200">
        <div class="w-6"></div>
        <div>{{ t('description') }}</div>
        <div class="text-right">{{ t('quantity') }}</div>
        <div class="text-right">{{ t('price') }}</div>
        <div class="text-right">{{ t('taxPercent') }}</div>
        <div class="text-right">{{ t('total') }}</div>
        <div></div>
      </div>

      <!-- Table Body -->
      <TransitionGroup name="list" tag="div">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          :class="[
            'grid grid-cols-[auto_1fr_70px_80px_60px_80px_40px] gap-2 px-3 py-2.5 items-center border-b border-gray-100 last:border-b-0 group transition-all',
            draggedIndex === index ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50/50',
            dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-t-primary-500' : ''
          ]"
          draggable="true"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver(index)"
          @drop="handleDrop(index)"
          @dragend="handleDragEnd"
        >
          <!-- Drag Handle -->
          <div
            class="w-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
            :title="t('dragToReorder')"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
          </div>

          <!-- Description -->
          <input
            v-model="item.description"
            type="text"
            :placeholder="t('itemDescription')"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />

          <!-- Quantity -->
          <input
            v-model.number="item.quantity"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            class="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all tabular-nums"
          />

          <!-- Price -->
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ currency }}</span>
            <input
              v-model.number="item.price"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              class="w-full border border-gray-200 rounded-lg pl-5 pr-2 py-2 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all tabular-nums"
            />
          </div>

          <!-- Tax -->
          <div class="relative">
            <input
              v-model.number="item.tax"
              type="number"
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
              class="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all tabular-nums pr-5"
            />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
          </div>

          <!-- Total -->
          <div class="text-sm font-semibold text-right tabular-nums text-gray-900">
            {{ currency }}{{ itemTotal(item).toFixed(2) }}
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-center">
            <div class="relative" @mouseenter="showActions = index" @mouseleave="showActions = null">
              <button
                class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-600"
                :title="t('remove')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              <!-- Actions Dropdown -->
              <div
                v-if="showActions === index"
                class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]"
              >
                <button
                  @click="duplicateItem(index); showActions = null"
                  class="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ t('duplicateItem') }}
                </button>
                <button
                  @click="removeItem(index); showActions = null"
                  class="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ t('remove') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Totals -->
      <div class="bg-gray-50 border-t border-gray-200 p-4 space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">{{ t('subtotal') }}</span>
          <span class="font-medium tabular-nums text-gray-700">{{ currency }}{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">{{ t('tax') }}</span>
          <span class="font-medium tabular-nums text-gray-700">{{ currency }}{{ totalTax.toFixed(2) }}</span>
        </div>
        <div class="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
          <span class="text-base font-semibold text-gray-900">{{ t('totalAmount') }}</span>
          <span class="text-lg font-bold tabular-nums text-primary-600">{{ currency }}{{ total.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInvoice } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'

const {
  invoice,
  currency,
  addItem,
  removeItem,
  duplicateItem,
  reorderItems,
  itemTotal,
  subtotal,
  totalTax,
  total
} = useInvoice()
const { t } = useTranslations()

const items = computed(() => invoice.value.items)

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const showActions = ref<number | null>(null)

const handleDragStart = (index: number, event: DragEvent) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (index: number) => {
  dragOverIndex.value = index
}

const handleDrop = (index: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    reorderItems(draggedIndex.value, index)
  }
  handleDragEnd()
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<style scoped>
/* Hide number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

/* List transitions */
.list-enter-active {
  animation: fadeSlideIn 0.3s ease-out;
}

.list-leave-active {
  animation: fadeSlideOut 0.2s ease-in;
}

.list-move {
  transition: transform 0.3s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
