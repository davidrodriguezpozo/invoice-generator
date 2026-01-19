<template>
  <div class="h-screen flex flex-col bg-stone-50">
    <!-- Minimal Header -->
    <header class="h-14 border-b border-stone-200 bg-white flex-shrink-0 px-3 sm:px-4 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-4 min-w-0">
        <h1 class="text-sm font-medium tracking-tight whitespace-nowrap"><span class="text-stone-400">Sample</span> <span class="text-stone-900">Invoice Generator</span></h1>
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
          :disabled="!canDownload"
          class="btn-secondary hidden sm:inline-flex"
        >
          Save
        </button>

        <button
          @click="showChaos = true"
          :class="[
            'hidden sm:inline-flex text-xs font-medium px-3 py-1.5 transition-colors',
            chaosEnabled
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:text-stone-900'
          ]"
          title="Generate chaotic test data"
        >
          Chaos
        </button>

        <button
          @click="showExport = true"
          :disabled="!canDownload"
          class="btn-primary inline-flex"
        >
          Export
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Number</label>
              <input
                v-model="invoice.number"
                type="text"
                placeholder="INV-001"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"
              />
            </div>
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Date</label>
              <input
                v-model="invoice.date"
                type="date"
                class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"
              />
            </div>
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Due</label>
              <input
                v-model="invoice.dueDate"
                type="date"
                class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"
              />
            </div>
          </div>

          <!-- From / To -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div class="space-y-3">
              <label class="block text-[10px] uppercase tracking-wider text-stone-400">From</label>
              <input
                v-model="invoice.from.businessName"
                type="text"
                placeholder="Your business"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
              />
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
                <label class="block text-[10px] uppercase tracking-wider text-stone-400">To</label>
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

              <input
                v-model="invoice.to.customerName"
                type="text"
                placeholder="Client name"
                class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"
              />
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
              <div class="hidden sm:grid grid-cols-12 gap-2 pb-2 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-400">
                <div class="col-span-5">Description</div>
                <div class="col-span-1 text-center">Qty</div>
                <div class="col-span-2 text-right">Price</div>
                <div class="col-span-1 text-center">Tax %</div>
                <div class="col-span-2 text-right">Total</div>
                <div class="col-span-1"></div>
              </div>

              <!-- Desktop Items -->
              <div
                v-for="(item, index) in invoice.items"
                :key="item.id"
                class="hidden sm:grid grid-cols-12 gap-2 py-3 border-b border-stone-100 group items-center hover:bg-stone-50/50 transition-colors -mx-2 px-2"
              >
                <div class="col-span-5">
                  <input
                    v-model="item.description"
                    type="text"
                    placeholder="Item description"
                    class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 focus:ring-0 p-0 bg-transparent"
                  />
                </div>
                <div class="col-span-1">
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full text-sm text-stone-900 text-center border-0 focus:ring-0 p-0 tabular-nums bg-transparent"
                  />
                </div>
                <div class="col-span-2">
                  <input
                    v-model.number="item.price"
                    type="number"
                    min="0"
                    step="0.01"
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
                    class="w-full text-sm text-stone-500 text-center border-0 focus:ring-0 p-0 tabular-nums bg-transparent"
                  />
                </div>
                <div class="col-span-2 text-sm text-stone-900 text-right tabular-nums font-medium">
                  {{ currency }}{{ ((item.quantity * item.price) * (1 + item.tax / 100)).toFixed(2) }}
                </div>
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

              <!-- Mobile Items (Card Layout) -->
              <div class="sm:hidden space-y-3 pt-2">
                <div
                  v-for="(item, index) in invoice.items"
                  :key="'mobile-' + item.id"
                  class="border border-stone-200 rounded-lg p-3 bg-white"
                >
                  <div class="flex items-start justify-between gap-2 mb-3">
                    <input
                      v-model="item.description"
                      type="text"
                      placeholder="Item description"
                      class="flex-1 text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 bg-transparent"
                    />
                    <button
                      @click="removeItem(index)"
                      class="text-stone-400 hover:text-red-500 p-1 -m-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    <div>
                      <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">Qty</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="1"
                        class="w-full text-sm text-stone-900 text-center border border-stone-200 rounded px-2 py-1 tabular-nums"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">Price</label>
                      <input
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full text-sm text-stone-900 border border-stone-200 rounded px-2 py-1 tabular-nums"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">Tax %</label>
                      <input
                        v-model.number="item.tax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        class="w-full text-sm text-stone-500 text-center border border-stone-200 rounded px-2 py-1 tabular-nums"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">Total</label>
                      <div class="text-sm text-stone-900 font-medium tabular-nums py-1 text-right">
                        {{ currency }}{{ ((item.quantity * item.price) * (1 + item.tax / 100)).toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tax Presets -->
              <div class="pt-3 pb-2 flex flex-wrap items-center gap-2">
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
              <div class="pt-4 space-y-2 border-t border-stone-200">
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
            <div>
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
          <div class="text-xs text-stone-400">Generating preview...</div>
        </div>
        <iframe
          v-else-if="pdfPreviewUrl"
          :src="pdfPreviewUrl"
          class="flex-1 w-full border-0"
          title="Invoice PDF Preview"
        />
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-xs text-stone-400">Preview will appear here</div>
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
            <span class="text-sm font-medium">History</span>
            <button @click="showHistory = false" class="text-stone-400 hover:text-stone-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                  <span class="text-sm font-medium text-stone-900">{{ saved.invoice.number }}</span>
                  <span class="text-xs text-stone-500 tabular-nums">{{ currency }}{{ saved.totalAmount.toFixed(2) }}</span>
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
              'px-4 py-2 text-xs font-medium shadow-lg',
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-stone-900 text-white'
            ]"
          >
            {{ toast.message }}
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
          @click="handleResetChaos"
          class="ml-2 text-stone-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import ChaosConfigModal from './components/ChaosConfigModal.vue'
import { useChaosMode } from './composables/useChaosMode'

const { chaosEnabled, generateChaoticInvoice, resetChaosMode, chaosOverrides } = useChaosMode()

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

interface SavedInvoice {
  id: string
  invoice: Invoice
  savedAt: string
  totalAmount: number
  customerName: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
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
  logo: null,
  from: { businessName: '', taxId: '', address: '', email: '', phone: '' },
  to: { customerName: '', taxId: '', address: '', email: '', phone: '' },
  items: [],
  notes: '',
  terms: ''
})

const invoiceHistory = ref<SavedInvoice[]>([])
const customers = ref<Customer[]>([])
const currency = ref('$')
const language = ref('EN')

// Translations
const translations: Record<string, Record<string, string>> = {
  EN: {
    invoice: 'INVOICE',
    from: 'FROM',
    to: 'TO',
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
    generatedWith: 'Generated with',
    by: 'by',
  },
  ES: {
    invoice: 'FACTURA',
    from: 'DE',
    to: 'PARA',
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
    generatedWith: 'Generado con',
    by: 'por',
  },
  FR: {
    invoice: 'FACTURE',
    from: 'DE',
    to: 'À',
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
    generatedWith: 'Généré avec',
    by: 'par',
  },
  DE: {
    invoice: 'RECHNUNG',
    from: 'VON',
    to: 'AN',
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
    generatedWith: 'Erstellt mit',
    by: 'von',
  },
}

const t = (key: string) => translations[language.value]?.[key] || translations.EN[key] || key

const showHistory = ref(false)
const showExport = ref(false)
const showChaos = ref(false)
const isExporting = ref(false)
const exportingFormat = ref<string | null>(null)
const showCustomerDropdown = ref(false)
const mobileView = ref<'form' | 'preview'>('form')
const toasts = ref<Toast[]>([])
const pdfPreviewUrl = ref<string | null>(null)
const isGeneratingPreview = ref(false)
const isDragging = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const watermarkLogo = ref<string | null>(null)

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

// Methods
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const id = uuidv4()
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
}

const addItem = () => {
  invoice.value.items.push({ id: uuidv4(), description: '', quantity: 1, price: 0, tax: 0 })
}

const removeItem = (index: number) => {
  invoice.value.items.splice(index, 1)
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
    invoice.value = {
      number: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logo: localStorage.getItem(LOGO_KEY),
      from: { businessName: '', taxId: '', address: '', email: '', phone: '' },
      to: { customerName: '', taxId: '', address: '', email: '', phone: '' },
      items: [],
      notes: '',
      terms: ''
    }
    resetChaosMode()
  }
}

const handleApplyChaos = () => {
  const chaoticInvoice = generateChaoticInvoice()
  // Preserve logo if exists
  const currentLogo = invoice.value.logo
  invoice.value = chaoticInvoice
  if (currentLogo) {
    invoice.value.logo = currentLogo
  }
  showChaos.value = false
  showToast('Chaos unleashed!')
}

const handleResetChaos = () => {
  resetChaosMode()
  showToast('Chaos mode disabled')
}

const handleSave = () => {
  if (!canDownload.value) return showToast('Fill required fields', 'error')

  invoiceHistory.value.unshift({
    id: uuidv4(),
    invoice: JSON.parse(JSON.stringify(invoice.value)),
    savedAt: new Date().toISOString(),
    totalAmount: total.value,
    customerName: invoice.value.to.customerName
  })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(invoiceHistory.value))
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

// PDF Generation
let previewDebounce: ReturnType<typeof setTimeout> | null = null

const generatePreview = async () => {
  if (isGeneratingPreview.value) return
  isGeneratingPreview.value = true

  try {
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4')

    // Set PDF document properties
    const invoiceTitle = invoice.value.number || 'Invoice'
    pdf.setProperties({
      title: invoiceTitle,
      subject: `Invoice ${invoiceTitle}`,
      creator: 'Numerand Invoice Generator',
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

      // Draw "SAMPLE INVOICE" diagonally across the page
      const text = 'SAMPLE INVOICE'
      for (let i = -1; i <= 1; i++) {
        const yPos = (pageHeight / 2) + (i * 80)
        pdf.text(text, pageWidth / 2, yPos, { angle: -35, align: 'center' })
      }

      pdf.restoreGraphicsState()
    }

    // Add footer with branding
    const addFooter = () => {
      const footerY = pageHeight - 12
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor('#a8a29e')

      // Draw a small heart shape
      const drawHeart = (x: number, y: number, size: number) => {
        pdf.setFillColor('#ef4444')
        const s = size
        pdf.ellipse(x - s * 0.25, y - s * 0.15, s * 0.28, s * 0.25, 'F')
        pdf.ellipse(x + s * 0.25, y - s * 0.15, s * 0.28, s * 0.25, 'F')
        pdf.triangle(x - s * 0.5, y, x + s * 0.5, y, x, y + s * 0.55, 'F')
      }

      // Calculate centered position
      const text1 = t('generatedWith')
      const text2 = `${t('by')} Numerand`
      const heartSize = 3
      const spacing = 1.8

      pdf.setFontSize(10)
      const text1Width = pdf.getTextWidth(text1)
      const text2Width = pdf.getTextWidth(text2)
      const totalWidth = text1Width + heartSize + text2Width + spacing * 2

      let startX = (pageWidth - totalWidth) / 2

      // Add logo if available
      if (watermarkLogo.value) {
        try {
          const logoSize = 5
          startX = (pageWidth - totalWidth - logoSize - spacing) / 2
          pdf.addImage(watermarkLogo.value, 'PNG', startX, footerY - 4, logoSize, logoSize)
          startX += logoSize + spacing
        } catch (e) {}
      }

      pdf.text(text1, startX, footerY)
      startX += text1Width + spacing
      drawHeart(startX + heartSize / 2, footerY - 1, heartSize)
      startX += heartSize + spacing
      pdf.setTextColor('#a8a29e')
      pdf.text(text2, startX, footerY)
    }

    addWatermark()

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
    addText(t('invoice'), invoice.value.logo ? margin + 25 : margin, y + 10, 24, 'bold', 'left', '#1c1917')
    addText(invoice.value.number || 'Draft', invoice.value.logo ? margin + 25 : margin, y + 16, 10, 'normal', 'left', '#78716c')

    addText(`${t('date')}: ${formatDate(invoice.value.date)}`, pageWidth - margin, y + 8, 9, 'normal', 'right', '#78716c')
    addText(`${t('due')}: ${formatDate(invoice.value.dueDate)}`, pageWidth - margin, y + 14, 9, 'normal', 'right', '#78716c')

    y += 35

    // From / To
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

    // Table
    pdf.setDrawColor('#e7e5e4')
    pdf.setLineWidth(0.3)
    pdf.line(margin, y, pageWidth - margin, y)
    y += 6

    addText(t('description'), margin, y, 8, 'bold', 'left', '#a8a29e')
    addText(t('qty'), pageWidth - margin - 60, y, 8, 'bold', 'right', '#a8a29e')
    addText(t('price'), pageWidth - margin - 30, y, 8, 'bold', 'right', '#a8a29e')
    addText(t('total'), pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
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
        addText(String(item.quantity), pageWidth - margin - 60, y, 9, 'normal', 'right', '#57534e')
        addText(`${currency.value}${item.price.toFixed(2)}`, pageWidth - margin - 30, y, 9, 'normal', 'right', '#57534e')
        addText(`${currency.value}${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#1c1917')
        y += 7
      })
    }

    y += 5
    pdf.line(margin, y, pageWidth - margin, y)
    y += 12

    // Totals
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

    // Notes and Payment Terms
    if (invoice.value.notes || invoice.value.terms) {
      y += 20
      pdf.line(margin, y, pageWidth - margin, y)
      y += 10

      if (invoice.value.notes) {
        addText(t('notes'), margin, y, 8, 'bold', 'left', '#a8a29e')
        y += 6
        const notesLines = pdf.splitTextToSize(invoice.value.notes, contentWidth)
        notesLines.forEach((line: string) => {
          addText(line, margin, y, 9, 'normal', 'left', '#57534e')
          y += 5
        })
        y += 5
      }

      if (invoice.value.terms) {
        addText(t('paymentTerms'), margin, y, 8, 'bold', 'left', '#a8a29e')
        y += 6
        const termsLines = pdf.splitTextToSize(invoice.value.terms, contentWidth)
        termsLines.forEach((line: string) => {
          addText(line, margin, y, 9, 'normal', 'left', '#57534e')
          y += 5
        })
      }
    }

    // Add footer
    addFooter()

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

// Export handlers
const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
  isExporting.value = true
  exportingFormat.value = format

  try {
    if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Set PDF document properties
      const invoiceTitle = invoice.value.number || 'Invoice'
      pdf.setProperties({
        title: invoiceTitle,
        subject: `Invoice ${invoiceTitle}`,
        creator: 'Numerand Invoice Generator',
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
      const wmText = 'SAMPLE INVOICE'
      for (let i = -1; i <= 1; i++) {
        pdf.text(wmText, pageWidth / 2, (pageHeight / 2) + (i * 80), { angle: -35, align: 'center' })
      }
      pdf.restoreGraphicsState()

      // Footer function for export
      const addFooter = () => {
        const footerY = pageHeight - 12
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor('#a8a29e')

        // Draw a small heart shape
        const drawHeart = (x: number, y: number, size: number) => {
          pdf.setFillColor('#ef4444')
          const s = size
          pdf.ellipse(x - s * 0.25, y - s * 0.15, s * 0.28, s * 0.25, 'F')
          pdf.ellipse(x + s * 0.25, y - s * 0.15, s * 0.28, s * 0.25, 'F')
          pdf.triangle(x - s * 0.5, y, x + s * 0.5, y, x, y + s * 0.55, 'F')
        }

        // Calculate centered position
        const text1 = t('generatedWith')
        const text2 = `${t('by')} Numerand`
        const heartSize = 3
        const spacing = 1.8

        pdf.setFontSize(10)
        const text1Width = pdf.getTextWidth(text1)
        const text2Width = pdf.getTextWidth(text2)
        const totalWidth = text1Width + heartSize + text2Width + spacing * 2

        let startX = (pageWidth - totalWidth) / 2

        // Add logo if available
        if (watermarkLogo.value) {
          try {
            const logoSize = 5
            startX = (pageWidth - totalWidth - logoSize - spacing) / 2
            pdf.addImage(watermarkLogo.value, 'PNG', startX, footerY - 4, logoSize, logoSize)
            startX += logoSize + spacing
          } catch (e) {}
        }

        pdf.text(text1, startX, footerY)
        startX += text1Width + spacing
        drawHeart(startX + heartSize / 2, footerY - 1, heartSize)
        startX += heartSize + spacing
        pdf.setTextColor('#a8a29e')
        pdf.text(text2, startX, footerY)
      }

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
      addText(t('invoice'), invoice.value.logo ? margin + 25 : margin, y + 10, 24, 'bold', 'left', '#1c1917')
      addText(invoice.value.number || 'Draft', invoice.value.logo ? margin + 25 : margin, y + 16, 10, 'normal', 'left', '#78716c')
      addText(`${t('date')}: ${formatDate(invoice.value.date)}`, pageWidth - margin, y + 8, 9, 'normal', 'right', '#78716c')
      addText(`${t('due')}: ${formatDate(invoice.value.dueDate)}`, pageWidth - margin, y + 14, 9, 'normal', 'right', '#78716c')
      y += 35

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
      addText(t('qty'), pageWidth - margin - 60, y, 8, 'bold', 'right', '#a8a29e')
      addText(t('price'), pageWidth - margin - 30, y, 8, 'bold', 'right', '#a8a29e')
      addText(t('total'), pageWidth - margin, y, 8, 'bold', 'right', '#a8a29e')
      y += 3
      pdf.line(margin, y, pageWidth - margin, y)
      y += 6

      invoice.value.items.forEach(item => {
        const desc = item.description?.length > 40 ? item.description.substring(0, 37) + '...' : (item.description || '—')
        addText(desc, margin, y, 9, 'normal', 'left', '#1c1917')
        addText(String(item.quantity), pageWidth - margin - 60, y, 9, 'normal', 'right', '#57534e')
        addText(`${currency.value}${item.price.toFixed(2)}`, pageWidth - margin - 30, y, 9, 'normal', 'right', '#57534e')
        addText(`${currency.value}${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, y, 9, 'normal', 'right', '#1c1917')
        y += 7
      })

      y += 5
      pdf.line(margin, y, pageWidth - margin, y)
      y += 12
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

      // Notes and Payment Terms
      if (invoice.value.notes || invoice.value.terms) {
        y += 20
        pdf.line(margin, y, pageWidth - margin, y)
        y += 10

        if (invoice.value.notes) {
          addText(t('notes'), margin, y, 8, 'bold', 'left', '#a8a29e')
          y += 6
          const notesLines = pdf.splitTextToSize(invoice.value.notes, contentWidth)
          notesLines.forEach((line: string) => {
            addText(line, margin, y, 9, 'normal', 'left', '#57534e')
            y += 5
          })
          y += 5
        }

        if (invoice.value.terms) {
          addText(t('paymentTerms'), margin, y, 8, 'bold', 'left', '#a8a29e')
          y += 6
          const termsLines = pdf.splitTextToSize(invoice.value.terms, contentWidth)
          termsLines.forEach((line: string) => {
            addText(line, margin, y, 9, 'normal', 'left', '#57534e')
            y += 5
          })
        }
      }

      // Add footer
      addFooter()

      pdf.save(`${invoice.value.number || 'invoice'}.pdf`)
    } else if (format === 'excel') {
      const { default: XLSX } = await import('xlsx')
      const wb = XLSX.utils.book_new()
      const data = [
        ['Invoice', invoice.value.number],
        ['Date', formatDate(invoice.value.date)],
        ['Due', formatDate(invoice.value.dueDate)],
        [],
        ['From', invoice.value.from.businessName],
        ['To', invoice.value.to.customerName],
        [],
        ['Description', 'Qty', 'Price', 'Total'],
        ...invoice.value.items.map(i => [i.description, i.quantity, i.price, i.quantity * i.price]),
        [],
        ['Subtotal', '', '', subtotal.value],
        ['Tax', '', '', totalTax.value],
        ['Total', '', '', total.value]
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Invoice')
      XLSX.writeFile(wb, `${invoice.value.number || 'invoice'}.xlsx`)
    } else if (format === 'csv') {
      const rows = [
        ['Description', 'Qty', 'Price', 'Total'],
        ...invoice.value.items.map(i => [i.description, i.quantity, i.price, i.quantity * i.price]),
        [],
        ['Subtotal', '', '', subtotal.value],
        ['Total', '', '', total.value]
      ]
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${invoice.value.number || 'invoice'}.csv`
      a.click()
    } else {
      const { logo, ...rest } = invoice.value
      const blob = new Blob([JSON.stringify({ invoice: rest, total: total.value }, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${invoice.value.number || 'invoice'}.json`
      a.click()
    }
    showToast('Exported')
    showExport.value = false
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
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) invoice.value = { ...invoice.value, ...JSON.parse(saved) }

    const history = localStorage.getItem(HISTORY_KEY)
    if (history) invoiceHistory.value = JSON.parse(history)

    const savedCustomers = localStorage.getItem(CUSTOMERS_KEY)
    if (savedCustomers) customers.value = JSON.parse(savedCustomers)

    const logo = localStorage.getItem(LOGO_KEY)
    if (logo && !invoice.value.logo) invoice.value.logo = logo

    language.value = localStorage.getItem(LANGUAGE_KEY) || 'EN'

    // Load watermark logo
    const response = await fetch('/invoice-generator/logo.png')
    const blob = await response.blob()
    const reader = new FileReader()
    reader.onload = () => {
      watermarkLogo.value = reader.result as string
    }
    reader.readAsDataURL(blob)
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

/* Subtle focus indicator for underline inputs */
input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="date"]:focus,
input[type="number"]:focus {
  background-color: rgba(245, 245, 244, 0.5);
}

/* Textarea focus */
textarea:focus {
  border-color: #1c1917 !important;
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
</style>
