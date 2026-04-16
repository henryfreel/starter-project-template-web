# Agent Instructions — Web Project Template

## Overview

This is a static HTML/CSS/JS project that consumes the Simple Design System via CDN. There is no build step — just static files. Data is managed through a lightweight in-memory store backed by JSON files.

**Design system reference:** https://starter-project-ds.netlify.app/
**Design system Figma file key:** `cpFzRo9We3lWcBNjwvI6iN`

## File Map

| File | Purpose |
|---|---|
| `index.html` | Main page. Uses DS components via CDN link tags. |
| `css/local.css` | Project-specific style overrides. DS tokens are available here. |
| `js/app.js` | Data layer (loadData, CRUD store) + render helpers + boot logic. |
| `data/sample.json` | Default data file. Add more JSON files in `data/` as needed. |
| `netlify.toml` | Netlify deploy config. |

## Design System CDN

The DS is loaded via three CSS files and one JS file in `index.html`:

```html
<link rel="stylesheet" href="https://starter-project-ds.netlify.app/css/reset.css">
<link rel="stylesheet" href="https://starter-project-ds.netlify.app/css/tokens.css">
<link rel="stylesheet" href="https://starter-project-ds.netlify.app/css/components.css">
<script src="https://starter-project-ds.netlify.app/js/main.js"></script>
```

Do not duplicate DS styles locally. Use DS classes directly in HTML (`btn btn-brand`, `ds-table`, `list-row`, etc.). For project-specific overrides, use `css/local.css`.

## Available DS Components

Full reference with examples at https://starter-project-ds.netlify.app/. Key components:

- **Buttons:** `.btn.btn-brand`, `.btn.btn-neutral`, `.btn.btn-subtle`, `.btn.btn-danger`, `.btn-icon`
- **Tags:** `.tag.tag-brand`, `.tag.tag-danger`, `.tag.tag-positive`, `.tag.tag-warning`, `.tag.tag-neutral`
- **Table:** `.ds-table` with `<thead>`, `<tbody>`, `.ds-table-header`, `.ds-table-section`
- **List Row:** `.list-row` with `.list-row-left`, `.list-row-text`, `.list-row-title`, `.list-row-subtitle`
- **Form fields:** `.select-field`, `.checkbox-field`, `.radio-field`, `.switch-field`, `.search-input`
- **Overlays:** `.modal`, `.blade`, `.dialog`
- **Layout:** `.ds-header`, `.ds-hero`, `.ds-panel`, `.ds-card-grid`, `.ds-page-section`
- **Avatars:** `.avatar`, `.avatar-sm`, `.avatar-lg`
- **Tabs:** `.ds-tabs`, `.tab`
- **Notifications:** `.notification`
- **Accordion:** `.ds-accordion`, `.accordion-item`
- **Popover:** `.popover`, `.popover-item`

## Icons

Use the SVG sprite from the CDN:

```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <use href="https://starter-project-ds.netlify.app/icons.svg#icon-name"></use>
</svg>
```

Or use the `icon()` helper in JS: `icon('heart', 24)` returns the SVG string.

Change `width`/`height` for different sizes (16, 20, 24, 32, 40, 48). `viewBox` always stays `"0 0 24 24"`.

## Data Layer

### Loading data

```javascript
const store = await loadData('./data/my-data.json');
```

### CRUD operations

```javascript
store.getAll()                    // returns array of all items
store.getById(id)                 // returns single item or null
store.add({ key: 'value' })      // adds item with auto-generated id, triggers onChange
store.update(id, { key: 'new' }) // merges changes into item, triggers onChange
store.remove(id)                  // removes item, triggers onChange
store.onChange(callbackFn)        // registers a listener called after any mutation
```

### Rendering

```javascript
renderTable('#selector', items, {
  columns: ['Col1', 'Col2'],
  row: item => `<td>${item.field1}</td><td>${item.field2}</td>`
});

renderList('#selector', items, item => `<div class="list-row">...</div>`);

renderCards('#selector', items, item => `<div class="card">...</div>`);
```

### Adding new data files

1. Create a JSON file in `data/` (e.g., `data/products.json`)
2. Load it in `app.js`: `const products = await loadData('./data/products.json');`
3. Add a render function and bind it with `products.onChange(renderProducts);`

## Styling Rules

**Every visible element must be styled using a DS class or DS tokens. No exceptions.**

1. Before adding any styled element, check the live DS reference at https://starter-project-ds.netlify.app/ and the CSS at https://starter-project-ds.netlify.app/css/components.css for an existing class.
2. If a DS class exists, use it. Do not recreate its styles with inline CSS or custom classes.
3. If no DS class exists for the element you need, **stop and call it out** — do not invent a custom class or use raw CSS values. Flag it so a proper DS component can be created.
4. When inline styles are unavoidable (e.g., layout wrappers), every value must reference a DS token (`var(--space-400)`, `var(--text-default)`, etc.). Never use raw hex colors, pixel values, or font names.
5. `css/local.css` is only for base body styles and narrow project-specific overrides that reference DS tokens.

### DS gaps (elements without a DS class)

The following elements are used in this project but do not have dedicated DS classes. They are styled using DS tokens via inline styles until proper DS classes are created:

| Element | Current approach | DS tokens used |
|---------|-----------------|----------------|
| Inline text link | `style="color: var(--text-default); text-decoration: underline;"` | `--text-default` |
| Text input field | Inline styles on `<input>` | `--space-200`, `--space-300`, `--stroke-border`, `--border-default`, `--radius-200`, `--text-body`, `--text-default`, `--bg-default` |

When a DS class is added for any of these, update this table and replace the inline styles with the new class.

### DS issues (bugs and behavioral limitations)

The following DS bugs or limitations required workarounds in this project. These should be fixed in the DS itself:

| Component | Issue | Workaround in this project | DS fix needed |
|-----------|-------|---------------------------|---------------|
| `components.css` — Modal | `.modal-container` has `overflow: hidden` and `.modal-body` has `overflow-y: auto`, which clips `position: absolute` popovers inside the modal. | `local.css` overrides both to `overflow: visible`. | Popovers inside modals should escape the scroll container (e.g., use `position: fixed` with JS-calculated coordinates, or remove overflow clipping when a popover is open). |
| CDN — Base body styles | The three CDN files (`reset.css`, `tokens.css`, `components.css`) do not set `font-family`, `color`, or `background-color` on `body`. Without these, the DS font never applies globally and dark mode doesn't toggle the page background. | `local.css` sets `font-family: var(--font-sans)`, `color: var(--text-default)`, `background-color: var(--bg-default)` on `body`. | Add base body styles to one of the CDN files (likely `reset.css` or `tokens.css`) so consumer projects get correct defaults without manual setup. |

When an issue is fixed in the DS, remove the workaround from this project and delete the row from this table.

## Conventions

- All data objects must have a numeric `id` field
- Use DS token variables in `local.css` (e.g., `var(--space-400)`, `var(--text-default)`)
- Keep all project JS in `js/app.js` (or add more files and include them in `index.html`)
- Use string template literals for rendering HTML — no framework needed
- Data resets on page refresh by design
