# 第 4 章 · 创建布局与页面

> 英文标题：Creating Layouts and Pages
> 官方文档：https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages
> 本章目录：`chapters/04-creating-layouts-and-pages/`

用「文件夹即路由」的方式创建 dashboard 页面，并做一个可共享的嵌套布局。

## 🎯 学习目标

- 理解文件系统路由：文件夹 = 路由段
- 创建 `page.tsx` 建立可访问路由
- 用 `layout.tsx` 在多个页面间共享 UI
- 理解根布局（root layout）与部分渲染（partial rendering）

## 📋 步骤清单

### 1. 创建 dashboard 页面

新建 `app/dashboard/page.tsx`：

```tsx
export default function Page() {
  return <p>Dashboard Page</p>;
}
```

访问 http://localhost:3000/dashboard 查看。

### 2. 练习：再建两个页面

分别创建：

- `app/dashboard/customers/page.tsx` → 返回 `<p>Customers Page</p>`
- `app/dashboard/invoices/page.tsx` → 返回 `<p>Invoices Page</p>`

### 3. 创建 dashboard 布局

新建 `app/dashboard/layout.tsx`，引入 `<SideNav />` 并渲染 `{children}`：

```tsx
import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
```

### 4. 理解根布局

回顾 `app/layout.tsx`：它是必需的根布局，作用于全站。导航时布局不会重新渲染，只更新变化的部分，这叫**部分渲染**，能保留布局里的客户端状态。

## 💡 提示 / 易错点

- `page.tsx` 是让路由「可访问」的必需文件；`layout.tsx` 是可选的共享外壳。
- `/app/ui`、`/app/lib` 是你**主动放**在 app 里的普通文件夹，不会变成路由——这叫 colocation。

## ✅ 完成标准

- [ ] `/dashboard`、`/dashboard/customers`、`/dashboard/invoices` 都能访问
- [ ] 三个页面共享同一个侧边栏布局
- [ ] 能解释「文件系统路由」和「部分渲染」

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 先讲清「文件夹→URL 段」的映射关系，再自己动手。
