import { Router } from "express";
import { protectAdminManager } from "../../middlewares/admin/adminManeger.middleware.js";
import { getMonthSales, getTodaySales } from "../../controllers/sales/salesSummary.controller.js";

const router = Router()

// router.get ('/today',protectAdminManager, getTodaySales)
// router.get ('/thisMonth',protectAdminManager, getMonthSales)

export default router