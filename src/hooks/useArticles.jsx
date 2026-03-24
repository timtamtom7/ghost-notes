import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';

export function useArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [archivedArticles, setArchivedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to active (unread) articles — the Haul
  useEffect(() => {
    if (!user) {
      setArticles([]);
      return;
    }

    const q = query(
      collection(db, 'saves'),
      where('userId', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('savedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user]);

  // Subscribe to archived articles
  useEffect(() => {
    if (!user) {
      setArchivedArticles([]);
      return;
    }

    const q = query(
      collection(db, 'saves'),
      where('userId', '==', user.uid),
      where('status', '==', 'archived'),
      orderBy('archivedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setArchivedArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user]);

  const saveArticle = async ({ url, title, description, favicon, readingTime }) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      const articleRef = await addDoc(collection(db, 'saves'), {
        userId: user.uid,
        url,
        title: title || url,
        description: description || '',
        favicon: favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`,
        readingTime: readingTime || null,
        savedAt: serverTimestamp(),
        status: 'active',
        listId: null,
        listName: null,
      });
      return articleRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const archiveArticle = async (articleId, action = 'read') => {
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'saves', articleId);
    await updateDoc(ref, {
      status: 'archived',
      archivedAt: serverTimestamp(),
      archiveAction: action, // 'read' or 'culled'
    });
  };

  const reSaveArticle = async (articleId) => {
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'saves', articleId);
    await updateDoc(ref, {
      status: 'active',
      archivedAt: null,
      archiveAction: null,
    });
  };

  const deleteArticle = async (articleId) => {
    if (!user) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'saves', articleId));
  };

  const moveToList = async (articleId, listId, listName) => {
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'saves', articleId);
    await updateDoc(ref, { listId, listName });
  };

  return {
    articles,
    archivedArticles,
    loading,
    error,
    saveArticle,
    archiveArticle,
    reSaveArticle,
    deleteArticle,
    moveToList,
  };
}
