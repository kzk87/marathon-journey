# 🚀 Marathon Journey - デプロイ手順書

## 📋 事前準備

GitHubアカウントが必要です（無料）: https://github.com

## 🔧 デプロイ手順（GitHub Pages）

### ステップ1: GitHubリポジトリ作成

1. **GitHub.com** にアクセスしてログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `marathon-journey`）
4. 「Public」を選択（無料プランでPages使用のため）
5. 「Create repository」をクリック

### ステップ2: ローカルコードをプッシュ

```bash
# リモートリポジトリを追加（URLは作成したリポジトリのもの）
git remote add origin https://github.com/YOUR_USERNAME/marathon-journey.git

# メインブランチ名を設定
git branch -M main

# コードをプッシュ
git push -u origin main
```

### ステップ3: GitHub Pages有効化

1. GitHubのリポジトリページで「Settings」タブをクリック
2. 左サイドバーで「Pages」をクリック
3. 「Source」で「Deploy from a branch」を選択
4. 「Branch」で「main」を選択
5. フォルダは「/ (root)」のまま
6. 「Save」をクリック

### ステップ4: デプロイ完了確認

- 数分後にページ上部に緑のチェックマークとURLが表示
- URLは `https://YOUR_USERNAME.github.io/marathon-journey/` 形式

## 🔄 更新方法

### 方法1: ローカルで編集してプッシュ

```bash
# ファイルを編集後
git add .
git commit -m "更新内容の説明"
git push
```

### 方法2: GitHub上で直接編集

1. GitHubリポジトリでファイルをクリック
2. 編集アイコン（鉛筆マーク）をクリック
3. ファイルを編集
4. 「Commit changes」で保存

**自動反映**: プッシュ後1-2分で自動的にサイトが更新されます

## ⚡ 他のデプロイ方法

### Netlify（より多機能）

1. **Netlify.com** でアカウント作成
2. 「New site from Git」をクリック
3. GitHubリポジトリを選択
4. 自動デプロイ設定完了

**メリット**: 
- カスタムドメイン無料
- HTTPS自動設定
- フォーム機能

### Vercel（高速）

1. **Vercel.com** でアカウント作成  
2. 「Import Project」でGitHubリポジトリ選択
3. 自動デプロイ完了

**メリット**:
- 超高速CDN
- プレビューURL生成

## 💰 費用比較

| サービス | 費用 | 独自ドメイン | SSL証明書 |
|---------|------|------------|----------|
| GitHub Pages | 無料 | 有料 | 自動 |
| Netlify | 無料 | 無料 | 自動 |
| Vercel | 無料 | 無料 | 自動 |

## 🌐 独自ドメイン設定（オプション）

### GitHub Pages + 独自ドメイン

1. ドメインを購入（年間1000-3000円程度）
2. GitHubリポジトリ設定で「Custom domain」に入力
3. DNS設定でCNAMEレコードを追加:
   ```
   www -> YOUR_USERNAME.github.io
   ```

### おすすめドメインサービス
- **Cloudflare** - 安価でDNS管理も簡単
- **お名前.com** - 日本語サポート
- **Google Domains** - シンプル

## ⚙️ 設定ファイル（自動作成済み）

- `.gitignore` - Git管理除外ファイル
- `README.md` - プロジェクト説明
- `DEPLOY.md` - この手順書

## 🚨 注意事項

### セキュリティ
- 管理者パスワードはブラウザごとに設定
- 公開後は誰でもアクセス可能（記事閲覧のみ）
- 投稿・管理はパスワード認証で保護済み

### データ
- 記録はブラウザのローカルストレージに保存
- デバイス・ブラウザが変わると記録は引き継がれません
- 定期的なデータエクスポートを推奨

## 📞 サポート

問題が発生した場合:
1. GitHub Issues で報告
2. コミット履歴で変更を確認
3. 必要に応じてロールバック

---

**🎯 目標**: 2025年12月21日フルマラソン完走  
**📅 作成日**: 2024年  
**⚡ 更新**: プッシュ後1-2分で自動反映