import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";
import catchAsync from "../utils/catchAsync.js";
import Email from "../utils/email.js";
import User from "../models/userModel.js";
import { IUser } from "../models/userModel.js";
import { HttpStatus } from "../helpers/httpsStatus.js";
import AppError from "../utils/appError.js";

interface JwtPayload {
  id: string;
  iat: number;
}
interface ProtectedUserRequest extends Request {
  user?: IUser;
}
const jwtVerify = (token: string, secret: string) =>
  new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as JwtPayload);
    });
  });

const signToken = (id: string): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN as string;
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: isNaN(Number(expiresIn)) ? expiresIn : parseInt(expiresIn, 10),
  });
};
export const createSendToken = (
  user: any,
  statusCode: HttpStatus,
  req: express.Request,
  res: express.Response
) => {
  const token = signToken(user._id);
  // Ensure that JWT_COOKIES_EXPIRES_IN is a valid integer for date calculation
  const cookieExpiresInDays = parseInt(
    process.env.JWT_COOKIES_EXPIRES_IN || "20",
    10
  );
  if (isNaN(cookieExpiresInDays)) {
    throw new Error(
      "Invalid JWT_COOKIES_EXPIRES_IN value in environment variables."
    );
  }
  const cookieOptions: object = {
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

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
      await newUser.save();
      console.log("token sent");
      const url = `${req.protocol}://${req.get("host")}/api/v1/users/verifyUser/${token}`;
      console.log(url, newUser);
      await new Email(newUser, url).sendVerificationEmail();
      // console.log(mail,` "not sent");
      console.log("tokenSent");
      res.status(HttpStatus.CREATED).json({
        status: "success",
        message: "User signed up and verification email sent",
        data: {
          user: newUser,
        },
      });
    } catch (error) {
      newUser.verificationTokenExpires = undefined;
      newUser.verificationToken = undefined;
      await newUser.save({ validateBeforeSave: false });
      next(
        new AppError(
          "Failed to send verification email",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new AppError(
          "Please provide email and password",
          HttpStatus.BAD_REQUEST
        )
      );
    }
    const user = await User.findOne({ email }).select("+password");
    if (
      !user ||
      !(await user.checkIfPasswordIsCorrect(password, user.password as string))
    ) {
      return next(
        new AppError("Incorrect email or password", HttpStatus.UNAUTHORIZED)
      );
    }

    createSendToken(user, HttpStatus.OK, req, res);
  }
);

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie("jwt", "signedout", {
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(HttpStatus.OK).json({ status: "success", message: "Logged out" });
});

export const protect = catchAsync(
  async (req: ProtectedUserRequest, res: Response, next: NextFunction) => {
    // Check if token exist on the request header
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(
        new AppError(
          "You are not logged in. Please login",
          HttpStatus.UNAUTHORIZED
        )
      );
    }
    const decoded = await jwtVerify(token, process.env.JWT_SECRET as string);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          "The currentUser belonging to  this token does not longer does exist",
          HttpStatus.NOT_FOUND
        )
      );
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "currentUser Changed their password recently. Please login again!",
          HttpStatus.UNAUTHORIZED
        )
      );
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.cookies) {
    try {
      const token = req.cookies.jwt;
      if (token) {
        const decoded = await jwtVerify(
          token,
          process.env.JWT_SECRET as string
        );
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next(
            new AppError(
              "User belonging to this token does not longer exist",
              HttpStatus.NOT_FOUND
            )
          );
        }
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next(
            new AppError(
              "User recently changed thier password",
              HttpStatus.UNAUTHORIZED
            )
          );
        }
        res.locals.user = currentUser;
      }
    } catch (error) {
      return next;
    }
  }
  next();
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError(
          "No user found with this email address",
          HttpStatus.NOT_FOUND
        )
      );
    }
    console.log(user);
    const resetToken = user.createPasswordResetToken();
    console.log("token reached");

    try {
      console.log(user, "userUpdated");
      await user.save({ validateBeforeSave: false });
      console.log(resetToken);
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetUrl).sendResetPassword();
      console.log("mail sent ");
      res.status(HttpStatus.OK).json({
        status: "success",
        data: {
          message: "Password Reset link sent to your email",
        },
      });
    } catch (error) {
      console.log(error);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      next(
        new AppError(
          "There was a problem sending an email! Please try again",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //1 Get user  based on ResetToken
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //2 Check if User token is valid and has not expired
    if (!user) {
      return next(
        new AppError("Invalid token or token has expired", HttpStatus.NOT_FOUND)
      );
    }
    // 3 iF  true , update use User password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // Log in the user, and send jwt
    createSendToken(user, HttpStatus.OK, req, res);
  }
);

export const updatePassword = catchAsync(
  async (req: ProtectedUserRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("User not found in request", HttpStatus.UNAUTHORIZED)
      );
    }
    const user = await User.findById(req.user._id).select("+password");
    // if (!user) {
    //   return next(
    //     new AppError("No user found with that id ", HttpStatus.NOT_FOUND)
    //   );
    // }
    if (
      !user ||
      !(await user.checkIfPasswordIsCorrect(
        req.body.currentPassword,
        user.password as string
      ))
    ) {
      return next(
        new AppError(
          "your password is not correct. Please check and try again!",
          HttpStatus.UNAUTHORIZED
        )
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, HttpStatus.OK, req, res);
  }
);

export const verifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1 Get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    console.log(hashedToken);
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });
    // 2 If user does not exist, return error

    console.log(user, "user reached here");
    if (!user) {
      return next(
        new AppError("Invalid or token as expired", HttpStatus.NOT_FOUND)
      );
    }

    // user.isVerified = true;
    // user.verificationToken = undefined;
    // user.verificicationTokenExpires = undefined;
    console.log("user updating");
    try {
      // await user.save({ validateBeforeSave: false });
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          isVerified: true,
          $unset: { verificationToken: "", verificationTokenExpires: "" },
        },
        { runValidators: true, new: true }
      );
      console.log("User verified successfully");
      createSendToken(updatedUser, HttpStatus.OK, req, res);
    } catch (error) {
      console.error("Error saving user:", error);
      return next(
        new AppError("Failed to verify user", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

export const resendVerificationToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError("No User found with that email", HttpStatus.NOT_FOUND)
      );
    }
    const token = user.createPasswordResetToken();
    try {
      user.save({ validateBeforeSave: false });
      const url = `${req.protocol}://${req.get("host")}/api/v1/users/verifyUser/${token}`;
      await new Email(user, url).sendVerificationEmail();
      res.status(HttpStatus.OK).json({
        status: "success",
        data: {
          message: "Verification Link sent successfully.Check your mail!",
        },
      });
    } catch (error) {
      console.log(error);
      user.verificationTokenExpires = undefined;
      user.verificationToken = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "Failed to send verification email. Please try again.",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

export async function findOrCreateUser(profile: any, done: any) {
  // Use profile.id, profile.emails, or profile.displayName to find the user
  let user = await User.findOne({ googleId: profile.id });
  try {
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        photo: profile.photos[0].value,
        isVerified: true,
      });

      await user.save({ validateBeforeSave: false });
      console.log("user created", user);
    }
    await new Email(user).sendWelcome();
    // createSendToken(user, HttpStatus.OK, req, res);
    return user;
  } catch (error) {
    new AppError(
      "Failed to create user! Please try again",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    return done(error);
  }
}

export async function findUserById(id: string) {
  return User.findById(id);
}
