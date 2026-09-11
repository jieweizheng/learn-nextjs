# 第 7 章 · 获取数据

> 英文标题：Fetching Data
> 官方文档：https://nextjs.org/learn/dashboard-app/fetching-data
> 本章目录：`chapters/07-fetching-data/`

在 Server Component 里直接用 SQL 查询数据库，为 dashboard 首页取数，并认识请求瀑布。

## 🎯 学习目标

- 了解几种数据获取方式（API / ORM / SQL）
- 用 `postgres.js` 在服务端直连数据库
- 在 `async` Server Component 中取数
- 识别并理解「请求瀑布（request waterfall）」

## 📋 步骤清单

### 1. 认识 data.ts

查看 `app/lib/data.ts`：它用 `postgres` 连接数据库。`sql` **只能在服务端调用**，本课程所有查询都集中在这个文件里，方便组件按需 import。

### 2. 为 RevenueChart 取数

在 `app/dashboard/page.tsx` 引入并 `await`：`const revenue = await fetchRevenue();`
然后取消注释 `<RevenueChart revenue={revenue} />` 以及组件 `app/ui/dashboard/revenue-chart.tsx` 内部代码，你会看到图表。

### 3. 为 LatestInvoices 取数

再 `await fetchLatestInvoices()`，取消注释 `<LatestInvoices latestInvoices={latestInvoices} />` 及其内部代码，只显示最近 5 条发票。

### 4. 练习：为 Card 取数

用 `fetchCardData()`（返回发票 / 客户数量与金额）给四个 `<Card>` 取数并解构使用：

```tsx
const {
  numberOfInvoices,
  numberOfCustomers,
  totalPaidInvoices,
  totalPendingInvoices,
} = await fetchCardData();
```

## 💡 提示 / 易错点

- 优先用 SQL 只取需要的数据，而不是把全部数据拉到内存再 `filter` / `sort`。
- 当前多个 `await` 是**串行**执行的，会形成「请求瀑布」，导致总耗时累加；第 9 章会用并行与 Suspense 优化。

## ✅ 完成标准

- [ ] 概览页显示图表、最近 5 条发票与 4 张卡片
- [ ] 能解释「为什么在服务端直连数据库更安全」
- [ ] 能指出当前代码里的「请求瀑布」

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 引导你「在哪里取数、把哪个变量传给了哪个组件」，而不是直接贴最终代码。
