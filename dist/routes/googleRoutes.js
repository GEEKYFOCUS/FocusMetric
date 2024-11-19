import express from "express";
import passport from "passport";
const router = express.Router();
// Start the Google OAuth flow
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"], // Request desired scopes
}));
// Google callback URI
router.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login", // Redirect on failure
}), (req, res) => {
    // Successful authentication
    res.redirect("/"); // Redirect to the desired page
});
export default router;
//# sourceMappingURL=googleRoutes.js.map