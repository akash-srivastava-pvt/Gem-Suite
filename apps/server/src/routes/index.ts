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
console.log('✅ All routes mounted');


