import { deleteResume, getResume, saveResume } from "@/lib/resume/store";
import { isResumeId } from "@/lib/resume/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isResumeId(id)) return Response.json({ error: "无效的简历编号" }, { status: 400 });
  const document = getResume(id);
  if (!document) return Response.json({ error: "找不到这份简历" }, { status: 404 });
  return Response.json(document);
}

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  if (!isResumeId(id)) return Response.json({ error: "无效的简历编号" }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求不是有效的 JSON" }, { status: 400 });
  }
  const saved = saveResume(id, body);
  if (!saved) return Response.json({ error: "无法保存，请检查内容是否完整" }, { status: 400 });
  return Response.json(saved);
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isResumeId(id)) return Response.json({ error: "无效的简历编号" }, { status: 400 });
  const removed = deleteResume(id);
  if (!removed) return Response.json({ error: "找不到这份简历" }, { status: 404 });
  return Response.json({ ok: true });
}
