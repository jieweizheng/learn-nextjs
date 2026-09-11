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
      why: "你以后写真实项目一定要做这个选择，先弄清朝向比记住 API 更重要。",
      explain: [
        "**API 层**：自己写 Route Handler（`app/api/xxx/route.ts`），前端 fetch。优点是与前端解耦、便于对外复用；缺点是多一层维护，且服务端组件本就跑在服务端，再绕一圈 HTTP 往往没必要。",
        "**ORM**：Prisma、Drizzle 这类工具把表映射成对象，写 `db.invoice.findMany()` 而不用手写 SQL，类型安全、可迁移数据库；代价是多一层抽象与学习成本，复杂查询反而更难表达。",
        "**直接 SQL**：课程选这条 —— 用轻量的 `postgres.js` 直接写 SQL。理由是**看得见本质**（你能确切知道发了什么查询）、依赖少、性能可控，也便于理解连接池与类型映射这些真实概念。",
      ],
      check: "能用一两句话说出三种方式各自的取舍，并说明课程为什么选直接 SQL。",
    },
    {
      title: "认识 app/lib/data.ts 与那个 sql 变量",
      why: "整个课程的数据访问都集中在这一个文件里（这就是「数据访问层」），看懂它，后面每一步取数都有据可依。",
      explain: [
        "打开 `app/lib/data.ts`，顶部大致是这样：`import postgres from 'postgres'`，然后 `const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })`（本项目里就是官方完整版）。它创建一个**连接池**，后续所有查询共用它，避免每次查询都重新建立连接。",
        "`sql` 依赖 Node 环境与密钥（`POSTGRES_URL`），所以**只能在服务端运行**。**Server Component 默认就在服务端**，因此你可以放心地在组件里 `import` 这些函数、直接读写数据库，而不需要先做一个 API 路由 —— 这是 App Router 一个很大的便利。",
        "课程把所有查询函数（`fetchRevenue`、`fetchLatestInvoices`、`fetchCardData`、`fetchFilteredInvoices`、`fetchInvoicesPages`、`fetchInvoiceById`、`fetchCustomers`……）都放在 `data.ts`。这种「对外只暴露函数的数据库层」叫 **DAL（Data Access Layer）**，好处是查询逻辑集中、便于复用与替换。",
      ],
      code:
        "// app/lib/data.ts（顶部，本项目已有）\nimport postgres from 'postgres';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });",
      check: "能说出「为什么不建 API 路由也能取数」，以及 `sql` 为什么不能出现在客户端组件里。",
    },
    {
      title: "在 async 服务端组件里取数（RevenueChart）",
      why: "这是本章的核心动作：页面变成 `async` 函数，`await` 数据，再把结果作为 props 传下去。",
      explain: [
        "在 `app/dashboard/page.tsx` 里把组件写成 `export default async function Page()`，然后 `const revenue = await fetchRevenue();`，再把数据传给 `<RevenueChart revenue={revenue} />`。服务端组件可以是 `async` 的，这是它相对客户端组件的关键能力。",
        "同时按文档**取消注释** `app/ui/dashboard/revenue-chart.tsx` 里的相关代码（课程刻意把一部分渲染代码注释掉了，让你亲手打开），保存后 `/dashboard` 上就会出现图表。",
        "关于 `async/await` 有一个常见误解值得现在就讲清：**在同一个函数里写多个 `await` 是串行执行的** —— 第二个查询要等第一个返回才开始，总耗时是两者之和。`async/await` 只是「顺序代码的语法糖」，它本身**不提供并发**。要并发必须显式使用 `Promise.all`（本章最后一个知识点会用到）。",
      ],
      code:
        "// app/dashboard/page.tsx\nexport default async function Page() {\n  const revenue = await fetchRevenue();\n\n  return (\n    <main>\n      <h1 className=\"mb-4 text-xl md:text-2xl\">Dashboard</h1>\n      <div className=\"grid gap-6 sm:grid-cols-2 lg:grid-cols-4\">\n        {/* 卡片…… */}\n      </div>\n      <div className=\"mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8\">\n        <RevenueChart revenue={revenue} />\n      </div>\n    </main>\n  );\n}",
      check: "`/dashboard` 上出现收入图表；想清楚「取消注释」的代码做了什么，而不是只是让它显示出来。",
      pitfalls: [
        "忘记把页面写成 `async`，`await` 会直接报语法错误。",
        "组件里传入的数据类型与 `definitions.ts` 不匹配时，编辑器会报红 —— 这正是在帮你避免运行时错误。",
      ],
    },
    {
      title: "为 LatestInvoices 取数",
      why: "重复一遍「取数 → 传 props → 渲染」的流程，把模式固定下来。",
      explain: [
        "同样在页面里 `const latestInvoices = await fetchLatestInvoices();`，传给 `<LatestInvoices latestInvoices={latestInvoices} />`，并取消注释 `app/ui/dashboard/latest-invoices.tsx` 里的渲染代码。",
        "这个查询只用 `ORDER BY date DESC LIMIT 5` 取**最近 5 条**发票，并 JOIN 客户表拿到姓名与头像。这类「只取需要的数据」的习惯很重要 —— 不要在页面里把全表查出来再 `slice`。",
        "注意组件里金额的处理：数据库返回的是 `number`，显示前用 `formatCurrency`（在 `app/lib/utils.ts` 里）格式化成货币字符串。",
      ],
      check: "`/dashboard` 右侧出现最近 5 条发票，带客户头像、邮箱与格式化后的金额。",
    },
    {
      title: "练习：给四张卡片取数（默认并发？不，是 Promise.all）",
      why: "卡片要显示多个统计值，这是你第一次需要「一个函数里查多次」的场景。",
      explain: [
        "用 `fetchCardData()` 取数据，它返回四个值：发票总数、客户总数、待付款金额、已付款金额。在页面里解构出来，再分别传给四个 `<Card>`。",
        "打开 `fetchCardData` 看实现：它内部用了 **`Promise.all`** 并发执行三条查询 —— 三个查询同时发出，总耗时约等于最慢的那一条，而不是三条之和。对比一下前面串行的写法，差别就出来了。",
        "顺便留意 `count` 的坑：SQL 里的 `COUNT(*)` 返回的是**字符串**（因为 bigint 可能超出 JS 安全整数范围），所以代码里用 `Number(...)` 转换，金额则用 `formatCurrency` 转成字符串。",
      ],
      code:
        "// app/lib/data.ts（看它怎么并发）\nconst [invoiceCount, customerCount, invoiceStatus] = await Promise.all([\n  sql`SELECT COUNT(*) FROM invoices`,\n  sql`SELECT COUNT(*) FROM customers`,\n  sql`SELECT status, SUM(amount) FROM invoices GROUP BY status`,\n]);",
      check: "四张卡片都显示出真实的数字与金额；能指出 `Promise.all` 相比逐个 `await` 快在哪里。",
    },
    {
      title: "请求瀑布：为什么页面会被最慢的请求拖住",
      why: "这是本章真正想让你记住的性能陷阱，第 9 章的流式渲染就是在解决它。",
      explain: [
        "现在 `app/dashboard/page.tsx` 里是三个连续的 `await`（收入、最新发票、卡片数据）。它们**一个接一个**执行，形成一条链：每一步都要等上一步完成。这种模式叫 **request waterfall（请求瀑布）**，总耗时是各请求耗时**之和**。",
        "更糟的是，整页渲染要等**所有**数据都到齐才输出 HTML，所以只要有一个请求慢，整页就慢 —— 用户面对的是一段白屏，而不是「先看到一部分」。",
        "第 9 章会用两个手段解决它：**把取数下移到真正需要它的组件里，并用 `<Suspense>` 包起来**（让快的部分先显示），以及理解「能并发就并发」的原则。现在你要做的是先**亲眼看到并承认**这个问题。",
      ],
      check: "能在纸上画出现有页面三个 `await` 的时序图，并说出总耗时为什么是三者之和。",
    },
  ],
  tips: [
    "取数函数统一放在 `app/lib/data.ts`，不要在组件里临时写 SQL —— 保持 DAL 的单一出口，后面换数据库或加缓存都容易得多。",
    "凡是直接用数据库的函数，都只能被服务端组件或 Server Action 调用；客户端组件要走 props 传值。",
    "本章结束时页面上应该能看到：四张卡片 + 收入图表 + 最新发票列表，全部来自真实数据库。",
  ],
};
