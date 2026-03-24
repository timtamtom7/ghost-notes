import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';

const SubscriptionContext = createContext(null);

// Plan constants
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
};

export const PLAN_LIMITS = {
  [PLANS.FREE]: 5,
  [PLANS.PRO]: Infinity,
  [PLANS.TEAM]: Infinity,
};

export const PLAN_FEATURES = {
  [PLANS.FREE]: {
    maxArticles: 5,
    cloudBackup: false,
    advancedStats: false,
    exportData: false,
    teamFeatures: false,
  },
  [PLANS.PRO]: {
    maxArticles: Infinity,
    cloudBackup: true,
    advancedStats: true,
    exportData: true,
    teamFeatures: false,
  },
  [PLANS.TEAM]: {
    maxArticles: Infinity,
    cloudBackup: true,
    advancedStats: true,
    exportData: true,
    teamFeatures: true,
  },
};

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState(PLANS.FREE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan(PLANS.FREE);
      setLoading(false);
      return;
    }

    // In a real app, this would be a Firestore subscription to a subscriptions collection.
    // For now, we store plan info in the user profile.
    const profileRef = doc(db, 'profiles', user.uid);
    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setPlan(snap.data().plan || PLANS.FREE);
      } else {
        setPlan(PLANS.FREE);
      }
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const features = PLAN_FEATURES[plan] || PLAN_FEATURES[PLANS.FREE];
  const limit = PLAN_LIMITS[plan] || 5;

  return (
    <SubscriptionContext.Provider value={{ plan, loading, features, limit }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
