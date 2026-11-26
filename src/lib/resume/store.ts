import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { blankResume } from "@/lib/resume/defaults";
import { sampleResume } from "@/lib/resume/sample";
import { isResumeId, parseResumeDocument } from "@/lib/resume/schema";
import type { ResumeDocument, ResumeSummary } from "@/lib/resume/types";

const DATA_DIR = path.join(process.cwd(), "data", "resumes");

function resumePath(id: string): string {
  if (!isResumeId(id)) {
    throw new Error("Invalid resume id");
  }
  return path.join(DATA_DIR, `${id}.json`);
}

function ensureDir(): void {
  mkdirSync(DATA_DIR, { recursive: true });
}

function readDocument(filePath: string): ResumeDocument | null {
  try {
    const raw: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    return parseResumeDocument(raw);
  } catch {
    return null;
  }
}

function writeDocument(document: ResumeDocument): ResumeDocument {
  ensureDir();
  const next: ResumeDocument = {
    ...document,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(resumePath(next.id), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

/** First launch only: an empty folder gets one fictional resume. Deleting it stays empty. */
export function ensureSampleResume(): void {
  ensureDir();
  const files = readdirSync(DATA_DIR).filter((name) => name.endsWith(".json"));
  if (files.length > 0) return;
  if (existsSync(path.join(DATA_DIR, ".initialized"))) return;
  writeDocument(sampleResume());
}

export function listResumes(): ResumeSummary[] {
  ensureSampleResume();
  const files = readdirSync(DATA_DIR).filter((name) => name.endsWith(".json"));
  const summaries: ResumeSummary[] = [];
  for (const file of files) {
    const document = readDocument(path.join(DATA_DIR, file));
    if (!document) continue;
    summaries.push({
      id: document.id,
      title: document.title || "未命名简历",
      locale: document.locale,
      updatedAt: document.updatedAt,
      headline: document.profile.headline,
    });
  }
  summaries.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return summaries;
}

export function getResume(id: string): ResumeDocument | null {
  if (!isResumeId(id)) return null;
  ensureDir();
  const filePath = resumePath(id);
  if (!existsSync(filePath)) return null;
  return readDocument(filePath);
}

export function createResume(title: string): ResumeDocument {
  ensureDir();
  const document = blankResume(title.trim() || "未命名简历");
  return writeDocument(document);
}

export function saveResume(id: string, input: unknown): ResumeDocument | null {
  if (!isResumeId(id)) return null;
  const parsed = parseResumeDocument(input);
  if (!parsed || parsed.id !== id) return null;
  if (!existsSync(resumePath(id))) return null;
  return writeDocument(parsed);
}

export function deleteResume(id: string): boolean {
  if (!isResumeId(id)) return false;
  const filePath = resumePath(id);
  if (!existsSync(filePath)) return false;
  unlinkSync(filePath);
  ensureDir();
  const remaining = readdirSync(DATA_DIR).filter((name) => name.endsWith(".json"));
  if (remaining.length === 0) {
    writeFileSync(path.join(DATA_DIR, ".initialized"), "empty\n", "utf8");
  }
  return true;
}
