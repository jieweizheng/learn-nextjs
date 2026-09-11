# 第 4 章 · 创建布局与页面

> 英文标题：Creating Layouts and Pages
> 官方文档：https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages
> 本章目录：`chapters/04-creating-layouts-and-pages/`
> 📚 **知识点与详细讲解**：`lib/chapters/04-creating-layouts-and-pages.ts`（章节页 `/chapters/creating-layouts-and-pages` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用「文件夹即路由」的方式创建 dashboard 页面，并做一个可共享的嵌套布局。

## 🎯 学习目标

- 理解文件系统路由：文件夹 = 路由段
- 创建 `page.tsx` 建立可访问路由
- 用 `layout.tsx` 在多个页面间共享 UI
- 理解根布局（root layout）与部分渲染（partial rendering）

## 📋 步骤清单

### 1. 创建 dashboard 页面

在 `app/` 下新建 `dashboard` 文件夹，再在里面新建 `page.tsx`：

**要建的路径是 `app/dashboard/page.tsx`** —— 中间没有 `ui` 那一层。
（`app/ui/` 是**组件**目录，`app/ui/dashboard/sidenav.tsx`、`app/ui/dashboard/cards.tsx` 这些放那儿。）

```tsx
export default function Page() {
  return <p>Dashboard Page</p>;
}
```

访问 http://localhost:3000/dashboard 查看。
（顺带记住已有的映射：`app/page.tsx` 对应根路径 `/`。）

### 2. 练习：再建两个页面

分别创建：

- `app/dashboard/customers/page.tsx` → 返回 `<p>Customers Page</p>`
- `app/dashboard/invoices/page.tsx` → 返回 `<p>Invoices Page</p>`

做完之后，目录与路由的对应关系：

```
app/
  dashboard/
    customers/page.tsx  →  /dashboard/customers
    invoices/page.tsx   →  /dashboard/invoices
    page.tsx            →  /dashboard
```

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

要点：`children` 可能是**一个页面**，也可能是**更深一层的布局**；**凡是布局里 import 的组件都会成为这个布局的一部分**，
所以 `<SideNav />` 会对 `/dashboard/*` 下所有页面生效。

### 4. 理解根布局

`app/layout.tsx` 是**根布局**（root layout）：**必需**、作用于全站，`<html>` / `<body>` 只能在这里改，
字体（`inter`）、全局样式（`app/globals.css`）与 metadata 也都挂在它身上。
它和 dashboard 布局是嵌套关系：根布局 → `app/dashboard/layout.tsx` → `/dashboard/*` 的页面。
官方文档特别说明：新布局只服务于 dashboard，**根布局不用为它加任何 UI**。
本项目这个文件已经写好，你只需理解，不用改。
（注意官方示例里导入的是 app/ui/global.css，本项目没有该文件，对应物是 `app/globals.css`。）

### 5. 部分渲染

导航到同一布局下的另一个页面时，**只有页面部分重新渲染，布局不动** —— 这叫 **partial rendering（部分渲染）**，
它能保留布局里的客户端状态（滚动位置、输入内容等）。这也是第 5 章 `<Link>` 价值的铺垫。

## 💡 提示 / 易错点

- `page.tsx` 是让路由「可访问」的必需文件；`layout.tsx` 是可选的共享外壳。
- `/app/ui`、`/app/lib` 是你**主动放**在 app 里的普通文件夹，不会变成路由——这叫 colocation。
- 侧边栏顶部 Acme logo 指向 `/`：官方课程里 `/` 是 starter 落地页，本项目里 `/` 是**工作台清单主页**，点它会回到章节清单，属正常。
- 侧边栏三个链接（`app/ui/dashboard/nav-links.tsx`）正好对应本章的三个路由，现在用的是原生 `<a>`，第 5 章会换成 `<Link>`。

## ✅ 完成标准

- [ ] `/dashboard`、`/dashboard/customers`、`/dashboard/invoices` 都能访问
- [ ] 三个页面共享同一个侧边栏布局
- [ ] 能说出根布局与 dashboard 布局的区别（谁必需、作用范围、能否改 `<html>`/`<body>`）
- [ ] 能解释「文件系统路由」和「部分渲染」

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 先讲清「文件夹→URL 段」的映射关系，再自己动手。
