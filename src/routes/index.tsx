import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Assessment } from "@/components/Assessment";
import { Results } from "@/components/Results";
import { calculateReadiness, type AssessmentAnswers, type ReadinessResult } from "@/lib/assessment";
import workspace from "@/assets/workspace.jpg";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "LevelUp — Interview Readiness Score in 2 minutes" },
      {
        name: "description",
        content:
          "Objectively measure your interview readiness across technical skills, resume, communication and portfolio — with a personalized improvement plan.",
      },
      { property: "og:title", content: "LevelUp — Interview Readiness Score" },
      {
        property: "og:description",
        content: "Data-driven 2-minute assessment for students before their first recruiter call.",
      },
    ],
  }),
  component: Index,
} as any));

type Stage = "landing" | "assessment" | "results";

function Index() {
  const [stage, setStage] = useState<Stage>("landing");
  const [result, setResult] = useState<ReadinessResult | null>(null);

  const handleComplete = (a: AssessmentAnswers) => {
    setResult(calculateReadiness(a));
    setStage("results");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative overflow-x-hidden">

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb animate-float-slow animate-pulse-glow"
          style={{
            width: 600, height: 600,
            background: "radial-gradient(circle, hsl(262 83% 68% / 0.18), transparent 70%)",
            top: "-120px", left: "-150px",
          }}
        />
        <div
          className="orb animate-float-medium animate-pulse-glow"
          style={{
            width: 500, height: 500,
            background: "radial-gradient(circle, hsl(196 90% 58% / 0.14), transparent 70%)",
            top: "30%", right: "-100px",
            animationDelay: "2s",
          }}
        />
        <div
          className="orb animate-float-slow animate-pulse-glow"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, hsl(316 73% 65% / 0.13), transparent 70%)",
            bottom: "10%", left: "20%",
            animationDelay: "3.5s",
          }}
        />
        <div
          className="orb"
          style={{
            width: 300, height: 300,
            background: "radial-gradient(circle, hsl(38 92% 55% / 0.10), transparent 70%)",
            top: "60%", left: "60%",
            animation: "float-medium 6s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(hsl(0 0% 100% / 0.02) 1px, transparent 1px),
              linear-gradient(90deg, hsl(0 0% 100% / 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border" style={{ background: "hsl(230 25% 6% / 0.75)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div
              className="size-7 rounded-lg flex items-center justify-center shimmer-btn"
              style={{ padding: 0 }}
            >
              <div className="size-2.5 bg-white rounded-full" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tighter uppercase gradient-text">LevelUp.io</span>
          </div>
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest hidden sm:block">
            Status: Readiness V2.4
          </span>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {stage === "landing" && <Landing onStart={() => setStage("assessment")} workspace={workspace} />}
        {stage === "assessment" && (
          <Assessment onComplete={handleComplete} onCancel={() => setStage("landing")} />
        )}
        {stage === "results" && result && (
          <Results
            result={result}
            onRestart={() => {
              setResult(null);
              setStage("assessment");
            }}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-24 border-t border-border py-12" style={{ background: "hsl(230 25% 5%)" }}>
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full shimmer-btn" style={{ padding: 0 }} />
            <span className="font-mono text-xs font-bold uppercase tracking-tighter gradient-text">LevelUp</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
            © 2026 Precision Career Systems. No cookies. No tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}

const PILLARS = [
  { k: "Technical",     d: "DSA, system design, project depth",      color: "hsl(262 83% 68%)", bg: "hsl(262 83% 68% / 0.08)" },
  { k: "Resume",        d: "Quantified impact & ATS readiness",       color: "hsl(196 90% 58%)", bg: "hsl(196 90% 58% / 0.08)" },
  { k: "Communication", d: "STAR stories & elevator pitch",           color: "hsl(316 73% 65%)", bg: "hsl(316 73% 65% / 0.08)" },
  { k: "Portfolio",     d: "Case studies & verifiable work",          color: "hsl(38 92% 55%)",  bg: "hsl(38 92% 55% / 0.08)"  },
];

const STATS = [
  { k: "120s",     d: "Average completion time", color: "hsl(262 83% 75%)" },
  { k: "4 pillars", d: "Evaluated end-to-end",   color: "hsl(196 90% 65%)" },
  { k: "0 logins", d: "No account, no tracking", color: "hsl(316 73% 70%)" },
];

function Landing({ onStart, workspace }: { onStart: () => void; workspace: string }) {
  return (
    <>
      {/* Hero */}
      <section className="animate-slide space-y-8 py-16 md:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1"
            style={{ background: "hsl(262 83% 68% / 0.1)", borderColor: "hsl(262 83% 68% / 0.3)" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-ring absolute inline-flex h-full w-full rounded-full" style={{ background: "hsl(262 83% 68%)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "hsl(262 83% 68%)" }} />
            </span>
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider" style={{ color: "hsl(262 83% 78%)" }}>
              Open for 2026 Grads
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-6xl leading-tight">
            Objective interview{" "}
            <span className="gradient-text">intelligence.</span>
          </h1>

          <p className="mt-6 text-lg text-muted text-pretty max-w-lg leading-relaxed">
            A data-driven 2-minute assessment to measure your technical depth, resume strength,
            communication clarity, and portfolio impact — before your first recruiter call.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={onStart}
              className="shimmer-btn h-12 rounded-xl px-8 font-semibold text-white"
            >
              Start Assessment →
            </button>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["hsl(262 83% 68%)", "hsl(196 90% 58%)", "hsl(316 73% 65%)"].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2" style={{ background: c, borderColor: "hsl(230 25% 6%)" }} />
                ))}
              </div>
              <span className="text-xs text-muted font-medium">Joined by 4.2k students this week</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="animate-slide [animation-delay:150ms] grid gap-4 md:grid-cols-4 mt-8">
        {PILLARS.map((item, i) => (
          <div
            key={item.k}
            className="glass-card animate-card-appear rounded-xl p-6"
            style={{ animationDelay: `${i * 80}ms`, background: item.bg }}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>
              0{i + 1}
            </span>
            <h3 className="mt-3 font-semibold text-foreground">{item.k}</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">{item.d}</p>
          </div>
        ))}
      </section>

      {/* Workspace image */}
      <section className="animate-slide [animation-delay:300ms] mt-20 relative">
        <div className="absolute inset-0 rounded-2xl" style={{
          background: "linear-gradient(135deg, hsl(262 83% 68% / 0.15), hsl(196 90% 58% / 0.1))",
          filter: "blur(40px)",
          transform: "scale(0.95) translateY(10px)",
        }} />
        <img
          src={workspace}
          alt="Student preparing for interviews at a minimal workspace"
          width={1440}
          height={640}
          className="relative w-full aspect-[21/9] object-cover rounded-2xl"
          style={{ border: "1px solid hsl(262 83% 68% / 0.2)" }}
        />
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 rounded-2xl" style={{
          background: "linear-gradient(180deg, transparent 40%, hsl(230 25% 6% / 0.6) 100%)",
        }} />
      </section>

      {/* Stats */}
      <section className="animate-slide [animation-delay:400ms] mt-16 grid gap-8 md:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.k} className="glass-card rounded-xl p-6 flex flex-col gap-2">
            <p className="font-mono text-3xl font-bold tracking-tight" style={{ color: s.color }}>
              {s.k}
            </p>
            <p className="text-sm text-muted">{s.d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
