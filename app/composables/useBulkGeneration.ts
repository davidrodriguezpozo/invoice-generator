import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useChaosMode } from './useChaosMode'
import { useInvoice, type Invoice, type SavedInvoice } from './useInvoice'

export interface BulkGenerationOptions {
  count: number
  prefix: string
  useDateRange: boolean
  startDate?: string
  endDate?: string
}

// State
const isGenerating = ref(false)
const progress = ref({ current: 0, total: 0 })

export function useBulkGeneration() {
  const { generateChaoticInvoice, chaosConfig } = useChaosMode()
  const { invoiceHistory, currency } = useInvoice()

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

  // Generate bulk invoices
  const generateBulkInvoices = async (options: BulkGenerationOptions): Promise<SavedInvoice[]> => {
    isGenerating.value = true
    progress.value = { current: 0, total: options.count }

    const invoices: SavedInvoice[] = []

    try {
      for (let i = 0; i < options.count; i++) {
        // Generate chaotic invoice
        const invoice = generateChaoticInvoice()

        // Apply custom invoice number with prefix
        invoice.number = `${options.prefix}${String(i + 1).padStart(3, '0')}`

        // Apply date range if enabled
        if (options.useDateRange && options.startDate && options.endDate) {
          invoice.date = randomDateInRange(options.startDate, options.endDate)
          invoice.dueDate = addDays(invoice.date, 30)
        }

        // Create saved invoice
        const savedInvoice: SavedInvoice = {
          id: uuidv4(),
          invoice,
          savedAt: new Date().toISOString(),
          totalAmount: calculateTotal(invoice),
          customerName: invoice.to.customerName
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
