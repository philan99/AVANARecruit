import { db, industriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

const CANONICAL_INDUSTRIES: { code: string; label: string }[] = [
  { code: "accounting_finance", label: "Accounting & Finance" },
  { code: "agriculture", label: "Agriculture" },
  { code: "automotive", label: "Automotive" },
  { code: "banking", label: "Banking" },
  { code: "construction", label: "Construction" },
  { code: "consulting", label: "Consulting" },
  { code: "creative_design", label: "Creative & Design" },
  { code: "education", label: "Education" },
  { code: "energy_utilities", label: "Energy & Utilities" },
  { code: "engineering", label: "Engineering" },
  { code: "healthcare", label: "Healthcare" },
  { code: "hospitality_tourism", label: "Hospitality & Tourism" },
  { code: "human_resources", label: "Human Resources" },
  { code: "insurance", label: "Insurance" },
  { code: "legal", label: "Legal" },
  { code: "logistics_supply_chain", label: "Logistics & Supply Chain" },
  { code: "manufacturing", label: "Manufacturing" },
  { code: "marketing_advertising", label: "Marketing & Advertising" },
  { code: "media_entertainment", label: "Media & Entertainment" },
  { code: "nonprofit", label: "Non-profit" },
  { code: "pharmaceutical", label: "Pharmaceutical" },
  { code: "property_real_estate", label: "Property & Real Estate" },
  { code: "public_sector", label: "Public Sector" },
  { code: "retail", label: "Retail" },
  { code: "sales", label: "Sales" },
  { code: "science_research", label: "Science & Research" },
  { code: "technology", label: "Technology" },
  { code: "telecommunications", label: "Telecommunications" },
  { code: "transport", label: "Transport" },
  { code: "other", label: "Other" },
];

// Legacy label -> code aliases for one-time backfill of free-text values.
const LABEL_ALIASES: Record<string, string> = {
  consultancy: "consulting",
  tech: "technology",
  it: "technology",
  finance: "accounting_finance",
};

export async function seedIndustries(): Promise<void> {
  try {
    // Upsert canonical rows. Existing rows keep their id; label/order get refreshed.
    const rows = CANONICAL_INDUSTRIES.map((ind, i) => ({
      code: ind.code,
      label: ind.label,
      displayOrder: (i + 1) * 10,
    }));
    await db
      .insert(industriesTable)
      .values(rows)
      .onConflictDoUpdate({
        target: industriesTable.code,
        set: {
          label: sql`excluded.label`,
          displayOrder: sql`excluded.display_order`,
        },
      });

    // Backfill any legacy label values in company_profiles.industry to codes.
    const codes = new Set(CANONICAL_INDUSTRIES.map(c => c.code));
    const labelToCode = new Map<string, string>();
    for (const ind of CANONICAL_INDUSTRIES) {
      labelToCode.set(ind.label.toLowerCase().trim(), ind.code);
    }
    for (const [alias, code] of Object.entries(LABEL_ALIASES)) {
      labelToCode.set(alias, code);
    }

    const stale = await db.execute<{ industry: string }>(sql`
      SELECT DISTINCT industry FROM company_profiles
      WHERE industry IS NOT NULL AND industry <> '' AND industry NOT IN (SELECT code FROM industries)
    `);
    const staleRows = (stale as any).rows ?? stale;
    for (const r of staleRows as { industry: string }[]) {
      const key = (r.industry || "").toLowerCase().trim();
      const target = labelToCode.get(key);
      if (target && codes.has(target)) {
        await db.execute(sql`
          UPDATE company_profiles SET industry = ${target} WHERE industry = ${r.industry}
        `);
        logger.info({ from: r.industry, to: target }, "Backfilled company industry");
      }
    }
  } catch (err) {
    logger.error({ err }, "Industry seeding failed");
  }
}
