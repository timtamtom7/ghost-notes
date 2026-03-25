import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Profile.css';

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [ghostNotes, setGhostNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setNotFound(false);

      // Look up user by username in their profile document
      // We store username in profiles collection with username field
      const q = query(
        collection(db, 'profiles'),
        where('username', '==', username)
      );

      try {
        const snap = await getDocs(q);

        if (snap.empty) {
          // Try matching by uid (username === uid fallback for now)
          const profileRef = doc(db, 'profiles', username);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setProfile({ uid: username, username, ...data });
            await fetchPublicArticles(username);
          } else {
            setNotFound(true);
          }
        } else {
          const data = snap.docs[0].data();
          const uid = snap.docs[0].id;
          setProfile({ uid, username, ...data });
          await fetchPublicArticles(uid);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const fetchPublicArticles = async (uid) => {
    // Fetch public shared articles (status === 'shared')
    const q = query(
      collection(db, 'saves'),
      where('userId', '==', uid),
      where('isPublic', '==', true),
      orderBy('savedAt', 'desc'),
      limit(20)
    );

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setArticles(items);

    // Separate ghost notes (quotes/highlights)
    const notes = items.filter((a) => a.ghostNote);
    setGhostNotes(notes);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading profile…
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>👻</p>
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Ghost not found
          </p>
          <p>This profile doesn't exist or is private.</p>
          <Link to="/" style={{ color: 'var(--color-accent)', marginTop: 12, display: 'inline-block' }}>
            Go to Ghost Notes
          </Link>
        </div>
      </div>
    );
  }

  const initial = (profile?.username || profile?.email || '?')[0].toUpperCase();
  const publicCount = articles.length;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <h1 className="profile-username">@{profile?.username || profile?.email?.split('@')[0]}</h1>
        {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{publicCount}</div>
            <div className="profile-stat-label">Shared</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{ghostNotes.length}</div>
            <div className="profile-stat-label">Ghost Notes</div>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="profile-empty">
          <p>No shared articles yet.</p>
        </div>
      ) : (
        <>
          {ghostNotes.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 className="profile-section-title">Ghost Notes</h2>
              {ghostNotes.map((note) => (
                <div key={note.id} className="profile-ghost-note">
                  <p className="profile-ghost-note-text">"{note.ghostNote}"</p>
                  <p className="profile-ghost-note-source">
                    — {note.title}{' '}
                    <a href={note.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                      ({getDomain(note.url)})
                    </a>
                  </p>
                </div>
              ))}
            </section>
          )}

          <section>
            <h2 className="profile-section-title">Shared Reading</h2>
            <div className="profile-grid">
              {articles.filter((a) => !a.ghostNote).map((article) => (
                <a
                  key={article.id}
                  className="profile-article-card"
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="profile-article-favicon"
                    src={article.favicon || `https://www.google.com/s2/favicons?domain=${getDomain(article.url)}&sz=32`}
                    alt=""
                    width="32"
                    height="32"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="profile-article-info">
                    <p className="profile-article-title">{article.title || article.url}</p>
                    <p className="profile-article-domain">{getDomain(article.url)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
