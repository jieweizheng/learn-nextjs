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

### 6. 分组卡片

用 `<CardWrapper />` 包裹四张卡片、用 `<CardsSkeleton />` 做 fallback，让卡片**同时**出现，避免逐张闪现。

## 💡 提示 / 易错点

- 通用建议：把取数下移到真正需要它的组件，再用 `<Suspense>` 包裹它。
- Suspense 边界放哪里没有标准答案：整页 / 逐组件 / 按区块（分段错落）各有取舍。

## ✅ 完成标准

- [ ] `loading.tsx` 配合路由组只作用于概览页
- [ ] `<RevenueChart>` 与 `<LatestInvoices>` 各自独立流式加载
- [ ] 四张卡片用 `CardWrapper` 同时出现
- [ ] 能解释「流式渲染」如何改善体验

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 引导你思考「Suspense 边界应该放在哪」，而不是直接给答案。
