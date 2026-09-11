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
      why: "认证涉及会话、Cookie、加密、CSRF 等一堆易错细节，自己从零实现几乎必然出漏洞。",
      explain: [
        "**认证（Authentication）** 回答「你是谁」，**授权（Authorization）** 回答「你能做什么」。本章只做认证：加一个登录页，未登录不能进入 `/dashboard`。",
        "课程用的是 **NextAuth.js（现名 Auth.js）**，配合 **Credentials provider**（用邮箱 + 密码登录）与 **bcrypt**（比对哈希后的密码）。这样密码永远以哈希形式存在数据库里（第 6 章播种时已经用 bcrypt 处理过），登录时只做 `bcrypt.compare`。",
        "为什么不自研？因为「自己写会话」意味着你要自己处理签名 Cookie、过期、刷新、CSRF、时序攻击等。用成熟库是官方推荐做法。另外要清楚一个边界：本课程还没做**授权**（角色与权限）—— 那是你后续可以自己加的方向。",
      ],
      check: "能区分「认证」与「授权」，并说出课程为什么选 Credentials provider。",
    },
    {
      title: "创建登录页",
      why: "先给用户一个「入口」，后面的配置才有地方验证。",
      explain: [
        "新建 `app/login/page.tsx`，渲染课程准备好的 `<LoginForm />`（`app/ui/login-form.tsx`）。",
        "注意它要用 **`<Suspense>`** 包起来 —— 因为登录表单会读取 URL 里的 `callbackUrl`（登录后要回跳的地址），这属于运行时参数，会让该部分触发客户端渲染。这与第 10 章「用 Suspense 包住读 URL 参数的组件」是同一个道理。",
        "同时按文档给登录页加一点元数据（`export const metadata = { title: 'Login' }`），这提前用到了第 15 章的内容。",
      ],
      code:
        "// app/login/page.tsx\nimport AcmeLogo from '@/app/ui/acme-logo';\nimport LoginForm from '@/app/ui/login-form';\nimport { Suspense } from 'react';\n\nexport default function LoginPage() {\n  return (\n    <main className=\"flex items-center justify-center md:h-screen\">\n      <div className=\"relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32\">\n        <div className=\"flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36\">\n          <div className=\"w-32 text-white md:w-36\">\n            <AcmeLogo />\n          </div>\n        </div>\n        <Suspense>\n          <LoginForm />\n        </Suspense>\n      </div>\n    </main>\n  );\n}",
      check: "访问 `/login` 能看到登录表单（还没接上认证，提交暂时无效）。",
    },
    {
      title: "配置 Auth：为什么把配置拆成两个文件",
      why: "这是本章最容易「照抄却不懂」的地方，理解拆分原因就不会写错。",
      explain: [
        "课程建两个文件：`auth.config.ts` 放**与运行环境无关的配置**（`pages`、`providers` 里的空数组、`callbacks` 等）；`auth.ts` 里再 `NextAuth({ ...authConfig, providers: [Credentials({ authorize })] })`，并导出 `handlers`、`auth`、`signIn`、`signOut`。",
        "为什么要拆？因为路由保护那一步（Proxy / 旧称 middleware）运行在**受限的运行时环境**里，不能引入依赖 Node 专有 API 的模块。`bcrypt` 依赖 Node 的加密能力，而 `auth.config.ts` 里不含它，所以可以被 Proxy 安全引用；完整的 `auth.ts`（含 bcrypt）只在服务端使用。",
        "`authorize` 函数是核心：从 `credentials` 取出 email / password，用 `sql` 查用户（`SELECT * FROM users WHERE email = ${email}`），若用户不存在则 `return null`；再用 `bcrypt.compare(password, user.password)` 校验，通过则返回用户对象（通常去掉 password 字段），否则 `return null`。",
        "另外要配 `AUTH_SECRET` 环境变量（Auth.js 用来签名会话令牌）—— 用 `npx auth secret` 生成，写进 `.env`。",
      ],
      code:
        "// auth.config.ts\nimport type { NextAuthConfig } from 'next-auth';\n\nexport const authConfig = {\n  pages: { signIn: '/login' },\n  providers: [], // 在 auth.ts 里补上\n  callbacks: {\n    authorized({ auth, request: { nextUrl } }) {\n      const isLoggedIn = !!auth?.user;\n      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');\n      if (isOnDashboard) {\n        if (isLoggedIn) return true;\n        return false; // 未登录 → 重定向到登录页\n      } else if (isLoggedIn) {\n        return Response.redirect(new URL('/dashboard', nextUrl));\n      }\n      return true;\n    },\n  },\n} satisfies NextAuthConfig;\n\n// auth.ts\nimport NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nimport bcrypt from 'bcrypt';\nimport postgres from 'postgres';\nimport { authConfig } from './auth.config';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });\n\nexport const { auth, signIn, signOut } = NextAuth({\n  ...authConfig,\n  providers: [\n    Credentials({\n      async authorize(credentials) {\n        try {\n          const user = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;\n          if (!user[0]) return null;\n          const passwordsMatch = await bcrypt.compare(credentials.password as string, user[0].password);\n          if (passwordsMatch) {\n            const { password, ...userWithoutPassword } = user[0];\n            return userWithoutPassword as any;\n          }\n        } catch (error) {\n          console.error('Failed to fetch user:', error);\n        }\n        return null;\n      },\n    }),\n  ],\n});",
      check: "两个文件建好、`AUTH_SECRET` 写进 `.env`，项目能正常启动（还没有登录页交互，但不应报错）。",
      pitfalls: [
        "在 `auth.config.ts` 里 import `bcrypt`，会让路由保护那一步报运行时错误 —— 这正是要拆文件的原因。",
        "忘记生成并配置 `AUTH_SECRET`：会话无法签名，登录行为会异常。",
        "课程的登录账号沿用第 6 章播种的数据，示例邮箱 `user@nextmail.com`、密码 `123456`（以你 `app/lib/placeholder-data.ts` 里的实际数据为准）。",
      ],
    },
    {
      title: "写 authenticate：登录用的 Server Action",
      why: "登录也是一次「写操作」，用 Server Action 处理正好延续第 11 章的模式。",
      explain: [
        "在 `app/lib/actions.ts`（同一个 `'use server'` 文件）里新增 `authenticate(prevState, formData)`：从 `formData` 取 email / password，构造 `{ email, password }`，然后 `await signIn('credentials', { ...credentials, redirectTo: '/dashboard' })`（课程里也会用到 `callbackUrl`）。",
        "失败时怎么处理？`signIn` 在凭据错误时会抛出 `AuthError`。所以外层用 `try/catch`，`catch` 里判断 `if (error instanceof AuthError)` 就 `return 'Invalid credentials.'`（返回给界面显示），其他未知错误则 `return 'Something went wrong.'`。",
        "注意这里 `authenticate` **不使用 zod**（课程的选择），它直接把凭据交给 Auth.js 的 `authorize` 去校验 —— 校验逻辑集中在 `auth.ts` 一处。",
      ],
      code:
        "// app/lib/actions.ts\n'use server';\n\nimport { signIn } from '@/auth';\nimport { AuthError } from 'next-auth';\n\nexport async function authenticate(prevState: string | undefined, formData: FormData) {\n  try {\n    await signIn('credentials', formData);\n  } catch (error) {\n    if (error instanceof AuthError) {\n      switch (error.type) {\n        case 'CredentialsSignin':\n          return 'Invalid credentials.';\n        default:\n          return 'Something went wrong.';\n      }\n    }\n    throw error; // 注意：redirect 也靠抛错实现，必须把非 AuthError 重新抛出\n  }\n}",
      check: "用错误密码提交，界面能拿到 `Invalid credentials.`；用正确密码提交能进入 `/dashboard`。",
      pitfalls: [
        "把 `throw error` 漏掉、在 catch 里把所有错误都 `return` 成一个字符串，会导致**登录成功后不跳转**（因为成功跳转也走抛错路径）——和上一章 `redirect` 的坑同源。",
      ],
    },
    {
      title: "登录表单：useActionState + callbackUrl",
      why: "把错误显示出来、把「你从哪来」记住，登录体验才算完整。",
      explain: [
        "在 `app/ui/login-form.tsx`（客户端组件）里：`const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);`，表单用 `<form action={formAction}>`。",
        "用 `useSearchParams()` 读取 `callbackUrl`，并放进一个隐藏字段：`<input type=\"hidden\" name=\"callbackUrl\" value={searchParams.get('callbackUrl') || '/dashboard'} />`。这样用户被踢到登录页时能记住原目标，登录后回到那个页面。",
        "错误显示用一个带 `aria-live=\"polite\"` 的区域；提交按钮在 `isPending` 时显示转圈图标 —— 这些你在第 13 章都已经练过了。",
      ],
      code:
        "'use client';\n\nimport { useActionState } from 'react';\nimport { useSearchParams } from 'next/navigation';\nimport { authenticate } from '@/app/lib/actions';\n\nconst searchParams = useSearchParams();\nconst callbackUrl = searchParams.get('callbackUrl') || '/dashboard';\nconst [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);\n\n<form action={formAction} className=\"space-y-3\">\n  {/* email / password 输入框 */}\n  <input type=\"hidden\" name=\"callbackUrl\" value={callbackUrl} />\n  <button disabled={isPending}>{isPending ? 'Logging in...' : 'Log in'}</button>\n  {errorMessage && (\n    <p className=\"text-sm text-red-500\" aria-live=\"polite\">{errorMessage}</p>\n  )}\n</form>",
      check: "未登录访问 `/dashboard/invoices` 被弹到 `/login?callbackUrl=...`，登录成功后回到 invoices 页，而不是回到 dashboard。",
    },
    {
      title: "保护路由：用 Proxy（旧称 middleware）",
      why: "认证不是只在登录页做一件事，而是要在「每个受保护请求」上都拦一道。",
      explain: [
        "在**项目根目录**创建 `proxy.ts`（Next.js 16 里的新名字；老版本叫 middleware.ts）。它大致是：`export const proxy = auth;`（把 Auth.js 的 `auth` 直接作为处理器），并通过 `export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\\\.png$).*)'] }` 之类的 matcher 声明要拦截哪些路径。",
        "实际的重定向逻辑并不写在这里，而是写在 `auth.config.ts` 的 **`callbacks.authorized`** 里（前面配置那一步已经写好了）：判断「是否已登录」与「是否访问 dashboard」，未登录返回 `false`，Auth.js 就会重定向到 `pages.signIn` 配置的 `/login`。",
        "课程里还提到一个更细的用法：在页面里可以直接 `const session = await auth();`，按 `session?.user` 判断是否渲染某些内容（甚至做**基于角色的授权**）。这属于「页面级检查」，与 Proxy 的「请求级拦截」是互补的两层。",
        "⚠️ **版本差异提醒**：旧文档与教程里写的是 middleware.ts，Next.js 16 已更名为 `proxy.ts`。按你安装的版本来写，别照抄旧教程。",
      ],
      code:
        "// proxy.ts（项目根目录，Next.js 16 的写法）\nimport NextAuth from 'next-auth';\nimport { authConfig } from './auth.config';\n\nexport default NextAuth(authConfig).auth;\n\nexport const config = {\n  matcher: ['/((?!api|_next/static|_next/image|.*\\\\.png$).*)'],\n};",
      check: "登出状态下直接访问 `/dashboard`，会被自动重定向到 `/login`。",
      pitfalls: [
        "文件名写错（在新版里写成 middleware.ts）可能导致拦截不生效，注意版本差异。",
        "matcher 写得太宽会把静态资源也拦进去，影响性能；写得不对则可能连登录页都被保护，形成重定向死循环。",
      ],
    },
    {
      title: "加上登出",
      why: "有进有出，认证流程才闭环。",
      explain: [
        "在 `app/ui/dashboard/sidenav.tsx` 里，把登出按钮包进一个表单：`<form action={handleSignOut}>`，其中 `handleSignOut` 是一个内联的 Server Action：`'use server'; await signOut();`。",
        "用表单而不是 `onClick`，延续第 11 章的渐进增强思路；`signOut()` 会清掉会话并跳转（课程里可以配 `redirectTo` 到 `/login`）。",
        "按钮上最好补一个可读名称（图标 + `sr-only` 文字），别让屏幕阅读器只读到「按钮」。",
      ],
      code:
        "// app/ui/dashboard/sidenav.tsx\nimport { signOut } from '@/auth';\nimport { PowerIcon } from '@heroicons/react/24/outline';\n\n<form\n  action={async () => {\n    'use server';\n    await signOut();\n  }}\n>\n  <button className=\"flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3\">\n    <PowerIcon className=\"w-6\" />\n    <div className=\"hidden md:block\">Sign Out</div>\n  </button>\n</form>",
      check: "点登出后回到登录页，此时再访问 `/dashboard` 会被拦回登录页。",
    },
  ],
  tips: [
    "本章内容最多（涉及配置、Action、表单、路由保护四块），建议分两三次完成，不要一口气做完。",
    "版本差异要留心：middleware.ts → `proxy.ts`；`useFormState` → `useActionState`；`next-auth@beta` 就是 Auth.js v5。遇到报错先确认自己装的是哪个版本。",
    "⛔ 安全底线：`bcrypt`、`AUTH_SECRET`、数据库连接串都只在服务端使用，绝不能被客户端组件引用。",
  ],
};
