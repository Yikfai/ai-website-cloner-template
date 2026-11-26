"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import type { ResumeSummary } from "@/lib/resume/types";

function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ResumeList({ initialResumes }: { initialResumes: ResumeSummary[] }) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function createResume() {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "未命名简历" }),
      });
      if (!response.ok) {
        setError("新建失败，请稍后再试。");
        return;
      }
      const document = (await response.json()) as { id: string };
      router.push(`/resumes/${document.id}`);
    } catch {
      setError("新建失败，请确认本机服务仍在运行。");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setError("删除失败。");
        return;
      }
      setResumes((current) => current.filter((resume) => resume.id !== id));
      setPendingDelete(null);
      router.refresh();
    } catch {
      setError("删除失败，请确认本机服务仍在运行。");
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">本机简历</p>
          <h1 className="text-2xl font-semibold tracking-tight">简历列表</h1>
        </div>
        <Button type="button" onClick={() => void createResume()} disabled={creating}>
          {creating ? "正在新建…" : "新建简历"}
        </Button>
      </header>
      <p className="text-sm text-muted-foreground">
        内容写在这台电脑的 data/resumes 目录里，刷新后仍然在。这里没有账号，也没有云端同步。
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {resumes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">还没有简历</p>
          <p className="mt-2 text-sm text-muted-foreground">新建一份，从姓名和一段工作经历开始。</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {resumes.map((resume) => (
            <li key={resume.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <Link href={`/resumes/${resume.id}`} className="font-medium hover:underline">
                  {resume.title}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {resume.headline || "还没有标题"} · {resume.locale === "zh" ? "中文" : "English"} · 更新于{" "}
                  {formatUpdated(resume.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/resumes/${resume.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  编辑
                </Link>
                {pendingDelete === resume.id ? (
                  <>
                    <Button type="button" variant="destructive" size="sm" onClick={() => void confirmDelete(resume.id)}>
                      确认删除
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDelete(null)}>
                      取消
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDelete(resume.id)}>
                    删除
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
