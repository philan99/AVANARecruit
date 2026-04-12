import { Router, type IRouter } from "express";
import { db, companyProfiles } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCompanyProfileBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/companies/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [company] = await db.select().from(companyProfiles).where(eq(companyProfiles.email, email));
    if (!company) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!company.password) {
      return res.status(401).json({ error: "No password set for this account. Please contact an admin." });
    }

    const valid = await bcrypt.compare(password, company.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ success: true, companyId: company.id, companyName: company.name });
  } catch (err) {
    req.log.error(err, "Company login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/company-profile", async (req, res) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : null;
    let profile;
    if (companyId) {
      [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, companyId));
    } else {
      [profile] = await db.select().from(companyProfiles).limit(1);
    }
    if (!profile) {
      return res.status(404).json({ error: "No company profile found" });
    }
    res.json(profile);
  } catch (err) {
    req.log.error(err, "Failed to get company profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/company-profile", async (req, res) => {
  try {
    const parsed = CreateCompanyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Company name is required" });
    }
    const body = parsed.data;

    const password = req.body.password;

    if (body.email) {
      const [existingEmail] = await db
        .select()
        .from(companyProfiles)
        .where(eq(companyProfiles.email, body.email));
      if (existingEmail) {
        return res.status(409).json({ error: "A company with this email already exists" });
      }
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [created] = await db
      .insert(companyProfiles)
      .values({
        ...body,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      })
      .returning();
    res.json(created);
  } catch (err) {
    req.log.error(err, "Failed to save company profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/company-profile/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const [existing] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Company not found" });
    }

    const { password: _pw, id: _id, createdAt: _ca, ...updateFields } = req.body;

    const [updated] = await db
      .update(companyProfiles)
      .set({
        ...updateFields,
        updatedAt: sql`now()`,
      })
      .where(eq(companyProfiles.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update company profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
