import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription, PLANS } from '../hooks/useSubscription';
import { useTeams, ROLES } from '../hooks/useTeams';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import Toast from '../components/Toast';
import ImportModal from '../components/ImportModal';
import TeamInviteModal from '../components/TeamInviteModal';
import './Settings.css';

export default function Settings() {
  const { user, logOut } = useAuth();
  const { plan } = useSubscription();
  const { teams, createTeam, leaveTeam, deleteTeam } = useTeams();
  const [theme, setTheme] = useState(() => localStorage.getItem('gn-theme') || 'dark');
  const [emailEnabled, setEmailEnabled] = useState(() => {
    return localStorage.getItem('gn-email-enabled') === 'true';
  });
  const [haulFrequency, setHaulFrequency] = useState(() => localStorage.getItem('gn-haul-freq') || '7');
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [inviteTeam, setInviteTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);

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

  const handleEmailToggle = async (val) => {
    setEmailEnabled(val);
    localStorage.setItem('gn-email-enabled', val ? 'true' : 'false');
    showToast(val ? 'Email reminders enabled.' : 'Email reminders disabled.');
    // Persist to Firestore profile
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        'settings.emailEnabled': val,
        'settings.haulFrequencyDays': parseInt(haulFrequency, 10),
      });
    } catch (err) {
      console.warn('Could not save email pref to Firestore:', err);
    }
  };

  const handleHaulFrequencyChange = async (val) => {
    setHaulFrequency(val);
    localStorage.setItem('gn-haul-freq', val);
    showToast('Haul frequency updated.');
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        'settings.haulFrequencyDays': parseInt(val, 10),
        'settings.emailEnabled': emailEnabled,
      });
    } catch (err) {
      console.warn('Could not save freq pref to Firestore:', err);
    }
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

  const handleImport = async (items) => {
    // Import items into Firestore directly
    let imported = 0;
    for (const item of items) {
      try {
        await addDoc(collection(db, 'saves'), {
          userId: user.uid,
          url: item.url,
          title: item.title || item.url,
          description: item.description || '',
          favicon: item.favicon || '',
          readingTime: item.readingTime || null,
          savedAt: serverTimestamp(),
          status: 'active',
          listId: null,
          listName: null,
        });
        imported++;
      } catch {
        // Skip duplicates or failures silently
      }
    }
    showToast(`Imported ${imported} articles.`);
    return { imported };
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      showToast('Team created!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      await leaveTeam(teamId);
      showToast('Left team.');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteTeam(teamId);
      showToast('Team deleted.');
    } catch (err) {
      showToast(err.message);
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
                onClick={() => handleEmailToggle(!emailEnabled)}
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
                onChange={(e) => handleHaulFrequencyChange(e.target.value)}
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

        {/* Import */}
        <section className="settings-section">
          <h2 className="settings-section-title">Import</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Import from other services</span>
                <span className="settings-row-desc">Bring your Pocket, Instapaper, or browser bookmarks here.</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
                Import articles
              </button>
            </div>
          </div>
        </section>

        {/* Teams */}
        {plan !== PLANS.FREE && (
          <section className="settings-section">
            <h2 className="settings-section-title">Teams</h2>
            <div className="settings-card">
              {teams.length === 0 ? (
                <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                  <div className="settings-row-info">
                    <span className="settings-row-label">No teams yet</span>
                    <span className="settings-row-desc">Create a team to share lists with colleagues.</span>
                  </div>
                  <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <input
                      type="text"
                      className="settings-input"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-default)',
                        background: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                      }}
                      placeholder="Team name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={creatingTeam || !newTeamName.trim()}>
                      {creatingTeam ? 'Creating…' : 'Create'}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {teams.map((team) => {
                    const myRole = team.memberRoles?.[user.uid];
                    return (
                      <div key={team.id}>
                        <div className="settings-row">
                          <div className="settings-row-info">
                            <span className="settings-row-label">{team.name}</span>
                            <span className="settings-row-desc">
                              {team.members?.length || 1} member{(team.members?.length || 1) !== 1 ? 's' : ''} ·{' '}
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                {myRole === ROLES.OWNER ? 'Owner' : myRole === ROLES.ADMIN ? 'Admin' : 'Member'}
                              </span>
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {(myRole === ROLES.OWNER || myRole === ROLES.ADMIN) && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setInviteTeam(team)}
                              >
                                Invite
                              </button>
                            )}
                            {myRole !== ROLES.OWNER && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleLeaveTeam(team.id)}
                              >
                                Leave
                              </button>
                            )}
                            {myRole === ROLES.OWNER && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteTeam(team.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="settings-divider" />
                      </div>
                    );
                  })}
                  <div className="settings-row">
                    <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <input
                        type="text"
                        placeholder="New team name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border-default)',
                          background: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-body)',
                          outline: 'none',
                        }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm" disabled={creatingTeam || !newTeamName.trim()}>
                        Create team
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Pro Features */}
        {plan !== PLANS.FREE && (
          <section className="settings-section">
            <h2 className="settings-section-title">Pro Features</h2>
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-row-label">Offline reading</span>
                  <span className="settings-row-desc">Save articles for offline access. Works on mobile and desktop.</span>
                </div>
                <span className="settings-pro-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Included
                </span>
              </div>
              <div className="settings-divider" />
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-row-label">Readwise integration</span>
                  <span className="settings-row-desc">Sync your highlights to Readwise for spaced repetition.</span>
                </div>
                <Link to="/app/settings" className="btn btn-secondary btn-sm">
                  Connect
                </Link>
              </div>
              <div className="settings-divider" />
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-row-label">API access</span>
                  <span className="settings-row-desc">Build automations with the Ghost Notes API.</span>
                </div>
                <Link to="/api" className="btn btn-secondary btn-sm">
                  View docs
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Public Profile */}
        <section className="settings-section">
          <h2 className="settings-section-title">Public Profile</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Your public link</span>
                <span className="settings-row-desc">Share your reading list publicly.</span>
              </div>
              <Link
                to={`/u/${user.uid}`}
                className="btn btn-secondary btn-sm"
                target="_blank"
              >
                View profile
              </Link>
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

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      )}

      {inviteTeam && (
        <TeamInviteModal
          team={inviteTeam}
          onClose={() => setInviteTeam(null)}
        />
      )}
    </div>
  );
}
