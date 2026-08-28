(function () {
  const NAV = [
    { key: 'dash', label: 'Dashboard' },
    { key: 'pages', label: 'Content Pages' },
    { key: 'leaders', label: 'Leadership Team' },
    { key: 'manna', label: 'Monday Manna' },
    { key: 'news', label: 'News & Articles' },
    { key: 'events', label: 'Events' },
    { key: 'resources', label: 'Resources' },
    { key: 'prayer', label: 'Prayer Page' },
    { key: 'subs', label: 'Subscribers' },
    { key: 'msgs', label: 'Contact Messages' },
    { key: 'media', label: 'Media Library' },
    { key: 'activity', label: 'Activity Log' },
    { key: 'settings', label: 'Settings' }
  ];

  const META = {
    dash: { title: 'Dashboard', subtitle: "Welcome back — here's what's happening across CBMC Africa." },
    pages: { title: 'Content Pages', subtitle: 'Manage the static pages of the public site.' },
    leaders: { title: 'Leadership Team', subtitle: 'Photos, bios and contact details shown on the public Leadership page.' },
    manna: { title: 'Monday Manna', subtitle: 'Create, schedule and publish weekly devotionals.' },
    news: { title: 'News & Articles', subtitle: 'Featured stories from across the movement.' },
    events: { title: 'Events', subtitle: 'Summits, forums, trainings and gatherings.' },
    resources: { title: 'Resources', subtitle: 'Downloadable studies, guides and media.' },
    prayer: { title: 'Prayer Page', subtitle: 'The cards shown on the public Prayer page.' },
    subs: { title: 'Subscribers', subtitle: 'People receiving the weekly Monday Manna email.' },
    msgs: { title: 'Contact Messages', subtitle: 'Enquiries submitted through the public site.' },
    media: { title: 'Media Library', subtitle: 'Images and files used across the site.' },
    activity: { title: 'Activity Log', subtitle: 'Everything happening across the site — by staff and by visitors.' },
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
    compose: { mode: null, id: null, type: 'manna' }
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
    resourceModalBody: document.getElementById('resourceModalBody'),
    eventComposeModal: document.getElementById('eventComposeModal'),
    eventComposeClose: document.getElementById('eventComposeClose'),
    eventComposeTitle: document.getElementById('eventComposeTitle'),
    eventComposeBody: document.getElementById('eventComposeBody'),
    leaderModal: document.getElementById('leaderModal'),
    leaderModalClose: document.getElementById('leaderModalClose'),
    leaderModalTitle: document.getElementById('leaderModalTitle'),
    leaderModalBody: document.getElementById('leaderModalBody'),
    replyModal: document.getElementById('replyModal'),
    replyModalClose: document.getElementById('replyModalClose'),
    replyModalTitle: document.getElementById('replyModalTitle'),
    replyModalBody: document.getElementById('replyModalBody'),
    prayerModal: document.getElementById('prayerModal'),
    prayerModalClose: document.getElementById('prayerModalClose'),
    prayerModalTitle: document.getElementById('prayerModalTitle'),
    prayerModalBody: document.getElementById('prayerModalBody')
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

    document.getElementById('signOutBtn').addEventListener('click', async () => {
      try {
        await Api.post('/api/admin/logout.php');
      } catch (e) {
        // Sign out locally regardless - the session cookie is cleared server-side on success,
        // and sending the user to the login screen is the right outcome either way.
      }
      window.location.href = 'login.html';
    });

    els.searchForm.addEventListener('submit', (e) => e.preventDefault());
    els.searchInput.addEventListener('input', () => {
      state.search = els.searchInput.value;
      renderCurrentSection();
    });
    els.newMannaBtn.addEventListener('click', () => openCompose('create', null, 'manna'));
    els.composeClose.addEventListener('click', closeCompose);
    els.composeModal.addEventListener('click', (e) => { if (e.target === els.composeModal) closeCompose(); });
    els.resourceModalClose.addEventListener('click', closeResourceModal);
    els.resourceModal.addEventListener('click', (e) => { if (e.target === els.resourceModal) closeResourceModal(); });
    els.eventComposeClose.addEventListener('click', closeEventModal);
    els.eventComposeModal.addEventListener('click', (e) => { if (e.target === els.eventComposeModal) closeEventModal(); });
    els.leaderModalClose.addEventListener('click', closeLeaderModal);
    els.leaderModal.addEventListener('click', (e) => { if (e.target === els.leaderModal) closeLeaderModal(); });
    els.replyModalClose.addEventListener('click', closeReplyModal);
    els.replyModal.addEventListener('click', (e) => { if (e.target === els.replyModal) closeReplyModal(); });
    els.prayerModalClose.addEventListener('click', closePrayerModal);
    els.prayerModal.addEventListener('click', (e) => { if (e.target === els.prayerModal) closePrayerModal(); });
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
      leaders: '/api/admin/leaders.php',
      resources: '/api/admin/resources.php',
      prayer: '/api/admin/prayer-cards.php',
      subs: '/api/admin/subscribers.php',
      msgs: '/api/admin/messages.php',
      media: '/api/admin/media.php',
      activity: '/api/admin/activity.php',
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
    if (key === 'activity') return renderActivity(data);
    if (key === 'settings') return renderSettings(data);
    return renderTable(key, data);
  }

  function match(q, ...fields) {
    if (!q) return true;
    const needle = q.trim().toLowerCase();
    return fields.some((f) => String(f || '').toLowerCase().includes(needle));
  }

  async function reloadCurrentTable() {
    state.cache[state.section] = await fetchSectionData(state.section);
    renderCurrentSection();
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
      colsCss: '2fr 1fr 1fr 0.9fr 1.1fr',
      filter: (q, r) => match(q, r.title, r.author),
      cells: (r) => [r.title, r.author, r.dateLabel, badgePill(r.status)],
      onAdd: () => openCompose('create', null, 'manna'),
      onEdit: (r) => openCompose('edit', r, 'manna'),
      onDelete: (r) => deleteItem(`/api/admin/devotional.php?id=${r.id}`, r.title)
    },
    news: {
      heading: 'News & Articles', addLabel: '+ New Article',
      cols: ['Headline', 'Author', 'Updated', 'Status', ''],
      colsCss: '2fr 1fr 1fr 0.9fr 1.1fr',
      filter: (q, r) => match(q, r.title, r.author),
      cells: (r) => [r.title, r.author, r.dateLabel, badgePill(r.status)],
      onAdd: () => openCompose('create', null, 'news'),
      onEdit: (r) => openCompose('edit', r, 'news'),
      onDelete: (r) => deleteItem(`/api/admin/news-item.php?id=${r.id}`, r.title)
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
      colsCss: '2fr 1.2fr 1fr 0.9fr 1.1fr',
      filter: (q, r) => match(q, r.title, r.location),
      cells: (r) => [r.title, r.location, r.datesLabel, regionPill(r.category)],
      onAdd: () => openEventModal('create'),
      onEdit: (r) => openEventModal('edit', r),
      onDelete: (r) => deleteItem(`/api/admin/event.php?id=${r.id}`, r.title)
    },
    resources: {
      heading: 'Resources', addLabel: '↑ Upload',
      cols: ['Title', 'Category', 'Published', 'Status', ''],
      colsCss: '2fr 1.1fr 1fr 0.9fr 1.1fr',
      filter: (q, r) => match(q, r.title, r.category),
      cells: (r) => [r.title, r.category || '—', r.dateLabel, badgePill(r.status)],
      onAdd: () => openResourceModal('create'),
      onEdit: (r) => openResourceModal('edit', r),
      onDelete: (r) => deleteItem(`/api/admin/resources.php?id=${r.id}`, r.title)
    },
    prayer: {
      heading: 'Prayer Page Cards', addLabel: '+ Add Card',
      cols: ['Title', 'Status', ''],
      colsCss: '3fr 1fr 1.1fr',
      filter: (q, r) => match(q, r.title),
      cells: (r) => [r.title, badgePill(r.status)],
      onAdd: () => openPrayerModal('create'),
      onEdit: (r) => openPrayerModal('edit', r),
      onDelete: (r) => deleteItem(`/api/admin/prayer-card.php?id=${r.id}`, r.title)
    },
    leaders: {
      heading: 'Leadership Team', addLabel: '+ Add Leader',
      cols: ['Name', 'Title', 'Region', 'Status', ''],
      colsCss: '2fr 1.4fr 1.1fr 0.9fr 1.1fr',
      filter: (q, r) => match(q, r.name, r.title, r.region),
      cells: (r) => [
        `<span style="display:flex;align-items:center;gap:10px;"><span style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${r.photo ? `url('${Util.escapeHtml(r.photo)}') center/cover` : '#f0f0f2'};"></span>${Util.escapeHtml(r.name)}</span>`,
        r.title || '—', r.region || '—', badgePill(r.status)
      ],
      onAdd: () => openLeaderModal('create'),
      onEdit: (r) => openLeaderModal('edit', r),
      onDelete: (r) => deleteItem(`/api/admin/leaders.php?id=${r.id}`, r.name)
    },
    subs: {
      heading: 'Subscribers', addLabel: '↓ Export CSV',
      cols: ['Name', 'Email', 'Region', 'Joined', ''],
      colsCss: '1.3fr 1.8fr 1fr 1fr 0.7fr',
      filter: (q, r) => match(q, r.name, r.email, r.region),
      cells: (r) => [r.name, r.email, r.region, r.date],
      onAdd: () => { window.location.href = '/api/admin/subscribers-export.php'; },
      onDelete: (r) => deleteItem(`/api/admin/subscriber.php?id=${r.id}`, r.name, 'Remove')
    }
  };

  async function deleteItem(url, label, verb) {
    if (!confirm(`${verb || 'Delete'} "${label}"? This can't be undone.`)) return;
    try {
      const res = await fetch(url, { method: 'DELETE', credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not delete this item.');
      await reloadCurrentTable();
      await refreshMsgBadge();
    } catch (err) {
      alert(err.message);
    }
  }

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
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          ${cfg.onEdit ? `<button class="edit-btn" data-act="edit" data-idx="${i}">Edit</button>` : ''}
          ${cfg.onDelete ? `<button class="edit-btn" data-act="delete" data-idx="${i}" style="background:#fdecea;color:#c0362c;">Delete</button>` : ''}
        </div>
      </div>`;
    }).join('');
    document.getElementById('tableRows').innerHTML = rowsHtml;

    if (cfg.onAdd) document.getElementById('tableAddBtn').addEventListener('click', cfg.onAdd);
    document.getElementById('tableRows').querySelectorAll('[data-act="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => cfg.onEdit(filtered[Number(btn.dataset.idx)]));
    });
    document.getElementById('tableRows').querySelectorAll('[data-act="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => cfg.onDelete(filtered[Number(btn.dataset.idx)]));
    });
  }

  // ---------- Messages ----------
  function renderMessages(rows) {
    els.content.innerHTML = `
      <div class="panel">
        <div style="padding:15px 20px;border-bottom:1px solid var(--border-cream-2);font-size:16px;font-weight:600;">Inbox — ${rows.length} messages</div>
        <div id="inboxRows"></div>
      </div>
    `;
    renderInboxRows(rows);
  }

  function renderInboxRows(rows) {
    document.getElementById('inboxRows').innerHTML = rows.map((m) => `
      <div class="inbox-row">
        <div class="inbox-avatar">${Util.escapeHtml(m.initials)}</div>
        <div style="min-width:0;flex:1;">
          <div style="display:flex;gap:10px;align-items:center;"><span style="font-weight:600;font-size:14.5px;">${Util.escapeHtml(m.name)}</span><span style="font-size:12px;color:var(--text-mute-4);">${Util.escapeHtml(m.email)}</span></div>
          <div style="font-size:14px;color:var(--text-body);margin-top:5px;line-height:1.5;">${Util.escapeHtml(m.preview)}</div>
          ${m.replied ? `<div style="font-size:12.5px;color:var(--text-mute-3);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-cream-2);"><strong style="color:var(--green);">Replied${m.repliedAt ? ' · ' + Util.escapeHtml(m.repliedAt) : ''}:</strong> ${Util.escapeHtml(m.replyBody || '')}</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
          <span style="font-size:11.5px;color:var(--text-mute-4);">${Util.escapeHtml(m.time)}</span>
          <button class="reply-btn" data-id="${m.id}">${m.replied ? 'Reply again' : 'Reply'}</button>
        </div>
      </div>
    `).join('');
    document.getElementById('inboxRows').querySelectorAll('.reply-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = rows.find((r) => String(r.id) === btn.dataset.id);
        if (row) openReplyModal(row);
      });
    });
  }

  // ---------- Reply to contact message modal ----------
  let replyState = { id: null };

  function openReplyModal(row) {
    replyState = { id: row.id };
    els.replyModalTitle.textContent = `Reply to ${row.name}`;
    els.replyModalBody.innerHTML = `
      <form id="replyForm" style="display:flex;flex-direction:column;gap:16px;">
        <div>
          <label class="field-label">TO</label>
          <div style="font-size:14px;color:var(--text-body);padding:10px 0;">${Util.escapeHtml(row.name)} &lt;${Util.escapeHtml(row.email)}&gt;</div>
        </div>
        <div>
          <label class="field-label">THEIR MESSAGE</label>
          <div style="font-size:13.5px;color:var(--text-mute-3);background:var(--cream);border-radius:12px;padding:12px 14px;line-height:1.5;max-height:120px;overflow:auto;">${Util.escapeHtml(row.preview)}</div>
        </div>
        <div><label class="field-label">YOUR REPLY</label><textarea class="field-input" required id="replyFieldBody" placeholder="Write your reply…">${row.replied ? Util.escapeHtml(row.replyBody || '') : ''}</textarea></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="replyCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Send reply</button>
        </div>
        <p class="form-error" id="replyError" style="display:none;"></p>
      </form>
    `;
    document.getElementById('replyCancel').addEventListener('click', closeReplyModal);
    document.getElementById('replyForm').addEventListener('submit', submitReply);
    els.replyModal.classList.add('open');
  }

  function closeReplyModal() {
    els.replyModal.classList.remove('open');
  }

  async function submitReply(e) {
    e.preventDefault();
    const errorEl = document.getElementById('replyError');
    errorEl.style.display = 'none';
    const body = document.getElementById('replyFieldBody').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      await Api.post(`/api/admin/message-reply.php?id=${replyState.id}`, { body });
      els.replyModalBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">Reply sent</div>
          <p class="success-text">Your email has been sent.</p>
          <button class="btn btn-navy" id="replyDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('replyDoneBtn').addEventListener('click', async () => {
        closeReplyModal();
        if (state.section === 'msgs') await reloadCurrentTable();
        await refreshMsgBadge();
      });
    } catch (err) {
      submitBtn.disabled = false;
      errorEl.textContent = err.message || 'Could not send this reply.';
      errorEl.style.display = 'block';
    }
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
        <div class="media-name" style="display:flex;align-items:center;gap:6px;">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${Util.escapeHtml(t.name)}</span>
          ${t.id ? `<button data-id="${t.id}" class="media-delete-btn" style="color:#c0362c;font-weight:700;flex-shrink:0;">✕</button>` : ''}
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.media-delete-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this file from the media library?')) return;
        try {
          const res = await fetch(`/api/admin/media.php?id=${btn.dataset.id}`, { method: 'DELETE', credentials: 'same-origin' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Could not delete this file.');
          state.cache.media = state.cache.media.filter((t) => String(t.id) !== btn.dataset.id);
          renderMediaGrid(state.cache.media);
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  // ---------- Activity Log ----------
  const ACTION_COLORS = {
    created: '#1a8a3e', uploaded: '#1a8a3e', 'signed in': '#0071e3', sent: '#0071e3',
    subscribed: '#1a8a3e', updated: '#8a6d1a', enabled: '#1a8a3e',
    deleted: '#c0362c', removed: '#c0362c', disabled: '#c0362c',
    'failed sign-in attempt': '#c0362c'
  };

  function actionColor(action) {
    if (ACTION_COLORS[action]) return ACTION_COLORS[action];
    const key = Object.keys(ACTION_COLORS).find((k) => action.startsWith(k));
    return key ? ACTION_COLORS[key] : 'var(--text-muted)';
  }

  function renderActivity(rows) {
    const filtered = rows.filter((r) => match(state.search, r.actor, r.action, r.entityType, r.entityLabel));
    els.content.innerHTML = `
      <div class="panel">
        <div style="padding:15px 20px;border-bottom:1px solid var(--border-cream-2);display:flex;align-items:center;">
          <div style="font-size:16px;font-weight:600;">Recent activity</div>
          <span class="table-count" style="margin-left:10px;">${filtered.length} entries</span>
        </div>
        <div id="activityRows"></div>
        ${filtered.length === 0 ? `<div class="table-empty">${state.search ? `No activity matches "${Util.escapeHtml(state.search)}".` : 'No activity recorded yet.'}</div>` : ''}
      </div>
    `;
    document.getElementById('activityRows').innerHTML = filtered.map((r) => `
      <div class="inbox-row">
        <div class="inbox-avatar">${Util.escapeHtml(r.initials || '?')}</div>
        <div style="min-width:0;flex:1;">
          <div style="font-size:14.5px;color:var(--text-body);line-height:1.5;">
            <span style="font-weight:600;color:var(--text-dark);">${Util.escapeHtml(r.actor)}</span>
            <span style="color:${actionColor(r.action)};font-weight:600;"> ${Util.escapeHtml(r.action)} </span>
            <span style="color:var(--text-muted);">${Util.escapeHtml(r.entityType)}</span>
            ${r.entityLabel ? `<span style="color:var(--text-mute-3);"> — ${Util.escapeHtml(r.entityLabel)}</span>` : ''}
          </div>
        </div>
        <span style="font-size:11.5px;color:var(--text-mute-4);flex-shrink:0;">${Util.escapeHtml(r.time)}</span>
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
            <div><div style="font-weight:600;font-size:14px;">Weekly Monday Manna email</div><div style="font-size:12.5px;color:var(--text-mute-3);">Auto-send every Monday at 6:00 AM (requires a cron job on your host — see cron/send-manna.php)</div></div>
            <button type="button" class="toggle-switch" id="mannaToggle" style="background:${s.mannaEmailEnabled ? '#1a8a3e' : '#d2d2d7'};">
              <span class="toggle-knob" style="left:${s.mannaEmailEnabled ? '23px' : '3px'};"></span>
            </button>
          </div>
          <button type="submit" class="btn btn-gold" style="align-self:flex-start;margin-top:4px;">Save changes</button>
          <p class="form-error" id="settingsError" style="display:none;"></p>
          <p class="success-text" id="settingsSaved" style="display:none;color:var(--green);font-weight:600;">Saved.</p>
        </form>
        <div style="border-top:1px solid var(--border-cream-2);margin-top:22px;padding-top:18px;">
          <div style="font-weight:600;font-size:14px;">Send this week's Monday Manna now</div>
          <p style="font-size:12.5px;color:var(--text-mute-3);margin-top:4px;">Emails the newest published devotional that hasn't been sent yet. Safe to click — already-sent devotionals are skipped automatically.</p>
          <button type="button" class="btn btn-navy" id="mannaSendNowBtn" style="margin-top:10px;">Send now</button>
          <p id="mannaSendResult" style="font-size:13px;margin-top:10px;"></p>
        </div>
      </div>

      <div class="settings-card" style="margin-top:20px;">
        <div class="settings-title">Homepage hero</div>
        <p style="font-size:13px;color:var(--text-mute-3);margin-top:-10px;margin-bottom:4px;">The full-width banner behind the headline on your homepage. Use an image, or a short looping video.</p>
        <form id="heroForm" style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label class="field-label">TYPE</label>
            <div style="display:flex;gap:16px;font-size:14px;color:var(--text-body);margin-top:6px;">
              <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="heroType" value="image" ${s.heroType !== 'video' ? 'checked' : ''}> Image</label>
              <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="heroType" value="video" ${s.heroType === 'video' ? 'checked' : ''}> Video</label>
            </div>
          </div>
          <div><label class="field-label">UPLOAD A FILE</label><input type="file" class="field-input" id="heroFieldFile"></div>
          <div><label class="field-label">…OR AN EXTERNAL URL</label><input class="field-input" id="heroFieldUrl" placeholder="https://…/banner.jpg or .mp4"></div>
          <p style="font-size:12.5px;color:var(--text-mute-3);margin-top:-8px;">
            ${s.heroUrl ? `Current: <a href="${Util.escapeHtml(s.heroUrl)}" target="_blank" rel="noopener">${Util.escapeHtml(s.heroUrl)}</a>` : 'No custom hero set yet — the site is showing its default banner.'}
            Videos larger than a few MB may exceed your host's upload limit — an external URL avoids that.
          </p>
          <button type="submit" class="btn btn-gold" style="align-self:flex-start;">Save hero</button>
          <p class="form-error" id="heroError" style="display:none;"></p>
          <p class="success-text" id="heroSaved" style="display:none;color:var(--green);font-weight:600;">Saved.</p>
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
    document.getElementById('mannaSendNowBtn').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const resultEl = document.getElementById('mannaSendResult');
      btn.disabled = true;
      resultEl.style.color = 'var(--text-mute-3)';
      resultEl.textContent = 'Sending…';
      try {
        const res = await Api.post('/api/admin/manna-send-now.php');
        if (!res.sent) {
          const reasons = {
            disabled: 'Weekly email is turned off above — enable it first.',
            nothing_due: 'Nothing to send — no new published devotional waiting to go out.',
            no_subscribers: 'No subscribers to send to yet.'
          };
          resultEl.textContent = reasons[res.reason] || 'Nothing was sent.';
        } else {
          const allFailed = res.devotionals.every((d) => d.sent === 0 && d.failed > 0);
          resultEl.style.color = allFailed ? '#c0362c' : 'var(--green)';
          resultEl.textContent = res.devotionals.map((d) => `${d.sent === 0 && d.failed > 0 ? 'Could not send' : 'Sent'} "${d.title}" to ${d.sent} subscriber(s)${d.failed ? `, ${d.failed} failed` : ''}.`).join(' ')
            + (allFailed ? ' Your server’s mail (PHP mail()/sendmail) may not be configured yet - check with your host. This devotional will be retried next time.' : '');
        }
      } catch (err) {
        resultEl.style.color = '#c0362c';
        resultEl.textContent = err.message || 'Could not send right now.';
      } finally {
        btn.disabled = false;
      }
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
    document.getElementById('heroForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('heroError');
      const savedEl = document.getElementById('heroSaved');
      errorEl.style.display = 'none'; savedEl.style.display = 'none';
      const fd = new FormData();
      fd.append('heroType', document.querySelector('input[name="heroType"]:checked').value);
      fd.append('heroUrl', document.getElementById('heroFieldUrl').value.trim());
      const fileInput = document.getElementById('heroFieldFile');
      if (fileInput.files[0]) fd.append('heroFile', fileInput.files[0]);
      try {
        const res = await fetch('/api/admin/hero.php', { method: 'POST', body: fd, credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not save the hero.');
        state.cache.settings.heroType = data.heroType;
        state.cache.settings.heroUrl = data.heroUrl;
        savedEl.style.display = 'block';
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
    });
  }

  // ---------- Compose modal (Monday Manna / News create+edit) ----------
  const COMPOSE_LABELS = {
    manna: { noun: 'Monday Manna', bodyLabel: 'DEVOTIONAL BODY', placeholder: 'Write the meditation…', section: 'manna', hasImage: true },
    news: { noun: 'News Article', bodyLabel: 'ARTICLE BODY', placeholder: 'Write the article…', section: 'news', hasImage: false }
  };

  function openCompose(mode, row, type) {
    state.compose = { mode, id: row ? row.id : null, type };
    const labels = COMPOSE_LABELS[type];
    els.composeTitle.textContent = `${mode === 'edit' ? 'Edit' : 'New'} ${labels.noun}`;
    els.composeBody.innerHTML = `
      <form id="composeForm" style="display:flex;flex-direction:column;gap:16px;">
        <div><label class="field-label">TITLE</label><input class="field-input" required id="composeFieldTitle" placeholder="e.g. When Excellence Becomes Worship"></div>
        <div><label class="field-label">AUTHOR</label><input class="field-input" required id="composeFieldAuthor" placeholder="e.g. Robert J. Tamasy"></div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">DATE</label><input class="field-input" type="date" id="composeFieldDate"></div>
          <div style="flex:1;"><label class="field-label">STATUS</label>
            <select class="field-input" id="composeFieldStatus">
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>
        <div><label class="field-label">${labels.bodyLabel}</label><textarea class="field-input" id="composeFieldBody" placeholder="${labels.placeholder}"></textarea></div>
        ${labels.hasImage ? `<div><label class="field-label">IMAGE</label><input type="file" class="field-input" id="composeFieldImage" accept="image/png,image/jpeg,image/webp,image/gif">
          ${mode === 'edit' && row && row.image ? `<p style="font-size:12.5px;color:var(--text-mute-3);margin-top:8px;">Current image is set. Choose a new one to replace it, or leave blank to keep it.</p>` : ''}
        </div>` : ''}
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="composeCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">${mode === 'edit' ? 'Save changes' : 'Save'}</button>
        </div>
        <p class="form-error" id="composeError" style="display:none;"></p>
      </form>
    `;
    if (mode === 'edit' && row) {
      document.getElementById('composeFieldTitle').value = row.title;
      document.getElementById('composeFieldAuthor').value = row.author;
      document.getElementById('composeFieldDate').value = row.date || '';
      document.getElementById('composeFieldStatus').value = row.status || 'Draft';
      const firstBlock = row.blocks && row.blocks[0];
      document.getElementById('composeFieldBody').value = (typeof firstBlock === 'string' ? firstBlock : firstBlock && firstBlock.x) || '';
    } else {
      document.getElementById('composeFieldDate').value = new Date().toISOString().slice(0, 10);
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
    const fields = {
      title: document.getElementById('composeFieldTitle').value.trim(),
      author: document.getElementById('composeFieldAuthor').value.trim(),
      date: document.getElementById('composeFieldDate').value,
      status: document.getElementById('composeFieldStatus').value,
      body: document.getElementById('composeFieldBody').value.trim()
    };
    const { type, mode, id } = state.compose;
    const basePath = type === 'manna' ? 'devotional' : 'news-item';
    const collectionPath = type === 'manna' ? 'devotionals' : 'news';
    try {
      if (COMPOSE_LABELS[type].hasImage) {
        const fd = new FormData();
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
        const imageInput = document.getElementById('composeFieldImage');
        if (imageInput && imageInput.files[0]) fd.append('image', imageInput.files[0]);
        const url = mode === 'edit' ? `/api/admin/${basePath}.php?id=${id}` : `/api/admin/${collectionPath}.php`;
        const res = await fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not save this item.');
      } else if (mode === 'edit') {
        await Api.put(`/api/admin/${basePath}.php?id=${id}`, fields);
      } else {
        await Api.post(`/api/admin/${collectionPath}.php`, fields);
      }
      const payload = fields;
      els.composeBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">${mode === 'edit' ? 'Changes saved' : 'Saved'}</div>
          <p class="success-text">"${Util.escapeHtml(payload.title)}" ${mode === 'edit' ? 'was updated.' : 'was added.'}</p>
          <button class="btn btn-navy" id="composeDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('composeDoneBtn').addEventListener('click', async () => {
        closeCompose();
        if (state.section === COMPOSE_LABELS[type].section) await reloadCurrentTable();
        await refreshMsgBadge();
      });
    } catch (err) {
      errorEl.textContent = err.message || 'Could not save this item.';
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
          <div style="flex:1;"><label class="field-label">CATEGORY</label><input class="field-input" id="resFieldCategory" list="resCategoryList" placeholder="e.g. Ministry Guide">
            <datalist id="resCategoryList">
              <option value="Operation Timothy">
              <option value="Living Proof">
              <option value="Ministry Guide">
            </datalist>
          </div>
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
        if (state.section === 'resources') await reloadCurrentTable();
      });
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }

  // ---------- Event create/edit modal ----------
  let eventComposeState = { mode: null, id: null };

  function openEventModal(mode, row) {
    eventComposeState = { mode, id: row ? row.id : null };
    els.eventComposeTitle.textContent = mode === 'edit' ? 'Edit Event' : 'New Event';
    els.eventComposeBody.innerHTML = `
      <form id="eventForm" style="display:flex;flex-direction:column;gap:16px;">
        <div><label class="field-label">TITLE</label><input class="field-input" required id="evFieldTitle" placeholder="e.g. Regional Leadership Summit"></div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">LOCATION</label><input class="field-input" required id="evFieldLocation" placeholder="e.g. Lusaka, Zambia"></div>
          <div style="flex:1;"><label class="field-label">REGION</label>
            <select class="field-input" id="evFieldCategory">
              <option value="AFRICA">Africa</option>
              <option value="INTERNATIONAL">International</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">START DATE</label><input class="field-input" required type="date" id="evFieldDate"></div>
          <div style="flex:1;"><label class="field-label">DATES LABEL</label><input class="field-input" id="evFieldDatesLabel" placeholder="e.g. Sep 18–20, 2026"></div>
        </div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">TIME</label><input class="field-input" id="evFieldTime" placeholder="e.g. 8:30 AM – 5:00 PM"></div>
          <div style="flex:1;"><label class="field-label">FORMAT</label><input class="field-input" id="evFieldFormat" placeholder="e.g. In person"></div>
        </div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">COST</label><input class="field-input" id="evFieldCost" placeholder="e.g. $120 or Free"></div>
          <div style="flex:1;"><label class="field-label">HOST</label><input class="field-input" id="evFieldHost" placeholder="e.g. CBMC Zambia"></div>
        </div>
        <div><label class="field-label">DESCRIPTION</label><textarea class="field-input" id="evFieldDescription" placeholder="What should attendees expect?"></textarea></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="eventCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">${mode === 'edit' ? 'Save changes' : 'Save event'}</button>
        </div>
        <p class="form-error" id="eventError" style="display:none;"></p>
      </form>
    `;

    if (mode === 'edit' && row) {
      document.getElementById('evFieldTitle').value = row.title;
      document.getElementById('evFieldLocation').value = row.location;
      document.getElementById('evFieldCategory').value = row.category;
      document.getElementById('evFieldDate').value = row.date || '';
      document.getElementById('evFieldDatesLabel').value = row.datesLabel || '';
      document.getElementById('evFieldTime').value = row.time || '';
      document.getElementById('evFieldFormat').value = row.format || '';
      document.getElementById('evFieldCost').value = row.cost || '';
      document.getElementById('evFieldHost').value = row.host || '';
      document.getElementById('evFieldDescription').value = row.description || '';
    }

    document.getElementById('eventCancel').addEventListener('click', closeEventModal);
    document.getElementById('eventForm').addEventListener('submit', submitEventForm);
    els.eventComposeModal.classList.add('open');
  }

  function closeEventModal() {
    els.eventComposeModal.classList.remove('open');
  }

  async function submitEventForm(e) {
    e.preventDefault();
    const errorEl = document.getElementById('eventError');
    errorEl.style.display = 'none';

    const title = document.getElementById('evFieldTitle').value.trim();
    const payload = {
      title,
      location: document.getElementById('evFieldLocation').value.trim(),
      category: document.getElementById('evFieldCategory').value,
      date: document.getElementById('evFieldDate').value,
      datesLabel: document.getElementById('evFieldDatesLabel').value.trim(),
      time: document.getElementById('evFieldTime').value.trim(),
      format: document.getElementById('evFieldFormat').value.trim(),
      cost: document.getElementById('evFieldCost').value.trim(),
      host: document.getElementById('evFieldHost').value.trim(),
      description: document.getElementById('evFieldDescription').value.trim()
    };

    try {
      if (eventComposeState.mode === 'edit') {
        await Api.put(`/api/admin/event.php?id=${eventComposeState.id}`, payload);
      } else {
        await Api.post('/api/admin/events.php', payload);
      }
      els.eventComposeBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">${eventComposeState.mode === 'edit' ? 'Changes saved' : 'Event saved'}</div>
          <p class="success-text">"${Util.escapeHtml(title)}" ${eventComposeState.mode === 'edit' ? 'was updated.' : 'was added to your Events list.'}</p>
          <button class="btn btn-navy" id="eventDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('eventDoneBtn').addEventListener('click', async () => {
        closeEventModal();
        if (state.section === 'events') await reloadCurrentTable();
      });
    } catch (err) {
      errorEl.textContent = err.message || 'Could not save this event.';
      errorEl.style.display = 'block';
    }
  }

  // ---------- Leadership Team create/edit modal ----------
  let leaderState = { mode: null, id: null };

  const LEADER_REGIONS = ['Continental / Global', 'Central Africa', 'East Africa', 'North Africa', 'South Africa', 'West Africa'];

  function openLeaderModal(mode, row) {
    leaderState = { mode, id: row ? row.id : null };
    els.leaderModalTitle.textContent = mode === 'edit' ? 'Edit Leader' : 'New Leader';
    const currentNote = row && row.photo
      ? `Current photo is set. Choose a new one to replace it, or leave blank to keep it.`
      : '';

    els.leaderModalBody.innerHTML = `
      <form id="leaderForm" style="display:flex;flex-direction:column;gap:16px;">
        <div><label class="field-label">NAME</label><input class="field-input" required id="ldFieldName" placeholder="e.g. Jane Mwansa"></div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">TITLE / ROLE</label><input class="field-input" id="ldFieldTitle" placeholder="e.g. Regional Director"></div>
          <div style="flex:1;"><label class="field-label">REGION</label>
            <select class="field-input" id="ldFieldRegion">
              <option value="">— Select —</option>
              ${LEADER_REGIONS.map((r) => `<option value="${Util.escapeHtml(r)}">${Util.escapeHtml(r)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div><label class="field-label">BIO</label><textarea class="field-input" id="ldFieldBio" placeholder="A short biography…"></textarea></div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">EMAIL</label><input class="field-input" type="email" id="ldFieldEmail" placeholder="name@cbmcafrica.org"></div>
          <div style="flex:1;"><label class="field-label">PHONE</label><input class="field-input" id="ldFieldPhone" placeholder="+260 …"></div>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-end;">
          <div style="flex:1;"><label class="field-label">PHOTO</label><input type="file" class="field-input" id="ldFieldPhoto" accept="image/png,image/jpeg,image/webp,image/gif"></div>
          <div style="flex:1;"><label class="field-label">SORT ORDER</label><input class="field-input" type="number" id="ldFieldSort" value="0"></div>
        </div>
        ${currentNote ? `<p style="font-size:12.5px;color:var(--text-mute-3);margin-top:-8px;">${currentNote}</p>` : ''}
        <div><label class="field-label">STATUS</label>
          <select class="field-input" id="ldFieldStatus">
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="leaderCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">${mode === 'edit' ? 'Save changes' : 'Save leader'}</button>
        </div>
        <p class="form-error" id="leaderError" style="display:none;"></p>
      </form>
    `;

    if (mode === 'edit' && row) {
      document.getElementById('ldFieldName').value = row.name;
      document.getElementById('ldFieldTitle').value = row.title || '';
      document.getElementById('ldFieldRegion').value = row.region || '';
      document.getElementById('ldFieldBio').value = row.bio || '';
      document.getElementById('ldFieldEmail').value = row.email || '';
      document.getElementById('ldFieldPhone').value = row.phone || '';
      document.getElementById('ldFieldSort').value = row.sortOrder || 0;
      document.getElementById('ldFieldStatus').value = row.status === 'Published' ? 'Published' : 'Draft';
    }

    document.getElementById('leaderCancel').addEventListener('click', closeLeaderModal);
    document.getElementById('leaderForm').addEventListener('submit', submitLeaderForm);
    els.leaderModal.classList.add('open');
  }

  function closeLeaderModal() {
    els.leaderModal.classList.remove('open');
  }

  async function submitLeaderForm(e) {
    e.preventDefault();
    const errorEl = document.getElementById('leaderError');
    errorEl.style.display = 'none';

    const name = document.getElementById('ldFieldName').value.trim();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('title', document.getElementById('ldFieldTitle').value.trim());
    fd.append('region', document.getElementById('ldFieldRegion').value);
    fd.append('bio', document.getElementById('ldFieldBio').value.trim());
    fd.append('email', document.getElementById('ldFieldEmail').value.trim());
    fd.append('phone', document.getElementById('ldFieldPhone').value.trim());
    fd.append('sortOrder', document.getElementById('ldFieldSort').value || '0');
    fd.append('status', document.getElementById('ldFieldStatus').value);
    const photoInput = document.getElementById('ldFieldPhoto');
    if (photoInput.files[0]) fd.append('photo', photoInput.files[0]);

    const url = leaderState.mode === 'edit'
      ? `/api/admin/leaders.php?id=${leaderState.id}`
      : '/api/admin/leaders.php';

    try {
      const res = await fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save this leader.');

      els.leaderModalBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">${leaderState.mode === 'edit' ? 'Changes saved' : 'Leader saved'}</div>
          <p class="success-text">"${Util.escapeHtml(name)}" ${leaderState.mode === 'edit' ? 'was updated.' : 'was added to your Leadership Team list.'}</p>
          <button class="btn btn-navy" id="leaderDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('leaderDoneBtn').addEventListener('click', async () => {
        closeLeaderModal();
        if (state.section === 'leaders') await reloadCurrentTable();
      });
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }

  // ---------- Prayer page card create/edit modal ----------
  let prayerState = { mode: null, id: null };

  function openPrayerModal(mode, row) {
    prayerState = { mode, id: row ? row.id : null };
    els.prayerModalTitle.textContent = mode === 'edit' ? 'Edit Prayer Card' : 'New Prayer Card';
    els.prayerModalBody.innerHTML = `
      <form id="prayerForm" style="display:flex;flex-direction:column;gap:16px;">
        <div><label class="field-label">TITLE</label><input class="field-input" required id="prFieldTitle" placeholder="e.g. An individual and team function"></div>
        <div><label class="field-label">BODY</label><textarea class="field-input" required id="prFieldBody" placeholder="Write the card text… leave a blank line between paragraphs." style="min-height:160px;"></textarea></div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;"><label class="field-label">SORT ORDER</label><input class="field-input" type="number" id="prFieldSort" value="0"></div>
          <div style="flex:1;"><label class="field-label">STATUS</label>
            <select class="field-input" id="prFieldStatus">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
          <button type="button" class="btn" style="background:var(--cream);color:var(--text-muted);font-weight:600;" id="prayerCancel">Cancel</button>
          <button type="submit" class="btn btn-gold">${mode === 'edit' ? 'Save changes' : 'Save card'}</button>
        </div>
        <p class="form-error" id="prayerError" style="display:none;"></p>
      </form>
    `;

    if (mode === 'edit' && row) {
      document.getElementById('prFieldTitle').value = row.title;
      document.getElementById('prFieldBody').value = row.body;
      document.getElementById('prFieldSort').value = row.sortOrder || 0;
      document.getElementById('prFieldStatus').value = row.status === 'Published' ? 'Published' : 'Draft';
    } else {
      document.getElementById('prFieldStatus').value = 'Published';
    }

    document.getElementById('prayerCancel').addEventListener('click', closePrayerModal);
    document.getElementById('prayerForm').addEventListener('submit', submitPrayerForm);
    els.prayerModal.classList.add('open');
  }

  function closePrayerModal() {
    els.prayerModal.classList.remove('open');
  }

  async function submitPrayerForm(e) {
    e.preventDefault();
    const errorEl = document.getElementById('prayerError');
    errorEl.style.display = 'none';

    const title = document.getElementById('prFieldTitle').value.trim();
    const payload = {
      title,
      body: document.getElementById('prFieldBody').value.trim(),
      sortOrder: Number(document.getElementById('prFieldSort').value || 0),
      status: document.getElementById('prFieldStatus').value
    };

    try {
      if (prayerState.mode === 'edit') {
        await Api.put(`/api/admin/prayer-card.php?id=${prayerState.id}`, payload);
      } else {
        await Api.post('/api/admin/prayer-cards.php', payload);
      }
      els.prayerModalBody.innerHTML = `
        <div style="padding:16px 4px;text-align:center;">
          <div class="success-icon">✓</div>
          <div class="success-title" style="margin-top:16px;">${prayerState.mode === 'edit' ? 'Changes saved' : 'Card saved'}</div>
          <p class="success-text">"${Util.escapeHtml(title)}" ${prayerState.mode === 'edit' ? 'was updated.' : 'was added to the Prayer page.'}</p>
          <button class="btn btn-navy" id="prayerDoneBtn" style="margin-top:18px;">Done</button>
        </div>
      `;
      document.getElementById('prayerDoneBtn').addEventListener('click', async () => {
        closePrayerModal();
        if (state.section === 'prayer') await reloadCurrentTable();
      });
    } catch (err) {
      errorEl.textContent = err.message || 'Could not save this card.';
      errorEl.style.display = 'block';
    }
  }

  init();
})();
