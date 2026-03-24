// ── Ghost Notes — Browser Extension Popup ────────────────────────────────

// Grab current tab info
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function faviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
  catch { return ''; }
}

// ── DOM refs ────────────────────────────────────────────────────────────
const pageTitleEl  = document.getElementById('pageTitle');
const pageDomainEl = document.getElementById('pageDomain');
const faviconImgEl = document.getElementById('faviconImg');
const saveBtnEl    = document.getElementById('saveBtn');
const recentListEl = document.getElementById('recentList');
const saveCardEl   = document.getElementById('saveCard');
const openAppEl    = document.getElementById('openApp');

// ── Render recent saves ─────────────────────────────────────────────────
function renderRecentSaves(saves) {
  if (!saves || saves.length === 0) {
    recentListEl.innerHTML = '<div class="recent-empty">No saves yet.</div>';
    return;
  }

  recentListEl.innerHTML = saves.slice(0, 5).map((item) => `
    <div class="recent-item" data-url="${item.url}">
      <div class="recent-favicon">
        <img src="${faviconUrl(item.url)}" alt="" onerror="this.parentElement.style.display='none'" />
      </div>
      <span class="recent-title">${item.title || item.url}</span>
      <span class="recent-time">${timeAgo(item.savedAt)}</span>
    </div>
  `).join('');

  // Click to open in Ghost Notes app
  recentListEl.querySelectorAll('.recent-item').forEach((el) => {
    el.addEventListener('click', () => {
      const url = el.dataset.url;
      chrome.tabs.create({ url: `https://ghostnotes.app/read?url=${encodeURIComponent(url)}` });
      window.close();
    });
  });
}

// ── Init ────────────────────────────────────────────────────────────────
async function init() {
  const tab = await getCurrentTab();
  if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
    pageTitleEl.textContent = 'Cannot save this page';
    saveBtnEl.disabled = true;
  } else {
    const title = tab.title || tab.url;
    const domain = getDomain(tab.url);

    pageTitleEl.textContent = title.length > 60 ? title.slice(0, 60) + '…' : title;
    pageDomainEl.textContent = domain;
    faviconImgEl.src = faviconUrl(tab.url);

    // Check if already saved
    const stored = await chrome.storage.local.get(['ghostNotesSaves']);
    const saves = stored.ghostNotesSaves || [];
    const alreadySaved = saves.some((s) => s.url === tab.url);

    if (alreadySaved) {
      saveBtnEl.disabled = true;
      saveBtnEl.classList.add('saved');
      saveBtnEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        Already saved
      `;
    }

    saveBtnEl.addEventListener('click', async () => {
      if (saveBtnEl.disabled) return;
      saveBtnEl.disabled = true;
      saveBtnEl.innerHTML = 'Saving…';

      const newSave = {
        url: tab.url,
        title: title,
        domain: domain,
        favicon: faviconUrl(tab.url),
        savedAt: Date.now(),
      };

      const stored = await chrome.storage.local.get(['ghostNotesSaves']);
      const saves = stored.ghostNotesSaves || [];
      saves.unshift(newSave);
      await chrome.storage.local.set({ ghostNotesSaves: saves.slice(0, 50) });

      // Visual confirmation
      saveBtnEl.classList.add('saved', 'save-flash');
      saveBtnEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        Saved!
      `;
      setTimeout(() => saveBtnEl.classList.remove('save-flash'), 300);

      renderRecentSaves(saves);
    });
  }

  // Load recent saves
  const stored = await chrome.storage.local.get(['ghostNotesSaves']);
  renderRecentSaves(stored.ghostNotesSaves || []);

  // Open app link
  openAppEl.href = 'https://ghostnotes.app/app';
}

init();
