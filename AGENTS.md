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

## Conventions

- All data objects must have a numeric `id` field
- Use DS token variables in `local.css` (e.g., `var(--space-400)`, `var(--text-default)`)
- Keep all project JS in `js/app.js` (or add more files and include them in `index.html`)
- Use string template literals for rendering HTML — no framework needed
- Data resets on page refresh by design
