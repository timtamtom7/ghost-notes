// Platform Ecosystem and Integrations

const API_BASE = 'https://api.ghostnotes.app/v1';

// REST API Client
export class GhostNotesAPI {
  constructor(token) {
    this.token = token;
  }

  async fetchArticles(limit = 50) {
    const res = await fetch(`${API_BASE}/articles?limit=${limit}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }

  async saveArticle(url, metadata = {}) {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, ...metadata }),
    });
    return res.json();
  }

  async deleteArticle(id) {
    await fetch(`${API_BASE}/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  async getInsights(articleId) {
    const res = await fetch(`${API_BASE}/articles/${articleId}/insights`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }
}

// Readwise Integration
export class ReadwiseIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
  }

  async exportHighlights() {
    const res = await fetch('https://readwise.io/api/v2/export/', {
      headers: { Authorization: `Token ${this.apiToken}` },
    });
    return res.json();
  }

  async syncToGhostNotes(highlights) {
    const api = new GhostNotesAPI(localStorage.getItem('gn_token'));
    for (const highlight of highlights) {
      await api.saveArticle(highlight.url, {
        title: highlight.title,
        highlight: highlight.text,
        source: 'readwise',
      });
    }
  }
}

// Notion Integration
export class NotionIntegration {
  constructor(apiToken, databaseId) {
    this.apiToken = apiToken;
    this.databaseId = databaseId;
  }

  async syncToNotion(article) {
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: this.databaseId },
        properties: {
          Name: { title: [{ text: { content: article.title } }] },
          URL: { url: article.url },
          Tags: { multi_select: article.tags || [] },
        },
      }),
    });
  }
}

// Pocket Integration
export class PocketIntegration {
  constructor(accessToken, consumerKey) {
    this.accessToken = accessToken;
    this.consumerKey = consumerKey;
  }

  async fetchPocketArticles() {
    const res = await fetch('https://getpocket.com/v3/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_key: this.consumerKey,
        access_token: this.accessToken,
        count: 50,
      }),
    });
    return res.json();
  }
}

// Export targets
export const EXPORT_TARGETS = {
  PDF: 'pdf',
  MARKDOWN: 'markdown',
  NOTION: 'notion',
  READWISE: 'readwise',
  OBSIDIAN: 'obsidian',
};
