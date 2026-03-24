// ── Ghost Notes — Content Script ───────────────────────────────────────
// Handles right-click "Save to Ghost Notes" context menu via selection.

(function () {
  // Auto-detect article title from Open Graph or document title
  function detectTitle() {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) return ogTitle.content;
    return document.title || location.href;
  }

  // Auto-detect favicon from link tags
  function detectFavicon() {
    const icon = document.querySelector('link[rel*="icon"]');
    if (icon && icon.href) return icon.href;
    // Fallback to Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${location.hostname}&sz=32`;
  }

  // Listen for messages from the background script or popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_PAGE_INFO') {
      sendResponse({
        url: location.href,
        title: detectTitle(),
        favicon: detectFavicon(),
        domain: location.hostname.replace('www.', ''),
      });
    }
    return true;
  });
})();
