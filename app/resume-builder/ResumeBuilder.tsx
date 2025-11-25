"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";

type CareerTrack =
  | "software-engineer"
  | "product-manager"
  | "data-analyst"
  | "healthcare-nurse"
  | "retail-hospitality"
  | "operations-logistics"
  | "marketing-creative"
  | "sales"
  | "student-entry"
  | "customer-support"
  | "skilled-trades"
  | "management-leadership";

type ExperienceLevel =
  | "entry"
  | "mid"
  | "senior"
  | "executive"
  | "career-switch";

type StyleTemplateId =
  | "clean-modern"
  | "classic"
  | "compact-tech"
  | "two-column"
  | "bold-header"
  | "minimalist"
  | "timeline"
  | "creative-lite"
  | "formal"
  | "dense-experience";

type ResumeSectionId =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "awards"
  | "volunteer"
  | "additional";

type ResumeContactInfo = {
  fullName: string;
  jobTitle: string;
  cityState: string;
  phone: string;
  email: string;
  websiteOrPortfolio: string;
  linkedin: string;
};

type ResumeExperienceItem = {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

type ResumeEducationItem = {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
};

type ResumeProjectItem = {
  id: string;
  name: string;
  link: string;
  description: string;
  bullets: string[];
};

type ResumeCertificationItem = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

type ResumeAwardItem = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
};

type ResumeVolunteerItem = {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

type ResumeAdditionalItem = {
  id: string;
  label: string;
  content: string;
};

type ResumeData = {
  careerTrack: CareerTrack;
  experienceLevel: ExperienceLevel;
  styleTemplateId: StyleTemplateId;
  contact: ResumeContactInfo;
  summary: string;
  skills: string[];
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
  awards: ResumeAwardItem[];
  volunteer: ResumeVolunteerItem[];
  additional: ResumeAdditionalItem[];
  enabledSections: Record<ResumeSectionId, boolean>;
  targetRoleTitle: string;
  targetJobDescription: string;
};

type CareerTrackPreset = {
  id: CareerTrack;
  label: string;
  description: string;
  defaultSectionOrder: ResumeSectionId[];
  defaultEnabledSections: ResumeSectionId[];
  suggestedSkills: string[];
};

type ExperienceLevelPreset = {
  id: ExperienceLevel;
  label: string;
  description: string;
};

type StyleTemplateConfig = {
  id: StyleTemplateId;
  label: string;
  description: string;
  layout: "one-column" | "two-column";
  headerAlign: "left" | "center";
  accent: "none" | "top-border" | "left-border";
};

type AtsSummary = {
  structureScore: "good" | "fair" | "poor";
  keywordScore: "high" | "medium" | "low";
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
};

type LeftPanelTab = "basics" | "content" | "ats" | "settings";

const STORAGE_KEY = "lifehacktoolbox_resume_builder_v1";

const CAREER_TRACK_PRESETS: CareerTrackPreset[] = [
  {
    id: "software-engineer",
    label: "Software Engineer / Developer",
    description: "Emphasizes projects, impact, and technical skills.",
    defaultSectionOrder: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education"
    ],
    suggestedSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "APIs",
      "Unit testing"
    ]
  },
  {
    id: "product-manager",
    label: "Product Manager",
    description: "Focuses on outcomes, stakeholder alignment, and delivery.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "projects",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education"
    ],
    suggestedSkills: [
      "Roadmap planning",
      "User research",
      "Stakeholder management",
      "A/B testing",
      "Analytics"
    ]
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    description: "Highlights tools, metrics, and analytical impact.",
    defaultSectionOrder: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education"
    ],
    suggestedSkills: [
      "SQL",
      "Python",
      "Dashboards",
      "A/B testing",
      "Data visualization"
    ]
  },
  {
    id: "healthcare-nurse",
    label: "Healthcare / Nurse",
    description: "Emphasizes patient care, certifications, and experience.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "certifications",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "certifications",
      "education"
    ],
    suggestedSkills: [
      "Patient care",
      "Care coordination",
      "Electronic health records",
      "Medication administration"
    ]
  },
  {
    id: "retail-hospitality",
    label: "Retail / Hospitality",
    description: "Focuses on customer service and operational reliability.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "awards",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "education"
    ],
    suggestedSkills: [
      "Customer service",
      "Cash handling",
      "Shift leadership",
      "Point of sale",
      "Conflict resolution"
    ]
  },
  {
    id: "operations-logistics",
    label: "Operations / Logistics",
    description: "Highlights reliability, throughput, and process improvement.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "projects",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "education"
    ],
    suggestedSkills: [
      "Process improvement",
      "Scheduling",
      "Supply chain",
      "Inventory management"
    ]
  },
  {
    id: "marketing-creative",
    label: "Marketing / Creative",
    description: "Shows campaigns, content, and measurable impact.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "projects",
      "skills",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "projects",
      "skills",
      "education"
    ],
    suggestedSkills: [
      "Content strategy",
      "SEO",
      "Campaign planning",
      "Copywriting",
      "Analytics"
    ]
  },
  {
    id: "sales",
    label: "Sales",
    description: "Centers on quota attainment and relationship building.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "awards",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "education",
      "awards"
    ],
    suggestedSkills: [
      "Prospecting",
      "Pipeline management",
      "CRM",
      "Negotiation",
      "Account management"
    ]
  },
  {
    id: "student-entry",
    label: "Student / Entry-Level",
    description: "Puts education, projects, and potential up front.",
    defaultSectionOrder: [
      "summary",
      "education",
      "projects",
      "skills",
      "experience"
    ],
    defaultEnabledSections: [
      "summary",
      "education",
      "projects",
      "skills",
      "experience"
    ],
    suggestedSkills: [
      "Team projects",
      "Research",
      "Presentations",
      "Time management"
    ]
  },
  {
    id: "customer-support",
    label: "Customer Support",
    description: "Highlights responsiveness, empathy, and systems used.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "education",
      "awards"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "education"
    ],
    suggestedSkills: [
      "Ticketing systems",
      "Customer communication",
      "Troubleshooting",
      "Knowledge base writing"
    ]
  },
  {
    id: "skilled-trades",
    label: "Skilled Trades",
    description: "Emphasizes certifications, safety, and hands-on work.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "certifications",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "certifications",
      "education"
    ],
    suggestedSkills: [
      "Safety compliance",
      "Equipment operation",
      "Project coordination",
      "Troubleshooting"
    ]
  },
  {
    id: "management-leadership",
    label: "Management / Leadership",
    description: "Showcases team leadership and business outcomes.",
    defaultSectionOrder: [
      "summary",
      "experience",
      "skills",
      "awards",
      "education"
    ],
    defaultEnabledSections: [
      "summary",
      "experience",
      "skills",
      "education",
      "awards"
    ],
    suggestedSkills: [
      "People management",
      "Goal setting",
      "Budget ownership",
      "Cross-functional leadership"
    ]
  }
];

const EXPERIENCE_LEVEL_PRESETS: ExperienceLevelPreset[] = [
  {
    id: "entry",
    label: "Entry-Level",
    description: "Limited experience, emphasize education and projects."
  },
  {
    id: "mid",
    label: "Mid-Level",
    description: "Several years of experience, balanced resume."
  },
  {
    id: "senior",
    label: "Senior",
    description: "Deep experience and ownership of outcomes."
  },
  {
    id: "executive",
    label: "Executive",
    description: "Leadership, strategy, and high-level impact."
  },
  {
    id: "career-switch",
    label: "Career Switch",
    description: "Highlight transferable skills and relevant projects."
  }
];

const STYLE_TEMPLATES: StyleTemplateConfig[] = [
  {
    id: "clean-modern",
    label: "Clean modern",
    description: "Single-column layout with clear hierarchy.",
    layout: "one-column",
    headerAlign: "left",
    accent: "top-border"
  },
  {
    id: "classic",
    label: "Classic",
    description: "Traditional layout with bold section headings.",
    layout: "one-column",
    headerAlign: "center",
    accent: "none"
  },
  {
    id: "compact-tech",
    label: "Compact tech",
    description: "Dense layout suited for technical roles.",
    layout: "two-column",
    headerAlign: "left",
    accent: "left-border"
  },
  {
    id: "two-column",
    label: "Two-column",
    description: "Skills in a narrow column, experience in the main column.",
    layout: "two-column",
    headerAlign: "left",
    accent: "none"
  },
  {
    id: "bold-header",
    label: "Bold header",
    description: "Strong header bar with centered contact info.",
    layout: "one-column",
    headerAlign: "center",
    accent: "top-border"
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Plain text feel with subtle typographic structure.",
    layout: "one-column",
    headerAlign: "left",
    accent: "none"
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Experience is visually emphasized over other sections.",
    layout: "one-column",
    headerAlign: "left",
    accent: "left-border"
  },
  {
    id: "creative-lite",
    label: "Creative lite",
    description: "Subtle styling while remaining ATS-friendly.",
    layout: "two-column",
    headerAlign: "center",
    accent: "top-border"
  },
  {
    id: "formal",
    label: "Formal",
    description: "Conservative layout suitable for formal industries.",
    layout: "one-column",
    headerAlign: "center",
    accent: "none"
  },
  {
    id: "dense-experience",
    label: "Dense experience",
    description: "Packs a long work history into a single page.",
    layout: "one-column",
    headerAlign: "left",
    accent: "none"
  }
];

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const baseEnabledSections: Record<ResumeSectionId, boolean> = {
  summary: true,
  skills: true,
  experience: true,
  education: true,
  projects: true,
  certifications: false,
  awards: false,
  volunteer: false,
  additional: false
};

const createDefaultResumeData = (): ResumeData => {
  const defaultTrack = CAREER_TRACK_PRESETS[0];
  const enabled: Record<ResumeSectionId, boolean> = { ...baseEnabledSections };
  defaultTrack.defaultEnabledSections.forEach((section) => {
    enabled[section] = true;
  });
  return {
    careerTrack: defaultTrack.id,
    experienceLevel: "mid",
    styleTemplateId: "clean-modern",
    contact: {
      fullName: "",
      jobTitle: "",
      cityState: "",
      phone: "",
      email: "",
      websiteOrPortfolio: "",
      linkedin: ""
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    awards: [],
    volunteer: [],
    additional: [],
    enabledSections: enabled,
    targetRoleTitle: "",
    targetJobDescription: ""
  };
};

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const slugify = (value: string) => {
  const trimmed = value.toLowerCase().trim();
  if (!trimmed) {
    return "resume";
  }
  return trimmed
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "resume";
};

const collectResumeText = (data: ResumeData) => {
  const parts: string[] = [];
  parts.push(
    data.contact.fullName,
    data.contact.jobTitle,
    data.contact.cityState,
    data.summary
  );
  data.skills.forEach((skill) => {
    parts.push(skill);
  });
  data.experience.forEach((item) => {
    parts.push(
      item.jobTitle,
      item.company,
      item.location,
      item.startDate,
      item.endDate
    );
    item.bullets.forEach((bullet) => {
      parts.push(bullet);
    });
  });
  data.education.forEach((item) => {
    parts.push(
      item.school,
      item.degree,
      item.fieldOfStudy,
      item.location,
      item.details
    );
  });
  data.projects.forEach((item) => {
    parts.push(item.name, item.link, item.description);
    item.bullets.forEach((bullet) => {
      parts.push(bullet);
    });
  });
  data.certifications.forEach((item) => {
    parts.push(item.name, item.issuer, item.date);
  });
  data.awards.forEach((item) => {
    parts.push(item.name, item.issuer, item.date, item.description);
  });
  data.volunteer.forEach((item) => {
    parts.push(
      item.organization,
      item.role,
      item.location,
      item.startDate,
      item.endDate
    );
    item.bullets.forEach((bullet) => {
      parts.push(bullet);
    });
  });
  data.additional.forEach((item) => {
    parts.push(item.label, item.content);
  });
  return parts.join(" ");
};

const STOPWORDS = new Set([
  "and",
  "the",
  "with",
  "that",
  "this",
  "from",
  "into",
  "your",
  "have",
  "will",
  "above",
  "such",
  "about",
  "more",
  "make",
  "made",
  "their",
  "them",
  "they",
  "over",
  "also"
]);

const extractKeywords = (jobDescription: string) => {
  const text = jobDescription.toLowerCase();
  const tokens = text.split(/[^a-z0-9+.#]+/);
  const counts = new Map<string, number>();
  tokens.forEach((token) => {
    const clean = token.trim();
    if (!clean) {
      return;
    }
    if (clean.length < 4) {
      return;
    }
    if (STOPWORDS.has(clean)) {
      return;
    }
    const current = counts.get(clean) ?? 0;
    counts.set(clean, current + 1);
  });
  const entries = Array.from(counts.entries());
  entries.sort((first, second) => second[1] - first[1]);
  const top = entries.slice(0, 30).map(([token]) => token);
  return top;
};

const computeAtsSummary = (data: ResumeData): AtsSummary => {
  const hasSummary = data.enabledSections.summary && data.summary.trim().length > 0;
  const hasSkills = data.enabledSections.skills && data.skills.length >= 3;
  const hasExperience =
    data.enabledSections.experience && data.experience.length > 0;
  const hasEducation =
    data.enabledSections.education && data.education.length > 0;

  let structureScore: AtsSummary["structureScore"] = "good";
  if (!hasSummary || !hasSkills || (!hasExperience && !hasEducation)) {
    structureScore = "fair";
  }
  if (!hasSummary && !hasSkills && !hasExperience && !hasEducation) {
    structureScore = "poor";
  }

  const targetKeywords =
    data.targetJobDescription.trim().length > 0
      ? extractKeywords(data.targetJobDescription)
      : [];
  const resumeText = collectResumeText(data).toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];
  targetKeywords.forEach((keyword) => {
    if (resumeText.includes(keyword)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const coverage =
    targetKeywords.length === 0 ? 1 : found.length / targetKeywords.length;
  let keywordScore: AtsSummary["keywordScore"] = "low";
  if (coverage >= 0.7) {
    keywordScore = "high";
  } else if (coverage >= 0.4) {
    keywordScore = "medium";
  }

  const suggestions: string[] = [];
  if (!data.targetRoleTitle.trim()) {
    suggestions.push(
      "Add a target role title so your summary can align clearly with the job you want."
    );
  }
  if (!hasSummary) {
    suggestions.push(
      "Write a short professional summary that mentions your target role and 2–3 key strengths."
    );
  }
  if (!hasSkills) {
    suggestions.push(
      "Add at least a handful of concrete skills to your skills section, such as tools, technologies, or domains."
    );
  }
  if (!hasExperience && !hasEducation) {
    suggestions.push(
      "Include at least one experience or education entry so recruiters can see your background."
    );
  }
  const hasNumbers = data.experience.some((item) =>
    item.bullets.some((bullet) => /\d/.test(bullet))
  );
  if (!hasNumbers) {
    suggestions.push(
      "Add numbers to some bullet points to show impact, like percentages, revenue, or time saved."
    );
  }
  if (missing.length > 0) {
    suggestions.push(
      `Consider naturally including some of these terms from the job description where they honestly apply: ${missing
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  return {
    structureScore,
    keywordScore,
    foundKeywords: found,
    missingKeywords: missing,
    suggestions
  };
};

type ResumePreviewProps = {
  data: ResumeData;
};

const sectionHeadingClassName =
  "text-xs font-semibold tracking-wide text-slate-900 uppercase";

const ResumePreview = ({ data }: ResumePreviewProps) => {
  const template =
    STYLE_TEMPLATES.find(
      (entry) => entry.id === data.styleTemplateId
    ) ?? STYLE_TEMPLATES[0];

  const careerPreset =
    CAREER_TRACK_PRESETS.find(
      (entry) => entry.id === data.careerTrack
    ) ?? CAREER_TRACK_PRESETS[0];

  const orderedSections = careerPreset.defaultSectionOrder.filter(
    (section) => data.enabledSections[section]
  );

  const headerAlignClass =
    template.headerAlign === "center" ? "items-center text-center" : "items-start text-left";

  const headerBorderClass =
    template.accent === "top-border"
      ? "border-b border-slate-300 pb-3 mb-3"
      : template.accent === "left-border"
      ? "pl-3 border-l-4 border-slate-300 mb-3"
      : "mb-3";

  const renderSummary = () => {
    if (!data.enabledSections.summary || !data.summary.trim()) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Summary</h2>
        <p className="text-xs leading-relaxed text-slate-800">
          {data.summary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!data.enabledSections.skills || data.skills.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Skills</h2>
        <p className="text-xs leading-relaxed text-slate-800">
          {data.skills.join(" · ")}
        </p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!data.enabledSections.experience || data.experience.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Experience</h2>
        <div className="space-y-2">
          {data.experience.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-xs font-semibold text-slate-900">
                  {item.jobTitle}
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.startDate} – {item.endDate}
                </p>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-[11px] text-slate-700">
                  {item.company}
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.location}
                </p>
              </div>
              {item.bullets.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-800">
                  {item.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!data.enabledSections.education || data.education.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Education</h2>
        <div className="space-y-2">
          {data.education.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-xs font-semibold text-slate-900">
                  {item.degree}
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.startDate} – {item.endDate}
                </p>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-[11px] text-slate-700">
                  {item.school}
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.location}
                </p>
              </div>
              {item.fieldOfStudy && (
                <p className="text-[11px] text-slate-800">
                  {item.fieldOfStudy}
                </p>
              )}
              {item.details && (
                <p className="text-[11px] text-slate-800">
                  {item.details}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!data.enabledSections.projects || data.projects.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Projects</h2>
        <div className="space-y-2">
          {data.projects.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-xs font-semibold text-slate-900">
                  {item.name}
                </p>
                {item.link && (
                  <p className="text-[10px] text-slate-600">
                    {item.link}
                  </p>
                )}
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-800">
                  {item.description}
                </p>
              )}
              {item.bullets.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-800">
                  {item.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (
      !data.enabledSections.certifications ||
      data.certifications.length === 0
    ) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Certifications</h2>
        <ul className="space-y-0.5 text-[11px] text-slate-800">
          {data.certifications.map((item) => (
            <li key={item.id}>
              <span className="font-semibold">{item.name}</span>
              {item.issuer ? `, ${item.issuer}` : ""}
              {item.date ? ` (${item.date})` : ""}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderAwards = () => {
    if (!data.enabledSections.awards || data.awards.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Awards</h2>
        <ul className="space-y-0.5 text-[11px] text-slate-800">
          {data.awards.map((item) => (
            <li key={item.id}>
              <span className="font-semibold">{item.name}</span>
              {item.issuer ? `, ${item.issuer}` : ""}
              {item.date ? ` (${item.date})` : ""}
              {item.description ? ` – ${item.description}` : ""}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderVolunteer = () => {
    if (!data.enabledSections.volunteer || data.volunteer.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Volunteer</h2>
        <div className="space-y-2">
          {data.volunteer.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-xs font-semibold text-slate-900">
                  {item.role}
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.startDate} – {item.endDate}
                </p>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-[11px] text-slate-700">
                  {item.organization}
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.location}
                </p>
              </div>
              {item.bullets.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-800">
                  {item.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderAdditional = () => {
    if (!data.enabledSections.additional || data.additional.length === 0) {
      return null;
    }
    return (
      <section className="space-y-1">
        <h2 className={sectionHeadingClassName}>Additional</h2>
        <div className="space-y-0.5 text-[11px] text-slate-800">
          {data.additional.map((item) => (
            <p key={item.id}>
              <span className="font-semibold">{item.label}:</span>{" "}
              {item.content}
            </p>
          ))}
        </div>
      </section>
    );
  };

  const renderSection = (section: ResumeSectionId) => {
    if (section === "summary") {
      return renderSummary();
    }
    if (section === "skills") {
      return renderSkills();
    }
    if (section === "experience") {
      return renderExperience();
    }
    if (section === "education") {
      return renderEducation();
    }
    if (section === "projects") {
      return renderProjects();
    }
    if (section === "certifications") {
      return renderCertifications();
    }
    if (section === "awards") {
      return renderAwards();
    }
    if (section === "volunteer") {
      return renderVolunteer();
    }
    if (section === "additional") {
      return renderAdditional();
    }
    return null;
  };

  const mainSections = orderedSections;

  const rightColumnSections: ResumeSectionId[] = [];
  const leftColumnSections: ResumeSectionId[] = [];

  if (template.layout === "two-column") {
    mainSections.forEach((section) => {
      if (section === "skills" || section === "additional" || section === "certifications" || section === "awards") {
        rightColumnSections.push(section);
      } else {
        leftColumnSections.push(section);
      }
    });
  }

  return (
    <div className="mx-auto h-full max-w-[800px] rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-sm print:border-0 print:p-8">
      <header className={`${headerBorderClass} flex flex-col gap-1 ${headerAlignClass}`}>
        <h1 className="text-xl font-semibold tracking-tight">
          {data.contact.fullName || "Your Name"}
        </h1>
        <p className="text-xs text-slate-700">
          {data.contact.jobTitle || "Target role or headline"}
        </p>
        <p className="text-[11px] text-slate-600">
          {[data.contact.cityState, data.contact.phone, data.contact.email]
            .filter((value) => value && value.trim().length > 0)
            .join(" · ")}
        </p>
        <p className="text-[11px] text-slate-600">
          {[data.contact.websiteOrPortfolio, data.contact.linkedin]
            .filter((value) => value && value.trim().length > 0)
            .join(" · ")}
        </p>
      </header>
      {template.layout === "two-column" ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
          <div className="space-y-3">
            {leftColumnSections.map((section) => (
              <div key={section}>{renderSection(section)}</div>
            ))}
          </div>
          <div className="space-y-3">
            {rightColumnSections.map((section) => (
              <div key={section}>{renderSection(section)}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {mainSections.map((section) => (
            <div key={section}>{renderSection(section)}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const ResumeBuilder = () => {
  const [data, setData] = useState<ResumeData | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftPanelTab>("basics");
  const [skillsInput, setSkillsInput] = useState("");
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ResumeData;
      setData(parsed);
      setSkillsInput(parsed.skills.join(", "));
    } else {
      const initial = createDefaultResumeData();
      setData(initial);
      setSkillsInput("");
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !data) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [data, hasHydrated]);

  const updateData = <Key extends keyof ResumeData>(
    key: Key,
    value: ResumeData[Key]
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        [key]: value
      };
    });
  };

  const handleContactChange = <Key extends keyof ResumeContactInfo>(
    key: Key,
    value: ResumeContactInfo[Key]
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        contact: {
          ...previous.contact,
          [key]: value
        }
      };
    });
  };

  const handleCareerTrackChange = (careerTrack: CareerTrack) => {
    const preset =
      CAREER_TRACK_PRESETS.find((entry) => entry.id === careerTrack) ??
      CAREER_TRACK_PRESETS[0];
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      const enabled: Record<ResumeSectionId, boolean> = {
        ...baseEnabledSections
      };
      preset.defaultEnabledSections.forEach((section) => {
        enabled[section] = true;
      });
      const mergedSkills =
        previous.skills.length > 0
          ? previous.skills
          : preset.suggestedSkills;
      setSkillsInput(mergedSkills.join(", "));
      return {
        ...previous,
        careerTrack,
        enabledSections: enabled,
        skills: mergedSkills
      };
    });
  };

  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        experienceLevel: level
      };
    });
  };

  const handleStyleTemplateChange = (id: StyleTemplateId) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        styleTemplateId: id
      };
    });
  };

  const handleSkillsBlur = () => {
    const raw = skillsInput.split(/[,;\n]/);
    const skills = raw
      .map((entry) => normalizeWhitespace(entry))
      .filter((entry) => entry.length > 0);
    updateData("skills", skills);
  };

  const handleToggleSection = (section: ResumeSectionId) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        enabledSections: {
          ...previous.enabledSections,
          [section]: !previous.enabledSections[section]
        }
      };
    });
  };

  const addExperienceItem = () => {
    const item: ResumeExperienceItem = {
      id: createId(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: []
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        experience: [...previous.experience, item]
      };
    });
  };

  const updateExperienceItem = (
    id: string,
    updater: (item: ResumeExperienceItem) => ResumeExperienceItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        experience: previous.experience.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeExperienceItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        experience: previous.experience.filter((item) => item.id !== id)
      };
    });
  };

  const handleExperienceBulletsChange = (id: string, value: string) => {
    const raw = value.split("\n");
    const bullets = raw
      .map((entry) => normalizeWhitespace(entry))
      .filter((entry) => entry.length > 0);
    updateExperienceItem(id, (item) => ({
      ...item,
      bullets
    }));
  };

  const addEducationItem = () => {
    const item: ResumeEducationItem = {
      id: createId(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      details: ""
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        education: [...previous.education, item]
      };
    });
  };

  const updateEducationItem = (
    id: string,
    updater: (item: ResumeEducationItem) => ResumeEducationItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        education: previous.education.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeEducationItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        education: previous.education.filter((item) => item.id !== id)
      };
    });
  };

  const addProjectItem = () => {
    const item: ResumeProjectItem = {
      id: createId(),
      name: "",
      link: "",
      description: "",
      bullets: []
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        projects: [...previous.projects, item]
      };
    });
  };

  const updateProjectItem = (
    id: string,
    updater: (item: ResumeProjectItem) => ResumeProjectItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        projects: previous.projects.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeProjectItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        projects: previous.projects.filter((item) => item.id !== id)
      };
    });
  };

  const handleProjectBulletsChange = (id: string, value: string) => {
    const raw = value.split("\n");
    const bullets = raw
      .map((entry) => normalizeWhitespace(entry))
      .filter((entry) => entry.length > 0);
    updateProjectItem(id, (item) => ({
      ...item,
      bullets
    }));
  };

  const addCertificationItem = () => {
    const item: ResumeCertificationItem = {
      id: createId(),
      name: "",
      issuer: "",
      date: ""
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        certifications: [...previous.certifications, item]
      };
    });
  };

  const updateCertificationItem = (
    id: string,
    updater: (item: ResumeCertificationItem) => ResumeCertificationItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        certifications: previous.certifications.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeCertificationItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        certifications: previous.certifications.filter(
          (item) => item.id !== id
        )
      };
    });
  };

  const addAwardItem = () => {
    const item: ResumeAwardItem = {
      id: createId(),
      name: "",
      issuer: "",
      date: "",
      description: ""
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        awards: [...previous.awards, item]
      };
    });
  };

  const updateAwardItem = (
    id: string,
    updater: (item: ResumeAwardItem) => ResumeAwardItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        awards: previous.awards.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeAwardItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        awards: previous.awards.filter((item) => item.id !== id)
      };
    });
  };

  const addVolunteerItem = () => {
    const item: ResumeVolunteerItem = {
      id: createId(),
      organization: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: []
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        volunteer: [...previous.volunteer, item]
      };
    });
  };

  const updateVolunteerItem = (
    id: string,
    updater: (item: ResumeVolunteerItem) => ResumeVolunteerItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        volunteer: previous.volunteer.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeVolunteerItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        volunteer: previous.volunteer.filter((item) => item.id !== id)
      };
    });
  };

  const handleVolunteerBulletsChange = (id: string, value: string) => {
    const raw = value.split("\n");
    const bullets = raw
      .map((entry) => normalizeWhitespace(entry))
      .filter((entry) => entry.length > 0);
    updateVolunteerItem(id, (item) => ({
      ...item,
      bullets
    }));
  };

  const addAdditionalItem = () => {
    const item: ResumeAdditionalItem = {
      id: createId(),
      label: "",
      content: ""
    };
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        additional: [...previous.additional, item]
      };
    });
  };

  const updateAdditionalItem = (
    id: string,
    updater: (item: ResumeAdditionalItem) => ResumeAdditionalItem
  ) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        additional: previous.additional.map((item) =>
          item.id === id ? updater(item) : item
        )
      };
    });
  };

  const removeAdditionalItem = (id: string) => {
    setData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        additional: previous.additional.filter((item) => item.id !== id)
      };
    });
  };

  const atsSummary = useMemo(
    () => (data ? computeAtsSummary(data) : null),
    [data]
  );

  const handleReset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    const initial = createDefaultResumeData();
    setData(initial);
    setSkillsInput("");
  };

  const handleDownloadJson = () => {
    if (!data) {
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lifehacktoolbox-resume-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string") {
        return;
      }
      const parsed = JSON.parse(result) as ResumeData;
      setData(parsed);
      setSkillsInput(parsed.skills.join(", "));
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleDownloadPdf = async () => {
    if (typeof window === "undefined") {
      return;
    }
    if (!data) {
      return;
    }
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    let { width: pageWidth, height: pageHeight } = page.getSize();
    const marginX = 56;
    const marginTop = 64;
    const marginBottom = 56;
    let cursorY = pageHeight - marginTop;

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const nameFontSize = 16;
    const headingFontSize = 12;
    const bodyFontSize = 10.5;
    const bodyLineHeight = bodyFontSize * 1.4;

    const maxLineWidth = pageWidth - marginX * 2;

    const wrapText = (text: string, maxWidth: number, font: typeof fontRegular, size: number) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = "";
      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        const width = font.widthOfTextAtSize(candidate, size);
        if (width <= maxWidth) {
          current = candidate;
        } else {
          if (current) {
            lines.push(current);
          }
          current = word;
        }
      });
      if (current) {
        lines.push(current);
      }
      if (lines.length === 0) {
        lines.push("");
      }
      return lines;
    };

    const ensureSpace = (linesNeeded: number, lineHeight: number) => {
      if (cursorY - linesNeeded * lineHeight < marginBottom) {
        page = pdfDoc.addPage();
        const size = page.getSize();
        pageWidth = size.width;
        pageHeight = size.height;
        cursorY = pageHeight - marginTop;
      }
    };

    const drawWrappedParagraph = (
      text: string,
      font: typeof fontRegular,
      size: number,
      lineHeight: number
    ) => {
      const lines = wrapText(text, maxLineWidth, font, size);
      ensureSpace(lines.length, lineHeight);
      lines.forEach((line) => {
        page.drawText(line, {
          x: marginX,
          y: cursorY,
          size,
          font
        });
        cursorY -= lineHeight;
      });
      return lines.length;
    };

    const content = buildPlainText(data);
    const allLines = content.split("\n");

    allLines.forEach((line, index) => {
      if (index === 0) {
        const name = line.trim();
        if (name.length === 0) {
          return;
        }
        ensureSpace(2, nameFontSize * 1.5);
        const nameWidth = fontBold.widthOfTextAtSize(name, nameFontSize);
        const nameX = marginX + (maxLineWidth - nameWidth) / 2;
        page.drawText(name, {
          x: nameX,
          y: cursorY,
          size: nameFontSize,
          font: fontBold
        });
        cursorY -= nameFontSize * 1.8;
        return;
      }

      if (line.trim().length === 0) {
        cursorY -= bodyLineHeight * 0.8;
        return;
      }

      const isHeading =
        line.toUpperCase() === line &&
        line.length <= 24 &&
        !line.startsWith("-") &&
        !line.startsWith(" ");

      if (isHeading) {
        ensureSpace(1, headingFontSize * 1.8);
        page.drawText(line, {
          x: marginX,
          y: cursorY,
          size: headingFontSize,
          font: fontBold
        });
        cursorY -= headingFontSize * 1.8;
        return;
      }

      if (line.startsWith("- ")) {
        const bulletText = line.slice(2);
        const bulletLines = wrapText(
          bulletText,
          maxLineWidth - 12,
          fontRegular,
          bodyFontSize
        );
        ensureSpace(bulletLines.length, bodyLineHeight);
        bulletLines.forEach((wrapped, indexInBullet) => {
          const prefix = indexInBullet === 0 ? "• " : "  ";
          page.drawText(prefix + wrapped, {
            x: marginX,
            y: cursorY,
            size: bodyFontSize,
            font: fontRegular
          });
          cursorY -= bodyLineHeight;
        });
        return;
      }

      drawWrappedParagraph(line, fontRegular, bodyFontSize, bodyLineHeight);
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], {
      type: "application/pdf"
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    const slug = slugify(data.contact.fullName || "resume");
    link.href = url;
    link.download = `${slug}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMessage("PDF downloaded.");
    window.setTimeout(() => {
      setExportMessage(null);
    }, 2000);
  };

  const buildDocxDocument = (resume: ResumeData) => {
    const paragraphs: Paragraph[] = [];

    const fullName = resume.contact.fullName || "Your Name";
    paragraphs.push(
      new Paragraph({
        text: fullName,
        heading: HeadingLevel.HEADING_1
      })
    );

    const contactParts: string[] = [];
    if (resume.contact.jobTitle) {
      contactParts.push(resume.contact.jobTitle);
    }
    if (resume.contact.cityState) {
      contactParts.push(resume.contact.cityState);
    }
    if (resume.contact.phone) {
      contactParts.push(resume.contact.phone);
    }
    if (resume.contact.email) {
      contactParts.push(resume.contact.email);
    }
    if (resume.contact.websiteOrPortfolio) {
      contactParts.push(resume.contact.websiteOrPortfolio);
    }
    if (resume.contact.linkedin) {
      contactParts.push(resume.contact.linkedin);
    }
    if (contactParts.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: contactParts.join(" | ")
        })
      );
    }

    if (resume.enabledSections.summary && resume.summary.trim().length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Summary",
          heading: HeadingLevel.HEADING_2
        })
      );
      paragraphs.push(
        new Paragraph({
          text: resume.summary
        })
      );
    }

    if (resume.enabledSections.skills && resume.skills.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Skills",
          heading: HeadingLevel.HEADING_2
        })
      );
      paragraphs.push(
        new Paragraph({
          text: resume.skills.join(", ")
        })
      );
    }

    if (resume.enabledSections.experience && resume.experience.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Experience",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.experience.forEach((item) => {
        const lineParts: string[] = [];
        if (item.jobTitle) {
          lineParts.push(item.jobTitle);
        }
        if (item.company) {
          lineParts.push(item.company);
        }
        if (item.location) {
          lineParts.push(item.location);
        }
        if (item.startDate || item.endDate) {
          const dates = `${item.startDate || ""} – ${
            item.endDate || ""
          }`;
          lineParts.push(dates.trim());
        }
        if (lineParts.length > 0) {
          paragraphs.push(
            new Paragraph({
              text: lineParts.join(" | "),
              spacing: {
                before: 120
              }
            })
          );
        }
        item.bullets.forEach((bullet) => {
          paragraphs.push(
            new Paragraph({
              text: bullet,
              bullet: {
                level: 0
              }
            })
          );
        });
      });
    }

    if (resume.enabledSections.education && resume.education.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.education.forEach((item) => {
        const lineParts: string[] = [];
        if (item.degree) {
          lineParts.push(item.degree);
        }
        if (item.fieldOfStudy) {
          lineParts.push(item.fieldOfStudy);
        }
        if (item.school) {
          lineParts.push(item.school);
        }
        if (item.location) {
          lineParts.push(item.location);
        }
        if (item.startDate || item.endDate) {
          const dates = `${item.startDate || ""} – ${
            item.endDate || ""
          }`;
          lineParts.push(dates.trim());
        }
        if (lineParts.length > 0) {
          paragraphs.push(
            new Paragraph({
              text: lineParts.join(" | "),
              spacing: {
                before: 120
              }
            })
          );
        }
        if (item.details) {
          paragraphs.push(
            new Paragraph({
              text: item.details
            })
          );
        }
      });
    }

    if (resume.enabledSections.projects && resume.projects.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Projects",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.projects.forEach((item) => {
        const lineParts: string[] = [];
        if (item.name) {
          lineParts.push(item.name);
        }
        if (item.link) {
          lineParts.push(item.link);
        }
        if (lineParts.length > 0) {
          paragraphs.push(
            new Paragraph({
              text: lineParts.join(" | "),
              spacing: {
                before: 120
              }
            })
          );
        }
        if (item.description) {
          paragraphs.push(
            new Paragraph({
              text: item.description
            })
          );
        }
        item.bullets.forEach((bullet) => {
          paragraphs.push(
            new Paragraph({
              text: bullet,
              bullet: {
                level: 0
              }
            })
          );
        });
      });
    }

    if (
      resume.enabledSections.certifications &&
      resume.certifications.length > 0
    ) {
      paragraphs.push(
        new Paragraph({
          text: "Certifications",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.certifications.forEach((item) => {
        const parts: string[] = [];
        if (item.name) {
          parts.push(item.name);
        }
        if (item.issuer) {
          parts.push(item.issuer);
        }
        if (item.date) {
          parts.push(item.date);
        }
        if (parts.length > 0) {
          paragraphs.push(
            new Paragraph({
              text: parts.join(" | ")
            })
          );
        }
      });
    }

    if (resume.enabledSections.awards && resume.awards.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Awards",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.awards.forEach((item) => {
        const parts: string[] = [];
        if (item.name) {
          parts.push(item.name);
        }
        if (item.issuer) {
          parts.push(item.issuer);
        }
        if (item.date) {
          parts.push(item.date);
        }
        if (parts.length > 0) {
          const textRuns: TextRun[] = [
            new TextRun({
              text: parts.join(" | "),
              bold: false
            })
          ];
          if (item.description) {
            textRuns.push(
              new TextRun({
                text: ` – ${item.description}`,
                bold: false
              })
            );
          }
          paragraphs.push(
            new Paragraph({
              children: textRuns
            })
          );
        }
      });
    }

    if (resume.enabledSections.volunteer && resume.volunteer.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Volunteer",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.volunteer.forEach((item) => {
        const lineParts: string[] = [];
        if (item.role) {
          lineParts.push(item.role);
        }
        if (item.organization) {
          lineParts.push(item.organization);
        }
        if (item.location) {
          lineParts.push(item.location);
        }
        if (item.startDate || item.endDate) {
          const dates = `${item.startDate || ""} – ${
            item.endDate || ""
          }`;
          lineParts.push(dates.trim());
        }
        if (lineParts.length > 0) {
          paragraphs.push(
            new Paragraph({
              text: lineParts.join(" | "),
              spacing: {
                before: 120
              }
            })
          );
        }
        item.bullets.forEach((bullet) => {
          paragraphs.push(
            new Paragraph({
              text: bullet,
              bullet: {
                level: 0
              }
            })
          );
        });
      });
    }

    if (resume.enabledSections.additional && resume.additional.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: "Additional",
          heading: HeadingLevel.HEADING_2
        })
      );
      resume.additional.forEach((item) => {
        paragraphs.push(
          new Paragraph({
            text: `${item.label}: ${item.content}`
          })
        );
      });
    }

    return new Document({
      sections: [
        {
          children: paragraphs
        }
      ]
    });
  };

  const handleDownloadDocx = () => {
    if (!data) {
      return;
    }
    const docxDocument = buildDocxDocument(data);
    Packer.toBlob(docxDocument).then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      const slug = slugify(data.contact.fullName || "resume");
      link.href = url;
      link.download = `${slug}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMessage("DOCX downloaded.");
      window.setTimeout(() => {
        setExportMessage(null);
      }, 2000);
    });
  };

  const buildPlainText = (resume: ResumeData) => {
    const lines: string[] = [];
    const fullName = resume.contact.fullName || "Your Name";
    lines.push(fullName.toUpperCase());
    const contactParts: string[] = [];
    if (resume.contact.jobTitle) {
      contactParts.push(resume.contact.jobTitle);
    }
    if (resume.contact.cityState) {
      contactParts.push(resume.contact.cityState);
    }
    if (resume.contact.phone) {
      contactParts.push(resume.contact.phone);
    }
    if (resume.contact.email) {
      contactParts.push(resume.contact.email);
    }
    if (resume.contact.websiteOrPortfolio) {
      contactParts.push(resume.contact.websiteOrPortfolio);
    }
    if (resume.contact.linkedin) {
      contactParts.push(resume.contact.linkedin);
    }
    if (contactParts.length > 0) {
      lines.push(contactParts.join(" | "));
    }
    lines.push("");

    if (resume.enabledSections.summary && resume.summary.trim().length > 0) {
      lines.push("SUMMARY");
      lines.push(resume.summary);
      lines.push("");
    }

    if (resume.enabledSections.skills && resume.skills.length > 0) {
      lines.push("SKILLS");
      lines.push(resume.skills.join(", "));
      lines.push("");
    }

    if (resume.enabledSections.experience && resume.experience.length > 0) {
      lines.push("EXPERIENCE");
      resume.experience.forEach((item) => {
        const header: string[] = [];
        if (item.jobTitle) {
          header.push(item.jobTitle);
        }
        if (item.company) {
          header.push(item.company);
        }
        if (item.location) {
          header.push(item.location);
        }
        if (header.length > 0) {
          lines.push(header.join(" | "));
        }
        if (item.startDate || item.endDate) {
          lines.push(`${item.startDate || ""} – ${item.endDate || ""}`);
        }
        item.bullets.forEach((bullet) => {
          lines.push(`- ${bullet}`);
        });
        lines.push("");
      });
    }

    if (resume.enabledSections.education && resume.education.length > 0) {
      lines.push("EDUCATION");
      resume.education.forEach((item) => {
        const header: string[] = [];
        if (item.degree) {
          header.push(item.degree);
        }
        if (item.fieldOfStudy) {
          header.push(item.fieldOfStudy);
        }
        if (item.school) {
          header.push(item.school);
        }
        if (header.length > 0) {
          lines.push(header.join(" | "));
        }
        if (item.startDate || item.endDate) {
          lines.push(`${item.startDate || ""} – ${item.endDate || ""}`);
        }
        if (item.details) {
          lines.push(item.details);
        }
        lines.push("");
      });
    }

    if (resume.enabledSections.projects && resume.projects.length > 0) {
      lines.push("PROJECTS");
      resume.projects.forEach((item) => {
        const header: string[] = [];
        if (item.name) {
          header.push(item.name);
        }
        if (item.link) {
          header.push(item.link);
        }
        if (header.length > 0) {
          lines.push(header.join(" | "));
        }
        if (item.description) {
          lines.push(item.description);
        }
        item.bullets.forEach((bullet) => {
          lines.push(`- ${bullet}`);
        });
        lines.push("");
      });
    }

    if (
      resume.enabledSections.certifications &&
      resume.certifications.length > 0
    ) {
      lines.push("CERTIFICATIONS");
      resume.certifications.forEach((item) => {
        const parts: string[] = [];
        if (item.name) {
          parts.push(item.name);
        }
        if (item.issuer) {
          parts.push(item.issuer);
        }
        if (item.date) {
          parts.push(item.date);
        }
        lines.push(parts.join(" | "));
      });
      lines.push("");
    }

    if (resume.enabledSections.awards && resume.awards.length > 0) {
      lines.push("AWARDS");
      resume.awards.forEach((item) => {
        const parts: string[] = [];
        if (item.name) {
          parts.push(item.name);
        }
        if (item.issuer) {
          parts.push(item.issuer);
        }
        if (item.date) {
          parts.push(item.date);
        }
        let line = parts.join(" | ");
        if (item.description) {
          line = `${line} – ${item.description}`;
        }
        lines.push(line);
      });
      lines.push("");
    }

    if (resume.enabledSections.volunteer && resume.volunteer.length > 0) {
      lines.push("VOLUNTEER");
      resume.volunteer.forEach((item) => {
        const header: string[] = [];
        if (item.role) {
          header.push(item.role);
        }
        if (item.organization) {
          header.push(item.organization);
        }
        if (item.location) {
          header.push(item.location);
        }
        if (header.length > 0) {
          lines.push(header.join(" | "));
        }
        if (item.startDate || item.endDate) {
          lines.push(`${item.startDate || ""} – ${item.endDate || ""}`);
        }
        item.bullets.forEach((bullet) => {
          lines.push(`- ${bullet}`);
        });
        lines.push("");
      });
    }

    if (resume.enabledSections.additional && resume.additional.length > 0) {
      lines.push("ADDITIONAL");
      resume.additional.forEach((item) => {
        lines.push(`${item.label}: ${item.content}`);
      });
      lines.push("");
    }

    return lines.join("\n");
  };

  const buildMarkdown = (resume: ResumeData) => {
    const lines: string[] = [];
    const fullName = resume.contact.fullName || "Your Name";
    lines.push(`# ${fullName}`);
    const contactParts: string[] = [];
    if (resume.contact.jobTitle) {
      contactParts.push(resume.contact.jobTitle);
    }
    if (resume.contact.cityState) {
      contactParts.push(resume.contact.cityState);
    }
    if (resume.contact.phone) {
      contactParts.push(resume.contact.phone);
    }
    if (resume.contact.email) {
      contactParts.push(resume.contact.email);
    }
    if (resume.contact.websiteOrPortfolio) {
      contactParts.push(resume.contact.websiteOrPortfolio);
    }
    if (resume.contact.linkedin) {
      contactParts.push(resume.contact.linkedin);
    }
    if (contactParts.length > 0) {
      lines.push(contactParts.join(" | "));
    }
    lines.push("");

    if (resume.enabledSections.summary && resume.summary.trim().length > 0) {
      lines.push("## Summary");
      lines.push(resume.summary);
      lines.push("");
    }

    if (resume.enabledSections.skills && resume.skills.length > 0) {
      lines.push("## Skills");
      lines.push(resume.skills.map((skill) => `- ${skill}`).join("\n"));
      lines.push("");
    }

    if (resume.enabledSections.experience && resume.experience.length > 0) {
      lines.push("## Experience");
      resume.experience.forEach((item) => {
        const headerParts: string[] = [];
        if (item.jobTitle) {
          headerParts.push(item.jobTitle);
        }
        if (item.company) {
          headerParts.push(item.company);
        }
        const header = headerParts.join(" at ");
        lines.push(`### ${header || "Experience"}`);
        const metaParts: string[] = [];
        if (item.location) {
          metaParts.push(item.location);
        }
        if (item.startDate || item.endDate) {
          metaParts.push(`${item.startDate || ""} – ${item.endDate || ""}`);
        }
        if (metaParts.length > 0) {
          lines.push(metaParts.join(" | "));
        }
        if (item.bullets.length > 0) {
          lines.push(
            item.bullets.map((bullet) => `- ${bullet}`).join("\n")
          );
        }
        lines.push("");
      });
    }

    if (resume.enabledSections.education && resume.education.length > 0) {
      lines.push("## Education");
      resume.education.forEach((item) => {
        const headerParts: string[] = [];
        if (item.degree) {
          headerParts.push(item.degree);
        }
        if (item.fieldOfStudy) {
          headerParts.push(item.fieldOfStudy);
        }
        const header = headerParts.join(" in ");
        lines.push(`### ${header || "Education"}`);
        const metaParts: string[] = [];
        if (item.school) {
          metaParts.push(item.school);
        }
        if (item.location) {
          metaParts.push(item.location);
        }
        if (item.startDate || item.endDate) {
          metaParts.push(`${item.startDate || ""} – ${item.endDate || ""}`);
        }
        if (metaParts.length > 0) {
          lines.push(metaParts.join(" | "));
        }
        if (item.details) {
          lines.push(item.details);
        }
        lines.push("");
      });
    }

    if (resume.enabledSections.projects && resume.projects.length > 0) {
      lines.push("## Projects");
      resume.projects.forEach((item) => {
        lines.push(`### ${item.name || "Project"}`);
        if (item.link) {
          lines.push(item.link);
        }
        if (item.description) {
          lines.push(item.description);
        }
        if (item.bullets.length > 0) {
          lines.push(
            item.bullets.map((bullet) => `- ${bullet}`).join("\n")
          );
        }
        lines.push("");
      });
    }

    if (
      resume.enabledSections.certifications &&
      resume.certifications.length > 0
    ) {
      lines.push("## Certifications");
      resume.certifications.forEach((item) => {
        const parts: string[] = [];
        if (item.name) {
          parts.push(item.name);
        }
        if (item.issuer) {
          parts.push(item.issuer);
        }
        if (item.date) {
          parts.push(item.date);
        }
        lines.push(`- ${parts.join(" | ")}`);
      });
      lines.push("");
    }

    if (resume.enabledSections.awards && resume.awards.length > 0) {
      lines.push("## Awards");
      resume.awards.forEach((item) => {
        const parts: string[] = [];
        if (item.name) {
          parts.push(item.name);
        }
        if (item.issuer) {
          parts.push(item.issuer);
        }
        if (item.date) {
          parts.push(item.date);
        }
        let line = parts.join(" | ");
        if (item.description) {
          line = `${line} – ${item.description}`;
        }
        lines.push(`- ${line}`);
      });
      lines.push("");
    }

    if (resume.enabledSections.volunteer && resume.volunteer.length > 0) {
      lines.push("## Volunteer");
      resume.volunteer.forEach((item) => {
        const headerParts: string[] = [];
        if (item.role) {
          headerParts.push(item.role);
        }
        if (item.organization) {
          headerParts.push(item.organization);
        }
        lines.push(`### ${headerParts.join(" at ") || "Volunteer"}`);
        const metaParts: string[] = [];
        if (item.location) {
          metaParts.push(item.location);
        }
        if (item.startDate || item.endDate) {
          metaParts.push(`${item.startDate || ""} – ${item.endDate || ""}`);
        }
        if (metaParts.length > 0) {
          lines.push(metaParts.join(" | "));
        }
        if (item.bullets.length > 0) {
          lines.push(
            item.bullets.map((bullet) => `- ${bullet}`).join("\n")
          );
        }
        lines.push("");
      });
    }

    if (resume.enabledSections.additional && resume.additional.length > 0) {
      lines.push("## Additional");
      resume.additional.forEach((item) => {
        lines.push(`- **${item.label}:** ${item.content}`);
      });
      lines.push("");
    }

    return lines.join("\n");
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!data) {
      return;
    }
    const content = buildPlainText(data);
    const slug = slugify(data.contact.fullName || "resume");
    downloadTextFile(content, `${slug}.txt`);
    setExportMessage("Plain-text resume downloaded.");
    window.setTimeout(() => {
      setExportMessage(null);
    }, 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!data) {
      return;
    }
    const content = buildMarkdown(data);
    const slug = slugify(data.contact.fullName || "resume");
    downloadTextFile(content, `${slug}.md`);
    setExportMessage("Markdown resume downloaded.");
    window.setTimeout(() => {
      setExportMessage(null);
    }, 2000);
  };

  if (!data) {
    return null;
  }

  const careerPreset =
    CAREER_TRACK_PRESETS.find(
      (entry) => entry.id === data.careerTrack
    ) ?? CAREER_TRACK_PRESETS[0];

  const inputClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-6 print:bg-white">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 print:hidden">
        <p className="font-semibold">
          Your resume stays in this browser only.
        </p>
        <p>
          Content is stored locally using browser storage. If you clear your
          cache or switch devices, your drafts may be lost. Use PDF, DOCX, TXT,
          or Markdown exports to keep your own backups.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm print:hidden">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <button
                type="button"
                onClick={() => setLeftTab("basics")}
                className={`rounded-md px-2 py-1 ${
                  leftTab === "basics"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Basics
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("content")}
                className={`rounded-md px-2 py-1 ${
                  leftTab === "content"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Content
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("ats")}
                className={`rounded-md px-2 py-1 ${
                  leftTab === "ats"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                ATS & guidance
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("settings")}
                className={`rounded-md px-2 py-1 ${
                  leftTab === "settings"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Settings
              </button>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Reset resume
            </button>
          </div>
          {leftTab === "basics" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Career track
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CAREER_TRACK_PRESETS.map((preset) => {
                    const isSelected = data.careerTrack === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleCareerTrackChange(preset.id)}
                        className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-xs shadow-sm transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="font-semibold text-slate-900">
                          {preset.label}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Experience level
                </h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {EXPERIENCE_LEVEL_PRESETS.map((preset) => {
                    const isSelected = data.experienceLevel === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          handleExperienceLevelChange(preset.id)
                        }
                        className={`rounded-md px-3 py-1.5 shadow-sm ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <span className="font-semibold">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-600">
                  {EXPERIENCE_LEVEL_PRESETS.find(
                    (entry) => entry.id === data.experienceLevel
                  )?.description ?? ""}
                </p>
              </div>
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Style template
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {STYLE_TEMPLATES.map((template) => {
                    const isSelected = data.styleTemplateId === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() =>
                          handleStyleTemplateChange(template.id)
                        }
                        className={`flex gap-3 rounded-md border px-3 py-2 text-left text-xs shadow-sm transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="mt-0.5 h-10 w-12 rounded border border-slate-200 bg-slate-50">
                          <div className="h-2 w-full bg-slate-200" />
                          <div className="mt-1 h-1 w-[80%] bg-slate-300" />
                          <div className="mt-1 h-1 w-[60%] bg-slate-300" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {template.label}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {template.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Contact information
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={data.contact.fullName}
                      onChange={(event) =>
                        handleContactChange("fullName", event.target.value)
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Headline or target role
                    </label>
                    <input
                      type="text"
                      value={data.contact.jobTitle}
                      onChange={(event) =>
                        handleContactChange("jobTitle", event.target.value)
                      }
                      className={inputClasses}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      City, state or region
                    </label>
                    <input
                      type="text"
                      value={data.contact.cityState}
                      onChange={(event) =>
                        handleContactChange("cityState", event.target.value)
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={data.contact.phone}
                      onChange={(event) =>
                        handleContactChange("phone", event.target.value)
                      }
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={data.contact.email}
                      onChange={(event) =>
                        handleContactChange("email", event.target.value)
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Website or portfolio
                    </label>
                    <input
                      type="text"
                      value={data.contact.websiteOrPortfolio}
                      onChange={(event) =>
                        handleContactChange(
                          "websiteOrPortfolio",
                          event.target.value
                        )
                      }
                      className={inputClasses}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={data.contact.linkedin}
                    onChange={(event) =>
                      handleContactChange("linkedin", event.target.value)
                    }
                    className={inputClasses}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}
          {leftTab === "content" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Summary
                </h2>
                <textarea
                  value={data.summary}
                  onChange={(event) =>
                    updateData("summary", event.target.value)
                  }
                  className={`${inputClasses} min-h-[80px]`}
                  placeholder="Two to four sentences that highlight your strengths and target role."
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Skills
                </h2>
                <textarea
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  onBlur={handleSkillsBlur}
                  className={`${inputClasses} min-h-[64px]`}
                  placeholder="Comma-separated list, for example: JavaScript, React, APIs, SQL"
                />
              </div>
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Experience
                  </h2>
                  <button
                    type="button"
                    onClick={addExperienceItem}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Add experience
                  </button>
                </div>
                <div className="space-y-3">
                  {data.experience.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">
                          {item.jobTitle || "Experience entry"}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeExperienceItem(item.id)}
                          className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Job title
                          </label>
                          <input
                            type="text"
                            value={item.jobTitle}
                            onChange={(event) =>
                              updateExperienceItem(item.id, (previous) => ({
                                ...previous,
                                jobTitle: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Company
                          </label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(event) =>
                              updateExperienceItem(item.id, (previous) => ({
                                ...previous,
                                company: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Location
                          </label>
                          <input
                            type="text"
                            value={item.location}
                            onChange={(event) =>
                              updateExperienceItem(item.id, (previous) => ({
                                ...previous,
                                location: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Start date
                            </label>
                            <input
                              type="text"
                              value={item.startDate}
                              onChange={(event) =>
                                updateExperienceItem(item.id, (previous) => ({
                                  ...previous,
                                  startDate: event.target.value
                                }))
                              }
                              className={inputClasses}
                              placeholder="Jan 2022"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              End date
                            </label>
                            <input
                              type="text"
                              value={item.endDate}
                              onChange={(event) =>
                                updateExperienceItem(item.id, (previous) => ({
                                  ...previous,
                                  endDate: event.target.value
                                }))
                              }
                              className={inputClasses}
                              placeholder="Present"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700">
                          Bullet points
                        </label>
                        <textarea
                          value={item.bullets.join("\n")}
                          onChange={(event) =>
                            handleExperienceBulletsChange(
                              item.id,
                              event.target.value
                            )
                          }
                          className={`${inputClasses} min-h-[80px]`}
                          placeholder="One bullet per line focusing on impact and results."
                        />
                      </div>
                    </div>
                  ))}
                  {data.experience.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      Add your most recent role first. Use bullet points to show
                      concrete outcomes, not just responsibilities.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Education
                  </h2>
                  <button
                    type="button"
                    onClick={addEducationItem}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Add education
                  </button>
                </div>
                <div className="space-y-3">
                  {data.education.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">
                          {item.school || "Education entry"}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeEducationItem(item.id)}
                          className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            School
                          </label>
                          <input
                            type="text"
                            value={item.school}
                            onChange={(event) =>
                              updateEducationItem(item.id, (previous) => ({
                                ...previous,
                                school: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={item.degree}
                            onChange={(event) =>
                              updateEducationItem(item.id, (previous) => ({
                                ...previous,
                                degree: event.target.value
                              }))
                            }
                            className={inputClasses}
                            placeholder="e.g. B.Sc."
                          />
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Field of study
                          </label>
                          <input
                            type="text"
                            value={item.fieldOfStudy}
                            onChange={(event) =>
                              updateEducationItem(item.id, (previous) => ({
                                ...previous,
                                fieldOfStudy: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Location
                          </label>
                          <input
                            type="text"
                            value={item.location}
                            onChange={(event) =>
                              updateEducationItem(item.id, (previous) => ({
                                ...previous,
                                location: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Start date
                          </label>
                          <input
                            type="text"
                            value={item.startDate}
                            onChange={(event) =>
                              updateEducationItem(item.id, (previous) => ({
                                ...previous,
                                startDate: event.target.value
                              }))
                            }
                            className={inputClasses}
                            placeholder="2019"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            End date
                          </label>
                          <input
                            type="text"
                            value={item.endDate}
                            onChange={(event) =>
                              updateEducationItem(item.id, (previous) => ({
                                ...previous,
                                endDate: event.target.value
                              }))
                            }
                            className={inputClasses}
                            placeholder="2023"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700">
                          Details (optional)
                        </label>
                        <textarea
                          value={item.details}
                          onChange={(event) =>
                            updateEducationItem(item.id, (previous) => ({
                              ...previous,
                              details: event.target.value
                            }))
                          }
                          className={`${inputClasses} min-h-[64px]`}
                        />
                      </div>
                    </div>
                  ))}
                  {data.education.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      Include your most relevant education. For students and
                      entry-level roles, this can be one of the first sections
                      recruiters scan.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Projects
                  </h2>
                  <button
                    type="button"
                    onClick={addProjectItem}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Add project
                  </button>
                </div>
                <div className="space-y-3">
                  {data.projects.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">
                          {item.name || "Project"}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeProjectItem(item.id)}
                          className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(event) =>
                              updateProjectItem(item.id, (previous) => ({
                                ...previous,
                                name: event.target.value
                              }))
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Link
                          </label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(event) =>
                              updateProjectItem(item.id, (previous) => ({
                                ...previous,
                                link: event.target.value
                              }))
                            }
                            className={inputClasses}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(event) =>
                            updateProjectItem(item.id, (previous) => ({
                              ...previous,
                              description: event.target.value
                            }))
                          }
                          className={`${inputClasses} min-h-[64px]`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700">
                          Bullet points
                        </label>
                        <textarea
                          value={item.bullets.join("\n")}
                          onChange={(event) =>
                            handleProjectBulletsChange(
                              item.id,
                              event.target.value
                            )
                          }
                          className={`${inputClasses} min-h-[64px]`}
                          placeholder="One bullet per line describing impact, stack, or outcomes."
                        />
                      </div>
                    </div>
                  ))}
                  {data.projects.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      Projects are especially useful for software, design, data,
                      and student resumes. Include a few with clear outcomes.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Optional sections
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={data.enabledSections.certifications}
                      onChange={() => handleToggleSection("certifications")}
                      className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                    />
                    <span>Certifications</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={data.enabledSections.awards}
                      onChange={() => handleToggleSection("awards")}
                      className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                    />
                    <span>Awards</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={data.enabledSections.volunteer}
                      onChange={() => handleToggleSection("volunteer")}
                      className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                    />
                    <span>Volunteer</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={data.enabledSections.additional}
                      onChange={() => handleToggleSection("additional")}
                      className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                    />
                    <span>Additional</span>
                  </label>
                </div>
              </div>
              {data.enabledSections.certifications && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Certifications
                    </h3>
                    <button
                      type="button"
                      onClick={addCertificationItem}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Add certification
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.certifications.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-3"
                      >
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(event) =>
                              updateCertificationItem(
                                item.id,
                                (previous) => ({
                                  ...previous,
                                  name: event.target.value
                                })
                              )
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Issuer
                          </label>
                          <input
                            type="text"
                            value={item.issuer}
                            onChange={(event) =>
                              updateCertificationItem(
                                item.id,
                                (previous) => ({
                                  ...previous,
                                  issuer: event.target.value
                                })
                              )
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Date
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.date}
                              onChange={(event) =>
                                updateCertificationItem(
                                  item.id,
                                  (previous) => ({
                                    ...previous,
                                    date: event.target.value
                                  })
                                )
                              }
                              className={inputClasses}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeCertificationItem(item.id)
                              }
                              className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.certifications.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        Licenses and certifications can be critical for
                        healthcare, trades, and some technical roles.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {data.enabledSections.awards && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Awards
                    </h3>
                    <button
                      type="button"
                      onClick={addAwardItem}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Add award
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.awards.map((item) => (
                      <div
                        key={item.id}
                        className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Name
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(event) =>
                                updateAwardItem(item.id, (previous) => ({
                                  ...previous,
                                  name: event.target.value
                                }))
                              }
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Issuer
                            </label>
                            <input
                              type="text"
                              value={item.issuer}
                              onChange={(event) =>
                                updateAwardItem(item.id, (previous) => ({
                                  ...previous,
                                  issuer: event.target.value
                                }))
                              }
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Date
                            </label>
                            <input
                              type="text"
                              value={item.date}
                              onChange={(event) =>
                                updateAwardItem(item.id, (previous) => ({
                                  ...previous,
                                  date: event.target.value
                                }))
                              }
                              className={inputClasses}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_auto]">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Description
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(event) =>
                                updateAwardItem(item.id, (previous) => ({
                                  ...previous,
                                  description: event.target.value
                                }))
                              }
                              className={`${inputClasses} min-h-[56px]`}
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeAwardItem(item.id)}
                              className="h-9 rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.awards.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        Awards can help senior and sales roles surface
                        recognition without taking over the page.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {data.enabledSections.volunteer && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Volunteer
                    </h3>
                    <button
                      type="button"
                      onClick={addVolunteerItem}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Add volunteer
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.volunteer.map((item) => (
                      <div
                        key={item.id}
                        className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">
                            {item.organization || "Volunteer experience"}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeVolunteerItem(item.id)}
                            className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Organization
                            </label>
                            <input
                              type="text"
                              value={item.organization}
                              onChange={(event) =>
                                updateVolunteerItem(item.id, (previous) => ({
                                  ...previous,
                                  organization: event.target.value
                                }))
                              }
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Role
                            </label>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(event) =>
                                updateVolunteerItem(item.id, (previous) => ({
                                  ...previous,
                                  role: event.target.value
                                }))
                              }
                              className={inputClasses}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-700">
                              Location
                            </label>
                            <input
                              type="text"
                              value={item.location}
                              onChange={(event) =>
                                updateVolunteerItem(item.id, (previous) => ({
                                  ...previous,
                                  location: event.target.value
                                }))
                              }
                              className={inputClasses}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-slate-700">
                                Start date
                              </label>
                              <input
                                type="text"
                                value={item.startDate}
                                onChange={(event) =>
                                  updateVolunteerItem(
                                    item.id,
                                    (previous) => ({
                                      ...previous,
                                      startDate: event.target.value
                                    })
                                  )
                                }
                                className={inputClasses}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-slate-700">
                                End date
                              </label>
                              <input
                                type="text"
                                value={item.endDate}
                                onChange={(event) =>
                                  updateVolunteerItem(
                                    item.id,
                                    (previous) => ({
                                      ...previous,
                                      endDate: event.target.value
                                    })
                                  )
                                }
                                className={inputClasses}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Bullet points
                          </label>
                          <textarea
                            value={item.bullets.join("\n")}
                            onChange={(event) =>
                              handleVolunteerBulletsChange(
                                item.id,
                                event.target.value
                              )
                            }
                            className={`${inputClasses} min-h-[56px]`}
                          />
                        </div>
                      </div>
                    ))}
                    {data.volunteer.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        Volunteer work can be valuable for students, career
                        switchers, and leadership roles.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {data.enabledSections.additional && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Additional
                    </h3>
                    <button
                      type="button"
                      onClick={addAdditionalItem}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Add additional
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.additional.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]"
                      >
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Label
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(event) =>
                              updateAdditionalItem(item.id, (previous) => ({
                                ...previous,
                                label: event.target.value
                              }))
                            }
                            className={inputClasses}
                            placeholder="Languages, Interests, Tools"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-700">
                            Content
                          </label>
                          <input
                            type="text"
                            value={item.content}
                            onChange={(event) =>
                              updateAdditionalItem(item.id, (previous) => ({
                                ...previous,
                                content: event.target.value
                              }))
                            }
                            className={inputClasses}
                            placeholder="English (native); Spanish (conversational)"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeAdditionalItem(item.id)}
                            className="h-9 rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {data.additional.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        Use this section for languages, tools, or other concise
                        items that do not fit elsewhere.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {leftTab === "ats" && atsSummary && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Target role and job description
                </h2>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Target role title
                  </label>
                  <input
                    type="text"
                    value={data.targetRoleTitle}
                    onChange={(event) =>
                      updateData("targetRoleTitle", event.target.value)
                    }
                    className={inputClasses}
                    placeholder="e.g. Senior Product Manager"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Target job description
                  </label>
                  <textarea
                    value={data.targetJobDescription}
                    onChange={(event) =>
                      updateData("targetJobDescription", event.target.value)
                    }
                    className={`${inputClasses} min-h-[140px]`}
                    placeholder="Paste the job description here to see keyword coverage. Data stays in your browser."
                  />
                </div>
              </div>
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  ATS structure and keyword match
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px]">
                    <p className="font-semibold text-slate-800">
                      Structure
                    </p>
                    <p className="mt-1 text-slate-700">
                      {atsSummary.structureScore === "good"
                        ? "Good"
                        : atsSummary.structureScore === "fair"
                        ? "Fair"
                        : "Needs work"}
                    </p>
                    <p className="mt-1 text-slate-600">
                      Summary, skills, and at least one core section help ATS
                      parsers and recruiters scan quickly.
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px]">
                    <p className="font-semibold text-slate-800">
                      Keyword match
                    </p>
                    <p className="mt-1 text-slate-700">
                      {atsSummary.keywordScore === "high"
                        ? "High"
                        : atsSummary.keywordScore === "medium"
                        ? "Medium"
                        : "Low"}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {atsSummary.foundKeywords.length} of{" "}
                      {atsSummary.foundKeywords.length +
                        atsSummary.missingKeywords.length} key terms appear in
                      your resume.
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px]">
                    <p className="font-semibold text-slate-800">
                      Numbers in bullets
                    </p>
                    <p className="mt-1 text-slate-600">
                      Bullets with numbers (like revenue, percentages, or time
                      saved) often stand out in both ATS and human reviews.
                    </p>
                  </div>
                </div>
                {atsSummary.foundKeywords.length > 0 && (
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <p className="font-semibold text-slate-800">
                      Keywords already covered
                    </p>
                    <p>
                      {atsSummary.foundKeywords.join(", ")}
                    </p>
                  </div>
                )}
                {atsSummary.missingKeywords.length > 0 && (
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <p className="font-semibold text-slate-800">
                      Keywords you might naturally weave in
                    </p>
                    <p>
                      {atsSummary.missingKeywords
                        .slice(0, 12)
                        .join(", ")}
                    </p>
                  </div>
                )}
                <div className="space-y-1 text-[11px] text-slate-700">
                  <p className="font-semibold text-slate-800">
                    Suggestions
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    {atsSummary.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                    {atsSummary.suggestions.length === 0 && (
                      <li>
                        Your structure and keyword coverage look reasonable.
                        Focus on honest content and clarity instead of
                        keyword-stuffing.
                      </li>
                    )}
                  </ul>
                  <p className="text-[11px] text-slate-500">
                    These checks are simple heuristics only. They are not a
                    guarantee of passing any specific ATS, and you should never
                    add skills or experience that are not accurate.
                  </p>
                </div>
              </div>
            </div>
          )}
          {leftTab === "settings" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Data backup
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <label className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
                      Import JSON
                    </span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Download resume data as JSON
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  JSON exports are useful if you want to move this resume between
                  browsers that trust LifeHackToolbox, or keep a machine-readable
                  backup for future edits.
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Live resume preview
              </h2>
              <p className="text-[11px] text-slate-600">
                The preview below is what will appear in PDF and print. DOCX, TXT,
                and Markdown exports use a structured text version of this
                content.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadDocx}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Download DOCX
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Download TXT
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Download Markdown
              </button>
            </div>
          </div>
          {exportMessage && (
            <p className="text-[11px] text-emerald-700">
              {exportMessage}
            </p>
          )}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-3 print:border-0 print:bg-white">
            <div ref={printContainerRef}>
              <ResumePreview data={data} />
            </div>
          </div>
          {atsSummary && (
            <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700 print:hidden">
              <p className="font-semibold text-slate-800">
                ATS helper snapshot
              </p>
              <p>
                Structure:{" "}
                {atsSummary.structureScore === "good"
                  ? "Good"
                  : atsSummary.structureScore === "fair"
                  ? "Fair"
                  : "Needs work"}
                . Keyword match:{" "}
                {atsSummary.keywordScore === "high"
                  ? "High"
                  : atsSummary.keywordScore === "medium"
                  ? "Medium"
                  : "Low"}
                .
              </p>
              <button
                type="button"
                onClick={() => setLeftTab("ats")}
                className="text-emerald-700 underline-offset-2 hover:underline"
              >
                View detailed ATS tips
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResumeBuilder;


