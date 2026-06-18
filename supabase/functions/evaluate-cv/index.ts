import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { job_title, job_desc, qualifications, cv_text, lang } = await req.json();

    // @ts-ignore Supabase.ai is available in Edge Function runtime
    const session = new Supabase.ai.Session("gte-small");

    const cvSentences = splitSentences(cv_text);

    // Generate embeddings for all CV sentences
    const cvEmbeddings: number[][] = await Promise.all(
      cvSentences.map((s) =>
        session.run(s, { mean_pool: true, normalize: true }).then((r: Float32Array) =>
          Array.from(r)
        )
      )
    );

    const checklist: { qualification: string; met: boolean; evidence: string; similarity: number }[] = [];
    let metCount = 0;

    for (const qualification of qualifications) {
      const qualEmbedding: number[] = Array.from(
        await session.run(qualification, { mean_pool: true, normalize: true })
      );

      let maxSim = 0;
      let bestSentence = "";

      for (let i = 0; i < cvSentences.length; i++) {
        const sim = cosineSimilarity(qualEmbedding, cvEmbeddings[i]);
        if (sim > maxSim) {
          maxSim = sim;
          bestSentence = cvSentences[i];
        }
      }

      const met = maxSim > 0.45;
      if (met) metCount++;

      const noEvidence = lang === "id" ? "Tidak ditemukan bukti yang relevan." : "No relevant evidence found.";

      checklist.push({
        qualification,
        met,
        evidence: met ? bestSentence : noEvidence,
        similarity: Math.round(maxSim * 100),
      });
    }

    const score = Math.round((metCount / qualifications.length) * 100);

    let summary = "";
    if (lang === "id") {
      if (score >= 80) {
        summary = `Kandidat memenuhi ${metCount} dari ${qualifications.length} kualifikasi yang dibutuhkan. Profil kandidat sangat sesuai dengan posisi ${job_title} dan direkomendasikan untuk tahap selanjutnya.`;
      } else if (score >= 60) {
        summary = `Kandidat memenuhi ${metCount} dari ${qualifications.length} kualifikasi. Cukup sesuai untuk posisi ${job_title}, namun terdapat beberapa area kualifikasi yang perlu diperhatikan lebih lanjut.`;
      } else if (score >= 40) {
        summary = `Kandidat hanya memenuhi ${metCount} dari ${qualifications.length} kualifikasi yang dibutuhkan. Profil kurang sesuai untuk posisi ${job_title} — pertimbangkan untuk mencari kandidat lain.`;
      } else {
        summary = `Kandidat hanya memenuhi ${metCount} dari ${qualifications.length} kualifikasi. Profil kandidat tidak sesuai dengan kebutuhan posisi ${job_title}.`;
      }
    } else {
      if (score >= 80) {
        summary = `Candidate meets ${metCount} out of ${qualifications.length} required qualifications. The profile is an excellent match for ${job_title} and is recommended for the next stage.`;
      } else if (score >= 60) {
        summary = `Candidate meets ${metCount} out of ${qualifications.length} qualifications. A reasonable match for ${job_title}, though some qualification areas need further attention.`;
      } else if (score >= 40) {
        summary = `Candidate only meets ${metCount} out of ${qualifications.length} required qualifications. The profile is a weak match for ${job_title} — consider other candidates.`;
      } else {
        summary = `Candidate only meets ${metCount} out of ${qualifications.length} qualifications. The profile does not align well with the ${job_title} position requirements.`;
      }
    }

    return new Response(JSON.stringify({ score, summary, checklist }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Evaluation failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
