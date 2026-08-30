// Fills the site's contact details from Admin > Settings so editing them there
// updates every page. If the request fails the hardcoded markup already in the
// page is left alone, so the footer never ends up blank.
(async function () {
  const footers = document.querySelectorAll('[data-site-contact]');
  const inlines = document.querySelectorAll('[data-site-contact-inline]');
  const donates = document.querySelectorAll('[data-site-donate]');
  if (!footers.length && !inlines.length && !donates.length) return;

  try {
    const s = await Api.get('/api/settings.php');
    const esc = Util.escapeHtml;
    const address = (s.address || '').trim();
    const phone = (s.phone || '').trim();
    const email = (s.public_email || '').trim();

    footers.forEach((el) => {
      el.innerHTML = [
        address ? esc(address) : '',
        phone ? esc(phone) : '',
        email ? `<a href="mailto:${esc(email)}" style="color:inherit;">${esc(email)}</a>` : ''
      ].filter(Boolean).join('<br>');
    });

    inlines.forEach((el) => {
      el.textContent = [address, phone, email].filter(Boolean).join(' · ');
    });

    if (s.donate_url) {
      donates.forEach((el) => { el.href = s.donate_url; });
    }
  } catch (e) {
    // Leave the details already rendered in the page.
  }
})();
