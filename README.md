# 🔗 LinkHub — 链接聚合平台

> 发现、整理、分享——让好工具找到需要它的人

[English](./README.en.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md)

---

## ✨ 它是什么

LinkHub 是一个开源的链接聚合平台，每个人可以创建自己的工具箱并公开分享。

还在翻聊天记录找「你用的什么工具」吗？还在把好网站藏在自己书签栏里吗？LinkHub 让工具的发现和分享变得体面。

🌐 **在线体验**: [linkhub.ai-explorer.cn](https://linkhub.ai-explorer.cn)

![LinkHub Homepage](https://linkhub.ai-explorer.cn/og-image.png)

---

## 🎯 核心功能

| 功能 | 说明 |
|------|------|
| 📦 创建合集 | 把相关链接整理到一个合集，加标题、描述、标签 |
| 🔍 浏览发现 | 看别人公开的合集，发现新工具 |
| ⭐ 一键收藏 | 看到好用的合集，收藏到自己的收藏夹 |
| 🏷️ 分类体系 | AI、Web开发、设计、工具、效率……按领域浏览 |
| 🌍 中英双语 | 完整的国际化支持，中文和英文自由切换 |
| 🌙 暗黑模式 | 深色主题，夜间使用更舒适 |
| 📖 一键导入 | 从浏览器书签批量导入 |
| 🧩 Bookmarklet | 拖到书签栏，随时保存当前页面 |
| 🔐 隐私控制 | 合集可选公开或私有 |
| 👤 用户主页 | 每个人有自己的公开主页，展示所有公开合集 |
| 🛡️ 管理后台 | 分类管理、用户管理、内容审核 |

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 15](https://nextjs.org/) | React 全栈框架，App Router + Server Components |
| [React 19](https://react.dev/) | UI 库 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Tailwind CSS 4](https://tailwindcss.com/) | 原子化 CSS |
| [Radix UI](https://www.radix-ui.com/) | 无障碍组件基础设施 |
| [Supabase](https://supabase.com/) | 数据库 + 认证 + 存储 |
| [NextAuth.js](https://next-auth.js.org/) | 认证框架（OAuth + 邮箱） |
| [next-intl](https://next-intl.dev/) | 国际化 |
| [Vercel](https://vercel.com/) | 部署平台 |

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm（推荐）或 npm
- [Supabase](https://supabase.com/) 账号

### 安装

```bash
# 克隆仓库
git clone https://github.com/wanghao1993/link-aggregator-web.git
cd link-aggregator-web

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Supabase 和 OAuth 配置
```

### 环境变量

参考 `.env.local.example`，需要配置：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥（`openssl rand -base64 32`） |
| `GITHUB_CLIENT_ID` | GitHub OAuth 应用 ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 应用密钥 |
| `GOOGLE_CLIENT_ID` | Google OAuth 应用 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 应用密钥 |
| `RESEND_API_KEY` | Resend 邮件服务密钥 |
| `EMAIL_FROM` | 发件人邮箱地址 |

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建

```bash
pnpm build
pnpm start
```

---

## 📁 项目结构

```
link-aggregator-web/
├── app/[locale]/           # 页面路由（国际化）
│   ├── page.tsx            # 首页
│   ├── admin/              # 管理后台
│   ├── auth/               # 认证页面（登录/注册/找回密码）
│   ├── bookmarklet/        # 书签栏工具
│   ├── categories/         # 分类浏览
│   ├── category/[slug]/    # 单个分类
│   ├── collection/[id]/    # 合集详情
│   ├── create/             # 创建合集
│   ├── dashboard/          # 用户仪表盘
│   ├── edit/[id]/          # 编辑合集
│   ├── favorites/          # 收藏夹
│   ├── import/             # 书签导入
│   ├── profile/            # 个人设置
│   └── user/[id]/          # 用户公开主页
├── src/
│   ├── components/         # 通用组件
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具函数和配置
│   ├── styles/             # 全局样式
│   └── types/              # TypeScript 类型定义
├── messages/               # 国际化翻译文件
├── public/                 # 静态资源
└── supabase/               # Supabase 迁移和配置
```

---

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 许可证

MIT License © 2026 Isaac

---

<div align="center">

**AI不会取代你，但会用AI的人会。**

</div>
