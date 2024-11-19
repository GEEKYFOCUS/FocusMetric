import crypto from "crypto";
import mongoose, { Schema, model, Model, Types } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

export interface IUser {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
  password?: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetExpires?: Date;
  passwordResetToken?: string;
  verificationTokenExpires?: Date;
  verificationToken?: string;
  active?: boolean;
  isVerified?: boolean;
  googleId?: string;
}

interface IUserMethods {
  checkIfPasswordIsCorrect(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTtimestamp: number): boolean;
  createPasswordResetToken(): string;
  createVerificationToken(): string;
}
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
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
        function (password: string) {
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
        validator: function (passwordConfirm: string) {
          return this.password === passwordConfirm;
        },
        message:
          "Passwords need  to not match, initial password must match  with this ",
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", function (next) {
  if (!this.isModified() || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // hash the password with code before saving it to the database for security reasons
  this.password = await bcrypt.hash(this.password as string, 12);

  //   Delete the password confirm as it is  not requires in the database
  //   This is a security measure to prevent password leakage.
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkIfPasswordIsCorrect = async function (
  candidatePassword: string,
  userPassword: string
) {
  // compare the candidate password with the hashed password stored in the database
  if (await bcrypt.compare(candidatePassword, userPassword)) {
    console.log("passwords match");
  }
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTtimestamp: any) {
  if (this.passwordChangedAt) {
    const changeTimeStamp: any = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );

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

const User = model<IUser, UserModel>("User", userSchema);
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
