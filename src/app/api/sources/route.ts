import { NextResponse } from "next/server";
import sourcesData from "../../../../data/sources.json";
import rulesData from "../../../../data/cultural_rules.json";

export async function GET() {
  const rules = (rulesData as any).rules || [];
  
  const enrichedSources = sourcesData.map((src: any) => {
    const citedRules = rules
      .filter((r: any) => r.source_ids?.includes(src.id))
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        level: r.level,
        message_vi: r.message_vi,
        confidence: r.confidence,
      }));

    return {
      ...src,
      cited_rules: citedRules,
    };
  });

  return NextResponse.json({
    sources: enrichedSources,
    total: enrichedSources.length,
  });
}
