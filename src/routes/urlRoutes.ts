import express from "express";

import {
  createShortUrl,
  handleRedirectToOriginalUrl,
  getUserUrls,
  getQRCodeForUrl,
} from "../controllers/urlController";
import { protect } from "../controllers/authController";
import { trackMiddleware } from "../middleware/trackMiddleware";

const router = express.Router();
// router.use(protect);

router.post("/short/shorten", createShortUrl);

router.get("/short/:shortCode", trackMiddleware, handleRedirectToOriginalUrl);
router.get("/short/getAllUrls", getUserUrls);
router.get("/short/url/:urlId", getQRCodeForUrl);
export default router;
