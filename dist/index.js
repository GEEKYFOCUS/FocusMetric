"use strict";
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import compression from "compression";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import router from "./router/index";
// // import router from './router/index.js';
// dotenv.config({
//   path: "./config.env",
// });
// const app = express();
// app.use(
//   cors({
//     credentials: true,
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     // allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );
// app.use(compression());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/", router());
// app.use((error, req, res) => {
//   console.log(error, "error 🔥🔥🔥🔥🔥", error.statusMessage);
// });
// //  "exec": "node --loader ts-node/esm ./src/server.ts"
// //  "exec": "ts-node --require ts-node/register --experimental-specifier-resolution=node ./src/server.ts"
// // nodemon --exec node --no-warnings=ExperimentalWarning --loader ts-node/esm src/server.ts
