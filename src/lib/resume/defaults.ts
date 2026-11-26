import type {
  CustomSection,
  EducationSection,
  ExperienceSection,
  ProjectsSection,
  ResumeDensity,
  ResumeLocale,
  ResumeSection,
  ResumeTheme,
  SkillsSection,
} from "@/lib/resume/types";

export const PLAIN_TEMPLATE_ID = "plain" as const;

export const DEFAULT_ACCENT = "oklch(0.38 0.045 250)";

export function createId(): string {
  return crypto.randomUUID();
}

export function defaultTheme(): ResumeTheme {
  return {
    fontFamily: "serif",
    accent: DEFAULT_ACCENT,
    fontScale: 1,
    density: "normal",
  };
}

const SECTION_TITLES: Record<ResumeSection["type"], Record<ResumeLocale, string>> = {
  experience: { zh: "工作经历", en: "Experience" },
  education: { zh: "教育背景", en: "Education" },
  skills: { zh: "技能", en: "Skills" },
  projects: { zh: "项目", en: "Projects" },
  custom: { zh: "其他", en: "Additional" },
};

export function defaultSectionTitle(
  type: ResumeSection["type"],
  locale: ResumeLocale,
): string {
  return SECTION_TITLES[type][locale];
}

export function presentLabel(locale: ResumeLocale): string {
  return locale === "zh" ? "至今" : "Present";
}

export function emptyExperience(locale: ResumeLocale): ExperienceSection {
  return {
    id: createId(),
    type: "experience",
    title: defaultSectionTitle("experience", locale),
    hidden: false,
    items: [],
  };
}

export function emptyEducation(locale: ResumeLocale): EducationSection {
  return {
    id: createId(),
    type: "education",
    title: defaultSectionTitle("education", locale),
    hidden: false,
    items: [],
  };
}

export function emptySkills(locale: ResumeLocale): SkillsSection {
  return {
    id: createId(),
    type: "skills",
    title: defaultSectionTitle("skills", locale),
    hidden: false,
    groups: [],
  };
}

export function emptyProjects(locale: ResumeLocale): ProjectsSection {
  return {
    id: createId(),
    type: "projects",
    title: defaultSectionTitle("projects", locale),
    hidden: false,
    items: [],
  };
}

export function emptyCustom(locale: ResumeLocale): CustomSection {
  return {
    id: createId(),
    type: "custom",
    title: defaultSectionTitle("custom", locale),
    hidden: false,
    body: "",
  };
}

export function blankResume(title: string, locale: ResumeLocale = "zh") {
  return {
    id: createId(),
    title,
    locale,
    updatedAt: new Date().toISOString(),
    templateId: PLAIN_TEMPLATE_ID,
    theme: defaultTheme(),
    profile: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      links: [],
      summary: "",
    },
    sections: [
      emptyExperience(locale),
      emptyEducation(locale),
      emptySkills(locale),
      emptyProjects(locale),
    ],
  };
}

export function densitySpacing(density: ResumeDensity): {
  pagePad: string;
  sectionGap: string;
  itemGap: string;
} {
  if (density === "compact") {
    return { pagePad: "12mm", sectionGap: "4.5mm", itemGap: "2.5mm" };
  }
  if (density === "relaxed") {
    return { pagePad: "18mm", sectionGap: "8mm", itemGap: "4.5mm" };
  }
  return { pagePad: "16mm", sectionGap: "6mm", itemGap: "3.5mm" };
}
