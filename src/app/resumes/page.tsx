import { ResumeList } from "@/components/resume/resume-list";
import { listResumes } from "@/lib/resume/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function ResumesPage() {
  const resumes = listResumes();
  return <ResumeList initialResumes={resumes} />;
}
