import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription, PLANS } from '../hooks/useSubscription';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Toast from '../components/Toast';
import './Settings.css';

export default function Settings() {
  const { user, logOut } = useAuth();
  const { plan } = useSubscription();
  const [theme, setTheme] = useState(() => localStorage.getItem('gn-theme') || 'dark');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [haulFrequency, setHaulFrequency] = useState('7');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleThemeChange = (next) => {
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gn-theme', next);
    showToast(`${next === 'dark' ? 'Dark' : 'Light'} mode applied.`);
  };

  const handleExport = async () => {
    try {
      const q = query(collection(db, 'saves'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ghost-notes-export.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully.');
    } catch {
      showToast('Export failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await logOut();
  };

  const planLabel = {
    [PLANS.FREE]: 'Free',
    [PLANS.PRO]: 'Pro',
    [PLANS.TEAM]: 'Team',
  }[plan] || 'Free';

  const planColors = {
    [PLANS.FREE]: 'var(--text-muted)',
    [PLANS.PRO]: 'var(--color-accent)',
    [PLANS.TEAM]: 'var(--color-accent)',
  }[plan] || 'var(--text-muted)';

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Preferences for your Ghost Notes experience.</p>
      </div>

      <div className="settings-sections">

        {/* Subscription */}
        <section className="settings-section">
          <h2 className="settings-section-title">Subscription</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Current plan</span>
                <span className="settings-row-desc" style={{ color: planColors, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {planLabel}
                  {plan === PLANS.PRO && (
                    <span className="pro-badge" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Pro</span>
                  )}
                </span>
              </div>
              {plan === PLANS.FREE && (
                <Link to="/pricing" className="btn btn-primary btn-sm">
                  Upgrade
                </Link>
              )}
              {plan !== PLANS.FREE && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Active
                </span>
              )}
            </div>

            {plan === PLANS.FREE && (
              <>
                <div className="settings-divider" />
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-row-label">Saved articles</span>
                    <span className="settings-row-desc">
                      0 / 5 on Free plan
                    </span>
                  </div>
                  <Link to="/pricing" className="btn btn-secondary btn-sm">
                    See Pro features
                  </Link>
                </div>
              </>
            )}

            {plan !== PLANS.FREE && (
              <>
                <div className="settings-divider" />
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-row-label">Billing</span>
                    <span className="settings-row-desc">Manage your subscription and billing details.</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" disabled>
                    Manage billing
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-section">
          <h2 className="settings-section-title">Appearance</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Theme</span>
                <span className="settings-row-desc">Choose your reading environment.</span>
              </div>
              <div className="settings-theme-toggle">
                {['dark', 'light'].map((t) => (
                  <button
                    key={t}
                    className={`settings-theme-btn${theme === t ? ' active' : ''}`}
                    onClick={() => handleThemeChange(t)}
                  >
                    {t === 'dark' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                      </svg>
                    )}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Haul Settings */}
        <section className="settings-section">
          <h2 className="settings-section-title">The Haul</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Email reminders</span>
                <span className="settings-row-desc">Get a weekly nudge when your Haul is waiting.</span>
              </div>
              <button
                className={`settings-toggle${emailEnabled ? ' on' : ''}`}
                onClick={() => { setEmailEnabled(!emailEnabled); showToast(emailEnabled ? 'Email reminders off.' : 'Email reminders on.'); }}
                role="switch"
                aria-checked={emailEnabled}
              >
                <span className="settings-toggle-thumb" />
              </button>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Haul frequency</span>
                <span className="settings-row-desc">How often should your pile surface?</span>
              </div>
              <select
                className="settings-select"
                value={haulFrequency}
                onChange={(e) => { setHaulFrequency(e.target.value); showToast('Haul frequency updated.'); }}
              >
                <option value="3">Every 3 days</option>
                <option value="7">Every 7 days</option>
                <option value="14">Every 14 days</option>
              </select>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="settings-section">
          <h2 className="settings-section-title">Account</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Email</span>
                <span className="settings-row-desc" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Export data</span>
                <span className="settings-row-desc">Download all your saved articles as JSON.</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                Export
              </button>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label" style={{ color: 'var(--color-error)' }}>Sign out</span>
                <span className="settings-row-desc">Your articles remain saved in Ghost Notes.</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="settings-section">
          <h2 className="settings-section-title">About</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Ghost Notes</span>
                <span className="settings-row-desc">Version 1.0.0 — Phase 1 MVP</span>
              </div>
            </div>
            <div className="settings-divider" />
            <p className="settings-about">
              "The things you meant to read." Built with care for readers who save more than they finish.
            </p>
          </div>
        </section>

      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
