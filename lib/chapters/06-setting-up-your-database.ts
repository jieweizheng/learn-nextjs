import type { Chapter } from "./types";

export const chapter06: Chapter = {
  num: 6,
  slug: "setting-up-your-database",
  title: "Setting Up Your Database",
  titleZh: "搭建数据库",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/setting-up-your-database",
  summary:
    "把代码推到 GitHub、在 Vercel 上部署并创建 Postgres 数据库，把连接信息写进本地 `.env`，最后用 `/seed` 播种数据、用 `/query` 验证取数。",
  goals: [
    "会把项目推到 GitHub",
    "会用 Vercel 导入仓库并完成一次部署",
    "会创建 Postgres 数据库并把连接串写进本地环境变量",
    "会运行 `/seed` 播种数据，并用 `/query` 验证能查到数据",
  ],
  points: [
    {
      title: "把代码推到 GitHub",
      why: "Vercel 从 Git 仓库拉代码，先托管起来才有「推送即部署」。",
      explain: [
        "在 GitHub 新建空仓库（不要勾选初始化 README），关联本地仓库并推送。",
        "推送前确认 `.gitignore` 已忽略 `node_modules`、`.next`，以及**最重要的 `.env`** —— 连接串里带密码，绝不能进仓库。",
        "📌 本项目推的是**整个学习工作台仓库**（含清单主页与章节页），完全没问题，工作台会一起部署；`.env` 已被忽略，密钥不会泄露。",
      ],
      code:
        "git init\ngit add .\ngit commit -m \"Next.js learn dashboard\"\ngit branch -M main\ngit remote add origin https://github.com/<你的账号>/<仓库名>.git\ngit push -u origin main",
      check: "刷新 GitHub 仓库能看到代码；仓库里**搜不到** `.env` 文件。",
      pitfalls: [
        "若不小心提交过 `.env`：删除该文件、重新提交，并到数据库后台**轮换密码**。",
      ],
    },
    {
      title: "在 Vercel 上导入并部署",
      why: "Vercel 与 Next.js 集成最顺，还能免费拿到数据库与部署环境。",
      explain: [
        "- 用 GitHub 登录 `vercel.com`，选 Hobby（免费）计划",
        "- **Add New → Project**，导入刚才那个仓库",
        "- Vercel 自动识别 Next.js，构建配置不用改，直接 **Deploy**",
        "附带好处：之后每次 push 到 main 都会自动重新构建部署（CI/CD）。",
      ],
      check: "能打开 `xxx.vercel.app` 看到应用；Vercel 项目页显示最近一次部署成功。",
    },
    {
      title: "创建 Postgres 数据库并连接",
      why: "课程需要真实数据库来练查询与写入。",
      explain: [
        "- 项目页进 **Storage** → **Create Database** → 选 Postgres（Neon、Supabase 等提供方均可）",
        "- 创建后点 **Connect** 连到项目，会自动注入 `POSTGRES_URL`、`POSTGRES_PRISMA_URL`、`POSTGRES_URL_NON_POOLING` 等环境变量",
        "- 项目 **.env.local** 标签页点 **Show secret** 可看到值，复制下来下一步用",
        "`POSTGRES_URL` 是**连接池**地址（普通查询用它）；`POSTGRES_URL_NON_POOLING` 是直连（迁移、播种等一次性操作用它更稳）。",
      ],
      check: "Storage 里能看到刚建的数据库，项目环境变量里出现了 `POSTGRES_URL`。",
    },
    {
      title: "把连接信息写进本地 .env",
      why: "本地也要能连库；环境变量不进仓库，所以要手动写一份本地副本。",
      explain: [
        "把 `.env.example` 重命名为 `.env`，粘贴刚才从 Vercel 复制的内容。",
        "确认变量名与代码一致：`app/lib/data.ts` 读的是 `process.env.POSTGRES_URL`。",
        "两件容易忘的事：",
        "- 确认 `.env` 在 `.gitignore` 里",
        "- **重启开发服务器** —— 环境变量只在进程启动时读取",
      ],
      code:
        "# .env（示例，值来自 Vercel 的 .env.local 标签）\nPOSTGRES_URL=\"postgres://default:xxxx@xxxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require\"\nPOSTGRES_PRISMA_URL=\"...\"\nPOSTGRES_URL_NON_POOLING=\"...\"",
      check: "`git status` 里看不到 `.env`；重启 dev server 后不再报缺少环境变量。",
      pitfalls: [
        "忘记重启 dev server：改了 `.env` 但 `process.env.POSTGRES_URL` 仍是 undefined。",
        "把 `.env` 提交到 Git：密码泄露，需立刻轮换。",
      ],
    },
    {
      title: "运行 /seed 播种数据",
      why: "数据库是空的，先灌入假数据才能练查询。",
      explain: [
        "`app/seed/route.ts` 是 **Route Handler**，导出 `GET`，访问 `/seed` 就执行。它依次：",
        "- 创建 `uuid-ossp` 扩展",
        "- 建 `users` / `customers` / `invoices` / `revenue` 四张表",
        "- 把 `app/lib/placeholder-data.ts` 的数据插入（用户密码用 `bcrypt` 哈希）",
        "保持 dev server 运行，浏览器访问 `http://localhost:3000/seed`，看到 **`Database seeded successfully`** 即成功。",
        "它是一次性脚本：**重复访问会重复插入数据**，想重来先清表。",
      ],
      code: "// 保持开发服务器运行，然后在浏览器访问：\n// http://localhost:3000/seed\n//\n// 预期看到：Database seeded successfully",
      check: "页面显示 `Database seeded successfully`；数据库 Data 标签里 4 张表都有数据。",
      pitfalls: [
        "访问 `/seed` 报连接错误：检查 `.env` 是否正确、是否重启过 dev server。",
        "重复执行导致数据重复：先 TRUNCATE 清表再播种。",
      ],
    },
    {
      title: "用 /query 验证取数",
      why: "播种只说明「写」通了，还要验证「读」得出来。",
      explain: [
        "打开 `app/query/route.ts`，解开里面被注释的代码（同时删掉那句占位返回），保存后访问 `/query` —— 应得到一条金额 666 的发票 JSON。",
        "注意 `sql` 的用法：`await sql` + 模板字符串。它**只能在服务端执行**（读环境变量、开 TCP 连接），不能被 `'use client'` 组件引用。",
        "做完本章这个文件也可以删掉，它的使命只是验证连通性。",
      ],
      code:
        "// app/query/route.ts（解开注释后的样子）\nimport postgres from 'postgres';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });\n\nasync function listInvoices() {\n  const data = await sql`\n    SELECT invoices.amount, customers.name\n    FROM invoices\n    JOIN customers ON invoices.customer_id = customers.id\n    WHERE invoices.amount = 666;\n  `;\n  return data;\n}\n\nexport async function GET() {\n  try {\n    return Response.json(await listInvoices());\n  } catch (error) {\n    return Response.json({ error }, { status: 500 });\n  }\n}",
      check: "访问 `/query` 返回一条包含金额与客户名的 JSON；终端没有报错。",
    },
  ],
  tips: [
    "已有自己的 Postgres 可以跳过 Vercel 部署，直接把连接串写进 `.env`，但要保证 `app/lib/data.ts` 的查询与你的表结构一致。",
    "`.env.example` 是模板（可提交），`.env` 是真实密钥（必须忽略）。",
    "`/seed`、`/query` 是一次性工具，用完可删；但**表和数据要留着**，第 7 章起全靠它们。",
  ],
};
