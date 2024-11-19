import { Router } from "express";
import {
  deleteAll,
  getAllSeller,
  loginSeller,
  logout,
  registerSeller,
} from "../../controllers/sales/saller.controller.js";
import { authSeller } from "../../middlewares/sales/seller.middleware.js";

const router = Router();

router.post("/register", registerSeller);
router.post("/login", loginSeller);
router.get("/logout", authSeller, logout);
router.get("/getAll", getAllSeller);
router.delete("/deleteAll", deleteAll);

export default router;
