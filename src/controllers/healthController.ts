import express, { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import { AxiosResponseTransformer } from "axios";
import { HttpStatus } from "../helpers/httpsStatus";

export const healthCheck = catchAsync(async (req: Request, res: Response) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Add other checks here, like third-party APIs or service status
    const servicesStatus = {
      emailService: "operational", // Replace with your service health check logic
    };

    const status = {
      app: "healthy",
      uptime: process.uptime(), // How long the app has been running
      timestamp: new Date(),
      database: dbStatus,
      services: servicesStatus,
    };
    // If everything is okay, return 200
    return res.status(200).json(status);
  } catch (error: any) {
    console.error("Health check failed", error);

   
    // If something goes wrong, return 503
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      app: "unhealthy",
      error: error.message,
    });
  }
});
