import { Router, type IRouter } from "express";
import { db, companyProfiles, candidatesTable } from "@workspace/db";

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

export default router;
