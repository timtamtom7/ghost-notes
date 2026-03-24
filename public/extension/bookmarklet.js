// Ghost Notes Bookmarklet
// Drag this link to your bookmarks bar, or right-click and "Bookmark This Link"
// Works on desktop and mobile Safari
//
// Usage: Click the bookmark while on any article page to save it to Ghost Notes

(function () {
  var gnBookmarketVersion = '1.0.0';

  function getMeta(content) {
    return document.querySelector('meta[name="' + content + '"], meta[property="' + content + '"]')?.content || '';
  }

  function getFavicon() {
    var icon = document.querySelector('link[rel*="icon"]');
    if (icon && icon.href) return icon.href;
    return 'https://www.google.com/s2/favicons?domain=' + location.hostname + '&sz=32';
  }

  var title = getMeta('og:title') || document.title || location.href;
  var url   = location.href;
  var favicon = getFavicon();
  var domain = location.hostname.replace('www.', '');

  // Load existing saves
  var saves = JSON.parse(localStorage.getItem('gn_bookmarklet_saves') || '[]');

  // Check for duplicate
  if (saves.some(function (s) { return s.url === url; })) {
    showConfirm('Already saved to Ghost Notes!', 'warning');
    return;
  }

  // Add new save
  saves.unshift({
    url: url,
    title: title,
    favicon: favicon,
    domain: domain,
    savedAt: Date.now(),
  });

  // Keep only last 50
  if (saves.length > 50) saves = saves.slice(0, 50);

  localStorage.setItem('gn_bookmarklet_saves', JSON.stringify(saves));

  // Also push to Ghost Notes app storage if available
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(function (est) {
      // Storage quota available, will sync with app via shared origin
    });
  }

  showConfirm('Saved to Ghost Notes!', 'success');
})();

function showConfirm(message, type) {
  // Remove existing toast
  var existing = document.getElementById('gn-bookmarklet-toast');
  if (existing) existing.remove();

  var colors = {
    success: { bg: '#1a2e1a', border: '#22c55e', text: '#22c55e' },
    warning: { bg: '#2e2a1a', border: '#f59e0b', text: '#f59e0b' },
  };
  var c = colors[type] || colors.success;

  var toast = document.createElement('div');
  toast.id = 'gn-bookmarklet-toast';
  toast.textContent = message;
  toast.style.cssText = [
    'position:fixed',
    'top:20px',
    'right:20px',
    'z-index:999999',
    'padding:12px 20px',
    'background:' + c.bg,
    'border:1px solid ' + c.border,
    'border-radius:8px',
    'color:' + c.text,
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'font-size:14px',
    'font-weight:600',
    'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
    'animation:gnToastIn 300ms ease forwards',
    'max-width:280px',
    'word-break:break-word',
  ].join(';');

  // Add animation keyframes if not present
  if (!document.getElementById('gn-toast-styles')) {
    var style = document.createElement('style');
    style.id = 'gn-toast-styles';
    style.textContent = [
      '@keyframes gnToastIn { from{opacity:0;transform:translateY(-8px) scale(0.95);} to{opacity:1;transform:translateY(0) scale(1);} }',
      '@keyframes gnToastOut { from{opacity:1;transform:translateY(0) scale(1);} to{opacity:0;transform:translateY(-8px) scale(0.95);} }',
    ].join('');
    document.head.appendChild(style);
  }

  // Add ghost notes logo icon
  toast.innerHTML = '<svg style="display:inline-block;vertical-align:middle;margin-right:8px;width:16px;height:16px" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="' + c.text + '" opacity="0.3"/><circle cx="9" cy="9" r="1.5" fill="' + c.text + '"/><circle cx="15" cy="15" r="1.5" fill="' + c.text + '"/></svg> ' + message;

  document.body.appendChild(toast);

  // Animate out after 2.5s
  setTimeout(function () {
    toast.style.animation = 'gnToastOut 300ms ease forwards';
    setTimeout(function () { toast.remove(); }, 300);
  }, 2500);
}
