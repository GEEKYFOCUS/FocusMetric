import { Request, Response, NextFunction } from "express";

export const trackMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Logging or tracking middleware if needed
  console.log(`Tracking visit from IP: ${req.ip}`);
  next();
};

