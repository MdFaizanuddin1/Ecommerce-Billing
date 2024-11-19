import { Router } from "express";
import {
  addAddress,
  checkUserHasAddress,
  deleteAddress,
  editSingleAddress,
  getAddress,
  getSingleAddress,
} from "../controllers/address.controllers.js";
import { verifyToken } from "../../utils/verifyToken.js";

const router = Router();

router.route("/addAddress/:userId").post(addAddress);
router.route("/getAddress/:userId").get(getAddress);
router.route("/getSingleAddress/:addressId").get(getSingleAddress);
router.route("/editSingleAddress/:addressId").post(editSingleAddress);
router.route("/deleteAddress/:addressId").delete(deleteAddress);
router.route("/getAddress").get(verifyToken, checkUserHasAddress);

export default router;
