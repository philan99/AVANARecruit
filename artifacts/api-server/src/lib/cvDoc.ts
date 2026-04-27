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
// ---------------------------------------------------------------------------

export async function renderCvToPdfBuffer(cv: RewrittenCv): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
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

      const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const NAVY_RGB = "#1A2035";
      const MUTED = "#555555";
      const RULE_RGB = "#C9CDD6";

      const heading = (title: string) => {
        doc.moveDown(0.6);
        doc.fontSize(11).fillColor(NAVY_RGB).font("Helvetica-Bold").text(title.toUpperCase(), { characterSpacing: 0.5 });
        const y = doc.y + 1;
        doc
          .moveTo(doc.page.margins.left, y)
          .lineTo(doc.page.margins.left + PAGE_WIDTH, y)
          .lineWidth(0.6)
          .strokeColor(RULE_RGB)
          .stroke();
        doc.moveDown(0.4);
        doc.fillColor("black");
      };

      const para = (text: string, opts: { size?: number; color?: string; bold?: boolean } = {}) => {
        doc.fillColor(opts.color || "black")
          .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(opts.size || 10.5)
          .text(text, { align: "left", lineGap: 2 });
      };

      const bullet = (text: string) => {
        doc.fillColor("black").font("Helvetica").fontSize(10.5);
        doc.text(`•  ${text}`, { indent: 10, lineGap: 2, paragraphGap: 1 });
      };

      // Header — name centered
      doc.fillColor(NAVY_RGB).font("Helvetica-Bold").fontSize(22).text(cv.name || "", { align: "center" });
      if (cv.headline) {
        doc.moveDown(0.1);
        doc.fillColor(MUTED).font("Helvetica").fontSize(11).text(cv.headline, { align: "center" });
      }
      const contactBits = [cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedin]
        .map(s => (s || "").trim())
        .filter(Boolean);
      if (contactBits.length > 0) {
        doc.moveDown(0.2);
        doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(contactBits.join("  ·  "), { align: "center" });
      }
      doc.moveDown(0.4);

      if (cv.summary) {
        heading("Profile");
        para(cv.summary);
      }

      if (cv.experience.length > 0) {
        heading("Experience");
        for (const role of cv.experience) {
          // Title (bold) — Company  ......  Dates (right)
          const startY = doc.y;
          doc.font("Helvetica-Bold").fontSize(11).fillColor("black");
          const leftText = `${role.title}${role.company ? ` — ${role.company}` : ""}`;
          doc.text(leftText, doc.page.margins.left, startY, {
            width: PAGE_WIDTH * 0.7,
            continued: false,
          });
          if (role.dates) {
            doc.font("Helvetica").fontSize(10).fillColor(MUTED);
            doc.text(role.dates, doc.page.margins.left + PAGE_WIDTH * 0.7, startY, {
              width: PAGE_WIDTH * 0.3,
              align: "right",
            });
          }
          // Reset Y to bottom of header line so location appears below
          if (role.location) {
            doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(MUTED).text(role.location, {
              width: PAGE_WIDTH,
            });
          } else {
            doc.moveDown(0.1);
          }
          for (const b of role.bullets) bullet(b);
          doc.moveDown(0.2);
        }
      }

      if (cv.education.length > 0) {
        heading("Education");
        for (const ed of cv.education) {
          const startY = doc.y;
          const left = [ed.qualification, ed.institution].filter(Boolean).join(" — ");
          doc.font("Helvetica-Bold").fontSize(11).fillColor("black").text(left, doc.page.margins.left, startY, {
            width: PAGE_WIDTH * 0.7,
          });
          if (ed.dates) {
            doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(ed.dates, doc.page.margins.left + PAGE_WIDTH * 0.7, startY, {
              width: PAGE_WIDTH * 0.3,
              align: "right",
            });
          }
          if (ed.details) {
            doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(ed.details, { width: PAGE_WIDTH });
          }
          doc.moveDown(0.2);
        }
      }

      if (cv.skills.length > 0) {
        heading("Skills");
        para(cv.skills.join("  ·  "));
      }

      if (cv.qualifications && cv.qualifications.length > 0) {
        heading("Certifications");
        for (const q of cv.qualifications) bullet(q);
      }

      for (const sec of cv.additional || []) {
        heading(sec.title);
        for (const i of sec.items) bullet(i);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
