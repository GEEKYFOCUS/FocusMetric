declare module "express-mongo-sanitize" {
  import { RequestHandler } from "express";

  interface Options {
    replaceWith?: string;
    onSanitize?: (key: string, value: any) => void;
  }

  function mongoSanitize(options?: Options): RequestHandler;

  export = mongoSanitize;
}
