(async function () {
  const devoContainer = document.getElementById('latestDevos');
  const newsContainer = document.getElementById('newsGrid');

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

  function newsCard(a) {
    return `<a class="card news-card" href="article.html?type=news&slug=${encodeURIComponent(a.slug)}">
      <div class="card-media" style="background-image:url('${Util.escapeHtml(a.image)}')"></div>
      <div class="card-body">
        <div class="card-date">${Util.escapeHtml(a.dateLabel)}</div>
        <h3 class="card-title">${Util.escapeHtml(a.title)}</h3>
        <p class="card-excerpt">${Util.escapeHtml(a.excerpt)}</p>
        <div class="card-foot">${Util.escapeHtml(a.author)} · <span class="read-link">Read →</span></div>
      </div>
    </a>`;
  }

  try {
    const devos = await Api.get('/api/devotionals.php');
    devoContainer.innerHTML = devos.slice(0, 3).map(devoCard).join('') || '<div class="skeleton-text">No devotionals yet.</div>';
  } catch (e) {
    devoContainer.innerHTML = '<div class="skeleton-text">Could not load devotionals right now.</div>';
  }

  try {
    const news = await Api.get('/api/news.php');
    newsContainer.innerHTML = news.slice(0, 4).map(newsCard).join('') || '<div class="skeleton-text">No news yet.</div>';
  } catch (e) {
    newsContainer.innerHTML = '<div class="skeleton-text">Could not load news right now.</div>';
  }

  const form = document.getElementById('subscribeForm');
  const card = document.getElementById('newsletterCard');
  const errorEl = document.getElementById('subError');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const name = document.getElementById('subName').value.trim();
    const email = document.getElementById('subEmail').value.trim();
    try {
      await Api.post('/api/subscribe.php', { name, email });
      card.innerHTML = `<div class="success-box">
        <div class="success-icon">✓</div>
        <h3 class="success-title">You're subscribed!</h3>
        <p class="success-text">Look out for your first Monday Manna this coming Monday morning.</p>
      </div>`;
    } catch (err) {
      errorEl.textContent = err.message || 'Please enter your name and a valid email.';
      errorEl.style.display = 'block';
    }
  });
})();
