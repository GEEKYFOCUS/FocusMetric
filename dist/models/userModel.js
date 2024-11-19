var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import crypto from "crypto";
import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name to create an account"],
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, "An email is require to create an account"],
        maxLength: [
            30,
            "A maximum  character a number can  hace in 30 characters long",
        ],
        validate: [validator.isEmail, "Please enter a valid email address"],
    },
    photo: {
        type: String,
        // default: "https://www.gravatar.com/avatar?d=retro",
        default: "default.jpeg",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    googleId: { type: String },
    password: {
        type: String,
        required: [true, "Please enter a password  to create a new account"],
        minlength: [8, "A password must be at least 8 characters long"],
        validate: [
            function (password) {
                // Check for at least one uppercase letter
                if (!password.match(/[A-Z]/)) {
                    return false;
                }
                // Check for at least one lowercase letter
                if (!password.match(/[a-z]/)) {
                    return false;
                }
                // Check for at least one number
                if (!password.match(/\d/)) {
                    return false;
                }
                // Check for at least one special character
                if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
                    return false;
                }
                return true;
            },
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        ],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            // this only works on CREATE and SAVE
            validator: function (passwordConfirm) {
                return this.password === passwordConfirm;
            },
            message: "Passwords need  to not match, initial password must match  with this ",
        },
    },
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    passwordResetToken: String,
    verificationTokenExpires: Date,
    verificationToken: String,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
        select: false,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.pre("save", function (next) {
    if (!this.isModified() || this.isNew)
        return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        // hash the password with code before saving it to the database for security reasons
        this.password = yield bcrypt.hash(this.password, 12);
        //   Delete the password confirm as it is  not requires in the database
        //   This is a security measure to prevent password leakage.
        this.passwordConfirm = undefined;
        next();
    });
});
userSchema.methods.checkIfPasswordIsCorrect = function (candidatePassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        // compare the candidate password with the hashed password stored in the database
        if (yield bcrypt.compare(candidatePassword, userPassword)) {
            console.log("passwords match");
        }
        return yield bcrypt.compare(candidatePassword, userPassword);
    });
};
userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
    if (this.passwordChangedAt) {
        const changeTimeStamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return JWTtimestamp < changeTimeStamp;
    }
    // false mean the password does not change
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    console.log(this.passwordResetToken, this.passwordResetExpires);
    return resetToken;
};
userSchema.methods.createVerificationToken = function () {
    const _verificationToken = crypto.randomBytes(32).toString("hex");
    this.verificationToken = crypto
        .createHash("sha256")
        .update(_verificationToken)
        .digest("hex");
    console.log({ _verificationToken }, this.verificationToken);
    this.verificationTokenExpires = new Date(Date.now() + 10 * (60 * 1000));
    return _verificationToken;
};
const User = model("User", userSchema);
export default User;
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");
//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   console.log({ resetToken }, this.passwordResetToken);
//   this.passwordResetExpires = Date.now() + 10 * (60 * 1000);
//   return resetToken;
// };
