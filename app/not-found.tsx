import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">
        找不到这个章节
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        可能是因为链接拼写有误，回到清单重新选择一章吧。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        返回章节清单
      </Link>
    </main>
  );
}
