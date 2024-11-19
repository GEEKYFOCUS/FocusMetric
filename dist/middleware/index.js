var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pkg from "lodash";
import { getUserBySessionToken } from "../db/user.js";
const { merge, get } = pkg;
export const isOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentUserId = get(req, "identity._id");
    if (!currentUserId)
        res.status(403);
    if (currentUserId.toString() !== id)
        res.status(403);
    next();
});
export const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionToken = req.cookies["focus_token"];
        const existingUser = yield getUserBySessionToken(sessionToken);
        console.log(existingUser);
        if (!existingUser) {
            return res.status(403);
        }
        merge(req, { identity: existingUser });
        console.log("user merged");
        next();
    }
    catch (error) {
        console.log(error, "authentication error 😥😥😥😥😥");
        return res.status(401);
    }
});
