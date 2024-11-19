import { Router } from "express";
import {
  authchangePassword,
  authUpdateProfile,
  authvendorLogin,
  changePassword,
  getAllVendors,
  getSingleVendor,
  logOut,
  updateProfile,
  vendorLogin,
  vendorRegister,
} from "../controllers/vendor.controllers.js";
import { getAddress } from "../controllers/address.controllers.js";
import { authVendor } from "../middlewares/vendor.middleware.js";

const router = Router();

router.route("/vendorRegister").post(vendorRegister);
router.route("/vendorLogin").post(vendorLogin);
router.put("/changePpassword/:vendorId", changePassword);
router.get("/getAllVendors", getAllVendors);
router.get("/getSingleVendor/:vendorId", getSingleVendor);
router.post("/updateProfile/:vendorId", updateProfile);

//-----secured routes
router.route("/authVendorLogin").post(authvendorLogin);
router.patch("/changePass", authVendor, authchangePassword);
router.get("/logout", authVendor, logOut);
router.patch("/update", authVendor, authUpdateProfile);

export default router;
