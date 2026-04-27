import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from "docx";
import PDFDocument from "pdfkit";
import type { RewrittenCv } from "./cvRewrite";

const NAVY = "1A2035";
const RULE = "C9CDD6";

// ---------------------------------------------------------------------------
// .docx
// ---------------------------------------------------------------------------

function paraText(text: string, opts: { size?: number; bold?: boolean; color?: string; spacingAfter?: number } = {}) {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 80 },
    children: [
      new TextRun({
        text,
        size: opts.size ?? 22,
        bold: !!opts.bold,
        color: opts.color,
        font: "Calibri",
      }),
    ],
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { color: RULE, style: BorderStyle.SINGLE, size: 6, space: 4 },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: NAVY,
        font: "Calibri",
      }),
    ],
  });
}

function bulletPara(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
  });
}

function roleHeader(title: string, company: string, dates: string, location?: string) {
  // Line 1: Title — bold; Company on right via tab stop
  // Line 2: Dates · Location, italic
  const headerLine = new Paragraph({
    spacing: { before: 120, after: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun({ text: title, bold: true, size: 22, font: "Calibri" }),
      ...(company ? [new TextRun({ text: ` — ${company}`, size: 22, font: "Calibri" })] : []),
      ...(dates ? [new TextRun({ text: `\t${dates}`, size: 20, font: "Calibri", color: "555555" })] : []),
    ],
  });
  const subLine = location
    ? new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: location, italics: true, size: 20, color: "555555", font: "Calibri" })],
      })
    : null;
  return subLine ? [headerLine, subLine] : [headerLine];
}

export async function renderCvToDocxBuffer(cv: RewrittenCv): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Name (centered, large)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: cv.name || "", bold: true, size: 36, color: NAVY, font: "Calibri" })],
    }),
  );

  if (cv.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: cv.headline, size: 22, color: "555555", font: "Calibri" })],
      }),
    );
  }

  // Contact line
  const contactBits = [cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedin]
    .map(s => (s || "").trim())
    .filter(Boolean);
  if (contactBits.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: contactBits.join("  ·  "), size: 20, color: "555555", font: "Calibri" }),
        ],
      }),
    );
  }

  // Summary
  if (cv.summary) {
    children.push(sectionHeading("Profile"));
    children.push(paraText(cv.summary));
  }

  // Experience
  if (cv.experience.length > 0) {
    children.push(sectionHeading("Experience"));
    for (const role of cv.experience) {
      children.push(...roleHeader(role.title, role.company, role.dates, role.location));
      for (const b of role.bullets) {
        children.push(bulletPara(b));
      }
    }
  }

  // Education
  if (cv.education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const ed of cv.education) {
      const line = [ed.qualification, ed.institution].filter(Boolean).join(" — ");
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 0 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: line, bold: true, size: 22, font: "Calibri" }),
            ...(ed.dates ? [new TextRun({ text: `\t${ed.dates}`, size: 20, color: "555555", font: "Calibri" })] : []),
          ],
        }),
      );
      if (ed.details) children.push(paraText(ed.details, { size: 20, color: "555555" }));
    }
  }

  // Skills
  if (cv.skills.length > 0) {
    children.push(sectionHeading("Skills"));
    children.push(paraText(cv.skills.join("  ·  ")));
  }

  // Qualifications
  if (cv.qualifications && cv.qualifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const q of cv.qualifications) children.push(bulletPara(q));
  }

  // Additional sections
  for (const sec of cv.additional || []) {
    children.push(sectionHeading(sec.title));
    for (const i of sec.items) children.push(bulletPara(i));
  }

  const doc = new Document({
    creator: "AVANA Recruit",
    title: `${cv.name || "Candidate"} — CV`,
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children,
      },
    ],
  });

  const arrayBuffer = await Packer.toBuffer(doc);
  return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// .pdf  (PDFKit)
//
// Layout principles:
//  - Two-column role headers use measurePadded text for both columns and then
//    advance the cursor to MAX(leftEndY, rightEndY) so the next line never
//    overlaps a wrapped title.
//  - Bullets render as a separate glyph + a hanging-indent text block so
//    wrapped lines align with the start of the bullet text, not the glyph.
//  - Section headings page-break together with at least one paragraph of
//    content so we never orphan a heading at the bottom of a page.
// ---------------------------------------------------------------------------

export async function renderCvToPdfBuffer(cv: RewrittenCv): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 54, bottom: 54, left: 54, right: 54 },
        bufferPages: true,
        info: {
          Title: `${cv.name || "Candidate"} — CV`,
          Author: cv.name || "Candidate",
          Creator: "AVANA Recruit",
        },
      });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const LEFT = doc.page.margins.left;
      const PAGE_W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const PAGE_BOTTOM = () => doc.page.height - doc.page.margins.bottom;
      const NAVY_RGB = "#1A2035";
      const MUTED = "#5A6573";
      const RULE_RGB = "#C9CDD6";
      const BODY = 10.5;
      const SMALL = 9.5;
      const LEAD = 2; // line gap

      const setBody = () => doc.font("Helvetica").fontSize(BODY).fillColor("#000");

      // Page-break helper — if not enough room, add a new page and reset Y.
      const ensureSpace = (needed: number) => {
        if (doc.y + needed > PAGE_BOTTOM()) {
          doc.addPage();
        }
      };

      // Section heading + horizontal rule. Page-breaks together with `minBodyAfter`
      // points of body content so we never orphan a heading.
      const heading = (title: string, minBodyAfter = 24) => {
        const HEADING_BLOCK = 26 + minBodyAfter;
        ensureSpace(HEADING_BLOCK);
        doc.moveDown(0.5);
        const y0 = doc.y;
        doc
          .font("Helvetica-Bold")
          .fontSize(10.5)
          .fillColor(NAVY_RGB)
          .text(title.toUpperCase(), LEFT, y0, {
            width: PAGE_W,
            characterSpacing: 0.6,
            lineGap: 0,
          });
        const ruleY = doc.y + 2;
        doc.save()
          .moveTo(LEFT, ruleY)
          .lineTo(LEFT + PAGE_W, ruleY)
          .lineWidth(0.6)
          .strokeColor(RULE_RGB)
          .stroke()
          .restore();
        doc.y = ruleY + 6;
        setBody();
      };

      const paragraph = (
        text: string,
        opts: {
          size?: number;
          color?: string;
          bold?: boolean;
          italic?: boolean;
          align?: "left" | "center" | "right" | "justify";
        } = {},
      ) => {
        const fontName =
          opts.bold && opts.italic
            ? "Helvetica-BoldOblique"
            : opts.bold
            ? "Helvetica-Bold"
            : opts.italic
            ? "Helvetica-Oblique"
            : "Helvetica";
        doc
          .font(fontName)
          .fontSize(opts.size ?? BODY)
          .fillColor(opts.color ?? "#000")
          .text(text, LEFT, doc.y, {
            width: PAGE_W,
            lineGap: LEAD,
            align: opts.align ?? "left",
          });
      };

      // Bullet with proper hanging indent — wrapped lines align with the
      // text column, not under the bullet glyph.
      const BULLET_INDENT = 14;
      const bullet = (text: string) => {
        const startY = doc.y;
        ensureSpace(BODY + LEAD);
        const y = doc.y;
        doc
          .font("Helvetica")
          .fontSize(BODY)
          .fillColor("#000")
          .text("•", LEFT, y, { width: BULLET_INDENT, lineGap: LEAD });
        // text() advanced y; reset and draw the body in the right-hand column.
        doc.y = y;
        doc
          .font("Helvetica")
          .fontSize(BODY)
          .fillColor("#000")
          .text(text, LEFT + BULLET_INDENT, y, {
            width: PAGE_W - BULLET_INDENT,
            lineGap: LEAD,
            align: "left",
          });
        doc.y += 1;
        // Reference to suppress unused-var lint in case of future refactor
        void startY;
      };

      // Two-column line: bold label on the left, muted text on the right.
      // Cursor lands at MAX(leftEndY, rightEndY) so wrapping never overlaps.
      const twoColumnLine = (
        left: string,
        right: string | undefined,
        opts: { boldLeft?: boolean; size?: number } = {},
      ) => {
        const size = opts.size ?? BODY;
        const startY = doc.y;
        ensureSpace(size + LEAD + 4);
        const y = doc.y;
        const leftW = PAGE_W * 0.62;
        const rightW = PAGE_W * 0.38;

        // Left column
        doc
          .font(opts.boldLeft ? "Helvetica-Bold" : "Helvetica")
          .fontSize(size)
          .fillColor("#000")
          .text(left, LEFT, y, { width: leftW, lineGap: LEAD });
        const leftEndY = doc.y;

        // Right column at the same start Y
        let rightEndY = y;
        if (right) {
          doc.y = y;
          doc
            .font("Helvetica")
            .fontSize(size)
            .fillColor(MUTED)
            .text(right, LEFT + leftW, y, {
              width: rightW,
              align: "right",
              lineGap: LEAD,
            });
          rightEndY = doc.y;
        }

        doc.y = Math.max(leftEndY, rightEndY);
        void startY;
      };

      // ============================================================
      // Header
      // ============================================================
      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(NAVY_RGB)
        .text(cv.name || "", LEFT, doc.y, { width: PAGE_W, align: "center" });

      if (cv.headline) {
        doc.moveDown(0.15);
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor(MUTED)
          .text(cv.headline, LEFT, doc.y, { width: PAGE_W, align: "center" });
      }

      const contactBits = [cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedin]
        .map(s => (s || "").trim())
        .filter(Boolean);
      if (contactBits.length > 0) {
        doc.moveDown(0.25);
        doc
          .font("Helvetica")
          .fontSize(SMALL)
          .fillColor(MUTED)
          .text(contactBits.join("  ·  "), LEFT, doc.y, { width: PAGE_W, align: "center" });
      }
      doc.moveDown(0.3);

      // ============================================================
      // Profile
      // ============================================================
      if (cv.summary) {
        heading("Profile");
        paragraph(cv.summary);
      }

      // ============================================================
      // Experience
      // ============================================================
      if (cv.experience.length > 0) {
        heading("Experience");
        for (let i = 0; i < cv.experience.length; i++) {
          const role = cv.experience[i];
          // Keep the role title and at least the first bullet together.
          ensureSpace(48);
          twoColumnLine(
            `${role.title}${role.company ? ` — ${role.company}` : ""}`,
            role.dates || undefined,
            { boldLeft: true },
          );
          if (role.location) {
            paragraph(role.location, { italic: true, color: MUTED, size: SMALL });
            doc.moveDown(0.05);
          } else {
            doc.moveDown(0.1);
          }
          for (const b of role.bullets) bullet(b);
          if (i < cv.experience.length - 1) doc.moveDown(0.35);
        }
      }

      // ============================================================
      // Education
      // ============================================================
      if (cv.education.length > 0) {
        heading("Education");
        for (let i = 0; i < cv.education.length; i++) {
          const ed = cv.education[i];
          const left = [ed.qualification, ed.institution].filter(Boolean).join(" — ");
          twoColumnLine(left, ed.dates || undefined, { boldLeft: true });
          if (ed.details) {
            paragraph(ed.details, { color: MUTED, size: SMALL });
          }
          if (i < cv.education.length - 1) doc.moveDown(0.2);
        }
      }

      // ============================================================
      // Skills
      // ============================================================
      if (cv.skills.length > 0) {
        heading("Skills");
        paragraph(cv.skills.join("  ·  "));
      }

      // ============================================================
      // Certifications
      // ============================================================
      if (cv.qualifications && cv.qualifications.length > 0) {
        heading("Certifications");
        for (const q of cv.qualifications) bullet(q);
      }

      // ============================================================
      // Additional sections
      // ============================================================
      for (const sec of cv.additional || []) {
        if (!sec.items?.length) continue;
        heading(sec.title);
        for (const item of sec.items) bullet(item);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
