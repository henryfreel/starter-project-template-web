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
function icon(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#${name}"></use></svg>`;
}

const IS_TEMPLATE = document.documentElement.dataset.template === 'true';

function getInstanceId() {
  const key = 'project-instance-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    localStorage.setItem(key, id);
  }
  return id;
}

// Boot — load data and render the page
document.addEventListener('DOMContentLoaded', async () => {
  if (!IS_TEMPLATE) {
    const instanceId = getInstanceId();
    const logo = document.getElementById('logo-text');
    const hero = document.getElementById('hero-title');
    if (logo) logo.textContent = `My Project (${instanceId})`;
    if (hero) hero.textContent = `Welcome to My Project (${instanceId})`;
    document.title = `My Project (${instanceId})`;
  }

  const team = await loadData('./data/sample.json');

  function render() {
    renderTable('#team-table', team.getAll(), {
      columns: ['Name', 'Role', 'Status', ''],
      row: item => `
        <td>${item.name}</td>
        <td>${item.role}</td>
        <td><span class="tag tag-${item.status === 'Active' ? 'positive' : 'neutral'} secondary">${item.status}</span></td>
        <td class="align-right"><button class="btn btn-subtle btn-sm" data-edit-id="${item.id}">Edit</button></td>
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

  // Blade: show member detail on Edit click
  const bladeOverlay = document.getElementById('demo-blade');
  const bladeTitle = document.getElementById('blade-title');
  const bladeBody = document.getElementById('blade-body');

  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-id]');
    if (!editBtn) return;
    const id = Number(editBtn.getAttribute('data-edit-id'));
    const member = team.getById(id);
    if (!member || !bladeOverlay) return;

    bladeTitle.textContent = member.name;
    bladeBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-600);">
        <div style="display: flex; align-items: center; gap: var(--space-400);">
          <div class="avatar">${member.name.charAt(0)}</div>
          <div style="display: flex; flex-direction: column; gap: var(--space-050);">
            <span style="font-size: var(--text-subheading); font-weight: var(--weight-semibold); color: var(--text-default);">${member.name}</span>
            <span style="font-size: var(--text-body-small); color: var(--text-secondary);">${member.role}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-300);">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: var(--text-body-small); color: var(--text-secondary);">Role</span>
            <span style="font-size: var(--text-body-small); color: var(--text-default);">${member.role}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: var(--text-body-small); color: var(--text-secondary);">Status</span>
            <span class="tag tag-${member.status === 'Active' ? 'positive' : 'neutral'} secondary">${member.status}</span>
          </div>
        </div>
      </div>
    `;

    bladeOverlay.classList.add('open');
    document.body.classList.add('overlay-open');
  });

  // Modal: save new team member
  const saveBtn = document.getElementById('close-modal-save');
  const modalOverlay = document.getElementById('demo-modal');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('modal-name');
      const roleField = document.getElementById('modal-role-field');
      const statusField = document.getElementById('modal-status-field');

      const name = nameInput ? nameInput.value.trim() : '';
      const role = roleField ? roleField.getAttribute('data-value') || '' : '';
      const status = statusField ? statusField.getAttribute('data-value') || '' : '';

      if (name && role && status) {
        team.add({ name, role, status });
        if (nameInput) nameInput.value = '';
        if (roleField) {
          roleField.setAttribute('data-value', '');
          roleField.querySelector('.select-trigger-text').textContent = 'Select role...';
          roleField.querySelector('.select-trigger-text').classList.add('placeholder');
        }
        if (statusField) {
          statusField.setAttribute('data-value', '');
          statusField.querySelector('.select-trigger-text').textContent = 'Select status...';
          statusField.querySelector('.select-trigger-text').classList.add('placeholder');
        }
        if (modalOverlay) {
          modalOverlay.classList.remove('open');
          document.body.classList.remove('overlay-open');
        }
      }
    });
  }
});
