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

在页面组件接收 `searchParams`（注意是 `Promise`，需要 `await`），取出 `query` / `currentPage` 传给 `<Table/>`，并用 `<Suspense key={query + currentPage}>` 包裹（key 变化时重新触发加载态）。

### 6. 加上分页

用 `fetchInvoicesPages(query)` 得到 `totalPages` 传给 `<Pagination/>`；在分页组件里用 `usePathname` / `useSearchParams` 生成页码链接。

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
