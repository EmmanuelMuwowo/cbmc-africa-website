(async function () {
  const root = document.getElementById('articleRoot');
  const type = Util.qs('type') === 'news' ? 'news' : 'devo';
  const slug = Util.qs('slug');

  if (type === 'devo') {
    const navManna = document.getElementById('navManna');
    if (navManna) navManna.classList.add('active');
  }

  function blockHtml(b) {
    if (b.t === 'h') return `<h3>${Util.escapeHtml(b.x)}</h3>`;
    if (b.t === 'q') return `<blockquote>${Util.escapeHtml(b.x)}</blockquote>`;
    return `<p>${Util.escapeHtml(b.x)}</p>`;
  }

  if (!slug) {
    root.innerHTML = '<div class="skeleton-text" style="padding:120px 24px;">Article not found.</div>';
    return;
  }

  let article;
  try {
    article = await Api.get(`/api/${type === 'devo' ? 'devotional' : 'news-item'}.php?slug=${encodeURIComponent(slug)}`);
  } catch (e) {
    root.innerHTML = '<div class="skeleton-text" style="padding:120px 24px;">Article not found.</div>';
    return;
  }

  document.title = article.title + ' — CBMC Africa';
  const backLabel = type === 'devo' ? 'Back to Monday Manna' : 'Back to news';
  const backHref = type === 'devo' ? 'manna.html' : 'index.html';
  const kicker = type === 'devo' ? 'MONDAY MANNA' : 'NEWS';
  const authorInit = type === 'devo' ? article.authorInitials : Util.escapeHtml((article.author || 'C').slice(0, 2).toUpperCase());
  const hasVerse = type === 'devo' && article.verse;
  const hasReflection = type === 'devo' && article.reflection && article.reflection.length > 0;

  root.innerHTML = `
    <article style="background:var(--cream-2);">
      <div class="article-hero">
        <div class="article-hero-bg" style="background-image:url('${Util.escapeHtml(article.image)}')"></div>
        <div class="article-hero-scrim"></div>
        <div class="article-hero-inner">
          <a href="${backHref}" class="back-link">← ${backLabel}</a>
          <div class="article-kicker">${kicker} · ${Util.escapeHtml(article.dateLabel)}</div>
          <h1 class="article-title">${Util.escapeHtml(article.title)}</h1>
          <div class="article-byline">
            <div class="author-avatar">${authorInit}</div>
            <div class="who">By <strong>${Util.escapeHtml(article.author)}</strong></div>
          </div>
        </div>
      </div>
      <div class="article-body-wrap">
        ${hasVerse ? `<div class="verse-block"><p>${Util.escapeHtml(article.verse)}</p></div>` : ''}
        <div class="article-blocks">${article.blocks.map(blockHtml).join('')}</div>
        ${hasReflection ? `
        <div class="reflection-box">
          <div class="reflection-kicker">REFLECTION &amp; DISCUSSION</div>
          <div class="reflection-list">
            ${article.reflection.map((t, i) => `<div class="reflection-item"><div class="n">${i + 1}</div><p>${Util.escapeHtml(t)}</p></div>`).join('')}
          </div>
          ${article.challenge ? `<div class="challenge-block">
            <div class="reflection-kicker">CHALLENGE FOR THIS WEEK</div>
            <p>${Util.escapeHtml(article.challenge)}</p>
            ${article.passages ? `<p class="passages">Further reading: ${Util.escapeHtml(article.passages)}</p>` : ''}
          </div>` : ''}
        </div>` : ''}
        <div class="share-row">
          <span class="label">Share this article</span>
          <div class="share-links">
            <button class="share-btn" data-share="fb">f</button>
            <button class="share-btn" data-share="li">in</button>
            <button class="share-btn" data-share="copy">⧉</button>
          </div>
          <span class="copied-note" id="copiedNote" style="display:none;">Link copied ✓</span>
          <a href="${backHref}" class="back-cta">${backLabel} →</a>
        </div>
      </div>
    </article>
  `;

  document.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (btn.dataset.share === 'copy') {
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (e) { /* clipboard unavailable */ }
        const note = document.getElementById('copiedNote');
        note.style.display = 'inline';
        setTimeout(() => { note.style.display = 'none'; }, 2200);
      }
    });
  });
})();
