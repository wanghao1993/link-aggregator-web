# 🔗 LinkHub — リンク集約プラットフォーム

> 見つける、整理する、共有する——良いツールを必要な人へ

[简体中文](./README.md) | [English](./README.en.md) | [繁體中文](./README.zh-TW.md)

---

## ✨ LinkHub とは

LinkHub はオープンソースのリンク集約プラットフォームです。自分のツールボックスを作成し、公開して共有できます。

「何のツール使ってる？」とチャット履歴を探しまわっていませんか？良いサイトをブックマークバーに隠したままにしていませんか？LinkHub はツールの発見と共有をスマートにします。

🌐 **ライブデモ**: [linkhub.ai-explorer.cn](https://linkhub.ai-explorer.cn)

![LinkHub ホームページ](https://linkhub.ai-explorer.cn/og-image.png)

---

## 🎯 主な機能

| 機能 | 説明 |
|------|------|
| 📦 コレクション作成 | 関連リンクをコレクションに整理。タイトル、説明、タグ付き |
| 🔍 閲覧・発見 | 他の人の公開コレクションを見て、新しいツールを発見 |
| ⭐ ワンクリックお気に入り | 気に入ったコレクションをお気に入りに保存 |
| 🏷️ カテゴリ | AI、Web開発、デザイン、ツール、生産性…分野別に閲覧 |
| 🌍 日英バイリンガル | 完全な国際化対応——中国語と英語を自由に切り替え |
| 🌙 ダークモード | ダークテーマで夜間の使用も快適 |
| 📖 ブックマーク一括インポート | ブラウザのブックマークから一括インポート |
| 🧩 ブックマークレット | ブックマークバーにドラッグして、いつでも現在のページを保存 |
| 🔐 プライバシー制御 | コレクションごとに公開/非公開を選択 |
| 👤 ユーザープロフィール | 公開プロフィールページで全公開コレクションを紹介 |
| 🛡️ 管理パネル | カテゴリ管理、ユーザー管理、コンテンツモデレーション |

---

## 🛠️ 技術スタック

| 技術 | 用途 |
|------|------|
| [Next.js 15](https://nextjs.org/) | React フルスタックフレームワーク、App Router + Server Components |
| [React 19](https://react.dev/) | UI ライブラリ |
| [TypeScript](https://www.typescriptlang.org/) | 型安全 |
| [Tailwind CSS 4](https://tailwindcss.com/) | ユーティリティファースト CSS |
| [Radix UI](https://www.radix-ui.com/) | アクセシブルなコンポーネントプリミティブ |
| [Supabase](https://supabase.com/) | データベース + 認証 + ストレージ |
| [NextAuth.js](https://next-auth.js.org/) | 認証フレームワーク（OAuth + メール） |
| [next-intl](https://next-intl.dev/) | 国際化 |
| [Vercel](https://vercel.com/) | デプロイメント |

---

## 🚀 はじめ方

### 前提条件

- Node.js 18+
- pnpm（推奨）または npm
- [Supabase](https://supabase.com/) アカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/wanghao1993/link-aggregator-web.git
cd link-aggregator-web

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集して Supabase と OAuth の認証情報を入力
```

### 環境変数

`.env.local.example` を参照してください：

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー |
| `NEXTAUTH_SECRET` | NextAuth 暗号化シークレット（`openssl rand -base64 32`） |
| `GITHUB_CLIENT_ID` | GitHub OAuth アプリ ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth アプリシークレット |
| `GOOGLE_CLIENT_ID` | Google OAuth アプリ ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth アプリシークレット |
| `RESEND_API_KEY` | Resend メールサービスキー |
| `EMAIL_FROM` | 送信元メールアドレス |

### 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 にアクセス

### プロダクションビルド

```bash
pnpm build
pnpm start
```

---

## 📁 プロジェクト構成

```
link-aggregator-web/
├── app/[locale]/           # ページルート（国際化）
│   ├── page.tsx            # ホームページ
│   ├── admin/              # 管理パネル
│   ├── auth/               # 認証ページ（ログイン/登録/パスワードリセット）
│   ├── bookmarklet/        # ブックマークレットツール
│   ├── categories/         # カテゴリ閲覧
│   ├── category/[slug]/    # 個別カテゴリ
│   ├── collection/[id]/    # コレクション詳細
│   ├── create/             # コレクション作成
│   ├── dashboard/          # ユーザーダッシュボード
│   ├── edit/[id]/          # コレクション編集
│   ├── favorites/          # お気に入り
│   ├── import/             # ブックマークインポート
│   ├── profile/            # プロフィール設定
│   └── user/[id]/          # 公開ユーザープロフィール
├── src/
│   ├── components/         # 共通コンポーネント
│   ├── hooks/              # カスタムフック
│   ├── lib/                # ユーティリティと設定
│   ├── styles/             # グローバルスタイル
│   └── types/              # TypeScript 型定義
├── messages/               # 国際化翻訳ファイル
├── public/                 # 静的アセット
└── supabase/               # Supabase マイグレーションと設定
```

---

## 🤝 コントリビュート

1. このリポジトリをフォーク
2. フィーチャーブランチを作成：`git checkout -b feature/amazing-feature`
3. 変更をコミット：`git commit -m 'feat: add amazing feature'`
4. ブランチにプッシュ：`git push origin feature/amazing-feature`
5. プルリクエストを作成

---

## 📄 ライセンス

MIT License © 2026 Isaac

---

<div align="center">

*AI はあなたを置き換えない。しかし、AI を使う人はあなたを置き換えるだろう。*

</div>
