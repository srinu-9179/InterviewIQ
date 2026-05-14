export type Level = 0 | 1 | 2 | 3; // Novice, Competent, Proficient, Expert

export type FocusArea = "Frontend / UI" | "Backend / Systems" | "Data Science" | "Mobile Engineering";

import type { ResumeSignals } from "./resume.functions";

export interface AssessmentAnswers {
  // Technical
  focusArea?: FocusArea;
  bigO?: Level;
  systemDesign?: Level;
  projectsBuilt?: number; // 0-10+
  // Resume
  hasResume?: boolean;
  hasQuantified?: boolean;
  resumeReviewed?: boolean;
  resumeSignals?: ResumeSignals;
  // Communication
  starMethod?: Level;
  mockInterviews?: number;
  elevatorPitch?: Level;
  // Portfolio
  portfolioLink?: boolean;
  caseStudies?: number;
  github?: boolean;
}

export interface PillarScore {
  key: "technical" | "resume" | "communication" | "portfolio";
  label: string;
  score: number; // 0-100
  status: "Strong" | "Solid" | "Gap" | "Low";
  insight: string;
}

export interface ImprovementStep {
  title: string;
  detail: string;
  cta: string;
}

export interface ReadinessResult {
  overall: number;
  percentile: string;
  pillars: PillarScore[];
  steps: ImprovementStep[];
  resumeSignals?: ResumeSignals;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const levelToScore = (l?: Level): number => (l === undefined ? 0 : (l / 3) * 100);

function statusFor(score: number): PillarScore["status"] {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 55) return "Gap";
  return "Low";
}

export function calculateReadiness(a: AssessmentAnswers): ReadinessResult {
  // Technical
  const techRaw =
    levelToScore(a.bigO) * 0.4 +
    levelToScore(a.systemDesign) * 0.4 +
    Math.min((a.projectsBuilt ?? 0) / 5, 1) * 100 * 0.2;

  // Resume — blend self-report with AI-extracted signals when available
  const sig = a.resumeSignals;
  const baseResume =
    (a.hasResume ? 35 : 0) +
    (a.hasQuantified ? 35 : 0) +
    (a.resumeReviewed ? 30 : 0);
  const resumeRaw = sig
    ? baseResume * 0.5 +
      sig.atsScore * 0.35 +
      Math.min(sig.quantifiedBulletCount / 6, 1) * 100 * 0.15
    : baseResume;

  // Communication
  const commsRaw =
    levelToScore(a.starMethod) * 0.45 +
    Math.min((a.mockInterviews ?? 0) / 5, 1) * 100 * 0.3 +
    levelToScore(a.elevatorPitch) * 0.25;

  // Portfolio
  const portfolioRaw =
    (a.portfolioLink ? 30 : 0) +
    Math.min((a.caseStudies ?? 0) / 3, 1) * 50 +
    (a.github ? 20 : 0);

  const technical = clamp(techRaw);
  const resume = clamp(resumeRaw);
  const communication = clamp(commsRaw);
  const portfolio = clamp(portfolioRaw);

  const overall = clamp(technical * 0.35 + resume * 0.2 + communication * 0.25 + portfolio * 0.2);

  const pillars: PillarScore[] = [
    {
      key: "technical",
      label: "Technical",
      score: technical,
      status: statusFor(technical),
      insight:
        technical >= 85
          ? "Strong fundamentals across complexity and architecture."
          : technical >= 70
            ? "Solid base. Tighten system design depth for senior signal."
            : "Reinforce DSA fundamentals and ship 1–2 deeper projects.",
    },
    {
      key: "resume",
      label: "Resume",
      score: resume,
      status: statusFor(resume),
      insight:
        resume >= 85
          ? "Clear, quantified, ATS-friendly."
          : resume >= 70
            ? "Quantify impact (numbers, %, scale) on every bullet."
            : "Add a real resume with measurable outcomes; get it reviewed.",
    },
    {
      key: "communication",
      label: "Comms",
      score: communication,
      status: statusFor(communication),
      insight:
        communication >= 85
          ? "Behavioral answers land cleanly with structure."
          : communication >= 70
            ? "Tighten STAR stories — focus on result and learning."
            : "Practice 5 STAR stories and run mock interviews this week.",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      score: portfolio,
      status: statusFor(portfolio),
      insight:
        portfolio >= 85
          ? "Recruiters can verify your work in one click."
          : portfolio >= 70
            ? "Add deeper case studies with problem → decision → impact."
            : "Publish a portfolio link with 2–3 detailed case studies.",
    },
  ];

  const steps = buildSteps(pillars, a);

  const percentile =
    overall >= 90 ? "top 5%" : overall >= 80 ? "top 15%" : overall >= 70 ? "top 30%" : overall >= 55 ? "above average" : "below market bar";

  return { overall, percentile, pillars, steps, resumeSignals: a.resumeSignals };
}

function buildSteps(pillars: PillarScore[], a: AssessmentAnswers): ImprovementStep[] {
  const sorted = [...pillars].sort((x, y) => x.score - y.score);
  const steps: ImprovementStep[] = [];

  for (const p of sorted) {
    if (steps.length >= 5) break;
    if (p.score >= 85) continue;

    if (p.key === "technical") {
      steps.push({
        title: "Reinforce technical core",
        detail: `Complete 2 medium LeetCode/system-design problems daily for ${a.focusArea ?? "your"} stack.`,
        cta: "View Guide",
      });
    }
    if (p.key === "resume") {
      steps.push({
        title: a.hasResume ? "Quantify resume impact" : "Build your first resume",
        detail: a.hasQuantified
          ? "Add 1 missing metric per bullet (users, %, latency, time saved)."
          : "Rewrite 5 bullets using the formula: Action → Tool → Measurable Result.",
        cta: "Checklist",
      });
    }
    if (p.key === "communication") {
      steps.push({
        title: "Drill the STAR method",
        detail: "Record yourself answering 3 behavioral prompts in under 90 seconds each.",
        cta: "Practice",
      });
    }
    if (p.key === "portfolio") {
      steps.push({
        title: a.portfolioLink ? "Deepen portfolio case studies" : "Publish a portfolio",
        detail: a.caseStudies && a.caseStudies > 0
          ? "Add a 'Lessons Learned' section to your strongest case study."
          : "Ship a one-page portfolio linking 2 projects with screenshots.",
        cta: "Template",
      });
    }
  }

  if (steps.length < 3) {
    steps.push({
      title: "Run a full mock interview",
      detail: "Schedule one timed mock this week — record, review, iterate.",
      cta: "Find Partner",
    });
  }

  return steps.slice(0, 5);
}
