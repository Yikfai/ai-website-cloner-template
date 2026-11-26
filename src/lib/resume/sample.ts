import { defaultTheme } from "@/lib/resume/defaults";
import type { ResumeDocument } from "@/lib/resume/types";

/** Fictional sample so a fresh checkout opens straight into the editor. */
export const SAMPLE_RESUME_ID = "sample-lin-cheng";

export function sampleResume(): ResumeDocument {
  return {
    id: SAMPLE_RESUME_ID,
    title: "示例简历 · 产品工程",
    locale: "zh",
    updatedAt: "2026-01-15T08:00:00.000Z",
    templateId: "plain",
    theme: defaultTheme(),
    profile: {
      name: "林澄",
      headline: "产品工程师 · 虚构示例",
      email: "lin.cheng.example@example.com",
      phone: "+86 138 0000 0000",
      location: "上海",
      links: [{ label: "示例作品集", url: "https://example.com" }],
      summary:
        "这是一份本地示例简历，人物、公司与项目都是虚构的，用来让编辑器打开就能改。把这些字段换成你自己的内容后，右侧预览会跟着变。",
    },
    sections: [
      {
        id: "section-experience",
        type: "experience",
        title: "工作经历",
        hidden: false,
        items: [
          {
            id: "exp-northshore",
            org: "北岸工作室",
            role: "产品工程师",
            location: "上海",
            start: "2023-03",
            end: "",
            current: true,
            bullets: [
              "负责一款内部排期工具的信息架构，把周报从长邮件改成按项目归档的记录。",
              "和两名工程师一起把发布前检查做成可勾选的清单，减少漏记环境变量的情况。",
            ],
          },
          {
            id: "exp-lantern",
            org: "灯塔文具",
            role: "业务支持",
            location: "杭州",
            start: "2020-07",
            end: "2023-02",
            current: false,
            bullets: [
              "整理门店周销售表，标出连续两周下滑的货号，供采购例会讨论。",
              "编写新店开业当天的值班说明，让临时同事能独立完成关店盘点。",
            ],
          },
        ],
      },
      {
        id: "section-education",
        type: "education",
        title: "教育背景",
        hidden: false,
        items: [
          {
            id: "edu-eastsea",
            school: "东海大学",
            degree: "计算机科学 学士",
            start: "2016",
            end: "2020",
            details: "虚构院校，仅用于演示教育栏目的排版。",
          },
        ],
      },
      {
        id: "section-skills",
        type: "skills",
        title: "技能",
        hidden: false,
        groups: [
          { id: "skill-lang", label: "语言与工具", items: ["TypeScript", "Python", "SQL"] },
          { id: "skill-work", label: "协作", items: ["需求拆解", "书面说明", "发布核对"] },
        ],
      },
      {
        id: "section-projects",
        type: "projects",
        title: "项目",
        hidden: false,
        items: [
          {
            id: "project-harbor",
            name: "港口日志",
            url: "https://example.com/harbor",
            bullets: [
              "一个记录潮汐与值班的虚构小工具，数据只保存在使用者自己的电脑上。",
              "界面用单栏清单，避免把备注写进互相覆盖的表格。",
            ],
          },
        ],
      },
    ],
  };
}
