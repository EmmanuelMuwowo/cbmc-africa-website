(function () {
  function init() {
    const hamburger = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('mobileClose');
    const menu = document.getElementById('mobileMenu');
    if (hamburger && menu) {
      const open = () => menu.classList.add('open');
      const close = () => menu.classList.remove('open');
      hamburger.addEventListener('click', open);
      if (closeBtn) closeBtn.addEventListener('click', close);
      menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    }

    const dropdownBtns = document.querySelectorAll('[data-dropdown-btn]');
    dropdownBtns.forEach((btn) => {
      const panel = document.querySelector(`[data-dropdown-panel="${btn.dataset.dropdownBtn}"]`);
      if (!panel) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.contains('open');
        document.querySelectorAll('.nav-dropdown-panel.open').forEach((p) => p.classList.remove('open'));
        if (!isOpen) panel.classList.add('open');
      });
    });
    if (dropdownBtns.length) {
      document.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-dropdown-panel.open').forEach((panel) => {
          const btn = document.querySelector(`[data-dropdown-btn="${panel.dataset.dropdownPanel}"]`);
          if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
        });
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.nav-dropdown-panel.open').forEach((p) => p.classList.remove('open'));
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
