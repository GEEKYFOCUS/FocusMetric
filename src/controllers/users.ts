import express from "express";
import { getUsers } from "../db/user";
export const getAllUser = async (
  req: express.Request,
  res: express.Response
): Promise<void | any> => {
  try {
    const users = await getUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    console.log(error, "error 🔥🔥🔥🔥");
    return res
      .status(500)
      .json({ error: "An error occurred while fetching users" });
  }
};
