import { AppLink } from "@/components/app-link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm text-muted-foreground">本机工具</p>
      <h1 className="text-3xl font-semibold tracking-tight">简历编辑器</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        在这台电脑上编写简历。内容按份存在本地 JSON 里，版式和正文分开。打开即可修改示例，或新建一份空白简历。
      </p>
      <div>
        <AppLink href="/resumes">打开简历</AppLink>
      </div>
    </main>
  );
}
