export interface GeocodeResult {
  postcode: string;
  lat: number;
  lng: number;
  town: string;
  region: string | null;
  country: string;
}

export interface GeocodeError {
  ok: false;
  error: string;
}

export type GeocodeResponse = ({ ok: true } & GeocodeResult) | GeocodeError;

const POSTCODES_IO = "https://api.postcodes.io/postcodes";

function normalisePostcode(raw: string): string {
  return String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

function formatPostcode(raw: string): string {
  const n = normalisePostcode(raw);
  if (n.length < 5) return n;
  return `${n.slice(0, n.length - 3)} ${n.slice(-3)}`;
}

export async function geocodeUkPostcode(rawPostcode: string): Promise<GeocodeResponse> {
  const pc = normalisePostcode(rawPostcode);
  if (!pc) return { ok: false, error: "Postcode is required" };
  if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(pc)) {
    return { ok: false, error: "Please enter a valid UK postcode" };
  }
  try {
    const res = await fetch(`${POSTCODES_IO}/${encodeURIComponent(pc)}`);
    if (res.status === 404) {
      return { ok: false, error: "Postcode not found" };
    }
    if (!res.ok) {
      return { ok: false, error: "Postcode lookup failed, please try again" };
    }
    const data = await res.json() as { result?: { postcode: string; latitude: number; longitude: number; admin_district?: string; admin_county?: string; region?: string; country?: string; parish?: string; admin_ward?: string } };
    const r = data.result;
    if (!r) return { ok: false, error: "Postcode not found" };
    return {
      ok: true,
      postcode: r.postcode || formatPostcode(pc),
      lat: r.latitude,
      lng: r.longitude,
      town: r.admin_district || r.parish || r.admin_ward || "",
      region: r.region || r.admin_county || null,
      country: r.country || "United Kingdom",
    };
  } catch {
    return { ok: false, error: "Postcode lookup failed, please try again" };
  }
}

export function buildLocationDisplay(town: string | null | undefined, region: string | null | undefined): string {
  const t = (town || "").trim();
  const r = (region || "").trim();
  if (t && r && t.toLowerCase() !== r.toLowerCase()) return `${t}, ${r}`;
  return t || r || "";
}
