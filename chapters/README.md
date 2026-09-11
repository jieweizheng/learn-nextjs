# 章节目录

每章一个目录，里面是一份 `PLAN.md`（学习计划）。Agent 会依据它带你逐步完成。

| # | 目录 | 说明 |
| --- | --- | --- |
| 1 | [01-getting-started](./01-getting-started/PLAN.md) | 快速上手 |
| 2 | [02-css-styling](./02-css-styling/PLAN.md) | CSS 样式 |
| 3 | [03-optimizing-fonts-images](./03-optimizing-fonts-images/PLAN.md) | 优化字体与图片 |
| 4 | [04-creating-layouts-and-pages](./04-creating-layouts-and-pages/PLAN.md) | 创建布局与页面 |
| 5 | [05-navigating-between-pages](./05-navigating-between-pages/PLAN.md) | 页面间导航 |
| 6 | [06-setting-up-your-database](./06-setting-up-your-database/PLAN.md) | 搭建数据库 |
| 7 | [07-fetching-data](./07-fetching-data/PLAN.md) | 获取数据 |
| 8 | [08-static-and-dynamic-rendering](./08-static-and-dynamic-rendering/PLAN.md) | 静态与动态渲染 |
| 9 | [09-streaming](./09-streaming/PLAN.md) | 流式渲染 |
| 10 | [10-adding-search-and-pagination](./10-adding-search-and-pagination/PLAN.md) | 搜索与分页 |
| 11 | [11-mutating-data](./11-mutating-data/PLAN.md) | 修改数据 |
| 12 | [12-error-handling](./12-error-handling/PLAN.md) | 错误处理 |
| 13 | [13-improving-accessibility](./13-improving-accessibility/PLAN.md) | 提升可访问性 |
| 14 | [14-adding-authentication](./14-adding-authentication/PLAN.md) | 添加身份认证 |
| 15 | [15-adding-metadata](./15-adding-metadata/PLAN.md) | 添加元数据 |
| 16 | [16-next-steps](./16-next-steps/PLAN.md) | 下一步 |

> 官方课程地址：https://nextjs.org/learn/dashboard-app

## 🧪 练习环境（重要）

**本项目 `learn-nextjs` 本身就是课程练习场**，不需要再建 `nextjs-dashboard`：

- ✅ **前置准备已经全部完成**：课程素材（`app/ui/**`、`app/lib/**`、`app/seed`、`app/query`、`public/*.png`、`.env.example`）
  与所需依赖（`clsx`、`@heroicons/react`、`postgres`、`bcrypt`、`@tailwindcss/forms`）都已就位，
  你只需 `npm install && npm run dev`。详情见 [01-getting-started/PLAN.md](./01-getting-started/PLAN.md)。
- **练习代码写在哪**：第 2–3 章的小实验放 `app/playground/`（自己新建）；
  第 4 章起按官方路径放 `app/dashboard/`。
- ⛔ **不要改工作台本体**：`app/page.tsx`（`/` 章节清单主页）、`app/chapters/[slug]/page.tsx`（章节详情页）、
  以及 `components/`、`lib/chapters/` —— 它们是你的学习导航与讲解内容，改坏了就找不着北了。
- **Tailwind 版本差异**：本项目是 **v4**（`app/globals.css` 里 `@import "tailwindcss";`），
  官方文档是 **v3**。工具类基本通用；课程 starter 自定义的 Vercel 蓝与骨架屏 `shimmer` 动画，
  已用 v4 的 `@theme` / `@keyframes` 等价写进 `app/globals.css`，文档里「改 `tailwind.config.ts`」的步骤在本项目请改那里。
- ⚠️ `app/lib/data.ts`（依赖 `postgres`）与 `app/seed/route.ts`（依赖 `bcrypt`）已在位、依赖已装，
  但**第 6 章配好数据库前不要访问 `/seed`**，会报数据库连接错误。
- 想额外练一遍 `create-next-app`，请在**本仓库外面**另建项目；主线仍在本仓库内推进。
