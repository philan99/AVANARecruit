// Render-safety helper for the candidate "Recruiter Pitch" field.
//
// New pitches are stored as sanitised HTML produced by our server allowlist
// (see artifacts/api-server/src/routes/recruiterPitch.ts:cleanPitchHtml).
// Older rows in the database may contain plain text from before the rich-text
// migration — including text that happens to contain `<` or HTML-looking
// fragments. We must not pass that to dangerouslySetInnerHTML untouched.
//
// Rule: only treat the value as HTML when it starts with one of the block
// tags our server sanitiser is known to emit. Anything else is HTML-escaped
// and wrapped in a <p> so it renders safely inside the prose container.

const SAFE_BLOCK_PREFIX = /^\s*<(p|ul|ol|h1|h2|h3|h4|hr)[\s>]/i;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toSafePitchHtml(pitch: string | null | undefined): string {
  if (!pitch) return "";
  if (SAFE_BLOCK_PREFIX.test(pitch)) {
    return pitch;
  }
  return `<p>${escapeHtml(pitch)}</p>`;
}
