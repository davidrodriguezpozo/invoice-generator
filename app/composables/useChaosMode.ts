import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Invoice, InvoiceItem } from './useInvoice'

export type ChaosIntensity = 'mild' | 'medium' | 'extreme'

export interface ChaosConfig {
  intensity: ChaosIntensity
  enableTaxChaos: boolean
  enableNegativeAmounts: boolean
  enableTotalMismatch: boolean
  enableEmojiInjection: boolean
  enableDateChaos: boolean
  enableInvalidEmails: boolean
  enableCrazyInvoiceNumbers: boolean
  enableBadScanEffect: boolean
}

// Singleton state
const chaosEnabled = ref(false)
const chaosConfig = ref<ChaosConfig>({
  intensity: 'medium',
  enableTaxChaos: true,
  enableNegativeAmounts: true,
  enableTotalMismatch: true,
  enableEmojiInjection: true,
  enableDateChaos: true,
  enableInvalidEmails: true,
  enableCrazyInvoiceNumbers: true,
  enableBadScanEffect: true,
})

// Override values for totals (to make them not match)
const chaosOverrides = ref<{
  subtotal?: number
  totalTax?: number
  total?: number
} | null>(null)

// Store original invoice before chaos is applied (for reset)
const originalInvoice = ref<Invoice | null>(null)

// Emoji pools
const EMOJIS = {
  business: ['🏢', '🏭', '🏦', '🏪', '🏬', '💼', '📊'],
  money: ['💰', '💵', '💸', '🤑', '💲', '🪙'],
  random: ['🔥', '💀', '🎉', '🚀', '⚡', '🌈', '🦄', '👻', '🤖', '🎭'],
  warning: ['⚠️', '🚨', '❌', '💥', '🆘', '☠️'],
}

// Clean chaotic data (no emojis)
const CLEAN_BUSINESS_NAMES = [
  'Totally Legit Corp',
  'Acme Inc.',
  '404 Business Not Found LLC',
  'Trust Me Bro Enterprises',
  '<script>alert("hacked")</script> Ltd',
  'NULL',
  'undefined',
  "DROP TABLE invoices;--",
  'Very Real Company GmbH',
  'NaN Industries',
  'Whitespace Corp',
]

const CLEAN_CUSTOMER_NAMES = [
  'John "The Invoice" Doe',
  'Jane <marquee>Smith</marquee>',
  'Customer #undefined',
  'NaN McNotANumber',
  '   (leading spaces)',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  "Robert'); DROP TABLE customers;--",
  'Ghost Customer',
  '0xDEADBEEF',
]

const CLEAN_DESCRIPTIONS = [
  'Professional consulting services',
  'Widget (definitely not defective)',
  '1x Mystery Box',
  'Services rendered (trust us)',
  'Thing that does stuff',
  'Premium nothing',
  '<img src=x onerror=alert(1)>',
  'Quantum uncertainty service',
  'NEGATIVE REVENUE ADJUSTMENT',
  'HOT DEAL - DISCOUNT ITEM',
  'Invisible product (you cant see it)',
  'Refund for previous mistake',
  'Air (compressed)',
  'Unlimited consulting hours',
]

const CLEAN_ADDRESSES = [
  '123 Fake Street\nNowhere, XX 00000',
  '0x7F000001\nLocalhost, LO 127',
  '/dev/null\nVoid, -- -----',
  '42 Answer Lane\nUniverse, GA 42424',
  '1 Infinite Loop\nCupertino, CA 95014',
  '666 Hell Avenue\nHades, HE 66666',
  'P.O. Box 999999\nInfinity, IN 99999',
]

const CLEAN_PHONES = [
  '555-FAKE-NUM',
  '000-000-0000',
  '1234567890123456789',
  'call me maybe',
  'NaN-NaN-NaN',
  '555-000-0000',
]

const CLEAN_TAX_IDS = [
  'XX-XXXXXXX',
  '00-0000000',
  'FAKE-1234567',
  'NULL',
  'undefined',
  'NaN',
  '12-3456789012345678901234567890',
]

const CLEAN_INVOICE_NUMBERS = [
  'FAKE-0001',
  '-999',
  'INV#$%^&*()',
  "INV'; DROP TABLE invoices;--",
  'INV-' + 'A'.repeat(50),
  'INV-NaN',
  'INV--1',
  '0',
  'INV-1e999',
]

// Emoji-enhanced chaotic data
const EMOJI_BUSINESS_NAMES = [
  'Totally Legit Corp 🏢',
  'Acme 💥 Inc.',
  "DROP TABLE invoices;-- 💀",
  'Very Real Company GmbH 🦄',
  '🚀 Rocket Money LLC 🚀',
  'NaN Industries 🤖',
]

const EMOJI_CUSTOMER_NAMES = [
  'John "The Invoice" Doe 💼',
  '🤑 Money Bags McGee 💰',
  '👻 Ghost Customer 👻',
  'Jane Smith 🎭',
]

const EMOJI_DESCRIPTIONS = [
  'Professional consulting services 💼',
  'Widget (definitely not defective) 🔧',
  '1x Mystery Box 📦🎁',
  'Services rendered (trust us) 🤝',
  'Premium nothing™ 🦄',
  'Quantum uncertainty service ⚛️',
  'NEGATIVE REVENUE ADJUSTMENT 📉',
  '🔥 HOT DEAL 🔥 - DISCOUNT ITEM',
  '💀 Skull service 💀',
  'Air (compressed) 💨',
]

const EMOJI_ADDRESSES = [
  '123 Fake Street 🏠\nNowhere, XX 00000',
  '42 Answer Lane 🌌\nUniverse, GA 42424',
  '1 Infinite Loop 🔄\nCupertino, CA 95014',
  '💀 666 Hell Avenue 🔥\nHades, HE 66666',
  '🚀 Mars Colony Alpha\nOlympus Mons, MA 00001',
]

const EMOJI_PHONES = [
  '+1 (💀) 666-6666',
  '📞 ring ring 📞',
  '☎️ 555-EMOJI',
]

const EMOJI_TAX_IDS = [
  '💰-MONEY-💰',
  '🧾-TAX-ID-🧾',
]

const EMOJI_INVOICE_NUMBERS = [
  'INV-💀-666',
  'INV-∞',
  '🧾📄🧾-001',
  '🔥HOT-INVOICE🔥',
]

// Helper functions
const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomEmoji = (): string => {
  const allEmojis = [...EMOJIS.business, ...EMOJIS.money, ...EMOJIS.random, ...EMOJIS.warning]
  return randomFromArray(allEmojis)
}

const coinFlip = (probability: number = 0.5): boolean => Math.random() < probability

const getIntensityMultiplier = (intensity: ChaosIntensity): number => {
  switch (intensity) {
    case 'mild':
      return 0.3
    case 'medium':
      return 0.6
    case 'extreme':
      return 0.9
  }
}

export function useChaosMode() {
  const generateChaoticTax = (): number => {
    const { intensity, enableTaxChaos } = chaosConfig.value
    if (!enableTaxChaos) return Math.random() * 25

    const multiplier = getIntensityMultiplier(intensity)
    const options = [
      () => -Math.random() * 200 * multiplier, // Negative tax
      () => 100 + Math.random() * 900 * multiplier, // Over 100%
      () => Math.PI * 100, // 314.159...%
      () => 0.000001, // Tiny tax
      () => 999.999, // Almost 1000%
      () => -999, // Very negative
      () => 69.420, // Meme number
      () => NaN, // Not a number (will display as NaN)
      () => Infinity, // Infinite tax
      () => 17.777777777777, // Repeating decimal
    ]

    return coinFlip(multiplier) ? randomFromArray(options)() : Math.random() * 25
  }

  const generateChaoticAmount = (): { quantity: number; price: number } => {
    const { intensity, enableNegativeAmounts } = chaosConfig.value
    if (!enableNegativeAmounts) {
      return { quantity: Math.floor(Math.random() * 10) + 1, price: Math.random() * 1000 }
    }

    const multiplier = getIntensityMultiplier(intensity)
    const quantityOptions = [
      () => -Math.floor(Math.random() * 100), // Negative quantity
      () => 0, // Zero quantity
      () => 999999999, // Huge quantity
      () => 0.5, // Half item
      () => Math.PI, // Pi items
      () => -1, // Minus one
      () => 0.0001, // Tiny fraction
    ]

    const priceOptions = [
      () => -Math.random() * 1000, // Negative price
      () => 0, // Free
      () => 999999999.99, // Very expensive
      () => 0.01, // One cent
      () => 0.001, // Less than a cent
      () => -0.01, // Negative cent
      () => Math.E * 100, // Euler's number
      () => 1e-10, // Scientific notation tiny
    ]

    return {
      quantity: coinFlip(multiplier) ? randomFromArray(quantityOptions)() : Math.floor(Math.random() * 10) + 1,
      price: coinFlip(multiplier) ? randomFromArray(priceOptions)() : Math.random() * 500,
    }
  }

  const generateChaoticDates = (): { date: string; dueDate: string } => {
    const { intensity, enableDateChaos } = chaosConfig.value
    if (!enableDateChaos) {
      const today = new Date()
      const dueDate = new Date(today)
      dueDate.setDate(dueDate.getDate() + 30)
      return {
        date: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
      }
    }

    const multiplier = getIntensityMultiplier(intensity)
    const dateOptions = [
      // Due date before invoice date
      () => {
        const invoice = new Date('2025-06-15')
        const due = new Date('2024-01-01')
        return { date: invoice.toISOString().split('T')[0], dueDate: due.toISOString().split('T')[0] }
      },
      // Far future
      () => ({ date: '2099-12-31', dueDate: '2100-01-01' }),
      // Far past
      () => ({ date: '1900-01-01', dueDate: '1899-12-31' }),
      // Same date
      () => ({ date: '2025-01-01', dueDate: '2025-01-01' }),
      // Leap year edge case
      () => ({ date: '2024-02-29', dueDate: '2023-02-28' }),
      // Year 1
      () => ({ date: '0001-01-01', dueDate: '0001-01-02' }),
    ]

    if (coinFlip(multiplier)) {
      return randomFromArray(dateOptions)()
    }

    const today = new Date()
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + 30)
    return {
      date: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
    }
  }

  const generateChaoticEmail = (): string => {
    const { intensity, enableInvalidEmails } = chaosConfig.value
    if (!enableInvalidEmails) return 'valid@email.com'

    const multiplier = getIntensityMultiplier(intensity)
    const options = [
      'notanemail',
      'missing@',
      '@nodomain.com',
      'double@@at.com',
      'john<script>@evil.com',
      '💀@skull.emoji',
      'spaces in email@test.com',
      'quote"in"middle@test.com',
      'a'.repeat(100) + '@toolong.com',
      'null@undefined.nan',
      '"><script>alert(1)</script>@xss.com',
      'email\n@newline.com',
    ]

    return coinFlip(multiplier) ? randomFromArray(options) : 'chaos@test.com'
  }

  const injectEmojis = (text: string): string => {
    const { intensity, enableEmojiInjection } = chaosConfig.value
    if (!enableEmojiInjection) return text

    const multiplier = getIntensityMultiplier(intensity)
    const emojiCount = Math.floor(multiplier * 5) + 1

    let result = text
    for (let i = 0; i < emojiCount; i++) {
      const position = Math.floor(Math.random() * (result.length + 1))
      result = result.slice(0, position) + randomEmoji() + result.slice(position)
    }

    return result
  }

  const generateChaoticItems = (count: number = 5): InvoiceItem[] => {
    const { enableEmojiInjection } = chaosConfig.value
    const descriptions = enableEmojiInjection
      ? [...CLEAN_DESCRIPTIONS, ...EMOJI_DESCRIPTIONS]
      : CLEAN_DESCRIPTIONS

    const items: InvoiceItem[] = []
    const actualCount = Math.max(1, count + Math.floor((Math.random() - 0.5) * 4))

    for (let i = 0; i < actualCount; i++) {
      const { quantity, price } = generateChaoticAmount()
      items.push({
        id: uuidv4(),
        description: randomFromArray(descriptions),
        quantity,
        price,
        tax: generateChaoticTax(),
      })
    }

    return items
  }

  const generateMismatchedTotals = (items: InvoiceItem[]) => {
    const { enableTotalMismatch, intensity } = chaosConfig.value
    if (!enableTotalMismatch) {
      chaosOverrides.value = null
      return
    }

    const multiplier = getIntensityMultiplier(intensity)
    if (!coinFlip(multiplier)) {
      chaosOverrides.value = null
      return
    }

    // Calculate what the totals "should" be
    const actualSubtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const actualTax = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price
      return sum + (itemSubtotal * item.tax) / 100
    }, 0)

    // Generate wrong values
    const wrongSubtotal = actualSubtotal * (0.5 + Math.random())
    const wrongTax = actualTax * (0.3 + Math.random() * 2)
    const wrongTotal = wrongSubtotal + wrongTax + (Math.random() - 0.5) * 1000

    chaosOverrides.value = {
      subtotal: wrongSubtotal,
      totalTax: wrongTax,
      total: wrongTotal,
    }
  }

  // Apply chaos to an existing invoice (modifies only enabled chaos features)
  const applyChaosToInvoice = (invoice: Invoice): Invoice => {
    const {
      enableEmojiInjection,
      enableCrazyInvoiceNumbers,
      enableDateChaos,
      enableInvalidEmails,
      enableTaxChaos,
      enableNegativeAmounts,
      enableTotalMismatch,
    } = chaosConfig.value

    // Store original invoice before first chaos application (for reset)
    if (!chaosEnabled.value) {
      originalInvoice.value = JSON.parse(JSON.stringify(invoice))
    }

    // Deep clone the invoice to avoid mutating the original
    const chaosInvoice: Invoice = JSON.parse(JSON.stringify(invoice))

    // Apply date chaos
    if (enableDateChaos) {
      const dates = generateChaoticDates()
      chaosInvoice.date = dates.date
      chaosInvoice.dueDate = dates.dueDate
    }

    // Apply crazy invoice numbers
    if (enableCrazyInvoiceNumbers) {
      const invoiceNumbers = enableEmojiInjection
        ? [...CLEAN_INVOICE_NUMBERS, ...EMOJI_INVOICE_NUMBERS]
        : CLEAN_INVOICE_NUMBERS
      chaosInvoice.number = randomFromArray(invoiceNumbers)
    }

    // Apply invalid emails
    if (enableInvalidEmails) {
      chaosInvoice.from.email = generateChaoticEmail()
      chaosInvoice.to.email = generateChaoticEmail()
    }

    // Apply emoji injection to text fields
    if (enableEmojiInjection) {
      if (chaosInvoice.from.businessName) {
        chaosInvoice.from.businessName = injectEmojis(chaosInvoice.from.businessName)
      }
      if (chaosInvoice.to.customerName) {
        chaosInvoice.to.customerName = injectEmojis(chaosInvoice.to.customerName)
      }
      if (chaosInvoice.notes) {
        chaosInvoice.notes = injectEmojis(chaosInvoice.notes)
      }
      if (chaosInvoice.terms) {
        chaosInvoice.terms = injectEmojis(chaosInvoice.terms)
      }
      // Inject emojis into item descriptions
      chaosInvoice.items.forEach(item => {
        if (item.description) {
          item.description = injectEmojis(item.description)
        }
      })
    }

    // Apply tax chaos to existing items
    if (enableTaxChaos) {
      chaosInvoice.items.forEach(item => {
        item.tax = generateChaoticTax()
      })
    }

    // Apply negative amounts to existing items
    if (enableNegativeAmounts) {
      chaosInvoice.items.forEach(item => {
        const { quantity, price } = generateChaoticAmount()
        item.quantity = quantity
        item.price = price
      })
    }

    // Generate mismatched totals based on items
    if (enableTotalMismatch) {
      generateMismatchedTotals(chaosInvoice.items)
    } else {
      chaosOverrides.value = null
    }

    chaosEnabled.value = true
    return chaosInvoice
  }

  // Generate a completely new chaotic invoice (legacy behavior)
  const generateChaoticInvoice = (): Invoice => {
    const {
      enableEmojiInjection,
      enableCrazyInvoiceNumbers,
    } = chaosConfig.value

    // Select data arrays based on emoji setting
    const businessNames = enableEmojiInjection
      ? [...CLEAN_BUSINESS_NAMES, ...EMOJI_BUSINESS_NAMES]
      : CLEAN_BUSINESS_NAMES
    const customerNames = enableEmojiInjection
      ? [...CLEAN_CUSTOMER_NAMES, ...EMOJI_CUSTOMER_NAMES]
      : CLEAN_CUSTOMER_NAMES
    const addresses = enableEmojiInjection
      ? [...CLEAN_ADDRESSES, ...EMOJI_ADDRESSES]
      : CLEAN_ADDRESSES
    const phones = enableEmojiInjection
      ? [...CLEAN_PHONES, ...EMOJI_PHONES]
      : CLEAN_PHONES
    const taxIds = enableEmojiInjection
      ? [...CLEAN_TAX_IDS, ...EMOJI_TAX_IDS]
      : CLEAN_TAX_IDS
    const invoiceNumbers = enableEmojiInjection
      ? [...CLEAN_INVOICE_NUMBERS, ...EMOJI_INVOICE_NUMBERS]
      : CLEAN_INVOICE_NUMBERS

    const dates = generateChaoticDates()
    const items = generateChaoticItems()

    // Generate mismatched totals based on items
    generateMismatchedTotals(items)

    const invoice: Invoice = {
      number: enableCrazyInvoiceNumbers
        ? randomFromArray(invoiceNumbers)
        : `INV-${Math.floor(Math.random() * 10000)}`,
      date: dates.date,
      dueDate: dates.dueDate,
      documentType: 'invoice',
      paymentMethod: '',
      logo: null,
      from: {
        businessName: randomFromArray(businessNames),
        taxId: randomFromArray(taxIds),
        address: randomFromArray(addresses),
        email: generateChaoticEmail(),
        phone: randomFromArray(phones),
      },
      to: {
        customerName: randomFromArray(customerNames),
        taxId: randomFromArray(taxIds),
        address: randomFromArray(addresses),
        email: generateChaoticEmail(),
        phone: randomFromArray(phones),
      },
      items,
      notes: injectEmojis('Payment is due upon receipt. Thank you for your business!'),
      terms: injectEmojis('Net 30. Late fees may apply. Or not. Who knows? Not financial advice.'),
    }

    chaosEnabled.value = true
    return invoice
  }

  const resetChaosMode = (): Invoice | null => {
    chaosEnabled.value = false
    chaosOverrides.value = null
    const original = originalInvoice.value
    originalInvoice.value = null
    return original
  }

  const setIntensity = (intensity: ChaosIntensity) => {
    chaosConfig.value.intensity = intensity
  }

  const toggleFeature = (feature: keyof Omit<ChaosConfig, 'intensity'>, value: boolean) => {
    chaosConfig.value[feature] = value
  }

  return {
    // State
    chaosEnabled,
    chaosConfig,
    chaosOverrides,

    // Methods
    applyChaosToInvoice,
    generateChaoticInvoice,
    resetChaosMode,
    setIntensity,
    toggleFeature,

    // Individual generators (for testing/customization)
    generateChaoticTax,
    generateChaoticAmount,
    generateChaoticDates,
    generateChaoticEmail,
    injectEmojis,
    generateChaoticItems,
  }
}
