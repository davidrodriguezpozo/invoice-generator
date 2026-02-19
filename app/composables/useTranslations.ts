import { computed } from 'vue'
import { useInvoice } from './useInvoice'

const translations = {
  EN: {
    // Header
    invoiceGenerator: 'Invoice Generator',
    createProfessionalInvoices: 'Create professional invoices',
    customers: 'Customers',
    history: 'History',
    save: 'Save',
    export: 'Export',

    // Document types
    invoice: 'Invoice',
    receipt: 'Receipt',
    deliveryNote: 'Delivery Note',
    ticket: 'Ticket',
    documentType: 'Document Type',

    // Main form
    invoiceDetails: 'Invoice Details',
    invoiceNumber: 'Invoice Number',
    date: 'Date',
    dueDate: 'Due Date',
    logoUpload: 'Logo Upload',
    uploadLogo: 'Upload Logo',
    logo: 'Logo',
    dragDropLogo: 'Drag & drop your logo here or click to upload',
    recommendedSize: 'Recommended: 200x200px, PNG or JPG',
    changeLogo: 'Change',
    removeLogo: 'Remove',

    // Payment methods
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    creditCard: 'Credit Card',
    bankTransfer: 'Bank Transfer',
    check: 'Check',

    // From/To sections
    from: 'From',
    to: 'To',
    businessName: 'Business Name',
    customerName: 'Customer Name',
    taxId: 'Tax ID',
    address: 'Address',
    email: 'Email',
    phone: 'Phone',

    // Items section
    items: 'Items',
    addItem: 'Add Item',
    description: 'Description',
    quantity: 'Qty',
    price: 'Price',
    taxPercent: 'Tax %',
    total: 'Total',
    remove: 'Remove',
    noItemsYet: 'No items yet',
    addFirstItem: 'Add your first invoice item to get started',
    addItemPrompt: 'Click the "Add Item" button above to add line items',
    duplicateItem: 'Duplicate',

    // Totals
    subtotal: 'Subtotal',
    tax: 'Tax',
    totalAmount: 'Total',

    // Export
    exportOptions: 'Export Options',
    downloadPDF: 'Download PDF',
    downloadExcel: 'Download Excel',
    downloadCSV: 'Download CSV',
    downloadJSON: 'Download JSON',
    exportAs: 'Export as',
    pdfDescription: 'Professional invoice document',
    excelDescription: 'Spreadsheet format for accounting',
    csvDescription: 'Simple data format for import',
    jsonDescription: 'Structured data for developers',

    // Preview
    invoicePreview: 'Invoice Preview',
    generatingPreview: 'Generating preview...',
    noPreview: 'No preview available',
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',

    // Table headers
    tableDescription: 'DESCRIPTION',
    tableQty: 'QTY',
    tablePrice: 'PRICE',
    tableTax: 'TAX',
    tableTotal: 'TOTAL',

    // History
    invoiceHistory: 'Invoice History',
    recentInvoices: 'Recent Invoices',
    savedInvoices: 'saved invoices',
    noInvoicesSaved: 'No invoices saved yet',
    saveFirstInvoice: 'Save your first invoice to see it here',
    loadInvoice: 'Load',
    deleteInvoice: 'Delete',
    duplicate: 'Duplicate',
    searchInvoices: 'Search invoices...',

    // Customer management
    customerDatabase: 'Customer Database',
    addCustomer: 'Add Customer',
    searchCustomers: 'Search or enter customer name...',
    noCustomersFound: 'No customers found',
    addFirstCustomer: 'Add your first customer to see them here',
    useCustomer: 'Use Customer',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    saveAsCustomer: 'Save as new customer',

    // Buttons and actions
    close: 'Close',
    cancel: 'Cancel',
    clear: 'Clear',
    clearInvoice: 'Clear All',
    confirm: 'Confirm',
    today: 'Today',
    in30Days: 'In 30 days',

    // Validation
    required: 'Required',
    invoiceNumberRequired: 'Invoice number is required',
    businessNameRequired: 'Business name is required',
    customerNameRequired: 'Customer name is required',
    fillRequiredFields: 'Please fill in all required fields before saving',

    // Alerts and confirmations
    confirmClearInvoice: 'Are you sure you want to clear all data? This cannot be undone.',
    confirmDeleteInvoice: 'Are you sure you want to delete this invoice?',
    confirmDeleteCustomer: 'Are you sure you want to delete this customer?',
    invoiceSaved: 'Invoice saved successfully!',
    invoiceLoaded: 'Invoice loaded',
    invoiceDuplicated: 'Invoice duplicated',
    invoiceDeleted: 'Invoice deleted',
    customerSaved: 'Customer saved',
    customerDeleted: 'Customer deleted',
    exportSuccess: 'Export completed',
    exportError: 'Export failed',

    // Placeholders
    enterInvoiceNumber: 'e.g., INV-001',
    enterBusinessName: 'Your company name',
    enterCustomerName: 'Customer or company name',
    enterAddress: 'Street, City, ZIP',
    enterEmail: 'email@example.com',
    enterPhone: '+1 (555) 123-4567',
    enterTaxId: 'Tax identification number',
    itemDescription: 'Description of item or service',

    // Onboarding
    welcome: 'Welcome to Invoice Generator!',
    onboardingStep1Title: 'Fill in your details',
    onboardingStep1Desc: 'Enter your business information in the "From" section',
    onboardingStep2Title: 'Add customer info',
    onboardingStep2Desc: 'Add your customer details in the "To" section',
    onboardingStep3Title: 'Add line items',
    onboardingStep3Desc: 'Click "Add Item" to add products or services',
    onboardingStep4Title: 'Export your invoice',
    onboardingStep4Desc: 'Download as PDF, Excel, CSV, or JSON',
    getStarted: 'Get Started',
    skipTour: 'Skip Tour',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',

    // Accessibility
    openHistory: 'Open invoice history',
    closeHistory: 'Close invoice history',
    openExport: 'Open export options',
    closeExport: 'Close export options',
    dragToReorder: 'Drag to reorder',
    removeItem: 'Remove item',

    // Mobile
    form: 'Form',
    preview: 'Preview',
  },
  ES: {
    // Header
    invoiceGenerator: 'Generador de Facturas',
    createProfessionalInvoices: 'Crea facturas profesionales',
    customers: 'Clientes',
    history: 'Historial',
    save: 'Guardar',
    export: 'Exportar',

    // Document types
    invoice: 'Factura',
    receipt: 'Recibo',
    deliveryNote: 'Albaran',
    ticket: 'Ticket',
    documentType: 'Tipo de Documento',

    // Main form
    invoiceDetails: 'Detalles de Factura',
    invoiceNumber: 'Numero de Factura',
    date: 'Fecha',
    dueDate: 'Fecha de Vencimiento',
    logoUpload: 'Subir Logo',
    uploadLogo: 'Subir Logo',
    logo: 'Logo',
    dragDropLogo: 'Arrastra tu logo aqui o haz clic para subir',
    recommendedSize: 'Recomendado: 200x200px, PNG o JPG',
    changeLogo: 'Cambiar',
    removeLogo: 'Eliminar',

    // Payment methods
    paymentMethod: 'Metodo de Pago',
    cash: 'Efectivo',
    creditCard: 'Tarjeta de Credito',
    bankTransfer: 'Transferencia Bancaria',
    check: 'Cheque',

    // From/To sections
    from: 'De',
    to: 'Para',
    businessName: 'Nombre del Negocio',
    customerName: 'Nombre del Cliente',
    taxId: 'ID Fiscal',
    address: 'Direccion',
    email: 'Correo',
    phone: 'Telefono',

    // Items section
    items: 'Articulos',
    addItem: 'Agregar',
    description: 'Descripcion',
    quantity: 'Cant',
    price: 'Precio',
    taxPercent: 'IVA %',
    total: 'Total',
    remove: 'Eliminar',
    noItemsYet: 'Sin articulos',
    addFirstItem: 'Agrega tu primer articulo para comenzar',
    addItemPrompt: 'Haz clic en "Agregar" para anadir articulos',
    duplicateItem: 'Duplicar',

    // Totals
    subtotal: 'Subtotal',
    tax: 'IVA',
    totalAmount: 'Total',

    // Export
    exportOptions: 'Opciones de Exportacion',
    downloadPDF: 'Descargar PDF',
    downloadExcel: 'Descargar Excel',
    downloadCSV: 'Descargar CSV',
    downloadJSON: 'Descargar JSON',
    exportAs: 'Exportar como',
    pdfDescription: 'Documento de factura profesional',
    excelDescription: 'Formato de hoja de calculo',
    csvDescription: 'Formato simple de datos',
    jsonDescription: 'Datos estructurados',

    // Preview
    invoicePreview: 'Vista Previa',
    generatingPreview: 'Generando vista previa...',
    noPreview: 'Sin vista previa',
    showPreview: 'Mostrar Vista Previa',
    hidePreview: 'Ocultar Vista Previa',

    // Table headers
    tableDescription: 'DESCRIPCION',
    tableQty: 'CANT',
    tablePrice: 'PRECIO',
    tableTax: 'IVA',
    tableTotal: 'TOTAL',

    // History
    invoiceHistory: 'Historial de Facturas',
    recentInvoices: 'Facturas Recientes',
    savedInvoices: 'facturas guardadas',
    noInvoicesSaved: 'No hay facturas guardadas',
    saveFirstInvoice: 'Guarda tu primera factura para verla aqui',
    loadInvoice: 'Cargar',
    deleteInvoice: 'Eliminar',
    duplicate: 'Duplicar',
    searchInvoices: 'Buscar facturas...',

    // Customer management
    customerDatabase: 'Base de Clientes',
    addCustomer: 'Agregar Cliente',
    searchCustomers: 'Buscar o ingresar nombre del cliente...',
    noCustomersFound: 'No se encontraron clientes',
    addFirstCustomer: 'Agrega tu primer cliente para verlos aqui',
    useCustomer: 'Usar Cliente',
    editCustomer: 'Editar Cliente',
    deleteCustomer: 'Eliminar Cliente',
    saveAsCustomer: 'Guardar como nuevo cliente',

    // Buttons and actions
    close: 'Cerrar',
    cancel: 'Cancelar',
    clear: 'Limpiar',
    clearInvoice: 'Limpiar Todo',
    confirm: 'Confirmar',
    today: 'Hoy',
    in30Days: 'En 30 dias',

    // Validation
    required: 'Requerido',
    invoiceNumberRequired: 'El numero de factura es requerido',
    businessNameRequired: 'El nombre del negocio es requerido',
    customerNameRequired: 'El nombre del cliente es requerido',
    fillRequiredFields: 'Por favor complete todos los campos requeridos',

    // Alerts and confirmations
    confirmClearInvoice: 'Esta seguro que desea borrar todos los datos? No se puede deshacer.',
    confirmDeleteInvoice: 'Esta seguro que desea eliminar esta factura?',
    confirmDeleteCustomer: 'Esta seguro que desea eliminar este cliente?',
    invoiceSaved: 'Factura guardada exitosamente!',
    invoiceLoaded: 'Factura cargada',
    invoiceDuplicated: 'Factura duplicada',
    invoiceDeleted: 'Factura eliminada',
    customerSaved: 'Cliente guardado',
    customerDeleted: 'Cliente eliminado',
    exportSuccess: 'Exportacion completada',
    exportError: 'Error en la exportacion',

    // Placeholders
    enterInvoiceNumber: 'ej., FAC-001',
    enterBusinessName: 'Nombre de tu empresa',
    enterCustomerName: 'Cliente o empresa',
    enterAddress: 'Calle, Ciudad, CP',
    enterEmail: 'correo@ejemplo.com',
    enterPhone: '+34 612 345 678',
    enterTaxId: 'Numero de identificacion fiscal',
    itemDescription: 'Descripcion del articulo o servicio',

    // Onboarding
    welcome: 'Bienvenido al Generador de Facturas!',
    onboardingStep1Title: 'Ingresa tus datos',
    onboardingStep1Desc: 'Ingresa la informacion de tu negocio en la seccion "De"',
    onboardingStep2Title: 'Agrega datos del cliente',
    onboardingStep2Desc: 'Agrega los datos de tu cliente en la seccion "Para"',
    onboardingStep3Title: 'Agrega articulos',
    onboardingStep3Desc: 'Haz clic en "Agregar" para anadir productos o servicios',
    onboardingStep4Title: 'Exporta tu factura',
    onboardingStep4Desc: 'Descarga como PDF, Excel, CSV o JSON',
    getStarted: 'Comenzar',
    skipTour: 'Saltar Tour',
    next: 'Siguiente',
    previous: 'Anterior',
    finish: 'Finalizar',

    // Accessibility
    openHistory: 'Abrir historial de facturas',
    closeHistory: 'Cerrar historial de facturas',
    openExport: 'Abrir opciones de exportacion',
    closeExport: 'Cerrar opciones de exportacion',
    dragToReorder: 'Arrastra para reordenar',
    removeItem: 'Eliminar articulo',

    // Mobile
    form: 'Formulario',
    preview: 'Vista Previa',
  },
  FR: {
    invoiceGenerator: 'Generateur de Factures',
    createProfessionalInvoices: 'Creez des factures professionnelles',
    // Add more French translations as needed...
    // For now, falling back to English for missing keys
  },
  DE: {
    invoiceGenerator: 'Rechnungsgenerator',
    createProfessionalInvoices: 'Erstellen Sie professionelle Rechnungen',
    // Add more German translations as needed...
  },
  PT: {
    invoiceGenerator: 'Gerador de Faturas',
    createProfessionalInvoices: 'Crie faturas profissionais',
    // Add more Portuguese translations as needed...
  },
} as const

type TranslationKey = keyof typeof translations.EN

export function useTranslations() {
  const { language } = useInvoice()

  const t = computed(() => (key: TranslationKey): string => {
    const lang = language.value as keyof typeof translations
    const langTranslations = translations[lang] || translations.EN
    return (langTranslations as Record<string, string>)[key] || (translations.EN as Record<string, string>)[key] || key
  })

  const availableLanguages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'ES', name: 'Espanol', flag: '🇪🇸' },
    { code: 'FR', name: 'Francais', flag: '🇫🇷' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'PT', name: 'Portugues', flag: '🇵🇹' },
  ]

  return {
    t,
    availableLanguages,
  }
}
