/**
 * 記事一覧初期化スクリプト
 * Firebase記事管理を確実に起動
 */

// ページ読み込み完了を待つ
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📰 記事一覧ページ初期化開始...');
    
    try {
        // Firebase初期化を待つ
        if (window.initializeFirebase) {
            await window.initializeFirebase();
            console.log('✅ Firebase初期化完了');
        }
        
        // Firebase記事管理を起動
        if (window.FirebaseArticlesManager) {
            const articlesManager = new window.FirebaseArticlesManager();
            console.log('✅ Firebase記事管理システム起動');
        } else {
            console.error('❌ FirebaseArticlesManager が見つかりません');
        }
        
    } catch (error) {
        console.error('❌ 記事一覧初期化エラー:', error);
        
        // フォールバック: JSONから記事を読み込み
        try {
            const response = await fetch('data/articles.json');
            if (response.ok) {
                const articles = await response.json();
                displayArticlesFromJSON(articles);
                console.log('✅ JSONフォールバック成功');
            }
        } catch (jsonError) {
            console.error('❌ JSONフォールバックも失敗:', jsonError);
            showNoArticlesMessage();
        }
    }
});

// JSONから記事を表示（フォールバック）
function displayArticlesFromJSON(articles) {
    const container = document.getElementById('articlesList');
    if (!container) return;
    
    if (articles.length === 0) {
        showNoArticlesMessage();
        return;
    }
    
    const articlesHTML = articles.map(article => {
        const date = new Date(article.date || article.createdAt).toLocaleDateString('ja-JP');
        return `
            <article class="article-card">
                <div class="article-header">
                    <div class="article-meta">
                        <span class="article-date">${date}</span>
                        <span class="article-category">${article.category}</span>
                    </div>
                    <span class="firebase-badge">📄 JSON</span>
                </div>
                <h3 class="article-title">${escapeHtml(article.title)}</h3>
                <div class="article-content">${escapeHtml(article.content.substring(0, 200))}...</div>
            </article>
        `;
    }).join('');
    
    container.innerHTML = articlesHTML;
}

// 記事なしメッセージ
function showNoArticlesMessage() {
    const container = document.getElementById('articlesList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-articles">
            <h3>まだ記事がありません</h3>
            <p>最初の記事を投稿してみましょう！</p>
            <a href="write-article.html" class="write-btn">記事を書く</a>
        </div>
    `;
}

// HTMLエスケープ
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}