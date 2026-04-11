import { Router, type IRouter } from "express";
import { db, companyProfiles, candidatesTable, jobsTable, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email));
    if (admin) {
      const valid = await bcrypt.compare(password, admin.password);
      if (valid) {
        return res.json({ success: true, adminId: admin.id, adminName: admin.name });
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
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

router.get("/admin/companies/:id", async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const [company] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, companyId));
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    const jobs = await db.select().from(jobsTable).where(eq(jobsTable.companyProfileId, companyId));
    res.json({ ...company, jobs });
  } catch (err) {
    req.log.error(err, "Failed to fetch company detail");
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

router.get("/admin/admins", async (req, res) => {
  try {
    const admins = await db.select({
      id: adminsTable.id,
      name: adminsTable.name,
      email: adminsTable.email,
      createdAt: adminsTable.createdAt,
      updatedAt: adminsTable.updatedAt,
    }).from(adminsTable);
    res.json(admins);
  } catch (err) {
    req.log.error(err, "Failed to list admins");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/admins", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "An admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [admin] = await db.insert(adminsTable).values({
      name,
      email,
      password: hashedPassword,
    }).returning({
      id: adminsTable.id,
      name: adminsTable.name,
      email: adminsTable.email,
      createdAt: adminsTable.createdAt,
    });

    res.status(201).json(admin);
  } catch (err) {
    req.log.error(err, "Failed to create admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/admins/:id", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { name, email } = req.body;

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    updates.updatedAt = new Date();

    const [updated] = await db.update(adminsTable)
      .set(updates)
      .where(eq(adminsTable.id, adminId))
      .returning({
        id: adminsTable.id,
        name: adminsTable.name,
        email: adminsTable.email,
        createdAt: adminsTable.createdAt,
        updatedAt: adminsTable.updatedAt,
      });

    if (!updated) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/admins/:id/reset-password", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.update(adminsTable)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(adminsTable.id, adminId))
      .returning({ id: adminsTable.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset admin password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/admins/:id", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);

    const allAdmins = await db.select({ id: adminsTable.id }).from(adminsTable);
    if (allAdmins.length <= 1) {
      return res.status(400).json({ error: "Cannot delete the last admin" });
    }

    const result = await db.delete(adminsTable)
      .where(eq(adminsTable.id, adminId))
      .returning({ id: adminsTable.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to delete admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
