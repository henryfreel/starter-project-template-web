// Data Layer — lightweight in-memory store backed by JSON files
// Resets on page refresh (by design). No backend needed.

async function loadData(jsonPath) {
  const res = await fetch(jsonPath);
  let items = await res.json();
  let nextId = items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  const listeners = [];

  function notify() {
    listeners.forEach(fn => fn(items));
  }

  return {
    getAll() {
      return [...items];
    },

    getById(id) {
      return items.find(item => item.id === id) || null;
    },

    add(obj) {
      const item = { id: nextId++, ...obj };
      items.push(item);
      notify();
      return item;
    },

    update(id, changes) {
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...changes };
      notify();
      return items[idx];
    },

    remove(id) {
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) return false;
      items.splice(idx, 1);
      notify();
      return true;
    },

    onChange(fn) {
      listeners.push(fn);
    }
  };
}

// Render Helpers — bridge data arrays to DS components

function renderTable(container, items, opts) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const headerHtml = opts.columns
    .map(col => `<th>${col}</th>`)
    .join('');

  const rowsHtml = items
    .map(item => `<tr>${opts.row(item)}</tr>`)
    .join('');

  el.innerHTML = `
    <table class="ds-table">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function renderList(container, items, templateFn) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;
  el.innerHTML = items.map(templateFn).join('');
}

function renderCards(container, items, templateFn) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;
  el.innerHTML = items.map(templateFn).join('');
}

// DS icon helper — returns an SVG string referencing the CDN sprite
const DS_CDN = 'https://starter-project-ds.netlify.app';

function icon(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="${DS_CDN}/icons.svg#${name}"></use></svg>`;
}

// Boot — load data and render the page
document.addEventListener('DOMContentLoaded', async () => {
  const team = await loadData('./data/sample.json');

  function render() {
    renderTable('#team-table', team.getAll(), {
      columns: ['Name', 'Role', 'Status'],
      row: item => `
        <td>${item.name}</td>
        <td>${item.role}</td>
        <td><span class="tag tag-${item.status === 'Active' ? 'positive' : 'neutral'} secondary">${item.status}</span></td>
      `
    });

    renderList('#activity-list', team.getAll(), item => `
      <div class="list-row">
        <div class="list-row-left">
          <div class="avatar avatar-sm">${item.name.charAt(0)}</div>
          <div class="list-row-text">
            <span class="list-row-title">${item.name}</span>
            <span class="list-row-subtitle">${item.role} · ${item.status}</span>
          </div>
        </div>
      </div>
    `);
  }

  team.onChange(render);
  render();
});
