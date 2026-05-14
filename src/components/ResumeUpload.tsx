import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { extractResumeText } from "@/lib/parse-resume";
import { analyzeResume } from "@/lib/resume.functions";
import type { ResumeSignals } from "@/lib/resume.functions";
import type { FocusArea } from "@/lib/assessment";

interface Props {
  focusArea?: FocusArea;
  signals?: ResumeSignals;
  onAnalyzed: (signals: ResumeSignals) => void;
  onClear: () => void;
}

export function ResumeUpload({ focusArea, signals, onAnalyzed, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "analyzing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const analyze = useServerFn(analyzeResume);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);
    setStatus("parsing");
    try {
      const text = await extractResumeText(file);
      if (text.length < 60) throw new Error("Couldn't read enough text. Try another file.");
      setStatus("analyzing");
      const result = await analyze({ data: { text, focusArea } });
      onAnalyzed(result);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to analyze resume.");
      setStatus("error");
    }
  }

  const busy = status === "parsing" || status === "analyzing";

  if (signals) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              Resume analyzed · {fileName ?? "uploaded file"}
            </p>
            <p className="text-sm font-medium text-foreground">{signals.summary}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClear();
              setFileName(null);
              setStatus("idle");
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground"
          >
            Replace
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="ATS score" value={`${signals.atsScore}/100`} />
          <Stat label="Quantified" value={`${signals.quantifiedBulletCount}/${signals.totalBulletCount} bullets`} />
          <Stat label="Projects" value={String(signals.projectsMentioned)} />
          <Stat label="Experience" value={`${signals.yearsExperience} yr`} />
        </dl>
        {(signals.topStrengths.length > 0 || signals.topGaps.length > 0) && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {signals.topStrengths.length > 0 && (
              <TagList label="Strengths" items={signals.topStrengths} tone="success" />
            )}
            {signals.topGaps.length > 0 && (
              <TagList label="Gaps" items={signals.topGaps} tone="warning" />
            )}
          </div>
        )}
        <p className="mt-4 text-[11px] text-muted">
          Answers below have been auto-filled. Adjust any if you disagree.
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      className="rounded-xl border border-dashed border-border bg-secondary/40 p-6 text-center"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
        Optional · 15-second boost
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        Upload your resume to auto-fill this section
      </p>
      <p className="mt-1 text-xs text-muted">PDF or .txt · processed in your browser</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-5 text-xs font-semibold text-background transition-all hover:bg-foreground/90 disabled:opacity-50"
      >
        {status === "parsing" && "Reading file…"}
        {status === "analyzing" && "Analyzing with AI…"}
        {(status === "idle" || status === "error") && "Choose file"}
      </button>
      {error && <p className="mt-3 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function TagList({ label, items, tone }: { label: string; items: string[]; tone: "success" | "warning" }) {
  const cls =
    tone === "success"
      ? "border-[var(--color-success)]/40 text-[var(--color-success)]"
      : "border-[var(--color-warning)]/40 text-[var(--color-warning)]";
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <li
            key={it}
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
