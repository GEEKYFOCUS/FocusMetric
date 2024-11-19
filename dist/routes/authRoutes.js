import express from "express";
import passport from "passport";
import { createSendToken } from "../controllers/authController";
import { HttpStatus } from "../helpers/httpsStatus";
const router = express.Router();
// Start the Google OAuth flow
router.get("/auth/google", passport.authenticate("google", {
    // Request desired scopes
    scope: ["profile", "email"],
}));
// Google callback URI
router.get("/auth/google/callback", passport.authenticate("google", {
    // Redirect on failure
    failureRedirect: "/login",
}), (req, res) => {
    // Successful authentication
    res.redirect("/"); // Redirect to the desired page
    createSendToken(req.user, HttpStatus.OK, req, res);
});
export default router;
//# sourceMappingURL=authRoutes.js.map