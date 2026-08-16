(async function () {
  const container = document.getElementById('prayerCards');

  function card(c) {
    const paragraphs = c.body.split(/\n\s*\n/).map((p) => `<p style="color:var(--text-muted);font-size:15px;line-height:1.65;margin-top:14px;">${Util.escapeHtml(p.trim())}</p>`).join('');
    return `<div class="form-card" style="margin-bottom:20px;">
      <div class="form-title">${Util.escapeHtml(c.title)}</div>
      ${paragraphs}
      <a href="resources.html" class="btn btn-navy" style="margin-top:20px;">Browse all resources →</a>
    </div>`;
  }

  try {
    const cards = await Api.get('/api/prayer-cards.php');
    container.innerHTML = cards.length
      ? cards.map(card).join('')
      : '<div class="empty-state">This page doesn\'t have any published content yet.</div>';
  } catch (e) {
    container.innerHTML = '<div class="empty-state">Could not load this page right now.</div>';
  }
})();
