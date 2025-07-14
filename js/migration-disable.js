/**
 * 移行ツール無効化スクリプト
 * LocalStorageの旧データをクリアして移行ダイアログを非表示
 */

class MigrationDisabler {
    constructor() {
        this.init();
    }

    init() {
        // 旧データが存在する場合のみ処理
        const hasOldData = this.checkOldData();
        
        if (hasOldData) {
            this.showMigrationCompleteMessage();
            this.clearOldData();
        }
    }

    checkOldData() {
        const articles = localStorage.getItem('marathonArticles');
        return articles && articles !== '[]';
    }

    clearOldData() {
        // 旧システムのデータをクリア
        localStorage.removeItem('marathonArticles');
        localStorage.removeItem('marathonActivities'); // 念のため
        
        console.log('✅ 旧データクリア完了: Firebase移行済み');
    }

    showMigrationCompleteMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
            z-index: 1000;
            font-family: 'Noto Sans JP', sans-serif;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🔥</span>
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Firebase移行完了</div>
                    <div style="font-size: 12px; opacity: 0.9;">旧データを自動クリアしました</div>
                </div>
            </div>
        `;

        // アニメーションCSS追加
        if (!document.getElementById('migration-animation-style')) {
            const style = document.createElement('style');
            style.id = 'migration-animation-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageDiv);

        // 3秒後に削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// 即座に実行
document.addEventListener('DOMContentLoaded', () => {
    new MigrationDisabler();
});