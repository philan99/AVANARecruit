import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import WordExtractor from "word-extractor";

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
  }
  return Buffer.concat(chunks);
}

export async function extractCvText(buffer: Buffer, fileName: string): Promise<string> {
  const lower = (fileName || "").toLowerCase();
  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  if (lower.endsWith(".doc")) {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    return doc.getBody() || "";
  }
  if (lower.endsWith(".txt")) {
    return buffer.toString("utf8");
  }
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

export function normaliseCvText(text: string, maxChars = 30000): string {
  let t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length > maxChars) t = t.slice(0, maxChars);
  return t;
}
