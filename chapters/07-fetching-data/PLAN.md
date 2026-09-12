# 第 7 章 · 获取数据

> 英文标题：Fetching Data
> 官方文档：https://nextjs.org/learn/dashboard-app/fetching-data
> 本章目录：`chapters/07-fetching-data/`
> 📚 **知识点与详细讲解**：`lib/chapters/07-fetching-data.ts`（章节页 `/chapters/fetching-data` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

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

```tsx
// app/dashboard/page.tsx
import { fetchRevenue } from '@/app/lib/data';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';

export default async function Page() {
  const revenue = await fetchRevenue();

  return (
    <main>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
      </div>
    </main>
  );
}
```

`RevenueChart` 是**默认导出**（`import RevenueChart from ...`），`Card` 才是具名导出，别写反。

> 弱提示：starter 之所以把渲染代码注释掉，是因为前几章还没有 `fetchRevenue()` ——
> 那时打开会渲染出空图表区甚至报错，干扰第 4–6 章的学习，所以留到本章才让你亲手打开。

### 3. 为 LatestInvoices 取数

还是改 `app/dashboard/page.tsx`，在上一版基础上**加三处**：

```tsx
// ① 顶部补两条 import（LatestInvoices 同样是默认导出）
import { fetchRevenue, fetchLatestInvoices } from '@/app/lib/data';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';

export default async function Page() {
  const revenue = await fetchRevenue();
  // ② 加这一行查询
  const latestInvoices = await fetchLatestInvoices();

  return (
    <main>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
        {/* ③ 加这一段 */}
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
```

再取消注释 `app/ui/dashboard/latest-invoices.tsx` 内部代码，只显示最近 5 条发票。

### 4. 练习：为 Card 取数

用 `fetchCardData()`（返回发票 / 客户数量与金额）给四个 `<Card>` 取数并解构使用。
**这一步做完，三块数据就齐了**，`app/dashboard/page.tsx` 的完整样子如下：

```tsx
// app/dashboard/page.tsx —— 这一步结束后的完整页面
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from '@/app/lib/data';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { Card } from '@/app/ui/dashboard/cards'; // Card 是具名导出

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card title="Total Customers" value={numberOfCustomers} type="customers" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
```

> 弱提示：`fetchCardData` 内部用了 `Promise.all` 并发三条 SQL，但**它整体仍是页面里的第三个 `await`**。

### 5. 请求瀑布：先认出这个问题（不用改代码）

上面那个页面里三个 `await` 是**串行**的：每个都要等上一个完成，总耗时是三者之和；
而且整页要等所有数据到齐才输出 HTML。这叫 **request waterfall（请求瀑布）**。

本章不用修它 —— 第 9 章会用「取数下移到组件 + `<Suspense>`」来解决。
现在只要求你能指出：当前页面的耗时 = ① + ② + ③，而不是三者里最慢的那个。

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
