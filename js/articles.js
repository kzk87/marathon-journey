class ArticlesManager {
    constructor() {
        this.articles = JSON.parse(localStorage.getItem('marathonArticles')) || [];
        this.init();
    }

    init() {
        this.displayArticles();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('like-btn')) {
                this.handleLike(e.target);
            } else if (e.target.classList.contains('comment-toggle')) {
                this.toggleComments(e.target);
            } else if (e.target.classList.contains('comment-submit')) {
                this.handleComment(e.target);
            } else if (e.target.classList.contains('delete-btn')) {
                await this.deleteArticle(e.target);
            } else if (e.target.classList.contains('delete-comment-btn')) {
                await this.deleteComment(e.target);
            }
        });
    }

    displayArticles() {
        const container = document.getElementById('articlesList');
        
        if (this.articles.length === 0) {
            container.innerHTML = `
                <div class="empty-articles">
                    <h3>まだ記事がありません</h3>
                    <p>最初の記事を投稿してみましょう！</p>
                    <a href="write-article.html" class="write-btn">記事を書く</a>
                </div>
            `;
            return;
        }

        const articlesHTML = this.articles.map(article => this.createArticleHTML(article)).join('');
        container.innerHTML = articlesHTML;
    }

    createArticleHTML(article) {
        const categoryLabels = {
            'training': 'トレーニング',
            'nutrition': '栄養・食事',
            'gear': 'ギア・用品',
            'mindset': 'メンタル',
            'race': 'レース',
            'recovery': '回復・ケア',
            'other': 'その他'
        };

        const formattedDate = this.formatDate(article.date);
        const categoryLabel = categoryLabels[article.category] || article.category;
        const preview = this.createPreview(article.content, 200);

        return `
            <article class="article-card" data-id="${article.id}">
                <div class="article-header">
                    <div class="article-meta">
                        <span class="article-date">${formattedDate}</span>
                        <span class="article-category">${categoryLabel}</span>
                    </div>
                    <button class="delete-btn" data-id="${article.id}">削除</button>
                </div>
                
                <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                <div class="article-content">${this.escapeHtml(preview)}</div>
                
                <div class="article-actions">
                    <div class="article-stats">
                        <button class="like-btn ${article.liked ? 'liked' : ''}" data-id="${article.id}">
                            <span>${article.liked ? '❤️' : '🤍'}</span>
                            <span>${article.likes}</span>
                        </button>
                        <button class="comment-toggle" data-id="${article.id}">
                            <span>💬</span>
                            <span>${article.comments.length}</span>
                        </button>
                    </div>
                </div>
                
                <div class="comments-section" id="comments-${article.id}">
                    <div class="comment-form">
                        <textarea class="comment-input" placeholder="コメントを入力..." data-id="${article.id}"></textarea>
                        <button class="comment-submit" data-id="${article.id}">コメント投稿</button>
                    </div>
                    <div class="comments-list">
                        ${article.comments.map(comment => this.createCommentHTML(comment, article.id)).join('')}
                    </div>
                </div>
            </article>
        `;
    }

    createCommentHTML(comment, articleId) {
        return `
            <div class="comment-item">
                <div class="comment-meta">
                    ${this.formatDate(comment.date)}
                    <button class="delete-comment-btn" data-article-id="${articleId}" data-comment-id="${comment.id}">削除</button>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
        `;
    }

    createPreview(content, maxLength) {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ja-JP', options);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // いいね機能
    handleLike(button) {
        const articleId = parseInt(button.dataset.id);
        const article = this.articles.find(a => a.id === articleId);
        
        if (article) {
            if (article.liked) {
                article.likes = Math.max(0, article.likes - 1);
                article.liked = false;
                button.classList.remove('liked');
                button.querySelector('span:first-child').textContent = '🤍';
            } else {
                article.likes += 1;
                article.liked = true;
                button.classList.add('liked');
                button.querySelector('span:first-child').textContent = '❤️';
            }
            
            button.querySelector('span:last-child').textContent = article.likes;
            this.saveArticles();
        }
    }

    // コメント表示切り替え
    toggleComments(button) {
        const articleId = button.dataset.id;
        const commentsSection = document.getElementById(`comments-${articleId}`);
        
        if (commentsSection.classList.contains('show')) {
            commentsSection.classList.remove('show');
            button.classList.remove('active');
        } else {
            commentsSection.classList.add('show');
            button.classList.add('active');
        }
    }

    // コメント投稿
    handleComment(button) {
        const articleId = parseInt(button.dataset.id);
        const textarea = document.querySelector(`.comment-input[data-id="${articleId}"]`);
        const commentText = textarea.value.trim();
        
        if (!commentText) {
            alert('コメントを入力してください。');
            return;
        }

        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            const newComment = {
                id: Date.now(),
                text: commentText,
                date: new Date().toISOString()
            };
            
            article.comments.push(newComment);
            textarea.value = '';
            
            this.saveArticles();
            this.displayArticles();
            
            // コメントセクションを開いたままにする
            setTimeout(() => {
                const commentsSection = document.getElementById(`comments-${articleId}`);
                const toggleButton = document.querySelector(`.comment-toggle[data-id="${articleId}"]`);
                if (commentsSection && toggleButton) {
                    commentsSection.classList.add('show');
                    toggleButton.classList.add('active');
                }
            }, 100);
        }
    }

    async deleteArticle(button) {
        const isAuthenticated = await AuthManager.checkPassword();
        if (!isAuthenticated) return;
        
        const articleId = parseInt(button.dataset.id);
        
        if (!confirm('この記事を削除しますか？')) return;
        
        this.articles = this.articles.filter(article => article.id !== articleId);
        this.saveArticles();
        this.displayArticles();
    }

    async deleteComment(button) {
        const isAuthenticated = await AuthManager.checkPassword();
        if (!isAuthenticated) return;
        
        const articleId = parseInt(button.dataset.articleId);
        const commentId = parseInt(button.dataset.commentId);
        
        if (!confirm('このコメントを削除しますか？')) return;
        
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.comments = article.comments.filter(comment => comment.id !== commentId);
            this.saveArticles();
            this.displayArticles();
        }
    }

    saveArticles() {
        localStorage.setItem('marathonArticles', JSON.stringify(this.articles));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArticlesManager();
});