import { Router } from "express";

export const apiRouter: Router = Router();

// Import individual route modules
import activateRouts from "./activateRoutes.js";
import tripRoutes from "./tripRoutes.js";
import textEditorRoutes from "./textEditorRoutes.js";
import invitationRoutes from "./invitationRoutes.js";
import userRoutes from "./user.routes.js";
import resumeRoutes from "./resumeRoutes.js";
import persistenceRoutes from "./persistenceRoutes.js";
import apiKeysRoutes from "./apiKeysRoutes.js";
import aiRoutes from "./aiRoutes.js";
import unlockRoutes from "./unlockRoutes.js";
import { createGemVityaRoutes } from "./gemVityaRoutes.js";
import { db } from "@gem/db";

console.log('🔧 All route modules imported');


// Mount individual route modules onto the main API router
console.log('🔧 Mounting routes...');
apiRouter.use("/activate", activateRouts);
apiRouter.use("/trip", tripRoutes);
apiRouter.use("/text-editor", textEditorRoutes);
apiRouter.use("/invitation", invitationRoutes);
apiRouter.use("/user", userRoutes);
apiRouter.use("/resume", resumeRoutes);
apiRouter.use("/persistence", persistenceRoutes);
apiRouter.use("/api-keys", apiKeysRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/unlock", unlockRoutes);
apiRouter.use("/gem-vitya", createGemVityaRoutes(db, null));
console.log('✅ All routes mounted');


