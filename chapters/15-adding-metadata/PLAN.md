# 第 15 章 · 添加元数据

> 英文标题：Adding Metadata
> 官方文档：https://nextjs.org/learn/dashboard-app/adding-metadata
> 本章目录：`chapters/15-adding-metadata/`
> 📚 **知识点与详细讲解**：`lib/chapters/15-adding-metadata.ts`（章节页 `/chapters/adding-metadata` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 Metadata API 配置标题、描述、Open Graph 与 favicon，优化 SEO 与分享效果。

## 🎯 学习目标

- 了解常见的元数据类型（title / description / keywords / Open Graph / favicon）
- 使用静态 `metadata` 对象与 `title.template`
- 使用文件约定（`icon` / `opengraph-image`）
- 给各个页面设置标题

## 📋 步骤清单

### 1. 文件式元数据

把 `public` 下的 `favicon.ico` 与 `opengraph-image.jpg` **移动**到 `app/` 根目录，Next.js 会自动识别并注入到 `<head>`。

### 2. 配置根元数据

在 `app/layout.tsx` 导出 `metadata` 对象：

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};
```

`%s` 会被具体页面标题替换。

### 3. 页面级标题

给某个页面导出 `metadata.title`：

```tsx
export const metadata: Metadata = { title: 'Invoices' };
```

验证 `/dashboard/invoices` 的标题变成 `Invoices | Acme Dashboard`。

### 4. 练习

给这些页面各补一个标题：`/login`、`/dashboard`、`/dashboard/customers`、`invoices/create`、`[id]/edit`。

## 💡 提示 / 易错点

- 子页面的 `metadata` 会**覆盖**父级同名字段。
- 用 `title.template` 可以避免在每个页面重复写应用名。
- 元数据分两种方式：**基于配置**（导出对象 / `generateMetadata`）与**基于文件**（`favicon.ico`、`opengraph-image.jpg` 等）。

## ✅ 完成标准

- [ ] `favicon.ico` 与 `opengraph-image.jpg` 生效（在 `<head>` 里能看到）
- [ ] 根布局配置了 `title.template` 与 `description`
- [ ] 各页面标题符合 `页面名 | Acme Dashboard` 的格式

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 可以让 Agent 解释「元数据对 SEO 和社交分享分别有什么影响」。
