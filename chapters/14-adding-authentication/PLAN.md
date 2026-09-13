# 第 14 章 · 添加身份认证

> 英文标题：Adding Authentication
> 官方文档：https://nextjs.org/learn/dashboard-app/adding-authentication
> 本章目录：`chapters/14-adding-authentication/`
> 📚 **知识点与详细讲解**：`lib/chapters/14-adding-authentication.ts`（章节页 `/chapters/adding-authentication` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 NextAuth.js（Auth.js）给 dashboard 添加登录认证，并用 Proxy 保护受保护路由。

> ⚠️ 本章内容最多，建议**分几次**完成。
>
> ⚠️ **开始前先装依赖**：`npm install next-auth@beta`（**`@beta` 不能省** —— 不加会装到 v4，那套 API 完全不同，本章代码会全线报错）。`bcrypt` 第 6 章已装，无需重复安装。装完再用 `npx auth secret` 生成 `AUTH_SECRET` 写进 `.env`（该命令由 next-auth v5 自带，所以要在装完依赖之后跑）。
>
> 🔑 **测试账号**：`user@nextmail.com` / 密码 `123456`（第 6 章种子数据自带，见 `app/lib/placeholder-data.ts` 的 `users`；播种时用 `bcrypt.hash` 哈希后入库）。若报 `Invalid credentials.`，先访问一次 `/seed`（重复跑安全）。

## 🎯 学习目标

- 用 Auth.js / NextAuth 配置 Credentials 登录
- 用 `useActionState` 处理登录错误与 pending
- 用 Proxy（旧版 `middleware`）保护 `/dashboard`
- 添加登出功能

## 📋 步骤清单

### 1. 创建登录页

新建 `app/login/page.tsx`，渲染 `<LoginForm />`（用 `<Suspense>` 包裹，因为它会读取 URL 参数）。

> 官方这一步的示例**不含** metadata —— 给登录页加标题不属本章要求。想让 `/login` 有自己的标题可自行加 `export const metadata: Metadata = { title: 'Login' };`（可选，见 `lib/chapters/14-adding-authentication.ts` 该知识点的「背景」）。

### 2. 配置 Auth

**先装依赖 + 生成密钥**（官方本章的第一步）：`npm install next-auth@beta` → `npx auth secret`（写入 `.env`；`bcrypt` 第 6 章已装）。两个配置文件都建在**项目根目录**（不是 `app/`）。

创建 `auth.config.ts` 与 `auth.ts`，添加 `Credentials` provider。
用 `bcrypt` 比对密码——`bcrypt` 依赖 Node API，在 Proxy 环境不可用，所以要**单独放到一个文件**里。

⚠️ **`auth.config.ts` 里的 `authorized` 回调要按本项目改**：官方写法是「只要已登录、访问任何非 `/dashboard` 路径就送回 `/dashboard`」。官方应用的非 dashboard 页面只有 `/` 和 `/login`，没问题；但**本项目的 `/` 与 `/chapters/*` 是学习页面**，照抄会导致「登录成功后再也打不开章节页」。所以把重定向收窄到 `/login`：

```ts
authorized({ auth, request: { nextUrl } }) {
  const isLoggedIn = !!auth?.user;
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  if (isOnDashboard) return isLoggedIn; // 未登录 → 交给 pages.signIn 重定向
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
  return true;
}
```

⚠️ `authorize` 里**必须先 zod 校验** `credentials`，再取字段：`credentials` 的类型是 `Partial<Record<string, unknown>>`，直接把 `credentials.email` 传到 `sql` 模板会报 `ts(2769)`（`unknown` 不能作为查询参数）。校验通过后的 `parsedCredentials.data` 里 `email` / `password` 才是 `string`。完整代码见 `lib/chapters/14-adding-authentication.ts` 该知识点的示例（含 `getUser(email: string)` 辅助函数与 `sql<User[]>` 标注）。

```ts
// auth.ts（骨架；完整版见章节示例）
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
  return user[0];
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
});
```

### 3. 登录 Action

在 `app/lib/actions.ts` 写 `authenticate`，调用 `signIn('credentials', formData)`，捕获 `AuthError` 返回友好错误。

### 4. 登录表单

`app/ui/login-form.tsx` 的 starter 已含 `'use client'`、import 与组件体三行；本步只改**三处**：

1. email/password 收尾 `</div>` 之后、`<Button>` 之前，加隐藏字段：`name` = `redirectTo`、`value` = `{callbackUrl}`
2. `<Button>` 加 `aria-disabled={isPending}`（它的样式里有 `aria-disabled:` 变体）
3. 把空占位（`{/* Add form errors here */}`）补成错误区：外层 div 加 `aria-live="polite"` / `aria-atomic="true"`，内渲染 `ExclamationCircleIcon` + `errorMessage`

⚠️ **两个名字别混**：URL 查询参数叫 `callbackUrl`（`searchParams.get('callbackUrl')`，starter 已写）；**表单隐藏字段必须叫 `redirectTo`** —— `signIn('credentials', formData)` 按「选项名」从 FormData 取值，写错它不认，登录后就不回原目标页（`callbackUrl` 是旧版选项名，v5 已废弃改名）。

完整文件见 `lib/chapters/14-adding-authentication.ts` 该知识点的示例。

### 5. 保护路由

创建**项目根目录**的 `proxy.ts`（与 `app/` 同级）：

```ts
// proxy.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

⚠️ **这一步不做，前面全部白做**：没有 `proxy.ts` 就没有任何请求级拦截 —— 直接访问 `/dashboard/invoices` 会照常渲染（页面本身不检查登录）。「访问 dashboard 没跳登录页」= 这个文件还没建。

> 版本注意：Next.js 16 中 `middleware.ts` 已更名为 `proxy.ts`，**运行环境也从 Edge 换成了 Node.js**（功能不变）。早期版本仍是 `middleware.ts` + Edge。

### 6. 登出

`app/ui/dashboard/sidenav.tsx` 里**只改两处**：

1. 顶部 import 区加 `import { signOut } from '@/auth';`（`PowerIcon` starter 里已有，不用再加）
2. **给那个已经存在的 `<form>` 补上 `action`** —— starter 的侧边栏里已经有 `<form>` + PowerIcon 按钮（只是没有 `action`，所以点了没反应），**不要新增一个，也别去找 `<nav>`（这个文件里没有）**

```tsx
<form
  action={async () => {
    'use server';
    await signOut({ redirectTo: '/' });
  }}
>
  {/* 里面那个 PowerIcon 按钮保持原样 */}
</form>
```

⚠️ 别给这个文件加 `'use client'`（内联 Server Action 必须在服务端组件里定义）；`signOut` 从项目根目录的 `auth.ts` 引入，不是 `next-auth/react`。

## 💡 提示 / 易错点

- 登录用的测试账号密码在第 6 章播种数据里（`app/lib/placeholder-data.ts`）。
- 需要环境变量 `AUTH_SECRET`（新版 NextAuth 用 `AUTH_SECRET`）。
- 版本差异较大，遇到 API 名称对不上，优先看官方文档对应版本。

## ✅ 完成标准

- [ ] 未登录访问 `/dashboard` 会被重定向到 `/login`
- [ ] 用正确账号（`user@nextmail.com` / `123456`）能登录，错误密码有提示
- [ ] 侧边栏能登出

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 本章概念多，可以让 Agent 先讲清「认证 / 授权 / 会话」的区别，再逐条动手。
