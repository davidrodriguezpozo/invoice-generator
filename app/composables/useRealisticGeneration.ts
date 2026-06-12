import { v4 as uuidv4 } from 'uuid'
import {
  DOCUMENT_TYPE_CONFIG,
  type DocumentType,
  type Invoice,
  type InvoiceItem,
} from './useInvoice'

const ALL_DOCUMENT_TYPES: DocumentType[] = ['invoice', 'receipt', 'delivery_note', 'ticket']

// faker is loaded lazily (dynamic import) so it stays out of the initial bundle.
// We import only the English locale to keep the chunk small (the full
// '@faker-js/faker' entry bundles every locale, ~2.6MB).
// `loadFaker()` must complete before `generateRealisticInvoice()` is called.
type FakerInstance = typeof import('@faker-js/faker/locale/en')['faker']
let fakerInstance: FakerInstance | null = null

const SENSIBLE_TAX_RATES = [0, 10, 21]
const PAYMENT_METHODS = ['cash', 'credit_card', 'bank_transfer', 'check']

export function useRealisticGeneration() {
  const loadFaker = async (): Promise<void> => {
    if (fakerInstance) return
    const mod = await import('@faker-js/faker/locale/en')
    fakerInstance = mod.faker
  }

  const randomFromArray = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)] as T
  }

  const formatDate = (date: Date): string => date.toISOString().split('T')[0]!

  const addDays = (date: Date, days: number): Date => {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
  }

  // Build a plausible VAT-like tax id: 2 uppercase letters + 9 digits.
  const generateTaxId = (faker: FakerInstance): string => {
    const country = faker.location.countryCode('alpha-2')
    const digits = faker.string.numeric(9)
    return `${country}${digits}`
  }

  const generateAddress = (faker: FakerInstance): string => {
    const street = faker.location.streetAddress()
    const city = faker.location.city()
    const zip = faker.location.zipCode()
    const country = faker.location.country()
    return `${street}\n${zip} ${city}\n${country}`
  }

  const generateItems = (faker: FakerInstance, hasTax: boolean): InvoiceItem[] => {
    const count = faker.number.int({ min: 1, max: 6 })
    const items: InvoiceItem[] = []
    for (let i = 0; i < count; i++) {
      items.push({
        id: uuidv4(),
        description: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 20 }),
        price: Number(faker.commerce.price({ min: 5, max: 2000, dec: 2 })),
        tax: hasTax ? randomFromArray(SENSIBLE_TAX_RATES) : 0,
      })
    }
    return items
  }

  // Generate a complete, sensible invoice of the given type (or a random type).
  // Does NOT touch chaos state.
  const generateRealisticInvoice = (documentType?: DocumentType): Invoice => {
    if (!fakerInstance) {
      throw new Error('useRealisticGeneration: call loadFaker() before generateRealisticInvoice()')
    }
    const faker = fakerInstance

    const docType: DocumentType = documentType ?? randomFromArray(ALL_DOCUMENT_TYPES)
    const docConfig = DOCUMENT_TYPE_CONFIG[docType]

    const issueDate = faker.date.recent({ days: 60 })
    const number = `${docConfig.prefix}${faker.number.int({ min: 1000, max: 9999 })}`

    return {
      number,
      date: formatDate(issueDate),
      dueDate: docConfig.hasDueDate ? formatDate(addDays(issueDate, 30)) : '',
      documentType: docType,
      paymentMethod: docConfig.hasPaymentMethod ? randomFromArray(PAYMENT_METHODS) : '',
      logo: null,
      from: {
        businessName: faker.company.name(),
        taxId: generateTaxId(faker),
        address: generateAddress(faker),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
      },
      to: {
        customerName: faker.person.fullName(),
        taxId: generateTaxId(faker),
        address: generateAddress(faker),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
      },
      items: generateItems(faker, docConfig.hasTax),
      notes: 'Thank you for your business. Please contact us with any questions.',
      terms: docConfig.hasTerms ? 'Payment due within 30 days of the invoice date.' : '',
    }
  }

  return {
    loadFaker,
    generateRealisticInvoice,
  }
}
