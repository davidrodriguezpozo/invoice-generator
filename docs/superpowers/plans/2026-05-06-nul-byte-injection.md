# NUL Byte Injection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a chaos-mode toggle that injects `\0` bytes into invoice text fields, so generated PDFs (and other exports) can be used to test downstream OCR pipelines that handle text extracted from those fields.

**Architecture:** Extend `useChaosMode` with a new `enableNulByteInjection` flag and a small `injectNulBytes` helper that mirrors the existing `injectEmojis` helper. The helper runs over the same set of text fields that emoji injection touches, after emoji injection so NULs land in the final string. jsPDF encodes `\0` as `\000` in PDF string objects, so PDF text-extraction tools (and Excel / CSV / JSON exports) all surface the NULs naturally — no changes to the export pipeline.

**Tech Stack:** Nuxt 4 / Vue 3 / TypeScript, jsPDF (already used for PDF export). No test framework is configured in this repo, so each task ends with a manual verification step rather than an automated test run.

**Spec:** `docs/superpowers/specs/2026-05-05-nul-byte-injection-design.md`

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `app/composables/useChaosMode.ts` | Modify | Add config flag, default, helper, and call sites in `applyChaosToInvoice` + `generateChaoticInvoice` |
| `app/components/ChaosConfigModal.vue` | Modify | Add a checkbox row for the new flag in the existing `features` list |

No new files. No changes to `buildInvoicePdf` or any export branch in `app/app.vue`.

---

## Task 1: Add `enableNulByteInjection` to the chaos config type and default

**Files:**
- Modify: `app/composables/useChaosMode.ts:9-19` (the `ChaosConfig` interface)
- Modify: `app/composables/useChaosMode.ts:23-33` (the default config)

- [ ] **Step 1: Add the flag to the `ChaosConfig` interface**

In `app/composables/useChaosMode.ts`, update the `ChaosConfig` interface to add `enableNulByteInjection: boolean` as a new field. Place it after `enableBadScanEffect` so it sits at the end of the feature list:

```ts
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
  enableNulByteInjection: boolean
}
```

- [ ] **Step 2: Add the default value to the singleton config**

Update the default `chaosConfig` ref to include the new flag (defaulting to `true`, matching the other flags):

```ts
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
  enableNulByteInjection: true,
})
```

- [ ] **Step 3: Type-check the change**

Run: `bunx nuxt prepare && bunx vue-tsc --noEmit`
Expected: no type errors. (If `vue-tsc` is not installed, run `bunx nuxt prepare` and rely on the Task 4 modal change to surface any type mismatch.)

- [ ] **Step 4: Commit**

```bash
git add app/composables/useChaosMode.ts
git commit -m "feat(chaos): add enableNulByteInjection flag to ChaosConfig"
```

---

## Task 2: Implement the `injectNulBytes` helper

**Files:**
- Modify: `app/composables/useChaosMode.ts` — add a helper next to `injectEmojis` (around line 339)

- [ ] **Step 1: Add the helper inside `useChaosMode`**

Insert this function inside the `useChaosMode` function body, immediately after the existing `injectEmojis` definition (around line 353, before `generateChaoticItems`):

```ts
const injectNulBytes = (text: string): string => {
  const { intensity, enableNulByteInjection } = chaosConfig.value
  if (!enableNulByteInjection || !text) return text

  const multiplier = getIntensityMultiplier(intensity)
  // mild=0.3 → 1 NUL, medium=0.6 → 1 NUL, extreme=0.9 → 2 NULs
  const nulCount = Math.max(1, Math.floor(multiplier * 3))

  let result = text
  for (let i = 0; i < nulCount; i++) {
    const position = Math.floor(Math.random() * (result.length + 1))
    result = result.slice(0, position) + '\0' + result.slice(position)
  }
  return result
}
```

- [ ] **Step 2: Export the helper from the composable**

In the `return` block at the end of `useChaosMode` (around line 599-619), add `injectNulBytes` to the "Individual generators" section so it sits next to `injectEmojis`:

```ts
    // Individual generators (for testing/customization)
    generateChaoticTax,
    generateChaoticAmount,
    generateChaoticDates,
    generateChaoticEmail,
    injectEmojis,
    injectNulBytes,
    generateChaoticItems,
  }
}
```

- [ ] **Step 3: Sanity-check the helper in a browser console**

Start the dev server (skip if already running): `bun run dev`
Open the app, open DevTools console, paste:

```js
// Pull the composable from the running app — only works if the app exposes useChaosMode globally.
// Otherwise, just enable Chaos Mode in the UI in Task 5; this step is optional sanity.
```

This step is optional — if the composable isn't reachable from the console, skip it. The real verification happens in Task 5.

- [ ] **Step 4: Commit**

```bash
git add app/composables/useChaosMode.ts
git commit -m "feat(chaos): add injectNulBytes helper"
```

---

## Task 3: Apply NUL injection in `applyChaosToInvoice`

**Files:**
- Modify: `app/composables/useChaosMode.ts:451-471` (the emoji injection block inside `applyChaosToInvoice`)

**Why:** `applyChaosToInvoice` mutates an existing invoice. The emoji-injection block (currently at lines 451-471) handles `from.businessName`, `to.customerName`, `notes`, `terms`, and each `items[].description`. We add an analogous block immediately after, so NULs land in the final string (after any emoji injection).

- [ ] **Step 1: Add the NUL injection block after emoji injection**

After the closing `}` of the `if (enableEmojiInjection) { ... }` block in `applyChaosToInvoice` (currently line 471), insert:

```ts
    // Apply NUL byte injection to text fields (runs after emoji injection
    // so NULs land in the final string)
    if (chaosConfig.value.enableNulByteInjection) {
      if (chaosInvoice.from.businessName) {
        chaosInvoice.from.businessName = injectNulBytes(chaosInvoice.from.businessName)
      }
      if (chaosInvoice.to.customerName) {
        chaosInvoice.to.customerName = injectNulBytes(chaosInvoice.to.customerName)
      }
      if (chaosInvoice.notes) {
        chaosInvoice.notes = injectNulBytes(chaosInvoice.notes)
      }
      if (chaosInvoice.terms) {
        chaosInvoice.terms = injectNulBytes(chaosInvoice.terms)
      }
      chaosInvoice.items.forEach(item => {
        if (item.description) {
          item.description = injectNulBytes(item.description)
        }
      })
    }
```

Pull `enableNulByteInjection` into the destructured locals at the top of `applyChaosToInvoice` (currently lines 412-420), so the function reads consistently:

```ts
    const {
      enableEmojiInjection,
      enableCrazyInvoiceNumbers,
      enableDateChaos,
      enableInvalidEmails,
      enableTaxChaos,
      enableNegativeAmounts,
      enableTotalMismatch,
      enableNulByteInjection,
    } = chaosConfig.value
```

Then replace the `if (chaosConfig.value.enableNulByteInjection)` you just inserted with `if (enableNulByteInjection)` to match the local destructuring style of the rest of the function.

- [ ] **Step 2: Manually verify with the running app**

Start (or keep) the dev server: `bun run dev`
In the app:
1. Open ChaosConfigModal (the toggle will appear in Task 4 — for now you can flip the flag via DevTools: `useChaosMode().chaosConfig.value.enableNulByteInjection = true` if reachable, otherwise rely on the default `true`).
2. Click "Unleash Chaos" on an existing invoice.
3. Open DevTools and inspect the invoice state — text fields like `notes`, `terms`, `from.businessName`, `to.customerName`, and item descriptions should contain `\0` characters (visible as no-width or as ` ` when JSON-stringified).

Quick console check:

```js
// In the running app's console:
JSON.stringify(/* the current invoice ref */).includes('\\u0000')
// Expected: true after Unleash Chaos with enableNulByteInjection on
```

If you can't reach the invoice from the console, skip — the export-format verification in Task 5 is the authoritative check.

- [ ] **Step 3: Commit**

```bash
git add app/composables/useChaosMode.ts
git commit -m "feat(chaos): inject NUL bytes into text fields in applyChaosToInvoice"
```

---

## Task 4: Apply NUL injection in `generateChaoticInvoice`

**Files:**
- Modify: `app/composables/useChaosMode.ts:547-577` (the invoice object literal inside `generateChaoticInvoice`)

**Why:** `generateChaoticInvoice` builds a fresh chaotic invoice from scratch. We wrap the same set of text fields that emoji injection currently runs over (or that we want NULs in) with `injectNulBytes`. The helper is internally guarded by `enableNulByteInjection`, so calling it unconditionally is safe and matches the existing pattern (e.g. `injectEmojis(notes)` on line 573 is also called unconditionally).

- [ ] **Step 1: Wrap the relevant fields with `injectNulBytes`**

Modify the invoice object literal in `generateChaoticInvoice`. The current structure (around line 547) becomes:

```ts
    const invoice: Invoice = {
      number: enableCrazyInvoiceNumbers
        ? randomFromArray(invoiceNumbers)
        : defaultNumber,
      date: dates.date,
      dueDate: docConfig.hasDueDate ? dates.dueDate : '',
      documentType: docType,
      paymentMethod: docConfig.hasPaymentMethod
        ? randomFromArray(['cash', 'credit_card', 'bank_transfer', 'check'])
        : '',
      logo: null,
      from: {
        businessName: injectNulBytes(randomFromArray(businessNames)),
        taxId: randomFromArray(taxIds),
        address: randomFromArray(addresses),
        email: generateChaoticEmail(),
        phone: randomFromArray(phones),
      },
      to: {
        customerName: injectNulBytes(randomFromArray(customerNames)),
        taxId: randomFromArray(taxIds),
        address: randomFromArray(addresses),
        email: generateChaoticEmail(),
        phone: randomFromArray(phones),
      },
      items,
      notes: injectNulBytes(injectEmojis('Payment is due upon receipt. Thank you for your business!')),
      terms: docConfig.hasTerms
        ? injectNulBytes(injectEmojis('Net 30. Late fees may apply. Or not. Who knows? Not financial advice.'))
        : '',
    }
```

Note the composition order: `injectNulBytes(injectEmojis(...))` so emoji-injected text gets NULs sprinkled in after.

- [ ] **Step 2: Apply NUL injection to item descriptions in `generateChaoticItems`**

The freshly generated items in `generateChaoticInvoice` come from `generateChaoticItems` (line 355). Update that helper to run descriptions through `injectNulBytes`:

```ts
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
        description: injectNulBytes(randomFromArray(descriptions)),
        quantity,
        price,
        tax: generateChaoticTax(),
      })
    }

    return items
  }
```

- [ ] **Step 3: Commit**

```bash
git add app/composables/useChaosMode.ts
git commit -m "feat(chaos): inject NUL bytes into text fields in generateChaoticInvoice"
```

---

## Task 5: Add the toggle to ChaosConfigModal

**Files:**
- Modify: `app/components/ChaosConfigModal.vue:144-153` (the `features` array)

- [ ] **Step 1: Add the new feature row**

Add a new entry to the `features` array, after the `enableBadScanEffect` row:

```ts
const features: { key: keyof Omit<ChaosConfig, 'intensity'>; label: string; description: string }[] = [
  { key: 'enableTaxChaos', label: 'Crazy Taxes', description: 'Negative, >100%, weird decimals' },
  { key: 'enableNegativeAmounts', label: 'Negative Amounts', description: 'Negative quantities and prices' },
  { key: 'enableTotalMismatch', label: 'Mismatched Totals', description: 'Totals that don\'t add up' },
  { key: 'enableEmojiInjection', label: 'Emoji Injection', description: 'Random emojis everywhere' },
  { key: 'enableDateChaos', label: 'Date Chaos', description: 'Due dates before invoice dates' },
  { key: 'enableInvalidEmails', label: 'Invalid Emails', description: 'Broken email formats' },
  { key: 'enableCrazyInvoiceNumbers', label: 'Crazy Invoice Numbers', description: 'SQL injection, special chars' },
  { key: 'enableBadScanEffect', label: 'Bad Scan Effect', description: 'Randomized gradient overlay on PDF' },
  { key: 'enableNulByteInjection', label: 'NUL Byte Injection', description: 'Inserts \\0 bytes into text fields (OCR pipeline torture test)' },
]
```

- [ ] **Step 2: Open the modal in the running app and confirm the new row**

With `bun run dev` running, open the ChaosConfigModal in the app. Expected:
- A new "NUL Byte Injection" checkbox appears at the bottom of the features list.
- It is checked by default.
- Toggling it and clicking "Select all" / "Deselect all" updates it correctly along with the others.

- [ ] **Step 3: Commit**

```bash
git add app/components/ChaosConfigModal.vue
git commit -m "feat(chaos): add NUL byte injection toggle to ChaosConfigModal"
```

---

## Task 6: End-to-end verification across export formats

**Files:** None — this is verification only.

The goal is to confirm that NULs appear in the formats where they should, and don't break the formats where they shouldn't.

- [ ] **Step 1: Generate a chaotic invoice with NUL injection on**

In the running app:
1. Open ChaosConfigModal, ensure "NUL Byte Injection" is checked (default).
2. Set intensity to `mild` (the user's preferred default).
3. Click "Unleash Chaos" on an existing invoice (or use Bulk Generate to produce a fresh one).

- [ ] **Step 2: Verify PDF export contains NULs**

Click Export → PDF, save the file. Then in a terminal:

```bash
# Count NUL bytes in extracted text. Requires pdftotext (poppler-utils).
pdftotext path/to/invoice.pdf - | tr -cd '\000' | wc -c
```

Expected: a positive number (typically 1–5 with mild intensity, depending on which fields are populated).

If `pdftotext` isn't available, alternative: open the PDF in `xxd` and search for `00` bytes inside string objects:

```bash
xxd path/to/invoice.pdf | grep -E '\\\\000|<.*00.*>' | head
```

- [ ] **Step 3: Verify CSV export contains NULs**

Click Export → CSV, save the file. Then:

```bash
tr -cd '\000' < path/to/invoice.csv | wc -c
```

Expected: a positive number.

- [ ] **Step 4: Verify JSON export contains NULs**

Click Export → JSON, save the file. Then:

```bash
grep -c '\\u0000' path/to/invoice.json
```

Expected: a positive number (`JSON.stringify` encodes `\0` as ` `).

- [ ] **Step 5: Verify PNG export still produces a clean image**

Click Export → PNG. Expected: the file opens as a valid PNG image. NULs should not appear in the rasterized output (this is correct — they don't render).

- [ ] **Step 6: Verify the off-state**

Toggle "NUL Byte Injection" off in the modal, click "Unleash Chaos" again to regenerate, export PDF, and re-run the `pdftotext | tr -cd '\000' | wc -c` check.

Expected: `0` — no NULs in extracted text.

- [ ] **Step 7: No commit needed**

This task is verification only. If any step fails, return to the relevant earlier task and fix.

---

## Self-review notes

**Spec coverage:**
- ✅ `ChaosConfig` flag — Task 1
- ✅ Default `true` — Task 1
- ✅ `injectNulBytes` helper — Task 2
- ✅ Apply in `applyChaosToInvoice` — Task 3
- ✅ Apply in `generateChaoticInvoice` (incl. items) — Task 4
- ✅ Modal checkbox — Task 5
- ✅ All-format behavior verification — Task 6
- ✅ No changes to `buildInvoicePdf` / export pipeline — confirmed by file structure section
- ✅ Composition order "after emoji injection" — explicit in both Tasks 3 and 4

**Type consistency:**
- `injectNulBytes(text: string): string` — same signature as `injectEmojis`, used identically.
- `enableNulByteInjection: boolean` — referenced consistently across config, helper, and modal.

**Placeholder scan:** No TBDs or "implement appropriate handling" — every step contains the actual code or command.
