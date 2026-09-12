import type { Chapter } from "./types";

export const chapter16: Chapter = {
  num: 16,
  slug: "next-steps",
  title: "Next Steps",
  titleZh: "下一步",
  officialUrl: "https://nextjs.org/learn/dashboard-app/next-steps",
  summary:
    "课程收尾：把应用部署上线、回顾你已经掌握的能力，并规划接下来要深入的方向。",
  goals: [
    "会把应用部署上线并分享出去",
    "能用自己的话回顾整门课掌握的 Next.js 能力",
    "知道接下来该读哪些文档、看哪些模板、去哪里提问",
  ],
  points: [
    {
      title: "部署上线，让别人也能用",
      why: "从「本地跑起来」到「有地址、别人能打开」，才算真正交付。",
      explain: [
        "代码推到 GitHub 后，在 Vercel 新建项目导入该仓库即可；之后**每次 push 到 main 都会自动重新部署**。数据库连接串等敏感信息在 **Project Settings → Environment Variables** 配置，不要写进代码。",
        "部署前过三件事：",
        "- **环境变量齐全**（尤其 `POSTGRES_URL` 与 `AUTH_SECRET`）",
        "- **`npm run build` 本地能通过**（构建期报错在本地修最快）",
        "- **数据库允许来自 Vercel 的访问**（多数托管数据库默认允许）",
        "自己托管可以用 `next build` + `next start`（标准 Node 部署）或 Docker 方案。课程默认走 Vercel，但 Next.js 并不绑定 Vercel。",
      ],
      check: "拿到一个可公开访问的域名，用手机打开也能正常登录并使用。",
      pitfalls: [
        "生产环境忘记配 `AUTH_SECRET`：本地正常、线上登录异常。",
        "把 `.env` 提交到仓库：立刻删除并**轮换数据库密码**。",
      ],
    },
    {
      title: "回顾：这门课你到底学会了什么",
      why: "把零散操作抽象成能力清单，才知道自己「会了什么」。",
      explain: [
        "- **路由与布局**：文件夹即路由、动态路由 `[id]`、路由组 `(overview)`、嵌套布局与部分渲染",
        "- **数据**：在 Server Component 里直连数据库、DAL 组织查询、请求瀑布与 `Promise.all` 并发",
        "- **渲染与体验**：静态 / 动态渲染、`loading.tsx` 与 `<Suspense>` 流式渲染、骨架屏",
        "- **交互与写入**：URL 参数做搜索与分页、防抖、Server Actions、`revalidatePath`、`redirect`、`bind` 传参",
        "- **健壮性与工程**：`try/catch` 与 `error.tsx`、`notFound()` 与 404 页面、zod 校验、`useActionState`、无障碍（ARIA）",
        "- **身份与元数据**：NextAuth 凭据登录、Proxy / middleware 保护路由、Metadata API 与文件式元数据",
        "如果这些条目你能**各说出一个自己踩过的坑**，说明真做过了 —— 比「看过一遍」有价值得多。",
      ],
      check: "合上文档，能对朋友用五分钟讲清「这个 dashboard 是怎么跑起来的」。",
    },
    {
      title: "继续深入：值得接着读的文档与方向",
      why: "课程只是骨架，真正的 Next.js 还有很多机制值得按兴趣深入。",
      explain: [
        "- **缓存与重验证**：`revalidatePath` / `revalidateTag`、`fetch` 缓存选项、`use cache` —— App Router 最容易混淆、也最影响性能的一块",
        "- **路由进阶**：并行路由、拦截路由（做模态框 URL）、Route Handlers、`generateStaticParams`",
        "- **表单与数据**：Server Actions 的安全与校验、乐观更新（`useOptimistic`）、`useTransition`",
        "- **工程质量**：`next/image` 进阶配置、测试（Vitest / Playwright）、监控与错误上报",
        "- **动手做**：官方模板市场（Admin Dashboard、Commerce、Blog Starter）挑一个改造成自己的项目",
      ],
      check: "选一个方向写下「我要做的一个小功能」，并列出实现它需要先学哪两个概念。",
    },
    {
      title: "分享与持续练习",
      why: "学习闭环的最后一环是「输出」。",
      explain: [
        "把作品分享出去：发链接给朋友、写复盘（哪里卡住、怎么解决）、或在社区提问与回答。**讲给别人听**是检验理解最快的方式。",
        "接下来最有效的练习是「**做一个自己的小项目**」：记账、读书清单、订阅管理。你会立刻遇到课程没覆盖的问题（权限、软删除、导出、搜索优化），这才是真正长本事的地方。",
        "遇到问题时：先看官方文档对应章节，再把**完整报错 + 相关代码 + 已试过什么**一起拿去提问。",
      ],
      check: "你已经分享过一次（链接或复盘），并且开始了自己的下一个项目。",
    },
  ],
  tips: [
    "🎉 16 章走完，你已经完整做过一个带数据库、认证、流式渲染与表单校验的 Next.js 应用。",
    "本工作台每一章清单都可回头再打勾、再复习；`app/playground/` 里的实验也值得留着。",
    "想继续练手时，回到任意一章，让 Agent 按该章知识点清单带你重做一遍（这次不要看答案）。",
  ],
};
