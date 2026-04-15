# Invoice Generator

A fast, browser-based document generator for invoices, receipts, delivery notes, and tickets. No backend, no accounts — everything runs locally and auto-saves to your browser.

**Live demo:** [davidrodriguezpozo.github.io/invoice-generator](https://davidrodriguezpozo.github.io/invoice-generator/)

---

## Features

**Document types**
- Invoice — with due date, tax, totals, and payment terms
- Receipt — with payment method selection
- Delivery Note — quantities only, Supplier / Delivered To labels (ideal for restaurant purchasing)
- Ticket — with due date and full line-item pricing

**Core**
- Real-time PDF preview with live updates
- Export as PDF, Excel, CSV, or JSON
- Export all history as a ZIP of PDFs
- Auto-save to `localStorage` — nothing is lost on refresh
- Customer database with autocomplete and one-click load
- Document history with load, duplicate, and delete
- Multi-currency: USD, EUR, GBP, JPY, CHF
- Multi-language: English, Spanish, French, German

**Power features**
- **Chaos Mode** — inject intentionally broken data for testing edge cases: negative amounts, mismatched totals, invalid emails, crazy invoice numbers, date anomalies, emoji injection, and a bad-scan PDF overlay. Works correctly across all document types.
- **Bulk Generation** — generate 5 to 100 test documents at once, with a configurable document type (or random mix), number prefix, and optional date range spread.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) + [Vue 3](https://vuejs.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) |
| Excel | [SheetJS (xlsx)](https://sheetjs.com) |
| ZIP | [JSZip](https://stuk.github.io/jszip) |
| IDs | [uuid](https://github.com/uuidjs/uuid) |
| Deploy | GitHub Pages via GitHub Actions |

---

## Getting Started

**Prerequisites:** [Bun](https://bun.sh)

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:3001)
bun run dev
```

```bash
# Build for production
bun run build

# Generate static output (used by CI)
bunx nuxt generate

# Preview production build locally
bun run preview
```

---

## Deployment

The app deploys automatically to GitHub Pages on every push to `main` via the workflow in `.github/workflows/deploy.yml`. It uses the `github_pages` Nuxt preset which handles the `/invoice-generator/` base URL and SPA fallback.

```
push to main → bun install → nuxt build --preset github_pages → deploy to Pages
```

---

## Project Structure

```
app/
├── app.vue                     # Main application (form, preview, modals)
├── components/
│   ├── BulkGenerateModal.vue   # Bulk document generation
│   └── ChaosConfigModal.vue    # Chaos mode configuration
└── composables/
    ├── useInvoice.ts           # Invoice state, storage, document type config
    ├── useChaosMode.ts         # Chaos mode logic and data generation
    ├── useBulkGeneration.ts    # Bulk generation orchestration
    ├── useTranslations.ts      # i18n
    └── useToast.ts             # Toast notifications
public/
├── favicon.svg                 # App icon
└── favicon.ico                 # Fallback icon
nuxt.config.ts                  # Nuxt config (base URL, favicon, dev port)
```

---

## License

MIT
