import { DEFAULT_ACCENT, PLAIN_TEMPLATE_ID } from "@/lib/resume/defaults";
import type {
  CustomSection,
  EducationItem,
  EducationSection,
  ExperienceItem,
  ExperienceSection,
  ProfileLink,
  ProjectItem,
  ProjectsSection,
  ResumeDocument,
  ResumeLocale,
  ResumeProfile,
  ResumeSection,
  ResumeTheme,
  SkillGroup,
  SkillsSection,
} from "@/lib/resume/types";

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/;
const MAX_TEXT = 8000;
const MAX_ITEMS = 40;
const MAX_BULLETS = 20;

export function isResumeId(id: string): boolean {
  return ID_PATTERN.test(id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max = MAX_TEXT): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\u0000/g, "");
  if (trimmed.length > max) return null;
  return trimmed;
}

function flag(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_BULLETS) return null;
  const items: string[] = [];
  for (const entry of value) {
    const item = text(entry, 500);
    if (item === null) return null;
    items.push(item);
  }
  return items;
}

function localeOf(value: unknown): ResumeLocale | null {
  return value === "zh" || value === "en" ? value : null;
}

function safeAccent(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_ACCENT;
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^oklch\(\s*[\d.%]+\s+[\d.]+\s+[\d.]+\s*\)$/.test(value)) return value;
  return DEFAULT_ACCENT;
}

function themeOf(value: unknown): ResumeTheme | null {
  if (!isRecord(value)) return null;
  const fontScale = value.fontScale;
  if (typeof fontScale !== "number" || fontScale < 0.8 || fontScale > 1.4) return null;
  const density = value.density;
  if (density !== "compact" && density !== "normal" && density !== "relaxed") return null;
  const fontFamily = text(value.fontFamily, 80);
  if (fontFamily === null) return null;
  return {
    fontFamily,
    accent: safeAccent(value.accent),
    fontScale,
    density,
  };
}

function linksOf(value: unknown): ProfileLink[] | null {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) return null;
  const links: ProfileLink[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const label = text(entry.label, 80);
    const url = text(entry.url, 400);
    if (label === null || url === null) return null;
    links.push({ label, url });
  }
  return links;
}

function profileOf(value: unknown): ResumeProfile | null {
  if (!isRecord(value)) return null;
  const name = text(value.name, 120);
  const headline = text(value.headline, 200);
  const email = text(value.email, 200);
  const phone = text(value.phone, 80);
  const location = text(value.location, 120);
  const summary = text(value.summary, 4000);
  const links = linksOf(value.links);
  if (
    name === null ||
    headline === null ||
    email === null ||
    phone === null ||
    location === null ||
    summary === null ||
    links === null
  ) {
    return null;
  }
  return { name, headline, email, phone, location, links, summary };
}

function experienceItem(value: unknown): ExperienceItem | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const org = text(value.org, 160);
  const role = text(value.role, 160);
  const location = text(value.location, 120);
  const start = text(value.start, 40);
  const end = text(value.end, 40);
  const current = flag(value.current);
  const bullets = stringList(value.bullets);
  if (
    !id ||
    org === null ||
    role === null ||
    location === null ||
    start === null ||
    end === null ||
    current === null ||
    bullets === null
  ) {
    return null;
  }
  return { id, org, role, location, start, end, current, bullets };
}

function educationItem(value: unknown): EducationItem | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const school = text(value.school, 160);
  const degree = text(value.degree, 160);
  const start = text(value.start, 40);
  const end = text(value.end, 40);
  const details = text(value.details, 1000);
  if (!id || school === null || degree === null || start === null || end === null || details === null) {
    return null;
  }
  return { id, school, degree, start, end, details };
}

function skillGroup(value: unknown): SkillGroup | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const label = text(value.label, 80);
  const items = stringList(value.items);
  if (!id || label === null || items === null) return null;
  return { id, label, items };
}

function projectItem(value: unknown): ProjectItem | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const name = text(value.name, 160);
  const url = text(value.url, 400);
  const bullets = stringList(value.bullets);
  if (!id || name === null || url === null || bullets === null) return null;
  return { id, name, url, bullets };
}

function itemList<T>(value: unknown, parse: (entry: unknown) => T | null): T[] | null {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) return null;
  const items: T[] = [];
  for (const entry of value) {
    const item = parse(entry);
    if (!item) return null;
    items.push(item);
  }
  return items;
}

function sectionOf(value: unknown): ResumeSection | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const title = text(value.title, 80);
  const hidden = flag(value.hidden);
  if (!id || title === null || hidden === null) return null;
  const base = { id, title, hidden };
  if (value.type === "experience") {
    const items = itemList(value.items, experienceItem);
    if (!items) return null;
    return { ...base, type: "experience", items } satisfies ExperienceSection;
  }
  if (value.type === "education") {
    const items = itemList(value.items, educationItem);
    if (!items) return null;
    return { ...base, type: "education", items } satisfies EducationSection;
  }
  if (value.type === "skills") {
    const groups = itemList(value.groups, skillGroup);
    if (!groups) return null;
    return { ...base, type: "skills", groups } satisfies SkillsSection;
  }
  if (value.type === "projects") {
    const items = itemList(value.items, projectItem);
    if (!items) return null;
    return { ...base, type: "projects", items } satisfies ProjectsSection;
  }
  if (value.type === "custom") {
    const body = text(value.body, 4000);
    if (body === null) return null;
    return { ...base, type: "custom", body } satisfies CustomSection;
  }
  return null;
}

export function parseResumeDocument(value: unknown): ResumeDocument | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const title = text(value.title, 120);
  const locale = localeOf(value.locale);
  const updatedAt = text(value.updatedAt, 40);
  const theme = themeOf(value.theme);
  const profile = profileOf(value.profile);
  if (!id || !isResumeId(id) || title === null || !locale || !updatedAt || !theme || !profile) {
    return null;
  }
  if (!Array.isArray(value.sections) || value.sections.length > 12) return null;
  const sections: ResumeSection[] = [];
  for (const entry of value.sections) {
    const section = sectionOf(entry);
    if (!section) return null;
    sections.push(section);
  }
  return {
    id,
    title,
    locale,
    updatedAt,
    templateId: PLAIN_TEMPLATE_ID,
    theme,
    profile,
    sections,
  };
}
