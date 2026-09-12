import type { Chapter } from "./types";

export const chapter07: Chapter = {
  num: 7,
  slug: "fetching-data",
  title: "Fetching Data",
  titleZh: "获取数据",
  officialUrl: "https://nextjs.org/learn/dashboard-app/fetching-data",
  summary:
    "在服务端组件里直接用 SQL 查数据库，为 dashboard 首页的三个区块取数，并认识「请求瀑布」这个性能陷阱。",
  goals: [
    "知道取数有哪几种方式，以及课程的取舍理由",
    "理解 `sql` 为什么只能在服务端执行",
    "会在 async 服务端组件里 `await` 取数并传给子组件",
    "能识别请求瀑布，并说明它为什么拖慢页面",
  ],
  points: [
    {
      title: "取数的三条路：API 层 / ORM / 直接 SQL",
      why: "写真实项目一定要做这个选择，先弄清朝向比记住 API 更重要。",
      explain: [
        "三条路的取舍：",
        "- **API 层**：自己写 Route Handler（`app/api/` 下新建目录 + `route.ts`），前端 fetch。与前端解耦、便于对外复用；但服务端组件本就跑在服务端，再绕一圈 HTTP 往往没必要",
        "- **ORM**：Prisma、Drizzle 之类把表映射成对象，类型安全、可迁移；代价是多一层抽象，复杂查询反而更难表达",
        "- **直接 SQL**：课程选这条 —— 用 `postgres.js` 直接写。**看得见本质**（确切知道发了什么查询）、依赖少、性能可控",
      ],
      check: "能用一两句话说出三种方式各自的取舍，并说明课程为什么选直接 SQL。",
    },
    {
      title: "认识 app/lib/data.ts 与那个 sql 变量",
      why: "整个课程的数据访问都集中在这一个文件（数据访问层）。",
      explain: [
        "`app/lib/data.ts` 顶部：`const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })` —— 创建**连接池**，后续所有查询共用它。",
        "- `sql` 依赖 Node 环境与密钥，**只能在服务端运行**",
        "- Server Component 默认就在服务端，所以组件里可直接 `import` 取数函数、**不需要先做 API 路由** —— 这是 App Router 很大的便利",
        "- 所有查询函数（`fetchRevenue`、`fetchLatestInvoices`、`fetchCardData`…）都放这里，这种「对外只暴露函数的数据库层」叫 **DAL（Data Access Layer）**",
      ],
      code:
        "// app/lib/data.ts（顶部，本项目已有）\nimport postgres from 'postgres';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });",
      check: "能说出「为什么不建 API 路由也能取数」，以及 `sql` 为什么不能出现在客户端组件里。",
    },
    {
      title: "在 async 服务端组件里取数（RevenueChart）",
      why: "页面变成 `async` 函数，`await` 数据，再把结果作为 props 传下去。",
      explain: [
        "`app/dashboard/page.tsx` 在第 4 章已建过（当时只有 `<p>Dashboard Page</p>`）。这一步**把整个文件换成**下面这样：组件写成 `export default async function Page()`，`await fetchRevenue()`，再传给 `<RevenueChart revenue={revenue} />`。服务端组件可以是 `async` 的，这是它相对客户端组件的关键能力。",
        "⚠️ 常见误解：**同一个函数里多个 `await` 是串行执行的** —— 第二个查询要等第一个返回才开始，总耗时是两者之和。`async/await` 只是顺序代码的语法糖，**不提供并发**；要并发必须显式用 `Promise.all`。",
      ],
      note: "同时按文档取消注释 `app/ui/dashboard/revenue-chart.tsx` 里的相关代码。官方 starter 把这段注释掉是因为前几章还没有 `fetchRevenue()`，提前打开只会看到空壳或报错。要打开的三处：`generateYAxis(revenue)`、空数据兜底的 `if (!revenue || revenue.length === 0)`、JSX 里 `{/* NOTE: Uncomment this code in Chapter 7 */}` 下面那整块柱状图。",
      code:
        "// app/dashboard/page.tsx\nimport { fetchRevenue } from '@/app/lib/data';\nimport RevenueChart from '@/app/ui/dashboard/revenue-chart';\n\nexport default async function Page() {\n  const revenue = await fetchRevenue();\n\n  return (\n    <main>\n      <h1 className=\"mb-4 text-xl md:text-2xl\">Dashboard</h1>\n      <div className=\"grid gap-6 sm:grid-cols-2 lg:grid-cols-4\">\n        {/* 卡片…… */}\n      </div>\n      <div className=\"mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8\">\n        <RevenueChart revenue={revenue} />\n      </div>\n    </main>\n  );\n}",
      check: "`/dashboard` 上出现收入图表；想清楚「取消注释」的代码做了什么。",
      pitfalls: [
        "照抄示例时记得补 `import RevenueChart from '@/app/ui/dashboard/revenue-chart'`（`RevenueChart` 是**默认导出**，`Card` 才是具名导出 —— 写反了报 `does not provide an export named`）。",
        "忘记把页面写成 `async`，`await` 会直接报语法错误。",
        "async 组件忘了 `return` JSX：React 报 `Nothing was returned from render`。",
        "属性名要写 `revenue={revenue}`；写成 `props={revenue}` 时组件里是 `undefined`，会静默命中兜底显示 `No data available.`。",
      ],
    },
    {
      title: "为 LatestInvoices 取数",
      why: "重复一遍「取数 → 传 props → 渲染」，把模式固定下来。",
      explain: [
        "代码同样写在 `app/dashboard/page.tsx`：在上一版基础上**加三处** —— 顶部加 `import`、`await` 一行查询、JSX 里加 `<LatestInvoices latestInvoices={latestInvoices} />`。",
        "并按文档**取消注释** `app/ui/dashboard/latest-invoices.tsx` 里的渲染代码，否则组件是个空壳。",
        "这个查询用 `ORDER BY date DESC LIMIT 5` 只取**最近 5 条**，并 JOIN 客户表拿姓名与头像 —— 别把全表查出来再 `slice`。",
        "金额是 `number`，显示前用 `formatCurrency`（`app/lib/utils.ts`）格式化。",
      ],
      note: "`latest-invoices.tsx` 的渲染代码也被注释着，理由同 `revenue-chart.tsx`。",
      code:
        "// app/dashboard/page.tsx —— 在上一版基础上改三处\n// ① 顶部补两条 import（LatestInvoices 同样是默认导出，不要用花括号）\nimport { fetchRevenue, fetchLatestInvoices } from '@/app/lib/data';\nimport RevenueChart from '@/app/ui/dashboard/revenue-chart';\nimport LatestInvoices from '@/app/ui/dashboard/latest-invoices';\n\nexport default async function Page() {\n  const revenue = await fetchRevenue();\n  // ② 加这一行查询\n  const latestInvoices = await fetchLatestInvoices();\n\n  return (\n    <main>\n      <h1 className=\"mb-4 text-xl md:text-2xl\">Dashboard</h1>\n      <div className=\"mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8\">\n        <RevenueChart revenue={revenue} />\n        {/* ③ 加这一段，放在图表后面（官方布局是左 4 栏 + 右 4 栏） */}\n        <LatestInvoices latestInvoices={latestInvoices} />\n      </div>\n    </main>\n  );\n}",
      check: "`/dashboard` 右侧出现最近 5 条发票，带客户头像、邮箱与格式化后的金额。",
      pitfalls: [
        "属性名是 `latestInvoices`（复数、有 s），写成 `latestInvoice` 时组件内取到 `undefined`。",
        "两个 `await` 是**串行**的：这里影响不大，但要知道慢在哪。",
      ],
    },
    {
      title: "练习：给四张卡片取数（默认并发？不，是 Promise.all）",
      why: "第一次遇到「一个函数里查多次」的场景。",
      explain: [
        "用 `fetchCardData()` 取四个值（发票总数、客户总数、待付款金额、已付款金额），在 `app/dashboard/page.tsx` 里解构出来传给四个 `<Card>`。",
        "这一步做完，三块数据就齐了。下面这段代码是**这一步结束后 `app/dashboard/page.tsx` 的完整样子**，前两步加的都在里面，可直接对照检查。",
        "`COUNT(*)` 返回的是**字符串**（bigint 可能超出 JS 安全整数范围），所以 `fetchCardData` 里用 `Number(...)` 转换；金额用 `formatCurrency` 转成字符串。",
      ],
      note: "`fetchCardData` 内部用 `Promise.all` 并发了三条查询，但**它内部并发不代表页面级并发** —— `fetchCardData()` 本身仍是页面里第三个 `await`，下一条会展开讲。",
      code:
        "// app/dashboard/page.tsx —— 这一步做完后的完整页面（前两步加的都在里面）\nimport {\n  fetchRevenue,\n  fetchLatestInvoices,\n  fetchCardData,\n} from '@/app/lib/data';\nimport RevenueChart from '@/app/ui/dashboard/revenue-chart';\nimport LatestInvoices from '@/app/ui/dashboard/latest-invoices';\nimport { Card } from '@/app/ui/dashboard/cards'; // ← Card 是具名导出，要带花括号\n\nexport default async function Page() {\n  const revenue = await fetchRevenue();\n  const latestInvoices = await fetchLatestInvoices();\n  const {\n    numberOfInvoices,\n    numberOfCustomers,\n    totalPaidInvoices,\n    totalPendingInvoices,\n  } = await fetchCardData();\n\n  return (\n    <main>\n      <h1 className=\"mb-4 text-xl md:text-2xl\">Dashboard</h1>\n      <div className=\"grid gap-6 sm:grid-cols-2 lg:grid-cols-4\">\n        <Card title=\"Collected\" value={totalPaidInvoices} type=\"collected\" />\n        <Card title=\"Pending\" value={totalPendingInvoices} type=\"pending\" />\n        <Card title=\"Total Invoices\" value={numberOfInvoices} type=\"invoices\" />\n        <Card title=\"Total Customers\" value={numberOfCustomers} type=\"customers\" />\n      </div>\n      <div className=\"mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8\">\n        <RevenueChart revenue={revenue} />\n        <LatestInvoices latestInvoices={latestInvoices} />\n      </div>\n    </main>\n  );\n}",
      check: "四张卡片都显示出真实的数字与金额；能指出 `Promise.all` 相比逐个 `await` 快在哪里。",
      pitfalls: [
        "`Card` 是**具名导出**（`import { Card }`），`RevenueChart` / `LatestInvoices` 是默认导出 —— 写反了报 `does not provide an export named`。",
      ],
    },
    {
      title: "请求瀑布：为什么页面会被最慢的请求拖住",
      why: "这是本章最该记住的性能陷阱，第 9 章的流式渲染就是在解决它。",
      explain: [
        "回头看上一步那个完整页面：三个连续的 `await` **一个接一个**执行，每步都要等上一步完成 —— 这叫 **request waterfall（请求瀑布）**，总耗时是各请求**之和**。",
        "容易混淆的一点：`fetchCardData` **内部**并发了三条 SQL，那只加快了这个函数内部；它整体仍是页面里**第三个** `await`。并发发生在哪一层，决定了优化的是哪一段。",
        "更糟的是整页要等**所有**数据到齐才输出 HTML —— 一个慢就整页慢，用户面对的是白屏。",
        "第 9 章会用「取数下移 + `<Suspense>`」解决。本章不用改代码，先**认出**这个问题。",
      ],
      code:
        "// 上一步那个 app/dashboard/page.tsx 的开头几行（只看三个 await 的先后）\nexport default async function Page() {\n  const revenue = await fetchRevenue();              // ① 先等它\n  const latestInvoices = await fetchLatestInvoices(); // ② 再等它（要等 ① 完成才开始）\n  const { numberOfInvoices /* …… */ } = await fetchCardData(); // ③ 最后等它\n  // 总耗时 = ① + ② + ③\n}\n\n// 如果改成页面级并发（本章不要求改，只是对照）：\nconst [revenue, latestInvoices, card] = await Promise.all([\n  fetchRevenue(),\n  fetchLatestInvoices(),\n  fetchCardData(),\n]);\n// 总耗时 ≈ 三者里最慢的那个",
      check: "能在纸上画出现有页面三个 `await` 的时序图，并说出总耗时为什么是三者之和；能分清「函数内部并发」与「页面级并发」。",
    },
  ],
  tips: [
    "取数函数统一放 `app/lib/data.ts`，不要在组件里临时写 SQL —— 保持 DAL 单一出口。",
    "凡是直接用数据库的函数，只能被服务端组件或 Server Action 调用；客户端组件走 props 传值。",
    "本章结束时页面应该能看到：四张卡片 + 收入图表 + 最新发票列表，全部来自真实数据库。",
  ],
};
