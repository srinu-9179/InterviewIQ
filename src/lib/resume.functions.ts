import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface ResumeSignals {
  hasResume: boolean;
  hasQuantified: boolean;
  resumeReviewed: boolean;
  quantifiedBulletCount: number;
  totalBulletCount: number;
  projectsMentioned: number;
  yearsExperience: number;
  hasGithub: boolean;
  hasPortfolio: boolean;
  topStrengths: string[];
  topGaps: string[];
  atsScore: number; // 0-100
  summary: string;
}

const ResumeSignalsSchema = {
  type: "object",
  properties: {
    hasQuantified: { type: "boolean" },
    resumeReviewed: { type: "boolean" },
    quantifiedBulletCount: { type: "integer", minimum: 0 },
    totalBulletCount: { type: "integer", minimum: 0 },
    projectsMentioned: { type: "integer", minimum: 0 },
    yearsExperience: { type: "number", minimum: 0 },
    hasGithub: { type: "boolean" },
    hasPortfolio: { type: "boolean" },
    topStrengths: { type: "array", items: { type: "string" }, maxItems: 3 },
    topGaps: { type: "array", items: { type: "string" }, maxItems: 3 },
    atsScore: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string", maxLength: 240 },
  },
  required: [
    "hasQuantified",
    "resumeReviewed",
    "quantifiedBulletCount",
    "totalBulletCount",
    "projectsMentioned",
    "yearsExperience",
    "hasGithub",
    "hasPortfolio",
    "topStrengths",
    "topGaps",
    "atsScore",
    "summary",
  ],
} as const;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      text: z.string().min(40).max(20000),
      focusArea: z.string().max(80).optional(),
    }).parse,
  )
  .handler(async ({ data }): Promise<ResumeSignals> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI gateway not configured.");
    }

    const system = `You are a senior tech recruiter. Extract objective signals from a candidate's resume.
Rules:
- "hasQuantified": true ONLY if at least 30% of bullets contain numbers, %, or measurable scale.
- "resumeReviewed": infer false unless the resume explicitly mentions mentorship/review/feedback.
- "atsScore": 0-100 — judges role-keyword density, formatting hints, clarity.
- "topStrengths"/"topGaps": short phrases (3-6 words each).
- "summary": one sentence, recruiter tone.
Return ONLY the JSON matching the provided schema.`;

    const user = `Target focus area: ${data.focusArea ?? "General software"}\n\nRESUME:\n${data.text}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_resume_signals",
              description: "Report extracted resume signals.",
              parameters: ResumeSignalsSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_resume_signals" } },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("AI gateway error", res.status, body);
      if (res.status === 429) throw new Error("Rate limited. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
      throw new Error("Failed to analyze resume.");
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: { tool_calls?: Array<{ function?: { arguments?: string } }> };
      }>;
    };

    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Resume analysis returned no result.");

    let parsed: Omit<ResumeSignals, "hasResume">;
    try {
      parsed = JSON.parse(args);
    } catch {
      throw new Error("Resume analysis returned malformed JSON.");
    }

    return {
      hasResume: true,
      ...parsed,
      topStrengths: (parsed.topStrengths ?? []).slice(0, 3),
      topGaps: (parsed.topGaps ?? []).slice(0, 3),
    };
  });
