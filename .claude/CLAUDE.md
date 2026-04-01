# LinkHub - Link Aggregator Web

## 项目概述

LinkHub 是一个链接聚合平台，用户可以创建、分享和发现精选的链接合集。支持多语言（中/英）、用户认证、收藏、分类浏览等功能。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4 + 自定义主题系统
- **UI 组件**: Radix UI + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **认证**: NextAuth.js + Supabase Auth
- **国际化**: next-intl
- **状态管理**: TanStack React Query
- **表单处理**: React Hook Form + Zod

## 目录结构

```
├── app/                      # Next.js App Router
│   ├── [locale]/             # 国际化路由
│   │   ├── auth/             # 认证页面 (signin, signup, forgot-password)
│   │   ├── admin/            # 管理后台 (users, categories, collections, tags)
│   │   ├── collection/[id]/  # 合集详情页
│   │   ├── user/[id]/        # 用户主页
│   │   ├── create/           # 创建合集
│   │   ├── edit/[id]/        # 编辑合集
│   │   ├── import/           # 导入书签
│   │   ├── bookmarklet/      # 书签小工具
│   │   ├── dashboard/        # 用户仪表盘
│   │   └── favorites/        # 收藏列表
│   ├── api/                  # API 路由
│   └── providers.tsx         # 全局 Providers
├── src/
│   ├── components/           # React 组件
│   │   ├── ui/               # 基础 UI 组件 (shadcn/ui)
│   │   ├── auth/             # 认证相关组件
│   │   └── skeletons/        # 加载骨架屏
│   ├── lib/                  # 工具库
│   │   ├── auth/             # 认证逻辑
│   │   ├── email/            # 邮件服务
│   │   ├── supabase/         # Supabase 客户端配置
│   │   └── bookmarks/        # 书签解析
│   ├── hooks/                # 自定义 Hooks
│   ├── types/                # TypeScript 类型定义
│   └── styles/               # 主题样式
├── supabase/
│   └── migrations/           # 数据库迁移文件
├── messages/                 # 国际化翻译文件 (zh.json, en.json)
└── scripts/                  # 脚本文件
```

## 路径别名

- `@/*` 映射到 `./src/*`

## 编码规范

### 组件开发

1. 使用函数组件和 React Hooks
2. 组件命名使用 PascalCase
3. 使用 `useTranslations` 获取国际化文本:
   ```tsx
   const t = useTranslations('namespace');
   ```
4. 导入顺序: React → 第三方库 → 本地组件 → 工具函数 → 类型

### 样式规范

1. 使用 Tailwind CSS 类名
2. 自定义主题变量在 `src/styles/theme.css` 和 `src/index.css` 中定义
3. 支持深色模式 (通过 `next-themes`)
4. 常用自定义类: `glass-effect`, `link-card-hover`, `bg-brand-gradient`

### 类型安全

1. 严格模式 (`strict: true`)
2. 所有 API 响应和组件 props 都要有类型定义
3. 类型文件放在 `src/types/` 目录

### 数据库操作

1. 客户端使用 `src/lib/supabase/client.ts`
2. 服务端使用 `src/lib/supabase/server.ts`
3. 数据库变更通过 Supabase 迁移文件管理

### 国际化

1. 默认语言为中文 (`zh`)
2. 支持语言: `zh`, `en`
3. 翻译文件位于 `messages/` 目录
4. 路由格式: `/{locale}/path`

## API 路由

- `/api/auth/register` - 用户注册
- `/api/auth/signin` - 登录
- `/api/auth/send-verification` - 发送验证邮件
- `/api/auth/dev-oauth/callback` - 开发模式 OAuth 回调
- `/api/auth/[...nextauth]` - NextAuth 路由

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产服务器
npm run lint       # 运行 ESLint
npm run set-admin  # 设置管理员用户
```

## 环境变量

关键环境变量（参见 `.env.local.example`）:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥
- `RESEND_API_KEY` - Resend 邮件服务 API 密钥
- `EMAIL_FROM` - 发件人邮箱
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth

## 数据模型

### 主要实体

- **User** - 用户信息
- **Profile** - 用户资料
- **Collection** - 链接合集
- **Link** - 单个链接
- **Category** - 分类
- **Tag** - 标签
- **Follow** - 用户关注关系
- **Notification** - 通知

## 注意事项

1. **认证**: 使用 NextAuth.js + Supabase 双重认证系统
2. **主题**: 支持多种主题色，通过 `ThemeColorSelector` 组件切换
3. **SEO**: 使用 `src/lib/seo.ts` 管理 SEO 元数据
4. **性能**: 使用动态导入和骨架屏优化加载体验
5. **安全**: API 路由需要验证用户身份

## 常见任务

### 添加新页面

1. 在 `app/[locale]/` 下创建目录
2. 添加 `page.tsx` 文件
3. 在 `messages/zh.json` 和 `messages/en.json` 添加翻译

### 添加新组件

1. 在 `src/components/` 下创建组件
2. 使用 `useTranslations` 处理文本
3. 如需 UI 组件，使用 `src/components/ui/` 中的基础组件

### 添加新 API

1. 在 `src/app/api/` 下创建路由
2. 使用 `src/lib/supabase/server.ts` 进行数据库操作
3. 确保添加适当的错误处理和认证检查

### 数据库迁移

1. 在 `supabase/migrations/` 创建新迁移文件
2. 运行 `supabase db reset` 应用迁移

### 其它要求
1. 每个页面都需要兼容手机平板设备