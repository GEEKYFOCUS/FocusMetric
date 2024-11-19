var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";
import Email from "../utils/email.js";
import User from "../models/userModel.js";
import { HttpStatus } from "../helpers/httpsStatus.js";
import AppError from "../utils/appError.js";
const jwtVerify = (token, secret) => new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
        if (err)
            reject(err);
        else
            resolve(decoded);
    });
});
const signToken = (id) => {
    const expiresIn = process.env.JWT_EXPIRES_IN;
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: isNaN(Number(expiresIn)) ? expiresIn : parseInt(expiresIn, 10),
    });
};
export const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    // Ensure that JWT_COOKIES_EXPIRES_IN is a valid integer for date calculation
    const cookieExpiresInDays = parseInt(process.env.JWT_COOKIES_EXPIRES_IN || "20", 10);
    if (isNaN(cookieExpiresInDays)) {
        throw new Error("Invalid JWT_COOKIES_EXPIRES_IN value in environment variables.");
    }
    const cookieOptions = {
        expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "lax",
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    };
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
export const signup = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    try {
        console.log("reading message");
        const token = newUser.createVerificationToken();
        console.log(token);
        // newUser.verificationToken = token;
        yield newUser.save();
        console.log("token sent");
        const url = `${req.protocol}://${req.get("host")}/api/v1/users/verifyUser/${token}`;
        console.log(url, newUser);
        yield new Email(newUser, url).sendVerificationEmail();
        // console.log(mail,` "not sent");
        console.log("tokenSent");
        res.status(HttpStatus.CREATED).json({
            status: "success",
            message: "User signed up and verification email sent",
            data: {
                user: newUser,
            },
        });
    }
    catch (error) {
        newUser.verificationTokenExpires = undefined;
        newUser.verificationToken = undefined;
        yield newUser.save({ validateBeforeSave: false });
        next(new AppError("Failed to send verification email", HttpStatus.INTERNAL_SERVER_ERROR));
    }
}));
export const login = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password", HttpStatus.BAD_REQUEST));
    }
    const user = yield User.findOne({ email }).select("+password");
    if (!user ||
        !(yield user.checkIfPasswordIsCorrect(password, user.password))) {
        return next(new AppError("Incorrect email or password", HttpStatus.UNAUTHORIZED));
    }
    createSendToken(user, HttpStatus.OK, req, res);
}));
export const logout = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("jwt", "signedout", {
        expires: new Date(Date.now() + 10 * 1000),
    });
    res.status(HttpStatus.OK).json({ status: "success", message: "Logged out" });
}));
export const protect = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if token exist on the request header
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError("You are not logged in. Please login", HttpStatus.UNAUTHORIZED));
    }
    const decoded = yield jwtVerify(token, process.env.JWT_SECRET);
    const currentUser = yield User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The currentUser belonging to  this token does not longer does exist", HttpStatus.NOT_FOUND));
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("currentUser Changed their password recently. Please login again!", HttpStatus.UNAUTHORIZED));
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
}));
export const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.cookies) {
        try {
            const token = req.cookies.jwt;
            if (token) {
                const decoded = yield jwtVerify(token, process.env.JWT_SECRET);
                const currentUser = yield User.findById(decoded.id);
                if (!currentUser) {
                    return next(new AppError("User belonging to this token does not longer exist", HttpStatus.NOT_FOUND));
                }
                if (currentUser.changedPasswordAfter(decoded.iat)) {
                    return next(new AppError("User recently changed thier password", HttpStatus.UNAUTHORIZED));
                }
                res.locals.user = currentUser;
            }
        }
        catch (error) {
            return next;
        }
    }
    next();
});
export const forgotPassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User.findOne({ email });
    if (!user) {
        return next(new AppError("No user found with this email address", HttpStatus.NOT_FOUND));
    }
    console.log(user);
    const resetToken = user.createPasswordResetToken();
    console.log("token reached");
    try {
        console.log(user, "userUpdated");
        yield user.save({ validateBeforeSave: false });
        console.log(resetToken);
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        yield new Email(user, resetUrl).sendResetPassword();
        console.log("mail sent ");
        res.status(HttpStatus.OK).json({
            status: "success",
            data: {
                message: "Password Reset link sent to your email",
            },
        });
    }
    catch (error) {
        console.log(error);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        next(new AppError("There was a problem sending an email! Please try again", HttpStatus.INTERNAL_SERVER_ERROR));
    }
}));
export const resetPassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //1 Get user  based on ResetToken
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = yield User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    //2 Check if User token is valid and has not expired
    if (!user) {
        return next(new AppError("Invalid token or token has expired", HttpStatus.NOT_FOUND));
    }
    // 3 iF  true , update use User password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    yield user.save();
    // Log in the user, and send jwt
    createSendToken(user, HttpStatus.OK, req, res);
}));
export const updatePassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new AppError("User not found in request", HttpStatus.UNAUTHORIZED));
    }
    const user = yield User.findById(req.user._id).select("+password");
    // if (!user) {
    //   return next(
    //     new AppError("No user found with that id ", HttpStatus.NOT_FOUND)
    //   );
    // }
    if (!user ||
        !(yield user.checkIfPasswordIsCorrect(req.body.currentPassword, user.password))) {
        return next(new AppError("your password is not correct. Please check and try again!", HttpStatus.UNAUTHORIZED));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    yield user.save();
    createSendToken(user, HttpStatus.OK, req, res);
}));
export const verifyUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1 Get user based on token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    console.log(hashedToken);
    const user = yield User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: new Date() },
    });
    // 2 If user does not exist, return error
    console.log(user, "user reached here");
    if (!user) {
        return next(new AppError("Invalid or token as expired", HttpStatus.NOT_FOUND));
    }
    // user.isVerified = true;
    // user.verificationToken = undefined;
    // user.verificicationTokenExpires = undefined;
    console.log("user updating");
    try {
        // await user.save({ validateBeforeSave: false });
        const updatedUser = yield User.findOneAndUpdate({ _id: user._id }, {
            isVerified: true,
            $unset: { verificationToken: "", verificationTokenExpires: "" },
        }, { runValidators: true, new: true });
        console.log("User verified successfully");
        createSendToken(updatedUser, HttpStatus.OK, req, res);
    }
    catch (error) {
        console.error("Error saving user:", error);
        return next(new AppError("Failed to verify user", HttpStatus.INTERNAL_SERVER_ERROR));
    }
}));
export const resendVerificationToken = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User.findOne({ email });
    if (!user) {
        return next(new AppError("No User found with that email", HttpStatus.NOT_FOUND));
    }
    const token = user.createPasswordResetToken();
    try {
        user.save({ validateBeforeSave: false });
        const url = `${req.protocol}://${req.get("host")}/api/v1/users/verifyUser/${token}`;
        yield new Email(user, url).sendVerificationEmail();
        res.status(HttpStatus.OK).json({
            status: "success",
            data: {
                message: "Verification Link sent successfully.Check your mail!",
            },
        });
    }
    catch (error) {
        console.log(error);
        user.verificationTokenExpires = undefined;
        user.verificationToken = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new AppError("Failed to send verification email. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR));
    }
}));
export function findOrCreateUser(profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use profile.id, profile.emails, or profile.displayName to find the user
        let user = yield User.findOne({ googleId: profile.id });
        try {
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    photo: profile.photos[0].value,
                    isVerified: true,
                });
                yield user.save({ validateBeforeSave: false });
                console.log("user created", user);
            }
            yield new Email(user).sendWelcome();
            // createSendToken(user, HttpStatus.OK, req, res);
            return user;
        }
        catch (error) {
            new AppError("Failed to create user! Please try again", HttpStatus.INTERNAL_SERVER_ERROR);
            return done(error);
        }
    });
}
export function findUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return User.findById(id);
    });
}
