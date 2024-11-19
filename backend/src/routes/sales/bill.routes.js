import { Router } from "express";
import { authSeller } from "../../middlewares/sales/seller.middleware.js";
import {
  createBill,
  deleteAllBills,
  getAllBill,
  getBill,
  handleCompleteReturn,
  handlePartialReturnAndExchange,
  handlePartialReturnProducts,
} from "../../controllers/sales/bill.controllers.js";
import { protectAdminManager } from "../../middlewares/admin/adminManeger.middleware.js";

import { allowOnlyAdminOrManager } from "../../middlewares/admin/onlyAdminManager.middleware.js";

const router = Router();

router.post("/create", authSeller, createBill);

// // Route to handle partial return of products
// router.put(
//   "/handlePartialReturnProducts",
//   protectAdminManager,
//   allowOnlyAdminOrManager,
//   handlePartialReturnProducts
// );

// // Route to handle complete return of a bill
// router.put(
//   "/handleCompleteReturn",
//   protectAdminManager,
//   allowOnlyAdminOrManager,
//   handleCompleteReturn
// );

// // Route to handle partial return and exchange of products
// router.put(
//   "/handlePartialReturnAndExchange",
//   protectAdminManager,
//   allowOnlyAdminOrManager,
//   handlePartialReturnAndExchange
// );

// router.get(
//   "/getAllBill",
//   protectAdminManager,
//   allowOnlyAdminOrManager,
//   getAllBill
// );
// router.get("/getBill", getBill);
// router.delete("/deleteAll", deleteAllBills);

export default router;
