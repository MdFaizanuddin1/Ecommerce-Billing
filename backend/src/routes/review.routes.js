import { Router } from "express";
import { AddReview, getReview } from "../controllers/review.controllers.js";

const router = Router();

router.route("/addReview").post(AddReview);
router.route("/getReview").get(getReview);

export default router;
