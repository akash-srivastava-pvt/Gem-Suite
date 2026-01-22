import { Router } from "express";
import { ResumeController } from "../controllers/resumeController.js";

const router: Router = Router();

router.get("/", ResumeController.getResume);
router.post("/", ResumeController.saveResume);
router.post("/generate-ats", ResumeController.generateATS);
router.post("/generate-cover-letter", ResumeController.generateCoverLetter);
router.post("/generate-sop", ResumeController.generateSOP);

export default router;
