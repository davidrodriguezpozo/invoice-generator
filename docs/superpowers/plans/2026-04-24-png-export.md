# PNG Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a PNG export option that rasterizes page 1 of the invoice PDF and downloads it as `{invoice-number}.png`.

**Architecture:** Extract the inline jsPDF-building logic from `handleExport`'s `'pdf'` branch into a local `buildInvoicePdf()` helper. The existing PDF branch calls it and saves. A new `'png'` branch calls the same helper, renders page 1 to a canvas via `pdfjs-dist`, and triggers a PNG blob download.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, jsPDF (existing), `pdfjs-dist` (new).

This project has no automated test suite; verification is manual (dev server + visual check).

---

### Task 1: Install pdfjs-dist

**Files:**
- Modify: `package.json`, `bun.lockb`

- [ ] **Step 1: Install the dependency**

Run: `bun add pdfjs-dist`
Expected: `package.json` gains `"pdfjs-dist": "^<version>"` under `dependencies`; lockfile updates.

- [ ] **Step 2: Verify install**

Run: `bun pm ls pdfjs-dist`
Expected: shows an installed version.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "add pdfjs-dist dependency for PNG rasterization"
```

---

### Task 2: Extract jsPDF document builder

**Files:**
- Modify: `app/app.vue` (lines ~1952–2110, inside the `<script setup>`)

Goal: replace the inline body of the `format === 'pdf'` branch in `handleExport` with a call to a new local helper `buildInvoicePdf()` that returns the populated `jsPDF` instance. No behavior change.

- [ ] **Step 1: Add `buildInvoicePdf` helper above `handleExport`**

Insert this function directly above the `const handleExport = ...` declaration (around line 1951). The body is a copy of the current contents of `if (format === 'pdf') { ... }` from `app.vue:1961–2108`, minus the final `pdf.save(...)` line, plus a `return pdf`.

```ts
const buildInvoicePdf = async () => {
  const expDocConfig = DOCUMENT_TYPE_CONFIG[invoice.value.documentType]
  const expDocTitle = documentTypeTitle(invoice.value.documentType)

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

  if (chaosEnabled.value && chaosConfig.value.enableBadScanEffect) {
    applyBadScanEffect(pdf, pageWidth, pageHeight)
  }

  return pdf
}
```

- [ ] **Step 2: Replace the `format === 'pdf'` branch body with a call to the helper**

Find the `if (format === 'pdf') { ... }` block (currently `app.vue:1960–2110`). Replace its entire body with:

```ts
if (format === 'pdf') {
  const pdf = await buildInvoicePdf()
  pdf.save(`${invoice.value.number || 'invoice'}.pdf`)
}
```

- [ ] **Step 3: Manual check — PDF still works**

Run: `bun run dev`
Open the app, click Export → PDF. Expected: PDF downloads as before, no visual diff. Stop dev server after verifying.

- [ ] **Step 4: Commit**

```bash
git add app/app.vue
git commit -m "extract buildInvoicePdf helper in preparation for PNG export"
```

---

### Task 3: Add PNG branch to handleExport

**Files:**
- Modify: `app/app.vue`

- [ ] **Step 1: Widen the `handleExport` format type**

Find `const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {` (around line 1952) and change it to include `'png'`:

```ts
const handleExport = async (format: 'pdf' | 'png' | 'excel' | 'csv' | 'json') => {
```

- [ ] **Step 2: Add the `'png'` branch**

Add a new `else if (format === 'png')` branch directly after the `'pdf'` branch and before `else if (format === 'excel')`:

```ts
} else if (format === 'png') {
  const pdf = await buildInvoicePdf()
  const pdfBuffer = pdf.output('arraybuffer')

  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const doc = await pdfjs.getDocument({ data: pdfBuffer }).promise
  const page = await doc.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport, canvas }).promise

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob returned null')), 'image/png')
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${invoice.value.number || 'invoice'}.png`
  a.click()
  URL.revokeObjectURL(a.href)
}
```

Note: the `canvas` property on the render parameters is required in pdfjs-dist v5+; keep it alongside `canvasContext` for forward compatibility.

- [ ] **Step 3: Commit**

```bash
git add app/app.vue
git commit -m "add PNG export branch using pdfjs-dist rasterization"
```

---

### Task 4: Add PNG button to ExportModal

**Files:**
- Modify: `app/components/ExportModal.vue`

- [ ] **Step 1: Widen the emit and handler types**

Update the `defineEmits` block (line 145–148) and `handleExport` function (line 155–157) to include `'png'`:

```ts
const emit = defineEmits<{
  close: []
  export: [format: 'pdf' | 'png' | 'excel' | 'csv' | 'json']
}>()
```

```ts
const handleExport = (format: 'pdf' | 'png' | 'excel' | 'csv' | 'json') => {
  emit('export', format)
}
```

- [ ] **Step 2: Add the PNG button**

Insert the following button in the template directly after the closing `</button>` of the PDF block (around line 58) and before the Excel block's opening `<!-- Excel -->` comment:

```html
<!-- PNG -->
<button
  @click="handleExport('png')"
  :disabled="isExporting"
  class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
>
  <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
    <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
  <div class="flex-1 text-left">
    <span class="text-base font-medium text-gray-900 block">PNG (image)</span>
    <span class="text-sm text-gray-500">Rasterized image of page 1</span>
  </div>
  <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>
</button>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ExportModal.vue
git commit -m "add PNG option to ExportModal"
```

---

### Task 5: Manual verification

No automated tests exist in this repo. Verify in a browser.

- [ ] **Step 1: Start dev server**

Run: `bun run dev`
Expected: Nuxt dev server starts without errors.

- [ ] **Step 2: Golden path — export standard invoice as PNG**

In the browser: open a default invoice, click Export → PNG (image).
Expected: `invoice.png` (or `{number}.png`) downloads. Open it — should visually match the PDF preview (watermark, layout, logo if uploaded).

- [ ] **Step 3: Regression — PDF still works**

Click Export → PDF.
Expected: PDF downloads exactly as before.

- [ ] **Step 4: Edge case — long invoice (>1 page)**

Add enough line items to push content past a single page, then export PNG.
Expected: PNG contains page 1 only, no crash.

- [ ] **Step 5: Edge case — chaos mode**

Enable chaos mode with the bad scan effect, export PNG.
Expected: effect is present in the PNG.

- [ ] **Step 6: Stop dev server**

Kill the dev server.

No commit for this task — verification only.
