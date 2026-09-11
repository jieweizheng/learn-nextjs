# 第 5 章 · 页面间导航

> 英文标题：Navigating Between Pages
> 官方文档：https://nextjs.org/learn/dashboard-app/navigating-between-pages
> 本章目录：`chapters/05-navigating-between-pages/`
> 📚 **知识点与详细讲解**：`lib/chapters/05-navigating-between-pages.ts`（章节页 `/chapters/navigating-between-pages` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 `next/link` 做客户端导航，并用 `usePathname` 高亮当前页。

## 🎯 学习目标

- 用 `<Link>` 替代 `<a>` 实现客户端导航
- 理解代码分割（code splitting）与预取（prefetching）
- 用 `usePathname` + `clsx` 高亮活动链接

## 📋 步骤清单

### 1. 换成 Link 组件

打开 `app/ui/dashboard/nav-links.tsx`，引入 `next/link`，把 `<a>` 换成 `<Link>`：

```tsx
import Link from 'next/link';
// ...
<Link key={link.name} href={link.href} className="...">
  <LinkIcon className="w-6" />
  <p className="hidden md:block">{link.name}</p>
</Link>
```

保存后点击侧边栏，页面不再整页刷新。

### 2. 高亮当前链接

在文件**顶部**加 `'use client'`（因为要用 Hook），引入 `usePathname()`，并用 `clsx` 在 `pathname === link.href` 时应用高亮类名：

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx('...基础类名...', {
              'bg-sky-100 text-blue-600': pathname === link.href,
            })}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
```

保存后当前页面链接会以蓝色高亮。

## 💡 提示 / 易错点

- 生产环境里，`<Link>` 进入视口时会**自动预取**目标路由的代码，点击时几乎瞬时切换。
- `nav-links.tsx` 不是特殊文件，名字可以随便改，但改完记得同步 import。

## ✅ 完成标准

- [ ] 侧边栏用 `<Link>`，导航不再整页刷新
- [ ] 当前页链接有高亮样式
- [ ] 能说清「客户端导航」和「预取」的好处

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 可以让 Agent 解释「为什么用了 Hook 就要加 `'use client'`」。
