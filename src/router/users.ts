import express from "express";
import { getAllUser } from "../controllers/users";
import { isAuthenticated } from "../middleware/index";

export const getUsers = (router: express.Router) => {
  router.get("/users", isAuthenticated, getAllUser);
};
