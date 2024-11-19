import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import cron from "node-cron";
import axios from "axios";
import { fileURLToPath } from "url";
import HealthCheckMail from "./utils/healthMail.js";
process.on("uncaughtException", (err: Error) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});
dotenv.config({
  path: "./config.env",
});

import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import app from "./app.ts";

const database: string = process.env.DATABASE as string;
const db: string = database.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD as string
);

mongoose.connect(db, {}).then((err) => {
  console.log("DB connection successful!");
  //   console.log(err);
});

const port: string | number = (process.env.PORT as string) || 5000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// console.log(mongoose.connection.readyState);
process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");

  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received: closing app...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

console.log(process.env.NODE_ENV);
const startCronJobs = () => {
  // Schedule a health check every 9:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running scheduled health check...");
    try {
      // Replace with your app's actual URL and port
      const response = await axios.get("http://localhost:8000/health");

      console.log("Health check result:", response.data);
      const healthData = JSON.stringify(response.data, null, 2);
      await new HealthCheckMail(null, healthData).sendHealthCheck();
      console.log("Email sent successfully!");
    } catch (error: any) {
      console.error("Health check failed:", error.message);
      console.error("Error sending email");
    }
  });

  console.log("Cron job has started. It will run every 24hrs.");
};

// Call startCronJobs in your server
startCronJobs();
