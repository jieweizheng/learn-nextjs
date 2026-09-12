# 第 9 章 · 流式渲染

> 英文标题：Streaming
> 官方文档：https://nextjs.org/learn/dashboard-app/streaming
> 本章目录：`chapters/09-streaming/`
> 📚 **知识点与详细讲解**：`lib/chapters/09-streaming.ts`（章节页 `/chapters/streaming` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 `loading.tsx` 与 `<Suspense>` 把页面拆成小块流式发送，配合骨架屏改善加载体验。

## 🎯 学习目标

- 理解流式渲染（streaming）的价值
- 用 `loading.tsx` 做整页级 loading
- 用 `<Suspense>` 做组件级流式
- 用路由组 `(overview)` 限定 `loading.tsx` 作用范围
- 使用骨架屏（skeleton）组件

## 📋 步骤清单

### 1. 整页 loading

新建 `app/dashboard/loading.tsx`：

```tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

刷新 dashboard：侧边栏立刻显示，内容稍后到达，且加载期间仍可切换页面（可中断导航）。

### 2. 换成骨架屏

把 `loading.tsx` 内容换成 `<DashboardSkeleton />`（来自 `app/ui/skeletons`）。

### 3. 用路由组限定范围

在 `app/dashboard` 下新建 `(overview)` 文件夹，把 `page.tsx` 与 `loading.tsx` 移进去。
这样 `loading.tsx` 只作用于概览页，而不会影响 `/invoices`、`/customers`。
（`(name)` 这样的文件夹名不会出现在 URL 里。）

### 4. 组件级流式

把 `fetchRevenue()` **下移**到 `<RevenueChart />` 组件内部，并用 `<Suspense>` 包裹它：

```tsx
<Suspense fallback={<RevenueChartSkeleton />}>
  <RevenueChart />
</Suspense>
```

页面其余部分会立即可见，只有图表区域先显示骨架屏。

### 5. 练习：流式 LatestInvoices

同样把 `fetchLatestInvoices` 下移到组件内，用 `<LatestInvoicesSkeleton />` 包裹。

### 6. 分组卡片：收口成一个 Suspense（页面顶层不再 await）

目前为止 `(overview)/page.tsx` 顶部还在 `await fetchCardData()`。App Router 里**页面顶层 await 会阻塞整个组件的输出**——里面就算包了 `<Suspense>`，也要等顶层 await 结束才发得出去，所以整页一直被它拖着。

这一步把 `fetchCardData()` **移进** `CardWrapper`（组件自己取数），页面顶层**不再 await**：外壳、图表、发票立刻发出，只有卡片这一组先显示 `CardsSkeleton`，回来再补。

⚠️ 关于 `Promise.all`：`fetchCardData` 内部用 `Promise.all` 把 4 个查询并行一次发出、一起返回，所以**四张卡片的数据注定同步到达**——不可能「逐张闪现」。这反而说明为什么该用「一个 Suspense 包四张卡」：它们本就是一组。

要**亲眼看到**这一步的效果：给 `fetchCardData` 临时加个人工延迟（和 `fetchRevenue` 的 3 秒一个套路，章节末尾删）。**加之前**整页被它拖住（连图表/发票都要等），**加之后**卡片有独立骨架、图表/发票照常流式。

⚠️ 关键坑：`app/ui/dashboard/cards.tsx` 的 `CardWrapper` 要启用——顶部有 `import { fetchCardData }`、函数里有 `await fetchCardData()`、4 张 `<Card>` 已取消注释。若没启用，先打开它（详细代码见 `lib/chapters/09-streaming.ts` 第 6 个知识点第一段），否则卡片区域空白。

启用后，页面里原来的 `fetchCardData()` 与四张 `<Card>` 整段删掉，换成 `<CardWrapper />`（代码见该知识点第二段）。

### 7. 生产环境看不到流式？—— 静态预渲染陷阱

`npm run dev` 能看到骨架屏流式，但 `npm run start`（生产构建）下可能所有卡片秒出、毫无 loading。

原因：Next 默认会**静态预渲染**能静态化的页面，判定标准是「是否用到动态 API」—— 用了 `cookies()`/`headers()` 才自动判定为动态；而本项目用 `postgres` 的 `sql` **裸查询**，框架不知道你连了数据库，页面又没碰动态 API，于是 `next build` 时把整页渲染一次、连同 `<Suspense>` 解析完的数据一起烤成静态 HTML。

后果：`start` 直接发这份静态文件 → 没有骨架、没有流式。dev 每次请求现渲染才有流式。

真实项目要「主动声明数据是动态的」：
- 用鉴权（页面里 `cookies()`）→ 整页自动动态（第 15 章加登录后即如此）
- 强制动态：页面顶部加 `export const dynamic = 'force-dynamic';`
- ISR 折中：`export const revalidate = 60;`
- fetch 取数：`fetch(url, { cache: 'no-store' })` 或 `noStore()`

详细讲解与自检见 `lib/chapters/09-streaming.ts` 第 7 个知识点。

## 💡 提示 / 易错点

- 通用建议：把取数下移到真正需要它的组件，再用 `<Suspense>` 包裹它。
- Suspense 边界放哪里没有标准答案：整页 / 逐组件 / 按区块（分段错落）各有取舍。

## ✅ 完成标准

- [ ] `loading.tsx` 配合路由组只作用于概览页
- [ ] `<RevenueChart>` 与 `<LatestInvoices>` 各自独立流式加载
- [ ] 四张卡片用 `CardWrapper` 收口成一个 Suspense，且页面顶层不再 `await` 取数
- [ ] 能解释「流式渲染」如何改善体验
- [ ] 理解为何 `npm run start` 看不到流式（静态预渲染），并知道如何声明「动态数据」

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 引导你思考「Suspense 边界应该放在哪」，而不是直接给答案。
