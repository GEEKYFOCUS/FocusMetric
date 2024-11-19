import { getAllUser } from "../controllers/users";
import { isAuthenticated } from "../middleware/index";
export const getUsers = (router) => {
    router.get("/users", isAuthenticated, getAllUser);
};
