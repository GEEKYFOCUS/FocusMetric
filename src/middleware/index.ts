import express from "express";
import pkg from "lodash";
import { getUserBySessionToken } from "../db/user";
const { merge, get } = pkg;

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { id } = req.params;
  const currentUserId: string = get(req, "identity._id") as unknown as string;

  if (!currentUserId) res.status(403);

  if (currentUserId.toString() !== id) res.status(403);

  next();
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void | any> => {
  try {
    const sessionToken = req.cookies["focus_token"];
    const existingUser = await getUserBySessionToken(sessionToken);
    console.log(existingUser);
    if (!existingUser) {
      return res.status(403);
    }
    merge(req, { identity: existingUser });
    console.log("user merged");
    next();
  } catch (error) {
    console.log(error, "authentication error 😥😥😥😥😥");
    return res.status(401);
  }
};
