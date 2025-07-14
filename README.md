# 🏃‍♂️ Marathon Journey

フルマラソン完走に向けたトレーニング記録とブログサイト

## 🌟 主な機能

### ✅ 実装済み機能
- **🔥 リアルタイム記事投稿**: Firebase Firestoreによる即座公開
- **💬 リアルタイムコメント**: 全ユーザー間でのリアルタイム共有
- **❤️ いいね機能**: 記事への反応機能
- **📊 活動記録**: 距離・種目・統計の管理
- **⏰ カウントダウン**: マラソン本番までの日数表示
- **🔐 管理者認証**: セキュアな管理機能
- **📱 レスポンシブ対応**: スマホ・タブレット最適化

### 🛡️ セキュリティ機能
- **XSS攻撃防止**: 入力値検証・HTMLエスケープ
- **セッション管理**: ブラウザフィンガープリント認証
- **アクセス制限**: 管理者ページ保護
- **セキュリティヘッダー**: CSP、XSS防止設定

## 🏗️ 技術構成

### フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS3**: カスタムプロパティ、Grid、Flexbox
- **JavaScript ES6+**: モジュール、async/await、クラス構文

### バックエンド・データベース
- **Firebase Firestore**: NoSQLクラウドデータベース
- **GitHub Pages**: 静的サイトホスティング
- **Firebase Analytics**: アクセス解析

### 開発・デプロイ
- **Git**: バージョン管理
- **GitHub Actions**: 自動デプロイ
- **ESLint**: コード品質管理

## 📂 プロジェクト構成

```
marathon-blog/
├── index.html              # メインページ（活動記録・統計）
├── articles.html           # 記事一覧ページ
├── write-article.html      # 記事投稿ページ
├── admin.html             # 管理者設定ページ
├── css/
│   └── style.css          # 統合スタイルシート
├── js/
│   ├── app.js             # メイン機能（活動記録）
│   ├── firebase-config.js  # Firebase設定
│   ├── firebase-articles.js # Firebase記事管理
│   ├── firebase-write-article.js # Firebase記事投稿
│   ├── security.js        # セキュリティ管理
│   ├── session-invalidator.js # セッション無効化
│   ├── admin-guard.js     # 管理者アクセス制御
│   ├── admin.js          # 管理者機能
│   └── auth.js           # 認証システム
├── data/
│   └── articles.json     # 記事データ（フォールバック用）
├── backup-legacy/        # 旧ファイルバックアップ
├── .htaccess            # セキュリティヘッダー設定
├── .gitignore           # Git除外ファイル
└── README.md           # プロジェクト説明

```

## 🚀 セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/kzk87/marathon-journey.git
cd marathon-journey
```

### 2. Firebase設定
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Firestore Database を「テストモード」で作成
3. ウェブアプリ追加でAPIキー取得
4. `js/firebase-config.js` の設定値を更新

### 3. GitHub Pages デプロイ
1. GitHubにプッシュ
2. Settings > Pages > Source を「Deploy from a branch」に設定
3. Branch を「main」に設定
4. 数分後にサイトが公開される

## 📖 使用方法

### 記事投稿
1. 管理者ページでパスワード設定
2. 記事投稿ページでコンテンツ作成
3. Firebase経由で即座に全世界公開

### 活動記録
1. メインページで距離・活動種別を入力
2. 自動的に統計が更新される
3. 月間・累計距離が表示される

### コメント機能
1. 記事下のコメント欄に入力
2. リアルタイムで全ユーザーに表示
3. Firebase経由での双方向コミュニケーション

## 🔧 開発情報

### 主要依存関係
- Firebase SDK v10.8.0
- Google Fonts (Noto Sans JP)

### ブラウザサポート
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### パフォーマンス
- Lighthouse Score: 90+
- Core Web Vitals 最適化済み
- 画像最適化・遅延読み込み

## 🎯 目標・ロードマップ

### マラソン目標
- **開催日**: 2025年12月21日
- **目標**: フルマラソン完走
- **現在の進捗**: トレーニング継続中

### 技術的改善予定
- [ ] PWA対応（オフライン機能）
- [ ] プッシュ通知
- [ ] ダークモード
- [ ] 多言語対応
- [ ] API制限監視

## 📊 Firebase使用量

### 無料枠制限
- **読み取り**: 50,000回/日
- **書き込み**: 20,000回/日
- **削除**: 20,000回/日
- **ストレージ**: 1GB

### 現在の使用状況
- 記事: ~10件
- コメント: ~50件
- 月間アクセス: ~1,000回

## 🤝 貢献

このプロジェクトは個人のマラソントレーニング記録ですが、技術的な改善提案は歓迎です。

### 改善提案の方法
1. Issues で課題報告
2. Pull Request で機能追加
3. Discussions で技術相談

## 📄 ライセンス

MIT License - 自由に使用・改変可能

## 🙏 謝辞

- **Firebase**: リアルタイムデータベース
- **GitHub Pages**: 無料ホスティング
- **Google Fonts**: 美しいタイポグラフィ
- **Claude Code**: 開発サポート

---

**作成者**: [@kzk87](https://github.com/kzk87)  
**サイトURL**: https://kzk87.github.io/marathon-journey/  
**最終更新**: 2025年7月14日