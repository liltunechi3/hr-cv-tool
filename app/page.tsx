"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const G = "#1E3832";
const C = "#F5F0E8";

const content = {
  id: {
    nav_title: "HR CV Evaluator",
    lang_toggle: "EN",
    hero_title: "Evaluasi CV dengan Kecerdasan Buatan",
    hero_subtitle:
      "Upload CV kandidat dan dapatkan analisis mendetail dalam hitungan detik. Didukung oleh Supabase AI.",
    form_title: "Mulai Evaluasi",
    job_title_label: "Judul Pekerjaan",
    job_title_placeholder: "contoh: Senior Software Engineer",
    qualifications_label: "Kualifikasi yang Dibutuhkan",
    qualification_placeholder: "contoh: Minimal 3 tahun pengalaman di React",
    add_qualification: "Tambah Kualifikasi",
    remove: "Hapus",
    job_desc_label: "Deskripsi Pekerjaan",
    job_desc_placeholder:
      "Jelaskan tanggung jawab dan detail pekerjaan...",
    upload_label: "Upload CV",
    upload_hint: "Format yang didukung: PDF, DOCX",
    upload_button: "Pilih File",
    no_file: "Belum ada file dipilih",
    chars_parsed: "karakter berhasil diproses",
    parsing: "Memproses file...",
    submit: "Evaluasi CV",
    submitting: "Mengevaluasi...",
    feature1_title: "Analisis Mendalam",
    feature1_desc:
      "Supabase AI menganalisis CV secara menyeluruh menggunakan semantic similarity untuk penilaian yang akurat.",
    feature2_title: "Checklist Kualifikasi",
    feature2_desc:
      "Setiap kualifikasi diperiksa satu per satu dengan bukti langsung dari CV kandidat.",
    feature3_title: "Laporan Terstruktur",
    feature3_desc:
      "Hasil evaluasi dapat diexport ke PDF untuk dokumentasi dan arsip rekrutmen.",
    footer: "HR CV Evaluator — Didukung oleh Supabase AI",
    error_no_file: "Silakan upload file CV terlebih dahulu.",
    error_no_title: "Silakan isi judul pekerjaan.",
    error_no_quals: "Silakan tambahkan minimal satu kualifikasi.",
    error_parse: "Gagal memproses file CV. Pastikan file tidak rusak.",
    error_evaluate: "Evaluasi gagal. Coba lagi.",
  },
  en: {
    nav_title: "HR CV Evaluator",
    lang_toggle: "ID",
    hero_title: "Evaluate CVs with Artificial Intelligence",
    hero_subtitle:
      "Upload a candidate's CV and get a detailed analysis in seconds. Powered by Supabase AI.",
    form_title: "Start Evaluation",
    job_title_label: "Job Title",
    job_title_placeholder: "e.g. Senior Software Engineer",
    qualifications_label: "Required Qualifications",
    qualification_placeholder: "e.g. Minimum 3 years of React experience",
    add_qualification: "Add Qualification",
    remove: "Remove",
    job_desc_label: "Job Description",
    job_desc_placeholder: "Describe the responsibilities and job details...",
    upload_label: "Upload CV",
    upload_hint: "Supported formats: PDF, DOCX",
    upload_button: "Choose File",
    no_file: "No file selected",
    chars_parsed: "characters parsed successfully",
    parsing: "Processing file...",
    submit: "Evaluate CV",
    submitting: "Evaluating...",
    feature1_title: "Deep Analysis",
    feature1_desc:
      "Supabase AI analyzes the CV using semantic similarity to provide accurate assessments.",
    feature2_title: "Qualification Checklist",
    feature2_desc:
      "Each qualification is checked individually with direct evidence from the candidate's CV.",
    feature3_title: "Structured Report",
    feature3_desc:
      "Evaluation results can be exported to PDF for documentation and recruitment records.",
    footer: "HR CV Evaluator — Powered by Supabase AI",
    error_no_file: "Please upload a CV file first.",
    error_no_title: "Please fill in the job title.",
    error_no_quals: "Please add at least one qualification.",
    error_parse: "Failed to process CV file. Please ensure the file is valid.",
    error_evaluate: "Evaluation failed. Please try again.",
  },
};

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<"id" | "en">("id");
  const t = content[lang];

  const [jobTitle, setJobTitle] = useState("");
  const [qualifications, setQualifications] = useState(["", "", ""]);
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(uuidv4());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setError("");
    setCvText("");
    setCharCount(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.error_parse);
        setFile(null);
      } else {
        setCvText(data.text);
        setCharCount(data.text.length);
      }
    } catch {
      setError(t.error_parse);
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const addQualification = () => {
    setQualifications([...qualifications, ""]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const updateQualification = (index: number, value: string) => {
    const updated = [...qualifications];
    updated[index] = value;
    setQualifications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jobTitle.trim()) {
      setError(t.error_no_title);
      return;
    }

    const validQuals = qualifications.filter((q) => q.trim());
    if (validQuals.length === 0) {
      setError(t.error_no_quals);
      return;
    }

    if (!cvText) {
      setError(t.error_no_file);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle.trim(),
          job_desc: jobDesc.trim(),
          qualifications: validQuals,
          cv_text: cvText,
          session_id: sessionId.current,
          lang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.error_evaluate);
      } else {
        router.push(`/result/${data.id}`);
      }
    } catch {
      setError(t.error_evaluate);
    } finally {
      setSubmitting(false);
    }
  };

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
        <span
          style={{ color: C, fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}
        >
          {t.nav_title}
        </span>
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          style={{
            background: "transparent",
            border: `1px solid ${C}`,
            color: C,
            padding: "6px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          {t.lang_toggle}
        </button>
      </nav>

      {/* Hero */}
      <div
        style={{
          background: G,
          padding: "64px 32px 80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: C,
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-1px",
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          {t.hero_title}
        </h1>
        <p
          style={{
            color: "rgba(245,240,232,0.75)",
            fontSize: 18,
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {t.hero_subtitle}
        </p>
      </div>

      {/* Form card */}
      <div
        style={{
          maxWidth: 720,
          margin: "-40px auto 64px",
          padding: "0 16px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "40px 40px",
            boxShadow: "0 8px 40px rgba(30,56,50,0.12)",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: G,
              marginBottom: 28,
            }}
          >
            {t.form_title}
          </h2>

          {/* Job Title */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{t.job_title_label}</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t.job_title_placeholder}
              style={inputStyle}
            />
          </div>

          {/* Qualifications */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{t.qualifications_label}</label>
            {qualifications.map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={q}
                  onChange={(e) => updateQualification(i, e.target.value)}
                  placeholder={`${i + 1}. ${t.qualification_placeholder}`}
                  style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                />
                {qualifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQualification(i)}
                    style={{
                      background: "transparent",
                      border: "1px solid #ddd",
                      color: "#888",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {t.remove}
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQualification}
              style={{
                background: "transparent",
                border: `1px dashed ${G}`,
                color: G,
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              + {t.add_qualification}
            </button>
          </div>

          {/* Job Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{t.job_desc_label}</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder={t.job_desc_placeholder}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Upload CV */}
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>{t.upload_label}</label>
            <div
              style={{
                border: `2px dashed ${G}30`,
                borderRadius: 10,
                padding: "24px",
                textAlign: "center",
                background: `${C}60`,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: G,
                  color: C,
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {t.upload_button}
              </button>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
                {t.upload_hint}
              </p>
              {parsing && (
                <p style={{ fontSize: 13, color: G, fontWeight: 500 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      border: `2px solid ${G}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      marginRight: 6,
                      verticalAlign: "middle",
                    }}
                  />
                  {t.parsing}
                </p>
              )}
              {!parsing && file && charCount > 0 && (
                <p style={{ fontSize: 13, color: "#2a7a5a", fontWeight: 500 }}>
                  {file.name} — {charCount.toLocaleString()} {t.chars_parsed}
                </p>
              )}
              {!parsing && !file && (
                <p style={{ fontSize: 13, color: "#aaa" }}>{t.no_file}</p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid #ffcccc",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 20,
                color: "#c0392b",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || parsing}
            style={{
              background: submitting || parsing ? "#a0b8b4" : G,
              color: C,
              border: "none",
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              cursor: submitting || parsing ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {submitting && (
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  border: `2px solid ${C}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            )}
            {submitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>

      {/* Features */}
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto 64px",
          padding: "0 16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
        }}
      >
        {[
          { title: t.feature1_title, desc: t.feature1_desc },
          { title: t.feature2_title, desc: t.feature2_desc },
          { title: t.feature3_title, desc: t.feature3_desc },
        ].map((f, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(30,56,50,0.07)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: G,
                borderRadius: 10,
                marginBottom: 16,
              }}
            />
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: G,
                marginBottom: 8,
              }}
            >
              {f.title}
            </h3>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          background: G,
          padding: "24px 32px",
          textAlign: "center",
          color: "rgba(245,240,232,0.6)",
          fontSize: 14,
        }}
      >
        {t.footer}
      </footer>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#444",
  marginBottom: 8,
  letterSpacing: "0.3px",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e0e0e0",
  borderRadius: 8,
  fontSize: 14,
  color: "#222",
  background: "#fff",
  outline: "none",
  marginBottom: 0,
  fontFamily: "inherit",
};
