/** Structured resume content. Layout is chosen by `templateId` and is not stored as HTML. */

export type ResumeLocale = "zh" | "en";

export type ResumeDensity = "compact" | "normal" | "relaxed";

export type ResumeTheme = {
  fontFamily: string;
  accent: string;
  fontScale: number;
  density: ResumeDensity;
};

export type ProfileLink = {
  label: string;
  url: string;
};

export type ResumeProfile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: ProfileLink[];
  summary: string;
};

export type ExperienceItem = {
  id: string;
  org: string;
  role: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
};

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  details: string;
};

export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
};

export type ProjectItem = {
  id: string;
  name: string;
  url: string;
  bullets: string[];
};

export type ExperienceSection = {
  id: string;
  type: "experience";
  title: string;
  hidden: boolean;
  items: ExperienceItem[];
};

export type EducationSection = {
  id: string;
  type: "education";
  title: string;
  hidden: boolean;
  items: EducationItem[];
};

export type SkillsSection = {
  id: string;
  type: "skills";
  title: string;
  hidden: boolean;
  groups: SkillGroup[];
};

export type ProjectsSection = {
  id: string;
  type: "projects";
  title: string;
  hidden: boolean;
  items: ProjectItem[];
};

export type CustomSection = {
  id: string;
  type: "custom";
  title: string;
  hidden: boolean;
  body: string;
};

export type ResumeSection =
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CustomSection;

export type ResumeDocument = {
  id: string;
  title: string;
  locale: ResumeLocale;
  updatedAt: string;
  templateId: "plain";
  theme: ResumeTheme;
  profile: ResumeProfile;
  sections: ResumeSection[];
};

export type ResumeSummary = {
  id: string;
  title: string;
  locale: ResumeLocale;
  updatedAt: string;
  headline: string;
};
