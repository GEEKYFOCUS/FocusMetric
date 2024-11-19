import express, { NextFunction, Request, Response } from "express";

export default (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: express.Request, res: express.Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
