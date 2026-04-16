import { Router, type IRouter } from "express";
import { db, companyProfiles, candidatesTable, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const lowerEmail = email.toLowerCase().trim();

    const [admin] = await db
      .select({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, password: adminsTable.password })
      .from(adminsTable)
      .where(eq(adminsTable.email, lowerEmail));

    if (admin && admin.password) {
      const valid = await bcrypt.compare(password, admin.password);
      if (valid) {
        res.json({ success: true, role: "admin", adminId: admin.id, name: admin.name });
        return;
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword && lowerEmail === adminEmail.toLowerCase() && password === adminPassword) {
      res.json({ success: true, role: "admin" });
      return;
    }

    const [candidate] = await db
      .select({
        id: candidatesTable.id,
        name: candidatesTable.name,
        email: candidatesTable.email,
        password: candidatesTable.password,
        verified: candidatesTable.verified,
      })
      .from(candidatesTable)
      .where(eq(candidatesTable.email, lowerEmail));

    if (candidate && candidate.password) {
      const valid = await bcrypt.compare(password, candidate.password);
      if (valid) {
        if (!candidate.verified) {
          res.status(403).json({ error: "Please verify your email address before logging in.", unverified: true, email: candidate.email });
          return;
        }
        res.json({ success: true, role: "candidate", candidateId: candidate.id, name: candidate.name });
        return;
      }
    }

    const [company] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.email, lowerEmail));

    if (company && company.password) {
      const valid = await bcrypt.compare(password, company.password);
      if (valid) {
        if (!company.verified) {
          res.status(403).json({ error: "Please verify your email address before logging in.", unverified: true, email: company.email });
          return;
        }
        res.json({ success: true, role: "company", companyId: company.id, companyName: company.name });
        return;
      }
    }

    res.status(401).json({ error: "Invalid email or password" });
  } catch (err) {
    req.log.error(err, "Unified login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
