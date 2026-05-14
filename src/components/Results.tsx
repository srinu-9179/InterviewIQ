import { useEffect, useState } from "react";
import type { ReadinessResult } from "@/lib/assessment";
import { ScoreRing } from "./ScoreRing";

interface Props {
  result: ReadinessResult;
  onRestart: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Strong: "text-[var(--color-success)]",
  Solid: "text-[var(--color-success)]",
  Gap: "text-[var(--color-warning)]",
  Low: "text-[var(--color-danger)]",
};

const BAR_STYLES: Record<string, string> = {
  Strong: "bg-[var(--color-success)]",
  Solid: "bg-[var(--color-success)]",
  Gap: "bg-[var(--color-warning)]",
  Low: "bg-[var(--color-danger)]",
};

function useCountUp(target: number, duration = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function PillarCard({ pillar }: { pillar: ReadinessResult["pillars"][number] }) {
  const value = useCountUp(pillar.score, 1100);
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
        {pillar.label}
      </span>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className={`text-xs font-medium ${STATUS_STYLES[pillar.status]}`}>{pillar.status}</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full ${BAR_STYLES[pillar.status]} transition-[width] duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-4 text-xs text-muted leading-relaxed">{pillar.insight}</p>
    </div>
  );
}

export function Results({ result, onRestart }: Props) {
  const headline =
    result.overall >= 85
      ? "You're interview-ready."
      : result.overall >= 70
        ? "You're above average."
        : result.overall >= 55
          ? "You're getting there."
          : "Significant gaps to close.";

  return (
    <section className="space-y-12">
      <div className="animate-slide flex flex-col gap-8 md:flex-row md:items-end">
        <ScoreRing value={result.overall} />
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{headline}</h2>
          <p className="max-w-md text-muted">
            Based on current market benchmarks, you are in the{" "}
            <span className="font-medium text-foreground underline decoration-primary/40">
              {result.percentile}
            </span>{" "}
            of entry-level candidates.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            ← Retake Assessment
          </button>
        </div>
      </div>

      <div className="animate-slide [animation-delay:200ms] grid gap-4 md:grid-cols-4">
        {result.pillars.map((p) => (
          <PillarCard key={p.key} pillar={p} />
        ))}
      </div>

      {result.resumeSignals && (
        <div className="animate-slide [animation-delay:300ms] rounded-2xl border border-border bg-card p-8">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h3 className="font-bold tracking-tight text-foreground">Resume intelligence</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              AI-extracted signals
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">{result.resumeSignals.summary}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <ResumeStat label="ATS score" value={`${result.resumeSignals.atsScore}/100`} />
            <ResumeStat
              label="Quantified bullets"
              value={`${result.resumeSignals.quantifiedBulletCount}/${result.resumeSignals.totalBulletCount}`}
            />
            <ResumeStat label="Projects mentioned" value={String(result.resumeSignals.projectsMentioned)} />
            <ResumeStat label="Years experience" value={`${result.resumeSignals.yearsExperience}`} />
          </dl>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {result.resumeSignals.topStrengths.length > 0 && (
              <ResumeTags label="Strengths" items={result.resumeSignals.topStrengths} tone="success" />
            )}
            {result.resumeSignals.topGaps.length > 0 && (
              <ResumeTags label="Gaps to close" items={result.resumeSignals.topGaps} tone="warning" />
            )}
          </div>
        </div>
      )}

      <div className="animate-slide [animation-delay:400ms] rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-secondary px-8 py-6">
          <h3 className="font-bold tracking-tight text-foreground">7-Day Improvement Protocol</h3>
          <p className="text-sm text-muted">Personalized steps prioritized by impact.</p>
        </div>
        <div className="divide-y divide-border">
          {result.steps.map((s, i) => (
            <div key={i} className="group flex items-center gap-6 p-8 transition-colors hover:bg-secondary/40">
              <span className="font-mono text-xl font-light text-muted group-hover:text-primary transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="text-sm text-muted mt-0.5">{s.detail}</p>
              </div>
              <button className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                {s.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResumeStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-foreground">{value}</dd>
    </div>
  );
}

function ResumeTags({ label, items, tone }: { label: string; items: string[]; tone: "success" | "warning" }) {
  const cls =
    tone === "success"
      ? "border-[var(--color-success)]/40 text-[var(--color-success)]"
      : "border-[var(--color-warning)]/40 text-[var(--color-warning)]";
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <li key={it} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
