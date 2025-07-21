/**
 * Firebase記事管理システム
 * リアルタイム記事投稿・表示・コメント機能
 */

class FirebaseArticlesManager {
    constructor() {
        this.db = null;
        this.articles = [];
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        try {
            // Firebase初期化を待つ
            const firebase = await window.initializeFirebase();
            this.db = firebase.db;
            
            // Firestore関数を動的インポート
            const firestoreFunctions = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            this.collection = firestoreFunctions.collection;
            this.doc = firestoreFunctions.doc;
            this.addDoc = firestoreFunctions.addDoc;
            this.updateDoc = firestoreFunctions.updateDoc;
            this.deleteDoc = firestoreFunctions.deleteDoc;
            this.getDocs = firestoreFunctions.getDocs;
            this.onSnapshot = firestoreFunctions.onSnapshot;
            this.orderBy = firestoreFunctions.orderBy;
            this.query = firestoreFunctions.query;
            this.serverTimestamp = firestoreFunctions.serverTimestamp;
            
            console.log('✅ Firebase記事システム初期化完了');
            
            // リアルタイム記事監視を開始
            this.startRealtimeUpdates();
            
        } catch (error) {
            console.error('❌ Firebase記事システム初期化エラー:', error);
            // Firebaseが失敗した場合はJSONフォールバック
            this.fallbackToJSON();
        }
    }

    /**
     * リアルタイム記事更新の監視開始
     */
    startRealtimeUpdates() {
        try {
            const articlesRef = this.collection(this.db, 'articles');
            const q = this.query(articlesRef, this.orderBy('createdAt', 'desc'));
            
            this.unsubscribe = this.onSnapshot(q, (snapshot) => {
                this.articles = [];
                snapshot.forEach((doc) => {
                    this.articles.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`📰 記事データ更新: ${this.articles.length}件`);
                this.displayArticles();
            });
            
        } catch (error) {
            console.error('❌ リアルタイム更新エラー:', error);
            this.fallbackToJSON();
        }
    }

    /**
     * 新しい記事をFirebaseに投稿
     */
    async createArticle(articleData) {
        try {
            const articlesRef = this.collection(this.db, 'articles');
            
            const newArticle = {
                title: articleData.title,
                category: articleData.category,
                content: articleData.content,
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: [],
                authorId: 'admin' // 管理者のみ投稿可能
            };
            
            const docRef = await this.addDoc(articlesRef, newArticle);
            console.log('✅ 記事投稿完了:', docRef.id);
            
            return docRef.id;
            
        } catch (error) {
            console.error('❌ 記事投稿エラー:', error);
            throw error;
        }
    }

    /**
     * 記事にコメントを追加
     */
    async addComment(articleId, commentText) {
        try {
            const articleRef = this.doc(this.db, 'articles', articleId);
            const article = this.articles.find(a => a.id === articleId);
            
            if (!article) {
                throw new Error('記事が見つかりません');
            }
            
            const newComment = {
                id: Date.now().toString(),
                text: commentText,
                createdAt: new Date().toISOString()
            };
            
            const updatedComments = [...(article.comments || []), newComment];
            
            await this.updateDoc(articleRef, {
                comments: updatedComments
            });
            
            console.log('✅ コメント投稿完了');
            
        } catch (error) {
            console.error('❌ コメント投稿エラー:', error);
            throw error;
        }
    }

    /**
     * 記事のいいねを切り替え
     */
    async toggleLike(articleId) {
        try {
            const articleRef = this.doc(this.db, 'articles', articleId);
            const article = this.articles.find(a => a.id === articleId);
            
            if (!article) {
                throw new Error('記事が見つかりません');
            }
            
            const currentLikes = article.likes || 0;
            const isLiked = localStorage.getItem(`liked_${articleId}`) === 'true';
            
            const newLikes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
            
            await this.updateDoc(articleRef, {
                likes: newLikes
            });
            
            // ローカルストレージでいいね状態を管理
            localStorage.setItem(`liked_${articleId}`, (!isLiked).toString());
            
            console.log('✅ いいね更新完了');
            
        } catch (error) {
            console.error('❌ いいね更新エラー:', error);
            throw error;
        }
    }

    /**
     * JSONフォールバック（Firebase失敗時）
     */
    async fallbackToJSON() {
        try {
            console.log('📄 JSONフォールバックモードに切り替え');
            const response = await fetch('data/articles.json');
            if (response.ok) {
                this.articles = await response.json();
                this.displayArticles();
            }
        } catch (error) {
            console.error('❌ JSONフォールバックも失敗:', error);
            this.articles = [];
            this.displayArticles();
        }
    }

    /**
     * 記事表示（既存のコードを流用）
     */
    displayArticles() {
        const container = document.getElementById('articlesList');
        if (!container) return;
        
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
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // 管理者認証チェックして削除ボタン表示
        this.checkAdminAndShowDeleteButtons();
    }

    /**
     * 管理者認証チェックして削除ボタン表示
     */
    async checkAdminAndShowDeleteButtons() {
        try {
            // デバイス認証チェック（パスワード入力なし）
            const deviceAuth = new DeviceAuthManager();
            if (deviceAuth.isCurrentDeviceRegistered()) {
                this.showDeleteButtons();
                return;
            }
            
            // 従来のセッションチェック
            const security = new SecurityManager();
            const sessionCheck = await security.checkSession();
            if (sessionCheck.valid) {
                this.showDeleteButtons();
            }
        } catch (error) {
            console.log('管理者認証なし - 削除ボタン非表示');
        }
    }

    /**
     * 削除ボタンを表示
     */
    showDeleteButtons() {
        const adminActions = document.querySelectorAll('.admin-actions');
        adminActions.forEach(action => {
            action.style.display = 'flex';
        });
    }

    /**
     * 記事HTMLを生成（既存のコードを流用・改良）
     */
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

        const formattedDate = this.formatDate(article.createdAt || article.date);
        const categoryLabel = categoryLabels[article.category] || article.category;
        const preview = this.createPreview(article.content, 200);
        const isLiked = localStorage.getItem(`liked_${article.id}`) === 'true';
        const isExpanded = localStorage.getItem(`expanded_${article.id}`) === 'true';
        const shouldShowReadMore = article.content.length > 200;

        return `
            <article class="article-card" data-id="${article.id}">
                <div class="article-header">
                    <div class="article-meta">
                        <span class="article-date">${formattedDate}</span>
                        <span class="article-category">${categoryLabel}</span>
                    </div>
                    <span class="firebase-badge">🔥 Live</span>
                </div>
                
                <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                <div class="article-content" data-id="${article.id}">
                    <div class="content-text ${isExpanded ? 'expanded' : 'collapsed'}">
                        ${this.escapeHtml(isExpanded ? article.content : preview)}
                    </div>
                    ${shouldShowReadMore ? `<button class="read-more-btn" data-id="${article.id}">${isExpanded ? '折りたたむ' : '続きを読む'}</button>` : ''}
                </div>
                
                <div class="article-actions">
                    <div class="article-stats">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${article.id}">
                            <span>${isLiked ? '❤️' : '🤍'}</span>
                            <span>${article.likes || 0}</span>
                        </button>
                        <button class="comment-toggle" data-id="${article.id}">
                            <span>💬</span>
                            <span>${(article.comments || []).length}</span>
                        </button>
                    </div>
                    <div class="admin-actions" style="display: none;">
                        <button class="delete-article-btn" data-id="${article.id}" title="記事を削除">🗑️</button>
                    </div>
                </div>
                
                <div class="comments-section" id="comments-${article.id}">
                    <div class="comment-form">
                        <textarea class="comment-input" placeholder="コメントを入力..." data-id="${article.id}"></textarea>
                        <button class="comment-submit" data-id="${article.id}">コメント投稿</button>
                    </div>
                    <div class="comments-list">
                        ${(article.comments || []).map(comment => this.createCommentHTML(comment, article.id)).join('')}
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        document.removeEventListener('click', this.handleClick);
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }

    /**
     * クリックイベント処理
     */
    async handleClick(e) {
        if (e.target.classList.contains('like-btn') || e.target.closest('.like-btn')) {
            const button = e.target.closest('.like-btn');
            const articleId = button.dataset.id;
            await this.toggleLike(articleId);
            
        } else if (e.target.classList.contains('comment-toggle')) {
            this.toggleComments(e.target);
            
        } else if (e.target.classList.contains('comment-submit')) {
            const articleId = e.target.dataset.id;
            const textarea = document.querySelector(`.comment-input[data-id="${articleId}"]`);
            const commentText = textarea.value.trim();
            
            if (commentText) {
                await this.addComment(articleId, commentText);
                textarea.value = '';
            }
            
        } else if (e.target.classList.contains('read-more-btn')) {
            const articleId = e.target.dataset.id;
            this.toggleReadMore(articleId);
            
        } else if (e.target.classList.contains('delete-article-btn')) {
            const articleId = e.target.dataset.id;
            await this.deleteArticle(articleId);
        }
    }

    /**
     * 続きを読む/折りたたむ切り替え
     */
    toggleReadMore(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;
        
        const isExpanded = localStorage.getItem(`expanded_${articleId}`) === 'true';
        const newState = !isExpanded;
        
        // 状態を保存
        localStorage.setItem(`expanded_${articleId}`, newState.toString());
        
        // DOM更新
        const contentDiv = document.querySelector(`.article-content[data-id="${articleId}"] .content-text`);
        const button = document.querySelector(`.read-more-btn[data-id="${articleId}"]`);
        
        if (contentDiv && button) {
            contentDiv.className = `content-text ${newState ? 'expanded' : 'collapsed'}`;
            contentDiv.innerHTML = this.escapeHtml(newState ? article.content : this.createPreview(article.content, 200));
            button.textContent = newState ? '折りたたむ' : '続きを読む';
        }
    }

    /**
     * 記事を削除（管理者認証付き）
     */
    async deleteArticle(articleId) {
        try {
            // 管理者認証チェック
            const isAuthenticated = await AuthManager.checkPassword();
            if (!isAuthenticated) {
                alert('記事の削除には管理者認証が必要です。');
                return;
            }

            const article = this.articles.find(a => a.id === articleId);
            if (!article) {
                alert('記事が見つかりません。');
                return;
            }

            // 削除確認
            const confirmDelete = confirm(`記事「${article.title}」を削除しますか？\nこの操作は取り消せません。`);
            if (!confirmDelete) return;

            // Firebaseから削除
            if (this.db) {
                const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
                const articleRef = doc(this.db, 'articles', articleId);
                await deleteDoc(articleRef);
                console.log('✅ Firebase記事削除完了:', articleId);
            }

            // ローカル配列からも削除
            this.articles = this.articles.filter(a => a.id !== articleId);
            
            // 記事表示を更新
            this.displayArticles();
            
            alert('記事が削除されました。');

        } catch (error) {
            console.error('❌ 記事削除エラー:', error);
            alert(`記事の削除に失敗しました。\nエラー: ${error.message}`);
        }
    }

    // 既存のヘルパーメソッド
    createCommentHTML(comment, articleId) {
        return `
            <div class="comment-item">
                <div class="comment-meta">
                    ${this.formatDate(comment.createdAt || comment.date)}
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
        `;
    }

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
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 終了処理
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// グローバルに公開
window.FirebaseArticlesManager = FirebaseArticlesManager;