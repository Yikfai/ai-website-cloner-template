import { notFound } from "next/navigation";

import { ResumeEditor } from "@/components/resume/editor/resume-editor";
import { getResume } from "@/lib/resume/store";
import { isResumeId } from "@/lib/resume/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isResumeId(id)) notFound();
  const document = getResume(id);
  if (!document) notFound();
  return <ResumeEditor initial={document} />;
}
