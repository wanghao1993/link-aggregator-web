# 🔗 LinkHub — 連結聚合平台

> 發現、整理、分享——讓好工具找到需要它的人

[简体中文](./README.md) | [English](./README.en.md) | [日本語](./README.ja.md)

---

## ✨ 它是什麼

LinkHub 是一個開源的連結聚合平台，每個人可以建立自己的工具箱並公開分享。

還在翻聊天紀錄找「你用的什麼工具」嗎？還是把好網站藏在自己的書籤列裡？LinkHub 讓工具的發現和分享變得體面。

🌐 **線上體驗**: [linkhub.ai-explorer.cn](https://linkhub.ai-explorer.cn)

![LinkHub 首頁](https://linkhub.ai-explorer.cn/og-image.png)

---

## 🎯 核心功能

| 功能 | 說明 |
|------|------|
| 📦 建立合集 | 把相關連結整理到一個合集，加標題、描述、標籤 |
| 🔍 瀏覽發現 | 看別人公開的合集，發現新工具 |
| ⭐ 一鍵收藏 | 看到好用的合集，收藏到自己的收藏夾 |
| 🏷️ 分類體系 | AI、Web開發、設計、工具、效率……按領域瀏覽 |
| 🌍 中英雙語 | 完整的國際化支援，中文和英文自由切換 |
| 🌙 暗黑模式 | 深色主題，夜間使用更舒適 |
| 📖 一鍵匯入 | 從瀏覽器書籤批量匯入 |
| 🧩 Bookmarklet | 拖到書籤列，隨時儲存當前頁面 |
| 🔐 隱私控制 | 合集可選公開或私有 |
| 👤 使用者主頁 | 每個人有自己的公開主頁，展示所有公開合集 |
| 🛡️ 管理後台 | 分類管理、使用者管理、內容審核 |

---

## 🛠️ 技術棧

| 技術 | 用途 |
|------|------|
| [Next.js 15](https://nextjs.org/) | React 全端框架，App Router + Server Components |
| [React 19](https://react.dev/) | UI 函式庫 |
| [TypeScript](https://www.typescriptlang.org/) | 型別安全 |
| [Tailwind CSS 4](https://tailwindcss.com/) | 原子化 CSS |
| [Radix UI](https://www.radix-ui.com/) | 無障礙元件基礎設施 |
| [Supabase](https://supabase.com/) | 資料庫 + 認證 + 儲存 |
| [NextAuth.js](https://next-auth.js.org/) | 認證框架（OAuth + 信箱） |
| [next-intl](https://next-intl.dev/) | 國際化 |
| [Vercel](https://vercel.com/) | 部署平台 |

---

## 🚀 快速開始

### 系統需求

- Node.js 18+
- pnpm（推薦）或 npm
- [Supabase](https://supabase.com/) 帳號

### 安裝

```bash
# 複製儲存庫
git clone https://github.com/wanghao1993/link-aggregator-web.git
cd link-aggregator-web

# 安裝依賴
pnpm install

# 設定環境變數
cp .env.local.example .env.local
# 編輯 .env.local，填入你的 Supabase 和 OAuth 設定
```

### 環境變數

參考 `.env.local.example`，需要設定：

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務端金鑰 |
| `NEXTAUTH_SECRET` | NextAuth 加密金鑰（`openssl rand -base64 32`） |
| `GITHUB_CLIENT_ID` | GitHub OAuth 應用 ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 應用金鑰 |
| `GOOGLE_CLIENT_ID` | Google OAuth 應用 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 應用金鑰 |
| `RESEND_API_KEY` | Resend 郵件服務金鑰 |
| `EMAIL_FROM` | 寄件者信箱地址 |

### 啟動開發伺服器

```bash
pnpm dev
```

造訪 http://localhost:3000

### 建置

```bash
pnpm build
pnpm start
```

---

## 📁 專案結構

```
link-aggregator-web/
├── app/[locale]/           # 頁面路由（國際化）
│   ├── page.tsx            # 首頁
│   ├── admin/              # 管理後台
│   ├── auth/               # 認證頁面（登入/註冊/找回密碼）
│   ├── bookmarklet/        # 書籤列工具
│   ├── categories/         # 分類瀏覽
│   ├── category/[slug]/    # 單個分類
│   ├── collection/[id]/    # 合集詳情
│   ├── create/             # 建立合集
│   ├── dashboard/          # 使用者儀表板
│   ├── edit/[id]/          # 編輯合集
│   ├── favorites/          # 收藏夾
│   ├── import/             # 書籤匯入
│   ├── profile/            # 個人設定
│   └── user/[id]/          # 使用者公開主頁
├── src/
│   ├── components/         # 通用元件
│   ├── hooks/              # 自定義 Hooks
│   ├── lib/                # 工具函式和設定
│   ├── styles/             # 全域樣式
│   └── types/              # TypeScript 型別定義
├── messages/               # 國際化翻譯檔案
├── public/                 # 靜態資源
└── supabase/               # Supabase 遷移和設定
```

---

## 🤝 參與貢獻

1. Fork 本儲存庫
2. 建立特性分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 授權條款

MIT License © 2026 Isaac

---

<div align="center">

*AI 不會取代你，但會用 AI 的人會。*

</div>
