(async function () {
  const grid = document.getElementById('leaderGrid');
  const region = (grid.dataset.region || '').trim();

  function comingSoon() {
    const msg = region
      ? `We don't have a published contact for ${Util.escapeHtml(region)} yet. In the meantime, reach out to our head office and we'll connect you with the right leader.`
      : `We're updating this page with photos and bios of our board members and executive staff. In the meantime, get in touch and we'll connect you with the right person.`;
    return `<div class="coming-soon-box">
      <h2>Coming soon</h2>
      <p>${msg}</p>
      <a href="contact.html" class="btn btn-navy" style="margin-top:20px;">Contact us →</a>
    </div>`;
  }

  function leaderCard(l) {
    const photoStyle = l.photo ? `background-image:url('${Util.escapeHtml(l.photo)}')` : '';
    const isBoard = l.category === 'Board Member';
    return `<div class="leader-card">
      <div class="leader-photo${l.photo ? '' : ' leader-photo-empty'}" style="${photoStyle}"></div>
      <div class="leader-body">
        <h3>${Util.escapeHtml(l.name)}</h3>
        ${l.title ? `<div class="leader-title">${Util.escapeHtml(l.title)}</div>` : ''}
        <div>
          <span class="tag leader-category-tag${isBoard ? ' is-board' : ''}">${isBoard ? 'Board Member' : 'Executive Staff'}</span>
          ${l.region ? `<span class="tag leader-region-tag">${Util.escapeHtml(l.region)}</span>` : ''}
        </div>
        ${l.bio ? `<p>${Util.escapeHtml(l.bio)}</p>` : ''}
        ${(l.email || l.phone) ? `<div class="leader-contact">
          ${l.email ? `<a href="mailto:${Util.escapeHtml(l.email)}">${Util.escapeHtml(l.email)}</a>` : ''}
          ${l.phone ? `<span>${Util.escapeHtml(l.phone)}</span>` : ''}
        </div>` : ''}
      </div>
    </div>`;
  }

  function categorySection(label, members, isFirst) {
    if (!members.length) return '';
    return `<div${isFirst ? '' : ' style="margin-top:44px;"'}>
      <div class="leader-category-label">${Util.escapeHtml(label)}</div>
      <div class="leader-grid">${members.map(leaderCard).join('')}</div>
    </div>`;
  }

  try {
    const leaders = await Api.get('/api/leaders.php');
    const filtered = region ? leaders.filter((l) => l.region === region) : leaders;
    if (!filtered.length) {
      grid.innerHTML = comingSoon();
      return;
    }
    const board = filtered.filter((l) => l.category === 'Board Member');
    const staff = filtered.filter((l) => l.category !== 'Board Member');
    grid.innerHTML = categorySection('Board Members', board, true) + categorySection('Executive Staff', staff, board.length === 0);
  } catch (e) {
    grid.innerHTML = '<div class="empty-state">Could not load this content right now.</div>';
  }
})();
