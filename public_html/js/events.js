(function () {
  const listEl = document.getElementById('eventList');
  const filtersEl = document.getElementById('eventFilters');
  const modal = document.getElementById('eventModal');
  const modalClose = document.getElementById('eventModalClose');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta = document.getElementById('modalMeta');
  const modalBody = document.getElementById('modalBody');

  let events = [];
  const urlCategory = new URLSearchParams(window.location.search).get('category');
  let filter = urlCategory === 'AFRICA' || urlCategory === 'INTERNATIONAL' ? urlCategory : 'ALL';

  filtersEl.querySelectorAll('.filter-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });

  function tagClass(cat) { return cat === 'AFRICA' ? 'tag-africa' : 'tag-intl'; }
  function tagLabel(cat) { return cat === 'AFRICA' ? 'AFRICA' : 'INTERNATIONAL'; }

  function renderList() {
    const filtered = filter === 'ALL' ? events : events.filter((e) => e.category === filter);
    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty-state">No events in this category.</div>';
      return;
    }
    listEl.innerHTML = filtered.map((e) => `
      <div class="event-row">
        <div class="event-date-badge">
          <div class="mon">${Util.escapeHtml(e.mon)}</div>
          <div class="day">${Util.escapeHtml(e.day)}</div>
          <div class="yr">${Util.escapeHtml(e.year)}</div>
        </div>
        <div class="event-info">
          <span class="tag ${tagClass(e.category)}">${tagLabel(e.category)}</span>
          <h3>${Util.escapeHtml(e.title)}</h3>
          <p>📍 ${Util.escapeHtml(e.location)} · ${Util.escapeHtml(e.datesLabel)}</p>
        </div>
        <button class="event-details-btn" data-event-id="${e.id}">Details</button>
      </div>
    `).join('');
    listEl.querySelectorAll('[data-event-id]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(Number(btn.dataset.eventId)));
    });
  }

  function openModal(id) {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    modalTag.className = 'tag ' + tagClass(e.category);
    modalTag.textContent = tagLabel(e.category);
    modalTitle.textContent = e.title;
    modalMeta.textContent = `📍 ${e.location} · ${e.datesLabel}`;
    renderDetailBody(e);
    modal.classList.add('open');
  }

  function renderDetailBody(e) {
    modalBody.innerHTML = `
      <p style="color:var(--text-body);font-size:15px;line-height:1.6;">${Util.escapeHtml(e.description)}</p>
      <div class="fact-grid">
        <div class="fact-box"><div class="fact-label">Date</div><div class="fact-value">${Util.escapeHtml(e.datesLabel)}</div></div>
        <div class="fact-box"><div class="fact-label">Time</div><div class="fact-value">${Util.escapeHtml(e.time)}</div></div>
        <div class="fact-box"><div class="fact-label">Format</div><div class="fact-value">${Util.escapeHtml(e.format)}</div></div>
        <div class="fact-box"><div class="fact-label">Registration</div><div class="fact-value">${Util.escapeHtml(e.cost)}</div></div>
      </div>
      <form id="registerForm" style="margin-top:20px;display:flex;flex-direction:column;gap:12px;">
        <div><label class="field-label">FULL NAME</label><input class="field-input" required id="regName" placeholder="Your name"></div>
        <div><label class="field-label">EMAIL</label><input class="field-input" required type="email" id="regEmail" placeholder="you@company.com"></div>
        <button type="submit" class="btn btn-gold" style="width:100%;">Register for this event</button>
        <p class="form-error" id="regError" style="display:none;"></p>
      </form>
    `;
    document.getElementById('registerForm').addEventListener('submit', async (evt) => {
      evt.preventDefault();
      const errEl = document.getElementById('regError');
      errEl.style.display = 'none';
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      try {
        await Api.post('/api/register-event.php', { id: e.id, name, email });
        modalBody.innerHTML = `
          <div style="text-align:center;padding:16px 6px;">
            <div class="success-icon">✓</div>
            <div class="success-title" style="margin-top:14px;">You're registered!</div>
            <p class="success-text">We've saved your spot for ${Util.escapeHtml(e.title)}. Details are on the way to your email.</p>
            <button class="btn btn-navy" id="closeAfterRegister" style="margin-top:18px;">Close</button>
          </div>
        `;
        document.getElementById('closeAfterRegister').addEventListener('click', () => modal.classList.remove('open'));
      } catch (err) {
        errEl.textContent = err.message || 'Please enter a valid name and email.';
        errEl.style.display = 'block';
      }
    });
  }

  filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filtersEl.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderList();
    });
  });

  modalClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  (async function load() {
    try {
      events = await Api.get('/api/events.php');
      renderList();
    } catch (e) {
      listEl.innerHTML = '<div class="empty-state">Could not load events right now.</div>';
    }
  })();
})();
