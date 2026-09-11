/**
 * 客户端批量查询「这些路径在本项目里到底存不存在」。
 *
 * 为什么需要：讲解里有些路径是**用户还没创建的文件**（第 4 章才建的
 * `app/dashboard/page.tsx`、第 6 章才建的 `.env` 等），直接点开编辑器会报
 * 「文件不存在」。所以先问一次服务端（见 `app/api/paths/route.ts`），
 * 还没创建的路径在界面上标成「待创建」，点击退化为「复制路径」。
 *
 * 实现：同一轮渲染里的多个请求**合并成一次 POST**（一个章节页只发一次网络请求），
 * 结果缓存在内存里，切章节来回看不会重复请求。
 */

const cache = new Map<string, boolean>();
const queue = new Set<string>();
const waiters = new Map<string, Array<(value: boolean) => void>>();
let scheduled = false;

/** 单次请求最多带多少条路径（避免 URL / 请求体过大） */
const CHUNK = 60;

function flush() {
  scheduled = false;
  const batch = Array.from(queue);
  queue.clear();
  if (!batch.length) return;
  for (let i = 0; i < batch.length; i += CHUNK) {
    void fetchBatch(batch.slice(i, i + CHUNK));
  }
}

async function fetchBatch(paths: string[]) {
  let map: Record<string, boolean> = {};

  try {
    const res = await fetch("/api/paths", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paths }),
    });
    if (res.ok) {
      const data = (await res.json()) as { exists?: Record<string, boolean> };
      map = data.exists ?? {};
    }
  } catch {
    /* 网络异常 —— 下面按「存在」处理，不破坏原有的跳转能力 */
  }

  for (const path of paths) {
    // 查不到结论时保守地当作「存在」：宁可让编辑器去试试，也不要误标成「待创建」
    const value = map[path] ?? true;
    cache.set(path, value);
    const list = waiters.get(path);
    waiters.delete(path);
    list?.forEach((resolve) => resolve(value));
  }
}

/** 该路径在本项目中是否存在。同批调用会自动合并成一次请求。 */
export function checkPathExists(path: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(true);

  const cached = cache.get(path);
  if (cached !== undefined) return Promise.resolve(cached);

  return new Promise<boolean>((resolve) => {
    const list = waiters.get(path);
    if (list) list.push(resolve);
    else waiters.set(path, [resolve]);

    queue.add(path);
    if (!scheduled) {
      scheduled = true;
      window.setTimeout(flush, 0);
    }
  });
}
