import express from "express";
import { signup, login, logout, forgotPassword, resetPassword, verifyUser, resendVerificationToken, updatePassword, } from "../controllers/authController";
// const userController = require("../controllers/userController");
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);
router.get("/verifyUser/:token", verifyUser);
router.post("/resendVerificationToken", resendVerificationToken);
// router.use(protect);
router.patch("/updatePassword", updatePassword);
// router.get("/getMe", userController.getMe, userController.getUser);
// router.patch(
//   "/updateMe",
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.updateMe
// );
// router.delete("deleteMe", userController.deleteMe);
// router.use(authController.restrictTo("admin"));
// router
//   .route("/")
//   .post(userController.createUser)
//   .get(userController.getAllUser);
// router
//   .route("/:id")
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser)
//   .get(userController.getUser);
export default router;
//# sourceMappingURL=userRoutes.js.map