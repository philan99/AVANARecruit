import { Router } from "express";
import { db, contactSubmissions } from "@workspace/db";

const router = Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message, contactType, company } = req.body;

    if (!contactType || !["company", "candidate"].includes(contactType)) {
      return res.status(400).json({ error: "Please select Company or Candidate" });
    }
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (contactType === "company" && !company?.trim()) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        contactType,
        company: contactType === "company" ? company.trim() : null,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      })
      .returning();

    res.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

export default router;
