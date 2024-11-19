import { Router } from "express";
import {
  addTocart,
  clearCart,
  decreaseQuantity,
  getCartData,
} from "../controllers/cart.controllers.js";
import { verifyToken } from "../../utils/verifyToken.js";

const router = Router();

// router.route("/addToCart/:productId").post(addTocart);
// router.route("/getCartData/:userId").get(getCartData);
// router.route("/decreaseQuantity/:productId").put(decreaseQuantity);
// router.route("/clearCart").delete(clearCart);

// -------- secure routes

router.route("/addToCart/:productId").post(verifyToken,addTocart);
router.route("/getCartData/").get(verifyToken,getCartData);
router.route("/decreaseQuantity/:productId").put(verifyToken,decreaseQuantity);
router.route("/clearCart").delete(verifyToken,clearCart);

export default router;
