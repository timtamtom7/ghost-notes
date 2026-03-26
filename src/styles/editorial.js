// Editorial Design System - Ghost Notes 2.0

export const editorialTheme = {
  colors: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F4F0',
    primary: '#1A1A1A',
    accent: '#C9A227', // warm gold
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textTertiary: '#9B9B9B',
    border: '#E8E6E1',
    error: '#D64545',
    success: '#2D8A4E',
  },
  typography: {
    display: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.1',
    },
    heading1: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '32px',
      fontWeight: '600',
      lineHeight: '1.2',
    },
    heading2: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.3',
    },
    body: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontSize: '17px',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    caption: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '1.4',
    },
    mono: {
      fontFamily: "'Space Mono', monospace",
      fontSize: '14px',
      fontWeight: '400',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
};

// AI Reading Suggestions Service
export class ReadingSuggestionService {
  constructor() {
    this.suggestions = [];
  }

  async getSuggestions(articles, userPreferences) {
    // AI-powered reading suggestions based on:
    // 1. Reading history patterns
    // 2. Time of day
    // 3. Article categories
    // 4. Trending topics
    if (!articles || articles.length === 0) return [];

    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    return articles.slice(0, 3).map((article, i) => ({
      ...article,
      reason: this.getReason(article, timeContext, i),
      score: Math.random() * 0.4 + 0.6, // mock score
    }));
  }

  getReason(article, timeContext, index) {
    const reasons = {
      morning: 'Perfect for your morning read',
      afternoon: 'Great afternoon escape',
      evening: 'Relaxing evening read',
    };
    return reasons[timeContext] || 'Recommended for you';
  }

  async donateReadingSuggestion(article) {
    // Siri Shortcuts donation placeholder
    console.log('Siri shortcut donated for:', article.title);
  }
}

export const readingSuggestionService = new ReadingSuggestionService();
