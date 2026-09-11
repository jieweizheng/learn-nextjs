"use client";

import { useSyncExternalStore } from "react";
import type { EditorId } from "@/lib/editor-links";

export type EditorEnv = {
  editor: EditorId;
  label: string;
  root: string;
  source: string;
};

/**
 * 向本机接口要「用哪个编辑器 + 项目根目录」，所有文件链接共用这一份结果。
 *
 * 服务端渲染时返回 null（此时链接还没法拼绝对路径），
 * 页面 hydrate 后自动拉取，拉到的瞬间所有链接一起生效。
 */
let snapshot: EditorEnv | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function normalize(data: unknown): EditorEnv {
  const d = (data ?? {}) as Partial<EditorEnv>;
  return {
    editor: (d.editor as EditorId) ?? "none",
    label: typeof d.label === "string" ? d.label : "",
    root: typeof d.root === "string" ? d.root : "",
    source: typeof d.source === "string" ? d.source : "unknown",
  };
}

function load(): Promise<void> {
  if (!loading) {
    loading = fetch("/api/editor", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        snapshot = normalize(data);
      })
      .catch(() => {
        // 接口不可用（例如部署到线上）→ 退化为「点击复制路径」
        snapshot = {
          editor: "none",
          label: "",
          root: "",
          source: "unavailable",
        };
      })
      .then(() => {
        listeners.forEach((fn) => fn());
      });
  }
  return loading;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  void load();
  return () => {
    listeners.delete(callback);
  };
}

/** 数据没变时必须返回同一个引用，否则 useSyncExternalStore 会死循环 */
function getSnapshot(): EditorEnv | null {
  return snapshot;
}

function getServerSnapshot(): EditorEnv | null {
  return null;
}

export function useEditorEnv(): EditorEnv | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
