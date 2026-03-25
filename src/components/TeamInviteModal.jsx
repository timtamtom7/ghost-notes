import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTeams, ROLES } from '../hooks/useTeams';
import './TeamInviteModal.css';

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MEMBER]: 'Member',
};

export default function TeamInviteModal({ team, onClose }) {
  const { inviteMember } = useTeams();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.MEMBER);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState([]);

  useEffect(() => {
    // Fetch pending invites
    const fetchInvites = async () => {
      const q = query(
        collection(db, 'teams', team.id, 'invites'),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchInvites();
  }, [team.id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError('');
    try {
      await inviteMember(team.id, email.trim(), role);
      setSent(true);
      setEmail('');
      // Refresh pending invites
      const q = query(
        collection(db, 'teams', team.id, 'invites'),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="invite-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="invite-modal">
        <div className="invite-modal-header">
          <h2 className="invite-modal-title">Invite to {team.name}</h2>
          <button className="invite-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleInvite}>
          <div className="invite-field">
            <label className="invite-label">Email address</label>
            <input
              type="email"
              className="invite-input"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="invite-field">
            <label className="invite-label">Role</label>
            <select
              className="invite-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value={ROLES.MEMBER}>Member — can read and manage shared lists</option>
              <option value={ROLES.ADMIN}>Admin — full access including inviting others</option>
            </select>
            <p className="invite-hint">
              Admins can invite new members and manage shared lists.
            </p>
          </div>

          {sent && (
            <div className="invite-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Invite sent to {email}!
            </div>
          )}

          {error && (
            <div className="invite-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}

          <div className="invite-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Done
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={sending || !email.trim()}
            >
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>

        {pending.length > 0 && (
          <div className="invite-pending-list">
            <p className="invite-pending-title">Pending Invites</p>
            {pending.map((inv) => (
              <div key={inv.id} className="invite-pending-item">
                <div>
                  <div className="invite-pending-email">{inv.email}</div>
                  <div className="invite-pending-role">{ROLE_LABELS[inv.role] || inv.role}</div>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
