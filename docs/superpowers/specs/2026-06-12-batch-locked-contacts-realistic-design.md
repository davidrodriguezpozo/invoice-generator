# Batch Generation: Locked Contacts + Realistic Mode

**Date:** 2026-06-12
**Status:** Approved (design)

## Context

The app can already bulk-generate N documents via `BulkGenerateModal.vue` →
`useBulkGeneration.ts` → `generateChaoticInvoice()`. Today every generated
document gets its **own random sender/recipient**, and the data is intentionally
chaotic (NaN, NULL, emojis, SQL-injection strings) for stress-testing PDF
pipelines.

The user wants to generate a batch where:

1. **All documents share the same sender (From) and recipient (To)**, pinned from
   whatever is currently in the editor — so a whole batch of invoices / delivery
   notes / etc. is consistently "from the same person, to the same person".
2. The batch can optionally contain **realistic, sensible data** instead of the
   chaos gibberish. Chaos stays available as an explicit choice.

This is useful for producing believable sample document sets for a single
business + client pair.

## Requirements

- Bulk generation offers a **mode toggle**: `Realistic` vs `Chaos`. Chaos
  preserves today's behavior exactly.
- Bulk generation offers **"Lock sender & recipient to current document"**. When
  on, every generated document's `from` and `to` are copied from the current
  editor invoice. Both parties are always locked together (no independent
  sender-only / recipient-only locking).
- Realistic mode produces clean, plausible data: company/person names, real-looking
  addresses, valid emails/phones, sensible product names, reasonable quantities /
  prices / tax rates, and valid dates — all respecting the document type config
  (`hasPrices`, `hasTax`, `hasDueDate`, `hasTerms`, `hasPaymentMethod`).
- Realistic generation must **not** touch chaos state (`chaosEnabled`,
  `chaosOverrides`, `originalInvoice`).

## Architecture

### 1. New dependency: `@faker-js/faker`

Source of realistic data. Imported via **dynamic `import('@faker-js/faker')`**
inside the bulk loop (loaded once per run) so it stays out of the initial page
bundle. Not statically imported anywhere in app-load paths.

### 2. New composable: `app/composables/useRealisticGeneration.ts`

Mirrors the structure of `useChaosMode`'s `generateChaoticInvoice`. Produces the
same `Invoice` shape (from `useInvoice.ts`) with sensible values.

Exposed surface:

- `loadFaker(): Promise<void>` — dynamically imports faker and caches the module
  instance at module scope. Idempotent.
- `generateRealisticInvoice(documentType?: DocumentType): Invoice` — synchronous;
  requires `loadFaker()` to have completed first (bulk calls it once before the
  loop). Throws a clear error if faker is not yet loaded.

Field generation:

| Field | Source |
|-------|--------|
| `from.businessName` | `faker.company.name()` |
| `from.taxId` | plausible VAT-like id (e.g. 2 letters + digits) |
| `from.address` | `faker.location.streetAddress()` + city/zip/country |
| `from.email` | `faker.internet.email()` |
| `from.phone` | `faker.phone.number()` |
| `to.customerName` | `faker.person.fullName()` |
| `to.*` | same generators as `from` |
| `items[].description` | `faker.commerce.productName()` |
| `items[].quantity` | small int (1–20) |
| `items[].price` | `Number(faker.commerce.price(...))`, sensible range |
| `items[].tax` | random from a sane set, e.g. `[0, 10, 21]` (only meaningful when `hasTax`) |
| `date` | recent date (faker.date.recent or today) |
| `dueDate` | `date + 30d` when `docConfig.hasDueDate`, else `''` |
| `number` | `docConfig.prefix` + number (overwritten by bulk prefix anyway) |
| `paymentMethod` | random valid method when `docConfig.hasPaymentMethod`, else `''` |
| `notes` | clean static string |
| `terms` | clean static string when `docConfig.hasTerms`, else `''` |
| `logo` | `null` |

Item count and price ranges respect `docConfig.hasPrices` (delivery notes carry
quantities but the prices are not rendered — keep behavior consistent with how
the chaos generator and PDF rendering treat `hasPrices`).

### 3. `app/composables/useBulkGeneration.ts` changes

`BulkGenerationOptions` gains:

```ts
mode: 'realistic' | 'chaos'
lockContacts: boolean
```

In `generateBulkInvoices`:

- Destructure `invoice` from `useInvoice()` (the current editor invoice) in
  addition to the existing `invoiceHistory`, `currency`.
- Pull `generateRealisticInvoice` + `loadFaker` from `useRealisticGeneration()`.
- If `mode === 'realistic'`, `await loadFaker()` once before the loop.
- Per iteration: `const inv = mode === 'realistic' ? generateRealisticInvoice(resolvedDocType) : generateChaoticInvoice(resolvedDocType)`.
- Apply the existing prefix + date-range logic unchanged.
- If `options.lockContacts`, overwrite contacts with deep clones of the editor's:
  ```ts
  inv.from = JSON.parse(JSON.stringify(invoice.value.from))
  inv.to   = JSON.parse(JSON.stringify(invoice.value.to))
  ```
  (Clone so the saved documents don't alias the live editor object.)
- `customerName` for the `SavedInvoice` summary continues to read from
  `inv.to.customerName` (now the locked value when locking is on).

### 4. `app/components/BulkGenerateModal.vue` changes

- Add a **Mode** section (above or below Document Type) with two buttons —
  `Realistic` / `Chaos` — styled like the existing count/doc-type buttons,
  bound to `options.mode`.
- Add a **"Lock sender & recipient to current document"** checkbox bound to
  `options.lockContacts`, styled like the existing "Spread across date range"
  checkbox. When checked, show a small preview line:
  `From: <editor from.businessName || '—'> → To: <editor to.customerName || '—'>`,
  reading the current editor invoice via `useInvoice()`.
- Show the existing "Uses current Chaos Mode settings…" note **only when
  `options.mode === 'chaos'`**.
- `options` reactive defaults gain `mode: 'realistic'`, `lockContacts: false`.

## Data flow

```
BulkGenerateModal (mode, lockContacts, count, type, prefix, dateRange)
        │  handleGenerate()
        ▼
generateBulkInvoices(options)
        │  mode === 'realistic' ? await loadFaker() : —
        │  loop:
        │    inv = realistic ? generateRealisticInvoice() : generateChaoticInvoice()
        │    apply prefix / date range
        │    if lockContacts: inv.from/to = clone(editorInvoice.from/to)
        │    push SavedInvoice
        ▼
invoiceHistory + localStorage   (editor invoice untouched)
```

## Edge cases

- **Blank editor contacts + lockContacts on** → batch gets blank From/To. Expected;
  the user controls this by filling the editor first. The preview line surfaces
  this (`—`).
- **Realistic mode leaves chaos state alone** → if chaos was previously enabled in
  the session, the chaos banner / overrides are not introduced or cleared by a
  realistic batch run.
- **Delivery notes** (`hasPrices: false`) → realistic generator still creates
  items/quantities; prices simply aren't surfaced in rendering, matching current
  behavior.

## Testing / verification

No automated test framework exists in this repo. Verify manually:

1. `bun install` (pulls `@faker-js/faker`), then `bun run dev`.
2. Fill the editor's From/To with recognizable values.
3. Open Bulk Generate → **Realistic** mode, **Lock contacts** on, generate 10.
   - History shows 10 docs; every doc's From/To matches the editor values.
   - Item descriptions, prices, dates, emails are sensible (no NaN/NULL/emoji/SQL).
4. Toggle **Chaos** mode, lock off, generate → behaves exactly as today (gibberish,
   independent random contacts).
5. Chaos + lock contacts on → chaotic body, but From/To pinned to the editor.
6. Confirm the editor invoice itself is unchanged after a batch run.
7. `bun run build` succeeds (faker dynamic import resolves).

## Out of scope

- Independent sender-only / recipient-only locking.
- A single-document "fill with realistic sample" button.
- Locking fields other than From/To (items, dates remain randomized).
- Seeding/determinism for faker output.
