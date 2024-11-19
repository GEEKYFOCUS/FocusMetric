import express, { Request, Response, NextFunction } from "express";

import { getOverView } from "../controllers/viewController.js";

const router = express.Router();

router.get("/", getOverView);

export default router;
