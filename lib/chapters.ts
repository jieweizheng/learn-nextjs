export type ChapterStep = {
  /** 步骤标题 */
  title: string;
  /** 该步骤要做什么 */
  detail: string;
  /** 需要你自己在终端输入的命令（Agent 不会替你运行） */
  code?: string;
};

export type Chapter = {
  /** 章节序号 1-16 */
  num: number;
  /** 路由 / 目录标识，对应 chapters/<slug>/ */
  slug: string;
  /** 官方英文标题 */
  title: string;
  /** 中文标题 */
  titleZh: string;
  /** 官方文档地址 */
  officialUrl: string;
  /** 一句话说明本章要做什么 */
  summary: string;
  /** 学习目标 */
  goals: string[];
  /** 步骤清单 */
  steps: ChapterStep[];
  /** 提示 / 易错点 */
  tips?: string[];
};

export const chapters: Chapter[] = [
  {
    num: 1,
    slug: "getting-started",
    title: "Getting Started",
    titleZh: "快速上手",
    officialUrl: "https://nextjs.org/learn/dashboard-app/getting-started",
    summary:
      "用官方 starter 模板创建 dashboard 项目，认识目录结构并把它跑起来。",
    goals: [
      "用 create-next-app 创建课程项目",
      "认识 /app、/app/lib、/app/ui、/public 各自负责什么",
      "会启动开发服务器并访问 localhost:3000",
      "了解课程使用 TypeScript 与占位数据",
    ],
    steps: [
      {
        title: "创建项目",
        detail:
          "在你想放项目的目录下，用课程提供的 starter 模板创建 nextjs-dashboard。文档默认用 pnpm，本项目统一用 npm，保持一种包管理器即可。",
        code: 'npx create-next-app@latest nextjs-dashboard --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example" --use-npm',
      },
      {
        title: "进入目录并安装依赖",
        detail: "进入刚创建的项目目录，安装依赖。",
        code: "cd nextjs-dashboard\nnpm install",
      },
      {
        title: "启动开发服务器",
        detail:
          "启动后访问 http://localhost:3000，你会看到一个（故意没有样式的）首页。",
        code: "npm run dev",
      },
      {
        title: "探索目录结构",
        detail:
          "打开编辑器，依次认识：/app（路由、组件与逻辑）、/app/lib（工具与取数函数）、/app/ui（预置好的 UI 组件）、/public（静态资源），以及根目录的 next.config.ts 等配置文件。",
      },
      {
        title: "读两个关键文件",
        detail:
          "打开 app/lib/placeholder-data.ts（占位数据，第 6 章会用它播种数据库）和 app/lib/definitions.ts（数据库返回值的 TypeScript 类型定义）。",
      },
    ],
    tips: [
      "不用纠结看不懂的代码：课程大部分代码已经写好，重点是理解 Next.js 的特性。",
      "全程使用同一种包管理器，避免出现多个 lockfile。",
    ],
  },
  {
    num: 2,
    slug: "css-styling",
    title: "CSS Styling",
    titleZh: "CSS 样式",
    officialUrl: "https://nextjs.org/learn/dashboard-app/css-styling",
    summary:
      "用全局样式 + Tailwind + CSS Modules 给应用加样式，并用 clsx 做条件类名。",
    goals: [
      "在根布局引入全局 CSS",
      "用 Tailwind 工具类写样式",
      "用 CSS Modules 做组件级作用域样式",
      "用 clsx 按状态切换类名",
    ],
    steps: [
      {
        title: "引入全局样式",
        detail:
          "打开 app/layout.tsx，在顶部 import '@/app/ui/global.css'。保存后首页就有样式了——样式来自 global.css 里的 Tailwind 指令。",
      },
      {
        title: "认识 Tailwind",
        detail:
          "global.css 中的 @tailwind base/components/utilities 就是 Tailwind。给元素加类名即可写样式，例如 text-blue-500。试着在 app/page.tsx 里用 border 类拼出一个三角形。",
      },
      {
        title: "改用 CSS Modules",
        detail:
          "在 app/ui 新建 home.module.css，写入 .shape 规则，然后在 page.tsx 用 styles.shape 替换 Tailwind 类名，效果保持一致。",
      },
      {
        title: "用 clsx 切换类名",
        detail:
          "查看 app/ui/invoices/status.tsx，它用 clsx 根据 status（pending / paid）条件应用类名。",
      },
    ],
    tips: ["Tailwind 与 CSS Modules 可以并存，按个人偏好选择即可。"],
  },
  {
    num: 3,
    slug: "optimizing-fonts-images",
    title: "Optimizing Fonts and Images",
    titleZh: "优化字体与图片",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/optimizing-fonts-images",
    summary:
      "用 next/font 添加自定义字体、用 next/image 添加响应式图片，理解 Next.js 的优化机制。",
    goals: [
      "用 next/font/google 添加主字体与次字体",
      "用 next/image 的 <Image> 添加响应式图片",
      "理解字体 / 图片优化如何减少布局偏移",
    ],
    steps: [
      {
        title: "创建字体文件",
        detail:
          "在 app/ui 新建 fonts.ts，从 next/font/google 引入 Inter 并导出 inter（subsets: ['latin']）。",
        code: "import { Inter } from 'next/font/google';\nexport const inter = Inter({ subsets: ['latin'] });",
      },
      {
        title: "在根布局应用主字体",
        detail:
          "在 app/layout.tsx 引入 inter，把 inter.className 和 antialiased 加到 <body>，字体将全局生效。",
      },
      {
        title: "练习：添加次字体",
        detail:
          "在 fonts.ts 再加 Lusitana（含 400 / 700 字重），应用到 app/page.tsx 的 <p> 上；并把 <AcmeLogo /> 取消注释。",
      },
      {
        title: "添加桌面端 hero 图",
        detail:
          "从 next/image 引入 Image，在 app/page.tsx 添加 hero-desktop.png，width=1000、height=760，类名用 hidden md:block。",
      },
      {
        title: "练习：添加移动端 hero 图",
        detail:
          "再加 hero-mobile.png，width=560、height=620，让它仅在移动端显示，桌面端与移动端各显示其一。",
      },
    ],
    tips: [
      "<Image> 的 width/height 要与源图比例一致，它用于避免布局偏移，而不是最终显示尺寸。",
    ],
  },
  {
    num: 4,
    slug: "creating-layouts-and-pages",
    title: "Creating Layouts and Pages",
    titleZh: "创建布局与页面",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages",
    summary:
      "用「文件夹即路由」的方式创建 dashboard 页面，并做一个可共享的嵌套布局。",
    goals: [
      "理解文件系统路由：文件夹 = 路由段",
      "创建 page.tsx 建立可访问路由",
      "用 layout.tsx 在多个页面间共享 UI",
      "理解根布局与部分渲染",
    ],
    steps: [
      {
        title: "创建 dashboard 页面",
        detail:
          "新建 app/dashboard/page.tsx，返回 <p>Dashboard Page</p>，访问 /dashboard 查看效果。",
      },
      {
        title: "练习：再建两个页面",
        detail:
          "分别创建 /dashboard/customers 与 /dashboard/invoices 两个页面，各返回一段文字。",
      },
      {
        title: "创建 dashboard 布局",
        detail:
          "新建 app/dashboard/layout.tsx，引入 <SideNav /> 并渲染 {children}，让 dashboard 下所有页面共享侧边栏。",
      },
      {
        title: "理解根布局",
        detail:
          "回顾 app/layout.tsx：它是必需的根布局，作用于全站。导航时布局不会重新渲染，页面之间只更新变化的部分，这叫部分渲染。",
      },
    ],
  },
  {
    num: 5,
    slug: "navigating-between-pages",
    title: "Navigating Between Pages",
    titleZh: "页面间导航",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/navigating-between-pages",
    summary: "用 next/link 做客户端导航，并用 usePathname 高亮当前页。",
    goals: [
      "用 <Link> 替代 <a> 实现客户端导航",
      "理解代码分割与预取",
      "用 usePathname + clsx 高亮活动链接",
    ],
    steps: [
      {
        title: "换成 Link 组件",
        detail:
          "打开 app/ui/dashboard/nav-links.tsx，引入 next/link，把 <a> 换成 <Link>。导航时不再整页刷新。",
      },
      {
        title: "高亮当前链接",
        detail:
          "在该文件顶部加 'use client'，引入 usePathname()，用 clsx 在 pathname === link.href 时应用高亮类名。",
      },
    ],
    tips: ["生产环境里，<Link> 进入视口时会自动预取目标路由的代码。"],
  },
  {
    num: 6,
    slug: "setting-up-your-database",
    title: "Setting Up Your Database",
    titleZh: "搭建数据库",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/setting-up-your-database",
    summary:
      "把项目推到 GitHub、连上 Vercel，创建 Postgres 数据库并播种初始数据。",
    goals: [
      "把代码推到 GitHub",
      "用 Vercel 导入仓库并部署",
      "创建 Postgres 数据库并配置 .env",
      "运行 /seed 播种数据，用 /query 验证",
    ],
    steps: [
      {
        title: "推送到 GitHub",
        detail: "为项目创建一个 GitHub 仓库并把代码推送上去。",
      },
      {
        title: "注册并部署到 Vercel",
        detail:
          "在 vercel.com 用 GitHub 登录（Hobby 免费版），导入仓库并点击 Deploy。",
      },
      {
        title: "创建 Postgres 数据库",
        detail:
          "进入项目 Storage → Create Database，选一个 Postgres 提供方。再到 .env.local 标签点 Show secret 并复制连接信息。",
      },
      {
        title: "配置环境变量",
        detail:
          "把项目里的 .env.example 重命名为 .env，粘贴刚才复制的内容；并确认 .gitignore 已忽略 .env，避免密钥泄露。",
      },
      {
        title: "播种数据库",
        detail:
          "保持 npm run dev 运行，访问 http://localhost:3000/seed，看到 “Database seeded successfully” 即成功，之后可以删除该文件。",
      },
      {
        title: "验证查询",
        detail:
          "打开 app/query/route.ts，取消注释 listInvoices() 相关代码，访问 /query，应返回一条发票数据。",
      },
    ],
    tips: [
      "如果你熟悉 Postgres，也可以自备数据库跳过 Vercel 部分，但要同步修改 data.ts 里的查询。",
    ],
  },
  {
    num: 7,
    slug: "fetching-data",
    title: "Fetching Data",
    titleZh: "获取数据",
    officialUrl: "https://nextjs.org/learn/dashboard-app/fetching-data",
    summary:
      "在 Server Component 里直接用 SQL 查询数据库，为 dashboard 首页取数，并认识请求瀑布。",
    goals: [
      "了解几种数据获取方式（API / ORM / SQL）",
      "用 postgres.js 在服务端直连数据库",
      "在 async Server Component 中取数",
      "识别并理解「请求瀑布」",
    ],
    steps: [
      {
        title: "认识 data.ts",
        detail:
          "查看 app/lib/data.ts：用 postgres 连接数据库，sql 只能在服务端调用；本课程所有查询都放在这里。",
      },
      {
        title: "为 RevenueChart 取数",
        detail:
          "在 app/dashboard/page.tsx 引入并 await fetchRevenue()，取消注释 <RevenueChart/> 及其内部代码，看到图表。",
      },
      {
        title: "为 LatestInvoices 取数",
        detail:
          "再 await fetchLatestInvoices()，取消注释 <LatestInvoices/> 及其内部代码，只显示最近 5 条发票。",
      },
      {
        title: "练习：为 Card 取数",
        detail:
          "用 fetchCardData()（返回发票 / 客户数量与金额）给四个 <Card> 取数并解构使用。",
      },
    ],
    tips: [
      "当前多个 await 是串行执行的，会形成「请求瀑布」；第 9 章会用并行与 Suspense 优化。",
    ],
  },
  {
    num: 8,
    slug: "static-and-dynamic-rendering",
    title: "Static and Dynamic Rendering",
    titleZh: "静态与动态渲染",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering",
    summary: "理解静态渲染与动态渲染的差异，并亲眼看到慢请求如何拖慢整页。",
    goals: [
      "区分静态渲染与动态渲染",
      "知道各自的适用场景",
      "模拟慢数据请求并观察影响",
    ],
    steps: [
      {
        title: "模拟慢请求",
        detail:
          "在 app/lib/data.ts 的 fetchRevenue() 里取消注释 console.log 与 3 秒的 setTimeout。",
      },
      {
        title: "观察阻塞",
        detail:
          "刷新 /dashboard：整页会卡约 3 秒才显示，终端会打印两行日志。这说明动态渲染下，页面只和「最慢的一次数据请求」一样快。",
      },
    ],
    tips: [
      "不要在生产环境真的 setTimeout，这里只是为了演示。",
      "这段演示代码可以在第 9 章用流式渲染来优化。",
    ],
  },
  {
    num: 9,
    slug: "streaming",
    title: "Streaming",
    titleZh: "流式渲染",
    officialUrl: "https://nextjs.org/learn/dashboard-app/streaming",
    summary:
      "用 loading.tsx 与 Suspense 把页面拆成小块流式发送，配合骨架屏改善加载体验。",
    goals: [
      "理解流式渲染的价值",
      "用 loading.tsx 做整页级 loading",
      "用 Suspense 做组件级流式",
      "用路由组 (overview) 限定 loading 作用范围",
      "使用骨架屏组件",
    ],
    steps: [
      {
        title: "整页 loading",
        detail:
          "新建 app/dashboard/loading.tsx 并返回 <div>Loading...</div>，刷新观察：侧边栏立即显示，内容稍后到达。",
      },
      {
        title: "换成骨架屏",
        detail:
          "把 loading.tsx 内容换成 <DashboardSkeleton />（来自 app/ui/skeletons）。",
      },
      {
        title: "用路由组限定范围",
        detail:
          "在 app/dashboard 下新建 (overview) 文件夹，把 page.tsx 与 loading.tsx 移进去，使 loading 只作用于概览页。",
      },
      {
        title: "组件级流式",
        detail:
          "把 fetchRevenue() 下移到 <RevenueChart/> 组件内部，用 <Suspense fallback={<RevenueChartSkeleton/>}> 包裹它，页面其余部分立即可见。",
      },
      {
        title: "练习：流式 LatestInvoices",
        detail:
          "同样把 fetchLatestInvoices 下移到组件内，用 <LatestInvoicesSkeleton/> 包裹。",
      },
      {
        title: "分组卡片",
        detail:
          "用 <CardWrapper/> 包裹四张卡片并用 <CardsSkeleton/> 做 fallback，让卡片同时出现，避免逐张闪现。",
      },
    ],
    tips: [
      "通用建议：把取数下移到真正需要它的组件，再用 Suspense 包裹它。",
    ],
  },
  {
    num: 10,
    slug: "adding-search-and-pagination",
    title: "Adding Search and Pagination",
    titleZh: "搜索与分页",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/adding-search-and-pagination",
    summary:
      "用 URL 查询参数实现搜索与分页，掌握 useSearchParams / usePathname / useRouter。",
    goals: [
      "用 URL search params 管理搜索与分页状态",
      "客户端用 useSearchParams 读取参数",
      "服务端用 searchParams 属性读取参数",
      "用防抖优化输入体验",
    ],
    steps: [
      {
        title: "准备页面",
        detail:
          "把官方文档给出的起始代码粘贴进 app/dashboard/invoices/page.tsx，认识 <Search/>、<Pagination/>、<Table/>。",
      },
      {
        title: "捕获输入",
        detail:
          "在 app/ui/search.tsx 写 handleSearch(term) 并给 <input> 加 onChange，先在浏览器控制台打印验证。",
      },
      {
        title: "写入 URL",
        detail:
          "用 useSearchParams 构造 URLSearchParams：term 有值时 set('query', term)，否则 delete；再用 useRouter().replace 更新 URL。",
      },
      {
        title: "同步输入框",
        detail:
          "给 <input> 加 defaultValue={searchParams.get('query')?.toString()}，刷新后输入框仍保留查询词。",
      },
      {
        title: "表格随查询更新",
        detail:
          "在页面接收 searchParams（Promise），取出 query / currentPage 传给 <Table/>，用 <Suspense key={query + currentPage}> 包裹。",
      },
      {
        title: "加上分页",
        detail:
          "用 fetchInvoicesPages(query) 得到 totalPages 传给 <Pagination/>，并在分页组件里用 usePathname / useSearchParams 生成页码链接。",
      },
      {
        title: "加防抖",
        detail:
          "用 use-debounce 的 useDebouncedCallback 包裹 handleSearch（约 300ms），避免每次按键都发请求。",
      },
    ],
  },
  {
    num: 11,
    slug: "mutating-data",
    title: "Mutating Data",
    titleZh: "修改数据（Server Actions）",
    officialUrl: "https://nextjs.org/learn/dashboard-app/mutating-data",
    summary:
      "用 React Server Actions 创建、更新、删除发票，并用 revalidatePath 刷新缓存。",
    goals: [
      "理解 Server Actions 与 'use server'",
      "表单提交直接调用 Server Action",
      "用 zod 校验 FormData",
      "用 revalidatePath 失效缓存并 redirect",
      "用 bind 把 id 传给 Action",
    ],
    steps: [
      {
        title: "创建路由与表单",
        detail:
          "新建 app/dashboard/invoices/create/page.tsx，取 customers 并渲染 <Form>。",
      },
      {
        title: "创建 Server Action",
        detail:
          "新建 app/lib/actions.ts，顶部加 'use server'，写 createInvoice(formData)；表单用 <form action={createInvoice}>。",
      },
      {
        title: "校验并准备数据",
        detail:
          "用 zod schema 解析表单字段，金额转成分（× 100），生成 YYYY-MM-DD 格式的日期。",
      },
      {
        title: "写入数据库",
        detail: "用 sql 执行 INSERT，把新发票写入数据库。",
      },
      {
        title: "刷新并跳转",
        detail:
          "先 revalidatePath('/dashboard/invoices')，再 redirect('/dashboard/invoices')。",
      },
      {
        title: "编辑发票",
        detail:
          "新建 app/dashboard/invoices/[id]/edit/page.tsx，用 params 取 id，用 Promise.all 并行获取发票与客户；用 bind 把 id 传给 updateInvoice。",
      },
      {
        title: "删除发票",
        detail:
          "把删除按钮包在 <form action={deleteInvoiceWithId}> 里，用 bind 传 id；Action 内执行 DELETE 并 revalidatePath。",
      },
    ],
    tips: [
      "不能直接写成 updateInvoice(id) 传参，要用 .bind(null, id)，或使用隐藏 input。",
    ],
  },
  {
    num: 12,
    slug: "error-handling",
    title: "Handling Errors",
    titleZh: "错误处理",
    officialUrl: "https://nextjs.org/learn/dashboard-app/error-handling",
    summary: "用 try/catch、error.tsx 与 notFound 优雅地处理错误与 404。",
    goals: [
      "在 Server Action 里使用 try/catch",
      "用 error.tsx 做路由段的错误兜底",
      "用 notFound + not-found.tsx 处理 404",
    ],
    steps: [
      {
        title: "给 Action 加 try/catch",
        detail:
          "把数据库操作放进 try，失败时返回错误信息；注意 redirect() 要放在 try/catch 之外——它靠抛错来工作。",
      },
      {
        title: "用 error.tsx 兜底",
        detail:
          "新建 app/dashboard/invoices/error.tsx（'use client'），接收 error 与 reset，渲染提示与「再试一次」按钮。",
      },
      {
        title: "处理 404",
        detail:
          "在 [id]/edit/page.tsx 里，当 invoice 为空时调用 notFound()；再在同目录新建 not-found.tsx 显示 404 UI。",
      },
    ],
    tips: ["notFound 的优先级高于 error.tsx。"],
  },
  {
    num: 13,
    slug: "improving-accessibility",
    title: "Improving Accessibility",
    titleZh: "提升可访问性",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/improving-accessibility",
    summary:
      "做客户端与服务端表单校验，用 useActionState 显示错误，并加上无障碍的 aria 属性。",
    goals: [
      "理解客户端校验与服务端校验",
      "用 useActionState 管理表单状态",
      "用 zod safeParse 返回字段错误",
      "给表单添加 aria-describedby / aria-live",
    ],
    steps: [
      {
        title: "了解客户端校验",
        detail:
          "给输入加 required 体验浏览器原生校验（了解即可，随后可以移除）。",
      },
      {
        title: "引入 useActionState",
        detail:
          "把 create-form.tsx 改为 'use client'，用 useActionState(createInvoice, initialState)，表单改为 <form action={formAction}>。",
      },
      {
        title: "服务端校验",
        detail:
          "在 actions.ts 定义 State 类型，把 parse 换成 safeParse，校验失败时返回 { errors, message }。",
      },
      {
        title: "显示错误 + aria",
        detail:
          "在表单里根据 state.errors 渲染每个字段的错误，并加 aria-describedby、aria-live='polite' 等属性。",
      },
      {
        title: "练习",
        detail:
          "给其余字段补齐错误显示，并运行 npm run lint 检查 aria 用法；有精力再给 edit-form 也加上。",
      },
    ],
  },
  {
    num: 14,
    slug: "adding-authentication",
    title: "Adding Authentication",
    titleZh: "添加身份认证",
    officialUrl:
      "https://nextjs.org/learn/dashboard-app/adding-authentication",
    summary:
      "用 NextAuth.js 给 dashboard 添加登录认证，并用 Proxy 保护受保护路由。",
    goals: [
      "用 Auth.js / NextAuth 配置 Credentials 登录",
      "用 useActionState 处理登录错误与 pending",
      "用 Proxy（旧版 middleware）保护 /dashboard",
      "添加登出功能",
    ],
    steps: [
      {
        title: "创建登录页",
        detail:
          "新建 app/login/page.tsx，渲染 <LoginForm/>（用 <Suspense> 包裹，因为它会读取 URL 参数）。",
      },
      {
        title: "配置 Auth",
        detail:
          "创建 auth.config.ts 与 auth.ts，添加 Credentials provider，并用 bcrypt 比对密码（bcrypt 依赖 Node API，需单独文件以避免 Proxy 环境报错）。",
      },
      {
        title: "登录 Action",
        detail:
          "在 actions.ts 写 authenticate，调用 signIn('credentials', formData)，捕获 AuthError 并返回友好错误。",
      },
      {
        title: "登录表单",
        detail:
          "login-form.tsx 用 useActionState(authenticate, undefined) 处理错误与 pending，并读取 callbackUrl。",
      },
      {
        title: "保护路由",
        detail:
          "配置 Proxy（Next.js 16 中为 proxy.ts，旧版为 middleware.ts）匹配 /dashboard，未登录时重定向到 /login。",
      },
      {
        title: "登出",
        detail: "在 sidenav.tsx 用 <form action={...signOut}> 添加登出按钮。",
      },
    ],
    tips: [
      "本章内容最多，建议分几次完成。",
      "注意版本差异：新版 Next.js 把 middleware 更名为 proxy。",
    ],
  },
  {
    num: 15,
    slug: "adding-metadata",
    title: "Adding Metadata",
    titleZh: "添加元数据",
    officialUrl: "https://nextjs.org/learn/dashboard-app/adding-metadata",
    summary:
      "用 Metadata API 配置标题、描述、Open Graph 与 favicon，优化 SEO 与分享效果。",
    goals: [
      "了解常见的元数据类型",
      "使用静态 metadata 对象与 title.template",
      "使用文件约定（icon / opengraph-image）",
      "给各个页面设置标题",
    ],
    steps: [
      {
        title: "文件式元数据",
        detail:
          "把 public 下的 favicon.ico 与 opengraph-image.jpg 移到 app/ 根目录，Next.js 会自动识别并注入。",
      },
      {
        title: "配置根元数据",
        detail:
          "在 app/layout.tsx 导出 metadata 对象，包含 title（含 template 与 default）、description、metadataBase。",
      },
      {
        title: "页面级标题",
        detail:
          "给 /dashboard/invoices 等页面导出 metadata.title，验证标题变为 “Invoices | Acme Dashboard”。",
      },
      {
        title: "练习",
        detail:
          "给 /login、/dashboard、customers、invoices/create、[id]/edit 等页面补上标题。",
      },
    ],
  },
  {
    num: 16,
    slug: "next-steps",
    title: "Next Steps",
    titleZh: "下一步",
    officialUrl: "https://nextjs.org/learn/dashboard-app/next-steps",
    summary: "恭喜完成课程！了解如何继续深入并把应用部署上线。",
    goals: [
      "回顾已掌握的能力",
      "把应用部署上线并分享",
      "了解继续学习的方向与资源",
    ],
    steps: [
      {
        title: "部署",
        detail:
          "把项目推到 GitHub，Vercel 会自动构建部署；之后每次推送到 main 分支都会自动重新部署。",
      },
      {
        title: "继续学习",
        detail:
          "浏览 Next.js 官方文档与模板市场（Admin Dashboard、Commerce、Blog Starter 等），动手做自己的项目。",
      },
      {
        title: "分享",
        detail:
          "把作品分享给朋友或在社区晒出来，并持续用「做项目」的方式练习。",
      },
    ],
  },
];

/** 根据 slug 查找章节 */
export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

/** 章节目录名，例如 01-getting-started */
export function chapterDirName(chapter: Chapter): string {
  return `${String(chapter.num).padStart(2, "0")}-${chapter.slug}`;
}

/** 章节学习计划文件的相对路径，例如 chapters/01-getting-started/PLAN.md */
export function chapterPlanPath(chapter: Chapter): string {
  return `chapters/${chapterDirName(chapter)}/PLAN.md`;
}
