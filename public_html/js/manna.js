(async function () {
  const grid = document.getElementById('devoGrid');

  function devoCard(d) {
    return `<a class="card" href="article.html?type=devo&slug=${encodeURIComponent(d.slug)}">
      <div class="card-media" style="background-image:url('${Util.escapeHtml(d.image)}')"></div>
      <div class="card-body">
        <div class="card-date">${Util.escapeHtml(d.dateLabel)}</div>
        <h3 class="card-title">${Util.escapeHtml(d.title)}</h3>
        <p class="card-excerpt">${Util.escapeHtml(d.excerpt)}</p>
        <div class="card-foot">By ${Util.escapeHtml(d.author)} · <span class="read-link">Read →</span></div>
      </div>
    </a>`;
  }

  try {
    const devos = await Api.get('/api/devotionals.php');
    grid.innerHTML = devos.map(devoCard).join('') || '<div class="skeleton-text">No devotionals yet.</div>';
  } catch (e) {
    grid.innerHTML = '<div class="skeleton-text">Could not load devotionals right now.</div>';
  }
})();
