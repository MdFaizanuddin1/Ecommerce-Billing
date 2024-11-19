import express from "express";
import {
  signup,
  login,
  getProfile,
  logout,
  getAll,
} from "../../controllers/admin/admin-maneger.controller.js";
import { protectAdminManager } from "../../middlewares/admin/adminManeger.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", signup);
router.post("/login", login);

// Protected routes (requires valid token)
router.get("/profile", protectAdminManager, getProfile);
router.get("/all", getAll);
router.get("/logout", protectAdminManager, logout);

export default router;
