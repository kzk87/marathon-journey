/**
 * Firebase接続デバッグツール
 */
class FirebaseDebugger {
    constructor() {
        this.addDebugButton();
    }

    addDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔍 Firebase接続テスト';
        debugBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: #ff6b35;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
            font-family: 'Noto Sans JP', sans-serif;
        `;
        
        debugBtn.addEventListener('click', () => this.runDebugTest());
        document.body.appendChild(debugBtn);
    }

    async runDebugTest() {
        console.log('🔍 Firebase接続テスト開始...');
        
        const results = [];
        
        // 1. Firebase初期化チェック
        try {
            if (window.initializeFirebase) {
                console.log('✅ Firebase初期化関数: 存在');
                results.push('✅ Firebase初期化関数: 存在');
            } else {
                console.log('❌ Firebase初期化関数: 未定義');
                results.push('❌ Firebase初期化関数: 未定義');
            }
        } catch (error) {
            console.log('❌ Firebase初期化チェックエラー:', error);
            results.push('❌ Firebase初期化チェックエラー: ' + error.message);
        }

        // 2. Firebase接続テスト
        try {
            const firebase = await window.initializeFirebase();
            if (firebase.db) {
                console.log('✅ Firestore接続: 成功');
                results.push('✅ Firestore接続: 成功');
            } else {
                console.log('❌ Firestore接続: 失敗');
                results.push('❌ Firestore接続: 失敗');
            }
        } catch (error) {
            console.log('❌ Firebase接続エラー:', error);
            results.push('❌ Firebase接続エラー: ' + error.message);
        }

        // 3. Firestore読み取りテスト
        try {
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const db = window.getFirebaseDB();
            
            if (db) {
                const articlesRef = collection(db, 'articles');
                const snapshot = await getDocs(articlesRef);
                console.log('✅ Firestore読み取り: 成功', snapshot.size + '件');
                results.push('✅ Firestore読み取り: 成功 (' + snapshot.size + '件)');
            } else {
                console.log('❌ Firestore DB: 未初期化');
                results.push('❌ Firestore DB: 未初期化');
            }
        } catch (error) {
            console.log('❌ Firestore読み取りエラー:', error);
            results.push('❌ Firestore読み取りエラー: ' + error.message);
        }

        // 4. ネットワーク接続チェック
        if (navigator.onLine) {
            console.log('✅ ネットワーク: 接続中');
            results.push('✅ ネットワーク: 接続中');
        } else {
            console.log('❌ ネットワーク: オフライン');
            results.push('❌ ネットワーク: オフライン');
        }

        this.showDebugResults(results);
    }

    showDebugResults(results) {
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            position: fixed;
            top: 60px;
            left: 10px;
            background: white;
            border: 2px solid #ff6b35;
            padding: 20px;
            border-radius: 10px;
            max-width: 400px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        
        resultDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #ff6b35;">Firebase接続診断結果:</div>
            ${results.map(result => `<div>${result}</div>`).join('')}
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 5px 10px; background: #ff6b35; color: white; border: none; border-radius: 3px; cursor: pointer;">閉じる</button>
        `;
        
        document.body.appendChild(resultDiv);
    }
}

// デバッグツールを起動（本番環境では無効化）
// document.addEventListener('DOMContentLoaded', () => {
//     new FirebaseDebugger();
// });