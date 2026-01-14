<template>
  <header class="border-b border-gray-200 bg-white flex-shrink-0 sticky top-0 z-40">
    <div class="px-4 lg:px-6">
      <div class="flex justify-between items-center h-14">
        <!-- Logo and Title -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-base font-semibold text-gray-900 tracking-tight">
              {{ t('invoiceGenerator') }}
            </h1>
            <p class="text-xs text-gray-500 hidden sm:block">{{ t('createProfessionalInvoices') }}</p>
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
          <!-- Currency Selector -->
          <div class="relative">
            <select
              v-model="currency"
              class="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:bg-gray-50 transition-all cursor-pointer appearance-none"
              aria-label="Select currency"
            >
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="£">£ GBP</option>
              <option value="¥">¥ JPY</option>
              <option value="CHF">CHF</option>
            </select>
            <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Language Selector -->
          <div class="relative">
            <select
              :value="language"
              @change="setLanguage(($event.target as HTMLSelectElement).value)"
              class="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:bg-gray-50 transition-all cursor-pointer appearance-none"
              aria-label="Select language"
            >
              <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
                {{ lang.flag }} {{ lang.code }}
              </option>
            </select>
            <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Divider -->
          <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

          <!-- History Button -->
          <button
            @click="$emit('openHistory')"
            class="h-9 px-3 text-sm rounded-lg flex items-center gap-2 transition-all font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            :aria-label="t('openHistory')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="hidden sm:inline">{{ t('history') }}</span>
            <span v-if="historyCount > 0" class="hidden sm:flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
              {{ historyCount }}
            </span>
          </button>

          <!-- Save Button -->
          <button
            @click="handleSave"
            :disabled="!canSave"
            class="h-9 px-3 text-sm rounded-lg flex items-center gap-2 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            :class="canSave ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-400'"
            :aria-label="t('save')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="hidden sm:inline">{{ t('save') }}</span>
          </button>

          <!-- Clear Button -->
          <button
            @click="handleClear"
            class="h-9 px-3 text-sm rounded-lg flex items-center gap-2 transition-all font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            :aria-label="t('clearInvoice')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="hidden sm:inline">{{ t('clear') }}</span>
          </button>

          <!-- Export Button (Primary CTA) -->
          <button
            @click="$emit('openExport')"
            :disabled="!canSave || isExporting"
            class="h-9 px-4 text-sm text-white rounded-lg flex items-center gap-2 transition-all font-medium bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-600 shadow-sm"
            :aria-label="t('openExport')"
          >
            <svg v-if="isExporting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ t('export') }}</span>
            <svg v-if="!isExporting" class="w-3 h-3 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Preview Toggle -->
    <div class="lg:hidden border-t border-gray-200 px-4 py-2 flex gap-2">
      <button
        @click="$emit('setMobileView', 'form')"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all',
          mobileView === 'form'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ t('form') }}
      </button>
      <button
        @click="$emit('setMobileView', 'preview')"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all',
          mobileView === 'preview'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ t('preview') }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useInvoice } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'
import { useToast } from '../composables/useToast'

const props = defineProps<{
  historyCount: number
  isExporting: boolean
  mobileView: 'form' | 'preview'
}>()

const emit = defineEmits<{
  openHistory: []
  openExport: []
  setMobileView: [view: 'form' | 'preview']
}>()

const { currency, language, setLanguage, canDownload, saveCurrentInvoice, clearInvoice } = useInvoice()
const { t, availableLanguages } = useTranslations()
const { success, error } = useToast()

const canSave = canDownload

const handleSave = () => {
  if (saveCurrentInvoice()) {
    success(t.value('invoiceSaved'))
  } else {
    error(t.value('fillRequiredFields'))
  }
}

const handleClear = () => {
  if (confirm(t.value('confirmClearInvoice'))) {
    clearInvoice()
  }
}
</script>
