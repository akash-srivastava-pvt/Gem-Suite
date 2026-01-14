import { Router } from "express";

export const apiRouter: Router = Router();

// Import individual route modules
import activateRouts from "./activateRoutes.js";
import tripRoutes from "./tripRoutes.js";
import textEditorRoutes from "./textEditorRoutes.js";
import invitationRoutes from "./invitationRoutes.js";
import userRoutes from "./user.routes.js";


// Mount individual route modules onto the main API router
apiRouter.use("/activate", activateRouts);
apiRouter.use("/trip", tripRoutes);
apiRouter.use("/text-editor", textEditorRoutes);
apiRouter.use("/invitation", invitationRoutes);
apiRouter.use("/user", userRoutes);


