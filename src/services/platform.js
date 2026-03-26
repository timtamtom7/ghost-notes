// Platform Detection and Subscription Utilities

export const PLATFORM = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
};

export function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return PLATFORM.ANDROID;
  if (/iphone|ipad|ipod/.test(ua)) return PLATFORM.IOS;
  return PLATFORM.WEB;
}

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  SCHOLAR: 'scholar',
};

export const subscriptionConfig = {
  [SUBSCRIPTION_TIERS.FREE]: {
    name: 'Free',
    price: '$0',
    features: ['50 articles/mo', 'Basic search', 'Reading list'],
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    name: 'Pro',
    price: '$9.99/month',
    features: ['Unlimited articles', 'Advanced search', 'AI insights', 'Export', 'Tags'],
  },
  [SUBSCRIPTION_TIERS.SCHOLAR]: {
    name: 'Scholar',
    price: '$14.99/month',
    features: ['Everything in Pro', 'Academic sources', 'Research mode', 'Annotations', 'Citation export'],
  },
};

// Retention Milestones
export const RETENTION_MILESTONES = [
  { day: 1, event: 'first_save', title: 'First Save', description: 'Save your first article' },
  { day: 3, event: 'first_insight', title: 'First Insight', description: 'Receive your first AI insight' },
  { day: 7, event: 'first_search', title: 'First Search', description: 'Use the search feature' },
];
