<template>
  <div class="h-full flex flex-col bg-gray-100 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700">{{ t('invoicePreview') }}</h3>
      <div class="flex items-center gap-2">
        <button
          @click="refreshPreview"
          :disabled="isGenerating"
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title="Refresh preview"
        >
          <svg :class="['w-4 h-4', isGenerating && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-4 overflow-hidden">
      <!-- Loading State with Skeleton -->
      <div v-if="isGenerating && !previewUrl" class="h-full bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div class="p-6 space-y-4">
          <!-- Header skeleton -->
          <div class="flex justify-between">
            <div class="space-y-2">
              <div class="h-8 w-32 bg-gray-200 rounded"></div>
              <div class="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
            <div class="space-y-2 text-right">
              <div class="h-4 w-20 bg-gray-100 rounded ml-auto"></div>
              <div class="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
            </div>
          </div>

          <!-- From/To skeleton -->
          <div class="flex gap-8 pt-8">
            <div class="flex-1 space-y-2">
              <div class="h-3 w-12 bg-gray-100 rounded"></div>
              <div class="h-4 w-32 bg-gray-200 rounded"></div>
              <div class="h-3 w-28 bg-gray-100 rounded"></div>
              <div class="h-3 w-24 bg-gray-100 rounded"></div>
            </div>
            <div class="flex-1 space-y-2">
              <div class="h-3 w-8 bg-gray-100 rounded"></div>
              <div class="h-4 w-28 bg-gray-200 rounded"></div>
              <div class="h-3 w-32 bg-gray-100 rounded"></div>
              <div class="h-3 w-20 bg-gray-100 rounded"></div>
            </div>
          </div>

          <!-- Table skeleton -->
          <div class="pt-8 space-y-2">
            <div class="h-8 bg-gray-100 rounded"></div>
            <div class="h-6 bg-gray-50 rounded"></div>
            <div class="h-6 bg-gray-50 rounded"></div>
            <div class="h-6 bg-gray-50 rounded"></div>
          </div>

          <!-- Totals skeleton -->
          <div class="pt-8 flex justify-end">
            <div class="space-y-2 w-48">
              <div class="flex justify-between">
                <div class="h-4 w-16 bg-gray-100 rounded"></div>
                <div class="h-4 w-20 bg-gray-100 rounded"></div>
              </div>
              <div class="flex justify-between">
                <div class="h-4 w-12 bg-gray-100 rounded"></div>
                <div class="h-4 w-16 bg-gray-100 rounded"></div>
              </div>
              <div class="h-px bg-gray-200 my-2"></div>
              <div class="flex justify-between">
                <div class="h-5 w-14 bg-gray-200 rounded"></div>
                <div class="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Preview -->
      <iframe
        v-else-if="previewUrl"
        :src="previewUrl"
        class="w-full h-full rounded-lg shadow-sm bg-white border border-gray-200"
        title="Invoice PDF Preview"
      />

      <!-- No Preview State -->
      <div v-else class="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">{{ t('noPreview') }}</p>
        <button
          @click="refreshPreview"
          class="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Generate Preview
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, toRef } from 'vue'
import { useInvoice, type Invoice, type InvoiceItem } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'

const props = defineProps<{
  invoice: Invoice
  currency: string
}>()

const { formatDate, PDF_THEME } = useInvoice()
const { t } = useTranslations()

// Use props instead of composable for invoice data
const invoice = toRef(props, 'invoice')
const currency = toRef(props, 'currency')

// Compute totals from props
const subtotal = computed(() => {
  return props.invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
})

const totalTax = computed(() => {
  return props.invoice.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.price
    return sum + (itemSubtotal * item.tax) / 100
  }, 0)
})

const total = computed(() => subtotal.value + totalTax.value)

const itemTotal = (item: InvoiceItem) => {
  const sub = item.quantity * item.price
  const taxAmount = (sub * item.tax) / 100
  return sub + taxAmount
}

const previewUrl = ref<string | null>(null)
const isGenerating = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const generatePreview = async () => {
  if (isGenerating.value) return

  try {
    isGenerating.value = true

    const { default: jsPDF } = await import('jspdf')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfTitle = invoice.value.number || 'Invoice'
    pdf.setProperties({
      title: pdfTitle,
      subject: `Invoice ${pdfTitle}`,
      creator: 'Invoice Generator'
    })

    const pageWidth = 210
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    const theme = PDF_THEME

    let yPosition = margin

    const addText = (
      text: string,
      x: number,
      y: number,
      fontSize: number = 9,
      style: string = 'normal',
      align: string = 'left',
      color: string = theme.text
    ) => {
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica', style)
      pdf.setTextColor(color)

      if (align === 'center') {
        const textWidth = pdf.getTextWidth(text)
        x = x - textWidth / 2
      } else if (align === 'right') {
        const textWidth = pdf.getTextWidth(text)
        x = x - textWidth
      }

      pdf.text(text, x, y)
    }

    const addLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      lineWidth: number = 0.2,
      color: string = theme.accent
    ) => {
      pdf.setLineWidth(lineWidth)
      pdf.setDrawColor(color)
      pdf.line(x1, y1, x2, y2)
    }

    // Header
    yPosition += 10

    if (invoice.value.logo) {
      try {
        pdf.addImage(invoice.value.logo, 'JPEG', margin, yPosition, 20, 20)
        addText('INVOICE', margin + 30, yPosition + 12, 28, 'bold', 'left', theme.primary)
        addText(invoice.value.number || 'INV-001', margin + 30, yPosition + 19, 11, 'normal', 'left', theme.text)
      } catch {
        addText('INVOICE', margin, yPosition + 15, 28, 'bold', 'left', theme.primary)
        addText(invoice.value.number || 'INV-001', margin, yPosition + 22, 11, 'normal', 'left', theme.text)
      }
    } else {
      addText('INVOICE', margin, yPosition + 15, 28, 'bold', 'left', theme.primary)
      addText(invoice.value.number || 'INV-001', margin, yPosition + 22, 11, 'normal', 'left', theme.text)
    }

    addText('DATE', pageWidth - margin, yPosition + 8, 8, 'bold', 'right', theme.accent)
    addText(formatDate(invoice.value.date), pageWidth - margin, yPosition + 14, 10, 'normal', 'right', theme.text)
    addText('DUE DATE', pageWidth - margin, yPosition + 22, 8, 'bold', 'right', theme.accent)
    addText(formatDate(invoice.value.dueDate), pageWidth - margin, yPosition + 28, 10, 'normal', 'right', theme.text)

    yPosition += 45

    // From and To sections
    const halfWidth = contentWidth / 2

    addText('FROM', margin, yPosition, 8, 'bold', 'left', theme.accent)
    yPosition += 8

    let fromStartY = yPosition
    if (invoice.value.from.businessName) {
      addText(invoice.value.from.businessName, margin, yPosition, 11, 'bold', 'left', theme.primary)
      yPosition += 6
    }
    if (invoice.value.from.address) {
      addText(invoice.value.from.address, margin, yPosition, 9, 'normal', 'left', theme.text)
      yPosition += 5
    }
    if (invoice.value.from.email) {
      addText(invoice.value.from.email, margin, yPosition, 9, 'normal', 'left', theme.text)
      yPosition += 5
    }
    if (invoice.value.from.phone) {
      addText(invoice.value.from.phone, margin, yPosition, 9, 'normal', 'left', theme.text)
      yPosition += 5
    }
    if (invoice.value.from.taxId) {
      addText(`Tax ID: ${invoice.value.from.taxId}`, margin, yPosition, 8, 'normal', 'left', theme.accent)
      yPosition += 5
    }

    const toX = margin + halfWidth + 20
    let toY = fromStartY - 8
    addText('TO', toX, toY, 8, 'bold', 'left', theme.accent)
    toY += 8

    if (invoice.value.to.customerName) {
      addText(invoice.value.to.customerName, toX, toY, 11, 'bold', 'left', theme.primary)
      toY += 6
    }
    if (invoice.value.to.address) {
      addText(invoice.value.to.address, toX, toY, 9, 'normal', 'left', theme.text)
      toY += 5
    }
    if (invoice.value.to.email) {
      addText(invoice.value.to.email, toX, toY, 9, 'normal', 'left', theme.text)
      toY += 5
    }
    if (invoice.value.to.phone) {
      addText(invoice.value.to.phone, toX, toY, 9, 'normal', 'left', theme.text)
      toY += 5
    }
    if (invoice.value.to.taxId) {
      addText(`Tax ID: ${invoice.value.to.taxId}`, toX, toY, 8, 'normal', 'left', theme.accent)
      toY += 5
    }

    yPosition = Math.max(yPosition, toY) + 15

    // Items table
    const descriptionX = margin
    const qtyX = margin + 80
    const priceX = margin + 110
    const taxX = margin + 140
    const totalX = pageWidth - margin

    addLine(margin, yPosition, pageWidth - margin, yPosition, 0.5)
    yPosition += 6

    addText('DESCRIPTION', descriptionX, yPosition, 8, 'bold', 'left', theme.accent)
    addText('QTY', qtyX, yPosition, 8, 'bold', 'center', theme.accent)
    addText('PRICE', priceX, yPosition, 8, 'bold', 'right', theme.accent)
    addText('TAX', taxX, yPosition, 8, 'bold', 'center', theme.accent)
    addText('TOTAL', totalX, yPosition, 8, 'bold', 'right', theme.accent)

    yPosition += 4
    addLine(margin, yPosition, pageWidth - margin, yPosition, 0.5)
    yPosition += 8

    if (invoice.value.items.length === 0) {
      addText('No items added yet', margin + contentWidth / 2, yPosition + 15, 9, 'normal', 'center')
      yPosition += 30
    } else {
      invoice.value.items.forEach((item, index) => {
        if (index > 0) {
          addLine(margin, yPosition - 4, pageWidth - margin, yPosition - 4, 0.1)
        }

        let description = item.description || '—'
        if (description.length > 35) {
          description = description.substring(0, 32) + '...'
        }

        addText(description, descriptionX, yPosition, 9, 'normal', 'left', theme.text)
        addText(String(item.quantity || 0), qtyX, yPosition, 9, 'normal', 'center', theme.text)
        addText(`${currency.value}${(item.price || 0).toFixed(2)}`, priceX, yPosition, 9, 'normal', 'right', theme.text)
        addText(`${(item.tax || 0).toFixed(1)}%`, taxX, yPosition, 9, 'normal', 'center', theme.text)
        addText(`${currency.value}${itemTotal(item).toFixed(2)}`, totalX, yPosition, 9, 'bold', 'right', theme.primary)

        yPosition += 8
      })
    }

    yPosition += 5
    addLine(margin, yPosition, pageWidth - margin, yPosition, 0.5)
    yPosition += 20

    // Totals
    const totalsLabelX = pageWidth - margin - 60
    const totalsValueX = pageWidth - margin

    addText('Subtotal', totalsLabelX, yPosition, 9, 'normal', 'left', theme.text)
    addText(`${currency.value}${subtotal.value.toFixed(2)}`, totalsValueX, yPosition, 9, 'normal', 'right', theme.text)
    yPosition += 7

    addText('Tax', totalsLabelX, yPosition, 9, 'normal', 'left', theme.text)
    addText(`${currency.value}${totalTax.value.toFixed(2)}`, totalsValueX, yPosition, 9, 'normal', 'right', theme.text)
    yPosition += 10

    addLine(totalsLabelX, yPosition, pageWidth - margin, yPosition, 0.8, theme.primary)
    yPosition += 8

    addText('Total', totalsLabelX, yPosition, 12, 'bold', 'left', theme.primary)
    addText(`${currency.value}${total.value.toFixed(2)}`, totalsValueX, yPosition, 12, 'bold', 'right', theme.primary)

    // Notes and Payment Terms
    if (invoice.value.notes || invoice.value.terms) {
      yPosition += 20
      addLine(margin, yPosition, pageWidth - margin, yPosition, 0.3)
      yPosition += 10

      if (invoice.value.notes) {
        addText('NOTES', margin, yPosition, 8, 'bold', 'left', theme.accent)
        yPosition += 6
        const notesLines = pdf.splitTextToSize(invoice.value.notes, contentWidth)
        notesLines.forEach((line: string) => {
          addText(line, margin, yPosition, 9, 'normal', 'left', theme.text)
          yPosition += 5
        })
        yPosition += 5
      }

      if (invoice.value.terms) {
        addText('PAYMENT TERMS', margin, yPosition, 8, 'bold', 'left', theme.accent)
        yPosition += 6
        const termsLines = pdf.splitTextToSize(invoice.value.terms, contentWidth)
        termsLines.forEach((line: string) => {
          addText(line, margin, yPosition, 9, 'normal', 'left', theme.text)
          yPosition += 5
        })
      }
    }

    // Revoke old blob URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value.split('#')[0])
    }

    const pdfBlob = pdf.output('blob')
    const filename = `${invoice.value.number || 'invoice'}.pdf`
    previewUrl.value = URL.createObjectURL(pdfBlob) + `#${encodeURIComponent(filename)}`
  } catch (error) {
    console.error('Error generating PDF preview:', error)
  } finally {
    isGenerating.value = false
  }
}

const refreshPreview = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    generatePreview()
  }, 300)
}

// Watch for changes
watch(
  [invoice, currency],
  () => {
    refreshPreview()
  },
  { deep: true }
)

onMounted(() => {
  generatePreview()
})

onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value.split('#')[0])
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>
