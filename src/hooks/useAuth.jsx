import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailLink,
  sendSignInLinkToEmail,
  onAuthStateChanged,
  signOut,
  isSignInWithEmailLink,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Upsert profile in Firestore
        const profileRef = doc(db, 'profiles', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            email: firebaseUser.email,
            createdAt: new Date().toISOString(),
            settings: {
              theme: 'dark',
              emailEnabled: false,
              haulFrequencyDays: 7,
            },
          });
        }
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const sendMagicLink = async (email) => {
    const actionCodeSettings = {
      url: window.location.origin + '/auth',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  };

  const confirmMagicLink = async (email) => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      // Clear the URL to avoid exposing the link
      window.history.replaceState({}, document.title, '/auth');
      return result.user;
    }
    throw new Error('Invalid sign-in link');
  };

  const logOut = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, sendMagicLink, confirmMagicLink, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
