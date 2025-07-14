// LocalStorage記事をJSONファイルに移行するためのツール
class DataMigration {
    constructor() {
        this.init();
    }

    init() {
        this.createMigrationUI();
    }

    createMigrationUI() {
        // 移行ボタンをページに追加
        const migrationDiv = document.createElement('div');
        migrationDiv.id = 'migration-panel';
        migrationDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 1000;
            font-family: 'Noto Sans JP', sans-serif;
            max-width: 300px;
        `;

        const localArticles = JSON.parse(localStorage.getItem('marathonArticles')) || [];
        
        if (localArticles.length > 0) {
            migrationDiv.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">📋 データ移行</h4>
                <p style="margin: 0 0 10px 0; font-size: 12px;">
                    LocalStorageに${localArticles.length}件の記事があります。<br>
                    JSONファイルに移行しますか？
                </p>
                <button id="migrate-btn" style="
                    background: white;
                    color: #ff6b6b;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-right: 5px;
                ">移行する</button>
                <button id="dismiss-btn" style="
                    background: transparent;
                    color: white;
                    border: 1px solid white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                ">後で</button>
            `;
            
            document.body.appendChild(migrationDiv);
            
            document.getElementById('migrate-btn').addEventListener('click', () => {
                this.migrateData(localArticles);
            });
            
            document.getElementById('dismiss-btn').addEventListener('click', () => {
                migrationDiv.remove();
            });
        }
    }

    async migrateData(localArticles) {
        try {
            const blob = new Blob([JSON.stringify(localArticles, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'migrated-articles.json';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`${localArticles.length}件の記事をmigrated-articles.jsonとしてダウンロードしました。\n\nこのファイルをdata/articles.jsonとしてアップロードしてください。`);
            
            // 移行完了後はパネルを削除
            document.getElementById('migration-panel')?.remove();
            
        } catch (error) {
            console.error('移行に失敗しました:', error);
            alert('移行に失敗しました。もう一度お試しください。');
        }
    }
}

// ページ読み込み時に移行ツールを起動
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DataMigration());
} else {
    new DataMigration();
}