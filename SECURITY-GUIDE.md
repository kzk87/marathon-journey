# 🔐 Firebase APIキー セキュリティガイド

## 📊 現在の状況

### ✅ 安全な点
- **Firebase Web APIキー**: ブラウザ実行前提で公開OK
- **Firestore セキュリティルール**: データアクセス制限済み
- **ドメイン制限**: GitHub Pages のみ許可可能

### ⚠️ 改善が必要な点
- API使用量制限が未設定
- 請求アラートが未設定
- キーローテーション未実装

## 🛡️ セキュリティ対策実装

### 1. Firebase Console でのAPI制限設定

#### 📍 手順
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト `marathon-journey-eff35` を選択
3. **「APIとサービス」** → **「認証情報」** をクリック
4. **Web API キー** を選択
5. **「アプリケーションの制限」** を設定

#### 🌐 推奨設定
```
アプリケーションの制限: HTTP リファラー（ウェブサイト）
ウェブサイトの制限:
- https://kzk87.github.io/*
- https://kzk87.github.io/marathon-journey/*
```

#### 🔧 API制限
```
Firebase APIs:
- Cloud Firestore API
- Firebase Storage API
- Firebase Authentication API

不要なAPIは無効化
```

### 2. 使用量制限・クォータ設定

#### 📊 Firestore 制限設定
```
日次制限設定:
- 読み取り: 10,000回/日
- 書き込み: 1,000回/日
- 削除: 100回/日
```

#### ⚙️ 設定場所
1. Firebase Console → Firestore Database
2. **「使用量」** タブ
3. **「制限を設定」** をクリック

### 3. 請求アラート設定

#### 💰 アラート設定
```
予算アラート:
- $5 USD (月額)
- $10 USD (月額)
- $20 USD (月額)

通知先:
- あなたのGmailアドレス
```

#### 📧 設定手順
1. [Google Cloud Console](https://console.cloud.google.com/)
2. **「お支払い」** → **「予算とアラート」**
3. **「予算を作成」** をクリック

### 4. 環境変数による管理（将来対応）

#### 🌍 環境変数ファイル
```javascript
// .env (ローカル開発用)
VITE_FIREBASE_API_KEY=AIzaSyBu7xGtE9nWnpKcqhFgrdCNIXBkPP0Nalc
VITE_FIREBASE_AUTH_DOMAIN=marathon-journey-eff35.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=marathon-journey-eff35
```

#### 📝 .gitignore 設定
```
# 環境変数ファイル
.env
.env.local
.env.production

# Firebase設定
firebase-config-local.js
secrets/

# ログファイル
*.log
npm-debug.log*
```

### 5. セキュリティ強化版 Firebase 設定

#### 🔒 推奨実装
```javascript
// firebase-config-secure.js
const ALLOWED_DOMAINS = [
    'kzk87.github.io',
    'localhost'
];

const isDevelopment = window.location.hostname === 'localhost';
const isAllowedDomain = ALLOWED_DOMAINS.includes(window.location.hostname);

if (!isDevelopment && !isAllowedDomain) {
    throw new Error('Unauthorized domain access');
}

const firebaseConfig = {
    apiKey: "AIzaSyBu7xGtE9nWnpKcqhFgrdCNIXBkPP0Nalc",
    authDomain: "marathon-journey-eff35.firebaseapp.com",
    projectId: "marathon-journey-eff35",
    storageBucket: "marathon-journey-eff35.firebasestorage.app",
    messagingSenderId: "93744432557",
    appId: "1:93744432557:web:12d66af53787c098cf4d24",
    measurementId: "G-JRVKSJ4LLV"
};
```

### 6. 定期的なセキュリティチェック

#### 📅 月次チェックリスト
- [ ] API使用量の確認
- [ ] 不審なアクセスログの確認
- [ ] 請求額の確認
- [ ] セキュリティルールの見直し

#### 🔄 年次作業
- [ ] APIキーの再生成（必要に応じて）
- [ ] アクセスパターンの分析
- [ ] セキュリティ設定の見直し

## 🚨 緊急時の対応

### APIキー漏洩時の対応
1. **即座にキーを無効化**
2. **新しいキーを生成**
3. **設定ファイルを更新**
4. **不審なアクセスをチェック**

### 不正アクセス検出時
1. **Firebase Console でログ確認**
2. **セキュリティルールを強化**
3. **IP制限を検討**
4. **アクセスパターンを分析**

## 📊 監視とアラート

### 推奨監視項目
- API使用量（日次/月次）
- エラー率
- レスポンス時間
- 同時接続数

### アラート設定
- 使用量が制限の80%に達した時
- エラー率が5%を超えた時
- 不審なアクセスパターン検出時

## 🔗 参考リンク

- [Firebase セキュリティルール](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Google Cloud セキュリティ](https://cloud.google.com/security)
- [API キー制限](https://cloud.google.com/docs/authentication/api-keys#restricting_an_api_key)

---

**最終更新**: 2025年7月15日  
**作成者**: Marathon Journey Security Team