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

    // Make all external links open in a new active tab and handle dynamically loaded links
    function setupExternalLinks() {
      // Intercept clicks on external links to open them and focus the new tab
      document.addEventListener('click', (e) => {
        // Only handle standard left clicks without modifiers (Ctrl, Cmd, Shift, Alt)
        if (e.button !== 0 || e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) {
          return;
        }

        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }

        // Compare hostname to detect external links
        if (anchor.hostname && anchor.hostname !== window.location.hostname) {
          e.preventDefault();
          const newTab = window.open(anchor.href, '_blank');
          if (newTab) {
            newTab.focus();
          }
        }
      });

      // Scan and set target="_blank" and rel="noopener noreferrer" for standard HTML attributes
      // as a fallback (good for SEO, keyboard navigation, right-clicks)
      document.querySelectorAll('a').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }
        if (anchor.hostname && anchor.hostname !== window.location.hostname) {
          anchor.setAttribute('target', '_blank');
          if (!anchor.getAttribute('rel')) {
            anchor.setAttribute('rel', 'noopener noreferrer');
          }
        }
      });
    }

    setupExternalLinks();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
