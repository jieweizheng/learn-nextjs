# 第 6 章 · 搭建数据库

> 英文标题：Setting Up Your Database
> 官方文档：https://nextjs.org/learn/dashboard-app/setting-up-your-database
> 本章目录：`chapters/06-setting-up-your-database/`
> 📚 **知识点与详细讲解**：`lib/chapters/06-setting-up-your-database.ts`（章节页 `/chapters/setting-up-your-database` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

> 📌 本章要用的 `app/seed/route.ts`、`app/query/route.ts`、`app/lib/data.ts` **已经都在项目里了**，
> 它们依赖的 `bcrypt` / `postgres` 也已安装 —— 直接按官方步骤做即可，不用自己造这些文件。
> 另外「推到 GitHub」推的是**整个工作台仓库**（工作台代码会一起部署，这是正常的）；
> `.gitignore` 已忽略 `.env`，密钥不会被提交。

把项目推到 GitHub、连上 Vercel，创建 Postgres 数据库并播种初始数据。

## 🎯 学习目标

- 把代码推到 GitHub
- 用 Vercel 导入仓库并部署
- 创建 Postgres 数据库并配置 `.env`
- 运行 `/seed` 播种数据，用 `/query` 验证

## 📋 步骤清单

### 1. 推送到 GitHub

为项目创建一个 GitHub 仓库并推送代码。

### 2. 注册并部署到 Vercel

在 https://vercel.com/signup 用 GitHub 登录（选 Hobby 免费版），导入仓库并点击 **Deploy**。

### 3. 创建 Postgres 数据库

进入项目 Dashboard → **Storage** → **Create Database**，选一个 Postgres 提供方（Neon / Supabase）。
到 `.env.local` 标签点 **Show secret**，**先显示再复制**连接信息。

### 4. 配置环境变量

把项目里的 `.env.example` 重命名为 `.env`，粘贴复制的内容。
并确认 `.gitignore` 已忽略 `.env`，避免密钥泄露。

### 5. 播种数据库

保持 `npm run dev` 运行，访问 http://localhost:3000/seed ，看到 `Database seeded successfully` 即成功。之后可以删除这个 seed 文件。

### 6. 验证查询

打开 `app/query/route.ts`，取消注释 `listInvoices()` 相关代码（去掉 `Response.json()` 包裹），访问 http://localhost:3000/query ，应返回一条发票数据。

## 💡 提示 / 易错点

- **一定要先 Show secret 再复制**，否则拿到的是占位值。
- 如果你熟悉 Postgres，也可以自备数据库并跳过 Vercel 部分，但要同步修改 `data.ts` 里的查询。
- 播种用了 `bcrypt` 给密码做哈希；若 `bcrypt` 与你的环境不兼容，可改用 `bcryptjs`。

## ✅ 完成标准

- [ ] 项目已在 Vercel 部署成功
- [ ] 数据库已创建，`.env` 配置完毕且未被提交
- [ ] `/seed` 提示成功，`/query` 能返回数据

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令，也**不得**代你操作 Vercel / 数据库后台。
- 涉及账号、密钥的操作一律由你自己完成；可以让 Agent 解释每一步在做什么。
