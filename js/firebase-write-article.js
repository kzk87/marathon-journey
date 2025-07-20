/**
 * Firebase記事投稿システム
 */
class FirebaseArticleWriter {
    constructor() {
        this.db = null;
        this.checkAuthAndInit();
    }

    async checkAuthAndInit() {
        const isAuthenticated = await AuthManager.checkPassword();
        if (isAuthenticated) {
            await this.init();
        } else {
            window.location.href = 'articles.html';
        }
    }

    async init() {
        try {
            // Firebase初期化を待つ
            const firebase = await window.initializeFirebase();
            this.db = firebase.db;
            
            // Firestore関数を動的インポート（共通化）
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            this.collection = collection;
            this.addDoc = addDoc;
            
            console.log('✅ Firebase記事投稿システム初期化完了');
            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ Firebase初期化エラー:', error);
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const form = document.getElementById('articleForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
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

        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '投稿中...';
        submitBtn.disabled = true;

        try {
            await this.saveToFirebase(title, category, content);
        } catch (error) {
            console.error('投稿エラー:', error);
            alert(`記事の投稿に失敗しました。\nエラー: ${error.message}\nもう一度お試しください。`);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    /**
     * Firebaseに記事を保存
     */
    async saveToFirebase(title, category, content) {
        if (!this.db) {
            throw new Error('Firebase データベースが初期化されていません');
        }
        
        try {
            const articlesRef = this.collection(this.db, 'articles');
            
            const newArticle = {
                title: this.escapeHtml(title),
                category: category,
                content: this.escapeHtml(content),
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: [],
                authorId: 'admin'
            };
            
            const docRef = await this.addDoc(articlesRef, newArticle);
            console.log('✅ Firebase記事投稿完了:', docRef.id);
            
            // 成功通知
            this.showSuccessMessage('記事がリアルタイムで公開されました！');
            
            // 記事一覧ページへリダイレクト
            setTimeout(() => {
                window.location.href = 'articles.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Firebase投稿エラー:', error);
            throw error;
        }
    }

    /**
     * JSONフォールバック保存
     */
    async saveToJSON(title, category, content) {
        try {
            const response = await fetch('data/articles.json');
            let articles = [];
            if (response.ok) {
                articles = await response.json();
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
            
            articles.unshift(formData);
            
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
            console.error('❌ JSON保存エラー:', error);
            throw error;
        }
    }

    /**
     * 成功メッセージを表示
     */
    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
            z-index: 1000;
            font-family: 'Noto Sans JP', sans-serif;
            font-weight: bold;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;
        
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🔥</span>
                <div>
                    <div style="font-size: 16px; margin-bottom: 5px;">投稿成功！</div>
                    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
                </div>
            </div>
        `;

        // アニメーションCSS追加
        if (!document.getElementById('success-animation-style')) {
            const style = document.createElement('style');
            style.id = 'success-animation-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(successDiv);

        // 3秒後に削除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    /**
     * XSS攻撃防止のためのHTML エスケープ
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 入力値の妥当性検証
     */
    validateInput(input) {
        if (typeof input !== 'string') return false;
        if (input.length > 50000) return false;
        
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
    new FirebaseArticleWriter();
});