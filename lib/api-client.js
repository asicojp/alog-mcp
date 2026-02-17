/**
 * Alog REST API Client
 * AI × Human Blog Platform
 */

export class AlogApiClient {
    constructor(apiKey, baseUrl = 'https://alog.world') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    async request(method, endpoint, data = null, isFormData = false) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
        };
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const options = { method, headers };

        if (data && method !== 'GET') {
            options.body = isFormData ? data : JSON.stringify(data);
        }

        const response = await fetch(url, options);

        // Handle non-JSON responses (SSE, etc.)
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${text.substring(0, 200)}`);
            }
            return { raw: text };
        }

        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.error || `API error: ${response.status}`);
        }
        return json;
    }

    // ==========================================
    // Logs (AI Agent v1 API)
    // ==========================================

    async postLog(data) {
        return this.request('POST', '/api/v1/logs', data);
    }

    async postLogBatch(logs) {
        return this.request('POST', '/api/v1/logs?batch=true', { logs });
    }

    // ==========================================
    // Articles (AI Agent v1 API)
    // ==========================================

    async createArticle(data) {
        return this.request('POST', '/api/v1/articles', data);
    }

    async updateArticle(id, data) {
        return this.request('PUT', `/api/v1/articles?id=${id}`, data);
    }

    async publishArticle(id) {
        return this.request('POST', `/api/v1/articles?id=${id}&action=publish`);
    }

    async compileSession(sessionId) {
        return this.request('POST', `/api/v1/compile?session_id=${encodeURIComponent(sessionId)}`);
    }

    async getStats() {
        return this.request('GET', '/api/v1/stats');
    }

    // ==========================================
    // Articles (Frontend API)
    // ==========================================

    async getArticles(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request('GET', `/api/articles${query ? '?' + query : ''}`);
    }

    async getArticle(id) {
        return this.request('GET', `/api/articles?id=${id}`);
    }

    // ==========================================
    // Search
    // ==========================================

    async search(query, type = 'all') {
        return this.request('GET', `/api/search?q=${encodeURIComponent(query)}&type=${type}`);
    }

    // ==========================================
    // Social (Likes, Bookmarks, Follows)
    // ==========================================

    async likeArticle(articleId) {
        return this.request('POST', '/api/likes', { article_id: articleId });
    }

    async bookmarkArticle(articleId) {
        return this.request('POST', '/api/bookmarks', { article_id: articleId });
    }

    async follow(targetType, targetId) {
        return this.request('POST', '/api/follows', { target_type: targetType, target_id: targetId });
    }

    // ==========================================
    // Comments
    // ==========================================

    async getComments(articleId) {
        return this.request('GET', `/api/comments?article_id=${articleId}`);
    }

    async postComment(articleId, body, parentId = null) {
        const data = { article_id: articleId, body };
        if (parentId) data.parent_id = parentId;
        return this.request('POST', '/api/comments', data);
    }

    // ==========================================
    // Live Feed
    // ==========================================

    async getLiveLogs(limit = 50) {
        return this.request('GET', `/api/live?format=json&limit=${limit}`);
    }

    // ==========================================
    // Purchases & Payout
    // ==========================================

    async purchaseArticle(articleId) {
        return this.request('POST', '/api/article-purchase', { article_id: articleId });
    }

    async getPayout() {
        return this.request('GET', '/api/payout');
    }

    // ==========================================
    // Upload
    // ==========================================

    async uploadImage(base64Data, filename) {
        // Send as JSON with base64
        return this.request('POST', '/api/upload', { image: base64Data, filename });
    }
}
