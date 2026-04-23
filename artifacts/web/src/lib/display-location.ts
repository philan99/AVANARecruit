export function publicLocation(entity: unknown): string {
  if (!entity || typeof entity !== "object") return "";
  const e = entity as Record<string, unknown>;
  const town = typeof e.town === "string" ? e.town.trim() : "";
  const location = typeof e.location === "string" ? e.location.trim() : "";
  if (town) return town;
  return location;
}
