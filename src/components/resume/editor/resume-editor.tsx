"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { PlainResume } from "@/components/resume/preview/plain-resume";
import { BulletList, Field, ItemFrame, fieldClass, moveItem } from "@/components/resume/editor/fields";
import { Button } from "@/components/ui/button";
import {
  createId,
  defaultSectionTitle,
  emptyCustom,
} from "@/lib/resume/defaults";
import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeDocument,
  ResumeLocale,
  ResumeSection,
  SkillGroup,
} from "@/lib/resume/types";

type SaveState = "saved" | "dirty" | "saving" | "error";

function snapshot(document: ResumeDocument): string {
  return JSON.stringify(document);
}

function applyLocale(document: ResumeDocument, locale: ResumeLocale): ResumeDocument {
  return {
    ...document,
    locale,
    sections: document.sections.map((section) => {
      const previous = defaultSectionTitle(section.type, document.locale);
      if (section.title !== previous) return section;
      return { ...section, title: defaultSectionTitle(section.type, locale) };
    }),
  };
}

export function ResumeEditor({ initial }: { initial: ResumeDocument }) {
  const router = useRouter();
  const [document, setDocument] = useState(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(initial));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const latest = useRef(document);

  const dirty = snapshot(document) !== savedSnapshot;

  useEffect(() => {
    latest.current = document;
  }, [document]);

  const persist = useCallback(async (current: ResumeDocument) => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const response = await fetch(`/api/resumes/${current.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(current),
      });
      if (!response.ok) {
        setSaveState("error");
        setSaveError("保存失败。请检查各栏是否过长，然后重试。");
        return;
      }
      const saved = (await response.json()) as ResumeDocument;
      if (snapshot(latest.current) !== snapshot(current)) {
        setDocument((existing) => ({ ...existing, updatedAt: saved.updatedAt }));
        return;
      }
      const next = { ...current, updatedAt: saved.updatedAt };
      latest.current = next;
      setDocument(next);
      setSavedSnapshot(snapshot(next));
      setSaveState("saved");
    } catch {
      setSaveState("error");
      setSaveError("保存失败。请确认本机服务仍在运行。");
    }
  }, []);

  useEffect(() => {
    if (snapshot(document) === savedSnapshot) return;
    const handle = window.setTimeout(() => {
      void persist(document);
    }, 700);
    return () => window.clearTimeout(handle);
  }, [document, savedSnapshot, persist]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (snapshot(latest.current) === savedSnapshot) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [savedSnapshot]);

  function update(recipe: (current: ResumeDocument) => ResumeDocument) {
    setDocument((current) => {
      const next = recipe(current);
      latest.current = next;
      return next;
    });
    setSaveState("dirty");
  }

  function updateSection(sectionId: string, recipe: (section: ResumeSection) => ResumeSection) {
    update((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === sectionId ? recipe(section) : section)),
    }));
  }

  async function removeResume() {
    const response = await fetch(`/api/resumes/${document.id}`, { method: "DELETE" });
    if (!response.ok) {
      setSaveError("删除失败。");
      return;
    }
    setSavedSnapshot(snapshot(latest.current));
    router.push("/resumes");
    router.refresh();
  }

  const statusLabel =
    saveState === "saving" ? "正在保存…" : saveState === "error" ? "保存失败" : dirty ? "有未保存的修改" : "已保存";

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          href="/resumes"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={(event) => {
            if (!dirty) return;
            if (!window.confirm("还有未保存的修改，确定离开吗？")) event.preventDefault();
          }}
        >
          返回列表
        </Link>
        <input
          className={`${fieldClass} max-w-xs font-medium`}
          aria-label="简历名称"
          value={document.title}
          onChange={(event) => update((current) => ({ ...current, title: event.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          这份简历的语言
          <select
            className={fieldClass}
            value={document.locale}
            onChange={(event) => {
              const locale = event.target.value === "en" ? "en" : "zh";
              update((current) => applyLocale(current, locale));
            }}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {statusLabel}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void persist(document)} disabled={!dirty && saveState !== "error"}>
            保存
          </Button>
          {confirmDelete ? (
            <>
              <Button type="button" variant="destructive" size="sm" onClick={() => void removeResume()}>
                确认删除
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                取消
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              删除
            </Button>
          )}
        </div>
      </header>
      {saveError ? <p className="px-4 pt-3 text-sm text-destructive">{saveError}</p> : null}
      <div className="grid flex-1 items-start gap-6 px-4 py-4 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">个人信息</h2>
            <Field label="姓名" value={document.profile.name} onChange={(name) => update((current) => ({ ...current, profile: { ...current.profile, name } }))} />
            <Field label="一句话介绍" value={document.profile.headline} onChange={(headline) => update((current) => ({ ...current, profile: { ...current.profile, headline } }))} />
            <Field label="邮箱" value={document.profile.email} onChange={(email) => update((current) => ({ ...current, profile: { ...current.profile, email } }))} />
            <Field label="电话" value={document.profile.phone} onChange={(phone) => update((current) => ({ ...current, profile: { ...current.profile, phone } }))} />
            <Field label="所在地" value={document.profile.location} onChange={(location) => update((current) => ({ ...current, profile: { ...current.profile, location } }))} />
            <Field label="简介" multiline value={document.profile.summary} onChange={(summary) => update((current) => ({ ...current, profile: { ...current.profile, summary } }))} />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">链接</p>
              {document.profile.links.map((link, index) => (
                <div key={`${index}-${link.label}`} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input
                    className={fieldClass}
                    aria-label="链接文字"
                    placeholder="文字"
                    value={link.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      update((current) => {
                        const links = [...current.profile.links];
                        const existing = links[index];
                        if (!existing) return current;
                        links[index] = { ...existing, label };
                        return { ...current, profile: { ...current.profile, links } };
                      });
                    }}
                  />
                  <input
                    className={fieldClass}
                    aria-label="链接地址"
                    placeholder="https://"
                    value={link.url}
                    onChange={(event) => {
                      const url = event.target.value;
                      update((current) => {
                        const links = [...current.profile.links];
                        const existing = links[index];
                        if (!existing) return current;
                        links[index] = { ...existing, url };
                        return { ...current, profile: { ...current.profile, links } };
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          links: current.profile.links.filter((_, linkIndex) => linkIndex !== index),
                        },
                      }))
                    }
                  >
                    移除
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update((current) => ({
                    ...current,
                    profile: { ...current.profile, links: [...current.profile.links, { label: "", url: "" }] },
                  }))
                }
              >
                <Plus />
                添加链接
              </Button>
            </div>
          </section>

          {document.sections.map((section, sectionIndex) => (
            <SectionEditor
              key={section.id}
              section={section}
              canUp={sectionIndex > 0}
              canDown={sectionIndex < document.sections.length - 1}
              onChange={(next) => updateSection(section.id, () => next)}
              onUp={() =>
                update((current) => ({ ...current, sections: moveItem(current.sections, sectionIndex, -1) }))
              }
              onDown={() =>
                update((current) => ({ ...current, sections: moveItem(current.sections, sectionIndex, 1) }))
              }
              onRemove={() =>
                update((current) => ({
                  ...current,
                  sections: current.sections.filter((item) => item.id !== section.id),
                }))
              }
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => update((current) => ({ ...current, sections: [...current.sections, emptyCustom(current.locale)] }))}
          >
            <Plus />
            添加自定义栏目
          </Button>
        </div>
        <div className="overflow-x-auto rounded-xl bg-muted/60 p-4 xl:sticky xl:top-16">
          <p className="mb-3 text-xs text-muted-foreground">预览 · 简洁单栏 · A4</p>
          <div className="origin-top scale-[0.72] sm:scale-90 xl:scale-100" style={{ width: "210mm" }}>
            <PlainResume document={document} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  canUp,
  canDown,
  onChange,
  onUp,
  onDown,
  onRemove,
}: {
  section: ResumeSection;
  canUp: boolean;
  canDown: boolean;
  onChange: (section: ResumeSection) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${fieldClass} max-w-xs font-medium`}
          aria-label="栏目名称"
          value={section.title}
          onChange={(event) => onChange({ ...section, title: event.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={section.hidden}
            onChange={(event) => onChange({ ...section, hidden: event.target.checked })}
          />
          预览中隐藏
        </label>
        <div className="ml-auto flex gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={!canUp} onClick={onUp}>
            上移栏目
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={!canDown} onClick={onDown}>
            下移栏目
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            删除栏目
          </Button>
        </div>
      </div>
      <SectionBody section={section} onChange={onChange} />
    </section>
  );
}

function SectionBody({
  section,
  onChange,
}: {
  section: ResumeSection;
  onChange: (section: ResumeSection) => void;
}) {
  if (section.type === "custom") {
    return (
      <Field
        label="正文"
        multiline
        value={section.body}
        onChange={(body) => onChange({ ...section, body })}
      />
    );
  }

  if (section.type === "experience") {
    return (
      <div className="space-y-3">
        {section.items.map((item, index) => (
          <ExperienceFields
            key={item.id}
            item={item}
            canUp={index > 0}
            canDown={index < section.items.length - 1}
            onChange={(next) => {
              const items = [...section.items];
              items[index] = next;
              onChange({ ...section, items });
            }}
            onUp={() => onChange({ ...section, items: moveItem(section.items, index, -1) })}
            onDown={() => onChange({ ...section, items: moveItem(section.items, index, 1) })}
            onRemove={() => onChange({ ...section, items: section.items.filter((entry) => entry.id !== item.id) })}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...section,
              items: [
                ...section.items,
                {
                  id: createId(),
                  org: "",
                  role: "",
                  location: "",
                  start: "",
                  end: "",
                  current: false,
                  bullets: [""],
                },
              ],
            })
          }
        >
          <Plus />
          添加经历
        </Button>
      </div>
    );
  }

  if (section.type === "education") {
    return (
      <div className="space-y-3">
        {section.items.map((item, index) => (
          <EducationFields
            key={item.id}
            item={item}
            canUp={index > 0}
            canDown={index < section.items.length - 1}
            onChange={(next) => {
              const items = [...section.items];
              items[index] = next;
              onChange({ ...section, items });
            }}
            onUp={() => onChange({ ...section, items: moveItem(section.items, index, -1) })}
            onDown={() => onChange({ ...section, items: moveItem(section.items, index, 1) })}
            onRemove={() => onChange({ ...section, items: section.items.filter((entry) => entry.id !== item.id) })}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...section,
              items: [
                ...section.items,
                { id: createId(), school: "", degree: "", start: "", end: "", details: "" },
              ],
            })
          }
        >
          <Plus />
          添加教育
        </Button>
      </div>
    );
  }

  if (section.type === "skills") {
    return (
      <div className="space-y-3">
        {section.groups.map((group, index) => (
          <SkillFields
            key={group.id}
            group={group}
            canUp={index > 0}
            canDown={index < section.groups.length - 1}
            onChange={(next) => {
              const groups = [...section.groups];
              groups[index] = next;
              onChange({ ...section, groups });
            }}
            onUp={() => onChange({ ...section, groups: moveItem(section.groups, index, -1) })}
            onDown={() => onChange({ ...section, groups: moveItem(section.groups, index, 1) })}
            onRemove={() => onChange({ ...section, groups: section.groups.filter((entry) => entry.id !== group.id) })}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...section,
              groups: [...section.groups, { id: createId(), label: "", items: [""] }],
            })
          }
        >
          <Plus />
          添加技能组
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {section.items.map((item, index) => (
        <ProjectFields
          key={item.id}
          item={item}
          canUp={index > 0}
          canDown={index < section.items.length - 1}
          onChange={(next) => {
            const items = [...section.items];
            items[index] = next;
            onChange({ ...section, items });
          }}
          onUp={() => onChange({ ...section, items: moveItem(section.items, index, -1) })}
          onDown={() => onChange({ ...section, items: moveItem(section.items, index, 1) })}
          onRemove={() => onChange({ ...section, items: section.items.filter((entry) => entry.id !== item.id) })}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange({
            ...section,
            items: [...section.items, { id: createId(), name: "", url: "", bullets: [""] }],
          })
        }
      >
        <Plus />
        添加项目
      </Button>
    </div>
  );
}

function ExperienceFields({
  item,
  canUp,
  canDown,
  onChange,
  onUp,
  onDown,
  onRemove,
}: {
  item: ExperienceItem;
  canUp: boolean;
  canDown: boolean;
  onChange: (item: ExperienceItem) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <ItemFrame title={item.role || item.org || "新经历"} canUp={canUp} canDown={canDown} onUp={onUp} onDown={onDown} onRemove={onRemove}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="职位" value={item.role} onChange={(role) => onChange({ ...item, role })} />
        <Field label="组织" value={item.org} onChange={(org) => onChange({ ...item, org })} />
        <Field label="地点" value={item.location} onChange={(location) => onChange({ ...item, location })} />
        <Field label="开始" value={item.start} placeholder="2023-03" onChange={(start) => onChange({ ...item, start })} />
        <Field label="结束" value={item.end} placeholder="2025-08" onChange={(end) => onChange({ ...item, end })} />
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={item.current}
            onChange={(event) => onChange({ ...item, current: event.target.checked })}
          />
          目前在职
        </label>
      </div>
      <BulletList bullets={item.bullets} onChange={(bullets) => onChange({ ...item, bullets })} />
    </ItemFrame>
  );
}

function EducationFields({
  item,
  canUp,
  canDown,
  onChange,
  onUp,
  onDown,
  onRemove,
}: {
  item: EducationItem;
  canUp: boolean;
  canDown: boolean;
  onChange: (item: EducationItem) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <ItemFrame title={item.school || "新教育"} canUp={canUp} canDown={canDown} onUp={onUp} onDown={onDown} onRemove={onRemove}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="学校" value={item.school} onChange={(school) => onChange({ ...item, school })} />
        <Field label="学位" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} />
        <Field label="开始" value={item.start} placeholder="2016" onChange={(start) => onChange({ ...item, start })} />
        <Field label="结束" value={item.end} placeholder="2020" onChange={(end) => onChange({ ...item, end })} />
      </div>
      <Field label="补充" value={item.details} onChange={(details) => onChange({ ...item, details })} />
    </ItemFrame>
  );
}

function SkillFields({
  group,
  canUp,
  canDown,
  onChange,
  onUp,
  onDown,
  onRemove,
}: {
  group: SkillGroup;
  canUp: boolean;
  canDown: boolean;
  onChange: (group: SkillGroup) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <ItemFrame title={group.label || "新技能组"} canUp={canUp} canDown={canDown} onUp={onUp} onDown={onDown} onRemove={onRemove}>
      <Field label="分组名" value={group.label} onChange={(label) => onChange({ ...group, label })} />
      <BulletList label="技能" bullets={group.items} onChange={(items) => onChange({ ...group, items })} />
    </ItemFrame>
  );
}

function ProjectFields({
  item,
  canUp,
  canDown,
  onChange,
  onUp,
  onDown,
  onRemove,
}: {
  item: ProjectItem;
  canUp: boolean;
  canDown: boolean;
  onChange: (item: ProjectItem) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <ItemFrame title={item.name || "新项目"} canUp={canUp} canDown={canDown} onUp={onUp} onDown={onDown} onRemove={onRemove}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="项目名" value={item.name} onChange={(name) => onChange({ ...item, name })} />
        <Field label="链接" value={item.url} placeholder="https://" onChange={(url) => onChange({ ...item, url })} />
      </div>
      <BulletList bullets={item.bullets} onChange={(bullets) => onChange({ ...item, bullets })} />
    </ItemFrame>
  );
}
