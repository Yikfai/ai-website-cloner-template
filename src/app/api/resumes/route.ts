import { createResume, listResumes } from "@/lib/resume/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ resumes: listResumes() });
}

export async function POST(request: Request) {
  let title = "未命名简历";
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && "title" in body && typeof body.title === "string") {
      title = body.title;
    }
  } catch {
    title = "未命名简历";
  }
  const document = createResume(title);
  return Response.json(document, { status: 201 });
}
