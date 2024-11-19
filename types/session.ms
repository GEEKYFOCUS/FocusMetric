declare module "express-session" {
  import express from "express";

  interface SessionOptions {
    cookie: any;
    secret: string;
    strre: any;
    resave?: boolean;
    saveUninitialized?: boolean;
  }

  function session(options?: SessionOptions): express.RequestHandler;

  export = session;
}
