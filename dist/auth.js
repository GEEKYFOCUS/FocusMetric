var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateUser, findUserById } from "./controllers/authController.js";
dotenv.config({
    path: "./config.env",
});
// Replace with your Google credentials
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET";
console.log(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback", // Ensure this matches your redirect URI
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find or create the user in your database
        console.log("profile: created", profile);
        const user = yield findOrCreateUser(profile, done);
        // await user.save({ validateBeforeSave: false });
        console.log("user-save-successfully", user);
        if (!user) {
            return done(null, false, { message: "User not found" });
        }
        done(null, user);
    }
    catch (error) {
        done(error);
    }
})));
// Serialize user into session
passport.serializeUser((user, done) => done(null, user.id));
// Deserialize user from session
passport.deserializeUser((id, done) => {
    // Replace with a function to find user by ID
    findUserById(id).then((user) => done(null, user));
});
export default passport;
