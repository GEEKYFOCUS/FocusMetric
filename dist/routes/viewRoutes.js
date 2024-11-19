import express from "express";
import { getOverView } from "../controllers/viewController";
const router = express.Router();
router.get("/", getOverView);
export default router;
//# sourceMappingURL=viewRoutes.js.map