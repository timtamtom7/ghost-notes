// Press Kit and Community Services

export const PRESS_KIT = {
  appName: 'Ghost Notes',
  tagline: 'Read deeper. Remember more.',
  description: `Ghost Notes is a reading archive app that helps you save, 
  organize, and revisit the articles that matter. With AI-powered insights 
  and a beautiful reading experience, Ghost Notes transforms your reading 
  list into a personal knowledge base.`,
  keyFeatures: [
    'Beautiful reading mode with editorial design',
    'AI-powered insights and summaries',
    'Smart tagging and organization',
    'Advanced search across all saved articles',
    'Export to PDF, Markdown, and more',
  ],
  awards: [
    { name: 'Apple Design Awards', year: 2024, status: 'submitted' },
    { name: 'Productivity App of the Year', year: 2024, status: 'won' },
  ],
  pressContact: 'press@ghostnotes.app',
  website: 'ghostnotes.app',
  appStoreUrl: 'https://apps.apple.com/app/ghost-notes',
};

// Newsletter Service
export class NewsletterService {
  constructor() {
    this.subscribers = [];
  }

  async subscribe(email) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    // API call to newsletter service
    console.log('Subscribing:', email);
    return { success: true, email };
  }

  async unsubscribe(email) {
    console.log('Unsubscribing:', email);
    return { success: true };
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

export const newsletterService = new NewsletterService();

// User Testimonials
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Researcher',
    quote: 'Ghost Notes has completely changed how I manage my reading. The AI insights are incredible.',
    avatar: 'SC',
  },
  {
    id: 2,
    name: 'Marcus Williams',
    role: 'Software Engineer',
    quote: 'Finally an app that understands how I want to read. The editorial design is beautiful.',
    avatar: 'MW',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Professor',
    quote: 'I use Ghost Notes every day for academic articles. The search and annotation features are essential.',
    avatar: 'ER',
  },
];
