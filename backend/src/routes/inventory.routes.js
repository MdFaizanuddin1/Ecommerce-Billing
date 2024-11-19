import { Router } from "express";
import {
  checkLowStock,
  getStockDetails,
  restockProduct,
} from "../controllers/inventory.controllers.js";
import { protectAdminManager } from "../middlewares/admin/adminManeger.middleware.js";

const router = Router();

router.put("/restockProduct", protectAdminManager, restockProduct);
router.post("/checkLowStock", protectAdminManager, checkLowStock);
router.get("/getStockDetails", protectAdminManager, getStockDetails);

export default router;
