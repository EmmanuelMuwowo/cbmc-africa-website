(async function () {
  const list = document.getElementById('resourceList');

  function iconFor(category) {
    const c = (category || '').toLowerCase();
    if (c.includes('archive')) return '🗂';
    if (c.includes('brochure')) return '📰';
    if (c.includes('guide')) return '📘';
    return '📄';
  }

  function resourceRow(r) {
    const actionHtml = r.sourceType === 'file'
      ? `<a class="resource-btn" href="${Util.escapeHtml(r.fileUrl)}" download>Download</a>`
      : r.sourceType === 'link'
        ? `<a class="resource-btn" href="${Util.escapeHtml(r.externalUrl)}" target="_blank" rel="noopener">View</a>`
        : '';
    return `<div class="resource-row">
      <div class="resource-icon">${iconFor(r.category)}</div>
      <div class="resource-info">
        <h3>${Util.escapeHtml(r.title)}</h3>
        ${r.description ? `<p>${Util.escapeHtml(r.description)}</p>` : ''}
        <div class="resource-meta">
          ${r.category ? `<span class="tag">${Util.escapeHtml(r.category)}</span>` : ''}
          <span class="date">${Util.escapeHtml(r.dateLabel)}</span>
        </div>
      </div>
      ${actionHtml}
    </div>`;
  }

  try {
    const resources = await Api.get('/api/resources.php');
    list.innerHTML = resources.map(resourceRow).join('') || '<div class="empty-state">No resources published yet.</div>';
  } catch (e) {
    list.innerHTML = '<div class="empty-state">Could not load resources right now.</div>';
  }
})();
