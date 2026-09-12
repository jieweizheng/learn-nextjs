import type { Chapter } from "./types";

export const chapter14: Chapter = {
  num: 14,
  slug: "adding-authentication",
  title: "Adding Authentication",
  titleZh: "添加身份认证",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/adding-authentication",
  summary:
    "用 NextAuth.js（Auth.js）配置 Credentials 登录，做登录页、登录表单与路由保护，最后加上登出。",
  goals: [
    "理解认证（authentication）要解决的问题，以及为什么要用成熟库",
    "会用 Auth.js / NextAuth 配置 Credentials provider，并用 bcrypt 校验密码",
    "会用 `useActionState` 处理登录错误与 pending 状态",
    "会用 Proxy（旧称 middleware）保护 `/dashboard`",
    "会实现登出",
  ],
  points: [
    {
      title: "认证要做什么，为什么不自研",
      why: "认证涉及会话、Cookie、加密、CSRF 等一堆易错细节，自研几乎必然出漏洞。",
      explain: [
        "**认证（Authentication）** 回答「你是谁」，**授权（Authorization）** 回答「你能做什么」。本章只做认证：加登录页，未登录不能进 `/dashboard`。",
        "课程用 **NextAuth.js（现名 Auth.js）** + **Credentials provider**（邮箱 + 密码）+ **bcrypt**（比对哈希密码）。密码永远以哈希形式存在库里（第 6 章播种时已处理），登录时只做 `bcrypt.compare`。",
        "不自研的理由：自己写会话意味着要处理签名 Cookie、过期、刷新、CSRF、时序攻击等。另外本课程**还没做授权**（角色与权限）—— 那是后续可以自己加的方向。",
      ],
      check: "能区分「认证」与「授权」，并说出课程为什么选 Credentials provider。",
    },
    {
      title: "创建登录页",
      why: "先给用户一个入口，后面的配置才有地方验证。",
      explain: [
        "新建 `app/login/page.tsx`，渲染课程准备好的 `<LoginForm />`（`app/ui/login-form.tsx`）。",
        "要用 **`<Suspense>`** 包起来 —— 登录表单会读 URL 里的 `callbackUrl`（登录后回跳地址），属于运行时参数，会触发客户端渲染。与第 10 章「用 Suspense 包住读 URL 参数的组件」同理。",
        "同时按文档加元数据 `export const metadata = { title: 'Login' }`（提前用到第 15 章内容）。",
      ],
      code:
        "// app/login/page.tsx\nimport AcmeLogo from '@/app/ui/acme-logo';\nimport LoginForm from '@/app/ui/login-form';\nimport { Suspense } from 'react';\n\nexport default function LoginPage() {\n  return (\n    <main className=\"flex items-center justify-center md:h-screen\">\n      <div className=\"relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32\">\n        <div className=\"flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36\">\n          <div className=\"w-32 text-white md:w-36\">\n            <AcmeLogo />\n          </div>\n        </div>\n        <Suspense>\n          <LoginForm />\n        </Suspense>\n      </div>\n    </main>\n  );\n}",
      check: "访问 `/login` 能看到登录表单（还没接上认证，提交暂时无效）。",
    },
    {
      title: "配置 Auth：为什么把配置拆成两个文件",
      why: "本章最容易「照抄却不懂」的地方，理解拆分原因就不会写错。",
      explain: [
        "两个文件：",
        "- `auth.config.ts`：**与运行环境无关的配置**（`pages`、`providers` 空数组、`callbacks`）",
        "- `auth.ts`：`NextAuth({ ...authConfig, providers: [Credentials({ authorize })] })`，导出 `handlers`、`auth`、`signIn`、`signOut`",
        "为什么拆？路由保护（Proxy / 旧称 middleware）运行在**受限运行时**，不能引入依赖 Node 专有 API 的模块。`bcrypt` 依赖 Node 加密能力，而 `auth.config.ts` 不含它，所以能被 Proxy 安全引用；完整的 `auth.ts`（含 bcrypt）只在服务端用。",
        "`authorize` 是核心：从 `credentials` 取 email / password → `sql` 查用户 → 不存在则 `return null` → `bcrypt.compare(password, user.password)` 校验 → 通过返回用户对象（去掉 password 字段）。",
        "还要配 `AUTH_SECRET`（用于签名会话令牌）：`npx auth secret` 生成，写进 `.env`。",
      ],
      code:
        "// auth.config.ts\nimport type { NextAuthConfig } from 'next-auth';\n\nexport const authConfig = {\n  pages: { signIn: '/login' },\n  providers: [], // 在 auth.ts 里补上\n  callbacks: {\n    authorized({ auth, request: { nextUrl } }) {\n      const isLoggedIn = !!auth?.user;\n      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');\n      if (isOnDashboard) {\n        if (isLoggedIn) return true;\n        return false; // 未登录 → 重定向到登录页\n      } else if (isLoggedIn) {\n        return Response.redirect(new URL('/dashboard', nextUrl));\n      }\n      return true;\n    },\n  },\n} satisfies NextAuthConfig;\n\n// auth.ts\nimport NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nimport bcrypt from 'bcrypt';\nimport postgres from 'postgres';\nimport { authConfig } from './auth.config';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });\n\nexport const { auth, signIn, signOut } = NextAuth({\n  ...authConfig,\n  providers: [\n    Credentials({\n      async authorize(credentials) {\n        try {\n          const user = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;\n          if (!user[0]) return null;\n          const passwordsMatch = await bcrypt.compare(credentials.password as string, user[0].password);\n          if (passwordsMatch) {\n            const { password, ...userWithoutPassword } = user[0];\n            return userWithoutPassword as any;\n          }\n        } catch (error) {\n          console.error('Failed to fetch user:', error);\n        }\n        return null;\n      },\n    }),\n  ],\n});",
      check: "两个文件建好、`AUTH_SECRET` 写进 `.env`，项目能正常启动。",
      pitfalls: [
        "在 `auth.config.ts` 里 import `bcrypt`，会让路由保护那一步报运行时错误 —— 这正是要拆文件的原因。",
        "忘记配置 `AUTH_SECRET`：会话无法签名，登录行为异常。",
        "登录账号沿用第 6 章播种的数据（以你 `app/lib/placeholder-data.ts` 里的实际值为准）。",
      ],
    },
    {
      title: "写 authenticate：登录用的 Server Action",
      why: "登录也是一次写操作，用 Server Action 正好延续第 11 章的模式。",
      explain: [
        "在 `app/lib/actions.ts` 新增 `authenticate(prevState, formData)`：取 email / password，然后 `await signIn('credentials', { ...credentials, redirectTo: '/dashboard' })`（课程里也会用到 `callbackUrl`）。",
        "失败处理：`signIn` 在凭据错误时抛 `AuthError`。外层 `try/catch`，`catch` 里 `if (error instanceof AuthError)` 就 `return 'Invalid credentials.'`，其他未知错误 `return 'Something went wrong.'`。",
        "注意 `authenticate` **不用 zod**（课程选择），直接把凭据交给 Auth.js 的 `authorize` 校验 —— 校验逻辑集中在 `auth.ts`。",
      ],
      code:
        "// app/lib/actions.ts —— 在已有内容下面「追加」这个函数\n//（文件里已经有 'use server' 与 createInvoice / updateInvoice / deleteInvoice，都不动）\n// 只在顶部补这两个 import：\nimport { signIn } from '@/auth';\nimport { AuthError } from 'next-auth';\n\nexport async function authenticate(prevState: string | undefined, formData: FormData) {\n  try {\n    await signIn('credentials', formData);\n  } catch (error) {\n    if (error instanceof AuthError) {\n      switch (error.type) {\n        case 'CredentialsSignin':\n          return 'Invalid credentials.';\n        default:\n          return 'Something went wrong.';\n      }\n    }\n    throw error; // 注意：redirect 也靠抛错实现，必须把非 AuthError 重新抛出\n  }\n}",
      check: "用错误密码提交，界面能拿到 `Invalid credentials.`；用正确密码能进入 `/dashboard`。",
      pitfalls: [
        "在 catch 里把所有错误都 `return` 成字符串，会导致**登录成功后不跳转**（成功跳转也走抛错路径）—— 和上一章 `redirect` 的坑同源。",
      ],
    },
    {
      title: "登录表单：useActionState + callbackUrl",
      why: "把错误显示出来、把「你从哪来」记住，登录体验才完整。",
      explain: [
        "用 `useSearchParams()` 读 `callbackUrl`，放进隐藏字段：`<input type=\"hidden\" name=\"callbackUrl\" value={searchParams.get('callbackUrl') || '/dashboard'} />`。这样被踢到登录页时能记住原目标，登录后回到那个页面。",
        "错误显示用带 `aria-live=\"polite\"` 的区域；按钮在 `isPending` 时显示转圈图标 —— 这些第 13 章已练过。",
        "`const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);`，表单 `<form action={formAction}>`。",
      ],
      code:
        "// app/ui/login-form.tsx —— starter 自带这个文件；上一步的登录页已经 import 了它。\n// ① 文件顶部加 'use client' 与这两个 import\n'use client';\n\nimport { useActionState } from 'react';\nimport { useSearchParams } from 'next/navigation';\nimport { authenticate } from '@/app/lib/actions';\n\n// ② 下面 3 行放在组件函数体内部\nconst searchParams = useSearchParams();\nconst callbackUrl = searchParams.get('callbackUrl') || '/dashboard';\nconst [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);\n\n// ③ 把 return 里最外层的 <form> 换成这段（email / password 输入框保留在原位）\n<form action={formAction} className=\"space-y-3\">\n  {/* email / password 输入框 */}\n  <input type=\"hidden\" name=\"callbackUrl\" value={callbackUrl} />\n  <button disabled={isPending}>{isPending ? 'Logging in...' : 'Log in'}</button>\n  {errorMessage && (\n    <p className=\"text-sm text-red-500\" aria-live=\"polite\">{errorMessage}</p>\n  )}\n</form>",
      check: "未登录访问 `/dashboard/invoices` 被弹到 `/login?callbackUrl=...`，登录后回到 invoices 页。",
    },
    {
      title: "保护路由：用 Proxy（旧称 middleware）",
      why: "认证要在「每个受保护请求」上都拦一道。",
      explain: [
        "在**项目根目录**创建 `proxy.ts`（Next.js 16 的新名字）。内容是 `export default NextAuth(authConfig).auth;` + 一个 matcher 声明要拦截哪些路径。",
        "重定向逻辑不写在这里，而在 `auth.config.ts` 的 **`callbacks.authorized`**（上一步已写好）：判断「是否已登录」与「是否访问 dashboard」，未登录返回 `false`，Auth.js 就重定向到 `pages.signIn` 的 `/login`。",
        "更细的用法：页面里可 `const session = await auth();`，按 `session?.user` 判断是否渲染某些内容（甚至做**基于角色的授权**）。这是「页面级检查」，与 Proxy 的「请求级拦截」互补。",
      ],
      note: "旧文档与教程里写的是 middleware.ts，Next.js 16 已更名为 proxy.ts。按你安装的版本写，别照抄旧教程。",
      code:
        "// proxy.ts（项目根目录，Next.js 16 的写法）\nimport NextAuth from 'next-auth';\nimport { authConfig } from './auth.config';\n\nexport default NextAuth(authConfig).auth;\n\nexport const config = {\n  matcher: ['/((?!api|_next/static|_next/image|.*\\\\.png$).*)'],\n};",
      check: "登出状态下直接访问 `/dashboard`，会被自动重定向到 `/login`。",
      pitfalls: [
        "文件名写错（新版写成 middleware.ts）可能导致拦截不生效。",
        "matcher 太宽会把静态资源也拦进去；写得不对可能连登录页都被保护，形成重定向死循环。",
      ],
    },
    {
      title: "加上登出",
      why: "有进有出，认证流程才闭环。",
      explain: [
        "在 `app/ui/dashboard/sidenav.tsx` 里把登出按钮包进表单：`<form action={handleSignOut}>`，`handleSignOut` 是内联 Server Action：`'use server'; await signOut();`。",
        "用表单而不是 `onClick`，延续第 11 章的渐进增强思路；`signOut()` 清掉会话并跳转（可配 `redirectTo` 到 `/login`）。",
        "按钮补一个可读名称（图标 + `sr-only` 文字），别让屏幕阅读器只读到「按钮」。",
      ],
      code:
        "// app/ui/dashboard/sidenav.tsx —— ① 顶部加这两个 import\nimport { signOut } from '@/auth';\nimport { PowerIcon } from '@heroicons/react/24/outline';\n\n// ② 在 <nav> 里、导航链接列表的下面，新增这一整段：\n<form\n  action={async () => {\n    'use server';\n    await signOut();\n  }}\n>\n  <button className=\"flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3\">\n    <PowerIcon className=\"w-6\" />\n    <div className=\"hidden md:block\">Sign Out</div>\n  </button>\n</form>",
      check: "点登出后回到登录页，此时再访问 `/dashboard` 会被拦回登录页。",
    },
  ],
  tips: [
    "本章内容最多（配置、Action、表单、路由保护四块），建议分两三次完成。",
    "版本差异：middleware.ts → `proxy.ts`；`useFormState` → `useActionState`；`next-auth@beta` 就是 Auth.js v5。报错先确认版本。",
    "⛔ 安全底线：`bcrypt`、`AUTH_SECRET`、数据库连接串只在服务端使用，绝不能被客户端组件引用。",
  ],
};
