(async function () {
  const container = document.getElementById('heroMedia');
  try {
    const { heroType, heroUrl } = await Api.get('/api/hero.php');
    if (!heroUrl) return;
    container.innerHTML = heroType === 'video'
      ? `<video class="hero-img" autoplay muted loop playsinline src="${Util.escapeHtml(heroUrl)}"></video>`
      : `<img class="hero-img" src="${Util.escapeHtml(heroUrl)}" alt="">`;
  } catch (e) {
    // keep the default banner already in the page
  }
})();
