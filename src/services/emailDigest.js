/**
 * Email Digest Service — Ghost Notes
 *
 * Sends weekly digest emails with the user's top unread articles.
 * Works with any email backend (Resend, Firebase Functions, etc.)
 *
 * In production, this would call a backend endpoint (Firebase Function / Edge Function)
 * that uses Resend to send the actual email. The frontend handles preferences and
 * triggers the send via a callable function.
 */

import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Build an email digest HTML for a user.
 * Returns the HTML string (can be rendered server-side with Resend).
 */
export function buildDigestHtml({ user, articles }) {
  const articlesHtml = articles.length === 0
    ? `<p style="color: #6b6b6b; font-size: 15px;">Your Haul is empty — nothing to digest this week.</p>`
    : articles.map((article, i) => `
      <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: ${i < articles.length - 1 ? '1px solid #2a2a2a' : 'none'};">
        <a href="${article.url}" style="font-size: 17px; font-weight: 600; color: #fafaf8; text-decoration: none; display: block; margin-bottom: 4px;">
          ${escapeHtml(article.title || article.url)}
        </a>
        <div style="font-size: 13px; color: #6b6b6b; margin-bottom: 8px;">
          ${escapeHtml(article.description || '')}
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="${article.url}" style="background: #3b82f6; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 13px; text-decoration: none; font-weight: 500;">
            Read
          </a>
          <a href="${buildEmailActionUrl('cull', article.id)}" style="background: transparent; color: #6b6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; text-decoration: none; border: 1px solid #3a3a3a;">
            Cull
          </a>
        </div>
      </div>
    `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ghost Notes Haul</title>
</head>
<body style="margin: 0; padding: 0; background: #141410; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #141410; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <span style="font-size: 20px; font-weight: 700; color: #fafaf8; letter-spacing: -0.5px;">
                👻 Ghost Notes
              </span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background: #1c1c18; border-radius: 16px; padding: 32px; border: 1px solid #2a2a2a;">
              <h1 style="font-size: 22px; font-weight: 700; color: #fafaf8; margin: 0 0 8px 0;">
                Your Haul — ${articles.length} unread ${articles.length === 1 ? 'article' : 'articles'}
              </h1>
              <p style="font-size: 14px; color: #6b6b6b; margin: 0 0 32px 0;">
                Here's what you've saved. Read, cull, or let it haunt you another week.
              </p>
              ${articlesHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding-top: 24px;">
              <p style="font-size: 12px; color: #3a3a3a; margin: 0;">
                You're receiving this because you have email digests enabled.
                <a href="{{unsubscribeUrl}}" style="color: #3a3a3a;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Fetch the top N unread articles for a user.
 */
export async function fetchTopArticles(userId, count = 5) {
  const q = query(
    collection(db, 'saves'),
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('savedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get user email preferences from their profile.
 */
export async function getUserEmailPrefs(userId) {
  const ref = doc(db, 'profiles', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { emailEnabled: false, haulFrequencyDays: 7 };
  const data = snap.data();
  return {
    emailEnabled: data.settings?.emailEnabled ?? false,
    haulFrequencyDays: data.settings?.haulFrequencyDays ?? 7,
  };
}

/**
 * Trigger an email digest send (calls a backend endpoint).
 * In Firebase world this would be a callable function.
 */
export async function triggerDigestEmail(userId, articleCount = 5) {
  const articles = await fetchTopArticles(userId, articleCount);
  const prefs = await getUserEmailPrefs(userId);

  if (!prefs.emailEnabled) {
    throw new Error('Email digest not enabled for this user');
  }

  // In production, this would call a Firebase Function or Edge Function
  // that uses Resend to send the actual email. For now, we log what would be sent.
  const html = buildDigestHtml({ user: { uid: userId }, articles });

  // Call the backend endpoint if configured
  const endpoint = import.meta.env.VITE_DIGEST_ENDPOINT;
  if (endpoint) {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, articles, html }),
    });
  } else {
    // Development mode — just log
    console.info('[Ghost Notes] Digest email would be sent:', { userId, articleCount: articles.length });
    console.info('[Ghost Notes] Digest HTML length:', html.length);
  }

  return { sent: true, articleCount: articles.length };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailActionUrl(action, articleId) {
  const base = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${base}/api/email-action?action=${action}&id=${articleId}`;
}
