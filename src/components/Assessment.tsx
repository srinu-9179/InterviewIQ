import { useState } from "react";
import type { AssessmentAnswers, FocusArea, Level } from "@/lib/assessment";
import { ChoiceButton, Chip } from "./Choice";
import { ResumeUpload } from "./ResumeUpload";
import type { ResumeSignals } from "@/lib/resume.functions";

interface Props {
  onComplete: (answers: AssessmentAnswers) => void;
  onCancel: () => void;
}

const LEVELS: { label: string; value: Level }[] = [
  { label: "Novice", value: 0 },
  { label: "Competent", value: 1 },
  { label: "Proficient", value: 2 },
  { label: "Expert", value: 3 },
];

const FOCUS_AREAS: FocusArea[] = [
  "Frontend / UI",
  "Backend / Systems",
  "Data Science",
  "Mobile Engineering",
];

const PROJECTS = [
  { label: "0", value: 0 },
  { label: "1–2", value: 2 },
  { label: "3–4", value: 4 },
  { label: "5+", value: 6 },
];

const MOCKS = [
  { label: "None", value: 0 },
  { label: "1–2", value: 2 },
  { label: "3–5", value: 4 },
  { label: "6+", value: 7 },
];

const CASE_STUDIES = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3+", value: 3 },
];

export function Assessment({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<AssessmentAnswers>({});

  const update = (patch: Partial<AssessmentAnswers>) => setA((prev) => ({ ...prev, ...patch }));

  const steps = [
    {
      label: "Technical Proficiency",
      canNext: a.focusArea !== undefined && a.bigO !== undefined && a.systemDesign !== undefined && a.projectsBuilt !== undefined,
      content: (
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Core focus area</p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map((f) => (
                <Chip key={f} active={a.focusArea === f} onClick={() => update({ focusArea: f })}>
                  {f}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">
              How comfortable are you explaining Time Complexity (Big O) live?
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {LEVELS.map((l) => (
                <ChoiceButton key={l.value} active={a.bigO === l.value} onClick={() => update({ bigO: l.value })}>
                  {l.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">System design / architecture depth</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {LEVELS.map((l) => (
                <ChoiceButton
                  key={l.value}
                  active={a.systemDesign === l.value}
                  onClick={() => update({ systemDesign: l.value })}
                >
                  {l.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Substantial projects shipped</p>
            <div className="grid grid-cols-4 gap-3">
              {PROJECTS.map((p) => (
                <ChoiceButton
                  key={p.label}
                  active={a.projectsBuilt === p.value}
                  onClick={() => update({ projectsBuilt: p.value })}
                >
                  {p.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Resume",
      canNext: a.hasResume !== undefined && a.hasQuantified !== undefined && a.resumeReviewed !== undefined,
      content: (
        <div className="space-y-10">
          <ResumeUpload
            focusArea={a.focusArea}
            signals={a.resumeSignals}
            onAnalyzed={(s: ResumeSignals) =>
              update({
                resumeSignals: s,
                hasResume: true,
                hasQuantified: s.hasQuantified,
                resumeReviewed: s.resumeReviewed,
              })
            }
            onClear={() =>
              update({
                resumeSignals: undefined,
                hasResume: undefined,
                hasQuantified: undefined,
                resumeReviewed: undefined,
              })
            }
          />
          <YesNo
            question="Do you have an updated resume tailored to your target role?"
            value={a.hasResume}
            onChange={(v) => update({ hasResume: v })}
          />
          <YesNo
            question="Are your bullet points quantified with metrics (numbers, %, scale)?"
            value={a.hasQuantified}
            onChange={(v) => update({ hasQuantified: v })}
          />
          <YesNo
            question="Has it been reviewed by a mentor, recruiter, or senior peer?"
            value={a.resumeReviewed}
            onChange={(v) => update({ resumeReviewed: v })}
          />
        </div>
      ),
    },
    {
      label: "Communication",
      canNext: a.starMethod !== undefined && a.mockInterviews !== undefined && a.elevatorPitch !== undefined,
      content: (
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Comfort with the STAR method for behavioral answers</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {LEVELS.map((l) => (
                <ChoiceButton
                  key={l.value}
                  active={a.starMethod === l.value}
                  onClick={() => update({ starMethod: l.value })}
                >
                  {l.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Mock interviews completed in the last 30 days</p>
            <div className="grid grid-cols-4 gap-3">
              {MOCKS.map((m) => (
                <ChoiceButton
                  key={m.label}
                  active={a.mockInterviews === m.value}
                  onClick={() => update({ mockInterviews: m.value })}
                >
                  {m.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Strength of your 60-second elevator pitch</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {LEVELS.map((l) => (
                <ChoiceButton
                  key={l.value}
                  active={a.elevatorPitch === l.value}
                  onClick={() => update({ elevatorPitch: l.value })}
                >
                  {l.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Portfolio",
      canNext: a.portfolioLink !== undefined && a.caseStudies !== undefined && a.github !== undefined,
      content: (
        <div className="space-y-10">
          <YesNo
            question="Do you have a public portfolio link recruiters can visit?"
            value={a.portfolioLink}
            onChange={(v) => update({ portfolioLink: v })}
          />
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Detailed case studies (problem → decisions → impact)</p>
            <div className="grid grid-cols-4 gap-3">
              {CASE_STUDIES.map((c) => (
                <ChoiceButton
                  key={c.label}
                  active={a.caseStudies === c.value}
                  onClick={() => update({ caseStudies: c.value })}
                >
                  {c.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
          <YesNo
            question="Active GitHub / equivalent with code recruiters can browse?"
            value={a.github}
            onChange={(v) => update({ github: v })}
          />
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLast) onComplete(a);
    else setStep((s) => s + 1);
  };

  return (
    <section className="animate-slide rounded-2xl border border-border bg-card p-1 shadow-sm">
      <div className="flex flex-col overflow-hidden rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border bg-secondary px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-medium text-primary">
              {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{current.label}</h2>
          </div>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-8 md:p-12">{current.content}</div>

        <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-6 py-4 md:px-12">
          <button
            type="button"
            onClick={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
            className="text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            disabled={!current.canNext}
            onClick={handleNext}
            className="flex items-center gap-2 h-10 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isLast ? "Calculate Readiness" : "Next Step"}
            <span className="opacity-50 font-mono text-xs">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function YesNo({
  question,
  value,
  onChange,
}: {
  question: string;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xl font-medium text-foreground">{question}</p>
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <ChoiceButton active={value === true} onClick={() => onChange(true)}>
          Yes
        </ChoiceButton>
        <ChoiceButton active={value === false} onClick={() => onChange(false)}>
          Not yet
        </ChoiceButton>
      </div>
    </div>
  );
}
