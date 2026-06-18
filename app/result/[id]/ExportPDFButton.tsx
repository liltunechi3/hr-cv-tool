"use client";

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
  score: number;
  summary: string;
  checklist: ChecklistItem[];
  created_at: string;
}

interface Props {
  evaluation: Evaluation;
  lang: string;
}

export default function ExportPDFButton({ evaluation, lang }: Props) {
  const isId = lang === "id";

  const handleExport = async () => {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const addText = (
      text: string,
      size: number,
      bold: boolean,
      color: [number, number, number],
      maxWidth?: number
    ) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidth || contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.4) + 3;
    };

    const checkPage = (needed: number) => {
      if (y + needed > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // Title
    addText(
      `${isId ? "Laporan Evaluasi CV" : "CV Evaluation Report"}`,
      20,
      true,
      [30, 56, 50]
    );
    addText(evaluation.job_title, 14, false, [80, 80, 80]);

    const date = new Date(evaluation.created_at).toLocaleDateString(
      isId ? "id-ID" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
    addText(date, 10, false, [150, 150, 150]);
    y += 5;

    // Score
    checkPage(30);
    addText(
      `${isId ? "Skor" : "Score"}: ${evaluation.score}/100`,
      16,
      true,
      [30, 56, 50]
    );
    y += 2;

    // Summary
    checkPage(20);
    addText(isId ? "Ringkasan:" : "Summary:", 12, true, [50, 50, 50]);
    addText(evaluation.summary, 11, false, [80, 80, 80], contentWidth);
    y += 6;

    // Checklist
    checkPage(20);
    addText(
      isId ? "Checklist Kualifikasi:" : "Qualification Checklist:",
      12,
      true,
      [50, 50, 50]
    );
    y += 2;

    for (const item of evaluation.checklist) {
      checkPage(24);
      const prefix = item.met ? "[+]" : "[-]";
      const color: [number, number, number] = item.met
        ? [22, 163, 74]
        : [220, 38, 38];
      addText(`${prefix} ${item.qualification}`, 11, true, color);
      addText(`    ${item.evidence}`, 10, false, [120, 120, 120], contentWidth - 8);
      y += 2;
    }

    doc.save(
      `cv-evaluation-${evaluation.job_title.replace(/\s+/g, "-").toLowerCase()}.pdf`
    );
  };

  return (
    <button
      onClick={handleExport}
      style={{
        background: G,
        color: C,
        border: "none",
        padding: "12px 24px",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {isId ? "Export PDF" : "Export PDF"}
    </button>
  );
}
