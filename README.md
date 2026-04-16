# Web Project Template

A quick-start template for building web projects with the [Simple Design System](https://starter-project-ds.netlify.app/).

## Getting started

1. Click **"Use this template"** on GitHub to create a new repo
2. Clone your new repo locally
3. Open `index.html` in a browser (or run a local server: `python3 -m http.server 8000`)
4. Start building

## File structure

```
index.html          — your main page (DS components ready to use)
css/local.css       — project-specific style overrides
js/app.js           — data layer + render helpers
data/sample.json    — your data (edit or add more JSON files)
netlify.toml        — auto-deploy config
```

## Design system

All components, tokens, and icons are loaded via CDN from the design system. No local CSS needed for DS components.

- **Component reference:** https://starter-project-ds.netlify.app/
- **Icons:** Use the SVG sprite — `<use href="https://starter-project-ds.netlify.app/icons.svg#icon-name">`
- **Tokens:** CSS custom properties like `var(--text-default)`, `var(--bg-brand)`, `var(--space-400)`

## Data layer

Load JSON files into an in-memory store with CRUD helpers:

```javascript
const store = await loadData('./data/sample.json');

store.getAll();                          // all items
store.getById(1);                        // single item
store.add({ name: 'New', role: 'Dev' }); // auto-assigns id
store.update(1, { status: 'Away' });     // merge changes
store.remove(3);                         // delete by id
store.onChange(render);                   // re-render on any change
```

Data resets on page refresh. Add more JSON files in `data/` and load them as separate stores.

## Render helpers

```javascript
renderTable('#container', items, {
  columns: ['Name', 'Role'],
  row: item => `<td>${item.name}</td><td>${item.role}</td>`
});

renderList('#container', items, item => `
  <div class="list-row">...</div>
`);

icon('heart', 24)  // returns SVG string for any DS icon
```

## Deploy

Push to GitHub. Connect the repo to [Netlify](https://netlify.com) for automatic deploys — `netlify.toml` is pre-configured.
