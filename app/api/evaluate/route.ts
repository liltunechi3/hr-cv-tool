import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface EvaluateRequest {
  job_title: string;
  job_desc: string;
  qualifications: string[];
  cv_text: string;
  session_id: string;
  lang: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateRequest = await request.json();
    const { job_title, job_desc, qualifications, cv_text, session_id, lang } = body;

    if (!job_title || !qualifications?.length || !cv_text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: fnData, error: fnError } = await supabase.functions.invoke("evaluate-cv", {
      body: { job_title, job_desc, qualifications, cv_text, lang },
    });

    if (fnError) {
      console.error("Edge function error:", fnError);
      return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
    }

    const { score, summary, checklist } = fnData as {
      score: number;
      summary: string;
      checklist: { qualification: string; met: boolean; evidence: string }[];
    };

    const { data, error } = await supabase
      .from("evaluations")
      .insert({
        session_id,
        job_title,
        job_desc,
        qualifications,
        cv_text,
        score,
        summary,
        checklist,
        lang,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
