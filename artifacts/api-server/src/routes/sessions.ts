import { Router, type IRouter } from "express";
import { validateAndTouch, deleteSession } from "../lib/sessions";

const router: IRouter = Router();

router.post("/sessions/heartbeat", async (req, res): Promise<void> => {
  try {
    const { token } = req.body ?? {};
    if (!token || typeof token !== "string") {
      res.status(401).json({ valid: false, error: "Missing session token" });
      return;
    }
    const session = await validateAndTouch(token);
    if (!session) {
      res.status(401).json({ valid: false, error: "Session expired" });
      return;
    }
    res.json({ valid: true, lastActivityAt: session.lastActivityAt });
  } catch (err) {
    req.log.error(err, "Session heartbeat failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions/logout", async (req, res): Promise<void> => {
  try {
    const { token } = req.body ?? {};
    if (token && typeof token === "string") {
      await deleteSession(token);
    }
    res.status(204).end();
  } catch (err) {
    req.log.error(err, "Session logout failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
