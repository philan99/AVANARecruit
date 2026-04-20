import { Router, type IRouter } from "express";
import { db, companyProfiles, companyUsers, candidatesTable, adminsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "../lib/sessions";

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
        const sessionToken = await createSession("admin", admin.id);
        res.json({ success: true, role: "admin", adminId: admin.id, name: admin.name, sessionToken });
        return;
      }
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
        const sessionToken = await createSession("candidate", candidate.id);
        res.json({ success: true, role: "candidate", candidateId: candidate.id, name: candidate.name, sessionToken });
        return;
      }
    }

    const [companyUser] = await db
      .select({
        id: companyUsers.id,
        companyProfileId: companyUsers.companyProfileId,
        email: companyUsers.email,
        password: companyUsers.password,
        verified: companyUsers.verified,
        role: companyUsers.role,
        name: companyUsers.name,
        companyName: companyProfiles.name,
      })
      .from(companyUsers)
      .innerJoin(companyProfiles, eq(companyProfiles.id, companyUsers.companyProfileId))
      .where(eq(companyUsers.email, lowerEmail));

    if (companyUser && companyUser.password) {
      const valid = await bcrypt.compare(password, companyUser.password);
      if (valid) {
        if (!companyUser.verified) {
          res.status(403).json({ error: "Please verify your email address before logging in.", unverified: true, email: companyUser.email });
          return;
        }
        await db.update(companyUsers).set({ lastLoginAt: sql`now()` }).where(eq(companyUsers.id, companyUser.id));
        const sessionToken = await createSession("company", companyUser.id);
        res.json({
          success: true,
          role: "company",
          companyId: companyUser.companyProfileId,
          companyName: companyUser.companyName,
          companyUserId: companyUser.id,
          companyUserRole: companyUser.role,
          name: companyUser.name,
          sessionToken,
        });
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
