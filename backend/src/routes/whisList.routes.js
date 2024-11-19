import { Router } from "express";
import { addToWishList, deleteWishList, getAllWishList, getWishList } from "../controllers/wishList.controllers.js";

const router = Router();

router.route("/addToWishList/:productId").post(addToWishList);
router.route("/get").get(getWishList);
router.route("/delete").delete(deleteWishList);
router.route("/getAll/:userId").get(getAllWishList);

export default router;
