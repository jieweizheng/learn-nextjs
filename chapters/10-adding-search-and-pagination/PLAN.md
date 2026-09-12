# 第 10 章 · 搜索与分页

> 英文标题：Adding Search and Pagination
> 官方文档：https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
> 本章目录：`chapters/10-adding-search-and-pagination/`
> 📚 **知识点与详细讲解**：`lib/chapters/10-adding-search-and-pagination.ts`（章节页 `/chapters/adding-search-and-pagination` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 URL 查询参数实现搜索与分页，掌握 `useSearchParams` / `usePathname` / `useRouter`。

## 🎯 学习目标

- 用 URL search params 管理搜索与分页状态
- 客户端用 `useSearchParams` 读取参数
- 服务端用 `searchParams` 属性读取参数
- 用防抖（debounce）优化输入体验

## 📋 步骤清单

### 1. 准备页面

把官方文档给出的**起始代码**粘贴进 `app/dashboard/invoices/page.tsx`，认识 `<Search/>`、`<Pagination/>`、`<Table/>` 三个组件。

### 2. 捕获输入

在 `app/ui/search.tsx` 写 `handleSearch(term)` 并给 `<input>` 加 `onChange`，先在浏览器控制台打印验证。

### 3. 写入 URL

用 `useSearchParams` 构造 `URLSearchParams`：`term` 有值时 `params.set('query', term)`，否则 `params.delete('query')`；再用 `useRouter().replace(\`${pathname}?${params.toString()}\`)` 更新 URL。

### 4. 同步输入框

给 `<input>` 加 `defaultValue={searchParams.get('query')?.toString()}`，刷新后输入框仍保留查询词。

### 5. 表格随查询更新

起始骨架（第 1 步）已经读到了 `searchParams` 里的 `query` / `currentPage` 并传给了 `<Table/>`——所以这一步**不用再取这两个值**。唯一要加的是：用 `<Suspense key={query + currentPage}>` 把 `<Table/>` 包起来。`key` 随查询词或页码变化 → React 当成新边界 → 重新显示加载态，否则切换时用户以为「点了没反应」。

### 6. 加上分页

**页面**：`const totalPages = await fetchInvoicesPages(query);`，把骨架里的 `<Pagination totalPages={1} />` 改成 `<Pagination totalPages={totalPages} />`。

**`app/ui/invoices/pagination.tsx`**（重点，容易卡）：starter 把主组件那段 JSX 注释掉了，且注释里用到的 `currentPage` / `createPageURL` / `allPages` **还没定义**，直接取消注释会全是 `undefined`。补法：
- 顶部导入 `usePathname, useSearchParams`（来自 `next/navigation`）
- 组件开头 `const pathname = usePathname(); const searchParams = useSearchParams(); const currentPage = Number(searchParams.get('page')) || 1;`（**`currentPage` 从 URL 读，不是 props**，所以页面不用传）
- 定义 `createPageURL`（复制现有参数、只改 `page`）
- 取消注释 `allPages` 那行与整段 `<div className='inline-flex'>…</div>` JSX

文件下方的 `PaginationNumber` / `PaginationArrow` 不用改；`generatePagination` 已在 `app/lib/utils.ts`。

### 7. 加防抖

安装并使用 `use-debounce` 的 `useDebouncedCallback` 包裹 `handleSearch`（约 300ms），避免每次按键都发请求。

```bash
npm install use-debounce
```

## 💡 提示 / 易错点

- 搜索状态放在 **URL** 而不是 React state：可分享、可刷新、可前进后退。
- 服务端组件用 `searchParams` 属性；客户端组件用 `useSearchParams()` Hook。
- `defaultValue` 对应非受控输入（值由浏览器管理），因为状态存在 URL 里。

## ✅ 完成标准

- [ ] 输入搜索词时 URL 的 `?query=` 会更新，表格结果随之变化
- [ ] 分页可用，翻页时 URL 的 `?page=` 会更新
- [ ] 输入有防抖，不会每次按键都请求

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 可以让 Agent 解释「为什么把状态放到 URL，而不是 useState」。
