import { AppLink } from "@/components/app-link";

export default function ResumeNotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-4 px-6 py-16">
      <h1 className="text-xl font-semibold">找不到这份简历</h1>
      <p className="text-sm text-muted-foreground">它可能已经从本机的 data/resumes 目录里删除了。</p>
      <AppLink href="/resumes" variant="outline">
        返回列表
      </AppLink>
    </main>
  );
}
