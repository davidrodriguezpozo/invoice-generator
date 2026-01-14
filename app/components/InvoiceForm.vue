<template>
  <div class="space-y-5">
    <!-- Logo Uploader -->
    <LogoUploader />

    <!-- Invoice Details -->
    <div class="space-y-2">
      <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('invoiceDetails') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Invoice Number -->
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-gray-600">
            {{ t('invoiceNumber') }}
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">#</span>
            <input
              v-model="invoice.number"
              type="text"
              :class="[
                'w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all',
                validationErrors.invoiceNumber
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
              ]"
              :placeholder="t('enterInvoiceNumber')"
            />
            <div v-if="validationErrors.invoiceNumber" class="absolute right-3 top-1/2 -translate-y-1/2">
              <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p v-if="validationErrors.invoiceNumber" class="text-xs text-red-500">{{ validationErrors.invoiceNumber }}</p>
        </div>

        <!-- Date -->
        <div class="space-y-1.5">
          <label class="flex items-center gap-2 text-xs font-medium text-gray-600">
            {{ t('date') }}
            <button
              @click="setToday"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              {{ t('today') }}
            </button>
          </label>
          <input
            v-model="invoice.date"
            type="date"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>

        <!-- Due Date -->
        <div class="space-y-1.5">
          <label class="flex items-center gap-2 text-xs font-medium text-gray-600">
            {{ t('dueDate') }}
            <button
              @click="setDueDateFromInvoiceDate(30)"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              +30d
            </button>
          </label>
          <input
            v-model="invoice.dueDate"
            type="date"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- From Section -->
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <button
        @click="fromCollapsed = !fromCollapsed"
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="text-left">
            <h3 class="text-sm font-medium text-gray-900">{{ t('from') }}</h3>
            <p v-if="invoice.from.businessName && fromCollapsed" class="text-xs text-gray-500 truncate max-w-[200px]">
              {{ invoice.from.businessName }}
            </p>
          </div>
          <span v-if="validationErrors.businessName" class="text-xs text-red-500 font-medium">{{ t('required') }}</span>
        </div>
        <svg
          :class="['w-5 h-5 text-gray-400 transition-transform', !fromCollapsed && 'rotate-180']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition name="collapse">
        <div v-show="!fromCollapsed" class="p-4 space-y-3 border-t border-gray-100">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-gray-600">
                {{ t('businessName') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="invoice.from.businessName"
                type="text"
                :class="[
                  'w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all',
                  validationErrors.businessName
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
                ]"
                :placeholder="t('enterBusinessName')"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('taxId') }}</label>
              <input
                v-model="invoice.from.taxId"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                :placeholder="t('enterTaxId')"
              />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-600">{{ t('address') }}</label>
            <input
              v-model="invoice.from.address"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              :placeholder="t('enterAddress')"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('email') }}</label>
              <input
                v-model="invoice.from.email"
                type="email"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                :placeholder="t('enterEmail')"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('phone') }}</label>
              <input
                v-model="invoice.from.phone"
                type="tel"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                :placeholder="t('enterPhone')"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- To Section -->
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <button
        @click="toCollapsed = !toCollapsed"
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="text-left">
            <h3 class="text-sm font-medium text-gray-900">{{ t('to') }}</h3>
            <p v-if="invoice.to.customerName && toCollapsed" class="text-xs text-gray-500 truncate max-w-[200px]">
              {{ invoice.to.customerName }}
            </p>
          </div>
          <span v-if="validationErrors.customerName" class="text-xs text-red-500 font-medium">{{ t('required') }}</span>
        </div>
        <svg
          :class="['w-5 h-5 text-gray-400 transition-transform', !toCollapsed && 'rotate-180']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition name="collapse">
        <div v-show="!toCollapsed" class="p-4 space-y-3 border-t border-gray-100">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Customer Name with Autocomplete -->
            <div class="space-y-1.5 relative" ref="customerDropdownRef">
              <label class="flex items-center gap-1 text-xs font-medium text-gray-600">
                {{ t('customerName') }}
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="invoice.to.customerName"
                  @input="customerSearchQuery = invoice.to.customerName; showCustomerDropdown = true"
                  @focus="showCustomerDropdown = true"
                  type="text"
                  autocomplete="off"
                  :class="[
                    'w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all pr-10',
                    validationErrors.customerName
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
                  ]"
                  :placeholder="t('searchCustomers')"
                />
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- Customer Dropdown -->
              <div
                v-if="showCustomerDropdown"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto"
              >
                <div v-if="filteredCustomersList.length > 0">
                  <div
                    v-for="customer in filteredCustomersList"
                    :key="customer.id"
                    class="group flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    @click="handleSelectCustomer(customer)"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ customer.customerName }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ customer.email || customer.taxId || 'No details' }}</p>
                    </div>
                    <button
                      @click.stop="handleDeleteCustomer(customer.id)"
                      class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-else class="px-3 py-3 text-sm text-gray-400">
                  {{ t('noCustomersFound') }}
                </div>

                <!-- Save as new customer -->
                <div
                  v-if="invoice.to.customerName.trim()"
                  class="border-t border-gray-100 px-3 py-2.5 hover:bg-primary-50 cursor-pointer transition-colors flex items-center gap-2"
                  @click="handleSaveCustomer"
                >
                  <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span class="text-sm font-medium text-primary-600">{{ t('saveAsCustomer') }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('taxId') }}</label>
              <input
                v-model="invoice.to.taxId"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                :placeholder="t('enterTaxId')"
              />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-600">{{ t('address') }}</label>
            <input
              v-model="invoice.to.address"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              :placeholder="t('enterAddress')"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('email') }}</label>
              <input
                v-model="invoice.to.email"
                type="email"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                :placeholder="t('enterEmail')"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('phone') }}</label>
              <input
                v-model="invoice.to.phone"
                type="tel"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                :placeholder="t('enterPhone')"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Items Table -->
    <ItemsTable />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useInvoice, type Customer } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'
import { useToast } from '../composables/useToast'
import LogoUploader from './LogoUploader.vue'
import ItemsTable from './ItemsTable.vue'

const {
  invoice,
  validationErrors,
  setDueDateFromInvoiceDate,
  filteredCustomers,
  selectCustomer,
  saveCurrentCustomer,
  deleteCustomer
} = useInvoice()
const { t } = useTranslations()
const { success } = useToast()

const fromCollapsed = ref(false)
const toCollapsed = ref(false)
const showCustomerDropdown = ref(false)
const customerSearchQuery = ref('')
const customerDropdownRef = ref<HTMLElement | null>(null)

const filteredCustomersList = computed(() => filteredCustomers(customerSearchQuery.value))

const setToday = () => {
  invoice.value.date = new Date().toISOString().split('T')[0]
}

const handleSelectCustomer = (customer: Customer) => {
  selectCustomer(customer)
  showCustomerDropdown.value = false
  customerSearchQuery.value = ''
}

const handleSaveCustomer = () => {
  if (saveCurrentCustomer()) {
    success(t.value('customerSaved'))
    showCustomerDropdown.value = false
  }
}

const handleDeleteCustomer = (id: string) => {
  if (confirm(t.value('confirmDeleteCustomer'))) {
    deleteCustomer(id)
    success(t.value('customerDeleted'))
  }
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (customerDropdownRef.value && !customerDropdownRef.value.contains(event.target as Node)) {
    showCustomerDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Date input styling */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
