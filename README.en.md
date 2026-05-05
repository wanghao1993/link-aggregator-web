# 🔗 LinkHub — Link Aggregation Platform

> Discover, organize, share — let great tools find the people who need them

[简体中文](./README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md)

---

## ✨ What is it

LinkHub is an open-source link aggregation platform where everyone can create their own toolbox and share it publicly.

Still digging through chat history for "what tool do you use"? Still hiding great websites in your bookmarks bar? LinkHub makes discovering and sharing tools elegant.

🌐 **Live Demo**: [linkhub.ai-explorer.cn](https://linkhub.ai-explorer.cn)

![LinkHub Homepage](https://linkhub.ai-explorer.cn/og-image.png)

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 📦 Create Collections | Organize related links into collections with titles, descriptions, and tags |
| 🔍 Browse & Discover | Explore public collections from others, discover new tools |
| ⭐ One-click Favorite | Save interesting collections to your favorites |
| 🏷️ Categories | Browse by domain — AI, Web Dev, Design, Tools, Productivity... |
| 🌍 Bilingual | Full i18n support — switch between Chinese and English |
| 🌙 Dark Mode | Dark theme for comfortable night-time use |
| 📖 Bookmark Import | Bulk import from browser bookmarks |
| 🧩 Bookmarklet | Drag to your bookmarks bar, save any page instantly |
| 🔐 Privacy Control | Choose public or private for each collection |
| 👤 User Profiles | Public profile page showcasing all your public collections |
| 🛡️ Admin Panel | Category management, user management, content moderation |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | Full-stack React framework, App Router + Server Components |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [Radix UI](https://www.radix-ui.com/) | Accessible component primitives |
| [Supabase](https://supabase.com/) | Database + Auth + Storage |
| [NextAuth.js](https://next-auth.js.org/) | Authentication (OAuth + Email) |
| [next-intl](https://next-intl.dev/) | Internationalization |
| [Vercel](https://vercel.com/) | Deployment |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A [Supabase](https://supabase.com/) account

### Installation

```bash
# Clone the repository
git clone https://github.com/wanghao1993/link-aggregator-web.git
cd link-aggregator-web

# Install dependencies
pnpm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and OAuth credentials
```

### Environment Variables

Refer to `.env.local.example` for the full list:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXTAUTH_SECRET` | NextAuth encryption secret (`openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `GOOGLE_CLIENT_ID` | Google OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app secret |
| `RESEND_API_KEY` | Resend email service key |
| `EMAIL_FROM` | Sender email address |

### Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 📁 Project Structure

```
link-aggregator-web/
├── app/[locale]/           # Page routes (i18n)
│   ├── page.tsx            # Homepage
│   ├── admin/              # Admin panel
│   ├── auth/               # Auth pages (signin/signup/reset)
│   ├── bookmarklet/        # Bookmarklet tool
│   ├── categories/         # Browse categories
│   ├── category/[slug]/    # Single category
│   ├── collection/[id]/    # Collection detail
│   ├── create/             # Create collection
│   ├── dashboard/          # User dashboard
│   ├── edit/[id]/          # Edit collection
│   ├── favorites/          # Favorites
│   ├── import/             # Bookmark import
│   ├── profile/            # Profile settings
│   └── user/[id]/          # Public user profile
├── src/
│   ├── components/         # Shared components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and configs
│   ├── styles/             # Global styles
│   └── types/              # TypeScript type definitions
├── messages/               # i18n translation files
├── public/                 # Static assets
└── supabase/               # Supabase migrations and config
```

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License © 2026 Isaac

---

<div align="center">

*AI won't replace you, but the person who uses AI will.*

</div>
