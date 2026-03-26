// Company Structure and Investment Readiness

export const COMPANY = {
  name: 'Ghost Notes Technologies, Inc.',
  founded: '2023',
  website: 'ghostnotes.app',
  structure: 'C-Corp (Delaware)',
  stage: 'Bootstrapped / Pre-seed',
  employees: 1,
};

export const TEAM_MEMBERS = [
  { name: 'Founder', role: 'CEO / Full-Stack', responsibilities: ['Product', 'Engineering', 'Design'] },
];

export const SUBSCRIPTION_PRICING = {
  free: { name: 'Free', price: 0, articlesPerMonth: 50 },
  pro: { name: 'Pro', price: 9.99, articlesPerMonth: -1, features: ['Unlimited articles', 'AI insights', 'Export'] },
  scholar: { name: 'Scholar', price: 14.99, articlesPerMonth: -1, features: ['Everything in Pro', 'Academic sources', 'Annotations'] },
};

export const FINANCIAL_METRICS = {
  get arr() { return 0; }, // placeholder
  arrTarget: 500000,
  activeSubscribers: 0,
  churnRate: 0.05,
  ltv: 180,
  cac: 15,
  get progressToTarget() { return Math.min(1, this.arr / this.arrTarget); },
};

export const INVESTMENT_CHECKLIST = [
  { title: 'Business Plan', completed: true, notes: 'Platform expansion strategy' },
  { title: 'Financial Model', completed: true, notes: 'ARR projections to $500K' },
  { title: 'Cap Table', completed: false, notes: 'Pending legal setup' },
  { title: 'Pitch Deck', completed: false, notes: 'Draft complete, needs polish' },
  { title: 'Unit Economics', completed: true, notes: 'LTV:CAC > 3x' },
  { title: 'Traction Metrics', completed: true, notes: 'Active user growth tracked' },
];

export const HIRING_PLAN = [
  { role: 'Senior iOS Engineer', timing: 'Q1 2025', priority: 'high', salaryRange: '$120-150K' },
  { role: 'ML Engineer (Reading AI)', timing: 'Q2 2025', priority: 'high', salaryRange: '$130-160K' },
];
