import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useChaosMode } from './useChaosMode'
import { useRealisticGeneration } from './useRealisticGeneration'
import { DOCUMENT_TYPE_CONFIG, useInvoice, type DocumentType, type Invoice, type SavedInvoice } from './useInvoice'

export type BulkDocumentType = DocumentType | 'random'
export type BulkGenerationMode = 'realistic' | 'chaos'

export interface BulkGenerationOptions {
  count: number
  prefix: string
  documentType: BulkDocumentType
  mode: BulkGenerationMode
  lockContacts: boolean
  useDateRange: boolean
  startDate?: string
  endDate?: string
}

// State
const isGenerating = ref(false)
const progress = ref({ current: 0, total: 0 })

export function useBulkGeneration() {
  const { generateChaoticInvoice } = useChaosMode()
  const { loadFaker, generateRealisticInvoice } = useRealisticGeneration()
  const { invoiceHistory } = useInvoice()

  const HISTORY_KEY = 'invoice-generator-history'

  // Helper to generate random date in range
  const randomDateInRange = (start: string, end: string): string => {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const randomTime = startTime + Math.random() * (endTime - startTime)
    return new Date(randomTime).toISOString().split('T')[0]
  }

  // Helper to add days to a date
  const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  // Calculate total for an invoice
  const calculateTotal = (invoice: Invoice): number => {
    return invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price
      const itemTax = itemSubtotal * (item.tax / 100)
      return sum + itemSubtotal + itemTax
    }, 0)
  }

  // Generate bulk invoices. `sourceInvoice` is the current editor document, used
  // to pin sender/recipient when options.lockContacts is enabled.
  const generateBulkInvoices = async (
    options: BulkGenerationOptions,
    sourceInvoice?: Invoice,
  ): Promise<SavedInvoice[]> => {
    isGenerating.value = true
    progress.value = { current: 0, total: options.count }

    const invoices: SavedInvoice[] = []
    const resolvedDocType = options.documentType === 'random' ? undefined : options.documentType

    // Snapshot the editor's contacts once so the whole batch shares the same parties.
    const lockedFrom = options.lockContacts && sourceInvoice ? JSON.parse(JSON.stringify(sourceInvoice.from)) : null
    const lockedTo = options.lockContacts && sourceInvoice ? JSON.parse(JSON.stringify(sourceInvoice.to)) : null

    try {
      if (options.mode === 'realistic') {
        await loadFaker()
      }

      for (let i = 0; i < options.count; i++) {
        // Generate document of the requested type (or random) in the chosen mode
        const doc = options.mode === 'realistic'
          ? generateRealisticInvoice(resolvedDocType)
          : generateChaoticInvoice(resolvedDocType)

        // Apply custom number with prefix
        doc.number = `${options.prefix}${String(i + 1).padStart(3, '0')}`

        // Lock sender/recipient to the current editor document if requested
        if (lockedFrom && lockedTo) {
          doc.from = JSON.parse(JSON.stringify(lockedFrom))
          doc.to = JSON.parse(JSON.stringify(lockedTo))
        }

        // Apply date range if enabled
        if (options.useDateRange && options.startDate && options.endDate) {
          doc.date = randomDateInRange(options.startDate, options.endDate)
          const docConfig = DOCUMENT_TYPE_CONFIG[doc.documentType]
          doc.dueDate = docConfig.hasDueDate ? addDays(doc.date, 30) : ''
        }

        // Create saved invoice
        const savedInvoice: SavedInvoice = {
          id: uuidv4(),
          invoice: doc,
          savedAt: new Date().toISOString(),
          totalAmount: calculateTotal(doc),
          customerName: doc.to.customerName,
          documentType: doc.documentType,
        }

        invoices.push(savedInvoice)
        progress.value.current = i + 1

        // Small delay to allow UI updates and prevent blocking
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      // Add all invoices to history
      invoiceHistory.value = [...invoices, ...invoiceHistory.value]

      // Save to localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(invoiceHistory.value))

      return invoices
    } finally {
      isGenerating.value = false
      progress.value = { current: 0, total: 0 }
    }
  }

  return {
    // State
    isGenerating,
    progress,

    // Methods
    generateBulkInvoices,
  }
}
