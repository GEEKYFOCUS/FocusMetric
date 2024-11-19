// import express, { Request, Response } from "express";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// const app = express();

// dotenv.config({
//   path: "/config.env",
// });
// app.get("/health", (req: Request, res: Response) => {
//   const database = (process.env.DATABASE as string) || "";
//   const db = database.replace(
//     `password`,
//     process.env.DATABASE_PASSWORD as string
//   );

//   const connecction = mongoose.connect(db, {});

//   try {
//   } catch (error) {}
// });

// import express from "express";
// import mongoose from "mongoose";
// import axios from "axios";
// import cron from "node-cron";
// import dotenv from "dotenv";

// dotenv.config({
//   path: "./config.env", // Corrected path to config file
// });

// Function to check database connection status
// const checkDbConnection = () => {
//   const dbStatus = mongoose.connection.readyState;
//   switch (dbStatus) {
//     case 0:
//       console.log("MongoDB is disconnected.");
//       break;
//     case 1:
//       console.log("MongoDB is connected.");
//       break;
//     case 2:
//       console.log("MongoDB is connecting.");
//       break;
//     case 3:
//       console.log("MongoDB is disconnecting.");
//       break;
//     default:
//       console.log("MongoDB connection status unknown.");
//   }
// };

// // Function to check app health by making an HTTP request
// const checkAppHealth = async () => {
//   try {
//     const response = await axios.get("http://localhost:3000/health");
//     if (response.status === 200) {
//       console.log("App is healthy:", response.data);
//     } else {
//       console.error("Health check failed:", response.status);
//     }
//   } catch (error: any) {
//     console.error("App health check error:", error.message);
//   }
// };

// // Schedule the health check to run every minute
// const healthCheck = cron.schedule("* * * * *", async () => {
//   console.log("Running health check...");

//   // Check Database connection
//   checkDbConnection();

//   // Check App health by hitting an endpoint
//   await checkAppHealth();
// });

// healthCheck.start();

// export default healthCheck;

import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { HttpStatus } from "../helpers/httpsStatus";
import { healthCheck } from "../controllers/healthController";

const router = express.Router();

router.get("/health", healthCheck);

export default router;
