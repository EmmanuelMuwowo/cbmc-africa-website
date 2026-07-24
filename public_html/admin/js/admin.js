(function () {
  const NAV = [
    { key: 'dash', label: 'Dashboard' },
    { key: 'pages', label: 'Content Pages' },
    { key: 'manna', label: 'Monday Manna' },
    { key: 'news', label: 'News & Articles' },
    { key: 'events', label: 'Events' },
    { key: 'resources', label: 'Resources' },
    { key: 'subs', label: 'Subscribers' },
    { key: 'msgs', label: 'Contact Messages' },
    { key: 'media', label: 'Media Library' },
    { key: 'settings', label: 'Settings' }
  ];

  const META = {
    dash: { title: 'Dashboard', subtitle: "Welcome back — here's what's happening across CBMC Africa." },
    pages: { title: 'Content Pages', subtitle: 'Manage the static pages of the public site.' },
    manna: { title: 'Monday Manna', subtitle: 'Create, schedule and publish weekly devotionals.' },
    news: { title: 'News & Articles', subtitle: 'Featured stories from across the movement.' },
    events: { title: 'Events', subtitle: 'Summits, forums, trainings and gatherings.' },
    resources: { title: 'Resources', subtitle: 'Downloadable studies, guides and media.' },
    subs: { title: 'Subscribers', subtitle: 'People receiving the weekly Monday Manna email.' },
    msgs: { title: 'Contact Messages', subtitle: 'Enquiries submitted through the public site.' },
    media: { title: 'Media Library', subtitle: 'Images and files used across the site.' },
    settings: { title: 'Settings', subtitle: 'Organization details and site preferences.' }
  };

  const BADGES = {
    Published: { bg: '#e3f6e8', color: '#1a8a3e' },
    Scheduled: { bg: '#e8f0fe', color: '#0071e3' },
    Draft: { bg: '#f0f0f2', color: '#6e6e73' }
  };
  const REGION_TAGS = {
    AFRICA: { bg: '#f0f0f2', color: '#3a3a3c' },
    INTERNATIONAL: { bg: '#e8f0fe', color: '#0071e3' }
  };

  const state = {
    section: 'dash',
    search: '',
    pendingMsgCount: 0,
    cache: {},
    compose: { mode: null, id: null }
  };

  const els = {
    nav: document.getElementById('adminNav'),
    title: document.getElementById('adminTitle'),
    subtitle: document.getElementById('adminSubtitle'),
    content: document.getElementById('adminContent'),
    avatar: document.getElementById('adminAvatar'),
    searchForm: document.getElementById('adminSearchForm'),
    searchInput: document.getElementById('adminSearchInput'),
    newMannaBtn: document.getElementById('newMannaBtn'),
    composeModal: document.getElementById('composeModal'),
    composeClose: document.getElementById('composeClose'),
    composeTitle: document.getElementById('composeTitle'),
    composeBody: document.getElementById('composeBody'),
    resourceModal: document.getElementById('resourceModal'),
    resourceModalClose: document.getElementById('resourceModalClose'),
    resourceModalTitle: document.getElementById('resourceModalTitle'),
    resourceModalBody: document.getElementById('resourceModalBody')
  };

  function badgePill(status) {
    const b = BADGES[status] || BADGES.Draft;
    return `<span class="badge-pill" style="background:${b.bg};color:${b.color};">${Util.escapeHtml(status)}</span>`;
  }
  function regionPill(cat) {
    const b = REGION_TAGS[cat] || REGION_TAGS.AFRICA;
    return `<span class="badge-pill" style="background:${b.bg};color:${b.color};">${Util.escapeHtml(cat)}</span>`;
  }

  async function init() {
    try {
      const me = await Api.get('/api/admin/me.php');
      els.avatar.textContent = (me.name || 'A').split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    } catch (e) {
      window.location.href = 'login.html';
      return;
    }
    renderNav();
    await refreshMsgBadge();
    await loadSection('dash');

    els.searchForm.addEventListener('submit', (e) => e.preventDefault());
    els.searchInput.addEventListener('input', () => {
      state.search = els.searchInput.value;
      renderCurrentSection();
    });
    els.newMannaBtn.addEventListener('click', () => openCompose('create'));
    els.composeClose.addEventListener('click', closeCompose);
    els.composeModal.addEventListener('click', (e) => { if (e.target === els.composeModal) closeCompose(); });
    els.resourceModalClose.addEventListener('click', closeResourceModal);
    els.resourceModal.addEventListener('click', (e) => { if (e.target === els.resourceModal) closeResourceModal(); });
  }

  async function refreshMsgBadge() {
    try {
      const stats = await Api.get('/api/admin/stats.php');
      const pending = stats.stats.find((s) => s.label === 'Pending Messages');
      state.pendingMsgCount = pending ? Number(pending.value) : 0;
    } catch (e) { state.pendingMsgCount = 0; }
    renderNav();
  }

  function renderNav() {
    els.nav.innerHTML = NAV.map((n) => {
      const badge = n.key === 'msgs' && state.pendingMsgCount > 0
        ? `<span class="badge">${state.pendingMsgCount}</span>` : '';
      return `<button class="admin-nav-item${state.section === n.key ? ' active' : ''}" data-nav="${n.key}">
        <span class="dot"></span>${Util.escapeHtml(n.label)}${badge}
      </button>`;
    }).join('');
    els.nav.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.search = '';
        els.searchInput.value = '';
        loadSection(btn.dataset.nav);
      });
    });
  }

  async function loadSection(key) {
    state.section = key;
    renderNav();
    els.title.textContent = META[key].title;
    els.subtitle.textContent = META[key].subtitle;
    els.content.innerHTML = '<div class="skeleton-text">Loading…</div>';
    try {
      state.cache[key] = await fetchSectionData(key);
    } catch (e) {
      els.content.innerHTML = '<div class="skeleton-text">Could not load this section.</div>';
      return;
    }
    renderCurrentSection();
  }

  function fetchSectionData(key) {
    const map = {
      dash: '/api/admin/stats.php',
      manna: '/api/admin/devotionals.php',
      news: '/api/admin/news.php',
      events: '/api/admin/events.php',
      pages: '/api/admin/pages.php',
      resources: '/api/admin/resources.php',
      subs: '/api/admin/subscribers.php',
      msgs: '/api/admin/messages.php',
      media: '/api/admin/media.php',
      settings: '/api/admin/settings.php'
    };
    return Api.get(map[key]);
  }

  function renderCurrentSection() {
    const key = state.section;
    const data = state.cache[key];
    if (data === undefined) return;
    if (key === 'dash') return renderDash(data);
    if (key === 'msgs') return renderMessages(data);
    if (key === 'media') return renderMedia(data);
    if (key === 'settings') return renderSettings(data);
    return renderTable(key, data);
  }

  function match(q, ...fields) {
    if (!q) return true;
    const needle = q.trim().toLowerCase();
    return fields.some((f) => String(f || '').toLowerCase().includes(needle));
  }

  // ---------- Dashboard ----------
  function renderDash(data) {
    els.content.innerHTML = `
      <div class="stat-grid">
        ${data.stats.map((s) => `<div class="stat-card">
          <div class="stat-label">${Util.escapeHtml(s.label)}</div>
          <div class="stat-value">${Util.escapeHtml(s.value)}</div>
          <div class="stat-delta" style="color:${s.deltaColor};">${Util.escapeHtml(s.delta)}</div>
        </div>`).join('')}
      </div>
      <div class="dash-grid">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-head-title">Monday Manna — Recent posts</div>
            <button class="panel-head-link" id="viewAllManna">View all</button>
          </div>
          <div class="data-table-head" style="grid-template-columns:2.2fr 1fr 1fr 0.9fr;">
            <div>Title</div><div>Author</div><div>Published</div><div>Status</div>
          </div>
          ${data.dashPosts.map((p) => `<div class="data-row" style="grid-template-columns:2.2fr 1fr 1fr 0.9fr;">
            <div style="font-weight:600;color:var(--text-dark);">${Util.escapeHtml(p.title)}</div>
            <div style="color:var(--text-muted);">${Util.escapeHtml(p.author)}</div>
            <div style="color:var(--text-muted);">${Util.escapeHtml(p.date)}</div>
            <div>${badgePill(p.status)}</div>
          </div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="panel" style="padding:18px 20px;">
            <div class="panel-head-title" style="margin-bottom:14px;">Recent contact messages</div>
            ${data.dashMessages.map(() => '').join('')}
            <div id="dashMsgList"></div>
          </div>
          <div class="quick-actions-panel">
            <div class="title">Quick actions</div>
            <div style="display:flex;flex-direction:column;gap:9px;margin-top:14px;">
              <button class="quick-action-btn" data-quick="news">📝 Publish a news article</button>
              <button class="quick-action-btn" data-quick="events">📅 Add an event</button>
              <button class="quick-action-btn" data-quick="resources">📎 Upload a resource</button>
              <button class="quick-action-btn" data-quick="subs">✉ Export subscriber list</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('dashMsgList').innerHTML = data.dashMessages.map((m) => `
      <button class="msg-row" data-goto="msgs">
        <div class="msg-avatar">${Util.escapeHtml(m.initials)}</div>
        <div style="min-width:0;">
          <div class="msg-name">${Util.escapeHtml(m.name)}</div>
          <div class="msg-preview">${Util.escapeHtml(m.preview)}</div>
        </div>
        <div class="msg-time">${Util.escapeHtml(m.time)}</div>
      </button>
    `).join('');
    document.getElementById('viewAllManna').addEventListener('click', () => loadSection('manna'));
    els.content.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => loadSection(b.dataset.goto)));
    els.content.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => loadSection(b.dataset.quick)));
  }

  // ---------- Generic tables ----------
  const TABLE_CONFIG = {
    manna: {
      heading: 'All Monday Manna', addLabel: '+ New Manna',
      cols: ['Title', 'Author', 'Published', 'Status', ''],
      colsCss: '2.4fr 1fr 1fr 0.9fr 0.7fr',
      filter: (q, r) => match(q, r.title, r.author),
      cells: (r) => [r.title, r.author, r.dateLabel, badgePill(r.status)],
      onAdd: () => openCompose('create'),
      onEdit: (r) => openCompose('edit', r)
    },
    news: {
      heading: 'News & Articles', addLabel: '+ New Article',
      cols: ['Headline', 'Author', 'Updated', 'Status', ''],
      colsCss: '2.4fr 1fr 1fr 0.9fr 0.7fr',
      filter: (q, r) => match(q, r.title, r.author),
      cells: (r) => [r.title, r.author, r.dateLabel, badgePill(r.status)]
    },
    pages: {
      heading: 'Content Pages', addLabel: '+ New Page',
      cols: ['Page', 'Owner', 'Updated', 'Status', ''],
      colsCss: '2.4fr 1fr 1fr 0.9fr 0.7fr',
      filter: (q, r) => match(q, r.title, r.owner),
      cells: (r) => [r.title, r.owner, r.date, badgePill(r.status)]
    },
    events: {
      heading: 'Upcoming Events', addLabel: '+ Add Event',
      cols: ['Title', 'Location', 'Dates', 'Region', ''],
      colsCss: '2.2fr 1.3fr 1fr 0.9fr 0.7fr',
      filter: (q, r) => match(q, r.title, r.location),
      cells: (r) => [r.title, r.location, r.datesLabel, regionPill(r.category)]
    },
    resources: {
      heading: 'Resources', addLabel: '↑ Upload',
      cols: ['Title', 'Category', 'Published', 'Status', ''],
      colsCss: '2.2fr 1.2fr 1fr 0.9fr 0.7fr',
      filter: (q, r) => match(q, r.title, r.category),
      cells: (r) => [r.title, r.category || '—', r.dateLabel, badgePill(r.status)],
      onAdd: () => openResourceModal('create'),
      onEdit: (r) => openResourceModal('edit', r)
    },
    subs: {
      heading: 'Subscribers', addLabel: '↓ Export CSV',
      cols: ['Name', 'Email', 'Region', 'Joined', ''],
      colsCss: '1.4fr 2fr 1fr 1fr 0.7fr',
      filter: (q, r) => match(q, r.name, r.email, r.region),
      cells: (r) => [r.name, r.email, r.region, r.date],
      onAdd: () => { window.location.href = '/api/admin/subscribers-export.php'; }
    }
  };

  function renderTable(key, rows) {
    const cfg = TABLE_CONFIG[key];
    const filtered = rows.filter((r) => cfg.filter(state.search, r));
    els.content.innerHTML = `
      <div class="panel">
        <div class="table-panel-head">
          <div class="panel-head-title">${Util.escapeHtml(cfg.heading)}</div>
          <span class="table-count">${filtered.length} items</span>
          <button class="table-add-btn" id="tableAddBtn">${Util.escapeHtml(cfg.addLabel)}</button>
        </div>
        <div class="data-table-head" style="grid-template-columns:${cfg.colsCss};">
          ${cfg.cols.map((c) => `<div>${Util.escapeHtml(c)}</div>`).join('')}
        </div>
        <div id="tableRows"></div>
        ${filtered.length === 0 ? `<div class="table-empty">No items match "${Util.escapeHtml(state.search)}".</div>` : ''}
      </div>
    `;
    const rowsHtml = filtered.map((r, i) => {
      const cells = cfg.cells(r);
      return `<div class="data-row" style="grid-template-columns:${cfg.colsCss};" data-idx="${i}">
        ${cells.map((c, ci) => `<div${ci === 0 ? ' style="font-weight:600;color:var(--text-dark);"' : ' style="color:var(--text-muted);"'}>${typeof c === 'string' && c.startsWith('<span') ? c : Util.escapeHtml(c)}</div>`).join('')}
        <button class="edit-btn" data-idx="${i}">Edit</button>
      </div>`;
    }).join('');
    document.getElementById('tableRows').innerHTML = rowsHtml;

    if (cfg.onAdd) document.getElementById('tableAddBtn').addEventListener('click', cfg.onAdd);
    if (cfg.onEdit) {
      document.getElementById('tableRows').querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', () => cfg.onEdit(filtered[Number(btn.dataset.idx)]));
      });
    }
  }

  // ---------- Messages ----------
  function renderMessages(rows) {
    els.content.innerHTML = `
      <div class="panel">
        <div style="padding:15px 20px;border-bottom:1px solid var(--border-cream-2);font-size:16px;font-weight:600;">Inbox — ${rows.length} messages</div>
        ${rows.map((m) => `<div class="inbox-row">
          <div class="inbox-avatar">${Util.escapeHtml(m.initials)}</div>
          <div style="min-width:0;flex:1;">
            <div style="display:flex;gap:10px;align-items:center;"><span style="font-weight:600;font-size:14.5px;">${Util.escapeHtml(m.name)}</span><span style="font-size:12px;color:var(--text-mute-4);">${Util.escapeHtml(m.email)}</span></div>
            <div style="font-size:14px;color:var(--text-body);margin-top:5px;line-height:1.5;">${Util.escapeHtml(m.preview)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
            <span style="font-size:11.5px;color:var(--text-mute-4);">${Util.escapeHtml(m.time)}</span>
            <button class="reply-btn">${m.replied ? 'Replied' : 'Reply'}</button>
          </div>
        </div>`).join('')}
      </div>
    `;
  }

  // ---------- Media ----------
  function renderMedia(tiles) {
    els.content.innerHTML = `
      <div class="panel" style="padding:20px;">
        <div style="display:flex;align-items:center;margin-bottom:16px;">
          <div class="panel-head-title">Media Library</div>
          <button class="upload-btn" id="uploadBtn">↑ Upload</button>
          <input type="file" id="uploadInput" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;">
        </div>
        <div class="media-grid" id="mediaGrid"></div>
        <p class="form-error" id="uploadError" style="display:none;margin-top:12px;"></p>
      </div>
    `;
    renderMediaGrid(tiles);
    const input = document.getElementById('uploadInput');
    document.getElementById('uploadBtn').addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      const errorEl = document.getElementById('uploadError');
      errorEl.style.display = 'none';
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/admin/media.php', { method: 'POST', body: fd, credentials: 'same-origin' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');
        state.cache.media = [data, ...state.cache.media];
        renderMediaGrid(state.cache.media);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
      input.value = '';
    });
  }
  function renderMediaGrid(tiles) {
    document.getElementById('mediaGrid').innerHTML = tiles.map((t) => `
      <div class="media-tile">
        <div class="media-thumb" style="background-image:url('${Util.escapeHtml(t.src)}')"></div>
        <div class="media-name">${Util.escapeHtml(t.name)}</div>
      </div>
    `).join('');
  }

  // ---------- Settings ----------
  function renderSettings(s) {
    els.content.innerHTML = `
      <div class="settings-card">
        <div class="settings-title">Organization settings</div>
        <form id="settingsForm" style="display:flex;flex-direction:column;gap:18px;">
          <div class="settings-field"><label>ORGANIZATION NAME</label><input id="setOrgName" value="${Util.escapeHtml(s.orgName)}"></div>
          <div class="settings-field"><label>PUBLIC EMAIL</label><input id="setEmail" value="${Util.escapeHtml(s.publicEmail)}"></div>
          <div class="settings-field"><label>PHONE</label><input id="setPhone" value="${Util.escapeHtml(s.phone)}"></div>
          <div class="settings-field"><label>ADDRESS</label><input id="setAddress" value="${Util.escapeHtml(s.address)}"></div>
          <div class="settings-toggle-row">
            <div><div style="font-weight:600;font-size:14px;">Weekly Monday Manna email</div><div style="font-size:12.5px;color:var(--text-mute-3);">Auto-send every Monday at 6:00 AM</div></div>
            <button type="button" class="toggle-switch" id="mannaToggle" style="background:${s.mannaEmailEnabled ? '#1a8a3e' : '#d2d2d7'};">
              <span class="toggle-knob" style="left:${s.mannaEmailEnabled ? '23px' : '3px'};"></span>
            </button>
          </div>
          <button type="submit" class="btn btn-gold" style="align-self:flex-start;margin-top:4px;">Save changes</button>
          <p class="form-error" id="settingsError" style="display:none;"></p>
          <p class="success-text" id="settingsSaved" style="display:none;color:var(--green);font-weight:600;">Saved.</p>
        </form>
      </div>
    `;
    document.getElementById('mannaToggle').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const res = await Api.post('/api/admin/settings-toggle-manna.php');
      btn.style.background = res.mannaEmailEnabled ? '#1a8a3e' : '#d2d2d7';
      btn.querySelector('.toggle-knob').style.left = res.mannaEmailEnabled ? '23px' : '3px';
      state.cache.settings.mannaEmailEnabled = res.mannaEmailEnabled;
    });
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('settingsError');
      const savedEl = document.getElementById('settingsSaved');
      errorEl.style.display = 'none'; savedEl.style.display = 'none';
      try {
        await Api.put('/api/admin/settings.php', {
          orgName: document.getElementById('setOrgName').value.trim(),
          publicEmail: document.getElementById('setEmail').value.trim(),
          phone: document.getElementById('setPhone').value.trim(),
          address: document.getElementById('setAddress').value.trim()
        });
        savedEl.style.display = 'block';
      } catch (err) {
        errorEl.textContent = err.message || 'Could not save settings.';
        errorEl.style.display = 'block';
      }
    });
  }

  // ---------- Compose modal (Monday Manna create/edit) ----------
  function openCompose(mode, row) {
    state.compose = { mode, id: row ? row.id : null };
    els.composeTitle.textContent = mode === 'edit' ? 'Edit Monday Manna' : 'New Monday Manna';
    els.composeBody.innerHTML = `
      <form id="composeForm" style="display:flex;flex-direction:column;gap:16px;">
        <div><label class="field-label">TITLE</label><input class="field-input" required id="composeFieldTitle" placeholder="e.g. When Excellence Becomes Worship"></div>
        <div><label class="field-label">AUTHOR</label><input class="field-input" required id="composeFieldAuthor" placeholder="e.g. Robert J. Tamasy"></div>
        <div><label class="field-label">DEVOTIONAL BODY</label><textarea class="field-input" id="composeFieldBody" placeholder="Write the meditation…"></textarea></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="composeCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">${mode === 'edit' ? 'Save changes' : 'Save draft'}</button>
        </div>
        <p class="form-error" id="composeError" style="display:none;"></p>
      </form>
    `;
    if (mode === 'edit' && row) {
      document.getElementById('composeFieldTitle').value = row.title;
      document.getElementById('composeFieldAuthor').value = row.author;
      document.getElementById('composeFieldBody').value = (row.blocks && row.blocks[0] && row.blocks[0].x) || '';
    }
    document.getElementById('composeCancel').addEventListener('click', closeCompose);
    document.getElementById('composeForm').addEventListener('submit', submitCompose);
    els.composeModal.classList.add('open');
  }

  function closeCompose() {
    els.composeModal.classList.remove('open');
  }

  async function submitCompose(e) {
    e.preventDefault();
    const errorEl = document.getElementById('composeError');
    errorEl.style.display = 'none';
    const payload = {
      title: document.getElementById('composeFieldTitle').value.trim(),
      author: document.getElementById('composeFieldAuthor').value.trim(),
      body: document.getElementById('composeFieldBody').value.trim()
    };
    try {
      if (state.compose.mode === 'edit') {
        await Api.put(`/api/admin/devotional.php?id=${state.compose.id}`, payload);
      } else {
        await Api.post('/api/admin/devotionals.php', payload);
      }
      els.composeBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">${state.compose.mode === 'edit' ? 'Changes saved' : 'Draft saved'}</div>
          <p class="success-text">"${Util.escapeHtml(payload.title)}" ${state.compose.mode === 'edit' ? 'was updated.' : 'was added to your Monday Manna list.'}</p>
          <button class="btn btn-navy" id="composeDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('composeDoneBtn').addEventListener('click', async () => {
        closeCompose();
        if (state.section === 'manna') await loadSection('manna');
        await refreshMsgBadge();
      });
    } catch (err) {
      errorEl.textContent = err.message || 'Could not save this devotional.';
      errorEl.style.display = 'block';
    }
  }

  // ---------- Resource upload/edit modal ----------
  let resourceState = { mode: null, id: null };

  function openResourceModal(mode, row) {
    resourceState = { mode, id: row ? row.id : null };
    els.resourceModalTitle.textContent = mode === 'edit' ? 'Edit Resource' : 'New Resource';
    const sourceType = row && row.sourceType === 'link' ? 'link' : 'file';
    const currentNote = row && row.sourceType === 'file'
      ? `Current file: <strong>${Util.escapeHtml(row.fileName || 'uploaded file')}</strong>. Choose a new one to replace it, or leave blank to keep it.`
      : '';

    els.resourceModalBody.innerHTML = `
      <form id="resourceForm" style="display:flex;flex-direction:column;gap:16px;">
        <div><label class="field-label">TITLE</label><input class="field-input" required id="resFieldTitle" placeholder="e.g. Connect3 Starter Guide"></div>
        <div><label class="field-label">DESCRIPTION</label><textarea class="field-input" id="resFieldDescription" placeholder="What is this resource, and who is it for?"></textarea></div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">CATEGORY</label><input class="field-input" id="resFieldCategory" placeholder="e.g. Ministry Guide"></div>
          <div style="flex:1;"><label class="field-label">PUBLISHED DATE</label><input class="field-input" type="date" id="resFieldDate"></div>
        </div>
        <div><label class="field-label">STATUS</label>
          <select class="field-input" id="resFieldStatus">
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>
        <div>
          <label class="field-label">SOURCE</label>
          <div style="display:flex;gap:16px;font-size:14px;color:var(--text-body);margin-bottom:10px;">
            <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="resSourceType" value="file" ${sourceType === 'file' ? 'checked' : ''}> Upload a file</label>
            <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="resSourceType" value="link" ${sourceType === 'link' ? 'checked' : ''}> External link</label>
          </div>
          <div id="resFileWrap" style="${sourceType === 'file' ? '' : 'display:none;'}">
            <input type="file" class="field-input" id="resFieldFile" accept=".pdf,.doc,.docx,.xls,.xlsx">
          </div>
          <div id="resLinkWrap" style="${sourceType === 'link' ? '' : 'display:none;'}">
            <input class="field-input" id="resFieldUrl" placeholder="https://…">
          </div>
          ${currentNote ? `<p style="font-size:12.5px;color:var(--text-mute-3);margin-top:8px;">${currentNote}</p>` : ''}
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="resourceCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">${mode === 'edit' ? 'Save changes' : 'Save resource'}</button>
        </div>
        <p class="form-error" id="resourceError" style="display:none;"></p>
      </form>
    `;

    if (mode === 'edit' && row) {
      document.getElementById('resFieldTitle').value = row.title;
      document.getElementById('resFieldDescription').value = row.description || '';
      document.getElementById('resFieldCategory').value = row.category || '';
      document.getElementById('resFieldDate').value = row.date || '';
      document.getElementById('resFieldStatus').value = row.status === 'Published' ? 'Published' : 'Draft';
      if (row.sourceType === 'link') document.getElementById('resFieldUrl').value = row.externalUrl || '';
    }

    document.querySelectorAll('input[name="resSourceType"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        document.getElementById('resFileWrap').style.display = radio.value === 'file' && radio.checked ? '' : 'none';
        document.getElementById('resLinkWrap').style.display = radio.value === 'link' && radio.checked ? '' : 'none';
      });
    });

    document.getElementById('resourceCancel').addEventListener('click', closeResourceModal);
    document.getElementById('resourceForm').addEventListener('submit', submitResourceForm);
    els.resourceModal.classList.add('open');
  }

  function closeResourceModal() {
    els.resourceModal.classList.remove('open');
  }

  async function submitResourceForm(e) {
    e.preventDefault();
    const errorEl = document.getElementById('resourceError');
    errorEl.style.display = 'none';

    const title = document.getElementById('resFieldTitle').value.trim();
    const sourceType = document.querySelector('input[name="resSourceType"]:checked').value;
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', document.getElementById('resFieldDescription').value.trim());
    fd.append('category', document.getElementById('resFieldCategory').value.trim());
    fd.append('publishedDate', document.getElementById('resFieldDate').value);
    fd.append('status', document.getElementById('resFieldStatus').value);
    fd.append('sourceType', sourceType);
    if (sourceType === 'file') {
      const fileInput = document.getElementById('resFieldFile');
      if (fileInput.files[0]) fd.append('file', fileInput.files[0]);
    } else {
      fd.append('externalUrl', document.getElementById('resFieldUrl').value.trim());
    }

    const url = resourceState.mode === 'edit'
      ? `/api/admin/resources.php?id=${resourceState.id}`
      : '/api/admin/resources.php';

    try {
      const res = await fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save this resource.');

      els.resourceModalBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">${resourceState.mode === 'edit' ? 'Changes saved' : 'Resource saved'}</div>
          <p class="success-text">"${Util.escapeHtml(title)}" ${resourceState.mode === 'edit' ? 'was updated.' : 'was added to your Resources list.'}</p>
          <button class="btn btn-navy" id="resourceDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('resourceDoneBtn').addEventListener('click', async () => {
        closeResourceModal();
        if (state.section === 'resources') await loadSection('resources');
      });
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }

  init();
})();
