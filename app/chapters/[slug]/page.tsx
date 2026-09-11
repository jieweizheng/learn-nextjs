import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChapterSteps from "@/components/chapter-steps";
import InlineText from "@/components/inline-text";
import {
  chapterDataPath,
  chapterPlanPath,
  chapters,
  getChapter,
} from "@/lib/chapters";

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return { title: "章节不存在" };
  return {
    title: `第 ${chapter.num} 章 · ${chapter.titleZh}`,
    description: chapter.summary,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const pointCount = chapter.points.length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-slate-500 transition-colors hover:text-indigo-600"
      >
        ← 返回章节清单
      </Link>

      {/* 标题 */}
      <header className="mt-6">
        <p className="text-sm font-medium text-indigo-600">
          第 {chapter.num} 章 / {chapters.length} · {pointCount} 个知识点
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {chapter.titleZh}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          {chapter.title}
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {chapter.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={chapter.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            打开官方文档 ↗
          </a>
          <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            学习计划：{chapterPlanPath(chapter)}
          </span>
        </div>
      </header>

      {/* 学习目标 */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">🎯 学习目标</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {chapter.goals.map((g) => (
            <li key={g} className="flex gap-2">
              <span className="text-indigo-500">·</span>
              <span>
                <InlineText text={g} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 知识点地图 */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          🧭 本章知识点地图
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          点任意一项跳到对应讲解；每一项都能单独打勾。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {chapter.points.map((p, i) => (
            <a
              key={i}
              href={`#point-${i + 1}`}
              className="rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              {i + 1}. {p.title}
            </a>
          ))}
        </div>
      </section>

      {/* 引导说明 */}
      <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 text-sm text-indigo-900/80">
        <p>
          <b className="text-indigo-900">怎么用这一页：</b>
          下面的每一个<b>知识点</b>都已经写好了<b>具体讲解</b>（含示例代码、自检标准、常见坑），
          你可以直接自己读着做；也可以让 AI 助手
          <b>一次只讲一个知识点</b>，讲完由你自己动手，做完回头勾上。
          它只讲解与提示，<b>不会替你改代码，也不会替你运行命令</b>。
        </p>
        <p className="mt-2 text-xs text-indigo-900/60">
          讲解正文所在文件：{chapterDataPath(chapter)}
        </p>
      </section>

      {/* 知识点清单 */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          📋 知识点清单（{pointCount} 项）
        </h2>
        <ChapterSteps slug={chapter.slug} points={chapter.points} />
      </section>

      {/* 提示 */}
      {chapter.tips?.length ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            💡 提示 / 易错点
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
            {chapter.tips.map((t) => (
              <li key={t} className="flex gap-2">
                <span>·</span>
                <span>
                  <InlineText text={t} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 上一章 / 下一章 */}
      <nav className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 text-sm">
        {chapter.num > 1 ? (
          <Link
            href={`/chapters/${chapters[chapter.num - 2].slug}`}
            className="text-slate-500 transition-colors hover:text-indigo-600"
          >
            ← 第 {chapter.num - 1} 章 {chapters[chapter.num - 2].titleZh}
          </Link>
        ) : (
          <span />
        )}
        {chapter.num < chapters.length ? (
          <Link
            href={`/chapters/${chapters[chapter.num].slug}`}
            className="text-slate-500 transition-colors hover:text-indigo-600"
          >
            第 {chapter.num + 1} 章 {chapters[chapter.num].titleZh} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
