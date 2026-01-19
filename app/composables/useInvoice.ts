import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useChaosMode } from './useChaosMode'

// Types
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  tax: number
}

export interface Invoice {
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

export interface SavedInvoice {
  id: string
  invoice: Invoice
  savedAt: string
  totalAmount: number
  customerName: string
}

export interface Customer {
  id: string
  customerName: string
  taxId: string
  address: string
  email: string
  phone: string
  createdAt: string
  lastUsed: string
}

export interface PDFTheme {
  id: string
  name: string
  description: string
  primary: string
  accent: string
  text: string
  background: string
}

// Validation errors type
export interface ValidationErrors {
  invoiceNumber?: string
  businessName?: string
  customerName?: string
  items?: string
}

// Storage keys
const STORAGE_KEY = 'invoice-generator-data'
const HISTORY_KEY = 'invoice-generator-history'
const CUSTOMERS_KEY = 'invoice-generator-customers'
const LOGO_KEY = 'invoice-generator-default-logo'
const LANGUAGE_KEY = 'invoice-generator-language'
const ONBOARDING_KEY = 'invoice-generator-onboarding-completed'

// PDF Theme
export const PDF_THEME: PDFTheme = {
  id: 'professional',
  name: 'Professional',
  description: 'Clean and corporate',
  primary: '#1e40af',
  accent: '#6b7280',
  text: '#374151',
  background: '#ffffff',
}

// Helper functions
const getDefaultInvoice = (defaultLogo: string | null = null): Invoice => ({
  number: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  logo: defaultLogo,
  from: {
    businessName: '',
    taxId: '',
    address: '',
    email: '',
    phone: '',
  },
  to: {
    customerName: '',
    taxId: '',
    address: '',
    email: '',
    phone: '',
  },
  items: [],
  notes: '',
  terms: '',
})

// Create a singleton-like state that persists across component instances
const invoice = ref<Invoice>(getDefaultInvoice())
const invoiceHistory = ref<SavedInvoice[]>([])
const customers = ref<Customer[]>([])
const currency = ref<string>('$')
const language = ref<string>('EN')
const hasCompletedOnboarding = ref<boolean>(false)
const isInitialized = ref<boolean>(false)

export function useInvoice() {
  // Storage functions
  const saveToStorage = (data: Invoice) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  const loadFromStorage = (): Invoice | null => {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return null
      const savedInvoice = JSON.parse(data)
      const defaultInvoice = getDefaultInvoice()
      return {
        ...defaultInvoice,
        ...savedInvoice,
        from: { ...defaultInvoice.from, ...savedInvoice.from },
        to: { ...defaultInvoice.to, ...savedInvoice.to },
        items: savedInvoice.items || defaultInvoice.items,
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
      return null
    }
  }

  const saveInvoiceHistory = (invoices: SavedInvoice[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(invoices))
    } catch (error) {
      console.warn('Failed to save invoice history:', error)
    }
  }

  const loadInvoiceHistory = (): SavedInvoice[] => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.warn('Failed to load invoice history:', error)
      return []
    }
  }

  const saveCustomersToStorage = (customerList: Customer[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customerList))
    } catch (error) {
      console.warn('Failed to save customers:', error)
    }
  }

  const loadCustomersFromStorage = (): Customer[] => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.warn('Failed to load customers:', error)
      return []
    }
  }

  const saveDefaultLogo = (logo: string | null) => {
    if (typeof window === 'undefined') return
    try {
      if (logo) {
        localStorage.setItem(LOGO_KEY, logo)
      } else {
        localStorage.removeItem(LOGO_KEY)
      }
    } catch (error) {
      console.warn('Failed to save default logo:', error)
    }
  }

  const loadDefaultLogo = (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(LOGO_KEY)
    } catch (error) {
      console.warn('Failed to load default logo:', error)
      return null
    }
  }

  const saveLanguage = (lang: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(LANGUAGE_KEY, lang)
  }

  const loadLanguage = (): string => {
    if (typeof window === 'undefined') return 'EN'
    return localStorage.getItem(LANGUAGE_KEY) || 'EN'
  }

  const saveOnboardingStatus = (completed: boolean) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ONBOARDING_KEY, String(completed))
  }

  const loadOnboardingStatus = (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  }

  // Initialize from storage
  const initialize = () => {
    if (isInitialized.value) return

    const savedData = loadFromStorage()
    const defaultLogo = loadDefaultLogo()

    if (savedData) {
      invoice.value = savedData
      if (!savedData.logo && defaultLogo) {
        invoice.value.logo = defaultLogo
      }
    } else {
      invoice.value = getDefaultInvoice(defaultLogo)
    }

    invoiceHistory.value = loadInvoiceHistory()
    customers.value = loadCustomersFromStorage()
    language.value = loadLanguage()
    hasCompletedOnboarding.value = loadOnboardingStatus()
    isInitialized.value = true
  }

  // Chaos mode integration
  const { chaosOverrides, generateChaoticInvoice, resetChaosMode, chaosEnabled } = useChaosMode()

  // Computed properties (with chaos override support)
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
    return invoice.value.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price
      return sum + (itemSubtotal * item.tax) / 100
    }, 0)
  })

  const total = computed(() => {
    if (chaosOverrides.value?.total !== undefined) {
      return chaosOverrides.value.total
    }
    return subtotal.value + totalTax.value
  })

  const canDownload = computed(() => {
    return (
      invoice.value.number?.trim() &&
      invoice.value.from.businessName?.trim() &&
      invoice.value.to.customerName?.trim()
    )
  })

  // Validation
  const validationErrors = computed<ValidationErrors>(() => {
    const errors: ValidationErrors = {}
    if (!invoice.value.number?.trim()) {
      errors.invoiceNumber = 'Invoice number is required'
    }
    if (!invoice.value.from.businessName?.trim()) {
      errors.businessName = 'Business name is required'
    }
    if (!invoice.value.to.customerName?.trim()) {
      errors.customerName = 'Customer name is required'
    }
    return errors
  })

  const hasValidationErrors = computed(() => Object.keys(validationErrors.value).length > 0)

  // Item calculations
  const itemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.price
    const taxAmount = (subtotal * item.tax) / 100
    return subtotal + taxAmount
  }

  // Item management
  const addItem = () => {
    invoice.value.items.push({
      id: uuidv4(),
      description: '',
      quantity: 1,
      price: 0,
      tax: 0,
    })
  }

  const removeItem = (index: number) => {
    invoice.value.items.splice(index, 1)
  }

  const duplicateItem = (index: number) => {
    const item = invoice.value.items[index]
    const newItem = { ...item, id: uuidv4() }
    invoice.value.items.splice(index + 1, 0, newItem)
  }

  const reorderItems = (fromIndex: number, toIndex: number) => {
    const items = [...invoice.value.items]
    const [removed] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, removed)
    invoice.value.items = items
  }

  // Invoice management
  const saveCurrentInvoice = (): boolean => {
    if (!canDownload.value) return false

    const savedInvoice: SavedInvoice = {
      id: uuidv4(),
      invoice: JSON.parse(JSON.stringify(invoice.value)),
      savedAt: new Date().toISOString(),
      totalAmount: total.value,
      customerName: invoice.value.to.customerName || 'Unknown Customer',
    }

    invoiceHistory.value.unshift(savedInvoice)
    saveInvoiceHistory(invoiceHistory.value)
    return true
  }

  const loadInvoice = (savedInvoice: SavedInvoice) => {
    invoice.value = JSON.parse(JSON.stringify(savedInvoice.invoice))
  }

  const deleteInvoiceFromHistory = (id: string) => {
    invoiceHistory.value = invoiceHistory.value.filter((inv) => inv.id !== id)
    saveInvoiceHistory(invoiceHistory.value)
  }

  const duplicateInvoice = (savedInvoice: SavedInvoice) => {
    const duplicated = JSON.parse(JSON.stringify(savedInvoice.invoice))
    duplicated.number = `${duplicated.number}-COPY`
    duplicated.date = new Date().toISOString().split('T')[0]
    duplicated.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    invoice.value = duplicated
  }

  const clearInvoice = () => {
    invoice.value = getDefaultInvoice(loadDefaultLogo())
    resetChaosMode()
  }

  // Apply chaos mode to current invoice
  const applyChaosMode = () => {
    const chaoticInvoice = generateChaoticInvoice()
    // Preserve logo if exists
    const currentLogo = invoice.value.logo
    invoice.value = chaoticInvoice
    if (currentLogo) {
      invoice.value.logo = currentLogo
    }
  }

  // Customer management
  const saveCurrentCustomer = (): boolean => {
    const customerData = invoice.value.to
    if (!customerData.customerName.trim()) return false

    const existingCustomer = customers.value.find(
      (c) =>
        c.customerName.toLowerCase() === customerData.customerName.toLowerCase() ||
        (c.email && customerData.email && c.email.toLowerCase() === customerData.email.toLowerCase())
    )

    if (existingCustomer) {
      existingCustomer.customerName = customerData.customerName
      existingCustomer.taxId = customerData.taxId
      existingCustomer.address = customerData.address
      existingCustomer.email = customerData.email
      existingCustomer.phone = customerData.phone
      existingCustomer.lastUsed = new Date().toISOString()
    } else {
      const newCustomer: Customer = {
        id: uuidv4(),
        customerName: customerData.customerName,
        taxId: customerData.taxId,
        address: customerData.address,
        email: customerData.email,
        phone: customerData.phone,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      }
      customers.value.unshift(newCustomer)
    }

    saveCustomersToStorage(customers.value)
    return true
  }

  const selectCustomer = (customer: Customer) => {
    invoice.value.to = {
      customerName: customer.customerName,
      taxId: customer.taxId,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
    }
    customer.lastUsed = new Date().toISOString()
    saveCustomersToStorage(customers.value)
  }

  const deleteCustomer = (id: string) => {
    customers.value = customers.value.filter((c) => c.id !== id)
    saveCustomersToStorage(customers.value)
  }

  const filteredCustomers = (searchQuery: string) => {
    const searchTerm = searchQuery.trim().toLowerCase()
    const sorted = [...customers.value].sort(
      (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    )

    if (!searchTerm) return sorted

    return sorted.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.taxId.toLowerCase().includes(searchTerm)
    )
  }

  // Logo management
  const setLogo = (logo: string | null) => {
    invoice.value.logo = logo
    saveDefaultLogo(logo)
  }

  const removeLogo = () => {
    invoice.value.logo = null
    saveDefaultLogo(null)
  }

  // Language management
  const setLanguage = (lang: string) => {
    language.value = lang
    saveLanguage(lang)
  }

  // Onboarding
  const completeOnboarding = () => {
    hasCompletedOnboarding.value = true
    saveOnboardingStatus(true)
  }

  const resetOnboarding = () => {
    hasCompletedOnboarding.value = false
    saveOnboardingStatus(false)
  }

  // Auto-save watcher
  watch(
    invoice,
    (newInvoice) => {
      if (isInitialized.value) {
        saveToStorage(newInvoice)
      }
    },
    { deep: true }
  )

  // Date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // Set due date based on invoice date
  const setDueDateFromInvoiceDate = (days: number = 30) => {
    if (invoice.value.date) {
      const invoiceDate = new Date(invoice.value.date)
      invoiceDate.setDate(invoiceDate.getDate() + days)
      invoice.value.dueDate = invoiceDate.toISOString().split('T')[0]
    }
  }

  return {
    // State
    invoice,
    invoiceHistory,
    customers,
    currency,
    language,
    hasCompletedOnboarding,
    isInitialized,

    // Computed
    subtotal,
    totalTax,
    total,
    canDownload,
    validationErrors,
    hasValidationErrors,

    // Methods
    initialize,
    itemTotal,
    addItem,
    removeItem,
    duplicateItem,
    reorderItems,
    saveCurrentInvoice,
    loadInvoice,
    deleteInvoiceFromHistory,
    duplicateInvoice,
    clearInvoice,
    saveCurrentCustomer,
    selectCustomer,
    deleteCustomer,
    filteredCustomers,
    setLogo,
    removeLogo,
    setLanguage,
    completeOnboarding,
    resetOnboarding,
    formatDate,
    setDueDateFromInvoiceDate,
    loadDefaultLogo,

    // Chaos Mode
    chaosEnabled,
    chaosOverrides,
    applyChaosMode,
    resetChaosMode,

    // Constants
    PDF_THEME,
  }
}
