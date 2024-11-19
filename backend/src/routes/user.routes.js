import { Router } from "express";
import {
  changeCurrentPassword,
  changePass,
  getAllUsers,
  getUser,
  logOut,
  logInUser,
  registerUser,
} from "../controllers/user.controllers.js";
import { verifyToken } from "../../utils/verifyToken.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(logInUser);
// router.route("/logout").get(logOut);
router.route("/getAllUsers").get(getAllUsers);
router.route("/changePassword/:userId").post(changeCurrentPassword);
router.route("/changePass/:userId").post(verifyToken, changePass);

//------------- secure routes

router.route("/getUser").get(verifyToken, getUser);
router.route("/logout").get(verifyToken, logOut);
router.route("/changePass").post(verifyToken, changePass);

export default router;
