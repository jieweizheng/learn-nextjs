# 第 8 章 · 静态与动态渲染

> 英文标题：Static and Dynamic Rendering
> 官方文档：https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering
> 本章目录：`chapters/08-static-and-dynamic-rendering/`

理解静态渲染与动态渲染的差异，并亲眼看到慢请求如何拖慢整页。

## 🎯 学习目标

- 区分静态渲染与动态渲染
- 知道各自的适用场景
- 模拟慢数据请求并观察影响

## 📋 步骤清单

### 1. 模拟慢请求

在 `app/lib/data.ts` 的 `fetchRevenue()` 里取消注释 `console.log` 与 3 秒的 `setTimeout`：

```ts
export async function fetchRevenue() {
  try {
    // 仅为演示：故意延迟 3 秒，生产环境不要这样写
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}
```

### 2. 观察阻塞

刷新 http://localhost:3000/dashboard ：整页会卡约 3 秒才显示，终端会打印两行日志。
这说明在动态渲染下，**页面只和「最慢的那一次数据请求」一样快**。

## 💡 提示 / 易错点

- 不要在生产环境真的 `setTimeout`，这里只是演示。
- 静态渲染：构建时（或重新验证时）生成，缓存后全局分发，适合**不依赖用户、变化少**的内容。
- 动态渲染：每次请求时生成，适合**实时更新、个性化**的内容，但也会受最慢请求拖累。
- 这段演示代码先留着，第 9 章会用流式渲染来优化用户体验。

## ✅ 完成标准

- [ ] 亲眼看到整页被一个慢请求阻塞
- [ ] 能举例说明哪些页面适合静态渲染、哪些适合动态渲染

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 可以让 Agent 用「餐厅点餐」之类的比喻解释静态 vs 动态渲染。
