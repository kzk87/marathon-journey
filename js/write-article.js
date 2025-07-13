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
        
        const formData = {
            id: Date.now(),
            title: document.getElementById('articleTitle').value.trim(),
            category: document.getElementById('articleCategory').value,
            content: document.getElementById('articleContent').value.trim(),
            date: new Date().toISOString(),
            likes: 0,
            comments: []
        };

        if (!formData.title || !formData.category || !formData.content) {
            alert('すべての項目を入力してください。');
            return;
        }

        this.saveArticle(formData);
    }

    saveArticle(article) {
        let articles = JSON.parse(localStorage.getItem('marathonArticles')) || [];
        articles.unshift(article);
        localStorage.setItem('marathonArticles', JSON.stringify(articles));
        
        alert('記事が投稿されました！');
        window.location.href = 'articles.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArticleWriter();
});