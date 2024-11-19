"use strict";
// // import express from "express";
// // import { random, authentication } from "../helpers/index";
// // import { createUser, getUserByEmail } from "../db/user";
// // export const login = async (
// //   req: express.Request,
// //   res: express.Response
// // ): Promise<any> => {
// //   try {
// //     const { email, password } = req.body;
// //     if (!email || !password) {
// //       return res.status(400).json({ error: "email and password is required" });
// //     }
// //     const user = await getUserByEmail(email).select(
// //       "+authentication.password +authentication.salt"
// //     );
// //     // Check if the user was found
// //     if (!user || !user.authentication) {
// //       return res
// //         .status(400)
// //         .json({ data: "Incorrect email address or password" });
// //     }
// //     const expectedHash = authentication(
// //       password,
// //       user.authentication.salt || ""
// //     );
// //     const isCorrectPassword = expectedHash === user.authentication.password;
// //     // Respond with an error if the password is incorrect
// //     if (!isCorrectPassword) {
// //       return res.status(400).json({ data: "Incorrect password" });
// //     }
// //     const salt: string = random();
// //     const userId = user._id.toString();
// //     user.authentication.sessionToken = authentication(userId, salt);
// //     await user.save();
// //     res.cookie("focus_token", user.authentication.sessionToken, {
// //       domain: "localhost",
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === "production",
// //     });
// //     res.status(200).json({
// //       data: "Logged in successfully",
// //       user,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     return res
// //       .status(500)
// //       .json({ error: "An error occurred while logging in" });
// //   }
// // };
// // export const registerUser = async (
// //   req: express.Request,
// //   res: express.Response
// // ): Promise<any> => {
// //   try {
// //     const { email, password, username } = req.body;
// //     if (!email || !password || !username) {
// //       return res.status(400).json({ error: "All fields are required" });
// //     }
// //     const existingUser = await getUserByEmail(email);
// //     if (existingUser) {
// //       return res.status(400).json({
// //         data: "User already exist",
// //       });
// //     }
// //     const salt = random();
// //     const user = await createUser({
// //       email,
// //       username,
// //       authentication: {
// //         salt,
// //         password: authentication(password, salt),
// //       },
// //     });
// //     res.status(200).json({
// //       data: "User created successfully",
// //       user,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     return res.sendStatus(400);
// //   }
// // };
// import { Request, Response } from "express";
// // import Url from "../models/Url";
// import shortid from "shortid";
// import geoip from "geoip-lite";
// import useragent from "useragent";
// export const createShortUrl = async (req: Request, res: Response) => {
//   const { originalUrl } = req.body;
//   const baseUrl = process.env.BASE_URL;
//   const urlCode = shortid.generate();
//   const existingUrl = await Url.findOne({ originalUrl });
//   if (existingUrl) {
//     return res.json(existingUrl);
//   }
//   const shortUrl = `${baseUrl}/${urlCode}`;
//   const newUrl = new Url({
//     originalUrl,
//     shortUrl,
//     clicks: 0,
//   });
//   await newUrl.save();
//   return res.json(newUrl);
// };
// export const handleRedirect = async (req: Request, res: Response) => {
//   const { code } = req.params;
//   const url = await Url.findOne({
//     shortUrl: `${process.env.BASE_URL}/${code}`,
//   });
//   if (!url) return res.status(404).json("URL not found");
//   // Increase click count
//   url.clicks++;
//   // Track user data
//   const ip = req.ip;
//   const agent = useragent.parse(req.headers["user-agent"]);
//   const geo = geoip.lookup(ip) || { country: "Unknown" };
//   url.trackingData.push({
//     ip,
//     device: agent.device.toString(),
//     os: agent.os.toString(),
//     browser: agent.toAgent(),
//     location: geo.country,
//   });
//   await url.save();
//   res.redirect(url.originalUrl);
// };
