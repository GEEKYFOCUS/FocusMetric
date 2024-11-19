import express from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

export const getOverView = catchAsync(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(200).render("overview", {
      title: "Test Page",
    });
  }
);
