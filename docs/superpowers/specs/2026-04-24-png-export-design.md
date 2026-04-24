# PNG Export Option — Design

## Goal

Add a PNG download option to the invoice export flow so the user can get a rasterized image of the generated document (for visual testing).

## Approach

Rasterize the existing jsPDF-generated document using `pdfjs-dist`, render page 1 to an offscreen canvas, and trigger a download as `{invoice-number}.png`.

Rationale: the PDF is drawn programmatically with jsPDF primitives (not from HTML), so reusing the existing PDF generation path and rasterizing the output is the lowest-footprint way to get a visually identical PNG. Alternatives (mirror DOM + `html2canvas`, or extracting jsPDF canvas internals) would require duplicating ~500 lines of drawing logic or re-architecting the rendering, neither justified for this use case.

## Scope

- Page 1 only. Multi-page invoices export just the first page. (User confirmed option A.)
- No Chaos-mode-specific handling beyond what the PDF already produces — whatever the PDF looks like, the PNG will match.
- Not wired into bulk generation; single-invoice export only.

## Changes

1. **`app/components/ExportModal.vue`**
   - Add a 5th button "PNG (image)" between the PDF button and Excel button.
   - Emit `'png'` via the existing `export` event — widen the event's format union to include `'png'`.

2. **`app/app.vue`**
   - Widen the export handler signature to accept `'png'`.
   - Add a `png` branch that:
     - Builds the jsPDF document using the exact same code path as the `'pdf'` branch (extract the shared body into a local helper returning the `pdf` instance, or duplicate-then-rasterize — prefer extraction to avoid divergence).
     - Calls `pdf.output('arraybuffer')`.
     - Lazy-imports `pdfjs-dist`, loads the buffer, renders page 1 to a canvas at ~2× scale (for crispness).
     - `canvas.toBlob('image/png')` → trigger download as `{invoice.number || 'invoice'}.png`.

3. **`package.json`**
   - Add `pdfjs-dist` as a dependency.

## Non-goals

- Multi-page PNG export (zip or stitched). Can be added later if needed.
- PNG inside bulk generation or history drawer.
- i18n keys beyond the new button label (one string, follow existing `t('pdfDescription')` pattern or inline for now — defer to existing convention in the file).

## Testing

- Manual: open dev server, export a standard invoice, verify `invoice.png` downloads and renders identically to the PDF preview.
- Manual: export a long invoice (many line items) and confirm page 1 content matches and no error thrown.
- Manual: export with chaos mode enabled and confirm effects are preserved.
