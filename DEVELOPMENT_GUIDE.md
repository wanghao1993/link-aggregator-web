# 🔐 认证系统开发指南

## 📋 当前状态

✅ **已完成：**

- 国际化支持（中文/英文）
- 认证 UI 组件（注册/登录表单）
- 开发模式 Resend 邮件服务
- 开发模式 OAuth 模拟
- Supabase CLI 配置
- Docker 安装

⏳ **进行中：**

- Supabase 本地服务启动（下载 Docker 镜像）

## 🚀 快速开始

### 1. 启动开发服务器

```bash
cd link-aggregator-web
npm run dev
```

### 2. 访问测试页面

- 注册页面：http://localhost:3000/zh/auth/signup
- 登录页面：http://localhost:3000/zh/auth/signin
- 首页：http://localhost:3000/zh
- 英文版：http://localhost:3000/en/auth/signup

## 🎭 开发模式功能

### 📧 邮件服务（开发模式）

- 邮件不会真实发送，而是输出到控制台
- 验证码会显示在控制台中方便测试
- 支持验证码邮件、欢迎邮件、密码重置邮件

### 🔐 OAuth 认证（开发模式）

- GitHub/Google 登录使用模拟用户数据
- 无需真实 OAuth 应用配置
- 点击 OAuth 按钮即可模拟登录流程

### 🗄️ 数据库（开发模式）

- 使用 Supabase 本地服务
- 自动创建数据库表结构
- 包含用户、会话、验证码等表

## 🔧 环境配置

### 环境变量 (.env.local)

```bash
# Supabase本地配置
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 邮件服务（开发模式）
RESEND_API_KEY=re_development_key_placeholder
EMAIL_FROM=noreply@linkhub.local

# OAuth（开发模式）
GITHUB_CLIENT_ID=github_dev_client_id
GITHUB_CLIENT_SECRET=github_dev_client_secret
GOOGLE_CLIENT_ID=google_dev_client_id
GOOGLE_CLIENT_SECRET=google_dev_client_secret

```

## 📊 数据库表结构

### 主要表：

1. **users** - 用户基本信息
2. **profiles** - 用户个人资料
3. **verification_codes** - 邮箱验证码
4. **sessions** - 用户会话
5. **accounts** - OAuth 账户关联

### 运行数据库迁移：

```bash
cd link-aggregator-web
supabase db reset
```

## 🧪 测试用户

### 开发模式 OAuth 用户：

- **GitHub 用户 1**: GitHub Developer (github@example.com)
- **GitHub 用户 2**: Open Source Contributor (contributor@example.com)
- **Google 用户 1**: Google User (google@example.com)
- **Google 用户 2**: G Suite User (gsuite@example.com)

### 邮箱注册：

- 任意邮箱地址（格式正确即可）
- 密码至少 8 位字符
- 验证码：6 位数字（控制台查看）

## 🔄 切换到生产模式

### 1. 获取真实 API 密钥

- **Resend**: 注册 https://resend.com
- **GitHub OAuth**: https://github.com/settings/developers
- **Google OAuth**: https://console.cloud.google.com/apis/credentials

### 2. 更新环境变量

```bash
# 真实Resend API密钥
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 真实GitHub OAuth
GITHUB_CLIENT_ID=your_real_github_client_id
GITHUB_CLIENT_SECRET=your_real_github_client_secret

# 真实Google OAuth
GOOGLE_CLIENT_ID=your_real_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_real_google_client_secret
```

### 3. 配置 OAuth 回调 URL

- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

## 🐛 故障排除

### Supabase 启动失败

```bash
# 检查Docker状态
systemctl status docker

# 重启Docker
systemctl restart docker

# 重新启动Supabase
supabase stop
supabase start
```

### 数据库连接问题

```bash
# 检查Supabase状态
supabase status

# 重置数据库
supabase db reset

# 查看日志
supabase logs
```

### 开发服务器问题

```bash
# 清理缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新安装依赖
npm install

# 重新启动
npm run dev
```

## 📁 项目结构

```
link-aggregator-web/
├── app/[locale]/auth/          # 认证页面
│   ├── signin/page.tsx        # 登录页面
│   └── signup/page.tsx        # 注册页面
├── src/components/auth/       # 认证组件
│   ├── SignInForm.tsx        # 登录表单
│   └── SignUpForm.tsx        # 注册表单
├── src/lib/auth/             # 认证逻辑
│   ├── auth.ts              # NextAuth配置
│   └── dev-oauth.ts         # 开发模式OAuth
├── src/lib/email/           # 邮件服务
│   └── dev-resend.ts        # 开发模式Resend
├── src/lib/supabase/        # Supabase客户端
│   ├── client.ts           # 客户端配置
│   └── server.ts           # 服务端配置
├── supabase/               # Supabase配置
│   ├── config.toml        # 配置文件
│   └── migrations/        # 数据库迁移
└── messages/              # 国际化翻译
    ├── zh.json           # 中文翻译
    └── en.json           # 英文翻译
```

## 📞 支持

遇到问题请检查：

1. 控制台错误信息
2. Supabase 日志：`supabase logs`
3. 开发服务器日志
4. 浏览器开发者工具

## 🎯 下一步计划

1. ✅ 完成 Supabase 本地服务启动
2. ✅ 运行数据库迁移
3. ✅ 测试完整认证流程
4. ✅ 添加用户状态管理
5. ✅ 实现登出功能
6. ✅ 添加个人资料页面

---

**开发愉快！** 🚀

如有问题，请参考控制台输出或查看相关日志文件。
