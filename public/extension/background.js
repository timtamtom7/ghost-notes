// ── Ghost Notes — Background Service Worker ─────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Set default storage
  chrome.storage.local.get(['ghostNotesSaves', 'ghostNotesUserId'], (result) => {
    if (!result.ghostNotesSaves) {
      chrome.storage.local.set({ ghostNotesSaves: [] });
    }
  });

  // Set up context menu
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ghostnotes-save-page',
      title: 'Save to Ghost Notes',
      contexts: ['page'],
    });

    chrome.contextMenus.create({
      id: 'ghostnotes-save-link',
      title: 'Save link to Ghost Notes',
      contexts: ['link'],
    });
  });
});

// Context menu handlers
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ghostnotes-save-page') {
    // Save the current page
    chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_INFO' }, async (pageInfo) => {
      if (!pageInfo) return;
      const stored = await chrome.storage.local.get(['ghostNotesSaves']);
      const saves = stored.ghostNotesSaves || [];
      saves.unshift({ ...pageInfo, savedAt: Date.now() });
      await chrome.storage.local.set({ ghostNotesSaves: saves.slice(0, 50) });
      // Show visual feedback via badge
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
      setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
    });
  } else if (info.menuItemId === 'ghostnotes-save-link') {
    const url = info.linkUrl;
    const title = info.linkText || url;
    const favicon = `https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(url).hostname; } catch { return ''; } })()}&sz=32`;

    chrome.storage.local.get(['ghostNotesSaves'], async (result) => {
      const saves = result.ghostNotesSaves || [];
      saves.unshift({
        url,
        title,
        favicon,
        domain: (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; } })(),
        savedAt: Date.now(),
      });
      await chrome.storage.local.set({ ghostNotesSaves: saves.slice(0, 50) });
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
      setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
    });
  }
});
