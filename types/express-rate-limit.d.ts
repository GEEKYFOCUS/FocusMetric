// types/express-rate-limit.d.ts
declare module "express-rate-limit" {
  import { RequestHandler } from "express";

  interface Options {
    windowMs?: number;
    max?: number;
    message?: string | Buffer | Object;
    statusCode?: number;
    headers?: boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: Request, res: Response) => string;
    handler?: RequestHandler;
    onLimitReached?: (
      req: Request,
      res: Response,
      optionsUsed: Options
    ) => void;
  }

  function rateLimit(options?: Options): RequestHandler;
  export default rateLimit;
}
