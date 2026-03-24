import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';

export function useLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);

  useEffect(() => {
    if (!user) {
      setLists([]);
      return;
    }

    const q = query(
      collection(db, 'lists'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setLists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user]);

  const createList = async (name) => {
    if (!user) throw new Error('Not authenticated');
    const ref = await addDoc(collection(db, 'lists'), {
      userId: user.uid,
      name,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  };

  const deleteList = async (listId) => {
    if (!user) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'lists', listId));
  };

  const renameList = async (listId, name) => {
    if (!user) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'lists', listId), { name });
  };

  return { lists, createList, deleteList, renameList };
}
