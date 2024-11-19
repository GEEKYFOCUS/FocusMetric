"use strict";
// import express from "express";
// import mongoose from "mongoose";
// import axios from "axios";
// import cron from "node-cron";
// import dotenv from "dotenv";
// dotenv.config({
//   path: "/config.env",
// });
// // Schedule the health check to run every minute
// const healthCheck = cron.schedule("0 9 * * *", async () => {
//   try {
//     // const response = await axios.get("http://localhost:3000/health");
//     // const database: string = process.env.DATABASE as string;
//     // const db: string = database.replace(
//     //   `<PASSWORD>`,
//     //   process.env.DATABASE_PASSWORD as string
//     // );
//     // const conn = mongoose.createConnection(db, {});
//     // const response = conn.readyState;
//     // console.log("connection status: ", response);
//     const connectionStatus = mongoose.connection.readyState;
//     console.log("connection status: ", connectionStatus);
//     // if (response.status === 200) {
//     //   console.log("App is healthy:", response.data);
//     // } else {
//     //   console.error("Health check failed:", response.status);
//     // }
//   } catch (error: any) {
//     console.error("Health check error:", error.message);
//   }
// });
// healthCheck.start();
// export default healthCheck;
