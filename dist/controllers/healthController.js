var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import { HttpStatus } from "../helpers/httpsStatus";
export const healthCheck = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
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
    }
    catch (error) {
        console.error("Health check failed", error);
        // If something goes wrong, return 503
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            app: "unhealthy",
            error: error.message,
        });
    }
}));
//# sourceMappingURL=healthController.js.map