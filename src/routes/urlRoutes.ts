import express from "express";

import {
  createShortUrl,
  handleRedirectToOriginalUrl,
  getUserUrls,
  getQRCodeForUrl,
} from "../controllers/urlController.js";
import { protect } from "../controllers/authController.js";
import { trackMiddleware } from "../middleware/trackMiddleware.js";

const router = express.Router();
// router.use(protect);

router.post("/short/shorten", protect, createShortUrl);

router.get(
  "/short/:shortCode",
  trackMiddleware,
  handleRedirectToOriginalUrl
);
router.get("/short/getAllUrls", protect, getUserUrls);
router.get("/short/url/:urlId", getQRCodeForUrl);
export default router;
