import { Router, type IRouter } from "express";
import { db, companyProfiles, candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({ error: "Admin credentials not configured" });
    }

    if (email === adminEmail && password === adminPassword) {
      return res.json({ success: true });
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    req.log.error(err, "Admin login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/companies", async (req, res) => {
  try {
    const companies = await db.select().from(companyProfiles);
    res.json(companies);
  } catch (err) {
    req.log.error(err, "Failed to list companies");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/candidates", async (req, res) => {
  try {
    const candidates = await db.select().from(candidatesTable);
    res.json(candidates);
  } catch (err) {
    req.log.error(err, "Failed to list candidates");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/companies/:id/reset-password", async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .update(companyProfiles)
      .set({ password: hashedPassword })
      .where(eq(companyProfiles.id, companyId))
      .returning({ id: companyProfiles.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset company password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/candidates/:id/reset-password", async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .update(candidatesTable)
      .set({ password: hashedPassword })
      .where(eq(candidatesTable.id, candidateId))
      .returning({ id: candidatesTable.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset candidate password");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
