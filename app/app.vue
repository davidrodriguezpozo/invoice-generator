<template>
  <div
    class="min-h-screen"
    style="background-color: var(--color-gray-50)"
  >
    <!-- Header -->
    <header style="background-color: var(--color-gray-50)">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center">
            <div>
              <h1
                class="text-2xl font-semibold"
                style="color: var(--color-gray-900)"
              >
                {{ t("invoiceGenerator") }}
              </h1>
              <p
                class="text-sm font-medium"
                style="color: var(--color-gray-500)"
              >
                {{ t("createProfessionalInvoices") }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="relative">
              <button
                @click="showThemeSelector = !showThemeSelector"
                class="text-sm border rounded-xl px-4 py-2.5 bg-white font-medium focus:outline-none focus:ring-2 transition-all flex items-center space-x-2"
                style="
                  border-color: var(--color-gray-200);
                  color: var(--color-gray-700);
                  --tw-ring-color: var(--color-gray-900);
                "
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{
                    backgroundColor: PDF_THEMES.find(
                      (t) => t.id === selectedTheme,
                    )?.primary,
                  }"
                ></div>
                <span>{{
                  PDF_THEMES.find((t) => t.id === selectedTheme)?.name
                }}</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              <div
                v-if="showThemeSelector"
                class="absolute top-full mt-2 right-0 bg-white border rounded-xl shadow-lg z-50 min-w-[200px]"
                style="border-color: var(--color-gray-200)"
              >
                <div class="p-2">
                  <div
                    v-for="theme in PDF_THEMES"
                    :key="theme.id"
                    @click="
                      selectedTheme = theme.id;
                      showThemeSelector = false;
                    "
                    class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
                    :class="{ 'bg-gray-50': selectedTheme === theme.id }"
                  >
                    <div
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: theme.primary }"
                    ></div>
                    <div class="flex-1">
                      <div
                        class="font-medium text-sm"
                        style="color: var(--color-gray-900)"
                      >
                        {{ theme.name }}
                      </div>
                      <div
                        class="text-xs"
                        style="color: var(--color-gray-500)"
                      >
                        {{ theme.description }}
                      </div>
                    </div>
                    <svg
                      v-if="selectedTheme === theme.id"
                      class="w-4 h-4"
                      style="color: var(--color-gray-900)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <select
              v-model="language"
              class="text-sm border rounded-xl px-4 py-2.5 bg-white font-medium focus:outline-none focus:ring-2 transition-all"
              style="
                border-color: var(--color-gray-200);
                color: var(--color-gray-700);
                --tw-ring-color: var(--color-gray-900);
              "
            >
              <option value="EN">🌐 EN</option>
              <option value="ES">🌐 ES</option>
            </select>
            <button
              @click="showCustomers = true"
              class="text-gray-600 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm border"
              style="
                border-color: var(--color-gray-200);
                color: var(--color-gray-600);
              "
              @mouseenter="
                $event.target.style.backgroundColor = 'var(--color-gray-100)'
              "
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
              <span>{{ t("customers") }}</span>
            </button>
            <button
              @click="showHistory = true"
              class="text-gray-600 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm border"
              style="
                border-color: var(--color-gray-200);
                color: var(--color-gray-600);
              "
              @mouseenter="
                $event.target.style.backgroundColor = 'var(--color-gray-100)'
              "
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{{ t("history") }}</span>
            </button>
            <button
              @click="saveCurrentInvoice"
              :disabled="!canDownload"
              class="text-gray-600 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm border disabled:opacity-50 disabled:cursor-not-allowed"
              style="
                border-color: var(--color-gray-200);
                color: var(--color-gray-600);
              "
              @mouseenter="
                !canDownload ||
                ($event.target.style.backgroundColor = 'var(--color-gray-100)')
              "
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <span>{{ t("save") }}</span>
            </button>
            <button
              @click="clearInvoice"
              class="text-gray-600 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm border"
              style="
                border-color: var(--color-gray-200);
                color: var(--color-gray-600);
              "
              @mouseenter="
                $event.target.style.backgroundColor = 'var(--color-gray-100)'
              "
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              <span>Clear</span>
            </button>
            <div class="relative">
              <button
                @click="showExportOptions = !showExportOptions"
                :disabled="!canDownload || isGeneratingPDF"
                class="text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style="background-color: var(--color-gray-900)"
                @mouseenter="
                  $event.target.style.backgroundColor = 'var(--color-gray-800)'
                "
                @mouseleave="
                  $event.target.style.backgroundColor = 'var(--color-gray-900)'
                "
              >
                <div
                  v-if="isGeneratingPDF"
                  class="absolute inset-0 flex items-center justify-center"
                  style="background-color: var(--color-gray-800)"
                >
                  <svg
                    class="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <svg
                  v-if="!isGeneratingPDF"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3"
                  ></path>
                </svg>
                <span>{{ isGeneratingPDF ? "Generating..." : "Export" }}</span>
                <svg
                  v-if="!isGeneratingPDF"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              <div
                v-if="showExportOptions && !isGeneratingPDF"
                class="absolute top-full mt-2 right-0 bg-white border rounded-xl shadow-lg z-50 min-w-[180px]"
                style="border-color: var(--color-gray-200)"
              >
                <div class="p-2">
                  <button
                    @click="downloadPDF"
                    class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 w-full text-left"
                  >
                    <svg
                      class="w-4 h-4"
                      style="color: #ef4444"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <div class="flex-1">
                      <div
                        class="font-medium text-sm"
                        style="color: var(--color-gray-900)"
                      >
                        PDF
                      </div>
                      <div
                        class="text-xs"
                        style="color: var(--color-gray-500)"
                      >
                        Professional document
                      </div>
                    </div>
                  </button>
                  <button
                    @click="exportToExcel"
                    class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 w-full text-left"
                  >
                    <svg
                      class="w-4 h-4"
                      style="color: #10b981"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <div class="flex-1">
                      <div
                        class="font-medium text-sm"
                        style="color: var(--color-gray-900)"
                      >
                        Excel
                      </div>
                      <div
                        class="text-xs"
                        style="color: var(--color-gray-500)"
                      >
                        Multi-sheet workbook
                      </div>
                    </div>
                  </button>
                  <button
                    @click="exportToCSV"
                    class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 w-full text-left"
                  >
                    <svg
                      class="w-4 h-4"
                      style="color: #059669"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 10v6m0 0l-4-4m4 4l4-4m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <div class="flex-1">
                      <div
                        class="font-medium text-sm"
                        style="color: var(--color-gray-900)"
                      >
                        CSV
                      </div>
                      <div
                        class="text-xs"
                        style="color: var(--color-gray-500)"
                      >
                        Simple spreadsheet
                      </div>
                    </div>
                  </button>
                  <button
                    @click="exportToJSON"
                    class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 w-full text-left"
                  >
                    <svg
                      class="w-4 h-4"
                      style="color: #8b5cf6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      ></path>
                    </svg>
                    <div class="flex-1">
                      <div
                        class="font-medium text-sm"
                        style="color: var(--color-gray-900)"
                      >
                        JSON
                      </div>
                      <div
                        class="text-xs"
                        style="color: var(--color-gray-500)"
                      >
                        Data format
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
        <!-- Form Section -->
        <div
          class="bg-white rounded-2xl border p-8"
          style="border-color: var(--color-gray-200)"
        >
          <div class="space-y-12">
            <!-- Company Logo -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  style="background-color: var(--color-gray-900)"
                ></div>
                <h2
                  class="text-xl font-semibold"
                  style="color: var(--color-gray-900)"
                >
                  Company Logo
                </h2>
              </div>
              <div class="space-y-4">
                <div
                  v-if="!invoice.logo"
                  class="border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 hover:bg-gray-50"
                  style="border-color: var(--color-gray-200)"
                >
                  <div
                    class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style="background-color: var(--color-gray-200)"
                  >
                    <svg
                      class="w-8 h-8"
                      style="color: var(--color-gray-400)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <p
                    class="font-semibold text-sm mb-2"
                    style="color: var(--color-gray-600)"
                  >
                    Upload your company logo
                  </p>
                  <p
                    class="text-xs mb-4"
                    style="color: var(--color-gray-400)"
                  >
                    PNG, JPG up to 2MB (auto-compressed for smaller PDFs)
                  </p>
                  <label
                    for="logo-upload"
                    class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                    style="
                      background-color: var(--color-gray-900);
                      color: white;
                    "
                  >
                    Choose File
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    @change="handleLogoUpload"
                    class="hidden"
                  />
                </div>
                <div
                  v-else
                  class="border rounded-2xl p-6 flex items-center space-x-4"
                  style="border-color: var(--color-gray-200)"
                >
                  <img
                    :src="invoice.logo"
                    alt="Company Logo"
                    class="w-16 h-16 object-contain rounded-lg"
                  />
                  <div class="flex-1">
                    <p
                      class="font-semibold text-sm"
                      style="color: var(--color-gray-900)"
                    >
                      Default Logo
                    </p>
                    <p
                      class="text-xs"
                      style="color: var(--color-gray-500)"
                    >
                      Will appear on all new invoices
                    </p>
                  </div>
                  <button
                    @click="removeLogo"
                    class="p-2 rounded-lg transition-colors duration-200"
                    style="color: var(--color-gray-400)"
                    @mouseenter="$event.target.style.color = '#ef4444'"
                    @mouseleave="
                      $event.target.style.color = 'var(--color-gray-400)'
                    "
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  style="background-color: var(--color-gray-600)"
                ></div>
                <h2
                  class="text-xl font-semibold"
                  style="color: var(--color-gray-900)"
                >
                  {{ t("invoiceDetails") }}
                </h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >{{ t("invoiceNumber") }}</label
                  >
                  <input
                    v-model="invoice.number"
                    type="text"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="INV-001"
                  />
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >{{ t("date") }}</label
                  >
                  <input
                    v-model="invoice.date"
                    type="date"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                  />
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >{{ t("dueDate") }}</label
                  >
                  <input
                    v-model="invoice.dueDate"
                    type="date"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                  />
                </div>
              </div>
            </div>

            <!-- From Section -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  style="background-color: var(--color-gray-600)"
                ></div>
                <h2
                  class="text-xl font-semibold"
                  style="color: var(--color-gray-900)"
                >
                  From
                </h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Business Name</label
                  >
                  <input
                    v-model="invoice.from.businessName"
                    type="text"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="Your Business"
                  />
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Tax ID</label
                  >
                  <input
                    v-model="invoice.from.taxId"
                    type="text"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="Tax ID"
                  />
                </div>
              </div>
              <div class="space-y-3">
                <label
                  class="block text-sm font-medium"
                  style="color: var(--color-gray-600)"
                  >Address</label
                >
                <input
                  v-model="invoice.from.address"
                  type="text"
                  class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                  style="
                    border-color: var(--color-gray-200);
                    color: var(--color-gray-900);
                    --tw-ring-color: var(--color-gray-900);
                  "
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Email</label
                  >
                  <input
                    v-model="invoice.from.email"
                    type="email"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="your@email.com"
                  />
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Phone</label
                  >
                  <input
                    v-model="invoice.from.phone"
                    type="tel"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <!-- To Section -->
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    style="background-color: var(--color-gray-600)"
                  ></div>
                  <h2
                    class="text-xl font-semibold"
                    style="color: var(--color-gray-900)"
                  >
                    To
                  </h2>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="showCustomers = true"
                    class="text-gray-600 px-3 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm border"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-600);
                    "
                    @mouseenter="
                      $event.target.style.backgroundColor =
                        'var(--color-gray-100)'
                    "
                    @mouseleave="
                      $event.target.style.backgroundColor = 'transparent'
                    "
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      ></path>
                    </svg>
                    <span>Select</span>
                  </button>
                  <button
                    @click="saveCurrentCustomer"
                    :disabled="!invoice.to.customerName.trim()"
                    class="text-gray-600 px-3 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm border disabled:opacity-50 disabled:cursor-not-allowed"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-600);
                    "
                    @mouseenter="
                      !invoice.to.customerName.trim() ||
                      ($event.target.style.backgroundColor =
                        'var(--color-gray-100)')
                    "
                    @mouseleave="
                      $event.target.style.backgroundColor = 'transparent'
                    "
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <span>Save</span>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Customer Name</label
                  >
                  <input
                    v-model="invoice.to.customerName"
                    type="text"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="Customer Name"
                  />
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Tax ID</label
                  >
                  <input
                    v-model="invoice.to.taxId"
                    type="text"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="Tax ID"
                  />
                </div>
              </div>
              <div class="space-y-3">
                <label
                  class="block text-sm font-medium"
                  style="color: var(--color-gray-600)"
                  >Address</label
                >
                <input
                  v-model="invoice.to.address"
                  type="text"
                  class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                  style="
                    border-color: var(--color-gray-200);
                    color: var(--color-gray-900);
                    --tw-ring-color: var(--color-gray-900);
                  "
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Email</label
                  >
                  <input
                    v-model="invoice.to.email"
                    type="email"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="customer@email.com"
                  />
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Phone</label
                  >
                  <input
                    v-model="invoice.to.phone"
                    type="tel"
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </div>

            <!-- Items Section -->
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    style="background-color: var(--color-gray-600)"
                  ></div>
                  <h2
                    class="text-xl font-semibold"
                    style="color: var(--color-gray-900)"
                  >
                    Items
                  </h2>
                </div>
                <button
                  @click="addItem"
                  class="text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium text-sm"
                  style="background-color: var(--color-gray-900)"
                  @mouseenter="
                    $event.target.style.backgroundColor =
                      'var(--color-gray-800)'
                  "
                  @mouseleave="
                    $event.target.style.backgroundColor =
                      'var(--color-gray-900)'
                  "
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span>Add Item</span>
                </button>
              </div>

              <div
                v-if="invoice.items.length === 0"
                class="rounded-2xl border-2 border-dashed p-16 text-center"
                style="
                  border-color: var(--color-gray-200);
                  background-color: var(--color-gray-50);
                "
              >
                <div
                  class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style="background-color: var(--color-gray-200)"
                >
                  <svg
                    class="w-8 h-8"
                    style="color: var(--color-gray-400)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <p
                  class="font-semibold text-lg mb-2"
                  style="color: var(--color-gray-600)"
                >
                  No items yet
                </p>
                <p
                  class="text-sm"
                  style="color: var(--color-gray-400)"
                >
                  Add your first item to get started
                </p>
              </div>

              <div
                v-for="(item, index) in invoice.items"
                :key="item.id"
                class="rounded-2xl border p-6 space-y-5 hover:shadow-sm transition-all duration-200"
                style="
                  border-color: var(--color-gray-200);
                  background-color: var(--color-gray-50);
                "
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-sm font-semibold"
                    style="color: var(--color-gray-600)"
                    >Item {{ index + 1 }}</span
                  >
                  <button
                    @click="removeItem(index)"
                    class="transition-colors duration-200 p-2 rounded-lg"
                    style="color: var(--color-gray-400)"
                    @mouseenter="$event.target.style.color = '#ef4444'"
                    @mouseleave="
                      $event.target.style.color = 'var(--color-gray-400)'
                    "
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div class="space-y-4">
                  <div class="space-y-3">
                    <label
                      class="block text-sm font-medium"
                      style="color: var(--color-gray-600)"
                      >Description</label
                    >
                    <input
                      v-model="item.description"
                      type="text"
                      placeholder="Item description"
                      class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                      style="
                        border-color: var(--color-gray-200);
                        color: var(--color-gray-900);
                        --tw-ring-color: var(--color-gray-900);
                      "
                    />
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="space-y-3">
                      <label
                        class="block text-sm font-medium"
                        style="color: var(--color-gray-600)"
                        >Quantity</label
                      >
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        placeholder="1"
                        min="0"
                        step="0.01"
                        class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                        style="
                          border-color: var(--color-gray-200);
                          color: var(--color-gray-900);
                          --tw-ring-color: var(--color-gray-900);
                        "
                      />
                    </div>
                    <div class="space-y-3">
                      <label
                        class="block text-sm font-medium"
                        style="color: var(--color-gray-600)"
                        >Price</label
                      >
                      <input
                        v-model.number="item.price"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                        style="
                          border-color: var(--color-gray-200);
                          color: var(--color-gray-900);
                          --tw-ring-color: var(--color-gray-900);
                        "
                      />
                    </div>
                    <div class="space-y-3">
                      <label
                        class="block text-sm font-medium"
                        style="color: var(--color-gray-600)"
                        >Tax %</label
                      >
                      <input
                        v-model.number="item.tax"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                        class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                        style="
                          border-color: var(--color-gray-200);
                          color: var(--color-gray-900);
                          --tw-ring-color: var(--color-gray-900);
                        "
                      />
                    </div>
                    <div class="space-y-3">
                      <label
                        class="block text-sm font-medium"
                        style="color: var(--color-gray-600)"
                        >Total</label
                      >
                      <div
                        class="h-12 rounded-xl flex items-center px-4 text-sm font-bold"
                        style="
                          background-color: var(--color-gray-100);
                          color: var(--color-gray-900);
                        "
                      >
                        ${{ itemTotal(item).toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Information Section -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  style="background-color: var(--color-gray-600)"
                ></div>
                <h2
                  class="text-xl font-semibold"
                  style="color: var(--color-gray-900)"
                >
                  Payment Information
                </h2>
              </div>
              <div class="space-y-4">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-medium"
                    style="color: var(--color-gray-600)"
                    >Payment Instructions</label
                  >
                  <textarea
                    v-model="invoice.payment.instructions"
                    rows="3"
                    placeholder="e.g., Please pay within 30 days of invoice date..."
                    class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                    style="
                      border-color: var(--color-gray-200);
                      color: var(--color-gray-900);
                      --tw-ring-color: var(--color-gray-900);
                    "
                  ></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <label
                      class="block text-sm font-medium"
                      style="color: var(--color-gray-600)"
                      >Bank Details</label
                    >
                    <textarea
                      v-model="invoice.payment.bankDetails"
                      rows="3"
                      placeholder="Bank name, account number, routing..."
                      class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                      style="
                        border-color: var(--color-gray-200);
                        color: var(--color-gray-900);
                        --tw-ring-color: var(--color-gray-900);
                      "
                    ></textarea>
                  </div>
                  <div class="space-y-3">
                    <label
                      class="block text-sm font-medium"
                      style="color: var(--color-gray-600)"
                      >PayPal Email</label
                    >
                    <input
                      v-model="invoice.payment.paypalEmail"
                      type="email"
                      placeholder="paypal@business.com"
                      class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                      style="
                        border-color: var(--color-gray-200);
                        color: var(--color-gray-900);
                        --tw-ring-color: var(--color-gray-900);
                      "
                    />
                    <label
                      class="block text-sm font-medium mt-3"
                      style="color: var(--color-gray-600)"
                      >Crypto Address</label
                    >
                    <input
                      v-model="invoice.payment.cryptoAddress"
                      type="text"
                      placeholder="Bitcoin/Ethereum address..."
                      class="w-full border rounded-xl px-4 py-3 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                      style="
                        border-color: var(--color-gray-200);
                        color: var(--color-gray-900);
                        --tw-ring-color: var(--color-gray-900);
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div
          class="bg-white rounded-2xl border"
          style="border-color: var(--color-gray-200)"
        >
          <div
            id="invoice-preview"
            class="p-8 bg-white min-h-[700px] overflow-hidden"
            style="font-family: &quot;Inter&quot;, sans-serif"
          >
            <!-- Invoice Preview Content -->
            <div class="space-y-12">
              <!-- Header with Logo -->
              <div class="flex justify-between items-start">
                <div class="flex items-start space-x-6">
                  <div
                    v-if="invoice.logo"
                    class="flex-shrink-0"
                  >
                    <img
                      :src="invoice.logo"
                      alt="Company Logo"
                      class="w-20 h-20 object-contain"
                    />
                  </div>
                  <div>
                    <h1
                      class="text-5xl font-bold mb-2"
                      style="color: #000"
                    >
                      INVOICE
                    </h1>
                    <p
                      class="text-lg font-medium"
                      style="color: #666"
                    >
                      {{ invoice.number || "INV-001" }}
                    </p>
                  </div>
                </div>
                <div class="text-right space-y-3">
                  <div>
                    <div class="text-sm font-semibold text-gray-500 mb-1">
                      DATE
                    </div>
                    <div
                      class="text-lg font-medium"
                      style="color: #000"
                    >
                      {{ formatDate(invoice.date) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-500 mb-1">
                      DUE DATE
                    </div>
                    <div
                      class="text-lg font-medium"
                      style="color: #000"
                    >
                      {{ formatDate(invoice.dueDate) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- From/To -->
              <div class="grid grid-cols-2 gap-16 py-8">
                <div>
                  <h3 class="text-sm font-semibold text-gray-500 mb-6">FROM</h3>
                  <div class="space-y-2">
                    <div
                      class="text-xl font-semibold"
                      style="color: #000"
                    >
                      {{ invoice.from.businessName || "—" }}
                    </div>
                    <div
                      class="text-sm space-y-1"
                      style="color: #666; line-height: 1.6"
                    >
                      <div>{{ invoice.from.address || "—" }}</div>
                      <div>{{ invoice.from.email || "—" }}</div>
                      <div>{{ invoice.from.phone || "—" }}</div>
                      <div
                        v-if="invoice.from.taxId"
                        class="text-xs pt-2"
                        style="color: #999"
                      >
                        Tax ID: {{ invoice.from.taxId }}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-500 mb-6">TO</h3>
                  <div class="space-y-2">
                    <div
                      class="text-xl font-semibold"
                      style="color: #000"
                    >
                      {{ invoice.to.customerName || "—" }}
                    </div>
                    <div
                      class="text-sm space-y-1"
                      style="color: #666; line-height: 1.6"
                    >
                      <div>{{ invoice.to.address || "—" }}</div>
                      <div>{{ invoice.to.email || "—" }}</div>
                      <div>{{ invoice.to.phone || "—" }}</div>
                      <div
                        v-if="invoice.to.taxId"
                        class="text-xs pt-2"
                        style="color: #999"
                      >
                        Tax ID: {{ invoice.to.taxId }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items Table -->
              <div
                class="border-t border-b"
                style="border-color: #e5e5e5"
              >
                <table class="w-full">
                  <thead style="background-color: #f8f9fa">
                    <tr>
                      <th
                        class="px-6 py-4 text-left text-sm font-semibold"
                        style="color: #666"
                      >
                        {{ t("tableDescription") }}
                      </th>
                      <th
                        class="px-6 py-4 text-center text-sm font-semibold"
                        style="color: #666"
                      >
                        {{ t("tableQty") }}
                      </th>
                      <th
                        class="px-6 py-4 text-right text-sm font-semibold"
                        style="color: #666"
                      >
                        {{ t("tablePrice") }}
                      </th>
                      <th
                        class="px-6 py-4 text-right text-sm font-semibold"
                        style="color: #666"
                      >
                        {{ t("tableTax") }}
                      </th>
                      <th
                        class="px-6 py-4 text-right text-sm font-semibold"
                        style="color: #666"
                      >
                        {{ t("tableTotal") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="divide-y"
                    style="divide-color: #e5e5e5"
                  >
                    <tr v-if="invoice.items.length === 0">
                      <td
                        colspan="5"
                        class="px-6 py-16 text-center"
                      >
                        <div
                          class="text-lg font-medium"
                          style="color: #999"
                        >
                          No items yet
                        </div>
                        <div
                          class="text-sm mt-2"
                          style="color: #ccc"
                        >
                          Add items to see them here
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="item in invoice.items"
                      :key="item.id"
                      class="hover:bg-gray-50"
                    >
                      <td
                        class="px-6 py-4 text-sm font-medium"
                        style="color: #000"
                      >
                        {{ item.description || "—" }}
                      </td>
                      <td
                        class="px-6 py-4 text-center text-sm"
                        style="color: #666"
                      >
                        {{ item.quantity || 0 }}
                      </td>
                      <td
                        class="px-6 py-4 text-right text-sm font-mono"
                        style="color: #666"
                      >
                        ${{ (item.price || 0).toFixed(2) }}
                      </td>
                      <td
                        class="px-6 py-4 text-right text-sm"
                        style="color: #666"
                      >
                        {{ (item.tax || 0).toFixed(1) }}%
                      </td>
                      <td
                        class="px-6 py-4 text-right text-sm font-semibold font-mono"
                        style="color: #000"
                      >
                        ${{ itemTotal(item).toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Totals -->
              <div class="flex justify-end pt-8">
                <div class="w-80 space-y-6">
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span
                        class="text-sm font-medium"
                        style="color: #666"
                        >{{ t("subtotal") }}</span
                      >
                      <span
                        class="text-sm font-mono"
                        style="color: #000"
                        >${{ subtotal.toFixed(2) }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span
                        class="text-sm font-medium"
                        style="color: #666"
                        >{{ t("tax") }}</span
                      >
                      <span
                        class="text-sm font-mono"
                        style="color: #000"
                        >${{ totalTax.toFixed(2) }}</span
                      >
                    </div>
                  </div>
                  <div
                    class="border-t pt-6"
                    style="border-color: #000"
                  >
                    <div class="flex justify-between items-center">
                      <span
                        class="text-xl font-bold"
                        style="color: #000"
                        >{{ t("totalAmount") }}</span
                      >
                      <span
                        class="text-3xl font-bold font-mono"
                        style="color: #000"
                        >${{ total.toFixed(2) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Information -->
              <div
                v-if="
                  invoice.payment.instructions ||
                  invoice.payment.bankDetails ||
                  invoice.payment.paypalEmail ||
                  invoice.payment.cryptoAddress ||
                  paymentQRCode
                "
                class="border-t pt-8"
                style="border-color: #e5e5e5"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Payment Details -->
                  <div
                    v-if="
                      invoice.payment.instructions ||
                      invoice.payment.bankDetails ||
                      invoice.payment.paypalEmail ||
                      invoice.payment.cryptoAddress
                    "
                    class="space-y-4"
                  >
                    <h3 class="text-sm font-semibold text-gray-500 mb-4">
                      {{ t("paymentInformation").toUpperCase() }}
                    </h3>

                    <div
                      v-if="invoice.payment.instructions"
                      class="space-y-2"
                    >
                      <div
                        class="text-sm font-medium"
                        style="color: #000"
                      >
                        {{ t("paymentInstructions") }}
                      </div>
                      <div
                        class="text-sm whitespace-pre-line"
                        style="color: #666"
                      >
                        {{ invoice.payment.instructions }}
                      </div>
                    </div>

                    <div
                      v-if="invoice.payment.bankDetails"
                      class="space-y-2"
                    >
                      <div
                        class="text-sm font-medium"
                        style="color: #000"
                      >
                        {{ t("bankDetails") }}
                      </div>
                      <div
                        class="text-sm whitespace-pre-line"
                        style="color: #666"
                      >
                        {{ invoice.payment.bankDetails }}
                      </div>
                    </div>

                    <div
                      v-if="invoice.payment.paypalEmail"
                      class="space-y-2"
                    >
                      <div
                        class="text-sm font-medium"
                        style="color: #000"
                      >
                        {{ t("paypalEmail") }}
                      </div>
                      <div
                        class="text-sm"
                        style="color: #666"
                      >
                        {{ invoice.payment.paypalEmail }}
                      </div>
                    </div>

                    <div
                      v-if="invoice.payment.cryptoAddress"
                      class="space-y-2"
                    >
                      <div
                        class="text-sm font-medium"
                        style="color: #000"
                      >
                        {{ t("cryptoAddress") }}
                      </div>
                      <div
                        class="text-sm font-mono"
                        style="color: #666"
                      >
                        {{ invoice.payment.cryptoAddress }}
                      </div>
                    </div>
                  </div>

                  <!-- QR Code -->
                  <div
                    v-if="paymentQRCode"
                    class="flex flex-col items-center md:items-end space-y-4"
                  >
                    <div class="text-center md:text-right">
                      <h3 class="text-sm font-semibold text-gray-500 mb-4">
                        {{ t("quickPayment").toUpperCase() }}
                      </h3>
                      <div
                        class="inline-block border p-4 rounded-lg"
                        style="border-color: #e5e5e5"
                      >
                        <img
                          :src="paymentQRCode"
                          alt="Payment QR Code"
                          class="w-24 h-24"
                        />
                      </div>
                      <p
                        class="text-xs mt-2"
                        style="color: #999"
                      >
                        {{ t("scanToPay") }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Invoice History Modal -->
    <div
      v-if="showHistory"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b flex items-center justify-between"
          style="border-color: var(--color-gray-200)"
        >
          <div>
            <h2
              class="text-xl font-semibold"
              style="color: var(--color-gray-900)"
            >
              Invoice History
            </h2>
            <p
              class="text-sm"
              style="color: var(--color-gray-500)"
            >
              {{ invoiceHistory.length }} saved invoices
            </p>
          </div>
          <button
            @click="showHistory = false"
            class="p-2 rounded-lg transition-colors duration-200"
            style="color: var(--color-gray-400)"
            @mouseenter="$event.target.style.color = 'var(--color-gray-600)'"
            @mouseleave="$event.target.style.color = 'var(--color-gray-400)'"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div
            v-if="invoiceHistory.length === 0"
            class="text-center py-12"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style="background-color: var(--color-gray-200)"
            >
              <svg
                class="w-8 h-8"
                style="color: var(--color-gray-400)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p
              class="font-semibold text-lg mb-2"
              style="color: var(--color-gray-600)"
            >
              No invoices saved yet
            </p>
            <p
              class="text-sm"
              style="color: var(--color-gray-400)"
            >
              Save your first invoice to see it here
            </p>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="savedInvoice in invoiceHistory"
              :key="savedInvoice.id"
              class="border rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              style="border-color: var(--color-gray-200)"
              @click="loadInvoice(savedInvoice)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-4 mb-3">
                    <h3
                      class="text-lg font-semibold"
                      style="color: var(--color-gray-900)"
                    >
                      {{ savedInvoice.invoice.number }}
                    </h3>
                    <span
                      class="text-2xl font-bold font-mono"
                      style="color: var(--color-gray-900)"
                      >${{ savedInvoice.totalAmount.toFixed(2) }}</span
                    >
                  </div>
                  <div
                    class="flex items-center space-x-6 text-sm"
                    style="color: var(--color-gray-600)"
                  >
                    <div class="flex items-center space-x-2">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      <span>{{ savedInvoice.customerName }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <span>{{ savedInvoice.invoice.items.length }} items</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>{{
                        new Date(savedInvoice.savedAt).toLocaleDateString()
                      }}</span>
                    </div>
                  </div>
                </div>
                <button
                  @click.stop="deleteInvoice(savedInvoice.id)"
                  class="p-2 rounded-lg transition-colors duration-200 ml-4"
                  style="color: var(--color-gray-400)"
                  @mouseenter="$event.target.style.color = '#ef4444'"
                  @mouseleave="
                    $event.target.style.color = 'var(--color-gray-400)'
                  "
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Database Modal -->
    <div
      v-if="showCustomers"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b flex items-center justify-between"
          style="border-color: var(--color-gray-200)"
        >
          <div>
            <h2
              class="text-xl font-semibold"
              style="color: var(--color-gray-900)"
            >
              Customer Database
            </h2>
            <p
              class="text-sm"
              style="color: var(--color-gray-500)"
            >
              {{ customers.length }} saved customers
            </p>
          </div>
          <button
            @click="showCustomers = false"
            class="p-2 rounded-lg transition-colors duration-200"
            style="color: var(--color-gray-400)"
            @mouseenter="$event.target.style.color = 'var(--color-gray-600)'"
            @mouseleave="$event.target.style.color = 'var(--color-gray-400)'"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Search Bar -->
        <div
          class="px-6 py-4 border-b"
          style="border-color: var(--color-gray-200)"
        >
          <div class="relative">
            <input
              v-model="customerSearch"
              type="text"
              placeholder="Search customers by name, email, or phone..."
              class="w-full border rounded-xl px-4 py-3 pl-10 text-sm bg-white font-medium focus:outline-none focus:ring-2 transition-all duration-200"
              style="
                border-color: var(--color-gray-200);
                color: var(--color-gray-900);
                --tw-ring-color: var(--color-gray-900);
              "
            />
            <svg
              class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
              style="color: var(--color-gray-400)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[50vh]">
          <div
            v-if="filteredCustomers.length === 0 && !customerSearch.trim()"
            class="text-center py-12"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style="background-color: var(--color-gray-200)"
            >
              <svg
                class="w-8 h-8"
                style="color: var(--color-gray-400)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
            </div>
            <p
              class="font-semibold text-lg mb-2"
              style="color: var(--color-gray-600)"
            >
              No customers saved yet
            </p>
            <p
              class="text-sm"
              style="color: var(--color-gray-400)"
            >
              Save your first customer to see them here
            </p>
          </div>

          <div
            v-else-if="filteredCustomers.length === 0 && customerSearch.trim()"
            class="text-center py-12"
          >
            <p
              class="font-semibold text-lg mb-2"
              style="color: var(--color-gray-600)"
            >
              No customers found
            </p>
            <p
              class="text-sm"
              style="color: var(--color-gray-400)"
            >
              Try adjusting your search terms
            </p>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="border rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              style="border-color: var(--color-gray-200)"
              @click="selectCustomer(customer)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-4 mb-3">
                    <h3
                      class="text-lg font-semibold"
                      style="color: var(--color-gray-900)"
                    >
                      {{ customer.customerName }}
                    </h3>
                    <span
                      class="text-xs px-2 py-1 rounded-full"
                      style="
                        background-color: var(--color-gray-100);
                        color: var(--color-gray-600);
                      "
                    >
                      Last used
                      {{ new Date(customer.lastUsed).toLocaleDateString() }}
                    </span>
                  </div>
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
                    style="color: var(--color-gray-600)"
                  >
                    <div
                      v-if="customer.email"
                      class="flex items-center space-x-2"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span>{{ customer.email }}</span>
                    </div>
                    <div
                      v-if="customer.phone"
                      class="flex items-center space-x-2"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      <span>{{ customer.phone }}</span>
                    </div>
                    <div
                      v-if="customer.address"
                      class="flex items-center space-x-2 md:col-span-2"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span>{{ customer.address }}</span>
                    </div>
                  </div>
                </div>
                <button
                  @click.stop="deleteCustomer(customer.id)"
                  class="p-2 rounded-lg transition-colors duration-200 ml-4"
                  style="color: var(--color-gray-400)"
                  @mouseenter="$event.target.style.color = '#ef4444'"
                  @mouseleave="
                    $event.target.style.color = 'var(--color-gray-400)'
                  "
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { ReceiptText } from "lucide-vue-next";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface Invoice {
  number: string;
  date: string;
  dueDate: string;
  logo: string | null;
  from: {
    businessName: string;
    taxId: string;
    address: string;
    email: string;
    phone: string;
  };
  to: {
    customerName: string;
    taxId: string;
    address: string;
    email: string;
    phone: string;
  };
  items: InvoiceItem[];
  payment: {
    instructions: string;
    bankDetails: string;
    paypalEmail: string;
    cryptoAddress: string;
  };
}

interface SavedInvoice {
  id: string;
  invoice: Invoice;
  savedAt: string;
  totalAmount: number;
  customerName: string;
}

interface Customer {
  id: string;
  customerName: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
  createdAt: string;
  lastUsed: string;
}

interface PDFTheme {
  id: string;
  name: string;
  description: string;
  primary: string;
  accent: string;
  text: string;
  background: string;
}

const PDF_THEMES: PDFTheme[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and corporate",
    primary: "#000000",
    accent: "#666666",
    text: "#333333",
    background: "#ffffff",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Modern with color accents",
    primary: "#2563eb",
    accent: "#3b82f6",
    text: "#1f2937",
    background: "#ffffff",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean and simple",
    primary: "#374151",
    accent: "#9ca3af",
    text: "#6b7280",
    background: "#ffffff",
  },
];

const STORAGE_KEY = "invoice-generator-data";
const HISTORY_KEY = "invoice-generator-history";
const CUSTOMERS_KEY = "invoice-generator-customers";
const LOGO_KEY = "invoice-generator-default-logo";
const LANGUAGE_KEY = "invoice-generator-language";

// Language with persistence (SSR-safe)
const language = ref("EN");

// Initialize language from localStorage on client side
onMounted(() => {
  if (typeof window !== "undefined") {
    language.value = localStorage.getItem(LANGUAGE_KEY) || "EN";
  }
});

// Watch language changes and save to localStorage
watch(language, (newLang) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANGUAGE_KEY, newLang);
  }
});

// Translation system
const translations = {
  EN: {
    // Header
    invoiceGenerator: "Invoice Generator",
    createProfessionalInvoices: "Create professional invoices",
    customers: "Customers",
    history: "History",
    save: "Save",

    // Main form
    invoiceDetails: "Invoice Details",
    invoiceNumber: "Invoice Number",
    date: "Date",
    dueDate: "Due Date",
    logoUpload: "Logo Upload",
    uploadLogo: "Upload Logo",

    // From/To sections
    from: "From",
    to: "To",
    businessName: "Business Name",
    customerName: "Customer Name",
    taxId: "Tax ID",
    address: "Address",
    email: "Email",
    phone: "Phone",

    // Items section
    items: "Items",
    addItem: "Add Item",
    description: "Description",
    quantity: "Quantity",
    price: "Price",
    tax: "Tax (%)",
    total: "Total",
    remove: "Remove",
    noItemsYet: "No items yet",
    addItemsToSeeHere: "Add items to see them here",

    // Payment section
    paymentInformation: "Payment Information",
    paymentInstructions: "Payment Instructions",
    bankDetails: "Bank Details",
    paypalEmail: "PayPal Email",
    cryptoAddress: "Crypto Address",
    quickPayment: "Quick Payment",
    scanToPay: "Scan to pay",

    // Totals
    subtotal: "Subtotal",
    tax: "Tax",
    totalAmount: "Total",

    // Export buttons
    exportOptions: "Export Options",
    downloadPDF: "Download PDF",
    downloadExcel: "Download Excel",
    downloadCSV: "Download CSV",
    downloadJSON: "Download JSON",

    // Invoice preview headers
    invoicePreview: "Invoice Preview",

    // Table headers
    tableDescription: "DESCRIPTION",
    tableQty: "QTY",
    tablePrice: "PRICE",
    tableTax: "TAX",
    tableTotal: "TOTAL",

    // Modals
    invoiceHistory: "Invoice History",
    savedInvoices: "saved invoices",
    noInvoicesSaved: "No invoices saved yet",
    saveFirstInvoice: "Save your first invoice to see it here",
    loadInvoice: "Load Invoice",
    deleteInvoice: "Delete Invoice",

    // Customer management
    customerDatabase: "Customer Database",
    addCustomer: "Add Customer",
    searchCustomers: "Search customers...",
    noCustomersFound: "No customers found",
    addFirstCustomer: "Add your first customer to see them here",
    useCustomer: "Use Customer",
    editCustomer: "Edit Customer",
    deleteCustomer: "Delete Customer",

    // Buttons and actions
    close: "Close",
    cancel: "Cancel",
    clear: "Clear",
    clearInvoice: "Clear Invoice",

    // Alerts and confirmations
    fillRequiredFields:
      "Please fill in the required fields (Invoice Number, Business Name, and Customer Name) before saving.",
    confirmClearInvoice:
      "Are you sure you want to clear all data? This cannot be undone.",
    invoiceSaved: "Invoice saved successfully!",

    // Placeholders
    enterInvoiceNumber: "Enter invoice number",
    enterBusinessName: "Enter business name",
    enterCustomerName: "Enter customer name",
    enterAddress: "Enter address",
    enterEmail: "Enter email",
    enterPhone: "Enter phone",
    enterTaxId: "Enter tax ID",
    itemDescription: "Item description",
    enterPaymentInstructions: "Enter payment instructions...",
    enterBankDetails: "Enter bank details...",
    enterPaypalEmail: "Enter PayPal email",
    enterCryptoAddress: "Enter crypto address",
  },
  ES: {
    // Header
    invoiceGenerator: "Generador de Facturas",
    createProfessionalInvoices: "Crea facturas profesionales",
    customers: "Clientes",
    history: "Historial",
    save: "Guardar",

    // Main form
    invoiceDetails: "Detalles de la Factura",
    invoiceNumber: "Número de Factura",
    date: "Fecha",
    dueDate: "Fecha de Vencimiento",
    logoUpload: "Subir Logo",
    uploadLogo: "Subir Logo",

    // From/To sections
    from: "De",
    to: "Para",
    businessName: "Nombre del Negocio",
    customerName: "Nombre del Cliente",
    taxId: "ID Fiscal",
    address: "Dirección",
    email: "Correo Electrónico",
    phone: "Teléfono",

    // Items section
    items: "Artículos",
    addItem: "Agregar Artículo",
    description: "Descripción",
    quantity: "Cantidad",
    price: "Precio",
    tax: "IVA (%)",
    total: "Total",
    remove: "Eliminar",
    noItemsYet: "Sin artículos aún",
    addItemsToSeeHere: "Agrega artículos para verlos aquí",

    // Payment section
    paymentInformation: "Información de Pago",
    paymentInstructions: "Instrucciones de Pago",
    bankDetails: "Detalles Bancarios",
    paypalEmail: "Email de PayPal",
    cryptoAddress: "Dirección de Criptomoneda",
    quickPayment: "Pago Rápido",
    scanToPay: "Escanear para pagar",

    // Totals
    subtotal: "Subtotal",
    tax: "IVA",
    totalAmount: "Total",

    // Export buttons
    exportOptions: "Opciones de Exportación",
    downloadPDF: "Descargar PDF",
    downloadExcel: "Descargar Excel",
    downloadCSV: "Descargar CSV",
    downloadJSON: "Descargar JSON",

    // Invoice preview headers
    invoicePreview: "Vista Previa de Factura",

    // Table headers
    tableDescription: "DESCRIPCIÓN",
    tableQty: "CANT",
    tablePrice: "PRECIO",
    tableTax: "IVA",
    tableTotal: "TOTAL",

    // Modals
    invoiceHistory: "Historial de Facturas",
    savedInvoices: "facturas guardadas",
    noInvoicesSaved: "No hay facturas guardadas aún",
    saveFirstInvoice: "Guarda tu primera factura para verla aquí",
    loadInvoice: "Cargar Factura",
    deleteInvoice: "Eliminar Factura",

    // Customer management
    customerDatabase: "Base de Datos de Clientes",
    addCustomer: "Agregar Cliente",
    searchCustomers: "Buscar clientes...",
    noCustomersFound: "No se encontraron clientes",
    addFirstCustomer: "Agrega tu primer cliente para verlos aquí",
    useCustomer: "Usar Cliente",
    editCustomer: "Editar Cliente",
    deleteCustomer: "Eliminar Cliente",

    // Buttons and actions
    close: "Cerrar",
    cancel: "Cancelar",
    clear: "Limpiar",
    clearInvoice: "Limpiar Factura",

    // Alerts and confirmations
    fillRequiredFields:
      "Por favor complete los campos requeridos (Número de Factura, Nombre del Negocio y Nombre del Cliente) antes de guardar.",
    confirmClearInvoice:
      "¿Está seguro de que desea borrar todos los datos? Esta acción no se puede deshacer.",
    invoiceSaved: "¡Factura guardada exitosamente!",

    // Placeholders
    enterInvoiceNumber: "Ingrese número de factura",
    enterBusinessName: "Ingrese nombre del negocio",
    enterCustomerName: "Ingrese nombre del cliente",
    enterAddress: "Ingrese dirección",
    enterEmail: "Ingrese correo electrónico",
    enterPhone: "Ingrese teléfono",
    enterTaxId: "Ingrese ID fiscal",
    itemDescription: "Descripción del artículo",
    enterPaymentInstructions: "Ingrese instrucciones de pago...",
    enterBankDetails: "Ingrese detalles bancarios...",
    enterPaypalEmail: "Ingrese email de PayPal",
    enterCryptoAddress: "Ingrese dirección de criptomoneda",
  },
};

// Computed property for getting translations
const t = computed(() => (key: string) => {
  return (
    translations[language.value as keyof typeof translations]?.[
      key as keyof typeof translations.EN
    ] || key
  );
});

// Helper functions for localStorage
const saveToStorage = (data: any) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

const loadFromStorage = (): Invoice | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const savedInvoice = JSON.parse(data);
    const defaultInvoice = getDefaultInvoice();

    // Merge saved data with default structure to ensure all properties exist
    return {
      ...defaultInvoice,
      ...savedInvoice,
      from: { ...defaultInvoice.from, ...savedInvoice.from },
      to: { ...defaultInvoice.to, ...savedInvoice.to },
      payment: { ...defaultInvoice.payment, ...savedInvoice.payment },
      items: savedInvoice.items || defaultInvoice.items,
    };
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return null;
  }
};

// Invoice history functions
const saveInvoiceHistory = (invoices: SavedInvoice[]) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(invoices));
  } catch (error) {
    console.warn("Failed to save invoice history:", error);
  }
};

const loadInvoiceHistory = (): SavedInvoice[] => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn("Failed to load invoice history:", error);
    return [];
  }
};

// Customer database functions
const saveCustomers = (customers: Customer[]) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (error) {
    console.warn("Failed to save customers:", error);
  }
};

const loadCustomers = (): Customer[] => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn("Failed to load customers:", error);
    return [];
  }
};

// Default logo functions
const saveDefaultLogo = (logo: string | null) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  try {
    if (logo) {
      localStorage.setItem(LOGO_KEY, logo);
    } else {
      localStorage.removeItem(LOGO_KEY);
    }
  } catch (error) {
    console.warn("Failed to save default logo:", error);
  }
};

const loadDefaultLogo = (): string | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(LOGO_KEY);
  } catch (error) {
    console.warn("Failed to load default logo:", error);
    return null;
  }
};

const getDefaultInvoice = (): Invoice => ({
  number: "INV-001",
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  logo: loadDefaultLogo(),
  from: {
    businessName: "",
    taxId: "",
    address: "",
    email: "",
    phone: "",
  },
  to: {
    customerName: "",
    taxId: "",
    address: "",
    email: "",
    phone: "",
  },
  items: [],
  payment: {
    instructions: "",
    bankDetails: "",
    paypalEmail: "",
    cryptoAddress: "",
  },
});

// Load saved data or use defaults
const invoice = ref<Invoice>(loadFromStorage() || getDefaultInvoice());

// Invoice history state
const invoiceHistory = ref<SavedInvoice[]>(loadInvoiceHistory());
const showHistory = ref(false);

// Customer database state
const customers = ref<Customer[]>(loadCustomers());
const showCustomers = ref(false);
const customerSearch = ref("");

// PDF Theme state
const selectedTheme = ref<string>("professional");
const showThemeSelector = ref(false);

// Export state
const showExportOptions = ref(false);

// QR Code state
const paymentQRCode = ref<string | null>(null);

const addItem = () => {
  invoice.value.items.push({
    id: uuidv4(),
    description: "",
    quantity: 1,
    price: 0,
    tax: 0,
  });
};

const removeItem = (index: number) => {
  invoice.value.items.splice(index, 1);
};

const itemTotal = (item: InvoiceItem) => {
  const subtotal = item.quantity * item.price;
  const taxAmount = (subtotal * item.tax) / 100;
  return subtotal + taxAmount;
};

const subtotal = computed(() => {
  return invoice.value.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
});

const totalTax = computed(() => {
  return invoice.value.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.price;
    return sum + (itemSubtotal * item.tax) / 100;
  }, 0);
});

const total = computed(() => {
  return subtotal.value + totalTax.value;
});

const canDownload = computed(() => {
  return (
    invoice.value.number &&
    invoice.value.from.businessName &&
    invoice.value.to.customerName
  );
});

const isGeneratingPDF = ref(false);

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const compressImage = (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8,
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG with specified quality
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.src = URL.createObjectURL(file);
  });
};

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith("image/")) {
    try {
      // Compress the image to reduce PDF file size
      const compressedLogo = await compressImage(file, 200, 200, 0.8);
      invoice.value.logo = compressedLogo;
      // Save as default logo for future invoices
      saveDefaultLogo(compressedLogo);
    } catch (error) {
      console.error("Error compressing image:", error);
      // Fallback to original method if compression fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        invoice.value.logo = logoData;
        saveDefaultLogo(logoData);
      };
      reader.readAsDataURL(file);
    }
  }
};

const removeLogo = () => {
  invoice.value.logo = null;
  // Remove default logo as well
  saveDefaultLogo(null);
  // Reset file input
  const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};

const clearInvoice = () => {
  if (confirm(t.value("confirmClearInvoice"))) {
    invoice.value = getDefaultInvoice();
    // Reset logo file input
    const fileInput = document.getElementById(
      "logo-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }
};

const saveCurrentInvoice = () => {
  if (!canDownload.value) {
    alert(t.value("fillRequiredFields"));
    return;
  }

  const savedInvoice: SavedInvoice = {
    id: uuidv4(),
    invoice: JSON.parse(JSON.stringify(invoice.value)), // Deep copy
    savedAt: new Date().toISOString(),
    totalAmount: total.value,
    customerName: invoice.value.to.customerName || "Unknown Customer",
  };

  invoiceHistory.value.unshift(savedInvoice); // Add to beginning
  saveInvoiceHistory(invoiceHistory.value);

  // Show success message
  alert(`Invoice ${invoice.value.number} saved successfully!`);
};

const loadInvoice = (savedInvoice: SavedInvoice) => {
  invoice.value = JSON.parse(JSON.stringify(savedInvoice.invoice)); // Deep copy
  showHistory.value = false;
};

const deleteInvoice = (id: string) => {
  if (confirm("Are you sure you want to delete this invoice?")) {
    invoiceHistory.value = invoiceHistory.value.filter((inv) => inv.id !== id);
    saveInvoiceHistory(invoiceHistory.value);
  }
};

// Customer management functions
const saveCurrentCustomer = () => {
  const customerData = invoice.value.to;

  if (!customerData.customerName.trim()) {
    alert("Please enter a customer name before saving.");
    return;
  }

  // Check if customer already exists
  const existingCustomer = customers.value.find(
    (c) =>
      c.customerName.toLowerCase() ===
        customerData.customerName.toLowerCase() ||
      (c.email &&
        customerData.email &&
        c.email.toLowerCase() === customerData.email.toLowerCase()),
  );

  if (existingCustomer) {
    if (
      confirm(
        "A customer with this name or email already exists. Update their information?",
      )
    ) {
      // Update existing customer
      existingCustomer.customerName = customerData.customerName;
      existingCustomer.taxId = customerData.taxId;
      existingCustomer.address = customerData.address;
      existingCustomer.email = customerData.email;
      existingCustomer.phone = customerData.phone;
      existingCustomer.lastUsed = new Date().toISOString();

      saveCustomers(customers.value);
      alert("Customer updated successfully!");
    }
  } else {
    // Create new customer
    const newCustomer: Customer = {
      id: uuidv4(),
      customerName: customerData.customerName,
      taxId: customerData.taxId,
      address: customerData.address,
      email: customerData.email,
      phone: customerData.phone,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    customers.value.unshift(newCustomer);
    saveCustomers(customers.value);
    alert("Customer saved successfully!");
  }
};

const selectCustomer = (customer: Customer) => {
  invoice.value.to = {
    customerName: customer.customerName,
    taxId: customer.taxId,
    address: customer.address,
    email: customer.email,
    phone: customer.phone,
  };

  // Update last used date
  customer.lastUsed = new Date().toISOString();
  saveCustomers(customers.value);

  showCustomers.value = false;
};

const deleteCustomer = (id: string) => {
  if (confirm("Are you sure you want to delete this customer?")) {
    customers.value = customers.value.filter((c) => c.id !== id);
    saveCustomers(customers.value);
  }
};

// Computed property for filtered customers
const filteredCustomers = computed(() => {
  if (!customerSearch.value.trim()) {
    return customers.value.sort(
      (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
    );
  }

  const search = customerSearch.value.toLowerCase();
  return customers.value
    .filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.includes(search),
    )
    .sort(
      (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
    );
});

// Auto-save functionality
watch(
  invoice,
  (newInvoice) => {
    saveToStorage(newInvoice);
  },
  { deep: true },
);

// This will be handled by the onMounted function below

const downloadPDF = async () => {
  if (isGeneratingPDF.value) return;

  try {
    isGeneratingPDF.value = true;

    // Dynamic import to avoid SSR issues
    const { default: jsPDF } = await import("jspdf");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Get current theme
    const theme =
      PDF_THEMES.find((t) => t.id === selectedTheme.value) || PDF_THEMES[0];

    let yPosition = margin;

    // Helper functions with theme support
    const addText = (
      text: string,
      x: number,
      y: number,
      fontSize: number = 9,
      style: string = "normal",
      align: string = "left",
      color: string = theme.text,
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(color);

      if (align === "center") {
        const textWidth = pdf.getTextWidth(text);
        x = x - textWidth / 2;
      } else if (align === "right") {
        const textWidth = pdf.getTextWidth(text);
        x = x - textWidth;
      }

      pdf.text(text, x, y);
    };

    const addLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      lineWidth: number = 0.2,
      color: string = theme.accent,
    ) => {
      pdf.setLineWidth(lineWidth);
      pdf.setDrawColor(color);
      pdf.line(x1, y1, x2, y2);
    };

    const addRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      color: string = theme.primary,
    ) => {
      pdf.setFillColor(color);
      pdf.rect(x, y, width, height, "F");
    };

    // Helper to convert hex to RGB for transparency
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    // Theme-specific header rendering
    if (selectedTheme.value === "creative") {
      // Creative theme with colored header bar
      addRect(0, 0, pageWidth, 20, theme.primary);

      yPosition += 30;

      if (invoice.value.logo) {
        try {
          pdf.addImage(invoice.value.logo, "JPEG", margin, yPosition, 20, 20);
          addText(
            "INVOICE",
            margin + 30,
            yPosition + 12,
            28,
            "bold",
            "left",
            theme.primary,
          );
          addText(
            invoice.value.number || "INV-001",
            margin + 30,
            yPosition + 19,
            11,
            "normal",
            "left",
            theme.accent,
          );
        } catch (error) {
          addText(
            "INVOICE",
            margin,
            yPosition + 15,
            28,
            "bold",
            "left",
            theme.primary,
          );
          addText(
            invoice.value.number || "INV-001",
            margin,
            yPosition + 22,
            11,
            "normal",
            "left",
            theme.accent,
          );
        }
      } else {
        addText(
          "INVOICE",
          margin,
          yPosition + 15,
          28,
          "bold",
          "left",
          theme.primary,
        );
        addText(
          invoice.value.number || "INV-001",
          margin,
          yPosition + 22,
          11,
          "normal",
          "left",
          theme.accent,
        );
      }

      // Dates with colored background
      const accentRgb = hexToRgb(theme.accent);
      pdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b, 0.1);
      pdf.rect(pageWidth - 65, yPosition + 5, 60, 20, "F");
      addText(
        "DATE",
        pageWidth - margin,
        yPosition + 8,
        8,
        "bold",
        "right",
        theme.primary,
      );
      addText(
        formatDate(invoice.value.date),
        pageWidth - margin,
        yPosition + 14,
        10,
        "normal",
        "right",
        theme.text,
      );
      addText(
        "DUE DATE",
        pageWidth - margin,
        yPosition + 22,
        8,
        "bold",
        "right",
        theme.primary,
      );
      addText(
        formatDate(invoice.value.dueDate),
        pageWidth - margin,
        yPosition + 28,
        10,
        "normal",
        "right",
        theme.text,
      );
    } else if (selectedTheme.value === "minimal") {
      // Minimal theme with lots of white space
      yPosition += 20;

      if (invoice.value.logo) {
        try {
          pdf.addImage(invoice.value.logo, "JPEG", margin, yPosition, 20, 20);
          addText(
            "INVOICE",
            margin + 30,
            yPosition + 12,
            24,
            "normal",
            "left",
            theme.primary,
          );
          addText(
            invoice.value.number || "INV-001",
            margin + 30,
            yPosition + 18,
            10,
            "normal",
            "left",
            theme.accent,
          );
        } catch (error) {
          addText(
            "INVOICE",
            margin,
            yPosition + 12,
            24,
            "normal",
            "left",
            theme.primary,
          );
          addText(
            invoice.value.number || "INV-001",
            margin,
            yPosition + 18,
            10,
            "normal",
            "left",
            theme.accent,
          );
        }
      } else {
        addText(
          "INVOICE",
          margin,
          yPosition + 12,
          24,
          "normal",
          "left",
          theme.primary,
        );
        addText(
          invoice.value.number || "INV-001",
          margin,
          yPosition + 18,
          10,
          "normal",
          "left",
          theme.accent,
        );
      }

      addText(
        "DATE",
        pageWidth - margin,
        yPosition + 5,
        8,
        "normal",
        "right",
        theme.accent,
      );
      addText(
        formatDate(invoice.value.date),
        pageWidth - margin,
        yPosition + 12,
        10,
        "normal",
        "right",
        theme.text,
      );
      addText(
        "DUE DATE",
        pageWidth - margin,
        yPosition + 18,
        8,
        "normal",
        "right",
        theme.accent,
      );
      addText(
        formatDate(invoice.value.dueDate),
        pageWidth - margin,
        yPosition + 25,
        10,
        "normal",
        "right",
        theme.text,
      );
    } else {
      // Professional theme (default)
      yPosition += 10;

      if (invoice.value.logo) {
        try {
          pdf.addImage(invoice.value.logo, "JPEG", margin, yPosition, 20, 20);
          addText(
            "INVOICE",
            margin + 30,
            yPosition + 12,
            28,
            "bold",
            "left",
            theme.primary,
          );
          addText(
            invoice.value.number || "INV-001",
            margin + 30,
            yPosition + 19,
            11,
            "normal",
            "left",
            theme.text,
          );
        } catch (error) {
          addText(
            "INVOICE",
            margin,
            yPosition + 15,
            28,
            "bold",
            "left",
            theme.primary,
          );
          addText(
            invoice.value.number || "INV-001",
            margin,
            yPosition + 22,
            11,
            "normal",
            "left",
            theme.text,
          );
        }
      } else {
        addText(
          "INVOICE",
          margin,
          yPosition + 15,
          28,
          "bold",
          "left",
          theme.primary,
        );
        addText(
          invoice.value.number || "INV-001",
          margin,
          yPosition + 22,
          11,
          "normal",
          "left",
          theme.text,
        );
      }

      addText(
        "DATE",
        pageWidth - margin,
        yPosition + 8,
        8,
        "bold",
        "right",
        theme.accent,
      );
      addText(
        formatDate(invoice.value.date),
        pageWidth - margin,
        yPosition + 14,
        10,
        "normal",
        "right",
        theme.text,
      );
      addText(
        "DUE DATE",
        pageWidth - margin,
        yPosition + 22,
        8,
        "bold",
        "right",
        theme.accent,
      );
      addText(
        formatDate(invoice.value.dueDate),
        pageWidth - margin,
        yPosition + 28,
        10,
        "normal",
        "right",
        theme.text,
      );
    }

    yPosition += 45;

    // From and To sections
    const halfWidth = contentWidth / 2;

    // FROM section
    addText("FROM", margin, yPosition, 8, "bold", "left", theme.accent);
    yPosition += 8;

    let fromStartY = yPosition;
    if (invoice.value.from.businessName) {
      addText(
        invoice.value.from.businessName,
        margin,
        yPosition,
        11,
        "bold",
        "left",
        theme.primary,
      );
      yPosition += 6;
    }
    if (invoice.value.from.address) {
      addText(
        invoice.value.from.address,
        margin,
        yPosition,
        9,
        "normal",
        "left",
        theme.text,
      );
      yPosition += 5;
    }
    if (invoice.value.from.email) {
      addText(
        invoice.value.from.email,
        margin,
        yPosition,
        9,
        "normal",
        "left",
        theme.text,
      );
      yPosition += 5;
    }
    if (invoice.value.from.phone) {
      addText(
        invoice.value.from.phone,
        margin,
        yPosition,
        9,
        "normal",
        "left",
        theme.text,
      );
      yPosition += 5;
    }
    if (invoice.value.from.taxId) {
      addText(
        `Tax ID: ${invoice.value.from.taxId}`,
        margin,
        yPosition,
        8,
        "normal",
        "left",
        theme.accent,
      );
      yPosition += 5;
    }

    // TO section (parallel to FROM)
    const toX = margin + halfWidth + 20;
    let toY = fromStartY - 8;
    addText("TO", toX, toY, 8, "bold", "left", theme.accent);
    toY += 8;

    if (invoice.value.to.customerName) {
      addText(
        invoice.value.to.customerName,
        toX,
        toY,
        11,
        "bold",
        "left",
        theme.primary,
      );
      toY += 6;
    }
    if (invoice.value.to.address) {
      addText(
        invoice.value.to.address,
        toX,
        toY,
        9,
        "normal",
        "left",
        theme.text,
      );
      toY += 5;
    }
    if (invoice.value.to.email) {
      addText(
        invoice.value.to.email,
        toX,
        toY,
        9,
        "normal",
        "left",
        theme.text,
      );
      toY += 5;
    }
    if (invoice.value.to.phone) {
      addText(
        invoice.value.to.phone,
        toX,
        toY,
        9,
        "normal",
        "left",
        theme.text,
      );
      toY += 5;
    }
    if (invoice.value.to.taxId) {
      addText(
        `Tax ID: ${invoice.value.to.taxId}`,
        toX,
        toY,
        8,
        "normal",
        "left",
        theme.accent,
      );
      toY += 5;
    }

    yPosition = Math.max(yPosition, toY) + 15;

    // Items table with precise column positioning
    const descriptionX = margin;
    const qtyX = margin + 80;
    const priceX = margin + 110;
    const taxX = margin + 140;
    const totalX = pageWidth - margin;

    // Table header
    addLine(margin, yPosition, pageWidth - margin, yPosition, 0.5);
    yPosition += 6;

    addText(
      "DESCRIPTION",
      descriptionX,
      yPosition,
      8,
      "bold",
      "left",
      theme.accent,
    );
    addText("QTY", qtyX, yPosition, 8, "bold", "center", theme.accent);
    addText("PRICE", priceX, yPosition, 8, "bold", "right", theme.accent);
    addText("TAX", taxX, yPosition, 8, "bold", "center", theme.accent);
    addText("TOTAL", totalX, yPosition, 8, "bold", "right", theme.accent);

    yPosition += 4;
    addLine(margin, yPosition, pageWidth - margin, yPosition, 0.5);
    yPosition += 8;

    // Items
    if (invoice.value.items.length === 0) {
      addText(
        "No items added yet",
        margin + contentWidth / 2,
        yPosition + 15,
        9,
        "normal",
        "center",
      );
      yPosition += 30;
    } else {
      invoice.value.items.forEach((item, index) => {
        // Add subtle separator line between items
        if (index > 0) {
          addLine(
            margin,
            yPosition - 4,
            pageWidth - margin,
            yPosition - 4,
            0.1,
          );
        }

        // Truncate description if too long
        let description = item.description || "—";
        if (description.length > 35) {
          description = description.substring(0, 32) + "...";
        }

        addText(
          description,
          descriptionX,
          yPosition,
          9,
          "normal",
          "left",
          theme.text,
        );
        addText(
          String(item.quantity || 0),
          qtyX,
          yPosition,
          9,
          "normal",
          "center",
          theme.text,
        );
        addText(
          `$${(item.price || 0).toFixed(2)}`,
          priceX,
          yPosition,
          9,
          "normal",
          "right",
          theme.text,
        );
        addText(
          `${(item.tax || 0).toFixed(1)}%`,
          taxX,
          yPosition,
          9,
          "normal",
          "center",
          theme.text,
        );
        addText(
          `$${itemTotal(item).toFixed(2)}`,
          totalX,
          yPosition,
          9,
          "bold",
          "right",
          theme.primary,
        );

        yPosition += 8;
      });
    }

    yPosition += 5;
    addLine(margin, yPosition, pageWidth - margin, yPosition, 0.5);
    yPosition += 20;

    // Totals section
    const totalsLabelX = pageWidth - margin - 60;
    const totalsValueX = pageWidth - margin;

    addText(
      "Subtotal",
      totalsLabelX,
      yPosition,
      9,
      "normal",
      "left",
      theme.text,
    );
    addText(
      `$${subtotal.value.toFixed(2)}`,
      totalsValueX,
      yPosition,
      9,
      "normal",
      "right",
      theme.text,
    );
    yPosition += 7;

    addText("Tax", totalsLabelX, yPosition, 9, "normal", "left", theme.text);
    addText(
      `$${totalTax.value.toFixed(2)}`,
      totalsValueX,
      yPosition,
      9,
      "normal",
      "right",
      theme.text,
    );
    yPosition += 10;

    addLine(
      totalsLabelX,
      yPosition,
      pageWidth - margin,
      yPosition,
      0.8,
      theme.primary,
    );
    yPosition += 8;

    addText(
      "Total",
      totalsLabelX,
      yPosition,
      12,
      "bold",
      "left",
      theme.primary,
    );
    addText(
      `$${total.value.toFixed(2)}`,
      totalsValueX,
      yPosition,
      12,
      "bold",
      "right",
      theme.primary,
    );

    // Add QR code if available
    if (paymentQRCode.value) {
      yPosition += 25;

      // Check if we have enough space, if not add a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin + 20;
      }

      try {
        addText(
          "Payment QR Code",
          margin,
          yPosition,
          10,
          "bold",
          "left",
          theme.primary,
        );
        yPosition += 8;

        // Add QR code image
        pdf.addImage(paymentQRCode.value, "PNG", margin, yPosition, 30, 30);

        // Add payment instructions next to QR code
        let instructionText = "Scan to pay";
        if (invoice.value.payment.paypalEmail) {
          instructionText = "Scan for PayPal payment";
        } else if (invoice.value.payment.cryptoAddress) {
          instructionText = "Scan for crypto payment";
        }

        addText(
          instructionText,
          margin + 35,
          yPosition + 8,
          9,
          "normal",
          "left",
          theme.text,
        );
        addText(
          `Amount: $${total.value.toFixed(2)}`,
          margin + 35,
          yPosition + 15,
          9,
          "normal",
          "left",
          theme.text,
        );
        addText(
          `Invoice: ${invoice.value.number}`,
          margin + 35,
          yPosition + 22,
          9,
          "normal",
          "left",
          theme.text,
        );
      } catch (error) {
        console.warn("Could not add QR code to PDF:", error);
      }
    }

    // Add payment information if available
    if (
      invoice.value.payment.instructions ||
      invoice.value.payment.bankDetails
    ) {
      yPosition += paymentQRCode.value ? 40 : 25;

      // Check if we have enough space
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin + 20;
      }

      addText(
        "Payment Information",
        margin,
        yPosition,
        10,
        "bold",
        "left",
        theme.primary,
      );
      yPosition += 8;

      if (invoice.value.payment.instructions) {
        const instructions = invoice.value.payment.instructions;
        const lines = instructions.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            addText(
              line.trim(),
              margin,
              yPosition,
              9,
              "normal",
              "left",
              theme.text,
            );
            yPosition += 5;
          }
        });
        yPosition += 3;
      }

      if (invoice.value.payment.bankDetails) {
        addText(
          "Bank Details:",
          margin,
          yPosition,
          9,
          "bold",
          "left",
          theme.text,
        );
        yPosition += 5;
        const bankLines = invoice.value.payment.bankDetails.split("\n");
        bankLines.forEach((line) => {
          if (line.trim()) {
            addText(
              line.trim(),
              margin,
              yPosition,
              9,
              "normal",
              "left",
              theme.text,
            );
            yPosition += 5;
          }
        });
      }
    }

    pdf.save(`${invoice.value.number || "invoice"}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  } finally {
    isGeneratingPDF.value = false;
  }
};

const exportToCSV = () => {
  const headers = ["Item", "Quantity", "Price", "Tax %", "Total"];
  const csvData = [
    ["Invoice Information"],
    ["Invoice Number", invoice.value.number || "N/A"],
    ["Invoice Date", formatDate(invoice.value.date)],
    ["Due Date", formatDate(invoice.value.dueDate)],
    [""],
    ["From"],
    ["Business Name", invoice.value.from.businessName || "N/A"],
    ["Address", invoice.value.from.address || "N/A"],
    ["Email", invoice.value.from.email || "N/A"],
    ["Phone", invoice.value.from.phone || "N/A"],
    ["Tax ID", invoice.value.from.taxId || "N/A"],
    [""],
    ["To"],
    ["Customer Name", invoice.value.to.customerName || "N/A"],
    ["Address", invoice.value.to.address || "N/A"],
    ["Email", invoice.value.to.email || "N/A"],
    ["Phone", invoice.value.to.phone || "N/A"],
    ["Tax ID", invoice.value.to.taxId || "N/A"],
    [""],
    ["Items"],
    headers,
    ...invoice.value.items.map((item) => [
      item.description || "N/A",
      item.quantity || 0,
      `$${(item.price || 0).toFixed(2)}`,
      `${(item.tax || 0).toFixed(1)}%`,
      `$${itemTotal(item).toFixed(2)}`,
    ]),
    [""],
    ["Summary"],
    ["Subtotal", `$${subtotal.value.toFixed(2)}`],
    ["Tax", `$${totalTax.value.toFixed(2)}`],
    ["Total", `$${total.value.toFixed(2)}`],
  ];

  const csvContent = csvData
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${invoice.value.number || "invoice"}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showExportOptions.value = false;
};

const exportToJSON = () => {
  const exportData = {
    invoice: invoice.value,
    summary: {
      subtotal: subtotal.value,
      totalTax: totalTax.value,
      total: total.value,
    },
    exportedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${invoice.value.number || "invoice"}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showExportOptions.value = false;
};

const exportToExcel = async () => {
  try {
    const { default: XLSX } = await import("xlsx");

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Invoice information worksheet
    const invoiceData = [
      ["Invoice Generator Export"],
      [""],
      ["Invoice Information"],
      ["Invoice Number", invoice.value.number || "N/A"],
      ["Invoice Date", formatDate(invoice.value.date)],
      ["Due Date", formatDate(invoice.value.dueDate)],
      [""],
      ["From"],
      ["Business Name", invoice.value.from.businessName || "N/A"],
      ["Address", invoice.value.from.address || "N/A"],
      ["Email", invoice.value.from.email || "N/A"],
      ["Phone", invoice.value.from.phone || "N/A"],
      ["Tax ID", invoice.value.from.taxId || "N/A"],
      [""],
      ["To"],
      ["Customer Name", invoice.value.to.customerName || "N/A"],
      ["Address", invoice.value.to.address || "N/A"],
      ["Email", invoice.value.to.email || "N/A"],
      ["Phone", invoice.value.to.phone || "N/A"],
      ["Tax ID", invoice.value.to.taxId || "N/A"],
      [""],
      ["Payment Information"],
      ["Instructions", invoice.value.payment.instructions || "N/A"],
      ["Bank Details", invoice.value.payment.bankDetails || "N/A"],
      ["PayPal Email", invoice.value.payment.paypalEmail || "N/A"],
      ["Crypto Address", invoice.value.payment.cryptoAddress || "N/A"],
    ];

    const invoiceSheet = XLSX.utils.aoa_to_sheet(invoiceData);
    XLSX.utils.book_append_sheet(workbook, invoiceSheet, "Invoice Info");

    // Items worksheet
    const itemsData = [
      ["Invoice Items"],
      [""],
      ["Description", "Quantity", "Price", "Tax %", "Total"],
      ...invoice.value.items.map((item) => [
        item.description || "N/A",
        item.quantity || 0,
        (item.price || 0).toFixed(2),
        (item.tax || 0).toFixed(1),
        itemTotal(item).toFixed(2),
      ]),
      [""],
      ["Summary"],
      ["Subtotal", "", "", "", subtotal.value.toFixed(2)],
      ["Tax", "", "", "", totalTax.value.toFixed(2)],
      ["Total", "", "", "", total.value.toFixed(2)],
    ];

    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Items");

    // Write file
    XLSX.writeFile(workbook, `${invoice.value.number || "invoice"}.xlsx`);

    showExportOptions.value = false;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Error exporting to Excel. Please try again.");
  }
};

// QR Code generation functions
const generatePaymentQR = async () => {
  try {
    const { default: QRCode } = await import("qrcode");

    let paymentData = "";

    // Priority: PayPal, then crypto, then bank details
    if (invoice.value.payment.paypalEmail) {
      paymentData = `paypal:${invoice.value.payment.paypalEmail}?amount=${total.value}&invoice=${invoice.value.number}`;
    } else if (invoice.value.payment.cryptoAddress) {
      paymentData = `bitcoin:${invoice.value.payment.cryptoAddress}?amount=${total.value}&label=${invoice.value.number}`;
    } else if (invoice.value.payment.bankDetails) {
      paymentData = `Payment for invoice ${invoice.value.number}: ${total.value.toFixed(2)} USD\n${invoice.value.payment.bankDetails}`;
    } else {
      paymentData = `Invoice ${invoice.value.number} - Amount: $${total.value.toFixed(2)}`;
    }

    const qrDataURL = await QRCode.toDataURL(paymentData, {
      width: 150,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    paymentQRCode.value = qrDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    paymentQRCode.value = null;
  }
};

// Watch for payment info changes to regenerate QR code
watch(
  [
    () => invoice.value.payment.paypalEmail,
    () => invoice.value.payment.cryptoAddress,
    () => invoice.value.payment.bankDetails,
    () => invoice.value.number,
    () => total.value,
  ],
  () => {
    if (
      invoice.value.payment.paypalEmail ||
      invoice.value.payment.cryptoAddress ||
      invoice.value.payment.bankDetails
    ) {
      generatePaymentQR();
    } else {
      paymentQRCode.value = null;
    }
  },
  { deep: true },
);

// Generate QR code on mount if payment info exists
onMounted(() => {
  const savedData = loadFromStorage();
  if (savedData) {
    invoice.value = savedData;
    // If current invoice doesn't have a logo but we have a default logo, use it
    if (!savedData.logo && loadDefaultLogo()) {
      invoice.value.logo = loadDefaultLogo();
    }
    // Generate QR code if payment info exists
    if (
      savedData.payment &&
      (savedData.payment.paypalEmail ||
        savedData.payment.cryptoAddress ||
        savedData.payment.bankDetails)
    ) {
      generatePaymentQR();
    }
  }
});
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

:root {
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e5e5e5;
  --color-gray-300: #d4d4d4;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-700: #404040;
  --color-gray-800: #262626;
  --color-gray-900: #171717;
}

* {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
