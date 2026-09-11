# 第 14 章 · 添加身份认证

> 英文标题：Adding Authentication
> 官方文档：https://nextjs.org/learn/dashboard-app/adding-authentication
> 本章目录：`chapters/14-adding-authentication/`
> 📚 **知识点与详细讲解**：`lib/chapters/14-adding-authentication.ts`（章节页 `/chapters/adding-authentication` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 NextAuth.js（Auth.js）给 dashboard 添加登录认证，并用 Proxy 保护受保护路由。

> ⚠️ 本章内容最多，建议**分几次**完成。

## 🎯 学习目标

- 用 Auth.js / NextAuth 配置 Credentials 登录
- 用 `useActionState` 处理登录错误与 pending
- 用 Proxy（旧版 `middleware`）保护 `/dashboard`
- 添加登出功能

## 📋 步骤清单

### 1. 创建登录页

新建 `app/login/page.tsx`，渲染 `<LoginForm />`（用 `<Suspense>` 包裹，因为它会读取 URL 参数）。

### 2. 配置 Auth

创建 `auth.config.ts` 与 `auth.ts`，添加 `Credentials` provider。
用 `bcrypt` 比对密码——`bcrypt` 依赖 Node API，在 Proxy 环境不可用，所以要**单独放到一个文件**里。

```ts
// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({})],
});
```

### 3. 登录 Action

在 `app/lib/actions.ts` 写 `authenticate`，调用 `signIn('credentials', formData)`，捕获 `AuthError` 返回友好错误。

### 4. 登录表单

`app/ui/login-form.tsx` 用 `useActionState(authenticate, undefined)` 处理错误与 pending，并读取 `callbackUrl`：

```tsx
const [errorMessage, formAction, isPending] = useActionState(
  authenticate,
  undefined,
);
```

### 5. 保护路由

配置 **Proxy** 匹配 `/dashboard`，未登录时重定向到 `/login`。

> 版本注意：Next.js 16 中 `middleware.ts` 已更名为 `proxy.ts`；早期版本仍是 `middleware.ts`。请按你安装的版本与官方文档对应处理。

### 6. 登出

在 `app/ui/dashboard/sidenav.tsx` 用表单调用 `signOut`：

```tsx
<form
  action={async () => {
    'use server';
    await signOut({ redirectTo: '/' });
  }}
>
  <button>Sign Out</button>
</form>
```

## 💡 提示 / 易错点

- 登录用的测试账号密码在第 6 章播种数据里（`app/lib/placeholder-data.ts`）。
- 需要环境变量 `AUTH_SECRET`（新版 NextAuth 用 `AUTH_SECRET`）。
- 版本差异较大，遇到 API 名称对不上，优先看官方文档对应版本。

## ✅ 完成标准

- [ ] 未登录访问 `/dashboard` 会被重定向到 `/login`
- [ ] 用正确账号能登录，错误账号有提示
- [ ] 侧边栏能登出

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 本章概念多，可以让 Agent 先讲清「认证 / 授权 / 会话」的区别，再逐条动手。
