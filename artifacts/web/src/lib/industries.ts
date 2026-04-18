// Canonical code -> label map. Mirrors the seeded `industries` table.
// Keep in sync with the DB seed; the API at GET /api/industries is the
// authoritative source for dropdowns, this map is only for synchronous display.
export const INDUSTRY_LABEL_MAP: Record<string, string> = {
  accounting_finance: "Accounting & Finance",
  agriculture: "Agriculture",
  automotive: "Automotive",
  banking: "Banking",
  construction: "Construction",
  consulting: "Consulting",
  creative_design: "Creative & Design",
  education: "Education",
  energy_utilities: "Energy & Utilities",
  engineering: "Engineering",
  healthcare: "Healthcare",
  hospitality_tourism: "Hospitality & Tourism",
  human_resources: "Human Resources",
  insurance: "Insurance",
  legal: "Legal",
  logistics_supply_chain: "Logistics & Supply Chain",
  manufacturing: "Manufacturing",
  marketing_advertising: "Marketing & Advertising",
  media_entertainment: "Media & Entertainment",
  nonprofit: "Non-profit",
  pharmaceutical: "Pharmaceutical",
  property_real_estate: "Property & Real Estate",
  public_sector: "Public Sector",
  retail: "Retail",
  sales: "Sales",
  science_research: "Science & Research",
  technology: "Technology",
  telecommunications: "Telecommunications",
  transport: "Transport",
  other: "Other",
};

export function formatIndustry(code: string | null | undefined): string {
  if (!code) return "";
  return INDUSTRY_LABEL_MAP[code] || code;
}
