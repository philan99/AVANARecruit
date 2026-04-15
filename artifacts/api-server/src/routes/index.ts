import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import matchesRouter from "./matches";
import companyProfileRouter from "./companyProfile";
import storageRouter from "./storage";
import adminRouter from "./admin";
import favouritesRouter from "./favourites";
import contactRouter from "./contact";
import verificationsRouter from "./verifications";
import passwordResetRouter from "./passwordReset";
import emailVerificationRouter from "./emailVerification";
import bookmarksRouter from "./bookmarks";
import chatRouter from "./chat";
import jobAlertsRouter from "./jobAlerts";
import candidateAlertsRouter from "./candidateAlerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(candidatesRouter);
router.use(matchesRouter);
router.use(companyProfileRouter);
router.use(storageRouter);
router.use(adminRouter);
router.use(favouritesRouter);
router.use(bookmarksRouter);
router.use(contactRouter);
router.use(verificationsRouter);
router.use(passwordResetRouter);
router.use(emailVerificationRouter);
router.use(chatRouter);
router.use(jobAlertsRouter);
router.use(candidateAlertsRouter);

export default router;
