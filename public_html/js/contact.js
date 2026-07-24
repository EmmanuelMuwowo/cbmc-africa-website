(function () {
  const form = document.getElementById('contactForm');
  const card = document.getElementById('contactCard');
  const errorEl = document.getElementById('cError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const message = document.getElementById('cMessage').value.trim();
    try {
      await Api.post('/api/contact.php', { name, email, message });
      card.innerHTML = `<div class="success-box">
        <div class="success-icon">✓</div>
        <h3 class="success-title">Message sent!</h3>
        <p class="success-text">Thanks for reaching out — our team will get back to you soon.</p>
      </div>`;
    } catch (err) {
      errorEl.textContent = err.message || 'Please fill in all fields with a valid email.';
      errorEl.style.display = 'block';
    }
  });
})();
