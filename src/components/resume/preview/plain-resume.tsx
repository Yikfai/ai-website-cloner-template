import { densitySpacing, presentLabel } from "@/lib/resume/defaults";
import type { ResumeDocument, ResumeSection } from "@/lib/resume/types";

const PAGE_FONT =
  '"Iowan Old Style", Palatino, "Palatino Linotype", "Songti SC", "Noto Serif SC", "Source Han Serif SC", PMingLiU, serif';

function formatRange(
  start: string,
  end: string,
  current: boolean,
  locale: ResumeDocument["locale"],
): string {
  const stop = current ? presentLabel(locale) : end;
  if (start && stop) return `${start} — ${stop}`;
  return start || stop;
}

function SectionBlock({
  section,
  locale,
  accent,
  itemGap,
}: {
  section: ResumeSection;
  locale: ResumeDocument["locale"];
  accent: string;
  itemGap: string;
}) {
  if (section.hidden) return null;

  const heading = (
    <h2
      className="mb-[2mm] border-b pb-[1mm] text-[0.78em] font-semibold tracking-[0.14em]"
      style={{ borderColor: accent, color: accent }}
    >
      {section.title}
    </h2>
  );

  if (section.type === "custom") {
    if (!section.body.trim()) return null;
    return (
      <section>
        {heading}
        <p className="whitespace-pre-wrap text-[0.95em] leading-relaxed">{section.body}</p>
      </section>
    );
  }

  if (section.type === "skills") {
    if (section.groups.length === 0) return null;
    return (
      <section>
        {heading}
        <ul className="space-y-[1.5mm]">
          {section.groups.map((group) => (
            <li key={group.id} className="text-[0.95em] leading-relaxed">
              {group.label ? <span className="font-semibold">{group.label}：</span> : null}
              {group.items.filter(Boolean).join(locale === "zh" ? "、" : ", ")}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (section.type === "experience") {
    if (section.items.length === 0) return null;
    return (
      <section className="flex flex-col" style={{ gap: itemGap }}>
        {heading}
        {section.items.map((item) => (
          <article key={item.id}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[1.02em] font-semibold">{item.role || item.org}</h3>
              <p className="shrink-0 text-[0.82em] text-neutral-600">
                {formatRange(item.start, item.end, item.current, locale)}
              </p>
            </div>
            <p className="text-[0.9em] text-neutral-700">
              {[item.org, item.location].filter(Boolean).join(" · ")}
            </p>
            {item.bullets.some((bullet) => bullet.trim()) ? (
              <ul className="mt-[1mm] list-disc pl-[1.1em] text-[0.92em] leading-relaxed">
                {item.bullets.filter((bullet) => bullet.trim()).map((bullet, index) => (
                  <li key={`${item.id}-${index}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    );
  }

  if (section.type === "education") {
    if (section.items.length === 0) return null;
    return (
      <section className="flex flex-col" style={{ gap: itemGap }}>
        {heading}
        {section.items.map((item) => (
          <article key={item.id}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[1.02em] font-semibold">{item.school}</h3>
              <p className="shrink-0 text-[0.82em] text-neutral-600">
                {formatRange(item.start, item.end, false, locale)}
              </p>
            </div>
            {item.degree ? <p className="text-[0.9em]">{item.degree}</p> : null}
            {item.details ? (
              <p className="mt-[0.5mm] text-[0.9em] leading-relaxed text-neutral-700">{item.details}</p>
            ) : null}
          </article>
        ))}
      </section>
    );
  }

  if (section.items.length === 0) return null;
  return (
    <section className="flex flex-col" style={{ gap: itemGap }}>
      {heading}
      {section.items.map((item) => (
        <article key={item.id}>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[1.02em] font-semibold">{item.name}</h3>
            {item.url ? (
              <p className="max-w-[45%] truncate text-[0.78em] text-neutral-600">{item.url}</p>
            ) : null}
          </div>
          {item.bullets.some((bullet) => bullet.trim()) ? (
            <ul className="mt-[1mm] list-disc pl-[1.1em] text-[0.92em] leading-relaxed">
              {item.bullets.filter((bullet) => bullet.trim()).map((bullet, index) => (
                <li key={`${item.id}-${index}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function PlainResume({ document }: { document: ResumeDocument }) {
  const { profile, theme, locale } = document;
  const spacing = densitySpacing(theme.density);
  const contact = [profile.email, profile.phone, profile.location, ...profile.links.map((link) => link.label || link.url)]
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <article
      className="mx-auto bg-white text-neutral-900 shadow-md"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: spacing.pagePad,
        fontFamily: PAGE_FONT,
        fontSize: `${11 * theme.fontScale}pt`,
        lineHeight: 1.45,
      }}
      aria-label="简历预览"
    >
      <header className="mb-[5mm]">
        <h1 className="text-[1.85em] font-semibold leading-tight tracking-tight">
          {profile.name || (locale === "zh" ? "未填写姓名" : "Name")}
        </h1>
        {profile.headline ? <p className="mt-[1mm] text-[1.05em] text-neutral-700">{profile.headline}</p> : null}
        {contact.length > 0 ? (
          <p className="mt-[2mm] text-[0.85em] text-neutral-600">{contact.join("  ·  ")}</p>
        ) : null}
      </header>
      {profile.summary ? (
        <p className="mb-[5mm] whitespace-pre-wrap text-[0.98em] leading-relaxed">{profile.summary}</p>
      ) : null}
      <div className="flex flex-col" style={{ gap: spacing.sectionGap }}>
        {document.sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            locale={locale}
            accent={theme.accent}
            itemGap={spacing.itemGap}
          />
        ))}
      </div>
    </article>
  );
}
