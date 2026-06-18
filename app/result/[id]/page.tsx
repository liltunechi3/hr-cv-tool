import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ExportPDFButton from "./ExportPDFButton";
import Link from "next/link";

const G = "#1E3832";
const C = "#F5F0E8";

interface ChecklistItem {
  qualification: string;
  met: boolean;
  evidence: string;
}

interface Evaluation {
  id: string;
  job_title: string;
  job_desc: string;
  qualifications: string[];
  score: number;
  summary: string;
  checklist: ChecklistItem[];
  lang: string;
  created_at: string;
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const evaluation = data as Evaluation;
  const isId = evaluation.lang === "id";

  const scoreColor =
    evaluation.score >= 80
      ? "#16a34a"
      : evaluation.score >= 60
      ? "#d97706"
      : "#dc2626";

  const scoreLabel =
    evaluation.score >= 80
      ? isId
        ? "Sangat Cocok"
        : "Excellent Match"
      : evaluation.score >= 60
      ? isId
        ? "Cukup Cocok"
        : "Good Match"
      : isId
      ? "Kurang Cocok"
      : "Poor Match";

  const metCount = evaluation.checklist.filter((c) => c.met).length;
  const date = new Date(evaluation.created_at).toLocaleDateString(
    isId ? "id-ID" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div style={{ minHeight: "100vh", background: C }}>
      {/* Nav */}
      <nav
        style={{
          background: G,
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: C, fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}>
          HR CV Evaluator
        </span>
        <Link
          href="/"
          style={{
            color: C,
            textDecoration: "none",
            fontSize: 14,
            border: `1px solid ${C}40`,
            padding: "6px 14px",
            borderRadius: 6,
          }}
        >
          {isId ? "Evaluasi Baru" : "New Evaluation"}
        </Link>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px 64px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{date}</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: G, letterSpacing: "-0.5px" }}>
            {evaluation.job_title}
          </h1>
        </div>

        {/* Score card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "40px",
            boxShadow: "0 4px 24px rgba(30,56,50,0.10)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
                letterSpacing: "-2px",
              }}
            >
              {evaluation.score}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              / 100
            </div>
            <div
              style={{
                marginTop: 10,
                background: scoreColor + "18",
                color: scoreColor,
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {scoreLabel}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              {isId ? "Ringkasan" : "Summary"}
            </div>
            <p style={{ fontSize: 15, color: "#333", lineHeight: 1.7 }}>
              {evaluation.summary}
            </p>
            <p style={{ fontSize: 13, color: "#888", marginTop: 12 }}>
              {metCount} / {evaluation.checklist.length}{" "}
              {isId ? "kualifikasi terpenuhi" : "qualifications met"}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "32px 40px",
            boxShadow: "0 4px 24px rgba(30,56,50,0.10)",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: G,
              marginBottom: 24,
            }}
          >
            {isId ? "Checklist Kualifikasi" : "Qualification Checklist"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {evaluation.checklist.map((item, i) => (
              <div
                key={i}
                style={{
                  borderLeft: `3px solid ${item.met ? "#16a34a" : "#dc2626"}`,
                  paddingLeft: 16,
                  paddingTop: 4,
                  paddingBottom: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      flexShrink: 0,
                      marginTop: 1,
                      color: item.met ? "#16a34a" : "#dc2626",
                      fontWeight: 700,
                    }}
                  >
                    {item.met ? "+" : "-"}
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#222", lineHeight: 1.5 }}
                  >
                    {item.qualification}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.6,
                    paddingLeft: 26,
                    fontStyle: "italic",
                  }}
                >
                  {item.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <ExportPDFButton evaluation={evaluation} lang={evaluation.lang} />
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              border: `1.5px solid ${G}`,
              color: G,
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {isId ? "Evaluasi CV Lain" : "Evaluate Another CV"}
          </Link>
        </div>
      </div>

      <footer
        style={{
          background: G,
          padding: "24px 32px",
          textAlign: "center",
          color: "rgba(245,240,232,0.6)",
          fontSize: 14,
        }}
      >
        HR CV Evaluator — {isId ? "Didukung oleh" : "Powered by"} Supabase AI
      </footer>
    </div>
  );
}
