import { NextResponse } from "next/server";
import { detectEditorEnv } from "@/lib/detect-editor";

/**
 * 工作台内部接口（不是课程内容）：返回本机探测到的编辑器与项目根目录，
 * 供章节页/主页把文件路径渲染成可点击链接。
 *
 * 因为是「按当前机器实时探测」，必须动态执行，不能静态化。
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await detectEditorEnv();
  return NextResponse.json(data, {
    headers: {
      // 结果可能随本机环境变化，不要让浏览器/代理缓存
      "cache-control": "no-store",
    },
  });
}
