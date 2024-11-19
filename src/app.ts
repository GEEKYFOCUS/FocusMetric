import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import session, { SessionOptions } from "express-session";
import passport from "./auth";
import authRoutes from "./routes/authRoutes";
import globalErrorHandler from "./controllers/errorController";
import cron from "node-cron";
import MemoryStore from "memorystore";
import AppError from "./utils/appError";
import viewRouter from "./routes/viewRoutes";
import urlRouter from "./routes/urlRoutes";
import userRouter from "./routes/userRoutes";
import healthRouter from "./routes/healthRoutes";
// import { SessionOptions } from "express-session";
// import router from './router/index.js';

interface ExtendedRequest extends express.Request {
  requestTime?: any;
}

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({
//   path: "./config.env",
// });
const app = express();

const MemoryStoreInstance = MemoryStore(session);

// Define session configuration with correct typing

const sessionConfig: SessionOptions = {
  cookie: {
    maxAge: 86400000,
    // Set cookie expiration to 24 hours (in milliseconds)
  },

  store: new MemoryStoreInstance({
    checkPeriod: 86400000,
    // Prune expired sessions every 24 hours
  }),

  resave: false,
  // Prevent unnecessary session saves

  saveUninitialized: true,
  // Save new sessions that are uninitialized

  secret: process.env.SESSION_SECRET || "keyboard cat",
  // Secure session secret
};
app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
// app.use(passport.session());
app.set("trust proxy", 1 /* number of proxies between user and server */);
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// 1 GLOBAL MIDDLEWARES
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.options("*", cors());
//Serving Static file
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Limit requests from same API Remove this in production
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "1000kb" }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// app.use(hpp());
app.use(cookieParser());
app.use(xss());
app.use(compression());

app.use((req: ExtendedRequest, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//Routes
app.use(authRoutes);
app.use("/", viewRouter);
app.use("/", urlRouter);

app.use("/", healthRouter);
app.use("/api/v1/users", userRouter);

app.use(
  "*",
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);
app.use(globalErrorHandler);

export default app;
