import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

/**
 * 「这些文件在本项目里存在吗？」——文件跳转的辅助接口。
 *
 * 讲解里有一部分路径是**用户还没有创建的文件**（例如第 4 章才建的
 * `app/dashboard/page.tsx`）。如果直接把它交给编辑器去打开，编辑器会弹
 * 「文件不存在」。所以页面先来这里批量问一次，把「还没创建」的路径标出来。
 *
 * 只接受**项目根目录内**的相对路径；越界（`..`、绝对路径指向项目外）一律当作不存在。
 */

export const dynamic = "force-dynamic";

const MAX_PATHS = 300;

export async function POST(request: Request) {
  const root = process.cwd();

  let paths: string[] = [];
  try {
    const body = (await request.json()) as { paths?: unknown };
    if (Array.isArray(body.paths)) {
      paths = body.paths.filter((p): p is string => typeof p === "string");
    }
  } catch {
    /* 请求体不是 JSON —— 下面返回空结果 */
  }

  const exists: Record<string, boolean> = {};

  for (const raw of paths.slice(0, MAX_PATHS)) {
    const rel = raw.trim().replace(/^@\//, "").replace(/^\.?\//, "");
    if (!rel) {
      exists[raw] = false;
      continue;
    }
    try {
      const abs = isAbsolute(rel) ? resolve(rel) : resolve(root, rel);
      const inside = !relative(root, abs).startsWith("..");
      exists[raw] = inside && existsSync(abs);
    } catch {
      exists[raw] = false;
    }
  }

  return NextResponse.json({ root, exists });
}
