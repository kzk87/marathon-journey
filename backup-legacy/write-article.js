class ArticleWriter {
    constructor() {
        this.checkAuthAndInit();
    }

    async checkAuthAndInit() {
        const isAuthenticated = await AuthManager.checkPassword();
        if (isAuthenticated) {
            this.init();
        } else {
            window.location.href = 'articles.html';
        }
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('articleForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('articleTitle').value.trim();
        const category = document.getElementById('articleCategory').value;
        const content = document.getElementById('articleContent').value.trim();

        // 入力検証
        if (!title || !category || !content) {
            alert('すべての項目を入力してください。');
            return;
        }

        if (title.length > 200) {
            alert('タイトルは200文字以内で入力してください。');
            return;
        }

        if (content.length > 50000) {
            alert('記事内容は50,000文字以内で入力してください。');
            return;
        }

        // XSS攻撃防止の検証
        if (!this.validateInput(title) || !this.validateInput(content)) {
            alert('不正な文字が含まれています。');
            return;
        }

        const formData = {
            id: Date.now(),
            title: this.escapeHtml(title),
            category: category,
            content: this.escapeHtml(content),
            date: new Date().toISOString(),
            likes: 0,
            comments: []
        };

        this.saveArticle(formData);
    }

    async saveArticle(article) {
        try {
            const response = await fetch('data/articles.json');
            let articles = [];
            if (response.ok) {
                articles = await response.json();
            }
            
            articles.unshift(article);
            
            const blob = new Blob([JSON.stringify(articles, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'articles.json';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('記事が投稿されました！\nダウンロードされたarticles.jsonファイルをdata/フォルダに上書きして、GitHubにコミットしてください。');
            
        } catch (error) {
            console.error('記事の保存に失敗しました:', error);
            alert('記事の保存に失敗しました。もう一度お試しください。');
        }
    }

    /**
     * XSS攻撃防止のためのHTML エスケープ
     * @param {string} text - エスケープするテキスト
     * @returns {string} - エスケープされたHTML安全なテキスト
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 入力値の妥当性検証
     * @param {string} input - 検証する入力値
     * @returns {boolean} - 妥当性
     */
    validateInput(input) {
        if (typeof input !== 'string') return false;
        if (input.length > 50000) return false; // 長すぎる入力を拒否
        
        // 危険なスクリプトタグなどを検出
        const dangerousPatterns = [
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<embed/gi,
            /<object/gi
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(input));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArticleWriter();
});