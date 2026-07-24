const Util = (() => {
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  return { escapeHtml, qs };
})();
