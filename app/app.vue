<template>
  <div class="h-screen flex flex-col bg-stone-50">
    <!-- Minimal Header -->
    <header class="h-14 border-b border-stone-200 bg-white flex-shrink-0 px-3 sm:px-4 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-4 min-w-0">
        <h1 class="text-sm font-medium tracking-tight whitespace-nowrap cursor-default select-none"><span class="text-stone-400">Sample</span> <span class="text-stone-900">Invoice Generator</span></h1>
        <div class="hidden sm:flex items-center gap-2 text-xs">
          <span class="text-stone-600 font-medium">{{ invoice.number || 'Untitled' }}</span>
          <span class="flex items-center gap-1 text-stone-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Auto-saved
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-3">
        <select
          :value="invoice.documentType"
          @change="handleDocumentTypeChange(($event.target as HTMLSelectElement).value as DocumentType)"
          class="text-xs text-stone-500 bg-transparent border-0 focus:ring-0 cursor-pointer hover:text-stone-900 transition-colors pr-4 sm:pr-6"
        >
          <option value="invoice">Invoice</option>
          <option value="receipt">Receipt</option>
          <option value="delivery_note">Delivery Note</option>
          <option value="ticket">Ticket</option>
        </select>

        <div class="hidden sm:block w-px h-4 bg-stone-200"></div>

        <select
          v-model="currency"
          class="text-xs text-stone-500 bg-transparent border-0 focus:ring-0 cursor-pointer hover:text-stone-900 transition-colors pr-4 sm:pr-6"
        >
          <option value="$">USD</option>
          <option value="€">EUR</option>
          <option value="£">GBP</option>
          <option value="¥">JPY</option>
          <option value="CHF">CHF</option>
        </select>

        <select
          :value="language"
          @change="setLanguage(($event.target as HTMLSelectElement).value)"
          class="hidden sm:block text-xs text-stone-500 bg-transparent border-0 focus:ring-0 cursor-pointer hover:text-stone-900 transition-colors pr-6"
        >
          <option value="EN">EN</option>
          <option value="ES">ES</option>
          <option value="FR">FR</option>
          <option value="DE">DE</option>
        </select>

        <div class="hidden sm:block w-px h-4 bg-stone-200"></div>

        <button
          @click="showHistory = true"
          class="btn-ghost hidden sm:inline-flex"
        >
          History
        </button>

        <button
          @click="handleClear"
          class="btn-ghost hidden sm:inline-flex"
        >
          Clear
        </button>

        <button
          @click="handleSave"
          :disabled="!canDownload || justSaved"
          :class="[
            'hidden sm:inline-flex items-center gap-1.5 transition-all duration-200',
            justSaved ? 'btn-success' : 'btn-secondary'
          ]"
        >
          <svg v-if="justSaved" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ justSaved ? 'Saved!' : 'Save' }}
        </button>

        <button
          @click="showChaos = true"
          :class="[
            'hidden sm:inline-flex text-xs font-medium px-3 py-1.5 transition-colors',
            chaosEnabled
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:text-stone-900'
          ]"
          title="Configure chaos mode settings"
        >
          Chaos
        </button>

        <button
          @click="showBulkGenerate = true"
          class="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 transition-colors text-stone-500 hover:text-stone-900 items-center gap-1"
          title="Generate multiple test invoices"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Bulk
        </button>

        <button
          @click="showExport = true"
          :disabled="!canDownload || justExported"
          :class="[
            'inline-flex items-center gap-1.5 transition-all duration-200',
            justExported ? 'btn-success' : 'btn-primary'
          ]"
        >
          <svg v-if="justExported" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ justExported ? 'Exported!' : 'Export' }}
        </button>
      </div>
    </header>

    <!-- Mobile Tab Bar -->
    <div class="lg:hidden border-b border-stone-200 bg-white">
      <div class="flex">
        <button
          @click="mobileView = 'form'"
          :class="[
            'flex-1 py-3 text-xs font-medium transition-colors border-b-2',
            mobileView === 'form'
              ? 'text-stone-900 border-stone-900'
              : 'text-stone-400 border-transparent hover:text-stone-600'
          ]"
        >
          Edit
        </button>
        <button
          @click="mobileView = 'preview'"
          :class="[
            'flex-1 py-3 text-xs font-medium transition-colors border-b-2',
            mobileView === 'preview'
              ? 'text-stone-900 border-stone-900'
              : 'text-stone-400 border-transparent hover:text-stone-600'
          ]"
        >
          Preview
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex min-h-0">
      <!-- Form Panel - 50% width on desktop, full width on mobile -->
      <div
        :class="[
          'w-full lg:w-1/2 overflow-y-auto bg-white lg:border-r border-stone-200',
          mobileView === 'form' ? 'block' : 'hidden lg:block'
        ]"
      >
        <div class="p-4 sm:p-8 max-w-2xl mx-auto space-y-6 sm:space-y-10">
          <!-- Logo -->
          <div>
            <div
              v-if="!invoice.logo"
              class="group relative h-20 border border-dashed border-stone-300 hover:border-stone-400 transition-colors cursor-pointer flex items-center justify-center"
              @click="triggerLogoUpload"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleLogoDrop"
            >
              <span class="text-xs text-stone-400 group-hover:text-stone-500 transition-colors">
                + Add logo
              </span>
            </div>
            <div v-else class="group relative h-20 border border-stone-200 flex items-center justify-center">
              <img :src="invoice.logo" alt="Logo" class="max-h-16 max-w-32 object-contain" />
              <div class="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button @click="triggerLogoUpload" class="text-xs text-stone-600 hover:text-stone-900">Change</button>
                <button @click="removeLogo" class="text-xs text-red-600 hover:text-red-700">Remove</button>
              </div>
            </div>
            <input ref="logoInput" type="file" accept="image/*" @change="handleLogoUpload" class="hidden" />
          </div>

          <!-- Invoice Details -->
          <div :class="['grid grid-cols-1 gap-3 sm:gap-4', currentDocConfig.hasDueDate ? 'sm:grid-cols-3' : 'sm:grid-cols-2']">
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Number *</label>
              <input
                v-model="invoice.number"
                type="text"
                :placeholder="currentDocConfig.prefix + '001'"
                @blur="validateField('invoiceNumber')"
                :class="[
                  'w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b focus:ring-0 px-0 py-1 transition-colors',
                  fieldErrors.invoiceNumber ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'
                ]"
              />
              <span v-if="fieldErrors.invoiceNumber" class="text-[10px] text-red-500 mt-1 block">Required</span>
            </div>
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Date</label>
              <input
                v-model="invoice.date"
                type="date"
                class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"
              />
            </div>
            <div v-if="currentDocConfig.hasDueDate">
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Due</label>
              <input
                v-model="invoice.dueDate"
                type="date"
                class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"
              />
            </div>
          </div>

          <!-- Payment Method (Receipts) -->
          <div v-if="currentDocConfig.hasPaymentMethod" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Payment Method</label>
              <select
                v-model="invoice.paymentMethod"
                class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors bg-transparent"
              >
                <option value="">Select...</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
          </div>

          <!-- From / To -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div class="space-y-3">
              <label class="block text-[10px] uppercase tracking-wider text-stone-400">{{ fromLabel }} *</label>
              <div>
                <input
                  v-model="invoice.from.businessName"
                  type="text"
                  :placeholder="fromPlaceholder"
                  @blur="validateField('businessName')"
                  :class="[
                    'w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b focus:ring-0 px-0 py-1',
                    fieldErrors.businessName ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'
                  ]"
                />
                <span v-if="fieldErrors.businessName" class="text-[10px] text-red-500 mt-1 block">Required</span>
              </div>
              <input
                v-model="invoice.from.email"
                type="email"
                placeholder="email@company.com"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
              />
              <input
                v-model="invoice.from.address"
                type="text"
                placeholder="Address"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
              />
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="invoice.from.phone"
                  type="tel"
                  placeholder="Phone"
                  class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
                />
                <input
                  v-model="invoice.from.taxId"
                  type="text"
                  placeholder="Tax ID"
                  class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
                />
              </div>
            </div>
            <div class="space-y-3 relative">
              <div class="flex items-center justify-between">
                <label class="block text-[10px] uppercase tracking-wider text-stone-400">{{ toLabel }} *</label>
                <div class="flex items-center gap-2">
                  <button
                    v-if="customers.length > 0"
                    @click="showCustomerDropdown = !showCustomerDropdown"
                    class="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {{ showCustomerDropdown ? 'Close' : 'Select' }}
                  </button>
                  <button
                    @click="saveCustomer"
                    class="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              <!-- Customer Dropdown -->
              <div
                v-if="showCustomerDropdown && customers.length > 0"
                class="absolute top-6 left-0 right-0 bg-white border border-stone-200 shadow-lg z-20 max-h-48 overflow-y-auto rounded-b"
              >
                <div
                  v-for="customer in customers"
                  :key="customer.id"
                  class="flex items-center justify-between px-3 py-2 hover:bg-stone-50 active:bg-stone-100 cursor-pointer group transition-colors duration-150"
                >
                  <div @click="selectCustomer(customer)" class="flex-1">
                    <div class="text-sm text-stone-900">{{ customer.customerName }}</div>
                    <div class="text-xs text-stone-400">{{ customer.email || customer.address || 'No details' }}</div>
                  </div>
                  <button
                    @click.stop="deleteCustomer(customer.id)"
                    class="text-xs text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 ml-2 px-2 py-1 -my-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div>
                <input
                  v-model="invoice.to.customerName"
                  type="text"
                  :placeholder="toPlaceholder"
                  @blur="validateField('customerName')"
                  :class="[
                    'w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b focus:ring-0 px-0 py-1',
                    fieldErrors.customerName ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-stone-900'
                  ]"
                />
                <span v-if="fieldErrors.customerName" class="text-[10px] text-red-500 mt-1 block">Required</span>
              </div>
              <input
                v-model="invoice.to.email"
                type="email"
                placeholder="client@email.com"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
              />
              <input
                v-model="invoice.to.address"
                type="text"
                placeholder="Address"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
              />
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="invoice.to.phone"
                  type="tel"
                  placeholder="Phone"
                  class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
                />
                <input
                  v-model="invoice.to.taxId"
                  type="text"
                  placeholder="Tax ID"
                  class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
                />
              </div>
            </div>
          </div>

          <!-- Line Items -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <label class="text-[10px] uppercase tracking-wider text-stone-400">Items</label>
                <span class="text-[10px] text-stone-300">{{ invoice.items.length }} item{{ invoice.items.length !== 1 ? 's' : '' }}</span>
              </div>
              <button
                @click="addItem"
                class="text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-all duration-150 flex items-center gap-1 px-2 py-1 -mx-2 rounded"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add item
              </button>
            </div>

            <div v-if="invoice.items.length === 0" class="py-16 text-center border border-dashed border-stone-200 bg-stone-50/50">
              <svg class="w-10 h-10 mx-auto text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p class="text-sm text-stone-500 mb-1">No line items yet</p>
              <p class="text-xs text-stone-400 mb-4">Add products or services to your invoice</p>
              <button
                @click="addItem"
                class="text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 active:bg-stone-100 transition-all duration-150 px-3 py-1.5 border border-stone-300 hover:border-stone-400 rounded active:scale-[0.98]"
              >
                Add first item
              </button>
            </div>

            <div v-else class="space-y-0">
              <!-- Desktop Header -->
              <div :class="['hidden sm:grid gap-2 pb-2 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-400', currentDocConfig.hasPrices ? 'grid-cols-12' : 'grid-cols-12']">
                <div :class="currentDocConfig.hasPrices ? 'col-span-5' : 'col-span-10'">Description</div>
                <div class="col-span-1 text-center">Qty</div>
                <template v-if="currentDocConfig.hasPrices">
                  <div class="col-span-2 text-right">Price</div>
                  <div class="col-span-1 text-center">Tax %</div>
                  <div class="col-span-2 text-right">Total</div>
                </template>
                <div class="col-span-1"></div>
              </div>

              <!-- Desktop Items -->
              <TransitionGroup name="item-list" tag="div" class="hidden sm:block relative">
                <div
                  v-for="(item, index) in invoice.items"
                  :key="item.id"
                  class="grid grid-cols-12 gap-2 py-3 border-b border-stone-100 group items-center hover:bg-stone-50/50 transition-colors -mx-2 px-2"
                >
                <div :class="currentDocConfig.hasPrices ? 'col-span-5' : 'col-span-10'">
                  <input
                    :ref="(el) => setItemDescriptionRef(item.id, el as HTMLInputElement)"
                    v-model="item.description"
                    type="text"
                    placeholder="Item description"
                    @keydown="handleItemKeydown($event, index)"
                    class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 focus:ring-0 p-0 bg-transparent"
                  />
                </div>
                <div class="col-span-1">
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="0"
                    step="1"
                    @keydown="handleItemKeydown($event, index)"
                    class="w-full text-sm text-stone-900 text-center border-0 focus:ring-0 p-0 tabular-nums bg-transparent"
                  />
                </div>
                <template v-if="currentDocConfig.hasPrices">
                  <div class="col-span-2">
                    <input
                      v-model.number="item.price"
                      type="number"
                      min="0"
                      step="0.01"
                      @keydown="handleItemKeydown($event, index)"
                      class="w-full text-sm text-stone-900 text-right border-0 focus:ring-0 p-0 tabular-nums bg-transparent"
                    />
                  </div>
                  <div class="col-span-1">
                    <input
                      v-model.number="item.tax"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      @keydown="handleItemKeydown($event, index)"
                      class="w-full text-sm text-stone-500 text-center border-0 focus:ring-0 p-0 tabular-nums bg-transparent"
                    />
                  </div>
                  <div class="col-span-2 text-sm text-stone-900 text-right tabular-nums font-medium">
                    {{ currency }}{{ ((item.quantity * item.price) * (1 + item.tax / 100)).toFixed(2) }}
                  </div>
                </template>
                <div class="col-span-1 text-right">
                  <button
                    @click="removeItem(index)"
                    class="text-stone-300 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-all duration-150 opacity-0 group-hover:opacity-100 p-1 -m-1 rounded"
                    title="Remove item"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                </div>
              </TransitionGroup>

              <!-- Mobile Items (Card Layout) -->
              <TransitionGroup name="item-list" tag="div" class="sm:hidden space-y-4 pt-2 relative">
                <div
                  v-for="(item, index) in invoice.items"
                  :key="'mobile-' + item.id"
                  class="border border-stone-200 rounded-lg p-4 bg-white shadow-sm"
                >
                  <div class="flex items-center justify-between gap-3 mb-4">
                    <input
                      :ref="(el) => setItemDescriptionRef('mobile-' + item.id, el as HTMLInputElement)"
                      v-model="item.description"
                      type="text"
                      placeholder="Item description"
                      @keydown="handleItemKeydown($event, index)"
                      class="flex-1 text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-2 bg-transparent min-h-[44px]"
                    />
                    <button
                      @click="removeItem(index)"
                      class="text-stone-400 hover:text-red-500 active:text-red-600 active:bg-red-50 p-2 -m-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                      aria-label="Remove item"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div :class="['grid gap-3', currentDocConfig.hasPrices ? 'grid-cols-4' : 'grid-cols-1']">
                    <div>
                      <label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Qty</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="1"
                        @keydown="handleItemKeydown($event, index)"
                        class="w-full text-sm text-stone-900 text-center border border-stone-200 rounded-lg px-2 py-2 tabular-nums min-h-[44px]"
                      />
                    </div>
                    <template v-if="currentDocConfig.hasPrices">
                      <div>
                        <label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Price</label>
                        <input
                          v-model.number="item.price"
                          type="number"
                          min="0"
                          step="0.01"
                          @keydown="handleItemKeydown($event, index)"
                          class="w-full text-sm text-stone-900 border border-stone-200 rounded-lg px-2 py-2 tabular-nums min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Tax %</label>
                        <input
                          v-model.number="item.tax"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          @keydown="handleItemKeydown($event, index)"
                          class="w-full text-sm text-stone-500 text-center border border-stone-200 rounded-lg px-2 py-2 tabular-nums min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Total</label>
                        <div class="text-sm text-stone-900 font-medium tabular-nums py-2 text-right min-h-[44px] flex items-center justify-end">
                          {{ currency }}{{ ((item.quantity * item.price) * (1 + item.tax / 100)).toFixed(2) }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </TransitionGroup>

              <!-- Tax Presets -->
              <div v-if="currentDocConfig.hasPrices" class="pt-3 pb-2 flex flex-wrap items-center gap-2">
                <span class="text-[10px] uppercase tracking-wider text-stone-400">Quick tax:</span>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="rate in [0, 5, 10, 15, 20, 21]"
                    :key="rate"
                    @click="applyTaxToAll(rate)"
                    class="text-[10px] px-2 py-0.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-all duration-150 rounded"
                  >
                    {{ rate }}%
                  </button>
                </div>
              </div>

              <!-- Totals -->
              <div v-if="currentDocConfig.hasTotals" class="pt-4 space-y-2 border-t border-stone-200">
                <div class="flex justify-between text-sm">
                  <span class="text-stone-400">Subtotal</span>
                  <span class="tabular-nums">{{ currency }}{{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-stone-400">Tax</span>
                  <span class="tabular-nums">{{ currency }}{{ totalTax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm font-semibold pt-2 border-t border-stone-900">
                  <span>Total</span>
                  <span class="tabular-nums text-lg">{{ currency }}{{ total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes & Terms -->
          <div class="space-y-4 pt-6 border-t border-stone-200">
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Notes</label>
              <textarea
                v-model="invoice.notes"
                rows="2"
                placeholder="Additional notes for the client..."
                class="w-full text-sm text-stone-900 placeholder-stone-300 bg-transparent border-0 border-b-2 border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-2 resize-none transition-colors"
              ></textarea>
            </div>
            <div v-if="currentDocConfig.hasTerms">
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Payment Terms</label>
              <textarea
                v-model="invoice.terms"
                rows="2"
                placeholder="Payment terms and conditions..."
                class="w-full text-sm text-stone-900 placeholder-stone-300 bg-transparent border-0 border-b-2 border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-2 resize-none transition-colors"
              ></textarea>
            </div>
          </div>

          <!-- Keyboard Hints -->
          <div class="text-[10px] text-stone-400 pt-4 flex items-center gap-4">
            <span>Tab to navigate</span>
            <span class="text-stone-300">|</span>
            <span>Changes auto-save</span>
          </div>
        </div>
      </div>

      <!-- Preview Panel - 50% width on desktop, full width on mobile -->
      <div
        :class="[
          'w-full lg:w-1/2 flex flex-col bg-stone-100 min-h-0 overflow-hidden',
          mobileView === 'preview' ? 'flex' : 'hidden lg:flex'
        ]"
      >
        <div v-if="isGeneratingPreview && !pdfPreviewUrl" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <svg class="animate-spin w-8 h-8 mx-auto text-stone-300 mb-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p class="text-xs text-stone-400">Generating preview...</p>
          </div>
        </div>
        <iframe
          v-else-if="pdfPreviewUrl"
          :src="pdfPreviewUrl"
          class="flex-1 w-full border-0"
          title="Invoice PDF Preview"
        />
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center px-8">
            <svg class="w-16 h-16 mx-auto text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm text-stone-400 mb-1">PDF preview</p>
            <p class="text-xs text-stone-300">Fill in invoice details to see preview</p>
          </div>
        </div>
      </div>
    </div>

    <!-- History Drawer -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showHistory" class="fixed inset-0 bg-black/20 z-50" @click="showHistory = false" />
      </Transition>
      <Transition name="slide">
        <div v-if="showHistory" class="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col">
          <div class="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <span class="text-sm font-medium block">History</span>
              <span class="text-[10px] text-stone-400">{{ invoiceHistory.length }} invoices</span>
            </div>
            <div class="flex items-center gap-1">
              <!-- Export All Dropdown -->
              <div v-if="invoiceHistory.length > 0" class="relative">
                <button
                  @click="showExportAllMenu = !showExportAllMenu"
                  :disabled="isBulkExporting"
                  class="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors disabled:opacity-50"
                  title="Export All"
                >
                  <svg v-if="isBulkExporting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <!-- Progress indicator -->
                <span v-if="isBulkExporting && bulkExportProgress.total > 0" class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-stone-500 whitespace-nowrap">
                  {{ bulkExportProgress.current }}/{{ bulkExportProgress.total }}
                </span>
                <!-- Dropdown Menu -->
                <div
                  v-if="showExportAllMenu"
                  class="absolute right-0 mt-1 w-36 bg-white border border-stone-200 rounded shadow-lg z-10"
                >
                  <button
                    @click="handleExportAll('zip'); showExportAllMenu = false"
                    class="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    ZIP (PDFs)
                  </button>
                  <button
                    @click="handleExportAll('json'); showExportAllMenu = false"
                    class="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    JSON
                  </button>
                  <button
                    @click="handleExportAll('csv'); showExportAllMenu = false"
                    class="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                </div>
              </div>
              <button @click="showHistory = false" class="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div v-if="invoiceHistory.length === 0" class="p-8 text-center">
              <p class="text-sm text-stone-400">No saved invoices</p>
            </div>
            <div v-else class="divide-y divide-stone-100">
              <div
                v-for="saved in invoiceHistory"
                :key="saved.id"
                class="p-4 hover:bg-stone-50 cursor-pointer group"
                @click="loadInvoice(saved); showHistory = false"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm font-medium text-stone-900">{{ saved.invoice.number }}</span>
                    <span
                      v-if="(saved.documentType || saved.invoice?.documentType || 'invoice') !== 'invoice'"
                      class="text-[9px] font-medium px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded uppercase"
                    >{{ ({ invoice: '', receipt: 'REC', delivery_note: 'DN', ticket: 'TKT' } as Record<string, string>)[saved.documentType || saved.invoice?.documentType || 'invoice'] }}</span>
                  </div>
                  <span class="text-xs text-stone-500 tabular-nums">{{ currency }}{{ (saved.totalAmount ?? 0).toFixed(2) }}</span>
                </div>
                <div class="text-xs text-stone-400 mt-1">{{ saved.customerName }}</div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[10px] text-stone-300">{{ new Date(saved.savedAt).toLocaleDateString() }}</span>
                  <button
                    @click.stop="deleteInvoiceFromHistory(saved.id)"
                    class="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Export Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showExport" class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" @click.self="showExport = false">
          <div class="bg-white shadow-xl w-72">
            <div class="p-4 border-b border-stone-200 flex items-center justify-between">
              <span class="text-sm font-medium">Export</span>
              <button @click="showExport = false" class="text-stone-400 hover:text-stone-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-2">
              <button
                @click="handleExport('pdf')"
                :disabled="isExporting"
                class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="exportingFormat === 'pdf'" class="btn-spinner"></span>
                PDF
              </button>
              <button
                @click="handleExport('excel')"
                :disabled="isExporting"
                class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="exportingFormat === 'excel'" class="btn-spinner"></span>
                Excel
              </button>
              <button
                @click="handleExport('csv')"
                :disabled="isExporting"
                class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="exportingFormat === 'csv'" class="btn-spinner"></span>
                CSV
              </button>
              <button
                @click="handleExport('json')"
                :disabled="isExporting"
                class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="exportingFormat === 'json'" class="btn-spinner"></span>
                JSON
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div class="fixed bottom-4 right-4 z-50 space-y-2">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="[
              'px-4 py-2 text-xs font-medium shadow-lg flex items-center gap-3',
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-stone-900 text-white'
            ]"
          >
            <span>{{ toast.message }}</span>
            <button
              v-if="toast.action"
              @click="toast.action.handler"
              class="text-white/70 hover:text-white font-semibold underline underline-offset-2 transition-colors"
            >
              {{ toast.action.label }}
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- Chaos Config Modal -->
    <ChaosConfigModal
      :is-open="showChaos"
      @close="showChaos = false"
      @apply="handleApplyChaos"
    />

    <!-- Bulk Generate Modal -->
    <BulkGenerateModal
      :is-open="showBulkGenerate"
      @close="showBulkGenerate = false"
      @generated="handleBulkGenerated"
    />

    <!-- Chaos Mode Banner -->
    <Transition name="slide-down">
      <div
        v-if="chaosEnabled"
        class="fixed top-14 left-0 right-0 z-40 bg-stone-900 text-white px-4 py-1.5 flex items-center justify-center gap-3 text-xs"
      >
        <span class="text-stone-400">Chaos Mode</span>
        <span class="text-stone-500">|</span>
        <span>Data is intentionally incorrect</span>
        <button
          @click="handleApplyChaos"
          class="ml-2 text-stone-400 hover:text-white transition-colors flex items-center gap-1"
          title="Generate new chaotic invoice"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </button>
        <span class="text-stone-500">|</span>
        <button
          @click="handleResetChaos"
          class="text-stone-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import ChaosConfigModal from './components/ChaosConfigModal.vue'
import BulkGenerateModal from './components/BulkGenerateModal.vue'
import { useChaosMode } from './composables/useChaosMode'
import { useInvoice, type SavedInvoice, type DocumentType, DOCUMENT_TYPE_CONFIG } from './composables/useInvoice'

const { chaosEnabled, applyChaosToInvoice, resetChaosMode, chaosOverrides, chaosConfig } = useChaosMode()
const { invoiceHistory, initialize: initializeInvoice } = useInvoice()

// Types
interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  tax: number
}

interface Invoice {
  number: string
  date: string
  dueDate: string
  documentType: DocumentType
  paymentMethod: string
  logo: string | null
  from: {
    businessName: string
    taxId: string
    address: string
    email: string
    phone: string
  }
  to: {
    customerName: string
    taxId: string
    address: string
    email: string
    phone: string
  }
  items: InvoiceItem[]
  notes: string
  terms: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
  action?: {
    label: string
    handler: () => void
  }
}

interface Customer {
  id: string
  customerName: string
  taxId: string
  address: string
  email: string
  phone: string
  createdAt: string
}

// Storage keys
const STORAGE_KEY = 'invoice-generator-data'
const HISTORY_KEY = 'invoice-generator-history'
const LOGO_KEY = 'invoice-generator-default-logo'
const LANGUAGE_KEY = 'invoice-generator-language'
const CUSTOMERS_KEY = 'invoice-generator-customers'

// State
const invoice = ref<Invoice>({
  number: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  documentType: 'invoice',
  paymentMethod: '',
  logo: null,
  from: { businessName: '', taxId: '', address: '', email: '', phone: '' },
  to: { customerName: '', taxId: '', address: '', email: '', phone: '' },
  items: [],
  notes: '',
  terms: ''
})

const customers = ref<Customer[]>([])
const currency = ref('$')
const language = ref('EN')

// Translations
const translations: Record<string, Record<string, string>> = {
  EN: {
    invoice: 'INVOICE',
    receipt: 'RECEIPT',
    deliveryNote: 'DELIVERY NOTE',
    ticket: 'TICKET',
    paymentMethod: 'Payment Method',
    from: 'FROM',
    to: 'TO',
    supplier: 'SUPPLIER',
    deliveredTo: 'DELIVERED TO',
    description: 'DESCRIPTION',
    qty: 'QTY',
    price: 'PRICE',
    total: 'TOTAL',
    subtotal: 'Subtotal',
    tax: 'Tax',
    notes: 'NOTES',
    paymentTerms: 'PAYMENT TERMS',
    taxId: 'Tax ID',
    date: 'Date',
    due: 'Due',
    noItems: 'No items',
  },
  ES: {
    invoice: 'FACTURA',
    receipt: 'RECIBO',
    deliveryNote: 'ALBARÁN',
    ticket: 'TICKET',
    paymentMethod: 'Método de Pago',
    from: 'DE',
    to: 'PARA',
    supplier: 'PROVEEDOR',
    deliveredTo: 'ENTREGADO A',
    description: 'DESCRIPCIÓN',
    qty: 'CANT',
    price: 'PRECIO',
    total: 'TOTAL',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    notes: 'NOTAS',
    paymentTerms: 'CONDICIONES DE PAGO',
    taxId: 'NIF/CIF',
    date: 'Fecha',
    due: 'Vencimiento',
    noItems: 'Sin artículos',
  },
  FR: {
    invoice: 'FACTURE',
    receipt: 'REÇU',
    deliveryNote: 'BON DE LIVRAISON',
    ticket: 'TICKET',
    paymentMethod: 'Mode de Paiement',
    from: 'DE',
    to: 'À',
    supplier: 'FOURNISSEUR',
    deliveredTo: 'LIVRÉ À',
    description: 'DESCRIPTION',
    qty: 'QTÉ',
    price: 'PRIX',
    total: 'TOTAL',
    subtotal: 'Sous-total',
    tax: 'TVA',
    notes: 'NOTES',
    paymentTerms: 'CONDITIONS DE PAIEMENT',
    taxId: 'N° TVA',
    date: 'Date',
    due: 'Échéance',
    noItems: 'Aucun article',
  },
  DE: {
    invoice: 'RECHNUNG',
    receipt: 'QUITTUNG',
    deliveryNote: 'LIEFERSCHEIN',
    ticket: 'TICKET',
    paymentMethod: 'Zahlungsart',
    from: 'VON',
    to: 'AN',
    supplier: 'LIEFERANT',
    deliveredTo: 'GELIEFERT AN',
    description: 'BESCHREIBUNG',
    qty: 'MENGE',
    price: 'PREIS',
    total: 'GESAMT',
    subtotal: 'Zwischensumme',
    tax: 'MwSt',
    notes: 'ANMERKUNGEN',
    paymentTerms: 'ZAHLUNGSBEDINGUNGEN',
    taxId: 'USt-IdNr',
    date: 'Datum',
    due: 'Fällig',
    noItems: 'Keine Artikel',
  },
}

const t = (key: string) => translations[language.value]?.[key] || translations.EN[key] || key

const showHistory = ref(false)
const showExport = ref(false)
const showChaos = ref(false)
const showExportAllMenu = ref(false)
const showBulkGenerate = ref(false)

const hideBranding = ref(false)
const isExporting = ref(false)
const exportingFormat = ref<string | null>(null)
const justSaved = ref(false)
const justExported = ref(false)
const showCustomerDropdown = ref(false)

// Validation - track touched fields
const touchedFields = ref<Record<string, boolean>>({})

const validateField = (field: string) => {
  touchedFields.value[field] = true
}

const fieldErrors = computed(() => ({
  invoiceNumber: touchedFields.value.invoiceNumber && !invoice.value.number?.trim(),
  businessName: touchedFields.value.businessName && !invoice.value.from.businessName?.trim(),
  customerName: touchedFields.value.customerName && !invoice.value.to.customerName?.trim(),
}))
const mobileView = ref<'form' | 'preview'>('form')
const toasts = ref<Toast[]>([])
const pdfPreviewUrl = ref<string | null>(null)
const isGeneratingPreview = ref(false)
const isDragging = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)

// Computed (with chaos override support)
const subtotal = computed(() => {
  if (chaosOverrides.value?.subtotal !== undefined) {
    return chaosOverrides.value.subtotal
  }
  return invoice.value.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
})
const totalTax = computed(() => {
  if (chaosOverrides.value?.totalTax !== undefined) {
    return chaosOverrides.value.totalTax
  }
  return invoice.value.items.reduce((sum, item) => sum + (item.quantity * item.price * item.tax) / 100, 0)
})
const total = computed(() => {
  if (chaosOverrides.value?.total !== undefined) {
    return chaosOverrides.value.total
  }
  return subtotal.value + totalTax.value
})
const canDownload = computed(() => invoice.value.number?.trim() && invoice.value.from.businessName?.trim() && invoice.value.to.customerName?.trim())

// Document type config
const currentDocConfig = computed(() => DOCUMENT_TYPE_CONFIG[invoice.value.documentType])

const isDeliveryNote = computed(() => invoice.value.documentType === 'delivery_note')
const fromLabel = computed(() => isDeliveryNote.value ? 'Supplier' : 'From')
const toLabel = computed(() => isDeliveryNote.value ? 'Delivered To' : 'To')
const fromPlaceholder = computed(() => isDeliveryNote.value ? 'Supplier name' : 'Your business')
const toPlaceholder = computed(() => isDeliveryNote.value ? 'Restaurant name' : 'Client name')

const documentTypeTitle = (docType: DocumentType): string => {
  const titleMap: Record<DocumentType, string> = {
    invoice: 'invoice',
    receipt: 'receipt',
    delivery_note: 'deliveryNote',
    ticket: 'ticket',
  }
  return t(titleMap[docType])
}

const handleDocumentTypeChange = (newType: DocumentType) => {
  const oldConfig = DOCUMENT_TYPE_CONFIG[invoice.value.documentType]
  const newConfig = DOCUMENT_TYPE_CONFIG[newType]

  // Update number prefix if it starts with the old prefix
  const num = invoice.value.number
  if (num.startsWith(oldConfig.prefix)) {
    invoice.value.number = newConfig.prefix + num.slice(oldConfig.prefix.length)
  }

  invoice.value.documentType = newType

  // Clear payment method if new type doesn't support it
  if (!newConfig.hasPaymentMethod) {
    invoice.value.paymentMethod = ''
  }
}

// Methods
const showToast = (message: string, type: 'success' | 'error' = 'success', action?: { label: string; handler: () => void }) => {
  const id = uuidv4()
  const toast: Toast = { id, message, type }
  if (action) {
    toast.action = {
      label: action.label,
      handler: () => {
        action.handler()
        toasts.value = toasts.value.filter(t => t.id !== id)
      }
    }
  }
  toasts.value.push(toast)
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, action ? 5000 : 3000)
}

// Refs for item description inputs (for auto-focus)
const itemDescriptionRefs = ref<Record<string, HTMLInputElement | null>>({})

const setItemDescriptionRef = (id: string, el: HTMLInputElement | null) => {
  if (el) {
    itemDescriptionRefs.value[id] = el
  } else {
    delete itemDescriptionRefs.value[id]
  }
}

const addItem = async () => {
  const newId = uuidv4()
  invoice.value.items.push({ id: newId, description: '', quantity: 1, price: 0, tax: 0 })

  // Auto-focus the new item's description field (try desktop first, then mobile)
  await nextTick()
  const descInput = itemDescriptionRefs.value[newId] || itemDescriptionRefs.value['mobile-' + newId]
  if (descInput) {
    descInput.focus()
  }
}

// Handle Enter key in item inputs - add new item if on last row
const handleItemKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Enter' && index === invoice.value.items.length - 1) {
    event.preventDefault()
    addItem()
  }
}

const removeItem = (index: number) => {
  const removedItem = invoice.value.items[index]
  const removedIndex = index
  invoice.value.items.splice(index, 1)

  showToast('Item removed', 'success', {
    label: 'Undo',
    handler: () => {
      invoice.value.items.splice(removedIndex, 0, removedItem)
    }
  })
}

const applyTaxToAll = (rate: number) => {
  invoice.value.items.forEach(item => {
    item.tax = rate
  })
}

const triggerLogoUpload = () => logoInput.value?.click()

const handleLogoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file?.type.startsWith('image/')) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  img.onload = () => {
    let { width, height } = img
    const maxSize = 200
    if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize }
    else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize }
    canvas.width = width
    canvas.height = height
    // Fill with white background to handle transparent images
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
    }
    invoice.value.logo = canvas.toDataURL('image/jpeg', 0.9)
    localStorage.setItem(LOGO_KEY, invoice.value.logo)
  }
  img.src = URL.createObjectURL(file)
}

const handleLogoDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    const input = logoInput.value
    if (input) {
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
      handleLogoUpload({ target: input } as unknown as Event)
    }
  }
}

const removeLogo = () => {
  invoice.value.logo = null
  localStorage.removeItem(LOGO_KEY)
}

// Customer management
const saveCustomer = () => {
  if (!invoice.value.to.customerName?.trim()) {
    showToast('Customer name required', 'error')
    return
  }

  const existing = customers.value.find(c =>
    c.customerName.toLowerCase() === invoice.value.to.customerName.toLowerCase()
  )

  if (existing) {
    // Update existing
    Object.assign(existing, {
      ...invoice.value.to,
      createdAt: existing.createdAt
    })
  } else {
    // Add new
    customers.value.unshift({
      id: uuidv4(),
      ...invoice.value.to,
      createdAt: new Date().toISOString()
    })
  }

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers.value))
  showToast('Customer saved')
  showCustomerDropdown.value = false
}

const selectCustomer = (customer: Customer) => {
  invoice.value.to = {
    customerName: customer.customerName,
    taxId: customer.taxId,
    address: customer.address,
    email: customer.email,
    phone: customer.phone
  }
  showCustomerDropdown.value = false
}

const deleteCustomer = (id: string) => {
  customers.value = customers.value.filter(c => c.id !== id)
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers.value))
  showToast('Customer deleted')
}

const handleClear = () => {
  if (confirm('Clear all data?')) {
    const currentDocType = invoice.value.documentType
    invoice.value = {
      number: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      documentType: currentDocType,
      paymentMethod: '',
      logo: localStorage.getItem(LOGO_KEY),
      from: { businessName: '', taxId: '', address: '', email: '', phone: '' },
      to: { customerName: '', taxId: '', address: '', email: '', phone: '' },
      items: [],
      notes: '',
      terms: ''
    }
    resetChaosMode()
    touchedFields.value = {} // Reset validation state
  }
}

const handleApplyChaos = () => {
  // Apply chaos to the current invoice, preserving unaffected data
  const chaoticInvoice = applyChaosToInvoice(invoice.value)
  // Preserve logo
  const currentLogo = invoice.value.logo
  invoice.value = chaoticInvoice
  if (currentLogo) {
    invoice.value.logo = currentLogo
  }
  showChaos.value = false
  showToast('Chaos applied to invoice!')
}

const handleResetChaos = () => {
  const originalInvoice = resetChaosMode()
  if (originalInvoice) {
    // Preserve current logo when restoring
    const currentLogo = invoice.value.logo
    invoice.value = originalInvoice
    if (currentLogo) {
      invoice.value.logo = currentLogo
    }
    showToast('Invoice restored')
  } else {
    showToast('Chaos mode disabled')
  }
}

const handleBulkGenerated = (count: number) => {
  showToast(`Generated ${count} invoices`)
}

const handleSave = () => {
  if (!canDownload.value) return showToast('Fill required fields', 'error')

  invoiceHistory.value.unshift({
    id: uuidv4(),
    invoice: JSON.parse(JSON.stringify(invoice.value)),
    savedAt: new Date().toISOString(),
    totalAmount: total.value,
    customerName: invoice.value.to.customerName,
    documentType: invoice.value.documentType,
  })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(invoiceHistory.value))

  // Show success feedback
  justSaved.value = true
  setTimeout(() => { justSaved.value = false }, 1500)
  showToast('Saved')
}

const loadInvoice = (saved: SavedInvoice) => {
  invoice.value = JSON.parse(JSON.stringify(saved.invoice))
}

const deleteInvoiceFromHistory = (id: string) => {
  invoiceHistory.value = invoiceHistory.value.filter(i => i.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(invoiceHistory.value))
}

const setLanguage = (lang: string) => {
  language.value = lang
  localStorage.setItem(LANGUAGE_KEY, lang)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// Bad scan effect helper - applies randomized gradient overlay
const applyBadScanEffect = (pdf: any, pageWidth: number, pageHeight: number) => {
  pdf.saveGraphicsState()

  // Randomize sepia tint intensity (0.04 to 0.12)
  const tintOpacity = 0.04 + Math.random() * 0.08
  const tintColors = ['#d4a574', '#c4956a', '#b8a082', '#cdb891', '#a89070']
  const tintColor = tintColors[Math.floor(Math.random() * tintColors.length)]
  const tintGState = (pdf as any).GState({ opacity: tintOpacity })
  pdf.setGState(tintGState)
  pdf.setFillColor(tintColor)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Randomize gradient direction (0-7 representing different corners/sides)
  const gradientDirection = Math.floor(Math.random() * 8)
  const gradientSteps = 5 + Math.floor(Math.random() * 6) // 5-10 steps
  const baseOpacity = 0.02 + Math.random() * 0.03 // 0.02-0.05

  pdf.setFillColor('#1c1917')

  for (let i = 0; i < gradientSteps; i++) {
    const stepOpacity = baseOpacity * (gradientSteps - i)
    const gState = (pdf as any).GState({ opacity: stepOpacity })
    pdf.setGState(gState)

    const ratio = (i + 1) / gradientSteps

    switch (gradientDirection) {
      case 0: // Top-left to bottom-right (diagonal)
        pdf.rect(0, 0, pageWidth * ratio, pageHeight * ratio, 'F')
        break
      case 1: // Top-right to bottom-left (diagonal)
        pdf.rect(pageWidth * (1 - ratio), 0, pageWidth * ratio, pageHeight * ratio, 'F')
        break
      case 2: // Bottom-left to top-right (diagonal)
        pdf.rect(0, pageHeight * (1 - ratio), pageWidth * ratio, pageHeight * ratio, 'F')
        break
      case 3: // Bottom-right to top-left (diagonal)
        pdf.rect(pageWidth * (1 - ratio), pageHeight * (1 - ratio), pageWidth * ratio, pageHeight * ratio, 'F')
        break
      case 4: // Top to bottom (horizontal band)
        pdf.rect(0, 0, pageWidth, pageHeight * ratio, 'F')
        break
      case 5: // Bottom to top (horizontal band)
        pdf.rect(0, pageHeight * (1 - ratio), pageWidth, pageHeight * ratio, 'F')
        break
      case 6: // Left to right (vertical band)
        pdf.rect(0, 0, pageWidth * ratio, pageHeight, 'F')
        break
      case 7: // Right to left (vertical band)
        pdf.rect(pageWidth * (1 - ratio), 0, pageWidth * ratio, pageHeight, 'F')
        break
    }
  }

  // Randomize noise spots (8-25 spots)
  const noiseCount = 8 + Math.floor(Math.random() * 18)
  const noiseOpacity = 0.03 + Math.random() * 0.06
  const noiseGState = (pdf as any).GState({ opacity: noiseOpacity })
  pdf.setGState(noiseGState)
  const noiseColors = ['#78716c', '#57534e', '#a8a29e', '#44403c']
  for (let i = 0; i < noiseCount; i++) {
    pdf.setFillColor(noiseColors[Math.floor(Math.random() * noiseColors.length)])
    const x = Math.random() * pageWidth
    const y = Math.random() * pageHeight
    const size = Math.random() * 4 + 0.3
    pdf.circle(x, y, size, 'F')
  }

  // Randomize vignette (corners may be different sizes)
  const vignetteOpacity = 0.08 + Math.random() * 0.12
  const vignetteGState = (pdf as any).GState({ opacity: vignetteOpacity })
  pdf.setGState(vignetteGState)
  pdf.setFillColor('#1c1917')

  // Each corner gets a random size (20-60)
  const cornerSizes = [
    20 + Math.random() * 40,
    20 + Math.random() * 40,
    20 + Math.random() * 40,
    20 + Math.random() * 40,
  ]
  pdf.triangle(0, 0, cornerSizes[0], 0, 0, cornerSizes[0], 'F')
  pdf.triangle(pageWidth, 0, pageWidth - cornerSizes[1], 0, pageWidth, cornerSizes[1], 'F')
  pdf.triangle(0, pageHeight, cornerSizes[2], pageHeight, 0, pageHeight - cornerSizes[2], 'F')
  pdf.triangle(pageWidth, pageHeight, pageWidth - cornerSizes[3], pageHeight, pageWidth, pageHeight - cornerSizes[3], 'F')

  pdf.restoreGraphicsState()
}

// PDF Generation
let previewDebounce: ReturnType<typeof setTimeout> | null = null

const generatePreview = async () => {
  if (isGeneratingPreview.value) return
  isGeneratingPreview.value = true

  try {
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4')

    // Set PDF document properties
    const docConfig = DOCUMENT_TYPE_CONFIG[invoice.value.documentType]
    const docTitle = documentTypeTitle(invoice.value.documentType)
    const invoiceTitle = invoice.value.number || docTitle
    pdf.setProperties({
      title: invoiceTitle,
      subject: `${docTitle} ${invoiceTitle}`,
      creator: 'Invoice Generator',
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let y = margin

    // Add watermark
    const addWatermark = () => {
      pdf.saveGraphicsState()

      // Add diagonal text watermark
      const textGState = (pdf as any).GState({ opacity: 0.08 })
      pdf.setGState(textGState)
      pdf.setFontSize(48)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor('#78716c')

      // Draw "SAMPLE {TYPE}" diagonally across the page
      const text = `SAMPLE ${docTitle}`
      for (let i = -1; i <= 1; i++) {
        const yPos = (pageHeight / 2) + (i * 80)
        pdf.text(text, pageWidth / 2, yPos, { angle: -35, align: 'center' })
      }

      pdf.restoreGraphicsState()
    }

    if (!hideBranding.value) addWatermark()

    const addText = (text: string, x: number, yPos: number, size = 9, style = 'normal', align = 'left', color = '#374151') => {
      pdf.setFontSize(size)
      pdf.setFont('helvetica', style)
      pdf.setTextColor(color)
      let finalX = x
      if (align === 'right') finalX = x - pdf.getTextWidth(text)
      else if (align === 'center') finalX = x - pdf.getTextWidth(text) / 2
      pdf.text(text, finalX, yPos)
    }

    // Header
    y += 5
    if (invoice.value.logo) {
      try { pdf.addImage(invoice.value.logo, 'JPEG', margin, y, 18, 18) } catch {}
    }
    addText(docTitle, invoice.value.logo ? margin + 25 : margin, y + 10, 24, 'bold', 'left', '#1c1917')
    addText(invoice.value.number || 'Draft', invoice.value.logo ? margin + 25 : margin, y + 16, 10, 'normal', 'left', '#78716c')

    addText(`${t('date')}: ${formatDate(invoice.value.date)}`, pageWidth - margin, y + 8, 9, 'normal', 'right', '#78716c')
    if (docConfig.hasDueDate) {
      addText(`${t('due')}: ${formatDate(invoice.value.dueDate)}`, pageWidth - margin, y + 14, 9, 'normal', 'right', '#78716c')
    }

    y += 35

    // Payment method for receipts
    if (docConfig.hasPaymentMethod && invoice.value.paymentMethod) {
      const methodLabels: Record<string, string> = { cash: 'Cash', credit_card: 'Credit Card', bank_transfer: 'Bank Transfer', check: 'Check' }
      addText(`${t('paymentMethod')}: ${methodLabels[invoice.value.paymentMethod] || invoice.value.paymentMethod}`, pageWidth - margin, y - 16, 9, 'normal', 'right', '#78716c')
    }

    // From / To
    const pdfFromLabel = docConfig.hasPrices === false && invoice.value.documentType === 'delivery_note' ? t('supplier') : t('from')
    const pdfToLabel = docConfig.hasPrices === false && invoice.value.documentType === 'delivery_note' ? t('deliveredTo') : t('to')
    addText(pdfFromLabel, margin, y, 8, 'bold', 'left', '#a8a29e')
    addText(pdfToLabel, pageWidth / 2 + 10, y, 8, 'bold', 'left', '#a8a29e')
    y += 6

    if (invoice.value.from.businessName) { addText(invoice.value.from.businessName, margin, y, 10, 'bold', 'left', '#1c1917'); y += 5 }
    let fromY = y
    if (invoice.value.from.email) { addText(invoice.value.from.email, margin, y, 9); y += 4 }
    if (invoice.value.from.address) { addText(invoice.value.from.address, margin, y, 9); y += 4 }
    if (invoice.value.from.phone) { addText(invoice.value.from.phone, margin, y, 9); y += 4 }
    if (invoice.value.from.taxId) { addText(`${t('taxId')}: ${invoice.value.from.taxId}`, margin, y, 8, 'normal', 'left', '#a8a29e'); y += 4 }

    let toY = fromY - 5
    if (invoice.value.to.customerName) { addText(invoice.value.to.customerName, pageWidth / 2 + 10, toY, 10, 'bold', 'left', '#1c1917'); toY += 5 }
    if (invoice.value.to.email) { addText(invoice.value.to.email, pageWidth / 2 + 10, toY, 9); toY += 4 }
    if (invoice.value.to.address) { addText(invoice.value.to.address, pageWidth / 2 + 10, toY, 9); toY += 4 }
    if (invoice.value.to.phone) { addText(invoice.value.to.phone, pageWidth / 2 + 10, toY, 9); toY += 4 }
    if (invoice.value.to.taxId) { addText(`${t('taxId')}: ${invoice.value.to.taxId}`, pageWidth / 2 + 10, toY, 8, 'normal', 'left', '#a8a29e') }

    y = Math.max(y, toY) + 15

    // Table
    pdf.setDrawColor('#e7e5e4')
    pdf.setLineWidth(0.3)
    pdf.line(margin, y, pageWidth - margin, y)
    y += 6

    addText(t('description'), margin, y, 8, 'bold', 'left', '#a8a29e')
    addText(t('qty'), docConfig.hasPrices ? pageWidth - margin - 60 : pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
    if (docConfig.hasPrices) {
      addText(t('price'), pageWidth - margin - 30, y, 8, 'bold', 'right', '#a8a29e')
      addText(t('total'), pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
    }
    y += 3
    pdf.line(margin, y, pageWidth - margin, y)
    y += 6

    if (invoice.value.items.length === 0) {
      addText(t('noItems'), pageWidth / 2, y + 10, 9, 'normal', 'center', '#a8a29e')
      y += 25
    } else {
      invoice.value.items.forEach(item => {
        const desc = item.description?.length > 40 ? item.description.substring(0, 37) + '...' : (item.description || '—')
        addText(desc, margin, y, 9, 'normal', 'left', '#1c1917')
        addText(String(item.quantity), docConfig.hasPrices ? pageWidth - margin - 60 : pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
        if (docConfig.hasPrices) {
          addText(`${currency.value}${item.price.toFixed(2)}`, pageWidth - margin - 30, y, 9, 'normal', 'right', '#57534e')
          addText(`${currency.value}${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#1c1917')
        }
        y += 7
      })
    }

    y += 5
    pdf.line(margin, y, pageWidth - margin, y)
    y += 12

    // Totals
    if (docConfig.hasTotals) {
      addText(t('subtotal'), pageWidth - margin - 40, y, 9, 'normal', 'left', '#78716c')
      addText(`${currency.value}${subtotal.value.toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
      y += 6
      addText(t('tax'), pageWidth - margin - 40, y, 9, 'normal', 'left', '#78716c')
      addText(`${currency.value}${totalTax.value.toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
      y += 8
      pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y)
      y += 6
      addText(t('total'), pageWidth - margin - 40, y, 10, 'bold', 'left', '#1c1917')
      addText(`${currency.value}${total.value.toFixed(2)}`, pageWidth - margin, y, 10, 'bold', 'right', '#1c1917')
    }

    // Notes and Payment Terms
    const showNotes = invoice.value.notes
    const showTerms = docConfig.hasTerms && invoice.value.terms
    if (showNotes || showTerms) {
      y += 20
      pdf.line(margin, y, pageWidth - margin, y)
      y += 10

      if (showNotes) {
        addText(t('notes'), margin, y, 8, 'bold', 'left', '#a8a29e')
        y += 6
        const notesLines = pdf.splitTextToSize(invoice.value.notes, contentWidth)
        notesLines.forEach((line: string) => {
          addText(line, margin, y, 9, 'normal', 'left', '#57534e')
          y += 5
        })
        y += 5
      }

      if (showTerms) {
        addText(t('paymentTerms'), margin, y, 8, 'bold', 'left', '#a8a29e')
        y += 6
        const termsLines = pdf.splitTextToSize(invoice.value.terms, contentWidth)
        termsLines.forEach((line: string) => {
          addText(line, margin, y, 9, 'normal', 'left', '#57534e')
          y += 5
        })
      }
    }

    // Add bad scan effect if enabled
    if (chaosEnabled.value && chaosConfig.value.enableBadScanEffect) {
      applyBadScanEffect(pdf, pageWidth, pageHeight)
    }

    if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value.split('#')[0])
    pdfPreviewUrl.value = URL.createObjectURL(pdf.output('blob')) + `#${invoice.value.number || 'invoice'}.pdf`
  } catch (e) {
    console.error('PDF error:', e)
  } finally {
    isGeneratingPreview.value = false
  }
}

const debouncedPreview = () => {
  if (previewDebounce) clearTimeout(previewDebounce)
  previewDebounce = setTimeout(generatePreview, 400)
}

// Bulk export state
const isBulkExporting = ref(false)
const bulkExportProgress = ref({ current: 0, total: 0 })

// Generate PDF blob for any invoice (reusable for bulk export)
const generatePDFBlob = async (invoiceData: Invoice): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf')
  const pdf = new jsPDF('p', 'mm', 'a4')

  const blobDocConfig = DOCUMENT_TYPE_CONFIG[invoiceData.documentType || 'invoice']
  const blobDocTitle = documentTypeTitle(invoiceData.documentType || 'invoice')

  // Calculate totals for this invoice
  const calcSubtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const calcTotalTax = invoiceData.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.price
    return sum + (itemSubtotal * item.tax) / 100
  }, 0)
  const calcTotal = calcSubtotal + calcTotalTax

  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Set PDF document properties
  const invoiceTitle = invoiceData.number || blobDocTitle
  pdf.setProperties({
    title: invoiceTitle,
    subject: `${blobDocTitle} ${invoiceTitle}`,
    creator: 'Invoice Generator',
  })

  // Add watermark
  pdf.saveGraphicsState()
  const textGState = (pdf as any).GState({ opacity: 0.08 })
  pdf.setGState(textGState)
  pdf.setFontSize(48)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor('#78716c')
  const wmText = `SAMPLE ${blobDocTitle}`
  for (let i = -1; i <= 1; i++) {
    pdf.text(wmText, pageWidth / 2, (pageHeight / 2) + (i * 80), { angle: -35, align: 'center' })
  }
  pdf.restoreGraphicsState()

  const addText = (text: string, x: number, yPos: number, size = 9, style = 'normal', align = 'left', color = '#374151') => {
    pdf.setFontSize(size)
    pdf.setFont('helvetica', style)
    pdf.setTextColor(color)
    let finalX = x
    if (align === 'right') finalX = x - pdf.getTextWidth(text)
    pdf.text(text, finalX, yPos)
  }

  // Header
  y += 5
  if (invoiceData.logo) { try { pdf.addImage(invoiceData.logo, 'JPEG', margin, y, 18, 18) } catch {} }
  addText(blobDocTitle, invoiceData.logo ? margin + 25 : margin, y + 10, 24, 'bold', 'left', '#1c1917')
  addText(invoiceData.number || 'Draft', invoiceData.logo ? margin + 25 : margin, y + 16, 10, 'normal', 'left', '#78716c')
  addText(`${t('date')}: ${formatDate(invoiceData.date)}`, pageWidth - margin, y + 8, 9, 'normal', 'right', '#78716c')
  if (blobDocConfig.hasDueDate) {
    addText(`${t('due')}: ${formatDate(invoiceData.dueDate)}`, pageWidth - margin, y + 14, 9, 'normal', 'right', '#78716c')
  }
  y += 35

  // Payment method for receipts
  if (blobDocConfig.hasPaymentMethod && invoiceData.paymentMethod) {
    const methodLabels: Record<string, string> = { cash: 'Cash', credit_card: 'Credit Card', bank_transfer: 'Bank Transfer', check: 'Check' }
    addText(`${t('paymentMethod')}: ${methodLabels[invoiceData.paymentMethod] || invoiceData.paymentMethod}`, pageWidth - margin, y - 16, 9, 'normal', 'right', '#78716c')
  }

  // From/To
  const blobFromLabel = invoiceData.documentType === 'delivery_note' ? t('supplier') : t('from')
  const blobToLabel = invoiceData.documentType === 'delivery_note' ? t('deliveredTo') : t('to')
  addText(blobFromLabel, margin, y, 8, 'bold', 'left', '#a8a29e')
  addText(blobToLabel, pageWidth / 2 + 10, y, 8, 'bold', 'left', '#a8a29e')
  y += 6
  if (invoiceData.from.businessName) { addText(invoiceData.from.businessName, margin, y, 10, 'bold', 'left', '#1c1917'); y += 5 }
  let fromY = y
  if (invoiceData.from.email) { addText(invoiceData.from.email, margin, y, 9); y += 4 }
  if (invoiceData.from.address) { addText(invoiceData.from.address, margin, y, 9); y += 4 }
  if (invoiceData.from.phone) { addText(invoiceData.from.phone, margin, y, 9); y += 4 }
  if (invoiceData.from.taxId) { addText(`${t('taxId')}: ${invoiceData.from.taxId}`, margin, y, 8, 'normal', 'left', '#a8a29e'); y += 4 }

  let toY = fromY - 5
  if (invoiceData.to.customerName) { addText(invoiceData.to.customerName, pageWidth / 2 + 10, toY, 10, 'bold', 'left', '#1c1917'); toY += 5 }
  if (invoiceData.to.email) { addText(invoiceData.to.email, pageWidth / 2 + 10, toY, 9); toY += 4 }
  if (invoiceData.to.address) { addText(invoiceData.to.address, pageWidth / 2 + 10, toY, 9); toY += 4 }
  if (invoiceData.to.phone) { addText(invoiceData.to.phone, pageWidth / 2 + 10, toY, 9); toY += 4 }
  if (invoiceData.to.taxId) { addText(`${t('taxId')}: ${invoiceData.to.taxId}`, pageWidth / 2 + 10, toY, 8, 'normal', 'left', '#a8a29e') }

  // Items table
  y = Math.max(y, toY) + 15
  pdf.setDrawColor('#e7e5e4')
  pdf.setLineWidth(0.3)
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6
  addText(t('description'), margin, y, 8, 'bold', 'left', '#a8a29e')
  addText(t('qty'), blobDocConfig.hasPrices ? pageWidth - margin - 60 : pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
  if (blobDocConfig.hasPrices) {
    addText(t('price'), pageWidth - margin - 30, y, 8, 'bold', 'right', '#a8a29e')
    addText(t('total'), pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
  }
  y += 3
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  invoiceData.items.forEach(item => {
    const desc = item.description?.length > 40 ? item.description.substring(0, 37) + '...' : (item.description || '—')
    addText(desc, margin, y, 9, 'normal', 'left', '#1c1917')
    addText(String(item.quantity), blobDocConfig.hasPrices ? pageWidth - margin - 60 : pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
    if (blobDocConfig.hasPrices) {
      addText(`${currency.value}${item.price.toFixed(2)}`, pageWidth - margin - 30, y, 9, 'normal', 'right', '#57534e')
      addText(`${currency.value}${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#1c1917')
    }
    y += 7
  })

  // Totals
  y += 5
  pdf.line(margin, y, pageWidth - margin, y)
  y += 12
  if (blobDocConfig.hasTotals) {
    addText(t('subtotal'), pageWidth - margin - 40, y, 9, 'normal', 'left', '#78716c')
    addText(`${currency.value}${calcSubtotal.toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
    y += 6
    addText(t('tax'), pageWidth - margin - 40, y, 9, 'normal', 'left', '#78716c')
    addText(`${currency.value}${calcTotalTax.toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
    y += 8
    pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y)
    y += 6
    addText(t('total'), pageWidth - margin - 40, y, 10, 'bold', 'left', '#1c1917')
    addText(`${currency.value}${calcTotal.toFixed(2)}`, pageWidth - margin, y, 10, 'bold', 'right', '#1c1917')
  }

  // Notes and Terms
  const blobShowNotes = invoiceData.notes
  const blobShowTerms = blobDocConfig.hasTerms && invoiceData.terms
  if (blobShowNotes || blobShowTerms) {
    y += 20
    pdf.line(margin, y, pageWidth - margin, y)
    y += 10
    if (blobShowNotes) {
      addText(t('notes'), margin, y, 8, 'bold', 'left', '#a8a29e')
      y += 6
      const notesLines = pdf.splitTextToSize(invoiceData.notes, contentWidth)
      notesLines.forEach((line: string) => { addText(line, margin, y, 9, 'normal', 'left', '#57534e'); y += 5 })
      y += 5
    }
    if (blobShowTerms) {
      addText(t('paymentTerms'), margin, y, 8, 'bold', 'left', '#a8a29e')
      y += 6
      const termsLines = pdf.splitTextToSize(invoiceData.terms, contentWidth)
      termsLines.forEach((line: string) => { addText(line, margin, y, 9, 'normal', 'left', '#57534e'); y += 5 })
    }
  }

  // Return as blob
  return pdf.output('blob')
}

// Export all history
const handleExportAll = async (format: 'zip' | 'json' | 'csv') => {
  if (invoiceHistory.value.length === 0) {
    showToast('No invoices to export', 'error')
    return
  }

  isBulkExporting.value = true
  bulkExportProgress.value = { current: 0, total: invoiceHistory.value.length }

  try {
    if (format === 'zip') {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()

      for (let i = 0; i < invoiceHistory.value.length; i++) {
        const savedInvoice = invoiceHistory.value[i]
        bulkExportProgress.value.current = i + 1

        const pdfBlob = await generatePDFBlob(savedInvoice.invoice)
        const filename = `${savedInvoice.invoice.number || `invoice-${i + 1}`}.pdf`
        zip.file(filename, pdfBlob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(zipBlob)
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.zip`
      a.click()
      URL.revokeObjectURL(a.href)
    } else if (format === 'json') {
      const exportData = invoiceHistory.value.map(saved => ({
        ...saved,
        invoice: { ...saved.invoice, logo: undefined } // Exclude logos for smaller file
      }))
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(a.href)
    } else if (format === 'csv') {
      const headers = ['Document Type', 'Number', 'Date', 'Due Date', 'From', 'To', 'Items', 'Subtotal', 'Tax', 'Total', 'Saved At']
      const rows = invoiceHistory.value.map(saved => {
        const inv = saved.invoice
        const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
        const tax = inv.items.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0)
        return [
          saved.documentType || inv.documentType || 'invoice',
          inv.number,
          inv.date,
          inv.dueDate,
          inv.from.businessName,
          inv.to.customerName,
          inv.items.length,
          subtotal.toFixed(2),
          tax.toFixed(2),
          (subtotal + tax).toFixed(2),
          saved.savedAt
        ]
      })
      const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    }

    showToast(`Exported ${invoiceHistory.value.length} invoices`)
  } catch (e) {
    console.error(e)
    showToast('Export failed', 'error')
  } finally {
    isBulkExporting.value = false
    bulkExportProgress.value = { current: 0, total: 0 }
  }
}

// Export handlers
const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
  isExporting.value = true
  exportingFormat.value = format

  const expDocConfig = DOCUMENT_TYPE_CONFIG[invoice.value.documentType]
  const expDocTitle = documentTypeTitle(invoice.value.documentType)

  try {
    if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const invoiceTitle = invoice.value.number || expDocTitle
      pdf.setProperties({
        title: invoiceTitle,
        subject: `${expDocTitle} ${invoiceTitle}`,
        creator: 'Invoice Generator',
      })

      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let y = margin

      // Add watermark to export
      pdf.saveGraphicsState()
      const textGState = (pdf as any).GState({ opacity: 0.08 })
      pdf.setGState(textGState)
      pdf.setFontSize(48)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor('#78716c')
      const wmText = `SAMPLE ${expDocTitle}`
      for (let i = -1; i <= 1; i++) {
        pdf.text(wmText, pageWidth / 2, (pageHeight / 2) + (i * 80), { angle: -35, align: 'center' })
      }
      pdf.restoreGraphicsState()

      const addText = (text: string, x: number, yPos: number, size = 9, style = 'normal', align = 'left', color = '#374151') => {
        pdf.setFontSize(size)
        pdf.setFont('helvetica', style)
        pdf.setTextColor(color)
        let finalX = x
        if (align === 'right') finalX = x - pdf.getTextWidth(text)
        pdf.text(text, finalX, yPos)
      }

      y += 5
      if (invoice.value.logo) { try { pdf.addImage(invoice.value.logo, 'JPEG', margin, y, 18, 18) } catch {} }
      addText(expDocTitle, invoice.value.logo ? margin + 25 : margin, y + 10, 24, 'bold', 'left', '#1c1917')
      addText(invoice.value.number || 'Draft', invoice.value.logo ? margin + 25 : margin, y + 16, 10, 'normal', 'left', '#78716c')
      addText(`${t('date')}: ${formatDate(invoice.value.date)}`, pageWidth - margin, y + 8, 9, 'normal', 'right', '#78716c')
      if (expDocConfig.hasDueDate) {
        addText(`${t('due')}: ${formatDate(invoice.value.dueDate)}`, pageWidth - margin, y + 14, 9, 'normal', 'right', '#78716c')
      }
      y += 35

      // Payment method for receipts
      if (expDocConfig.hasPaymentMethod && invoice.value.paymentMethod) {
        const methodLabels: Record<string, string> = { cash: 'Cash', credit_card: 'Credit Card', bank_transfer: 'Bank Transfer', check: 'Check' }
        addText(`${t('paymentMethod')}: ${methodLabels[invoice.value.paymentMethod] || invoice.value.paymentMethod}`, pageWidth - margin, y - 16, 9, 'normal', 'right', '#78716c')
      }

      addText(t('from'), margin, y, 8, 'bold', 'left', '#a8a29e')
      addText(t('to'), pageWidth / 2 + 10, y, 8, 'bold', 'left', '#a8a29e')
      y += 6

      if (invoice.value.from.businessName) { addText(invoice.value.from.businessName, margin, y, 10, 'bold', 'left', '#1c1917'); y += 5 }
      let fromY = y
      if (invoice.value.from.email) { addText(invoice.value.from.email, margin, y, 9); y += 4 }
      if (invoice.value.from.address) { addText(invoice.value.from.address, margin, y, 9); y += 4 }
      if (invoice.value.from.phone) { addText(invoice.value.from.phone, margin, y, 9); y += 4 }
      if (invoice.value.from.taxId) { addText(`${t('taxId')}: ${invoice.value.from.taxId}`, margin, y, 8, 'normal', 'left', '#a8a29e'); y += 4 }

      let toY = fromY - 5
      if (invoice.value.to.customerName) { addText(invoice.value.to.customerName, pageWidth / 2 + 10, toY, 10, 'bold', 'left', '#1c1917'); toY += 5 }
      if (invoice.value.to.email) { addText(invoice.value.to.email, pageWidth / 2 + 10, toY, 9); toY += 4 }
      if (invoice.value.to.address) { addText(invoice.value.to.address, pageWidth / 2 + 10, toY, 9); toY += 4 }
      if (invoice.value.to.phone) { addText(invoice.value.to.phone, pageWidth / 2 + 10, toY, 9); toY += 4 }
      if (invoice.value.to.taxId) { addText(`${t('taxId')}: ${invoice.value.to.taxId}`, pageWidth / 2 + 10, toY, 8, 'normal', 'left', '#a8a29e') }

      y = Math.max(y, toY) + 15
      pdf.setDrawColor('#e7e5e4')
      pdf.setLineWidth(0.3)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 6

      addText(t('description'), margin, y, 8, 'bold', 'left', '#a8a29e')
      addText(t('qty'), expDocConfig.hasPrices ? pageWidth - margin - 60 : pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
      if (expDocConfig.hasPrices) {
        addText(t('price'), pageWidth - margin - 30, y, 8, 'bold', 'right', '#a8a29e')
        addText(t('total'), pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
      }
      y += 3
      pdf.line(margin, y, pageWidth - margin, y)
      y += 6

      invoice.value.items.forEach(item => {
        const desc = item.description?.length > 40 ? item.description.substring(0, 37) + '...' : (item.description || '—')
        addText(desc, margin, y, 9, 'normal', 'left', '#1c1917')
        addText(String(item.quantity), expDocConfig.hasPrices ? pageWidth - margin - 60 : pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
        if (expDocConfig.hasPrices) {
          addText(`${currency.value}${item.price.toFixed(2)}`, pageWidth - margin - 30, y, 9, 'normal', 'right', '#57534e')
          addText(`${currency.value}${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#1c1917')
        }
        y += 7
      })

      y += 5
      pdf.line(margin, y, pageWidth - margin, y)
      y += 12
      if (expDocConfig.hasTotals) {
        addText(t('subtotal'), pageWidth - margin - 40, y, 9, 'normal', 'left', '#78716c')
        addText(`${currency.value}${subtotal.value.toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
        y += 6
        addText(t('tax'), pageWidth - margin - 40, y, 9, 'normal', 'left', '#78716c')
        addText(`${currency.value}${totalTax.value.toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#57534e')
        y += 8
        pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y)
        y += 6
        addText(t('total'), pageWidth - margin - 40, y, 10, 'bold', 'left', '#1c1917')
        addText(`${currency.value}${total.value.toFixed(2)}`, pageWidth - margin, y, 10, 'bold', 'right', '#1c1917')
      }

      // Notes and Payment Terms
      const expShowNotes = invoice.value.notes
      const expShowTerms = expDocConfig.hasTerms && invoice.value.terms
      if (expShowNotes || expShowTerms) {
        y += 20
        pdf.line(margin, y, pageWidth - margin, y)
        y += 10

        if (expShowNotes) {
          addText(t('notes'), margin, y, 8, 'bold', 'left', '#a8a29e')
          y += 6
          const notesLines = pdf.splitTextToSize(invoice.value.notes, contentWidth)
          notesLines.forEach((line: string) => {
            addText(line, margin, y, 9, 'normal', 'left', '#57534e')
            y += 5
          })
          y += 5
        }

        if (expShowTerms) {
          addText(t('paymentTerms'), margin, y, 8, 'bold', 'left', '#a8a29e')
          y += 6
          const termsLines = pdf.splitTextToSize(invoice.value.terms, contentWidth)
          termsLines.forEach((line: string) => {
            addText(line, margin, y, 9, 'normal', 'left', '#57534e')
            y += 5
          })
        }
      }

      // Add bad scan effect if enabled
      if (chaosEnabled.value && chaosConfig.value.enableBadScanEffect) {
        applyBadScanEffect(pdf, pageWidth, pageHeight)
      }

      pdf.save(`${invoice.value.number || 'invoice'}.pdf`)
    } else if (format === 'excel') {
      const { default: XLSX } = await import('xlsx')
      const wb = XLSX.utils.book_new()
      const data: (string | number)[][] = [
        ['Type', expDocTitle],
        [expDocTitle, invoice.value.number],
        ['Date', formatDate(invoice.value.date)],
        ...(expDocConfig.hasDueDate ? [['Due', formatDate(invoice.value.dueDate)]] : []),
        [],
        ['From', invoice.value.from.businessName],
        ['To', invoice.value.to.customerName],
        [],
      ]
      if (expDocConfig.hasPrices) {
        data.push(['Description', 'Qty', 'Price', 'Total'])
        data.push(...invoice.value.items.map(i => [i.description, i.quantity, i.price, i.quantity * i.price]))
        data.push([])
        data.push(['Subtotal', '', '', subtotal.value])
        data.push(['Tax', '', '', totalTax.value])
        data.push(['Total', '', '', total.value])
      } else {
        data.push(['Description', 'Qty'])
        data.push(...invoice.value.items.map(i => [i.description, i.quantity]))
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), expDocTitle)
      XLSX.writeFile(wb, `${invoice.value.number || 'document'}.xlsx`)
    } else if (format === 'csv') {
      const rows: (string | number)[][] = expDocConfig.hasPrices
        ? [
            ['Description', 'Qty', 'Price', 'Total'],
            ...invoice.value.items.map(i => [i.description, i.quantity, i.price, i.quantity * i.price]),
            [],
            ['Subtotal', '', '', subtotal.value],
            ['Total', '', '', total.value]
          ]
        : [
            ['Description', 'Qty'],
            ...invoice.value.items.map(i => [i.description, i.quantity]),
          ]
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${invoice.value.number || 'document'}.csv`
      a.click()
    } else {
      const { logo, ...rest } = invoice.value
      const blob = new Blob([JSON.stringify({ documentType: invoice.value.documentType, invoice: rest, total: total.value }, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${invoice.value.number || 'document'}.json`
      a.click()
    }
    showToast('Exported')
    showExport.value = false

    // Show success feedback
    justExported.value = true
    setTimeout(() => { justExported.value = false }, 1500)
    showToast('Exported successfully')
  } catch (e) {
    console.error(e)
    showToast('Export failed', 'error')
  } finally {
    isExporting.value = false
    exportingFormat.value = null
  }
}

// Lifecycle
watch([invoice, currency, language], debouncedPreview, { deep: true })

watch(invoice, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

onMounted(async () => {
  try {
    // Initialize shared state from useInvoice (loads history from localStorage)
    initializeInvoice()

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      invoice.value = {
        ...invoice.value,
        ...parsed,
        documentType: parsed.documentType || 'invoice',
        paymentMethod: parsed.paymentMethod || '',
      }
    }

    const savedCustomers = localStorage.getItem(CUSTOMERS_KEY)
    if (savedCustomers) customers.value = JSON.parse(savedCustomers)

    const logo = localStorage.getItem(LOGO_KEY)
    if (logo && !invoice.value.logo) invoice.value.logo = logo

    language.value = localStorage.getItem(LANGUAGE_KEY) || 'EN'

  } catch (e) { console.error(e) }

  generatePreview()
})

onUnmounted(() => {
  if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value.split('#')[0])
  if (previewDebounce) clearTimeout(previewDebounce)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Remove default focus styles and add subtle custom ones */
input:focus,
textarea:focus,
select:focus {
  outline: none !important;
  box-shadow: none !important;
}

input:focus-visible,
textarea:focus-visible {
  outline: none !important;
}

/* Focus indicator for underline inputs */
input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="date"]:focus,
input[type="number"]:focus {
  background-color: rgba(245, 245, 244, 0.8);
  box-shadow: inset 0 -2px 0 0 #78716c;
}

/* Textarea focus */
textarea:focus {
  border-color: #1c1917 !important;
  background-color: rgba(245, 245, 244, 0.5);
}

/* Select focus */
select:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #78716c;
  border-radius: 0.25rem;
}

/* Interactive row items focus */
.focus-row:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px #a8a29e;
  border-radius: 0.25rem;
}

/* General focus ring for clickable elements */
[role="button"]:focus-visible,
a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #78716c;
  border-radius: 0.25rem;
}

/* ==================== */
/* BUTTON HIERARCHY     */
/* ==================== */

/* Primary - main CTA (Export) */
.btn-primary {
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2rem;
  padding: 0 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background-color: #1c1917;
  transition: all 150ms ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #292524;
}

.btn-primary:active:not(:disabled) {
  background-color: #44403c;
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1c1917;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Secondary - important but not primary (Save) */
.btn-secondary {
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #44403c;
  background-color: transparent;
  border: 1px solid #d6d3d1;
  transition: all 150ms ease;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #fafaf9;
  border-color: #a8a29e;
}

.btn-secondary:active:not(:disabled) {
  background-color: #f5f5f4;
}

.btn-secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #78716c;
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Success state for buttons */
.btn-success {
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #166534;
  background-color: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 0.25rem;
  transition: all 150ms ease;
}

/* Ghost - minimal text buttons (History, Clear) */
.btn-ghost {
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #78716c;
  background-color: transparent;
  border-radius: 0.25rem;
  transition: all 150ms ease;
}

.btn-ghost:hover:not(:disabled) {
  color: #1c1917;
  background-color: #f5f5f4;
}

.btn-ghost:active:not(:disabled) {
  background-color: #e7e5e4;
}

.btn-ghost:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #78716c;
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Loading spinner */
@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

.btn-spinner {
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] { -moz-appearance: textfield; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active { transition: transform 0.2s ease-out; }
.slide-leave-active { transition: transform 0.15s ease-in; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.slide-down-enter-active { transition: all 0.3s ease-out; }
.slide-down-leave-active { transition: all 0.2s ease-in; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-100%); }

.toast-enter-active { transition: all 0.2s ease-out; }
.toast-leave-active { transition: all 0.15s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(8px); }
.toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* Item list animations */
.item-list-enter-active { transition: all 0.3s ease-out; }
.item-list-leave-active { transition: all 0.2s ease-in; position: absolute; width: 100%; }
.item-list-enter-from { opacity: 0; transform: translateY(-10px); }
.item-list-leave-to { opacity: 0; transform: translateX(-20px); }
.item-list-move { transition: transform 0.3s ease; }
</style>
